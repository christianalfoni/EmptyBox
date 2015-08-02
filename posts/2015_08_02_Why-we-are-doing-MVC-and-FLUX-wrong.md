# Why we are doing MVC and FLUX wrong

The MVC (Model View Controller) architecture is referenced in almost all Frontend frameworks. Angular, Ember, Backbone etc, but is it really MVC they are implementing? And is Flux really a different architecture? In this article I am not going to go all academic on you, I am going to tell you about why I think Frontend frameworks are not implementing MVC correctly, and that Flux is actually a lot closer to traditional MVC than any of the other frameworks, but still does not quite "get us there." This is a bold statement, but please read on and I will explain.

I am not going to show any code in this article, but I am going to reason about why I think [Cerebral](https://github.com/christianalfoni/cerebral) is not only just a library and a development tool, but it fundamentally does **not** change the way we develop our apps as it goes back to the roots of MVC.

## Traditional MVC
When I say "traditional MVC" I am talking about doing all the work on the server. The browser just receives strings of HTML and can do requests to the server by changing the url or posting a form. Lets visualize this:

```javascript

  BROWSER             SERVER                    DATABASE
  |------|  request   |------------|  request   |-------|
  |      | ---------> |            | ---------> |       |
  | VIEW |  response  | CONTROLLER |  response  | MODEL |
  |      | <--------- |            | <--------- |       |
  |------|            |------------|            |-------|
```
So a traditional flow in your application would be:

1. You open a url (www.example.com)
2. A request is sent to the server
3. The server reads the request and based on the url it chooses what middleware to run
4. The middleware sends a request for some **state** in the database, or requests a change in the database
5. When the database responds the controller produces the HTML view using a template, passing in any state from the database
6. The browser gets the response and renders the HTML

**Middleware** are basically a chain of functions that has specific responsibilities. One could be checking the request for a user, the next could be getting the user and a third would be getting what was actually requested.

## Application state
What is state? Do not feel bad if you are unsure about this, it is used to describe many different things. I could say: "The checkbox is in checked state", "It is bad to keep state in your components" or "The database is where I keep all my state". To explain state I often refer to templates. When you create a template you want to populate it with some data and you do that by exposing data to the template. This exposed data is the state! So whatever data you need to display the UI of the application is state.

You can argue that there are many other forms of state, but please put that aside for now. It is the state you need for your UI we are going to talk about here. So let us call it **application state** to be more precise.

## State in traditional MVC
If you take a look at the visualization above, where is the application state? In the browser? On the server? Or in the database? The answer is **in the database**. If the application was just a list of todos neither the browser or the server has any information about those todos, they are stored and accessed in the database.

This fact is exactly what makes MVC such a great architecture! Your **view** has to make a request to get or change any application state. The **controller** will always control this process of getting or changing application state. The **model** is the only place you have application state. It is a simple and predictable flow and what you see in the browser is always a direct result of the state you passed into the template.

The problem with traditional MVC though is that when the application state changes in the database by some other process, maybe a different user or a timed process, the **view** can not automatically update. The **view** always has to initiate the update.

## When we moved to the frontend
When MVC was implemented for the Frontend it was to fix this very thing. Allow changes to state to be reflected in the UI instantly. It gives a much better user experience. But in this process the strict and predictable flow with traditional MVC was broken and there are mainly four reasons for that:

1. The router and the controller was considered the same thing
2. The **view** layer had direct access to the **model** layer
3. The **model** layer was not conceptually treated as one storage
4. We stored application state inside our **view** layer

These four statements might not make much sense right now, but let us dive into them and take a closer look. Then we are going to look at how we can bring back this strict and predictable architecture, and see what really great benefits it gives us!

### The router is not a controller
What does a router actually do? In traditional MVC it is often being referred to as the **controller**, I have done so many times myself. But I believe that the router and the controller are conceptually two different things. The router is what receives the request from the browser and then triggers the controller, which runs middleware to get or change application state. The thing is that in server driven applications a request to the router is commonly the only thing that triggers the controller, so it basically is the same thing. Let me show with two examples:

```js

// The router "is the controller"
router.add('POST', '/items', addItem, createItemsView, createResponse);

// They can be separated
controller.add('createItem', addItem, createItemsView, createResponse);
router('POST', 'items', controller.createItem);
```
There is a subtle difference here. If the controller is separated from the router it would mean that not only the router is able to use the **controller**, but also other parts of the code can trigger the same flow.

As stated above, this does not really makes sense as with traditional MVC only the router needs to talk to the controller. But when we moved to the Frontend this changed. It was no longer necessary to go through the router to either get or change the application state.

### The view layer bypassed the controller layer
When MVC was implemented on the client we no longer needed to trigger a url or post a form to do application state changes, we could just talk directly to the **model** layer from the **view** layer. An example of this could be submitting a form, though we do not create a post request directly to the server, we go to the model.

```js

   VIEW                 MODEL                    SERVER
  |-------|  onSubmit  |-----------|  request   |-------|
  | FORM  | ---------> | USERMODEL | ---------> |       |
  | name  |            | name      |            |-------|
  | age   |            | age       |
  |-------|            |-----------|
```
So what we do here is update a client side **model** and then we pass that information to the server. The point here is that there is no controller handling the exchange of information from the **view** layer to the **model** layer, but if you would go to `localhost:3000/#/items/123` suddenly the router would act as a controller, preparing the state and create a view to be displayed.

This creates complexity as we now have two ways of defining the flow of our application, it could either be through a router or directly with a model.
```js

|------|       |--------|      |-------|
| VIEW |  ---> | ROUTER | <--> | MODEL |
|------|       |--------|      |-------|
                   |               ^
|------|           |               |
| VIEW |  <--------|               |
|------|                           |
                                   |
|------|                           |
| VIEW |  <------------------------|
|------|
```


But this added complexity is not the only problem.

### No concept of a single state store
As you can see in the example above we have a **usermodel**. This a typical abstraction in many frameworks. There are two problems with this kind of abstraction.

First of all it is represented as a decoupled entity from the rest of your application state. State changes are no longer a request made to a single database endpoint, like in traditional MVC, it is requests to many different models. This makes it a lot harder to reason about how everything in your application is connected. So in addition to the **view** layer not depending on a single controller, like stated above, it does not depend on a single state store either. Our simple flow definition has now been converted to something like this.

```js

|------|       |--------|      |-------|
| VIEW |  ---> | ROUTER | <--> | MODEL |
|------|       |--------|      |-------|
                   |               ^
|------|           |               |
| VIEW |  <--------|               |
|------|                           |
                                   |
|------|                           |
| VIEW |  <------------------------|
|------|                           |
                                   |
|------|                           |
|      |  <------------------------|
|      |  
|      |       |-------|
| VIEW |  <--> | MODEL |
|      |       |-------|
|      |
|      |       |-------|
|      | <---> | MODEL |
|------|       |-------|
```

The second problem is that this **model** abstraction is for application state related to what is in the database on the server, not application state like; "Loading data from the server", "Show the settings modal", "Show tab 3". This is not something you would store in a database. So where do we put that state?

### State in the view layer
Everything not related to what is in the database we often put into to the **view** layer. There just is no other place to put it. This problem gets even worse as our **view** layer is no longer a single view, it is dozens of views composed together and each of these views has their own internal state unavailable to the other views. Scaling our applications becomes a big problem.

So to recap this. With traditional MVC we have one **view** layer, one **controller** layer and one **model** layer. We only keep state in the **model** layer and any changes to that state comes from the **view** layer and through the **controller** layer. On each state change/get a new view will be created. When this was moved to the Frontend the complexity increased with:

1. Multiple views
2. State also inside views
3. Multiple models
4. We bypass the view <-> controller <-> model flow
5. The router is no longer the only entry point for state change

## What FLUX improved
What FLUX helped us with was to introduce a **controller** layer for the client. This controller was called a dispatcher and any state change had to go through the dispatcher with a payload. This is exactly how traditional MVC works, all state changes has to go through the controller using a request with a payload. FLUX also introduced a new **model** layer called stores. The great thing about stores is that they are not a wrapper for database entities. It is just plain state for whatever you wanted, it being state from the server or state for the client only.

But FLUX has its issues. There are three challenges:

1. The FLUX architecture uses multiple models (stores). With traditional MVC you only have one model, your database. Multiple stores quickly causes problems when a dispatch needs to reach more than one store and especially if one store needs to know about state in an other
2. There is no concept of middleware like in a traditional controller. This quickly introduced the concept of **action creators**. They are much like a single middleware that is responsible for doing everything needed related to a request from the **view** layer, often doing multiple dispatches to the stores
3. When the **view** layer wants to get some state they still do it directly from the **model** layer, making unnecessary complex dependencies in the views

Let us try to visualize this a bit:

*Traditional MVC*
```js

|------|  request   |------------|  request   |-------|
|      | ---------> |            | ---------> |       |
| VIEW |  response  | CONTROLLER |  response  | MODEL |
|      | <--------- |            | <--------- |       |
|------|            |------------|            |-------|
```

*FLUX*
```js

 COMPONENTS          ACTION CREATORS           STORES

    |----------------------<<<<-------------------|
    |                                             |
|------|            |------------|            |-------|
|      |  request   |            |  request   |       |
| VIEW | ---------> |            | ---------> | MODEL |----
|      |            |            |            |       |   |
|------|            |            |            |-------|   |
                    | CONTROLLER |                        |
|------|            |            |            |-------|   |
|      |  request   |            |  request   |       |   |
| VIEW | ---------> |            | ---------> | MODEL |   |
|      |            |            |            |       |   |
|------|            |------------|            |-------|   |
   | |                                           |        |
   | |--------------------<<<<-------------------|        |
   |----------------------<<<<----------------------------|
```
But where does the router fit in? The really good thing about this architecture is that the **controller** layer has nothing to do with the router. The bad thing is that the most popular router with FLUX is the [react-router](https://github.com/rackt/react-router). I do not mean to badmouth a really great job creating the project and supporting the React/Flux community, I just say that conceptually it is not compatible with what we are trying to achieve. The reason is that the React Router takes direct control of the **view** layer, it does not honor the simple flow we want to achieve. Any state change, including what views to display, should be based on application state in the **model** layer and the only way to achieve change is through the **controller** layer.

## Fixing the problem
So what we have to fix is the following:

1. We should have one model in our **model** layer
2. All our state should be contained inside the **model** layer
3. We should have one controller in our **controller** layer
4. The **view** layer can only communicate with the **controller** layer
5. Use a router that does not control the **view** layer

### A single state store
There has been great efforts on moving towards a single state store concept. Projects like [baobab](https://github.com/Yomguithereal/baobab), [freezer](https://github.com/arqex/freezer) and [immutable-store](https://github.com/christianalfoni/immutable-store) are concepts like that. Even the latest [relay](https://gist.github.com/wincent/598fa75e22bdfa44cf47) project from Facebook works like a single state store. Conceptually this is just like a database, though you have any kind of state inside it, even state you would normally put inside the **view** layer.

```js

|-------|
|       |
| MODEL |
|       |
|-------|
```

### A controller with middleware
Though there has been a lot of development on the **view** layer and **model** layer of our applications, not much has been done with the **controller** layer. As stated above, the FLUX architecture did introduce a **controller** layer, though it lacks functionality to become what we benefitted from in traditional MVC. So this is where I introduce my contribution, [Cerebral](https://github.com/christianalfoni/cerebral). Cerebral is a controller that separates your **view** layer from the **model** layer and controls the flow between them.

```js

|------------|  set   |-------|
|            | -----> |       |
| CONTROLLER |   get  | MODEL |
|            | <----- |       |
|------------|        |-------|
```
When we work on the Frontend there is not a request/response pattern communicating between the controller and the model. It can simply do the changes it wants and extract whatever state it wants.

### The views talk to the controller
So the views does not have any access to the **model** layer at all. They can only talk to the controller.

```js

|------|   signal   |------------|  set   |-------|
|      | ---------> |            | -----> |       |
| VIEW |    event   | CONTROLLER |   get  | MODEL |
|      | < - - - -  |            | <----- |       |
|------|            |------------|        |-------|
```
Using Cerebral the **view** layer can signal a change, it being a button clicked, input changed, form submitted or whatever else. Then the controller has a set of middleware it will run, getting data from the server and doing changes to the **model** layer. When it is done it will trigger an event which the **view** layer can listen to and extract any state it needs. This is where we really want to differentiate from traditional MVC. Instead of using the response from a request to update our views, the **view** layer reacts whenever the controller is done running the request, then extract the new state.

### Just do the routing
Now that we have a general controller for our application we can hook on a router as if it was a view, and we can keep hooking on multiple views. They will all work with the same controller and the same model.

```js

|--------|   signal   |------------|   change   |-------|
|        | ---------> |            | ---------> |       |
| ROUTER |    event   |            |   extract  |       |
|        | < - - - -  |            | <--------- |       |
|--------|            |            |            |       |
                      | CONTROLLER |            | MODEL |
|------|   signal     |            |   change   |       |
|      | -----------> |            | ---------> |       |
| VIEW |    event     |            |   extract  |       |
|      | < - - - - -  |            | <--------- |       |
|------|              |------------|            |-------|
```

## So what benefits do I really get?
Developing applications is all about keeping a mental image. You can not understand a problem or create a solution without having a complete mental image of the task at hand. With traditional MVC it is easy to keep a mental image because the architecture is simple. When MVC moved to the Frontend we did too many changes, breaking the simplicity of the architecture and in the process breaking our mental image. Giving the **controller** layer back its functionality and place in the architecture you can build this mental image much quicker.

The way we achieve this is two fold. First of all we reduce the number of places changes are made and stored. It does not matter what you implement in your application, all state changes goes through one controller and any state is stored in one state store. Second, having a controller where all state changes flow through lets us build developer tools. With Cerebral you are able to debug and understand the flow of the application just playing around in the UI and using the Chrome Cerebral Debugger. You can even reset, traverse and keep the state of the application after a refresh. You can try that out on [cerebral todomvc demo](http://www.christianalfoni.com/todomvc).

## Summary
I hope this take on introducing Cerebral made sense to you. Whenever we build our applications we put the user in focus, but I think we can not create good user experiences if we do not have a good developer experience. Great tools gives great developer experience and that is exactly what Cerebral tries to be regardless of you **model** layer preferences and **view** layer preferences. Thanks for reading!
