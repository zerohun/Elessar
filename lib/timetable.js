var RangeBar = require('./rangebar');
var Task = require('./task');
var Base = require('estira');

var TIME_FORMAT = "HH:mm";

var TimeTable = Base.extend({
  initialize: function(options) {
    if(!options) options = {};
    this.tasks = [];
    this.rangeBar = RangeBar({
      min: options.min || moment().startOf('day').format('LLLL'),
      max: options.max || moment().startOf('day').add(1, 'day').format('LLLL'),
      valueFormat: function(ts) {
        return moment(ts).format(TIME_FORMAT);
      },
      valueParse: function(date) {
        return moment(date).valueOf();
      },
      label: function(a){return JSON.stringify(a)},
      snap: 1000 * 60 * 15,
      minSize: options.minSize || 1000 * 60 * 15,
      bgLabels: options.max || 4,
      allowSwap: false
    });

    this.$el = $("<div class='time-table'></div>").prepend(this.rangeBar.$el);

    var self = this;
    this.rangeBar.on("addrange", function(ev, val, range){
      ev.stopPropagation();
      ev.preventDefault();
      var task = self.addTaskFromRange(range);
      self.$el.trigger("addtask", task);
    });

    this.rangeBar.on("click.range", function(ev, range){
      ev.stopPropagation();
      ev.preventDefault();
      for(var i in self.tasks){
        self.tasks[i].range.$el.removeClass("selected");
        }
      if(range)
        range.$el.addClass("selected");

      var task = self.findTaskByRange(range);
      if(task)
        self.$el.trigger("click.task", task);
    });

    this.rangeBar.on("change", function(ev, a,b, rangeObj){
      var task = self.findTaskByRange(rangeObj);
      if(task)
        self.$el.trigger("change.task", task);
    })

    this.rangeBar.on("changing", function(ev, nrange, changed, rangeObj){
      ev.stopPropagation();
      ev.preventDefault();
      var task = self.findTaskByRange(rangeObj);

      var work_start_val = self.rangeValToMoment(rangeObj.range[0])
      var work_end_val = self.rangeValToMoment(rangeObj.range[1])

      task.timeRange.work_start.setWithoutCallback(work_start_val);
      task.timeRange.work_end.setWithoutCallback(work_end_val);
    });

  },
  on: function() {
    this.$el.on.apply(this.$el, arguments);
    return this;
  },

  setOnTimeChangeFunc: function(task){
    var self = this;
    var onTimeChange = function(){
      var rangeNum = [
        self.rangeBar.abnormalise(task.timeRange.work_start.get()),
        self.rangeBar.abnormalise(task.timeRange.work_end.get())
      ];
      task.range.val(rangeNum);
    };
    task.timeRange.work_start.onChange(onTimeChange);
    task.timeRange.work_end.onChange(onTimeChange);
  },

  addTask: function(params){
    params.tasks = this.tasks;

    var task = Task.createTask(params);
    if(task.isErrorObj) return task;

    var rangeVal = [
      this.rangeBar.abnormalise(task.timeRange.work_start.get()),
      this.rangeBar.abnormalise(task.timeRange.work_end.get())
    ];
    task.range = this.rangeBar.addRange(rangeVal);
    //this.rangeBar.trigger('addrange', [task.range.val(), task.range]);
    return this._addTaskAfter(task);
  },

  addTaskFromRange: function(range){
    var params = {
      work_start: this.rangeBar.normalise(range.range[0]),
      work_end: this.rangeBar.normalise(range.range[1]),
      unpaid_minutes: "",
      job_name: "",
      job_id: "",
      timecard_id: "",
      tasks: this.tasks
    };

    var task = new Task(params);
    task.range = range;
    return this._addTaskAfter(task);
  },
  _addTaskAfter: function(task){
    this.setOnTimeChangeFunc(task);
    this.tasks.push(task);

    var self = this;
    for(var i in task.timeRange){
      (function(i){
        task.timeRange[i].onChange(function(){
          self.$el.trigger("change.task", [task, self.toJsonObj()]);
        });
      })(i)
    }
    for(var i in task.info){
      (function(i){
        task.info[i].onChange(function(){
          self.$el.trigger("change.task", [task, self.toJsonObj()]);
        });
      })(i)
    }
    return task;
  },

  bindTaskForm: function(task, $form){
    task.$form = $form;
    for(var k in task.info){
      (function(k){
        var $input = $form.find("input[data-tt-model=" + k + ']');
        task.info[k].inputBind($input, ['change.tt-model', 'keyup.tt-model']);
      })(k);
    }

    for(var k in task.timeRange){
      (function(k){
        var $input = $form.find("input[data-tt-model=" + k + ']');

        task.timeRange[k].inputBind($input,
          ['change.tt-model', 'keyup.tt-model'],
          function(val){
            return moment(val, TIME_FORMAT);
          },
          function(val){
            return val.format(TIME_FORMAT);
          });
      })(k);
    }
    var $deleteButton = $form.find("button[data-tt-model=deleteButton]");
    $deleteButton.click($.proxy((function(ev){
      ev.preventDefault();
      this.removeTask(task)
    }),this));
  },
  unbindTaskForm: function(task){
    if(!task.$form) return;
    for(var k in task.timeRange){
      task.timeRange[k].inputUnbind();
    }
    for(var k in task.info){
      task.info[k].inputUnbind();
    }
    var $deleteButton = task.$form.find("button[data-tt-model=deleteButton]");
    $deleteButton.unbind("click");
    task.$form = null;
  },
  unbindTasks: function(){
    for(var i in this.tasks){
      var t = this.tasks[i];
      this.unbindTaskForm(t);
    }
  },
  findTaskByRange: function(range){
    for(var i in this.tasks){
      var t = this.tasks[i];
      if(t.range === range)
        return t;
    }
    return null;
  },

  rangeValToMoment: function(rangeVal){
    return moment(this.rangeBar.normalise(rangeVal), TIME_FORMAT);
  },

  removeTask: function(task){
    var jobId = task.info.job_id.get();
    this.unbindTaskForm(task);
    this.rangeBar.removeRange(task.range);
    task.remove();
    this.$el.trigger("delete.task", jobId);
  },

  toJsonObj: function(){
    var jsonObj = {
      tasks: []
    };
    for(var i in this.tasks){
      var t = this.tasks[i];
      jsonObj.tasks.push(t.toJsonObj());
    }
    return jsonObj;
  },

  fromJsonObj: function(jsonObj){
    for(var t in jsonObj.tasks){
      var t = jsonObj.tasks[i];
      t.work_start = moment(t.work_start).format("HH:mm");
      t.work_end = moment(t.work_end).format("HH:mm");
      this.addTask(t);
    }
  }
});

module.exports = TimeTable;
