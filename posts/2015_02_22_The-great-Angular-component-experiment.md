# The great Angular component experiment

My last months has been heavily devoted to understanding React JS and FLUX patterns. In parallell with this I have been helping out on an Angular project. Angular was chosen because the guy who got me involved is a Java developer, and of course he likes Angular. In these months working together there has been a lot of discussion on, "Why does Java developers love Angular?". I have given my cents on React JS, using components, and the one way flow of FLUX. The discussions has not been in the form of "one is better than the other", but despite his open mind, it was very difficult to explain what makes React JS and FLUX so great.

So I got this idea. What if I did an experiment. What if I found a way to make Angular use components heavyily inspired by React JS, and to boot, a strong FLUX pattern. Would the typical Angular developer see the benefits of React JS and FLUX? And even more interesting, could React JS and FLUX learn something from Angular?

### Enforcing the experiment
If you are an Angular developer you probably already know that the Angular team is encouraging you to use directives as a component concept, preparing you for the next versions of Angular where they will indeed use components. If not, read [this article](http://teropa.info/blog/2014/10/24/how-ive-improved-my-angular-apps-by-banning-ng-controller.html). You can also see an introduction to components in Angular 2 [here](https://www.youtube.com/watch?v=uD6Okha_Yj0).

React JS will have a huge impact on the JavaScript community, it already has really. It is not just a View layer for writing DOM. It is a generic JavaScript component concept that can be used to render anything. Canvas, WebGL, Gibbons (netflix TV platform), iOS native, Android native etc. FLUX on the other hand is a pattern for handling state. In my opinion it is currently evolving in the direction of being a single state store you "inject" into your main application component. This single injected state store and React JS allows you to render the whole application server side in an initial state and deliver it over the wire, where React JS takes over. It does not matter what UI technology is underneath, as what you send over the wire are the calculated operations needed to put your app in the correct state. That being an HTML string or a data structure for a native layer.

So to sum up. I want to bring React JS and FLUX concepts into Angular so that you can see the benefits in an environment an Angular developer can more easily relate to. It is also interesting to see how concepts in Angular actually merges quite well with FLUX. Maybe FLUX could take some inspiration from Angular? Last but not least I have been working on [flux-angular](https://github.com/christianalfoni/flux-angular) which could benefit from using the evolved FLUX pattern introduced here. Follow that discussion on [this issue](https://github.com/christianalfoni/flux-angular/issues/19).

### Nailing the concepts
First we have to settle on the concepts. At no surprise we will of course have a **component** concept. It will look a lot like a React JS component. But we also need the FLUX parts. Since Facebook released information on how they implement FLUX it has evolved quite a bit. I wrote an article about [Baobab](http://christianalfoni.github.io/javascript/2015/02/06/plant-a-baobab-tree-in-your-flux-application.html) which is a single event emitting and semi-immutable state tree. I will take those concepts and bring it into the experiment. This specifically results in an **actions** concept and a **store** concept.

You can play around with the experiment, try out the syntax and build something by going to [this repo](https://github.com/christianalfoni/the-angular-experiment). I encourage you to try it out, get into the mindset of components and FLUX. I promise it will at least give you inspiration on how you think about building applications. The demo application is the todomvc.com todo application.

### The requirements
There are a couple of things that Angular fundementally does differently, which we have to find a way to handle.

#### Immutability
There is one very important part we have to handle to make this experiement work. Completely immutable state in the store. So what does that mean? And why do we need it? Immutability, in this context, refers to that Angular, or you for that matter, can not change objects and arrays located in the stores directly. This solves two things. First of all it prevents Angulars two-way-databinding to interfere with our application state. With a FLUX pattern we need full control of state flow. Secondly it prevents Angular from changing application state with e.g. hashes in ng-repeat and yourself from making changes that will affect other parts of your application using the same state. 

The before mentioned Baobab is only semi-immutable, meaning that a change in the tree will indeed change references, but the state grabbed from the store can still be mutated and affected by other parts of your code. So what to do? 

I started looking at [Freezer](https://github.com/arqex/freezer), which is a great project. Freezer is the same concept as Baobab, a state tree, but at the same time is completely immutable. Whenever you do a change to the state tree, you get a completely new state tree. Though the concepts are great I met a couple of issues, so I decided to create my own [immutable-store](https://github.com/christianalfoni/immutable-store). It is running under the hood of this implementation and gives a very simpe API to change the state of your application, without allowing Angular or components interfere with that state. In other words, your app and UI state gets very predictable.

#### Monkeypatching
For this experiement to work it has to look like something the Angular team could have come up with themselves, if they had a split Google/Facebook personality :-) This means we will add three new methods to Angular modules, in addition to the existing controller, directive, factory, service etc. Those methods are: **component**, **actions** and **store**.

### Lets implement!
So first of all we need our component. Let me just throw the code down there and then we will go through some concepts:

```javascript

angular.module('app', ['experiment'])
  .component('myComponent', function () {
    return {
      message: 'I am a component',
      componentWillMount: function () {
        // Runs in the pre link lifecycle (before children are rendered)
      },
      componentDidMount: function () {
        // Runs in the post link lifecycle (after children are rendered)
      },
      render: function () {
        // Using the ES6 multiline syntax
        return `
          <h1>Hello world - {{message}}</h1>
        `;
      }
    };
  });
```

Using this component would look like this:

```javascript

<my-component></my-component>
```

What we have basically done here is wrap the generic and powerful directive concept into a component specific concept, inspired by React JS. Let us explore this component a bit more.

#### Changing internal state
To change the state of the component you can define a method, call it and just change the state. When changing the state of the component you do want it to render again. Two-way-databinding is powerful in that sense. With React JS you would have to specifically tell the component to update with a method. Take a look at the this example:

```javascript

angular.module('app', ['experiment'])
  .component('myComponent', function () {
    return {
      message: 'I am a component',
      color: 'red',
      flipColor: function () {
        this.color = this.color === 'red' ? 'blue' : 'red';
      },
      render: function () {
        return `
          <div>
            <h1 style="color: {{color}}">Hello world - {{message}}</h1>
            <button ng-click="flipColor()">Flip color</button>
          </div>
        `;
      }
    };
  });
```

And with React JS:

```javascript

var MyComponent = React.createClass({
  getInitialState: function () {
    return {
      message: 'I am a component',
      color: 'red'
    };
  },
  flipColor: function () {
    this.setState({
      color:  this.state.color === 'red' ? 'blue' : 'red'
    });
  },
  render: function () {
    return (
      <div>
        <h1 style={'color:' + this.state.color}>Hello world - {this.state.message}</h1>
        <button onClick={this.flipColor}>Flip color</button>
      </div>
    );
  }
});
```

#### Props (attributes)
```javascript

<my-component showMessage="{{true}}" message="Passing props to a component"></my-component>
```

And our component:

```javascript

angular.module('app', ['experiment'])
  .component('myComponent', function () {
    return {
      render: function () {
        return `
          <h1>
            Hello world 
            <span ng-if="props.showMessage" ng-click="logMessage(props.message)">
              - {{props.message}}
            </span>
          </h1>
        `;
      }
    };
  });
```

So we have the well known attributes concept here, but it works a bit differently. In React JS we call these attributes props and they are normal JavaScript expressions passed to the component. Angular requires you to hardwire this relationship with a "scope" definition in a directive. It is very confusing that some attributes are evaluated as JavaScript and some are not. In my opinion it is better to define this when passing the attribute, not receviving it. Now you clearly see what is JavaScript and what is just a string.

But where is **logMessage()** defined? This is where things start to become a bit interesting. The properties you add to your components in this experiement are attached to the scope of the component. The component pretty much IS what you earlier thought of as $scope. Now scope in Angular is actually a really cool concept. It creates a decoupled relationship between the components. What this means in practice is that if some component used **myComponent** defined above the component would only need to define a **logMessage** method and it could be used. Let me show you:

```javascript

angular.module('app', ['experiment'])
  .component('myParent', function () {
    logMessage: function (message) {
      console.log(message); // Will log: "whatup"
    },
    render: function () {
      return `
        <my-component showMessage="{{true}}" message="whatup"></my-component>
      `;
    }
  })
  .component('myComponent', function () {
    return {
      render: function () {
        return `
          <h1>
            Hello world 
            <span ng-if="props.showMessage" ng-click="logMessage(props.message)">
              - {{props.message}}
            </span>
         </h1>
        `;
      }
    };
  });
```

What is not so good about this is that it is harder to reason about how the **logMessage** method is being called. I would prefer passing the function as a prop just like React JS, but that is not possible with Angular without the reverted hard wiring we want to avoid.

React JS has pretty much the exact same syntax, though it is transpiled into normal JavaScript. No parsing and evaluating, but you do have to pass the callback:

```javascript

<my-component showMessage={true} message="Passing props to a component" logMessage={this.logMessage}></my-component>
```

And you would build your component something like this. Allowing for more of a traditional JavaScript mindset.

```javascript

var MyComponent = React.createClass({
  renderMessage: function () {
    return (
      <span onClick={this.props.logMessage.bind(null, this.props.message)}>
        - {this.props.message}
      </span>
    );
  },
  render: function () {
    var message = this.props.showMessage ? this.renderMessage() : null;
    return (
      <h1>Hello world {message}</h1>
    );
  }
});
```

So this shows you clearly that React JS is "JavaScript first". You solve dynamic behavior of your UI using traditional JavaScript, not HTML attributes. This is also partly the reason why React JS is so fast.

#### Building a small app
So now we have begun to look into how a component works. Now let us see why components are great! Let us create, yes, a todo application. What we need first is our main app component. I will be writing the HTML inside the components, which you would do with React JS. I hope this will show you why it is a good idea to have your tightly connected HTML with the component logic. I will be using ES6 multiline string to write the HTML. This is to give you an impression of how it would look like using React JS where you actually would write HTML (JSX).

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () {
    return {
      render: function () {
        return `
          <div>
            <h1>My awesome Todo app</h1>
            <todo-creator></todo-creator>
            <todo-list></todo-list>
          </div>
        `;
      }
    };
  });
```

Our first component is our wrapper for the application. It holds the title and fires up two other components.

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () { ... })
  .component('todoCreator', function () {
    return {
      title: '',
      createTodo: function () {
        // Add todo coming soon...
        this.title = '';
      },
      render: function () {
        return `
          <form ng-submit="createTodo()">
            <input ng-model="title"/>
          </form>
        `;
      }
    };
  });
```

So now we have created a completely isolated component. It does not depend on anything and you can use it as many times as your want throughout your application. Or just move it somewhere else, if you wanted to. Now you start to see how small these components are. The fear of putting lots of HTML inside your JavaScript is not really valid when you think **components**. They are small, pure and specific.

Moving on to the list:

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () { ... })
  .component('todoCreator', function () { ... })
  .component('todoList', function () {
    return {
      render: function () {
        return `
          <ul>
            // Todos coming soon...
          </ul>
        `;
      }
    };
  });
```

And now lets create a component for each todo. Again, we see how the scope helps us create a relationship between parent and child components. When we insert the **todoItem** below with ng-repeat on our todos, Angular implicitly creates a scope for each **todoItem** component. Think of it as Angular pre-attaching **todo** and **$index**. So we can just start using it:

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () { ... })
  .component('todoCreator', function () { ... })
  .component('todoList', function () { ... })
  .component('todoItem', function () {
    return {
      remove: function () {
        // Removing a todo coming
      },
      toggle: function () {
        // Toggling a todo coming
      },
      render: function () {
        return `
          <li>
            <input 
              type="checkbox" 
              ng-checked="todo.completed" 
              ng-click="toggle(todo)"
            /> {{todo.title}} <button ng-click="remove(todo)">remove</button>
          </li>
        `;
      };
    };
  });
```

So now you see how we think very differently than one would traditionally with Angular. We are thinking each part of our application as a very focused and isolated component, instead of thinking our application as a piece of HTML and adding behavior to it. It is more JavaScript first, than HTML first. Our render methods are returning a UI tree description which happens to be HTML. If we used React JS it would use this render method several times to figure out if the returned tree had changed. When changes are detected a specific operation to sync that change with the actual UI layer would be triggered. This is not possible with Angular of course, but now you start to see why React JS is so extremely fast.

### Store
So what about our todos? Where do we want to put them? In traditional Angular you would probably put them into a controller, or maybe a service if you are thinking scalability. We are going to use a concept called a store. A store holds some state for a section of your application and acts like a branch on the application state tree. This allows you to access any state anywhere in your application and you can prepare all the state on your server on the initial load. Just put it into the application state tree and you are ready to go. 

Think of the state tree as the puppet master of your application, and the components as puppets. You should be able to force any UI state in your application just by changing properties in the state tree.

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () { ... })
  .component('todoCreator', function () { ... })
  .component('todoList', function () { ... })
  .component('todoItem', function () { ... })
  .store('todos', function () {
    return {
      list: []
    };
  });
```

Thats it! We have now made `todos.list` available to all current and future components, but none of them are able to change either the list or the todos directly. Lets take a look at how we use this state in our todos list:

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () { ... })
  .component('todoCreator', function () { ... })
  .component('todoList', function () {
    return {
      render: function () {
        return `
          <ul>
            <todo-item ng-repeat="todo in todos.list track by $index"></todo-item>
          </ul>
        `;
      }
    };
  })
  .component('todoItem', function () { ... })
  .store('todos', function () { ... });
```

As we learned each component in the ng-repeat will have **todo** and **$index** attached to it. This means that the todo is available inside the **todo-item** component.

### Actions
So lets look at how we would change the state of our store. In this experiment we are exposing a new method on the angular module called **actions**. It is pretty much just a factory:

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () { ... })
  .component('todoCreator', function () { ... })
  .component('todoList', function () { ... })
  .component('todoItem', function () { ... })
  .store('todos', function () { ... })
  .actions('todosActions', function (flux) {
    return {
      add: function (title) {
        var store = flux.get();
        store = store.todos.list.push({
          title: title,
          completed: false
        });
        flux.set(store);
      },
      remove: function (todo) {
        var store = flux.get();
        store = store.todos.list.splice(store.todos.list.indexOf(todo), 1);
        flux.set(store);      
      },
      toggle: function (todo) {
        var store = flux.get();
        
        // The todo is an object from the store. All mutations on store
        // objects returns the store
        store = todo.set('completed', !todo.completed);
        flux.set(store);
      }
    };
  });
```

And now let us update components using the actions:

```javascript

angular.module('TodoMVC', ['experiment'])
  .component('todoMvc', function () { ... })
  .component('todoCreator', function (todoActions) { 
    return {
      title: '',
      createTodo: function () {
        todoActions.add(this.title);
        this.title = '';
      },
      render: function () {
        return `
          <form ng-submit="createTodo()">
            <input ng-model="title"/>
          </form>
        `;
      }
    };
  })
  .component('todoList', function () { ... })
  .component('todoItem', function (todoActions) { 
    return {
      remove: function (todo) {
        todoActions.remove(todo);
      },
      toggle: function (todo) {
        todoActions.toggle(todo);
      },
      render: function () {
        return `
          <li>
            <input 
              type="checkbox" 
              ng-checked="todo.completed" 
              ng-click="toggle(todo)"
            /> {{todo.title}} <button ng-click="remove(todo)">remove</button>
          </li>
        `;
      };
    }; 
  })
  .store('todos', function () { ... })
  .actions('todosActions', function () { ... });
```

So there we have it. Our application using components and an immutable state tree.

### Summary
If you are an Angular developer I hope this little experiment gave you some insight into why React JS developers loves thinking components. Angular 2 will have a very similar component concept, though they will still rely on templates. In my opinion you are missing out on one of the really good parts of components. Having UI logic and description in one and the same file. That said, maybe Angular has a different "team target". It is of course easier for a team with split HTML/CSS knowledge and JavaScript knowledge to build Angular apps. But as the complexity of web applications will just increase, I think a pure HTML/CSS developer will be a thing of the past. Hopefully Angular 2 will allow JSX, or at least something similar.

If you know a bit about React JS and specifically FLUX it is interesting to look at Angulars $rootScope. You can "inject" state at the top of your application and make it available to all components. This is something React JS is not able to do. You have to pass that "injected state" as properties down through your components, making them very dependant of each other. The challenge with bringing a "scope concept" into React JS though is that you might have a parent component that depends on one state, and a child component depending on an other. Since rendering a component is determined by a change in the dependent state you would get into situations where the child would not update, due to the parents state did not change. Hopefully some very smart people at Facebook is working on this :-)

Okay, so thanks for going through this experiement and hopefully it had some value to you!

