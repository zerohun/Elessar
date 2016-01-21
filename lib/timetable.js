var RangeBar = require('./rangebar');
var Task = require('./task');
var Base = require('estira');

var TIME_FORMAT = "HH:mm";




var TimeTable = Base.extend({
  initialize: function() {
    this.tasks = [];
    this.rangeBar = RangeBar({
      min: moment().startOf('day').format('LLLL'),
      max: moment().startOf('day').add(1, 'day').format('LLLL'),
      valueFormat: function(ts) {
        return moment(ts).format(TIME_FORMAT);
      },
      valueParse: function(date) {
        return moment(date).valueOf();
      },
      label: function(a){return JSON.stringify(a)},
      snap: 1000 * 60 * 15,
      minSize: 1000 * 60 * 60,
      bgLabels: 0,
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
      var task = self.findTaskByRange(range);
      if(task)
        self.$el.trigger("click.task", task);
    });

    this.rangeBar.on("changing", function(ev, nrange, changed, rangeObj){
      ev.stopPropagation();
      ev.preventDefault();
      var task = self.findTaskByRange(rangeObj);

      var work_start_val = self.rangeValToMoment(rangeObj.range[0])
      var work_end_val = self.rangeValToMoment(rangeObj.range[1])

      task.timeRange.work_start.setWithoutCallback(work_start_val);
      task.timeRange.work_end.setWithoutCallback(work_end_val);

      self.$el.trigger("changing.task", task);
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
    this.setOnTimeChangeFunc(task);
    this.rangeBar.trigger('addrange', [task.range.val(), task.range]);
    this.tasks.push(task);

    return task;
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
    this.setOnTimeChangeFunc(task);
    this.tasks.push(task);
    return task;
  },

  unbindTasks: function(){
    for(var t of this.tasks){
      t.unBindForm();
    }
  },

  findTaskByRange: function(range){
    for(var t of this.tasks){
      if(t.range === range)
        return t;
    }
    return null;
  },

  rangeValToMoment: function(rangeVal){
    return moment(this.rangeBar.normalise(rangeVal), TIME_FORMAT);
  }
});

module.exports = TimeTable;
window.TimeTable = TimeTable;
