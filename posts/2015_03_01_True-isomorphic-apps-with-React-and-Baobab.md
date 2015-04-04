# True isomorphic apps with React and Baobab

So this little library Baobab continues to surprise me. The [previous article](http://christianalfoni.github.io/javascript/2015/02/06/plant-a-baobab-tree-in-your-flux-application.html) I wrote on this used a strategy where you would lock up all your components, but have a dependency to the state tree of the application in each component that needed it. The individual components could point cursors into the state tree, allowing the component to extract state from the state tree and render itself whenever the cursor notified about a change. This optimized the rendering of React JS and gave a very good FLUX structure to your application.

When going isomorphic though... wait, let me explain what an isomorphic app is before we move on. Typically with a single page application you pass only som basic HTML and script tags on the initial page request. When the page and scripts load, your application starts. You probably have a loader indicating the scripts loading, or if not, just a white screen. This might not seem like such a big problem, but it is. Visitors on your page or application really does not like waiting, not even for a few hundred milliseconds. The google bot collecting page information does not like this either. It requires a complete HTML page to be served when hitting your URL.

So, when going isomorphic, you will actually render your application on the server and deliver it along with your base HTML and script tags. That way the user will instantly see content. React JS is especially elegant in handling this because it will piggy back the existing HTML. What I mean is that when React JS has loaded and you render your application again on the client it will notice that the existing HTML on the page is rendered by React on the server. So instead of doing a normal render, it will just register event listeners etc.

### Why change Baobab strategy?
When loading the application components on the server it will load all the dependencies of each component also. If you are depending on business logic, like some module that changes the state of the tree, that module will probably have its dependencies too. What you end up with is loading your whole client side application on the server, when you only wanted to load the components. This could get you into trouble. There is also a matter of trying to find a way to isolate components to a level where they really are just components.

### The current injecting possibilities with React
There are two strategies to injecting state into your application. The first one is using props and the other is using context.

#### Props
```javascript

var Baobab = require('baobab');

var store = new Baobab({
  items: []
}, {
  shiftReferences: true
});

var AppComponent = React.createClass({
  render: function () {
    return (
      <h1>Hello app, you have {this.props.store.items.length} left</h1>
    );
  }
});

var render = function () {
  React.render(<AppComponent store={store.get()})/>, document.body);
};
store.on('update', render);
```

Okay, so now we are passing the complete store down to our components and whenever the tree changes, we pass it down again. Since the store shifts references up the tree when a change is done, we can safely use the **PureRenderMixin** on our components. But we have a problem.

Imagine all the sub components that makes up your app. Most of them will need access to this store object. They can only get that access if their parent passes it down. This pretty much means that all your components has to pass a **store** prop down to its children. That is a lot of work and it couples your components, which is not ideal.

#### Context
A different strategy is using something called a context. Now, this is not very well documented, but good research is done with [this article](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html). **withContext** is deprecated in favor of using **getChildContext**. Lets have a look at that:

```javascript

var Baobab = require('baobab');

var store = new Baobab({
  items: []
}, {
  shiftReferences: true
});

var WrapperComponent = React.createClass({
  childContextTypes: {
    store: React.PropTypes.object
  },
  getChildContext: function () {
    return {
      store: this.props.store
    };
  },
  render: function () {
    return <AppComponent/>
  }
});

var AppComponent = React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },
  render: function () {
    return (
      <h1>Hello app, you have {this.context.store.items.length} left</h1>
    );
  }
});

var render = function () {
  React.render(<WrapperComponent store={store.get()})/>, document.render);
};
store.on('update', render);
```

As you can see we use a wrapper that sets a context for the application. Any sub component, regardless of their parent, can use the **contextTypes** property and extract the store. That is great! We have removed the need to pass the store down as properties. But we have a problem.

In the [Q&A at react-conf 2015](https://www.youtube.com/watch?v=EPpkboSKvPI&index=20&list=PLb0IAmt7-GS1cbw4qonlQztYV1TAW0sCr), around 09:00, there is a question about context. The answer does not flesh out exactly why it is a bad idea, but I think I know why. The problem is two fold, but they are both related to using PureRenderMixin.

1. The PureRenderMixin does not check if the values on the context object has changed, making it unable to verify that a render is necessary
2. A parent component might not be using the context, but the child does. If the parent uses PureRenderMixin it will not render the child when the context updates

A third challenge to mention here, which exists both using **props** and **context**, is that we loose the possbility to just render components that actually needs to update. The store is injected from the top on every change.

### So can we get the best of both worlds?
I will go through this section showing how this works on the client and server in parallell. Lets get going.

#### The injected state
We will not inject the state the same way on the client and the server. On the client we will inject the Baobab tree itself, but on the server we will just inject a plain object. Lets see it in action:

*client*
```javascript

var React = require('react');
var Baobab = require('baobab');
var WrapperComponent = require('./AppWrapper.js');

var store = new Baobab({
  items: []
}, {
  shiftReferences: true
});

// As you can see we are not using store.get(), but passing the actual store
React.render(<WrapperComponent store={store})/>, document.render);
```

*server*
```javascript

var React = require('react');
var WrapperComponent = require('./app/AppWrapper.js');

// We just create a normal object and inject that
var store = {
  items: []
};

// We will see later what we will do with this html
var html = React.renderToString(<WrapperComponent store={store})/>);
```

#### How the wrapper exposes the context
Now, this works exactly the same on the server and client.

*WrapperComponent.js*
```javascript

var React = require('react');
var AppComponent = require('./AppComponent.js');

var WrapperComponent = React.createClass({
  childContextTypes: {
    store: React.PropTypes.object
  },
  getChildContext: function () {
    return {
      store: this.props.store
    };
  },
  render: function () {
    return <AppComponent/>
  }
});
module.exports = WrapperComponent;
```

The wrapper component will expose either the Baobab state tree itself or just a plain object, depending on it being the client or the server.

#### A mixin to extract state
As we know from the [existing mixins](https://github.com/Yomguithereal/baobab#react-mixins) for Baobab it is possible to extract state by using a cursors object defined on the component itself. Since we are using the Baobab state tree a bit differently here, we have to create a new mixin. I actually created a [pull request](https://github.com/Yomguithereal/baobab/pull/107) for this. It ended up in a discussion that brings up a different approach. It uses an application event hub to decouple business logic from the components. I encourage you to check it out! But now lets see how we use the mixin on a component

*SomeComponent.js (client and server)*
```javascript

var React = require('react');
var ContextMixin = require('./ContextMixin.js');

var SomeComponent = React.createClass({
  mixins: [ContextMixin],
  cursors: {
    list: ['admin', 'list']
  },
  render: function () {
  
    // Notice we point to the state and not the context
    return (
      <h1>There are {this.state.list.length} items in this list</h1>
    );
  }
});
module.exports = SomeComponent;
```

The only thing we depend on is the mixin. As the state tree is injected into the context of our application there is no direct dependency to it. The mixin will move the value from the context to the state of the component to allow PureRenderMixin to do its work.

And now how the mixin actually works:

*ContextMixin.js*
```javascript

var React = require('react/addons');

// We have to know if we are on the client or the server
var isBrowser = !(global && Object.prototype.toString.call(global.process) === '[object process]');

var ContextMixin = {
  
  // We add the PureRenderMixin for optimized rendering
  mixins: [React.addons.PureRenderMixin],
  
  // We grab the store from the context
  contextTypes: {
    store: React.PropTypes.object
  },
  componentWillMount: function () {

    if (!this.context || !this.context.store) {
      throw new Error('You have to pass a store to you app wrapper');
    }
    
    // If no cursors present, just return
    if (!this.cursors) {
      return;
    }

    // Prepare a map of listeners to
    // state update
    this.subscriptions = {};
    
    // This is where we create subscriptions to cursors so that
    // the component knows about changes
    var component = this;
    var createSubscription = function (key, cursor) {
      return function (value) {
        var state = {};
        state[key] = cursor.get();
        component.setState(state);
      };
    };

    // We go through the cursors
    var state = {};
    Object.keys(this.cursors).forEach(function (cursorKey) {

      // If we are in the browser we move the current state of the
      // cursor over to the state object, using the key defined on
      // the cursor as the key on our state object. We also register
      // a listener for state changes
      if (isBrowser) {

        var cursor = this.context.store.select(this.cursors[cursorKey]);
        var callback = createSubscription(cursorKey, cursor)
        state[cursorKey] = cursor.get();
        this.subscriptions[cursorKey] = {
          cursor: cursor,
          callback: callback
        };
        cursor.on('update', callback);

      // If we are on the server we use the same cursor path defined.
      // But instead of using the Baobab API, we use the path to drill 
      // into the state object and set the state
      } else {

        var path = this.cursors[cursorKey];
        var value = path.reduce(function (contextPath, pathKey, index) {
          return contextPath[pathKey];
        }, this.context.store);
        state[cursorKey] = value;

      }

    }, this);
    
    // Then we actually put that state on the component
    this.setState(state);

  },
  
  // Unregisters listeners of state change
  componentWillUnmount: function () {
    Object.keys(this.subscriptions).forEach(function (subscription) {
      this.subscriptions[subscription].cursor.off('update', subscription.callback);
    }, this);
  }
};
module.exports = ContextMixin;
```

### The complete flow
Now let us take a look at the complete flow from server to client. We are going to use the jsx file extension as we want to use components on the server too. The benefit of using the jsx extension is that node will only transpile jsx files, not normal js files. Let us first look at the index.html file that we want to load up:

*index.html*
```javascript

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    {{APP}}
    <script>
      window.store = {{STORE}}
    </script>
    <script src="app.js"></script>
  </body>
</html>
```

We create a placeholder for where we want to put the HTML of our app. We also put the state we created on the global window object. This allows our client store to grab that state and that way being in sync. We will see this soon.

*server.js*
```javascript

// We make jsx syntax available to node
require('node-jsx').install({extension: '.jsx'})

var express = require('express');
var fs = require('fs');
var path = require('path');
var React = require('react');

// We use a factory as our main server file does not support JSX, 
// only required files
var AppWrapper = React.createFactory(require('./app/AppWrapper.jsx'));

// We fire up an express server
var app = express();

// We read the contents of an HTML file we have
var index = fs.readFileSync(path.resolve(__dirname, 'index.html')).toString();

app.get('/', function (req, res) {

  // First we build up the contents of the store. This could be 
  // fetching database stuff or whatever
  buildStoreContent()
    .then(function (store) {
    
      // We render the application to an HTML string, passing in the store
      var app = React.renderToString(AppWrapper({store: store}));
      
      // We replace our placeholders with both the app html itself and the 
      // state of the store. You might prefer loading the store state with 
      // ajax after initial page load in case it is quite large. It is a 
      // balance you have to decide
      var html = index
        .replace('{{APP}}', app)
        .replace('{{STORE}}', JSON.stringify(store));
      
      res.type('html');
      res.send(html);
    });

});
app.listen(3000);
```

So when our client now goes to `localhost:3000` the HTML responded will have the HTML of our app and a store object containing the state it was based upon. The browser will also load up `app.js`. This is a bundled file using either browserify or webpack, so let us look at the main entry file:

*main.js (entry point bundled into app.js)*
```javascript

var React = require('react');
var Baobab = require('baobab');

// Coponent uses our ContextMixin
var WrapperComponent = require('./app/WrapperComponent.jsx');

// We grab the state from the window
var store = new Baobab(window.store, {
  shiftReferences: true
});

React.render(<WrapperComponent store={store}/>, document.render);
```

So when our `app.js` file launches it will do the exact same thing as the server did, only with a Baobab store instead. The beauty of it is that React JS understands that the current HTML is part of the application. It will basically just wire up the listeners to the store, and do updates when the store has a change. The really cool thing about this is that the components listens to the store completely decoupled from their parent components. This means that the rendering of the application is still as optimized as the strategy explained in the previous article.

### Changing the state of the store with actions
But how do we actually go about changing the state of our store from within the components? It would not be a good idea to give each component a dependency to the store, as that is actually what we wanted to avoid. Well, why not use the context? Actions will never be triggered on the server side. They are triggered when the user interacts with the application or some other client module interacts with the store, maybe a websocket service. So how would we do this? Let us extend our wrapper and mixin to also handle actions:

*WrapperComponent.jsx*
```javascript

var React = require('react');
var WrapperComponent = React.createClass({
  childContextTypes: {
    store: React.PropTypes.object,
    actions: React.PropTypes.object
  },
  getChildContext: function () {
    return {
      store: this.props.store,
      actions: this.props.actions
    };
  },
  render: function () {
    return <AppComponent/>
  }
});
module.exports = WrapperComponent;
```


*ContextMixin*
```javascript

var React = require('react/addons');
var isBrowser = !(global && Object.prototype.toString.call(global.process) === '[object process]');

var ContextMixin = {
  mixins: [React.addons.PureRenderMixin],
  
  // Adding actions
  contextTypes: {
    store: React.PropTypes.object,
    actions: React.PropTypes.actions
  },
  componentWillMount: function () {

    if (!this.context || !this.context.store) {
      throw new Error('You have to pass a store to you app wrapper');
    }
    
    // We reference the actions on the component itself, to
    // shorten the syntax. this.actions, instead of this.context.actions
    this.actions = this.context.actions;
    
    // ... rest of mixin

  },
  componentWillUnmount: function () { ... }
};
module.exports = ContextMixin;
```

Okay, so now we are able to pass actions down through our components. We do not have to do any changes on the server, as actions will not be triggered there. But let us pass some actions on our client, looking at our entry point file again:

*main.js (entry point bundled into app.js)*
```javascript

var React = require('react');
var Baobab = require('baobab');
var WrapperComponent = require('./WrapperComponent.jsx');

// Just looking at window.store
window.store; // { list: [] }

// We grab the state from the window
var store = new Baobab(window.store, {
  shiftReferences: true
});

// We create an action to update the store
var actions = {
  addItem: function (item) {
    store.select('list').push(item);
  }
};

// And we pass those actions down
React.render(<WrapperComponent store={store} actions={actions}/>, document.render);
```

So inside our **WrapperComponent** somewhere we have a component that wants to trigger our **addItem** action. Lets imagine:

*ListComponent.jsx*
```javascript

var React = require('react/addons');
var ContextMixin = require('./ContextMixin.js');

var ListComponent = React.createClass({
  mixins: [ContextMixin, React.addons.LinkedStateMixin],
  cursors: {
  
    // We grab the list from the store and put as "list"
    // on the components state object. We also listen to
    // any changes to this list value
    list: ['list']
  },
  
  // We return an initial state for our input that
  // will be the interaction of adding a new item to
  // the list
  getInitialState: function () {
    return {
      title: ''
    };
  },
  
  // We just point to this.actions and run
  // the method
  addItem: function () {
    this.actions.addItem(this.state.title);
    this.setState({
      title: ''
    });
  },
  renderItem: function (item) {
    return <li>{item}</li>
  },
  render: function () {
    return (
      <div>
        <form onSubmit={this.addItem}>
          <input valueLink={this.linkState('title')}/>
        </form>
        <ul>
          {this.state.list.map(this.renderItem)}
        </ul>
      </div>
    );
  }
});

module.exports = ListComponent;
```

As we can see, using the mixin, we can point to actions on the component itself. This rather than `this.context.actions`. If your application has a lot of actions you could namespace them `this.actions.todos.add`, `this.actions.notifications.fetch` etc.

### Summary
In my opinion this is exactly how I want to build my apps. I want to inject state on the server and render the application there, but still allow for highly optimized rendering on the client. I want my components to be as pure as possible and depend on as little as possible. Everything components needs to know about, they know through the context they are running in. 

I have used this technique on a project I am working on called [EmptyBox](https://github.com/christianalfoni/EmptyBox). It is a hackable blog service using React JS. It also has some other cool features you can not achieve without React JS.

To see a more simple example using this technique you can check out [this repo](https://github.com/christianalfoni/isomorphic-react-baobab-example).

Please feel free to use the mixin documented here or check out the alternative strategy explained in the [pull request](https://github.com/Yomguithereal/baobab/pull/107). Thanks for reading!
