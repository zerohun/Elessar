**TimeTable**
=======

TimeTable is task management UI component built on top of **[Elessar](https://github.com/quarterto/Elessar)**

TimeTable bind each Elessar's range sliders to html form so user can change detail of task and time.


Demo urls
-----
http://entireangle.com:8080/demos/index.html
http://entireangle.com:8080/demos/index2.html
http://entireangle.com:8080/demos/index3.html

Using
-----

Timetable exports as a CommonJS (Node) module, an AMD module, or a browser global:
```javascript
var TimeTable = require('timetable');
```
```javascript
require(['timetable'], function(TimeTable) { ... });
```
```html
<script src="path/to/timetable.js"></script>
```
Create a Timetable with `var timeTable = new TimeTable` then add `timeTable.$el` to the DOM somewhere.

```javascript
new TimeTable({
  min: 0, // value at start of bar
  max: 100, // value at end of bar
  minSize: 0, // smallest allowed range (in bar units)
});
```

API
---
### ``.addTask(params)``
```javascript
timeTable.addTask({
      work_start: "10:00",
      work_end: "17:00",
      unpaid_minutes: 22,
      job_name: "harvest",
      job_id: 22,
      timecard_id: 233,
      tasks: this.tasks
});
```

### ``.removeTask(task)``
```javascript
timetable.removeTask(task);
```

### ``.bindTaskForm(task, $form)``
Bind a task to a html form
What binding means here is when a variable's value has changed it will
immediately synchronized with input tag's value.
when the value of input tag has changed, it also change the value of the variable

```javascript
timeTableFirst.on("click.task", function(ev, task){
  timeTable.bindTaskForm(task, $("#task-form");
});
```
``` html
<form id="task-form">
  <input type="time" name="work_start" data-tt-model="work_start" placeholder="HH:mm ex) 19:30">
  <input type="time" name="work_end" data-tt-model="work_end" placeholder="HH:mm ex) 20:30">
  <input type="text" name="unpaid_minutes" data-tt-model="unpaid_minutes">
  <input type="text" name="job_name" data-tt-model="job_name">
  <input type="text" name="job_id" data-tt-model="job_id">
  <input type="text" name="timecard_id" data-tt-model="timecard_id">
  <button class="btn btn-danger delete-task" data-tt-model="deleteButton">delete</button>
</form>

```
Inspired by ng-model of AngularJS, It use 'tt-model' to bind task's property value and input tags 
```html
<input data-tt-model="value key">
```

### ``.unbindTaskForm(task, $form)``

it will simply remove the binding between task and form.

### ``.addTask(params), .removeTask(task)``
```javascript
timeTable.addTask({
      work_start: "10:00",
      work_end: "17:00",
      unpaid_minutes: 22,
      job_name: "harvest",
      job_id: 22,
      timecard_id: 233,
      tasks: this.tasks
});
```
```javascript
timetable.removeTask(task);
```

### ``.toJsonObj()``

It will return this form of data
```javascript
{[
   {
      work_start: momentJS,
      work_end: momentJS,
      unpaid_minutes: Number
      job_name: String
      job_id: Number 
      timecard_id: Number
   } 
, .....]}
```
### ``.fromJsonObj(jsonObj)``



Task Object
---
```javascript
/*
  setter and getter methods of property
*/
task.timeRange.work_start.set(/* momentJS object*/);
//It immediately change time range size and form input value that is bound with this object

task.timeRange.work_end.get();

task.info.job_name.set("job_name")
//it also immediately form input value that is bound with this object




task.toJsonObj()
/*
returns following form of object
{
      work_start: momentJS,
      work_end: momentJS,
      unpaid_minutes: Number
      job_name: String
      job_id: Number 
      timecard_id: Number
} 
*/

task.fromJsonObj(jsonObj)
```


Events
---
### ``.on('addTask', function(ev, task){...}) ``
This event is fired whenever there is a new task created

### ``.on('click.task', function(ev, task){...}) ``
This event is fired whenever time range(task) is clicked

### ``.on('change.task', function(ev, task){...}) ``
This event is fired whenever task's data is changed

### ``.on('delete.task', function(ev, job_id){...}) ``
This event is fired whenever task's data is deleted, deleted task's job_id is delivered with this event.




