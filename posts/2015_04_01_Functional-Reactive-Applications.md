# Functional Reactive Applications

I want to take a step back from React JS, FLUX and cursors for a minute. There is a concept that has always intrigued me, but I have never quite understood it in the context of creating an application. The concept is **Functional Reactive Programming**. There are quite a few articles on the subject, but none of them really explains this concept in the context of building an application.

You have probably heard of [BaconJS](https://baconjs.github.io) and [RxJS](https://github.com/Reactive-Extensions/RxJS), but none of them welcomes application development for programmers who do not already deeply understand the concepts. To me [BaconJS](https://baconjs.github.io) seems like a stream wrapper for jQuery when reading the documentation. It does not introduce any application state concepts at all. [RxJS](https://github.com/Reactive-Extensions/RxJS) feels much like the [immutable-js](https://github.com/facebook/immutable-js) project by Facebook. It is a huge API that is about handling data, not about creating applications. I am not saying that is a bad thing, I just feel that something is missing.

There is a really great project called [CycleJS](https://github.com/staltz/cycle) and an [article](http://futurice.com/blog/reactive-mvc-and-the-virtual-dom) explaining the reasoning behind it. It is a different way of thinking about application development. An exciting one, but difficult to grasp. I had to read the article a couple of times and go through some examples before it started to dawn on me, so I thought I would have a go at it. Give my take on how and why you would want to use **Functional Reactive Programming** to build your applications.

### Get a grip on the terms
When I say **Functional Reactive Programming** I am not referring to the academic definition of it. I do not really care for discussions on academic aspects, as it is the practice that is important. So in my opinion when developers think **Functional Reactive Programming** they think **Observables** and being able to use functional concepts like **Map**, **Reduce**, **Filter** etc. on them. Let us break that down.

#### Functional
Functional programming basically means using functions. In JavaScript this translates to passing a function as an argument to operate on some input, and give an output. An example of this would be:

```javascript

var array = [{name: 'foo', isAwesome: true}, {name: 'bar', isAwesome: false}];
var isAwesomeFilter = function (item) {
  return item.isAwesome;
};
var awesomeArray = array.filter(isAwesomeFilter);
```

We pass a function as an argument to operate on the array input and the output is a new array only containing the items that has a thruthy value on the property *isAwesome*. The important thing to notice here is that there is nothing outside the *isAwesomeFilter* function affecting its insides. That is what we call a pure function and that is essential to *Functional Programming*. An unpure function would be:

```javascript

var array = [{name: 'foo', isAwesome: true}, {name: 'bar', isAwesome: false}];
var awesomeArray = [];
var isAwesomeFilter = function (item) {
  if (item.isAwesome) {
    awesomeArray.push(item);
  }
};
array.forEach(isAwesomeFilter);
```

There are two reason for this being a bad thing. First of all the function might not always do what you expect. In this simple example the *awesomeArray* would of course always look the same, but in larger applications something else could access *awesomeArray* and change it. That would cause the forEach loop to create different results. This is called side effects.

Second this piece of code is harder to test. If you wanted to test the function passed to forEach you would also have to control the outer array, but in the first example you can easily test the *isAwesomeFilter* function by just running it with different inputs.

#### Reactive
It is hard to explain the benefits of Reactive programming. Looking at examples you often think "cool, can I do that?", more than "ah, that will keep me sane developing my application". But let me give it a try here, starting with some abstract thoughts and then going into more practicalities throughout the article. I think *Reactive Programming* can most easily be explained as reacting to a change, instead of being told about a change. Simply:

```javascript

// Reacting to a change
var observable = 'foo';
observable.on('change', doSomething);
observable = 'bar';

// Tell about a change
var observable = 'foo';
observable = 'bar';
doSomething();
```

What this sums down to is how you scale your code. To reason about this more easily lets think about modules, instead of lines of code.

We have a **module A** that does a specific task and we decide to add a second **module B** that should run after **module A**. **module A** will now require **module B** to be able to tell it when to run.

*moduleB.js*
```javascript

module.exports = function (dataFromModuleA) {
  // Handle data from module A
};
```

*moduleA.js*
```javascript

var moduleB = require('./moduleB.js');
// Existing module A logic
moduleB(dataFromModuleA);
```
So the bad thing that happened here was:

> You had to change your existing code and it now has a side effect, calling moduleB. Your tests might also be broken because of this

With a reactive pattern we would not require **module B** in **module A**, we would do the exact opposite, require **module A** in **module B**. This makes more sense because we do not really want to touch **module A**. When **module A** has done its job we react to it in **module B** and run the code there.

*moduleB.js*
```javascript

var moduleA = require('./moduleA.js');
moduleA.on('change', function (dataFromModuleA) {
  // Handle data from module A
});
```

> You did not have to change existing code or tests and there is no side effect in module A

### So what is this article about?
As mentioned I was very inspired by the [CycleJS project](https://github.com/staltz/cycle). It is a very exciting new take on application development, but in its current form it is quite verbose and it is hard to grasp the concepts. It uses [RxJS](https://github.com/Reactive-Extensions/RxJS), which requires heavy investment from someone who has not done reactive programming before. So I decided to create a similar project where it does not matter what **FRP** library you use. **R** just provides a view concept that you can inject observables into and out comes DOM, using the [virtual-dom project](https://github.com/Matt-Esch/virtual-dom). This is much inspired by React JS itself.

But of course, you need more than a "view" to build an application, so I will introduce these examples as a typical FLUX pattern. **Store**, **Component** and **Actions**.

- The **Store** layer is where you produce and export the state of your application
- The **Component** layer is where you describe your UI. The returned value from a component is an observable that produces virtual DOM trees
- The **Actions** layer is where you define what your components, or anything else, can do to change the state of your application. It being events from a click, changes in an input, route change, ajax response etc. This is where state changes start

So to give you an analogy for the data flow, think conveyor belts. Imagine **Stores** and **Actions** injected into your components as conveyor belts. The store conveyor belt goes in the direction of the component and the action conveyor belt goes in the opposite direction. When a component places a new box with some content on an action conveyor belt it is carried into the store. Inside the store there are multiple stations using the content of a box to create a new box, carrying it a long to the next station until it reaches the end of the conveyor belt, as state in your components. This is the "one way flow" we know from FLUX, but it is **FRP** all the way through:

```javascript

  /---------|=======|--------------------------\               
  |         | Store | observable-state ->      |
  |    /----|=======|---------------------\    |
  |    |                                  |    |
  |    |                                  |    |
  |    |                                  |    |
  |    |                                  |    |
  |    |                                  |    |
  |    \-|=========|                  =============
  |      | Actions | <- interactions <| Component | 
  \------|=========|                  =============
                                        |        |
                                        | vTrees |
                                        |        |
                                         renderer
```

### The API
I am calling the library **R**. I have chosen to show the examples using [BaconJS](https://baconjs.github.io) as I believe it to be easier to understand. Beware that BaconJS does *not* depend on jQuery, though it focuses heavily on its compatability with it! But now, let us get into some code:

*main.js*
```javascript

import {Render} from 'r-js';
import actions from './actions.js';
import store from './store.js';
import App from './App.js';

Render({
  actions: actions,
  store: store
}, function () {
  return <App/>;
});
```
When rendering an application with **R** you can actually inject whatever you want into your components. Maybe you want to think observables, streams or maybe intents. You choose the terms that makes sense to you and the **FRP** library you are using. The callback returns the initial virtual DOM tree that will be applied to the body of the document.

Lets take a look at the actions:

*actions.js*
```javascript
import Bacon from 'baconjs';
module.exports = {
  changeTitle: new Bacon.Bus()
};
```
So creating an action is pretty much just about defining them. The important part about actions is that you have to be able to push values on to them. In BaconJS those are called **Bus**, in RxJS you have **BehaviorSubject**. 

*store.js*
```javascript

import actions from './actions.js';

var title = actions.changeTitle
  .map(function (event) {
    return event.keyCode === 13 ? '' : event.target.value;
  })
  .startWith('');

module.exports = {
  title: title
};
```
So now we see **FRP** in action. Whenever the *changeTitle* action has a new "box on its conveyor belt" it will go through the "map station". This "station" opens up the box, finds an event and based on it being an ENTER press or not, it pushes a new box on to the new "title conveyor belt", which is an observable. The content of the box is either an empty string or the value of the event target.

We also give the title observable an initial value so that the component has a value to work with when it is rendered.

*App.js*
```javascript

import {Component, Hook, DOM} from 'r-js';

var App = Component(function (props, observables) {

  var {actions, store} = observables;

  return store.title
    .map(function (title) {
      return <input value={title} ev-keyup={Hook(actions.changeTitle, 'push')}/>;
    });

});

module.exports = App;
```
First of all we import the Component, Hook and also DOM from **R**. The reason we import DOM is to allow JSX syntax. We define a component by passing a function. This function has two arguments. The first argument, *props*, are any properties passed to the component from an other component. This is a familiar concept from React JS. The second argument are all the observables injected into *Render*. I like to use the common term **observables** for them, but depending on the FRP-library you use, something else might give more sense. In this example the observables are the actions and the observables exposed by the store.

The component has to return an observable (conveyor belt) that moves "boxes" containing DOM representations. It does that by attaching "store conveyor belts" to its own "map station". So changes to state goes into the "map station", and out comes a new DOM representation. In this case we only attach a single observable, but we will see later how we can attach multiple observables.

Instead of `onKeyup` you know from React JS, *virtual-dom* uses `ev-keyup`. It works the same way. To make it easier to hook on to observables **R** exposes a `Hook` function. This function takes the observable as the first argument and the name of the method that will be called to push values to it. With BaconJS that is *push*, but with RxJS it would be *onNext*. You can also pass additional arguments, these are typically values you want to bind to the callback.

### Summarizing our app
Okay, so this was of course a very simple application. Its only functionality is emptying the input when hitting enter. Its hard to see benefits with such a simple example, but let me point out:

- The component is dumb and stateless. It has no logic for changing state. It only pushes changes to the actions and produces a new DOM representation when receiving changes from the store
- The component does not depend on observables, they are injected into the components when rendered
- The actions knows nothing about the stores, they just expose a set of interactions in your application and stores can hook on to those to produce state

Let us look at more complex state handling to see how easily we can scale the application.

### Creating mutations
You need to mutate the state of your application. With **Functional Reactive Programming** you have to think about this differently. For example a list of titles can be mutated in many different ways, it being adding a title, removing a title etc. Traditionally you would think the list of titles as an array, but in the world of FRP it is more than that. If we think about our title used in the input above, the title is an observable based on events pushed to the *changeTitle* action. If we think about our list, it will be an observable based on an array with mutation observables hooked on to it. Let me explain with code:

*store.js*
```javascript

import actions from './actions.js';

var title = actions.changeTitle

  // Instead of using keyup on the input we use keydown and
  // wait on next tick to get the value of the input
  .throttle(0) 
  .map(function (event) {
    return event.keyCode === 13 ? '' : event.target.value;
  })
  .startWith('');

// We create an observable for all new titles
var newTitle = actions.changeTitle

  // We only want to add a title if we press ENTER and
  // there actually is a value in the input
  .filter(function (event) {
    return event.keyCode === 13 && !!event.target.value;
  });

// We create an observable that produces functions
// that will add a title to the titles array
var addTitle = newTitle

  // For every new title we create a mutation function. The
  // function will receieve existing titles, mutates it and
  // returns it
  .map(function (event) {
    return function (titles) {
      titles.push(event.target.value);
      return titles;
    };
  });

// Titles is an observable based on mutations
var titles = addTitle

  // Scan is like "reduce". We start out with an empty titles array,
  // and every time a new mutation arrives from "addTitle",
  // we run that mutation passing in the current titles array. What differs is
  // that the returned value from the mutation will become the new titles
  // value, which is used on next arrival of "addTitle"
  .scan([], function (titles, addTitleMutation) {
    return addTitleMutation(titles);
  });

module.exports = {
  title: title,
  titles: titles
};
```
Okay, so things look a bit crazy at first sight, but please hang on. It does feel weird not explicitly defining an array of titles, but understanding why this is, is what I believe to be the big "aha" moment. So let us work our way to that moment. 

First of all we need an observable that can produce an array of titles, but we also need to hook in multiple observables that will do different mutations to the array. This is a great job for **reduce**. Reduce is a method that takes an initial value, our array, and a function that will run whenever the observables that is hooked on to it passes in a new value. So what we do in this example is hooking on an observable called *addTitle* that will pass functions which our reduce reacts to. When an *addTitleMutation* is received it will be run and the current array of titles is passed. The returned value from the function, which is the array of titles, will now become the current value of **reduce** and it will now become the value of the titles observable.

So why is this better? Well, if you think about how you would solve this with traditional progamming style you would probably dive into our existing *title* code, create the array as a side effect making all of this harder to test. If you look closely at our functions they are completely pure and very easy to test. A sidenote here is that it is easier to handle immutable data structures also, as the array returned from our mutation function could have been a completely new array.

### Make it testable
Though the functions we created are pure, they are not really testable yet. We have to put them into their own module, making them exposed for testing purposes. This also cleans up the store code:

*helpers.js*
```javascript

module.exports = {
  emptyOnEnter: function (event) {
    return event.keyCode === 13 ? '' : event.target.value;
  },
  enterAndHasValue: function (event) {
    return event.keyCode === 13 && !!event.target.value;
  },
  createAddTitleMutation: function (event) {
    return function (titles) {
      titles.push(event.target.value);
      return titles;
    };
  },
  mutate: function (value, mutation) {
    return mutation(value);
  }
};
```
*store.js*
```javascript

import actions from './actions.js';
import {
  emptyOnEnter,
  enterAndHasValue,
  createAddTitleMutation,
  mutate
} from './helpers';

var title = actions.changeTitle
  .map(emptyOnEnter)
  .startWith('');

var newTitle = title
  .filter(enterAndHasValue);

var addTitle = newTitle
  .map(createAddTitleMutation);

var titles = addTitle
  .scan([], mutate);

module.exports = {
  title: title,
  titles: titles
};
```
Now you start to see how clean and decoupled our code becomes. You can easily reuse existing functions and they are very easy to test. You also see how generic they actually are. You could easily rename these functions, maybe make factories out of them, reusing them across all your observables.

### Adding multiple observables to a component
So lets use our new observable in our component:

*App.js*
```javascript

import {Component, Hook, DOM} from 'r-js';
import Bacon from 'baconjs';

var App = Component(function (props, observables) {

  var {actions, store} = observables;

  function renderTitle(title, index) {
    return <li key={index}>{title}</li>;
  }

  // We use "combineTemplate" to merge observables to
  // key/value
  return Bacon.combineTemplate({
      title: store.title,
      titles: store.titles
    })
    .map(function (state) {
      return (
        <div>
          <input value={state.title} ev-keydown={Hook(actions.changeTitle, 'push')}/>
          <ul>
            {state.titles.map(renderTitle)}
          </ul>
        </div>
      );
    });
});

module.exports = App;
```
**BaconJS** has a method called `combineTempate()`. This method takes an object with keys and values, where the values are observables. I think the example is self explainatory :-) It is also worth mentioning that the *Component* in **r-js** uses *requestAnimationFrame*. So if there are multiple observable changes on the same tick, it will only render once on the next animation frame.

### Adding more mutations
You might be eager to check out how we would handle ajax, ajax errors and states like *isSaving*. Hang on, we will check that very soon. But let us first create a new mutation that removes a clicked title from the titles array.

First of all we need to add a new action for this:

*actions.js*
```javascript

import Bacon from 'baconjs';
module.exports = {
  changeTitle: new Bacon.Bus(),
  removeTitle: new Bacon.Bus()
};
```

And let us hook this up in our component before writing the store code:

*App.js*
```javascript

import {Component, Hook, DOM} from 'r-js';
import Bacon from 'baconjs';

var App = Component(function (props, observables) {

  var {actions, store} = observables;

  // We add a new event handler which binds the index
  // of the title we are clicking
  function renderTitle(title, index) {
    return <li ev-click={Hook(actions.removeTitle, 'push', index)}>{title}</li>;
  }

  return Bacon.combineTemplate({
      title: store.title,
      titles: store.titles
    })
    .map(function (state) {
      return (
        <div>
          <input value={state.title} ev-keydown={Hook(actions.changeTitle, 'push')}/>
          <ul>
            {state.titles.map(renderTitle)}
          </ul>
        </div>
      );
    });
});

module.exports = App;
```

Now lets get to the fun part, adding a new remove mutator and hook it on our *titles* observable:

*helpers.js*
```javascript

module.exports = {
  emptyOnEnter: function (event) { ... },
  enterAndHasValue: function (event) { ... },
  createAddTitleMutation: function (event) { ... },
  mutate: function (value, mutation) { ... },
  createRemoveTitleMutation: function (index) {
    return function (titles) {
      titles.splice(index, 1);
      return titles;
    };
  }
};
```
*store.js*
```javascript

import actions from './actions.js';
import Bacon from 'baconjs';
import {
  emptyOnEnter,
  enterAndHasValue,
  createAddTitleMutation,
  mutate,
  createRemoveTitleMutation
} from './helpers';

var title = actions.changeTitle
  .map(emptyOnEnter)
  .startWith('');

var newTitle = title
  .filter(enterAndHasValue);

var addTitle = newTitle
  .map(createAddTitleMutation);

// We create a new observable of mutations to remove
// a title
var removeTitle = actions.removeTitle
  .map(createRemoveTitleMutation);

// We merge our two mutation observables
var titles = Bacon
  .mergeAll(addTitle, removeTitle)
  .scan([], mutate);

module.exports = {
  title: title,
  titles: titles
};
```
Thats it! The new code did not mess around with some defined array anywhere. It just creates a mutation that we hook on to our titles observable which runs the mutations. If we named our new function "removeByIndex" it is generic enough to be used anywhere. In fact we could make all our helpers completely generic. Now we see DRY code taken to a whole new level.

### Ajax
You can not create an application without pushing some data to the server and receiving it. So let me show you how to solve this with **Functional Reactive Programming**. We are going to push new titles to the server, removing it if an error occurs and create a new observable for *isSaving*. I will not be writing the helper functions, just to show you how obvious and clear the code becomes, but maybe you want to try implement them yourself?

*store.js*
```javascript

import actions from './actions.js';
import Bacon from 'baconjs';
import {
  emptyOnEnter,
  enterAndHasValue,
  createAddTitleMutation,
  mutate,
  createRemoveTitleMutation,
  getTargetValue,
  returnTrue,
  returnFalse,
  saveTitleToServer
} from './helpers';

var title = actions.changeTitle
  .map(emptyOnEnter)
  .startWith('');

var newTitle = actions.changeTitle
  .filter(enterAndHasValue)
  .map(getTargetValue);

var addTitle = newTitle
  .map(createAddTitleMutation);

var removeTitle = actions.removeTitle
  .map(createRemoveTitleMutation);

// We create an observable of requests of saving a title to the server.
// Since our map function returns an observable, we need to use
// flatMap, instead of map
var saveTitleRequest = newTitle
  .flatMap(function (title) {
    return Bacon.fromPromise(saveTitleToServer(title));
  });

// In this scenario a promise rejection passes
// the index of the title that failed. As you can see
// we reuse the "createRemoveTitleMutation" function
var removeTitleOnError = saveTitleRequest
  .mapError(createRemoveTitleMutation);

// We add our extra onError mutation
var titles = Bacon
  .mergeAll(addTitle, removeTitle, removeTitleOnError)
  .scan([], mutate);

// To handle an isSaving state we merge two observables where the 
// first observable returns true whenever we add a new title and 
// the other returns false whenever the request is done, it 
// failing or not
var isSaving = Bacon
  .mergeAll(
    newTitle.map(returnTrue),
    saveTitleRequest.map(returnFalse)
  )
  .startWith(false);

module.exports = {
  title: title,
  titles: titles,
  isSaving: isSaving
};
```

### Summary
I hope this has peeked your interest and that I managed to explain the concepts in a way that makes sense when building applications. ["R"](https://github.com/christianalfoni/R) is not a production ready library, it was built to write this article and try to make **Functional Reactive Programming** more approachable for building applications. I highly recommend taking a look at [CycleJS](https://github.com/staltz/cycle), though it is more a framework than just a FRP-view. So please give me some feedback on **R** and play around with the demo included in the [repo](https://github.com/christianalfoni/R). It would be great to keep working on this library.

Anyways, thanks for taking the time to read the article!
