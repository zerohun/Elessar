## **Design decision** ##

**Overview**

Model : Task

 - Storing data
 -  Synchronizing data with view
 - Notifying whenever data has changed


Controller: Timetable

 - Binding model and views
 - Event handling
 - Event triggering
 - Converting event from view to model changing event(
 (middle-layer between view-model)

View: viewRange, range

 - Render view
 - Input from U



**Priority**

 - Flexibility
	 To build good UI, I believe that there could be  many trial and user's feedbacks. Therefore, rather then building certain kind of UI, Timetable is focusing on flexibility. no matter how it look like, it shouldn't have any problem getting user's input and showing data to users. That's the reason it use data-tt-model html data attribute which is inspired by ng-model of AngularJS.
	 Even entire look of slide and html form has changed, as long as it synchronize data, it will work together.
	 
 - Reactivity
Probably some user might get assigned to a task that he or she should get in immediately. If you have to push a reload button to see new task assigned to you, you could miss it. 
Timetable's task's property objects have setter and getter.
with using observer pattern, simply using setter of those object will notify other UI components what data is changing. so users can see it.

**Things need to be improved from here**

 - public, private, protected.....
	 Since I forked the Elessar, I was kind of following the structure of Elessar. Every property in class is public. If this proejct is about to grow bigger, I would like to fix it.

 - I was using so many "var self = this"
    I would like to do some refactoring it if I have more time.

 - npm dependencies as so old.
   some of dependency was too old and disappeard from npm repository. it took me long time to figure it out.
   I tried to upgrade those dependency, but once I updated it, current code didn't work, so I had to find the old dependency code from github and put it in packages.json

 - Considering task property's data type 
   It currently binding every property on input tag but probably user shouldn't able to change job_id, timstamp_id   


    



