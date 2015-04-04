# Functional Reactive Applications

I want to take a step back from React JS, FLUX and cursors for a minute. There is a concept that has always intrigued me, but I have never quite understood it in the context of creating an application. The concept is **Functional Reactive Programming**. There are quite a few articles on the subject, but none of them really explains this concept in the context of building an application.

You have probably heard of [BaconJS](https://baconjs.github.io) and [RxJS](https://github.com/Reactive-Extensions/RxJS), but none of them welcomes application development for programmers who do not already deeply understand the concepts. To me [BaconJS](https://baconjs.github.io) seems like a stream wrapper for jQuery when reading the documentation. It does not introduce any application state concepts at all. [RxJS](https://github.com/Reactive-Extensions/RxJS) feels much like the [immutable-js](https://github.com/facebook/immutable-js) project by Facebook. It is a huge API that is about handling data, not about creating applications. Heavily inspired by the [CycleJS](https://github.com/staltz/cycle) project and [this article](http://futurice.com/blog/reactive-mvc-and-the-virtual-dom), I thought I would give it a go. Explain to you how you can use **Functional Reactive Programming** to build applications.

### Get a grip on the terms

#### Functional
So functional programming, what does that really mean? And why is it a good thing? Functional programming basically means using functions. In JavaScript this translates to passing a function as an argument to operate on some input, and give an output. An example of this would be:

```javascript

var array = [{name: 'foo', isAwesome: true}, {name: 'bar', isAwesome: false}];
var isAwesomeFilter = function (item) {
  return item.isAwesome;
};
var awesomeArray = array.filter(isAwesomeFilter);
```

We pass a function as an argument to operate on the array input and the ouput is a new array only containing the items that has a thruthy value on the property *isAwesome*. The important thing to notice here is that there is nothing outside the *isAwesomeFilter* function affecting its insides. That is what we call a pure function and that is essential to *Functional Programming*. An unpure function would be:

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

There are two reason for this being a bad thing. First of all the function might not always do what you expect. In this simple example the awesomeArray would of course always look the same, but in larger applications something else could access *awesomeArray* and change it. That would cause the forEach loop to create different results. This is called side effects.

Second this piece of code is harder to test. If you wanted to test the function passed to forEach you would also have to control the outer array, but in the first example you can easily test the *isAwesomeFilter* function.

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

We have a **module A** that does a specific task and we decide to add a second **module B** that should run after **module A**. **module A** will now require **module B** to be able to tell it when to run. So the bad thing that happened here was:

> You had to change your existing code and it now has a side effect, calling moduleB. Your tests might also be broken because of this

*moduleB.js*
```javascript

var moduleA = require('./moduleA.js');
moduleA.on('change', function (dataFromModuleA) {
  // Handle data from module A
});
```

With a reactive pattern we would not require **module B** in **module A**, we would do the exact opposite, require **module A** in **module B**. This makes more sense because we do not really want to touch **module A**. When **module A** has done its job we react to it in **module B** and run the code there.

> You did not have to change existing code or tests and there is no side effect in module A

### So what is this article about?
As mentioned I was very inspired by the [CycleJS project](https://github.com/staltz/cycle). It is a very exciting new take on application development, but it is currently very verbose and hard to grasp the concepts. It uses [RxJS](https://github.com/Reactive-Extensions/RxJS), which requires heavy investment from someone who has not done reactive programming before. So I decided to create a similar project depending on [BaconJS](https://baconjs.github.io), which is a lot easier to understand. This is the concept:

- The **View** is a function that will have the models and controllers injected. The returned value from a view is a stream of virtual DOM trees, using [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
- The **Controller** is a stream that can have values pushed on to it. It being events from a click, changes in an input, route change, ajax response etc. To change a model you have to "order a change" on a controller stream
- The **Model** feeds on the "orders" from the controllers and produces state to be consumed by your views

A very good analogy for this pattern is a conveyor belt. Imagine a **model** and a **controller** injected into your view as conveyor belts. The model conveyor belt goes in the direction of the view and the controller conveyor belt goes in the opposite direction. When a view places a new box with some content on a controller conveyor belt it is carried into the model. Inside the model there are multiple stations using the content of a box to create a new box, carrying it a long to the next station until it reaches the end of the conveyor belt, as state in your views. This is the "one way flow" we know from FLUX, but the state layer (model) is reactive and functional all the way through. Let me visualize this:

```javascript

  /----------|=======|--------------------------\               
  |          | Model | state ->                 |
  |    /-----|=======|---------------------\    |
  |    |                                   |    |
  |    |                                   |    |
  |    |                                   |    |
  |    |                                   |    |
  |    |                                   |    |
  |    \-|============|                  ==========
  |      | Controller | <- interactions <|  VIEW  | 
  \------|============|                  ==========
                                         |        |
                                         | vTrees |
                                         |        |
                                          renderer
```

You might argue the name **controller**, but I think of it as "the entry point to request state change". Much like a router. Anyways, this is a simplistic view on it, as multiple models can hook on to the same controller etc., but I think the analogy will suffice as a mental image going further into this article.

### The API
I am calling the Reactive MVC library **"R"**. Let us just get straight into the code:

*main.js*
```javascript

import {Render} from 'R';
import controllers from './controllers.js';
import models from './models.js';
import App from './App.js';

Render(models, controllers, function () {
  return <App/>;
});
```
When rendering an application with **R** you inject the models and controllers you want to be available to your views. The callback returns the initial virtual DOM tree that will be applied to the body of the document.

Lets take a look at the controllers:

*controllers.js*
```javascript

import {Controller} from 'R';
module.exports = {
  changeTitle: Controller()
};
```
So creating a controller is pretty much just about defining them. Under the hood a controller is a wrapped **BaconJS Bus**. It is a stream ready to have values pushed to it and the wrapper just binds the `push()` method to the bus itself and makes it asynchronous. This makes it easier to push values from *keydown* callbacks etc. in your views. It also has a `bindPush(arg)` method which allows you to bind a value to be pushed when for example a click occurs.

*models.js*
```javascript

import controllers from './controllers.js';

var title = controllers.changeTitle
  .map(function (event) {
    return event.keyCode === 13 ? '' : event.target.value;
  })
  .startWith('');

module.exports = {
  title: title
};
```
So now we see **Functional Reactive Programming** in action. Whenever the *changeTitle* controller has a new "box on its conveyor belt" it will go through the "map station". This "station" opens up the box, finds an event and based on it being an ENTER press or not, it pushes a new box on to the new "title conveyor belt". The content of this box is either an empty string or the value of the event target.

We also give the stream an initial value so that the view has a value to work with when it is rendered.

*App.js*
```javascript

import {View, DOM} from 'R';

var App = View(function (props, models, controllers) {
  return models.title
    .map(function (title) {
      return <input value={title} onChange={controllers.changeTitle.push}/>;
    });
});

module.exports = App;
```
First of all we import the View and also DOM from **R**. The reason we import DOM is to allow JSX syntax. We define a view by using a function. This function has three arguments. The first argument, *props*, are any properties passed to the view from an other view. This is a familiar concept from React JS. The second argument are all the models injected into *Render*, and the third being the injected controllers.

The view has to return a stream (conveyor belt) that moves "boxes" containing DOM representations. It does that by hooking "model conveyor belts" to its own "map station". So changes to models goes into the "map station", and out comes a new DOM representation. In this case we only hook a single model, but we will see later how we can hook multiple models.

### Summarizing our app
Okay, so this was of course a very simple application. Its only functionality is emptying the input when hitting enter. Its hard to see benefits with such a simple example, but let me point out:

- The view is dumb and stateless. It has no logic for changing state. It only pushes changes to the controllers and produces a new DOM representation when receiving changes from the models
- The view does not depend on collections or models, they are injected into the views when rendered
- The controllers knows nothing about the models, they just expose a set of interactions in your application and models can hook on to those to produce state

Let us look at more complex state handling to see how easily we can scale the application.

### Creating mutations
You need to mutate the state of your application. With **Functional Reactive Programming** you have to think about this differently. For example a list of titles can be mutated in many different ways, it being adding a title, removing a title etc. So what is this list of titles? If we think about our title above, the title is an output based on events pushed to the *changeTitle* controller. If we think about our list, it will be an output based on mutations to an array. Lets look at the code:

*models.js*
```javascript

import controllers from './controllers.js';

var title = controllers.changeTitle
  .map(function (event) {
    return event.keyCode === 13 ? '' : event.target.value;
  })
  .startWith('');

// First we create a stream of a function that will
// add a new title to the titles array
var addTitle = controllers.changeTitle

  // We only want to add a title if we press ENTER and
  // there actually is a value in the input
  .filter(function (event) {
    return event.keyCode === 13 && !!event.target.value;
  })

  // For every new title we create a mutation function. The
  // function will receieve existing titles, mutates it and
  // returns it
  .map(function (event) {
    return function (titles) {
      titles.push(event.target.value);
      return titles;
    };
  });

// Titles is an ouput based on mutations
var titles = addTitle

  // Scan is like "reduce". We start out with an empty titles array,
  // and every time a new mutation arrives from "addTitle",
  // we run that mutation passing in the current titles array. What differs is
  // that the returned value from the mutation will become the new titles
  // value, which is used on next arrival of "addTitle"
  .scan([], function (titles, mutation) {
    return mutation(titles);
  });

module.exports = {
  title: title,
  titles: titles
};
```
Okay, so things look a bit crazy at first sight. But I will explain and hopefully it makes sense. First of all we had to figure out "What is a list of titles?". A list of titles starts out with an empty array and that array changes whenever a mutation is performed on it. So first of all we created our first mutation, *addTitle*. Whenever you hit ENTER in the input and there is content, a new mutation function is created. Our titles will react when this mutation arrives and passes in the current array to the mutation function and the new value of titles is the mutated array.  

So why is this better? Well, if you think about how you would solve this with traditional progamming style you would probably dive into our existing *title* code, create the array as a side effect making all of this harder to test. If you look closely at our functions they are completely pure and very easy to test. A sidenote here is that it is easier to handle immutable data structures also, as the array returned from our mutation function could have been a new array.

### Make it testable
Though the functions we created are pure, they are not really testable yet. We have to put them into their own module, making them exposed for testing purposes. This also cleans up the models code:

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
*models.js*
```javascript

import controllers from './controllers.js';
import {
  emptyOnEnter,
  enterAndHasValue,
  createAddTitleMutation,
  mutate
} from './helpers';

var title = controllers.changeTitle
  .map(emptyOnEnter)
  .startWith('');

var addTitle = controllers.changeTitle
  .filter(enterAndHasValue)
  .map(createAddTitleMutation);

var titles = addTitle
  .scan([], mutate);

module.exports = {
  title: title,
  titles: titles
};
```
Now you start to see how clean and decoupled our code becomes. You can easily reuse existing functions and they are very easy to test. You also see how generic they actually are. You could easily rename these functions, maybe make factories out of them, reusing them across all your models.

### Adding multiple models to a view
So lets use our new model in our view:

*App.js*
```javascript

import {View, DOM} from 'R';
import Bacon from 'baconjs';

var App = View(function (props, models, controllers) {

  function renderTitle(title, index) {
    return <li key={index}>{title}</li>;
  }

  return Bacon.combineTemplate({
      title: models.title,
      titles: models.titles
    })
    .map(function (data) {
      return (
        <div>
          <input value={data.title} ev-change={controllers.changeTitle.push}/>
          <ul>
            {data.titles.map(renderTitle)}
          </ul>
        </div>
      );
    });
});

module.exports = App;
```
**BaconJS** has a method called `combineTempate()`. This method takes an object with keys and values, where the values are streams. I think the example is self explainatory :-) It is also worth mentioning that the *View* in **R** uses *requestAnimationFrame*. So if there are multiple model changes on the same tick, it will only render once on the next animation frame.

### Adding more mutations
You might be eager to check out how we would handle ajax, ajax errors and states like *isSaving*. Hang on, we will check that very soon. But let us first create a new mutation that removes a clicked title from the titles array.

First of all we need to add a new controller for this:

*controllers.js*
```javascript

import {Controller} from 'R';
module.exports = {
  changeTitle: Controller(),
  removeTitle: Controller()
};
```

And let us hook this up in our view before writing the model code:

*App.js*
```javascript

import {View, DOM} from 'R';
import Bacon from 'baconjs';

var App = View(function (props, models, controllers) {

  function renderTitle(title, index) {
    return <li ev-click={controllers.removeTitle.bindPush(index)}>{title}</li>;
  }

  return Bacon.combineTemplate({
      title: models.title,
      titles: models.titles
    })
    .map(function (data) {
      return (
        <div>
          <input value={data.title} ev-change={controllers.changeTitle.push}/>
          <ul>
            {data.titles.map(renderTitle)}
          </ul>
        </div>
      );
    });
});

module.exports = App;
```
The controllers, being wrapped **BaconJS Bus** isntances, also has a `bindPush()` method which lets you bind a value to be pushed. In this case we want to push the index of the title being clicked.

Now lets get to the fun part, adding a new remove mutator and hook it on our *titles* stream:

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
*models.js*
```javascript

import controllers from './controllers.js';
import Bacon from 'baconjs';
import {
  emptyOnEnter,
  enterAndHasValue,
  createAddTitleMutation,
  mutate,
  createRemoveTitleMutation
} from './helpers';

var title = controllers.changeTitle
  .map(emptyOnEnter)
  .startWith('');

var addTitle = controllers.changeTitle
  .filter(enterAndHasValue)
  .map(createAddTitleMutation);

// We create a new stream of mutations to remove
// a title
var removeTitle = controllers.removeTitle
  .map(createRemoveTitleMutation);

// We merge our two mutation streams
var titles = Bacon
  .mergeAll(addTitle, removeTitle)
  .scan([], mutate);

module.exports = {
  title: title,
  titles: titles
};
```
Thats it! The new code did not mess around with some defined array anywhere. It just creates a mutation that we hook on to our titles stream which runs the mutations. If we named our new function "removeByIndex" it is generic enough to be used anywhere. In fact we could make all our helpers completely generic. Now we see DRY code taken to a whole new level.

### Ajax
You can not create an application without pushing some data to the server and receiving it. So let me show you how to solve this with **Functional Reactive Programming**. We are going to push new titles to the server, removing it if an error occurs and create a new model for *isSaving*. I will not be writing the helper functions, just to show you how obvious and clear the code becomes, but maybe you want to try implement them yourself?

*models.js*
```javascript

import controllers from './controllers.js';
import {Bacon} from 'R';
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

var title = controllers.changeTitle
  .map(emptyOnEnter)
  .startWith('');

// We create a new stream with new titles
var newTitle = controllers.changeTitle
  .filter(enterAndHasValue)
  .map(getTargetValue);

// We create a stream of requests to save a title to the server.
// Since our function returns a stream, we need to use
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

var addTitle = newTitle
  .map(createAddTitleMutation);

var removeTitle = controllers.removeTitle
  .map(createRemoveTitleMutation);

// We add our extra onError mutation
var titles = Bacon
  .mergeAll(addTitle, removeTitle, removeTitleOnError)
  .scan([], mutate);

// We merge two streams where the first stream returns
// true whenever we add a new title and the other returns
// false whenever the request is done, it failing or not
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
I hope this has peeked your interest and that I managed to explain the concepts in a way that makes sense when building applications. ["R"](https://github.com/christianalfoni/R) is not a production ready library, it was built to write this article and try to make **Functional Reactive Programming** more approachable for building applications. Please give me some feedback and play around with the demo included in the [repo](https://github.com/christianalfoni/R), it would be great to work more on this :-)

Thanks for taking the time to read the article!
