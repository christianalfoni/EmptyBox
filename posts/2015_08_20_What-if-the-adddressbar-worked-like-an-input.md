# What if the addressbar worked like an input

Creating applications in the browser is still pretty new, but it is moving incredibly fast. Great innovations are being made and the community is growing. We are pushing the boundaries of the browsers and the rest of the web stack. We create things today that we did not know was possible just a year ago. A lot of it has to do with better browsers, and especially faster JavaScript engines, but maybe now more than ever the way we think about how to develop apps is an important factor. One thing is for sure… it is really fun and exciting to be a frontend developer these days :-)

The latest really great innovations in regards of how we think about application development is FLUX and React, but a lot has happened since those ideas were let loose. Ideas like not having stores, but [reducers](https://github.com/rackt/redux) in your model layer. Or ideas like not having multiple of anything in your model layer, but a [single state tree](https://github.com/Yomguithereal/baobab). I am also trying to bring my contribution to this evolution and that is replacing the dispatcher with a state change flow library called [Cerebral](http://christianalfoni.com/cerebral).

But there is this one thing we have not figured out, and that is routing. You might feel very different about this, but please hear me out. I think this is really important for the next steps of the evolution building web applications.

## The concept of a router
When we talk about routing we have to split this into two different concepts. We have a traditional router on the server that receives requests from the browser, it triggers business logic  to change/get some state and responds to the browser with HTML. Though we still have a router on the server it has gotten a new purpose. It is not there to update UI of our app anymore, but just update/get state. So the routers original purpose has now been interpreted in the context of running in the browser, to give us more structure in our frontend applications. Changing state and update the UI.

But let us look at this in a more abstract way. What is this routing flow actually doing?

1. A sender creates a request that has two parts. The address and the payload
2. The request is sent to a receiver which parses the address and sends the payload to some business logic at the requested address
3. When the business logic is done the receiver creates a response with some payload and sends it back to the sender

This is what I would define as the core of routing. Now, if we abstract this to fit our web application it would be:

1. Browser creates a request with a url and a query/body, either using a link or a form, and sends it to the server
2. The router parses the url and triggers one or multiple functions which has access to the query/body and changes/gets state
3. When the functions are done the router creates a response where the payload is HTML

So lets abstract this again:

1. User interaction
2. State change/get
3. UI update

This is really what traditional web applications also are all about, but old server applications needs an implementation detail called “a router” to achieve this. It is what allows user interactions from the browser to change/get state on the server and then get a UI update back.

But if we think of this abstraction in our modern web applications we do not need the router at all. We can create this flow very easily without the router, and with a lot more flexibility, as everything is happening on the client. And if we forget about the router and look at the last abstraction again, going the other way. To achieve those goals in the browser… would we create a router at all?

So does that mean we should not have URLs? No. But I think we need to introduce a different perspective on URLs, because now the routers are holding us back in regards of exploring the true potential of this really simple "interaction -> state change/get -> UI update" flow that has become so mature. Now it kinda feels like we are trying to figure out how to get a router in the client, not making the URL a natural part of our general state change flow.

## What if...
So what if the addressbar in the browser was nothing more than a input? An input you could listen to changes on, prevent default behaviour on and change the value without causing side effects? Let me explain these concepts with a normal input.

### The basics of an input
So an input is just a text field where you can change the value. With some business logic you can grab the value from it and do something.

### Listening to an input
You are also able to listen to an input for changes. There are many different events here, like blur, focus, keydown, keyup, keypress etc. But what we really care about in the addressbar is "onChange", as we know from React. When the value is changed.

### Changing the input
You are also able to set a new input value programmatically. What is important to remember here is that a change to the input does not trigger a new change event, it is just a UI update and you can grab this new value if you want it, but it does not trigger an event.

So what React helped us do was to be able to control the value of an input with state inside our program (component). We listen to changes, insert the value as some state in our application and put the value right back into the input. This means that if the value is changed inside our program or by the user, it will always stay in sync with each other.

So what if the addressbar in the browser worked the same way? Lets play around with this thought.

## The addressbar as an input
Imagine we have gone to `www.example.com` and we have a web application running there. The application has a VIEW layer to display UI and take user interactions, a CONTROLLER layer to handle the flow of state changes and a MODEL layer to store those state changes. All frameworks and patterns share this. It is fundamental to building an application, whatever you want to call those layers and how they communicate.

When you hit the page you will have access to `addressbar.value`. This value is `/`. When your application loads, this value is passed to your CONTROLLER layer to do the necessary state changes related to that value, as if it was a value passed from a normal input. The state change could be: `”/” -> {currentPage: 'home'}` or something completely different. The state change is done and stored in the MODEL layer and your UI reacts to this and renders based on the current state in your application.

Now the user hits a link and changes the url to `/admin`. Normally we would have to create logic on the link itself to prevent the browser from doing its native behaviour, but what if we listened to the `addressbar` instead?

```javascript

addressbar.addEventListener('change', function (event) {
  event.preventDefault();
  switch (event.target.value) {
    case '/': myControllerLayer.changeToHomeState();
    case '/admin': myControllerLayer.changeToAdminState();
  }
})
```

By preventing default behaviour on the change of the addressbar it could have the exact same effect. This can of course only work within the same domain, so if your link went to `www.google.com` you would not be able to prevent that.

But very often we want to go the other way around. We trigger a state change flow manually, but it should result in a change of the addressbar.

```javascript

myModelLayer.addEventListener('change', function (state) {
  addressbar.value = state.url;
});
```

This means that whenever your state changing flow changes the `url` state, it will be reflected in the addressbar of your application.

Now, it is important to note that this is low level code, but it is very flexible. This is something we can easily create abstractions on top of. It being traditional routing or this new flexible approach just described. We are now able to think of an URL as a “label” for some state change. This instead of a router doing VIEW layer changes in one direction and state changing logic in the other direction. So now your VIEW layer has only one way to update itself, and that is when state changes in your MODEL layer.


## Summary
The project [reactive-router](https://github.com/christianalfoni/reactive-router) is a library that allows you to use the concepts explained here with browsers today. It is a very good fit for modern reactive applications, like [flux](https://github.com/facebook/flux), [cerebral](https://github.com/christianalfoni/cerebral) etc. Efforts are also being done to traditional routers, like [react-router](https://github.com/rackt/react-router).

My point here is that our applications should not use a router as the only concept for changing state, because not all state changes are related to a URL. We should neither let the router do its own state changes, like manipulating the VIEW layer, and have a different concept for other state changes. That just increases complexity and reduces flexibility. What we need is a way to handle the URL like any other input so that we can focus on building one awesome concept for all the state changes of our applications.
