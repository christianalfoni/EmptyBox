# The human like React framework Cerebral

I have been writing about React, Webpack, Flux and Flux like architectures for quite some time now. All these ideas and thoughts have been churning around in my head and after watching [this video](https://youtu.be/2HK4ENBPcWA) on how [Elm](http://elm-lang.org/) is able to control the state flow of your application everything just came together. I wanted to take what I have learned so far and build something that tries to solve all the challenges I have been writing about and at the same time bring something new to the table.

## Meet Cerebral
Cerebral is a framework. I call it a framework because it depends on React and brings in the missing piece, application state handling. Routing, http requests etc. are separate tools you choose based on what the project needs. What it always will need is a UI and application state handling. So that is the core of the framework.

**So why would you even consider Cerebral?** Before going into the thoughts behind Cerebral I want to point out that this is not another "FLUX framework" with its own take on actions, dispatchers and stores. I am certainly not dissing those frameworks, many of them are really great, but Cerebral is a new take on how to handle application state alltogether, but of course inspired by Flux and later solutions like [Baobab](https://github.com/Yomguithereal/baobab). So big thanks to all the brilliant people working on tools to make web application development more fun than frustrating!

### Thinking Cerebral

> If your application was a person, Cerebral would be the brain and the nervous system of that person

I want to give you an analogy for building web applications. Think of your application as different people having different responsibilities. Maybe you have one person responsible for a form, an other for the main menu and a third person is responsible for a list. This translates to **views** in an application. So a **view** is basically a person with a brain (the state) and a nervous system (events), and the body would be the UI. The user interacts with the **view** in different ways and events are processed to change state which in turn changes the UI. We can go all the way back to [Backbone]() for this type of behaviour.

Though this seems like a good way to manage interaction and state it has challenges. Imagine you are part of a development team of 5 people. It is very difficult to keep everyone in complete sync as interaction most often is "one to one". You might say something to one team member and later you realize that other team members should also be notified... but that is probably after something went wrong. This is the exact same problem with having multiple persons with their own brain and nervous system representing your application, or in web application terms, multiple views with their own state and event processing. You quickly loose control of communicating between them.

When FLUX and React JS came a long it basically said; *it is too complicated to have multiple persons representing your application, it should only be one person, with one brain and one nervous system*. This translates to the brain being your stores and actions being your nervous system. Indeed it is a lot easier to keep control of everything when the only person to blame is yourself, but the challenge with FLUX though is that this one person responsible for your application has a split personality. It is a single brain indeed, but that brain is divided into different sections... different stores. And these stores face the similar problems as they depend on each other and requires complex logic to share and update state.

**So what makes Cerebral different?** Cerebral is truly "one person" in this analogy. It has one brain (one object) with the state of the application, but it is even more inspired by our human anatomy. Lets keep using the analogy with an example. When you burn your finger, what happens? Does your finger tell your brain to move your arm? No, your finger sends a "fingerHeated" impulse to your brain, your brain processes this impulse and when it reaches a certain level it will put your brain in "move arm state" and the arm moves.

But let us now imagine that you burn your finger badly and it hurts, you do not just move your arm, you also scream. If your finger told your brain to move the arm, the finger would also tell the brain to scream. But you do not have just one finger, you have probably 10 fingers and all of them would have to "implement this logic". It would also have to keep the order correct, or you might scream before removing your arm burning your right hand fingers, but the opposite burning your left hand fingers. This is of course not how it works. The fingers just send an impulse and the brain processes these impulses which ultimately results in changed "state".

Cerebral has an implementation called **signals**. A signal is just like an impulse. It lets your components signal an interaction. This signal can be processed by multiple actions, but they all happen one after the other. So with our burned finger example you would always move your arm before screaming, or the opposite. The point is that it is consistent. A typical name for a signal in Cerebral is "inputChanged" or "formSubmitted". A signal indicates "what happened", not "what should happen". A good feature with signals is that they have functional benefits. You can add, remove, reuse and test actions very easily.

### What makes Cerebral so special
When writing a Cerebral app you should ideally not have any state at all in your components. Everything should be defined in **the cerebral**. This keeps Cerebral in complete control of your application state flow and this is an extremely powerful concept. First of all you get a strong concept of how to store and mutate state. Any mutation of state has to happen inside a signal or Cerebral will throw an error. And all state should be stored in one object. 

Secondly Cerebral is able to analyze the state flow and exposes an API to use that information. An example of using this information is the **Cerebral Debugger**. When developing an application with Cerebral you are able to use a debugger that displays signals sent and mutations performed. But not only that, you can remember! Using a slider you are able to move back in time, always seeing what signal and mutations caused the current state. That is extremely powerful stuff. You can imagine this information could be used for a lot of different things. Like user support, user tracking, notifications etc. It will be exciting to see what developers come up with!

## Lets get into some code
All examples will be in ES6 syntax. Lets quickly review the files we are going to work in.

```javascript

components/
  App.js
actions/
  setInputValue.js
  addListItem.js
cerebral.js
main.js
```

And finally some code.

### Create a Cerebral
*cerebral.js*
```javascript

import Cerebral from 'cerebral';

let cerebral = Cerebral({
  inputValue: '',
  list: []
});

export default cerebral;
```

We have defined just a couple of state values for our application. The text in an input and a list. Our application will just add text to the list as you hit enter in the input.

### Create a component
*components/App.js*
```javascript

import React from 'react';
import mixin from 'cerebral/mixin';

let App = React.createClass({
  mixins: [mixin],
  getCerebralState() {
    return ['inputValue', 'list'];
  },
  onInputValueSubmitted(event) {
    event.preventDefault();
    this.signals.inputValueSubmitted();
  },
  onInputValueChanged(event) {
    this.signals.inputValueChanged(event.target.value);
  },
  renderListItem(item, index) {
    return <li key={index}>{item}</li>;
  },
  render() {
    return (
      <div>
        <form onSubmit={this.onInputValueSubmitted}>
          <input
            type="text"
            value={this.state.inputValue}
            onChange={this.onInputValueChanged}/>
        </form>
        <ul>
          {this.state.list.map(this.renderListItem)}
        </ul>
      </div>
    );
  }
});

export default App;
```

So this is a typical React component. What to notice here is that we do not import anything related to cerebral except a mixin. This is because cerebral will be injected into the application and exposed on the context. This allows any component to hook on to the cerebral state, extract it and send signals to it. As you start to see now, Cerebral exists "inside" the body of the application, not outside it.

I would also like to mention that you can return an object from `getCerebralState()` instead. They keys will map to whatever key you want to use on the components state object and the value being the path to the state you want to extract from Cerebral.

### Inject the cerebral into the app
*main.js*
```javascript

import React from 'react';
import cerebral from './cerebral.js';
import App from './components/App.js';

import setInputValue from './actions/setInputValue.js';
import addListeItem from './actions/addListItem.js';

cerebral.signal('inputValueChanged', setInputValue);
cerebral.signal('inputValueSubmitted', addListItem);

let Wrapper = cerebral.injectInto(App);

React.render(<Wrapper/>, document.querySelector('#app'));
```
So we are doing two different things here. First of all we define the signals we are using in our App component. As you can see the naming is how you would name an impuls, "what happened", not "what should happen".

When injecting cerebral into the App component it will return a Wrapper. When not running in a production environment Cerebral will also insert the debugger into this wrapper. The debugger will show you the previous signal and the mutations done to the cerebral during that signal. The debugger also has a slider that lets you travel back in time and look at all signals and mutations done during the lifespan of the application.

### Creating actions
Your actions are run when the signal is received. They are run synchronously by default, but can also run asynchronously. The arguments passed to an action is the cerebral and optionally arguments passed with the signal. Whatever you return from an action will be passed to the next action, but beware, any objects will be frozen. You see, Cerebral runs in an immutable environment. Any state you extract from the cerebral can not be changed. This is what makes updates to the components so fast because there is no need for deep checking of changes. It also benefits Cerebrals ability to remember. You can not change the past, immutability makes sure of that.

*actions/setInputValue*
```javascript

let setInputValue = function (cerebral, value) {
  cerebral.set('inputValue', value);
};

export default setInputValue;
```
Cerebral has many different mehtods for mutating state, *set, push, concat, splice, merge, unset, pop* etc. The first argument of a mutation is always the path to the value you want to mutate. In the example above we use a string as we are changing the top level of the cerebral. For nested values you use an array. You can also pass retrieved state values as path to the mutation.

*actions/addListItem.js*
```javascript

let addListItem = function (cerebral) {
  cerebral.push('list', cerebral.get('inputValue'));
  cerebral.set('inputValue', '');
};

export default addListItem;
```
You get state from the cerebral using the `.get()` method. This takes a path, either a string or an array. As stated earlier these values are immutable, but you can easily make a mutable copy by running a `.toJS()` method on them.

## Complex state handling
So far Cerebral does not really bring much to the table other than a fancy debugger. Where it really starts to shine though is getting into complex state handling and asynchronous state handling.

### Asynchronous actions
One of the more difficult concepts to handle is asynchronous code. When Facebook intitially put FLUX into the wild there was a lot of discussions on where to put asynchronous code. In Cerebral you are not able to change state unless it is synchronously done from an action. So how do you change state with asynchronous code?

Let us imagine that the input value is the title of a todo and we want to send that todo to the server. As it is being sent we want to indicate on the todo that it is saving and we want to indicate that is has stopped saving when the server has responded. We also want to indicate any error. Let us create a signal first:

```javascript

cerebral.signal('inputValueSubmitted', addTodo, saveTodo, updateTodo);
```
And now let us create the actions.

```javascript

let addTodo = function (cerebral, title) {
  let todo = {
    ref: cerebral.ref(),
    title: title,
    completed: false,
    $isSaving: true
  };
  cerebral.push('todos', todo);
  return todo;
};
```
We create the todo object and give it a cerebral reference. These references are used to lookup objects in the cerebral whenever needed. We also add a `$isSaving` property to the todo. This is a convention I personally like and is not specific to Cerebral. All `$` properties are client side properties used to indicate the state of an object. It is very handy indeed. Finally we push the todo into the cerebral and then return it for the next action.

```javascript

import ajax from 'ajax';

let saveTodo = function (cerebral, todo) {
  return ajax.post('/todos', {
    title: todo.title,
    completed: todo.completed
  })
  .then(function () {
    return {
      ref: todo.ref,
      $isSaving: false
    };
  })
  .catch(function (error) {
    return {
      ref: todo.ref,
      $isSaving: false,
      $error: error
    };
  });
};
```
The first thing to notice here is that this imagined ajax library returns a **promise**. This is what indicates that an action is asynchronous. If a promise is returned it will wait for it to fulfill before it runs the next action in the signal. The resolved value will be passed as an argument. In this case we return an object with new/changed properties that we can merge.

But what about the debugger? It would not be a very good experience if you retraced your steps and these async actions would trigger new server requests. Well, they do not. Cerebral does not only remember the signals and mutations done, but also values returned from asynchronous actions. This means that when you look at previous state in the debugger it will all happen synchronously.

```javascript

let updateTodo = function (cerebral, updatedTodo) {
  let todo = cerebral.getByRef('todos', updatedTodo.ref);
  cerebral.merge(todo, updatedTodo);
};
```
And the last action now grabs the todo from the cerebral and uses it as a path to merge in the updated properties. What to notice here is that the `updateTodo()` method is quite generic. There might be other signals that also requires updating of a todo. You can use the same function for that. Also notice that synchronous functions are pure functions. That makes them very easy to test. Just pass an instance of a Cerebral whan calling them and verify that they make the changes and/or returns the value you expect.

### Facets
A different challenge with handling complex state is relational data. A typical example of this is that you load lots of data records, but only want to show some of them. You need one state for keeping the records and an other to indicate which ones to display. The best way to do this is using the id of the data record as a reference. But how do you expose the source data using this reference? Enough theory, lets see some code.

```javascript

let cerebral = Cerebral({
  projects: {},
  projectRows: []
});
```
So let us imagine that we have 100 projects in our projects map. The key of the project is its id. Now we want to show only 10 of them, but if anything changes in the projects map we want those changes also to show on the projects in the projectRows list. Let us first create a signal that will populate the projectRows list.

```javascript

let populateProjectRows = function (cerebral) {
  let projects = cerebral.get('projects');
  projects = Object.keys(projects).filter(function (key, index) {
    return index < 10;
  });
  cerebral.set('projectRows', projects);
};

cerebral.signal('projectsTableOpened', populateProjectRows);
```
Our component will use the `projectRows` state, but now it is filled up with ids. We want it to be filled up with projects. This is where facets comes to the rescue.

```javascript

cerebral.facet('projectRows', ['projects'], function (cerebral, ids) {
  let projects = cerebral.get('projects');
  return ids.map(function (id) {
    return projects[id];
  });
});
```
A facet transforms a path in the cerebral. It does not transform its input, but it transforms its output. The first argument is the path you want to change the output of. The second argument is any depending paths. As stated above, if anything changes on the source data we want it to be updated. The last argument is the function that runs when there is a change to the projects or the projectRows array. Any components using this state will of course also update.

### Even more complex state
So lets take this a step further. What if the projects has an authorId that references a specific user? Maybe we can use our facet to merge in that information?

```javascript

cerebral.facet('projectRows', ['projects', 'users'], function (cerebral, ids) {
  let projects = cerebral.get('projects');
  let users = cerebral.get('users');
  return ids.map(function (id) {
    let project = projects[id].toJS(); // Lets us mutate the project
    project.author = users[project.authorId];
    return project;
  });
});
```

But we can make this even more complex. What if the user is not in the client? Let take a look at what we can do about that.

```javascript

cerebral.facet('projectRows', ['projects', 'users'], function (cerebral, ids) {

  let projects = cerebral.get('projects');
  let users = cerebral.get('users');
  let missingAuthors = [];
  let projectRows = ids.map(function (id) {
    
    let project = projects[id].toJS();
    project.author = users[project.authorId];
    
    if (!project.author) {
      project.author = {
        $isLoading: true
      };
      missingAuthors.push(project.authorId);
    }
    
    return project;
  });

  if (missingAuthors.length) {
    cerebral.signals.missingAuthors(missingAuthors);
  }

  return projectRows;

});
```
I think this is one of the more complex situations of state handling we can meet as developers. Lets just go through that step by step:

1. The facet extracts the current projects and users
2. It prepares an array where missing author ids can be listed
3. When an author is not found the facet puts a temporary object to indicate the state of that data. Then it pushes the *authorId* to the missing authors array
4. When the projectRows are ready the facet checks if there are any missing authors and passes those on a signal that will most certainly to an ajax request fetching the users and inserting them into the *users* map. This will in turn run the facet again and now the data is available

## Summary
I hope I did an okay introduction to what Cerebral is able to do. The project is currently not running on any applications in production, but I was hoping you would want to try it out, give feedback and help me bring it to a stable release. I think we are just scratching the surface of what we are able to do when the framework has complete control of the state flow. I can not wait to see what new ideas might show up using Cerebrals ability to retrace its steps!

You can check out the project and documentation at the [cerebral repo](). It will guide you with introduction videos and a webpack boilerplate. 