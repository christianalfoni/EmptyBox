# Plant a Baobab tree in your flux application

All standards, libraries, practices, architectures and patterns needs some time to evolve before becoming widely accepted. The flux architecture is no different. After Facebook released their React JS project the suggested flux architecture has evolved into many different shapes and colors. Some of them more accepted than others. In this article we are going to look at what challenges exists today with the flux architecture. We are also going to look at a solution that I think is a great contribution to the evolution of flux.

### Flux and Flux history
If you have never heard about flux before I will give a very short decription. **Component** -> **Action Dispatcher** -> **Store** -> **Component**. It is a one way flow of state where you components do not change the state of your application directly, but goes through a dispatcher to do so. There are several implementations of this architecture and initially we had the offical dispatcher and store from Facebook. So why did developers start to implement their own versions of flux? I believe there are five main reasons for this: **verbosity** , **async operations**, **handle the same action in multiple stores**, **sharing state between stores** and **immutability**.

#### Verbosity
Developers in the JavaScript world have become accustomed to very expressive and easy to use API's. The Facebook dispatcher and store does not really provide much of an API at all, there is a lot of manual checking and defining to do very simple things. It also becomes quite repetitive. 

#### Async operations
When you test your application it is better to do so if you can change the state of your store synchronously. The reason is that synchronous tests are easier to write and you will also get less dependencies to the store itself. What you want to test is how your components render in the different states of the store. If the API changing the state of the store is synchrounous it will be easier to prepare the state of the store before running a test.

#### Same action in multiple stores
Facebook suggests a **waitFor** method that can reference the other stores in your application. If an action is dispatched and multiple stores react to that action, the **waitFor** method allows you to control which stores handles the action first.  Even though you clearly see that something else should happen first, you have no idea exactly what happens. It is much like calling **super** in a constructor. You have to change file and compose how it works in your head.

#### Sharing state between stores
You probably do not know exactly what state is going to live in the application beforehand, and even less how that state will flow through the application. And even if you are a wiz at planning, you can not look into the future. The state and flow will change. The thing with traditional flux is that the state is split into multiple stores that other stores are interested in. That is initially not a problem, but it quickly becomes a problem if two stores depend on each other. You get circular dependencies.

#### Immutability
Immutability can be a difficult concept to grasp, but a more important question to answer is; "why would you want to use it"? There are two sides to this story. Immutability is a general concept that makes sure that whenever an object or array is changed, the object/array itself will change its reference. This makes sure that one part of your code can not mutate the state of other parts of your code. To my understading this is something that gives value on very large projects, with huge codebases and a large team. Much like type checking. But the other side of this story is related to React JS and its rendering. You can use immtability to allow for shallow comparison when verifying if a render should occur in a component. The **React.addons.update** method, or the [immutability-js](https://github.com/facebook/immutable-js) lib, will help you do this. The problem is that it is both difficult to use and understand why you need to use it.

### The solutions
There are many alternatives out there. Just have a look at [the React JS wiki](https://github.com/facebook/react/wiki/Complementary-Tools). What I think all of them have in common is that they are more expressive in regards of syntax, they are not as verbose as the Facebook dispatcher and store. Some of them handle async operations as a layer in front of the dispatcher, called *action creators*. To handle the same action in multiple stores some libraries have different implementations of waitFor, and some uses mixins to merge stores into one single store. There are not many that handle the circular depdendency issue, but mixins is one solution that will handle that too. Some of them has immutability built in either by update methods to change state, or pure cloning.

So now we have some background on what challenges flux has and what still needs to be evolved until we reach a widely accepted implementation... if we ever get there, or should for that matter :-) Now we are going to look at one specific implementation that I think solves all these issues very elegantly.

### Meet Baobab
Even though I have a very hard time remembering the name of this library it has a very interesting solution to handling state. We have to forget about dispatchers, actions and stores for a moment. A Baobab tree is strictly the state of your application. All of it. Everything exists in one tree. What makes this tree so special is that any changes will trigger an event, but not as you might expect. Let us get into some code and explore how the tree works and then we will see how we can implement a complete flux architecture around it, using React JS and a layer for handling state changes.

#### Creating a tree
```javascript

var Baobab = require('baobab');
var stateTree = new Baobab({
  admin: {
    users: []
  },
  home: {
    news: []
  }
});
```

As you can see the tree is basically one object with nested objects and arrays. It is like a tree with branches. You can traverse this tree using a select method.

```javascript

var Baobab = require('baobab');
var stateTree = new Baobab({
  admin: {
    users: []
  },
  home: {
    news: []
  }
});

var adminCursor = stateTree.select('admin');
var admin = adminCursor.get(); // { users: [] }
```

**adminCursor**? What is that? Well, a cursor is a pointer to some data in your tree, in this case the admin object. To actually extract the value you use the **get()** method on the cursor. So what is this all about? The brilliant thing that cursors give you is the ability to listen for changes, but not only changes to the value the cursor points to. Let me give you an example:

```javascript

var Baobab = require('baobab');
var stateTree = new Baobab({
  admin: {
    notifications: {
      list: []
    }
  },
  home: {
    feeds: []
  }
});

var adminCursor = stateTree.select('admin');
var notificationsCursor = adminCursor.select('notifications');
var feedsCursor = stateTree.select('home', 'feeds');

adminCursor.on('update', function () {
  console.log('I saw a change'); // I will trigger
});

notificationsCursor.on('update', function () {
  console.log('I saw a change'); // I will trigger
});

feedsCursor.on('update', function () {
  console.log('I saw a change'); // I will not trigger because I am on a different branch
});

notificationsCursor.push('foo');
```

As you can see, the update event propagates up the tree. This is really powerful as you can narrow down the interest of changes in different parts of your application. Maybe one part of your application is interested in all changes within the admin object, but an other part is only interested in the notifications array. 

### Combining our state tree with React JS
Now we have been looking at how Baobab works "under the hood". The real power of Baobab though is how it integrates with React JS. Let us first see how we can combine our state tree with a React JS component to both react to changes in the tree and grab data from the tree. After that I will explain why it is a very good thing that we specify what state changes the component is actually interested in, instead of listening to general changes to state.

When connecting your state tree to a component you have two strategies. Let us take a look using the state tree defined above.

#### Connecting a single cursor

```javascript

var stateTree = require('./stateTree.js');
var React = require('react');

var listCursor = stateTree.select('admin', 'notifications', 'list');
var MyComponent = React.createClass({
  mixins: [listCursor.mixin],
  renderNotification: function (notification) {
    return (
      <li>{notification.title}</li>
    );
  },
  render: function () {
    return (
      <ul>
        {this.state.cursor.map(this.renderNofication)}
      </ul>
    );
  }
});
```

#### Connecting multiple cursors

```javascript

var stateTree = require('./stateTree.js');
var React = require('react');

var MyComponent = React.createClass({
  mixins: [stateTree.mixin],
  cursors: {
    notifications: ['admin', 'notifications', 'list'],
    feeds: ['home', 'feeds']
  },
  renderFeed: function (feed) {
    return (
      <li>{feed.title}</li>
    );
  },
  render: function () {
    return (
      <div>
        <div>You have {this.state.cursors.notifications.length} notifiations</div>
        <ul>
          {this.state.cursors.feeds.map(this.renderFeed)}
        </ul>
      </div>
    );
  }
});
```

So here we see how simple it is to wire up state to a component. You bring in a mixin of the whole tree if you want to create multiple cursors, but you can also bring in a specific cursor to just grab that state. When changes are made to these cursors the component will automatically render again and the new values are available on the state object of the component, via a "cursors" or "cursor" property.

So how do you change the state in a Baobab tree?

### A state change layer
As we know from flux a component should not update the state of the application directly, there should be a different layer handling that. I am referring to actions and the dispatcher.

When using action creators with flux the state changes would happen when a component (or something else) triggers an action that in turn triggers dispatches to the store. The action creator method itself runs logic, typically async stuff, and possibly does multiple dispatches to the store.

```javascript

Architecture using traditional flux
  
            |-------------------------|
        |-- | Action (Action Creator) | <--|          
        |   |-------------------------|    |
        v                                  |
  |------------|     |--------|     |------------|
  | Dispatcher | --> | Stores | --> | Components |
  |------------|     |--------|     |------------|

```

With Baobab you get a bit more freedom. With a Baobab tree you already have an API for changing the state and trigger an update (change) event. In other words, you do not need to create methods to change the state like you would in a store. Also considering that you only have one state tree there is never a dispatch to a sequence of handlers. What I mean by that is that in Facebook flux you can have multiple stores that reacts to the same action dispatch. A **waitFor** method allows you to let other handlers run before the current one. This is not necessary with a Baobab tree. Also by having one state tree you prevent circular dependencies and you will always have one method describing the intent of a specific action. In my opionion this gives you a better overview of what happens when an action is triggered.

So to compare this with an architecture using Baobab it will look more like this:

```javascript

Architecture using Baobab
  
            |------------|
        |-> | State tree | --|           
        |   |------------|   |
        |                    v
  |---------|         |------------|
  | Actions | <------ | Components |
  |---------|         |------------|

```

The actions are the business logic of your application. Actions will probably depend on other modules to run business logic, like fetch for http request etc. But you state tree does not depend on anything. Your components will only depend on a single state tree, other components and maybe you have some helpers etc. This gives a very simple overview of how your application works. Lets expand and take another look:

```javascript

Architecture using Baobab
  
                             |------------|
                         |-> | State tree | --|           
                         |   |------------|   |
                         |                    v
                     |---------|         |------------|
 Q, fetch etc. --->  | Actions | <------ | Components | <-- ClassHelper etc.
                     |---------|         |------------|

```

As we can see the State tree is left all alone. It lives at the top of your application where actions changes it and components grab those changes from it, when notified. So let us move on to the "Actions" part of this architecture. There really is not much to it. It is just a module you define with methods that has access to the state tree. 

```javascript

var stateTree = require('./stateTree.js');

var actions = {
  addItem: function (item) {
    stateTree.select('items').push(item);
  }
};

module.exports = actions;
```

So this is a very simple action. Lets ut look at something a bit more complex, but before we do that lets talk about how you would structure the state of your application in a Baobab tree. 

### Application state
Traditionally I think we web developers has thought of state as a session object and/or entities in a database, and with good reason, that was all the state we had in traditional server side web applications. When more advanced web applications were developed in the client we got some new state we could control, application state. Application state is everything from your list of todos to UI loading state. So with Baobab, all state related to your application goes into the tree.

So how would you go about structuring this state in the tree? There are many ways to do this, and I can not tell you what is the best way to do it. That depends on the project and what you feel comfortable with. But I will give you some alternatives, as food for thought.

```javascript

var Baobab = require('baobab');
var stateTree = new Baobab({
  models: {
    notifications: [],
    contacts: []
  },
  views: {
    createContact: {
      isLoading: false
    }
  }
});
module.exports = stateTree;
```

In this setup we have chosen to split by models and views, which are our traditional state concepts in modern web applications. Anything related to entities are put in the *models* domain space and everything related to UI state is put into *views*. Models might not come to much of a surprise, but maybe views does. The reason you would want to define views is that you probably have many components building up one view. By putting this state into your state tree you ensure that any changes to those components, or the addition of new components, all relate to the tree. Not each other.

```javascript

var Baobab = require('baobab');
var stateTree = new Baobab({
  admin: {
    notifications: []
  },
  home: {
    posts: []
  }
});
```

In this setup we have chosen to split up the tree by sections of your application. I would suggest this kind of setup for larger applications. This will make it easy to let components that are part of specific sections of your application to listen for state changes they relate to, but again would allow for "cross section state". Maybe the home section would want to display the number of notifications. That would not be a problem.

```javascript

var Baobab = require('baobab');
var stateTree = new Baobab({
  notifications: []
});

module.exports = stateTree;
```

A third setup could be just adding state directly to the tree. This would be for smaller applications.

My message here is that there is no specific structure for building state. State structures differs as much as applications differs. But now you have a concept where you do not have to divide your state artifically to avoid circular dependencies, you do not have to use a **waitFor** method that makes your code harder to reason about and you can easily change the structure of your state as your application grows. That is great!

### A bit more complex example
A process I have become a fan of is boxing in your layout to define components. This is introduced in [Thinking in React](http://facebook.github.io/react/docs/thinking-in-react.html). What I noticed is that you can use this concept to also define your Baobab state tree. Let us use the "Thinking React" example to define the Baobab state tree, but let us also get that data from the server:

![Products](http://facebook.github.io/react/img/blog/thinking-in-react-components.png)

*stateTree.js*
```javascript

var Baobab = require('baobab');
var stateTree = new Baobab({
  query: '',
  onlyProductsInStock: false,
  products: []
});

module.exports = stateTree;
```

Our actions could look something like this:

*actions.js*
```javascript

var stateTree = require('./stateTree');
var ajax = require('ajax');
module.exports = {
  showOnlyProductsInStock: function () {
    stateTree.set('onlyProductsInStock', true);
  },
  showAllProducts: function () {
    stateTree.set('onlyProductsInStock', false);
  },
  searchProducts: function (query) {
    stateTree.set('query', query);
    ajax.get('/products', query)
      .done(function (products) {
        stateTree.set('products', products);
      });
  }
};
```

Thats it! We have pretty much created a "backend" for our components. An API our components can use to ask for changes, much like you would communicate with a backend API. The changes are reflected in the components by the authority of the state tree. What is kind of cool about this is that you can very easily store this state in local storage so the user will get right back to where they were coming back:

*main.js*
```javascript

var stateTree = require('./stateTree');
window.addEventListener("beforeunload", function(e){
   localStorage.state = JSON.stringify(stateTree);
}, false);
```

### Optimizing
A very nice feature with Baobab is that it lets you very easily control rendering. By adding two options to your Baobab instance React JS will only render components when it actually needs to.

```javascript

var Baobab = require('baobab');
var ReactAddons = require('react/addons');

var stateTree = new Baobab({
  notifications: []
}, {
  mixins: [ReactAddons.PureRenderMixin],
  shiftReferences: true
});

module.exports = stateTree;
```

These options does two important things.

1. The PureRenderMixin from React addons will ensure that the component will only render if the props passed to it or its own state has actually changed
2. When Baobab changes a value in the tree it will propagate up and give all objects and arrays new references. The Baobab tree is immutable in that sense. That way a shallow check by PureRenderMixin is enough to verify that a render is needed. The nice thing is... you do not have to think about it!

So why does this matter? Lets have a look at how React JS renders and you will see what these two options fix.

#### 1. React JS cascading renders
One important detail about React JS that is often overlooked is how **setState** on a component affects the nested components. When you use **setState** the nested components will run a check to verify if they need to update the DOM. That means if a change event is being listened to on your application root component and a change event is triggered from the store, all your components will do a render and a diff to produce any needed DOM operations. Lets visualize this:

```javascript

[Cascading render]

               |---|
               | X | - Root component renders
               |---|
                 |
            |----|---|
            |        |
          |---|    |---|
          | X |    | X | - Nested components also renders
          |---|    |---|
               
```

But if a nested component does a **setState** it will not affect parent components.

```javascript

[Cascading render]

               |---|
               |   | - Root component does not render
               |---|
                 |
            |----|---|
            |        |
          |---|    |---|
          |   |    | X | - Nested component renders
          |---|    |---|
               
```

This actually means that you could get away with only pointing to the state tree on the root component and then grab state directly from it in all other components, without attaching cursors. The drawback is that the whole application would render on all state changes.

#### 2. Repeated rendering
What is even more important to understand about **setState** is that using a general change event will not only cause cascaded rendering but will also cause repeated rendering in components. Let me explain:

```javascript

[Repeated rendering]

               |---|
               |   | - Root component listens to change
               |---|
                 |
            |----|---|
            |        |
          |---|    |---|
          |   |    |   | - Nested components listens to change
          |---|    |---|
               
```

When a change event now occurs the root component wil first trigger a render:

```javascript

[Repeated rendering]

               |---|
               | X | - Root component reacts to change event and rerenders
               |---|
                 |
            |----|---|
            |        |
          |---|    |---|
          | X |    | X | - Nested components render
          |---|    |---|
               
```

And after that, the nested components will actually rerender themselves again:

```javascript

[Repeated rendering]

               |---|
               |   |
               |---|
                 |
            |----|---|
            |        |
          |---|    |---|
          | X |    | X | - Nested components react to change event and rerenders
          |---|    |---|
               
```

Now if there were deeper nested components this would cause the same effect, but with even more repeated rendering due to each nested level causes an extra rerender.

Thankfully you do not have to worry about this at all when using Baobab.

### Isomorphic app
There is a lot of talk about isomorphic apps. An isomorphic app is able to render your application on the server and pass the complete HTML of it on the first request. Then React JS takes over on the client side. The examples shown this far is optimized for rendering on a "non-isomorphic" app. If you do want to explore this concept you would have to do something like this:

*client side*
```javascript

var React = require('react');
var stateTree = require('./stateTree.js');
var AppComponent = require('./AppComponent.js');
var renderApp = function () {
  React.render(<AppComponent state={stateTree.get()}/>, document.body);
};
stateTree.on('update', renderApp);
renderApp();

module.exports = AppComponent;
```

*server side*
```javascript

var React = require('react');
var defaultState = require('./defaultState');
var AppComponent = require('./AppComponent.js');

var html = React.renderToString(AppComponent({state: defaultState}));
// Pass html as response
```

This effectively passes a state prop through your top component. The top component then has to pass this further down to the other components. This can be tedious and you loose the optimized rendering. There are developments in React JS, like [withContext](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html), which might make this easier to handle. I do not have much experience with this, so please enlighten the readers in the comments below if you do :-)

### Summary
As stated in the beginning of this article flux is still evolving. I personally think Baobab has a lot to offer this evolution in regards of all the challenges mentioned. If you have any questions or comments, please fire away in the comments section below. You can read more about Baobab at [this repo](https://github.com/Yomguithereal/baobab) and take a look at this clip from ReactConf 2015, [Making your app fast with high-performance components](https://www.youtube.com/watch?v=KYzlpRvWZ6c&list=PLb0IAmt7-GS1cbw4qonlQztYV1TAW0sCr&index=9) that also highlights the issue in this article. Thanks for reading!
