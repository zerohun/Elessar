var Base = require('estira');
var $ = require('jquery');

function parseTimeStr(timeStr){
  if(!timeStr) return null;
  timeArray = timeStr.split(':');
  return moment().hour(timeArray[0]).minute(timeArray[1]).second(0);
}

function TimeRangeValidationError(errorType, timeRange){
  this.errorType = errorType;
  this.timeRange = timeRange;
  this.isErrorObj = true;
}

TimeRangeValidationError.TYPES = {
  DUPLICATED:1,
  FOLDED:2,
  LATER_START:3,
  SAME_START_END:4
};

function validateTimeRange(newTimeRange, tasks){
  if(newTimeRange.work_start.toString() === newTimeRange.work_end.toString())
    return new TimeRangeValidationError(
      TimeRangeValidationError.TYPES.SAME_START_END,
      newTimeRange
    );
  if(newTimeRange.work_start > newTimeRange.work_end)
    return new TimeRangeValidationError(
      TimeRangeValidationError.TYPES.LATER_START,
      newTimeRange
    );
  var timeRange;
  for(var t of tasks){
    timeRange = t.timeRange
    for(var trKey of ["work_start", "work_end"]){
      if((timeRange.work_start.get() < newTimeRange[trKey] &&
        timeRange.work_end.get() > newTimeRange[trKey]) ||
        (newTimeRange.work_start < timeRange[trKey].get() &&
        newTimeRange.work_end > timeRange[trKey].get()) ){
          return new TimeRangeValidationError(
            TimeRangeValidationError.TYPES.FOLDED,
            newTimeRange
          );
        }
    }

    if(timeRange.work_start.get().isSame(newTimeRange.work_start) &&
       timeRange.work_end.get().isSame(newTimeRange.work_end)){
          return new TimeRangeValidationError(
            TimeRangeValidationError.TYPES.DUPLICATED,
            newTimeRange
          );
       }
  }
  return true;
}

function SimpleReactiveVar(val){
  var val = val;
  var $input = null;
  var bindEventTypes = null;
  var onChanges = [];
  var validationFunc;

  this.onChange = function(callbackFunc){
    onChanges.push(callbackFunc);
  };

  this.set = function(newVal){
    if(validationFunc){
      var result = validationFunc(newVal);
      this.printToInput();
      if(result.isErrorObj) return result;
    }

    val = newVal;
    this.printToInput();
    for(var changeCallback of onChanges){
      changeCallback(val);
    }
  };

  this.setValidation = function(pValidationFunc){
    validationFunc = pValidationFunc;
  };

  this.setWithoutCallback = function(newVal){
    val = newVal;
    this.printToInput();
  };

  this.get = function(){return val;};
  this.printToInput = function(){
    if($input){
      if(this.outputFilterFunc)
        $input.val(this.outputFilterFunc(val));
      else
        $input.val(val);
    }
  };

  this.inputBind = function($pInput, eventTypes, inputFilterFunc, outputFilterFunc){
    $input = $pInput;
    bindEventTypes = (typeof eventTypes !== "Array")? eventTypes : [eventTypes];
    this.inputFilterFunc = inputFilterFunc;
    this.outputFilterFunc = outputFilterFunc;

    this.printToInput();

    var self = this;
    for(var eventType of bindEventTypes){
      $input.bind(eventType, function(ev){
        var val = $input.val();
        if(inputFilterFunc)
          self.set(inputFilterFunc(val));
        else
          self.set(val);
      });
    }
  };

  this.inputUnbind = function(){
    if(!bindEventTypes) return;
    for(var eventType of bindEventTypes){
      $input.unbind(eventType);
    }
    $input.val("");
  };
}

var Task = Base.extend({
  initialize: function(params){

    var work_start_val = parseTimeStr(params.work_start);
    var work_end_val = parseTimeStr(params.work_end);

    this.timeRange = {
      work_start: new SimpleReactiveVar(work_start_val),
      work_end: new SimpleReactiveVar(work_end_val)
    };

    var self = this;
    this.timeRange.work_start.setValidation(function(newVal){
      var timeRange = {
        work_start: newVal,
        work_end: self.timeRange.work_end.get()
      };
      return validateTimeRange(timeRange, self.tasks.filter(function(t){return t !== self}));
    });
    this.timeRange.work_end.setValidation(function(newVal){
      var timeRange = {
        work_start: self.timeRange.work_start.get(),
        work_end: newVal
      };
      return validateTimeRange(timeRange, self.tasks.filter(function(t){return t !== self}));
    });

    this.info = {
      unpaid_minutes: new SimpleReactiveVar(params.unpaid_minutes),
      job_name: new SimpleReactiveVar(params.job_name),
      job_id: new SimpleReactiveVar(params.job_id),
      timecard_id: new SimpleReactiveVar(params.timecard_id)
    };


    this.tasks = params.tasks;
  },
  remove: function(){
    for(var i in this.tasks){
      if(this === this.tasks[i]){
        this.tasks.splice(i, 1);
        return;
      }
    }
  },
  toJsonObj: function(){
    return {
      work_start: this.timeRange.work_start.get(),
      work_end: this.timeRange.work_end.get(),
      unpaid_minutes: this.info.unpaid_minutes.get(),
      job_name: this.info.job_name.get(),
      job_id: this.info.job_id.get(),
      timecard_id: this.info.timecard_id.get()
    };
  },
  fromJsonObj: function(jsonObj){
    this.timeRange.work_start.set(jsonObj.work_start);
    this.timeRange.work_end.set(jsonObj.work_end);
    this.info.unpaid_minutes.set(jsonObj.unpaid_minutes);
    this.info.job_name.set(jsonObj.job_name);
    this.info.job_id.set(jsonObj.job_id);
    this.info.timecard_id.set(jsonObj.timecard_id);
  }
});

Task.createTask = function(params){
  var timeRange = {
    work_start: moment(params.work_start, "HH:mm"),
    work_end: moment(params.work_end, "HH:mm")
  };
  var vResult = validateTimeRange(timeRange, params.tasks);
  if(vResult === true)
    return Task(params);
  else
    return vResult;
}

module.exports = Task;
