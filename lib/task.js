var Base = require('estira');
var $ = require('jquery');

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

  this.onChange = function(callbackFunc){
    onChanges.push(callbackFunc);
  };

  this.set = function(newVal){
    val = newVal;
    this.printToInput();
    for(var changeCallback of onChanges){
      changeCallback(val);
    }
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

    this.info = {
      unpaid_minutes: new SimpleReactiveVar(params.unpaid_minutes),
      job_name: new SimpleReactiveVar(params.job_name),
      job_id: new SimpleReactiveVar(params.job_id),
      timecard_id: new SimpleReactiveVar(params.timecard_id)
    };
  },

  bindForm: function(formCssSel){
    var $form = $(formCssSel);
    this.$form = $form;
    var self = this;

    for(var k in this.info){
      (function(k){
        var $input = $($form.find("input[data-tt-model=" + k + ']'));
        self.info[k].inputBind($input, ['change.tt-model','keyup.tt-model']);
      })(k);
    }

    for(var k in this.timeRange){
      (function(k){
        var $input = $($form.find("input[data-tt-model=" + k + ']'));

        self.timeRange[k].inputBind($input,
          ['change.tt-model','keyup.tt-model'],
          function(val){
            return parseTimeStr(val)
          },
          function(val){
            return val.format("HH:mm")
          });
      })(k);
    }
  },
  unBindForm: function(){
    for(var k in this.timeRange){
      this.timeRange[k].inputUnbind();
    }
    for(var k in this.info){
      this.info[k].inputUnbind();
    }
    this.$form = null;
  }
});

module.exports = Task;
