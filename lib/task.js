var Base = require('estira');
var $ = require('jquery');
var TimeRangeValidator = require('./time_range_validator');

function parseTimeStr(timeStr){
  if(!timeStr) return null;
  timeArray = timeStr.split(':');
  return moment().hour(timeArray[0]).minute(timeArray[1]).second(0);
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
    for(var i in onChanges){
      onChanges[i](val);
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
    for(var i in bindEventTypes){
      var eventType = bindEventTypes[i];
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
    for(var i in bindEventTypes){
      var eventType = bindEventTypes[i];
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
      return TimeRangeValidator.validate(timeRange, self.tasks.filter(function(t){return t !== self}));
    });
    this.timeRange.work_end.setValidation(function(newVal){
      var timeRange = {
        work_start: self.timeRange.work_start.get(),
        work_end: newVal
      };
      return TimeRangeValidator.validate(timeRange, self.tasks.filter(function(t){return t !== self}));
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
  var vResult = TimeRangeValidator.validate(timeRange, params.tasks);
  if(vResult === true)
    return Task(params);
  else
    return vResult;
}

module.exports = Task;
