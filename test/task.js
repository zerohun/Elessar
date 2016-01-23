var tape = require('tape');
var Task = require('../lib/task.js')

tape.test('Create a task', function(t) {
  var task = Task.createTask({
    work_start: "17:00",
    end_start: "18:00",
    unpaid_minutes: 20,
    job_name: "harvest",
    job_id: 22,
    timecard_id: 233
  });
  t.equal(task.timeRange.work_start.get().toString(), moment('17:00', 'HH:mm').toString());
  t.equal(task.timeRange.work_end.get().toString(), moment('18:00', 'HH:mm').toString());
  t.equal(task.info.unpaid_minutes.get().toString(), 20);
  t.equal(task.info.job_name.get(), 'harvest');
  t.equal(task.info.job_id.get(), 22);
  t.equal(task.info.timecard_id.get(), 233);
});
