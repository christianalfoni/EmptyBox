# CycleJS driven by state

So [CycleJS](http://cycle.js.org/), created by André Staltz, is an interesting project. It runs on the philosophy that applications are just inputs (from the user, normally) and outputs. This analogy fits very well with [Observables](), which CycleJS is all about.

If you are not familiar with Observables they can be explained much like CycleJS. Inputs and outputs. What makes Observables so powerful is how you can transform and control this flow of information going through the observable.

So let us just look at a very simple example of doing this transformation and control reacting to a click that increases a count after 200ms:

```javascript

// With plain JS
let count = 0;
document.querySelector('#button').addEventListener('click', () => {
  setTimeout(() => ++count, 200);
});

// With Observable
Observable.fromEvent(document.querySelector('#button'), 'click')
  .delay(200)
  .scan(count => ++count, 0);
```

As you can see transforming and controlling the flow is a lot more expressive and you can do insanely complex stuff with very little code. Pure functions (again, input -> output) is what you normally write with Observables. This makes your code less error prone and it is easier to test. But the question to answer is: "How can you actually build an application with this approach?"

I am no expert in CycleJS. I read documentation and try to relate. Sometimes I get skeptic and sometimes I experiment. This article is exactly that. Experimenting with CycleJS to make it relate to my needs as a developer to build large scale applications.

### The CycleJS example
Often application frameworks uses counters or BMI counters to show the core ideas of the framework without too much boilerplate. This is a double edged sword. On one hand it is good to see the essence of the framework, but a counter or a BMI calculator is not an application, at least not in my book. It is a widget. But is not a widget just a small application? And a full size application many widgets? You could say that, but there is one important difference. A widget is isolated with its own state. A full size application is very difficult to create with a bunch of isolated widgets. You want a central state store to expose all state across all the widgets.

So a central state store for large applications allows you to extract any state of the application in any of your views/components. This exact reason is why frameworks like [Backbone](http://backbonejs.org/) and [Angular](https://angularjs.org/) can get really messy. You put your state inside the views/controller and now you start firing off events or whatever other mechanism, trying to keep everything in sync. The idea of a central state store, that is not only server side entities (model and collections), but also client side state, is what Flux enforced.

Maybe you disagree with this, or have not worked on very large applications, but in my experience this is very important. So let us look at a small CycleJS example:

```javascript

import Rx from 'rx';
import Cycle from '@cycle/core';
import {div, button, p, makeDOMDriver} from '@cycle/dom';

function main({DOM}) {
  const action$ = Rx.Observable.merge(
    DOM.select('.decrement').events('click').map(ev => -1),
    DOM.select('.increment').events('click').map(ev => +1)
  );
  const count$ = action$.startWith(0).scan((x,y) => x+y);
  return {
    DOM: count$.map(count =>
      div([
        button('.decrement', 'Decrement'),
        button('.increment', 'Increment'),
        p('Counter: ' + count)
      ])
    )
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app')
});
```

So this looks really great and it clearly states what CycleJS is all about. But I would call this a widget, not an application. So what do we have to change to make CycleJS build applications?

### State store
First of all we need a central state store. A state store holding all the state of our application and a state store that is available to any piece of our UI. This gives us two things:

1. It is a lot simpler to add new state and get an overview of existing state
2. When some piece of your UI (or something else) produces new state you want that to be available to any part of your UI

So let us add a **StateStoreDriver** using [ImmutableJS](http://facebook.github.io/immutable-js/). Immutable JS makes sure we do not make any state changes from our views and it will allow for render optimizations by doing shallow checking of state.

```javascript

import Rx from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import Immutable from 'immutable';

function main({store, DOM}) {
  return {
    store,
    DOM
  };
}

// We create our state driver passing in the initial state
function makeStateStoreDriver(initialState = {}) {
  return (input$) => {
    // We convert it to immutable state
    const immutableState = Immutable.fromJS(initialState);
    // We scan over any state changes. These state changes
    // are functions where we pass in existing state and get
    // new state back
    return input$.scan((state, changeState) => {
      return changeState(state);
    }, immutableState)
    // To fire up the app we need to pass the initial state
    .startWith(immutableState);
  }
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  // We create our driver and pass some initial state
  store: makeStateStoreDriver({
    inputValue: ''
  })
});
```

What we have done now is split our application into two separate concepts. State and UI (DOM). This is a really good separation in my experience. CycleJS actually has this separation, but it is contained within the view. Now it is disconnected from our UI logic. So lets see how we wire it together.

```javascript

import Rx from 'rx';
import Cycle from '@cycle/core';
import {div, label, input, makeDOMDriver} from '@cycle/dom';
import makeStateStoreDriver from './makeStateStoreDriver';

function main({store, DOM}) {

  // We create a state change based on DOM input
  const updateInputValue = DOM.select('.inputValue').events('input')
    .map(ev => ev.target.value)
    // We map to a function that receives the value from the observable
    // and returns a function: (state) => state.set('inputValue', value)
    .map(value => state => state.set('inputValue', value));

  // We create our view which maps over our state and
  // produces some UI
  const inputView = store.map(state =>
    div([
      label('Input:'),
      input('.inputValue', {value: state.get('inputValue')})
    ])
  )

  return {
    store: updateInputValue,
    DOM: inputView
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  store: makeStateStoreDriver({
    inputValue: ''
  })
});
```

So now we have control of our state and we are able to update it using any source, typically DOM. We have also started a concept of a view. Lets dive more into that.

### Views
Instead of defining our view as a variable lets define it as a function. Also let us pass in the state to it:

```javascript

export default state =>
  div([
    label('Input:'),
    input('.inputValue', {value: state.get('inputValue')})
  ])
```

And there we pretty much have it. Our abstraction for a view/component. Let see it with the rest of our code:

```javascript

import Rx from 'rx';
import Cycle from '@cycle/core';
import {div, makeDOMDriver} from '@cycle/dom';
import makeStateStoreDriver from './makeStateStoreDriver';
import InputView from './InputView';

function main({store, DOM}) {

  const updateInputValue = DOM.select('.inputValue').events('input')
    .map(ev => ev.target.value)
    .map(value => state => state.set('inputValue', value));

  const App = store.map(state =>
    div([
      InputView(state)
    ])
  );

  return {
    state: updateInputValue,
    DOM: App
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  state: makeStateStoreDriver({
    inputValue: ''
  })
});
```

We can also put our state changes into its own file.

```javascript

import Rx from 'rx';
import Cycle from '@cycle/core';
import {div, makeDOMDriver} from '@cycle/dom';
import makeStateStoreDriver from './makeStateStoreDriver';
import stateChanges from './addStateChanges';
import InputView from './InputView';

function main({store, DOM}) {
  return {
    state: stateChanges(DOM),
    DOM: store.map(state =>
      div([
        InputView(state)
      ])
    )
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  state: makeStateStoreDriver({
    inputValue: ''
  })
});
```

So that is a pretty nice abstraction. We create our state changing logic and produce new state in our state store. Then we use our state store to produce new UI. But we have an issue here.

### The DOM source
Though the `DOM.select` api is quite nice and intuitive it creates an issue when we split our state from our UI. The reason is:

*stateChanges.js*
```javascript

export default DOM =>
  DOM.select('.inputValue').events('input')
    .map(ev => ev.target.value)
    .map(value => state => state.set('inputValue', value));
```

*InputView.js*
```javascript

export default state =>
  div([
    label('Input:'),
    input('.inputValue', {value: state.get('inputValue')})
  ])
```

It is indeed very weird that our view says nothing about how it changes state and our state change logic just has some random class names it listens to. This selector also has some challenges thinking scalability. Imagine an application with hundreds of elements and you depend on classnames to find your elements. It is very fragile. Maybe we can do something about that.

Of course we want to use observables, so let us create a new source to actually trigger state changes. Lets us call them actions:

```javascript

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  state: makeStateStoreDriver({
    inputValue: ''
  }),
  // Our new driver just takes an array of actions
  // typically you use constants for this
  actions: makeActionsDriver([
    CHANGE_INPUT_VALUE
  ])
});
```

We simply just convert these actions into a map of observables.

*makeActionsDriver.js*
```javascript

import {Subject} from 'rx';

export default (actions) => {
  return () => {
    return actions.reduce((observables, key) => {
      observables[key] = new Subject();
      return observables;
    }, {});
  }
}
```

And now we use these actions to handle our state changes:

*stateChanges.js*
```javascript

export default actions =>
  actions[CHANGE_INPUT_VALUE]
    .map(value => state => state.set('inputValue', value));
```

*InputView.js*
```javascript

export default (state, actions) =>
  div([
    label('Input:'),
    input({
      value: state.get('inputValue'),
      oninput: event => actions[CHANGE_INPUT_VALUE].next(event.target.value)
    })
  ])
```

So as you can see we now need to pass also the actions to each view. **State**, **Actions** and any other arguments we might want to pass. This is much like how Elm passes its *state* and *address* to its views. For me personally it makes more sense to trigger changes at the UI element. The `DOM.select` api requires you to compose more in your head and the use of classnames/id to identify elements is risky. It is also a matter of separating your UI from your state. I think that is important. Basically you can write your whole app with all its state and state changing logic without even producing a UI.

### Scaling it
But why even go down this path? Well, I did this to make it scalable. That means when we now start extending our app we can do that quite safely. Lets add a form and a list which deletes the items. I will inline all the code to make it easier to read, but you can imagine using files here instead:

```javascript

import Rx from 'rx';
import Cycle from '@cycle/core';
import {div, form, ul, li, input, makeDOMDriver} from '@cycle/dom';
import makeStateStoreDriver from './makeStateStoreDriver';
import makeActionsDriver from './makeActionsDriver';
import {Observable} from 'rx';
import {
  UPDATE_NEW_TODO_TITLE,
  ADD_TODO,
  REMOVE_TODO
} from './constants';

// We do not need DOM anymore, we just need to map
// our state to UI on the DOM output
function main({store, actions}) {

  /* ==== STATE ==== */

  // We update our "newTodoTitle" state when the input changes,
  // you will soon see why
  const updateNewTodoTitle$ = actions[UPDATE_NEW_TODO_TITLE]
    .map(title => state => state.set('newTodoTitle', title));

  // When adding a new todo we grab the input value from our existing state,
  // then we reset the input value. This is why we handle the input
  // as its own state
  const addTodo$ = actions[ADD_TODO]
    .map(() => state =>
      state.updateIn(['todos'], todos =>
        todos.unshift(state.get('newTodoTitle'))
      ).set('newTodoTitle', '')
    );

  // Since our actions are now triggered from the UI we can pass in
  // any values, like what index we clicked. No more "data-index" types
  // of things on the elements
  const removeTodo$ = actions[REMOVE_TODO]
    .map(index => state => state.updateIn(['todos'], todos => todos.splice(index, 1)));

  // We merge our state changes into one observable
  const stateChanges$ = Observable.merge(
    updateNewTodoTitle$,
    addTodo$,
    removeTodo$
  );

  /* ===== VIEWS ===== */

  const AddTodoView = (state, actions) =>
    form({
      onsubmit: event => {event.preventDefault();actions[ADD_TODO].onNext()}
    }, [
      input({
        value: state.get('newTodoTitle'),
        oninput: event => actions[UPDATE_NEW_TODO_TITLE].onNext(event.target.value)
      })
    ])

  const TodoView = (todo, index, actions) =>
    li({
      onclick: () => actions[REMOVE_TODO].onNext(index)
    }, [todo])

  const TodosView = (state, actions) =>
    ul(state.get('todos').toJS().map((todo, index) =>
      TodoView(todo, index, actions)
    ))

  return {
    DOM: store.map(state =>
      div([
        AddTodoView(state, actions),
        TodosView(state, actions)
      ])
    ),
    state: stateChanges$
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  state: makeStateStoreDriver({
    newTodoTitle: '',
    todos: []
  }),
  actions: makeActionsDriver([
    UPDATE_NEW_TODO_TITLE,
    ADD_TODO,
    REMOVE_TODO
  ])
});
```

So there we have it. An application that scales. You can keep adding views, actions and state changing logic. All state is available to all views and any view can trigger any action. If your app grows really big you can simply start namespacing the state, create more functions to define state changing logic. Maybe even a concept of a "module" could be added, where you pass some state and logic to change that state.

### Summary
There are still one concern and that is render optimizations. Even though we have Immutable JS we do not have any logic to ensure that when the state used in a view does not change, do not rerender the view. And even if we did implement that logic we would quickly get into trouble due to the passing of state. The scenario occurs if a child view grabs some state that the parent view does not. That means a change on the state in question would cause the parent view not to render, which means the child view will not either. But these kinds of concerns only arise on very very big apps, which might not be in the scope of CycleJS.

So these are just thoughts and ideas. Maybe you come from a completely different perspective on building apps and CycleJS fits like a glove. That is great! Please share any thoughts you have.

Really looking forward to follow this project and thanks for reading!
