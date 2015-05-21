# Cerebral developer preview

I have been writing about React, Webpack, Flux and Flux like architectures for quite some time now. All these ideas and thoughts have been churning around in my head and after watching [this video](https://youtu.be/2HK4ENBPcWA) on how [Elm](http://elm-lang.org/) is able to control the state flow of your application everything just came together. I wanted to take what I have learned so far and build something that tries to solve all the challenges I have been writing about and at the same time bring something new to the table.

## Meet Cerebral

![People](/images/cerebral.png)

Cerebral is a framework. I call it a framework because it has the bare necessities of what you need to build an application. It provides concepts for handling application state and depends on React for its UI. Routing, http requests etc. are separate tools you choose based on what the project needs. Technically Cerebral does not need React to work, and there is an open issue for discussion on how Cerebral could be used with other frameworks: [Should Cerebral be independent of React?](https://github.com/christianalfoni/cerebral/issues/3)

**So why would you even consider Cerebral?** Before going into the thoughts behind Cerebral I want to point out that this is not another "FLUX framework" with its own take on actions, dispatchers and stores. I am certainly not talking down those frameworks, many of them are really great, but Cerebral is a new take on how to handle application state alltogether. It is inspired by Flux and more recent solutions like [Baobab](https://github.com/Yomguithereal/baobab). So big thanks to all the brilliant people working on tools to make web application development more fun than frustrating!

### Thinking Cerebral

> If your application was a person, Cerebral would be the brain and the nervous system of that person

I want to give you an analogy for building web applications. Think of your application as different people having different responsibilities. Maybe you have one person responsible for a form, an other for the main menu and a third person is responsible for a list. This translates to **views** in an application. So a **view** is basically a person with a brain (the state) and a nervous system (events), and the body would be the UI. The user interacts with the **view** in different ways and events are processed to change state which in turn changes the UI. We can go all the way back to [Backbone](http://www.backbonejs.org) for this type of behaviour.

![People](/images/people.png)

Though this seems like a good way to manage interaction and state, it does have its challenges. Imagine you are part of a development team of 5 people. It is very difficult to keep everyone in complete sync as interactions most often is "one to one". You might say something to one team member and later you realize that other team members should also be notified... but that is probably after something went wrong. This is the exact same problem with having multiple persons with their own brain and nervous system representing your application, or in web application terms, multiple views with their own state and event processing. You quickly loose control of communicating between them.

When FLUX and React came a long it basically said; *it is too complicated to have multiple persons representing your application, it should be one person, with one brain and one nervous system*. This translates to the brain being your stores and the dispatcher and actions being your nervous system. Indeed it is a lot easier to keep control of everything when there is only one person to blame, but the challenge with FLUX though is that this one person responsible for your application has a split personality. It is a single brain indeed, but that brain is divided into different sections... different stores. And these stores face similar problems as they depend on each other and requires complex logic to share and update state.

**So what makes Cerebral different?** Cerebral is truly "one person" in this analogy. It has one brain (one object) with the state of the application, but it shares even more with our human anatomy. Lets keep using the analogy with an example. When you burn your finger, what happens? Does your finger tell your brain to move your arm? No, your finger sends a "fingerHeated" impulse to your brain, your brain processes this impulse and when it reaches a certain level of heat it will put your brain in "move arm state" and the arm moves.

But let us now imagine that you burn your finger badly and it hurts, you do not just move your arm, you also scream. If your finger told your brain to move the arm, the finger would also tell the brain to scream. But you do not have just one finger, you probably have 10 fingers and all of them would have to "implement this logic". They would also have to keep the order correct, or you might scream before removing your arm burning your right hand fingers, but the opposite burning your left hand fingers. This is of course not how it works. The fingers just sends impulses and the brain processes these impulses which ultimately results in changed "state".

Cerebral has an implementation called **signals**. A signal is just like an impulse. It lets your components signal an interaction. This signal can be processed by multiple actions, but they all happen one after the other. So with our burned finger example you would always move your arm before screaming, or the opposite. The point is that it is consistent. A typical name for a signal in Cerebral is "inputChanged" or "formSubmitted". A signal indicates "what happened", not "what should happen". A good feature with signals is that they have functional benefits. You can add, remove, reuse and test actions very easily.

### What makes Cerebral so special
When writing a Cerebral app you should ideally not have any state at all in your components. Everything should be defined in **the cerebral**. This keeps Cerebral in complete control of your application state flow and this is an extremely powerful concept. First of all you get a strong concept of how to mutate state. Cerebral will actually throw an error if you try to mutate state outside a signal. You also have a strong concept of where to define the state, as a single object passed to the cerebral instance. 

Second Cerebral is able to analyze the state flow and exposes an API to use that information. An example of using this information is the **Cerebral Debugger**. When developing an application with Cerebral you are able to use a debugger that displays signals sent and mutations performed. But not only that, you can remember! Using a slider you are able to move back in time, always seeing what signal and mutations caused the current state. That is extremely powerful stuff. You can imagine this information could be used for a lot of different things. Like user support, user tracking, notifications etc. It will be exciting to see what developers come up with! Take a look at the following video to see how the debugger works: [Cerebral - The debugger](https://www.youtube.com/watch?v=Fo86aiBoomE).

A last thing to mention is that a signal runs between animation frames and automatically measures the time it takes to run all the mutations. It also measures the time it takes for your components to retrieve these state updates as an "update" event is triggered synchronously at the end of all signals. This is displayed in the debugger and makes it easy to get a grip on how your application performs. It is more predictable and performant to trigger an "update" event at the end of a signal rather than manually do so for each mutation, which is common in traditional FLUX architecture.

## Lets get into some code
I want to start this off with a rant. I am sick and tired of framework presentations that shows you how to do the exact same thing with just different syntax. We know how to build a TODO app by now. What we need is to control the state flow of complex applications, handle things like optimistic updates, asynchronous code and relational state. That said we are going to start off with a simple example to get to know Cerebral, then we will move on to the complex stuff.

Lets quickly review the files we are going to work in.

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

So this is a typical React component. What to notice here is that we do not import anything related to our cerebral instance, just a mixin. This is because the cerebral instance will be injected into the application and exposed on the context. This allows any component to hook on to the cerebral state, extract it and send signals to it. As you start to see now, Cerebral exists "inside" the body of the application, not outside it.

I would also like to mention that you can return an object from `getCerebralState()` instead. The keys will map to whatever key you want to use on the components state object and the value being the path to the state you want to extract from the cerebral instance.

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
So we are doing two different things here. First of all we define the signals we are using in our App component. As you can see the naming is how you would name an impulse, "what happened", not "what should happen".

When injecting cerebral into the App component it will return a Wrapper. When not running in a production environment Cerebral will also insert the debugger into this wrapper. The debugger will show you the previous signal and the mutations done to the cerebral during that signal. The debugger also has a slider that lets you travel back in time and look at all signals and mutations done during the lifespan of the application.

### Creating actions
Your actions are run when the signal is received. They are run synchronously by default, but can also run asynchronously. The arguments passed to an action is the cerebral instance and any arguments passed with the signal. Whatever you return from an action will be passed to the next action, but beware, any objects will be frozen. You see, Cerebral runs in an immutable environment. Any state you extract from the cerebral can not be changed. This is what makes updates to the components so fast because there is no need for deep checking of changes. It also benefits Cerebrals ability to remember. You can not change the past, immutability makes sure of that.

*actions/setInputValue*
```javascript

let setInputValue = function (cerebral, value) {
  cerebral.set('inputValue', value);
};

export default setInputValue;
```
Cerebral has many different methods for mutating state. **set, push, concat, splice, merge, unset, pop** etc. The first argument of a mutation is always the path to the value you want to mutate. In the example above we use a string as we are changing the top level of the cerebral. For nested values you use an array. You can also pass retrieved state values as path to the mutation.

*actions/addListItem.js*
```javascript

let addListItem = function (cerebral) {
  cerebral.push('list', cerebral.get('inputValue'));
  cerebral.set('inputValue', '');
};

export default addListItem;
```
You get state from the cerebral using the `.get()` method. This takes a path, either a string or an array. As stated earlier these values are immutable, but you can easily make a mutable copy by running a `.toJS()` method on them.

You can also watch an introduction video of this, which shows the workflow using the debugger: [Cerebral - Building your first app](https://www.youtube.com/watch?v=ZG1omJek6SY).

## Complex state handling
So far we have just introduced some basic implementations that looks good in any framework really. The debugger is a major advantage to keep you sane, but what about the really tough problems? Like asynchronous code, optimistic updates and relational state? Let us try to answer a basic question first. How should you store your data? In an array? Or as a key/value map? They both have their benefits in regards to data access and traversal. In Cerebral the choice is made for you. You use a key/value map to store source data. For example some todos would be stored like this:

```javascript

let cerebral = Cerebral({
  todos: {
    'cerebral_ref_1': {
      id: 'todo_1',
      title: 'My todo',
      completed: false
    },
    'cerebral_ref_2': {
      id: 'todo_2',
      title: 'My other todo',
      completed: true
    }
  }
});
```

And if you want to display a list of todos you would add an array for that:

```javascript

let cerebral = Cerebral({
  todos: {...},
  displayedTodos: []
});
```

The reason you separate the two is scalability. You most certainly always want to keep around data in your client for caching purposes, but your UI rarely wants to display all the data. Just look at the simple TODO-mvc app, when clicking "completed" and "active", you only want to display a subset of the todos. This is where referencing is great, because you have one source of truth, but can still use it in many different scenarios. If you come from Angular or other frameworks you might say, "Why make it so complicated?". This is something that FLUX taught us. Complex is not a bad word. Though you require a bit more wiring to solve simple use cases, you will never get into scaling or sync issues as your application grows. Of course we should strive for making the complex simple, but that does not mean less code, it means having good concepts to understand how to solve the complex. That is what Cerebral tries to do. 

But we are getting way off here, this is how you would reference a todo:

```javascript

let cerebral = Cerebral({
  todos: {...},
  displayedTodos: [
    'cerebral_ref_1'
  ]
});
```

### Pointing to the source of truth
In the above code we are inserting references in the `displayedTodos` state, but there has to be something that actually grabs the todo from the `todos` map. This is done using a mapping function. Lets take a look into our cerebral:

```javascript

let projectRows = function () {
  return {
    value: [],
    deps: ['projects'],
    get(cerebral, deps, refs) {
      return refs.map(function (ref) {
        return deps.projects[ref];
      });
    }
  };
};

let cerebral = Cerebral({
  projects: {},
  projectRows: projectRows
});
```
So our cerebral can also have a function as state. This function can return an object describing the behaviour of the state. First of all it needs a value, in this case an array. The deps property lists what other state it depends on. You can use an array or key/path to define this. The last property is a method that composes the output when grabbing `projectRows`. What we do here is simply map over the references put into the array and return the actual project. The great thing about this is that if anything changes in the projects this `get()` method will run again and updates itself. You do not have to worry about keeping state in sync, it happens automatically.

### Optimistic updates
The first thing we will look at is how you would handle optimistic updates. As stated above you will use Cerebral references to reference data in the cerebral. This allows you to do optimistic updates very easily. Imagine we want to add a new project using a `projectSubmitted` signal.

```javascript

cerebral.signal('projectSubmitted', addProject, saveProject, updateProjectWithResult);
```
And now let us create the first action.

```javascript

let addProject = function (cerebral, title) {
  let ref = cerebral.ref.create();
  let project = {
    $ref: ref,
    $isSaving: true,
    title: projectData
  };
  cerebral.set(['projects', ref], project);
  cerebral.unshift(['projectRows'], ref);
  return ref;
};
```

What we do here is create a Cerebral reference and add it to our project. We also add an `$isSaving` property to inidicate that state of this particular data. Before returning the reference we created we insert the project optimistically into our projects map and add the reference to the projectRows array. Our state mapping will now trigger and also display this new optimistic project.

Again, the reason we do this is because our `projects` state might have lots of projects, but we only display a subset of them using references.

### Asynchronous actions
The next natural step is to save this project to the server and update it with either an ID or maybe an error occured. When Facebook intitially put FLUX into the wild there was a lot of discussions on where to put asynchronous code. In Cerebral you are not able to change state unless it is synchronously done from an action. So how do you change state with asynchronous code?

First we create our `saveProject` action.

```javascript

import ajax from 'ajax';

let saveProject = function (cerebral, ref) {

  let project = cerebral.get('projects', ref);
  
  return ajax.post('/projects', {
    title: project.title
  })
  .success(function (id) {
    return {
      ref: ref,
      id: id
    };
  })
  .error(function (error) {
    return {
      ref: ref
      error: error
    };
  });
};
```
We can now use the returned reference to grab the project from the cerebral and do a post to the server.
The first thing to notice here is that this imagined ajax library returns a **promise**. This is what indicates that an action is asynchronous. If a promise is returned it will wait for it to fulfill before it runs the next action in the signal. The resolved value will be passed as an argument to the next action. That will be either the id and the ref, or the error and the ref on an error response.

As you can see there are no state changes at all here. An asynchronous action is only able to grab state from the cerebral, not do changes to it. It depends on a synchronous after it do changes with whatever is returned from the asynchronous action.

But what about the debugger? It would not be a very good experience if you retraced your steps and these async actions would trigger new server requests. Well, they don't. Cerebral does not only remember the signals and mutations done, but also values returned from asynchronous actions. This means that when you look at previous state in the debugger it will all happen synchronously.

```javascript

let updateProjectWithResult = function (cerebral, result) {

  let project = cerebral.get('projects', result.ref);

  if (result.id) {

    cerebral.merge(project, {
      id: result.id,
      $isSaving: false
    });

  } else {

    cerebral.merge(project, {
      $error: result.error,
      $isSaving: false
    });

  }
};
```
And the last action now grabs the project from the cerebral and uses it as a path to merge in the id or the error, and also the $isSaving property set to false.

So now you see that Cerebral handles asynchronous actions simply using a promise. Cerebral does not allow any mutations from asynchronous actions, you have to return a result that a synchronous action can process when it is done. This is one of the core concepts that lets Cerebral keep control of your state. As a plus your code is less error prone, easier to test and easier to read.

Notice that synchronous functions are pure functions. That makes them very easy to test. Just pass an instance of a Cerebral whan calling them and verify that they make the changes and/or returns the value you expect.

### Relational state
So lets take this a step further. What if the projects has an authorId that references a specific user? Maybe we can use our map to merge in that information? We certainly can, but we have a problem. If we now use Cerebral references to allow for optimistic updates, the reference the project has is an `authorId`. We need to create a relationship between the Cerebral references and the IDs of different data to handle this. So let us download some projects and users and see what we can do.

First we have an async action downloading the projects.
```javascript

let getProjects = function (cerebral) {
  return ajax.get('/projects')
    .success(function (projects) {
      return projects;
    });
};
```
And after that an action actually putting them into the cerebral.
```javascript

let mergeProjects = function (cerebral, projects) {

  let projectsMap = projects.reduce(function (allProjects, project) {

    let ref = cerebral.ref.create(project.id);
    allProjects[ref] = project;
    return allProjects;

  }, {});
  
  cerebral.merge('projects', projectsMap);
};
```
Typically when you get data from a backend it is in an array. In this example we convert that array to a map where the key is a new Cerebral reference, just like we did when adding a new project. The difference here though is that we pass in the ID of the project when creating the reference. This will create a link between them. We do the exact same thing with the users. So now we have a map with some projects referencing users using an `authorId` property and a map of users where the key is a Cerebral reference that is linked to its ID.

Lets get back to our `projectRows` to see what we are now able to do.

```javascript

let projectRows = function () {
  return {
    value: [],
    deps: ['projects', 'users'],
    get(cerebral, deps, refs) {

      return refs.map(function (ref) {
        let project = deps.projects[ref].toJS(); // Lets us mutate the project
        let authorRef = cerebral.ref.get(project.authorId);
        project.author = deps.users[authorRef];
        return project;
      });

    }
  };
};
```

Now you see why a Cerebral benefits from giving you references. Even though we have a key/value map of users that does not depend on ids, allowing for optimistic updates, we can still do a plain lookup using the id. I think it is important at this point to point out that the examples shown here are solving the more complex challenges. Optimistic updates and relational state is no "picnic in the park".

But let us make this even more complex. What if the user is not in the client? Lets take a look at what we can do about that.

```javascript

let projectRows = function () {
  return {
    value: [],
    deps: ['projects', 'users'],
    get(cerebral, deps, ids) {

      let missingAuthors = [];
      let projectRows = ids.map(function (id) {
        
        let project = deps.projects[id].toJS();
        let authorRef = cerebral.ref.get(project.authorId);
        
        if (authorRef) {
          project.author = deps.users[authorRef];
        } else {
          project.author = {
            $isLoading: true
          };
          missingAuthors.push(project.authorId);
        }
        
        return project;
      });

      if (missingAuthors.length) {
        cerebral.signals.missingAuthorsIdentified(missingAuthors);
      }

      return projectRows;

    }
  };
};
```

I think this is one of the more complex situations of state handling we can meet as developers. Lets just go through that step by step:

1. The *get* method has access to the projects and users on the deps object
2. It prepares an array where missing author ids can be listed
3. When an author is not found a temporary object is created to indicate the state of that data. Then the id of the author is pushed into the missing authors array
4. When the projectRows are created the *get* method checks if there are any missing authors and passes those on a signal that will most certainly do an ajax request fetching the users and inserting them into the *users* map. This will in turn run the *get* method again and now the data is available

You can see a video on implementing this [right here](https://www.youtube.com/watch?v=xx7Y2MkYgUA).

## Summary
I hope this article gave you insight into what Cerebral is all about. The project is currently not running on any applications in production, but I was hoping you would want to try it out, give feedback and help me bring it to a stable release. I think we are just scratching the surface of what we are able to do when the framework has complete control of the state flow. It is pretty amazing to use the debugger when developing because you avoid retracing your steps all the time, and as your application grows you always have a good overview of how the state flows. I can not wait to see what new ideas might show up using Cerebrals ability to understand the state flow!

You can check out the project and documentation at the [cerebral repo](https://github.com/christianalfoni/cerebral). It will guide you with introduction videos and a webpack boilerplate. 