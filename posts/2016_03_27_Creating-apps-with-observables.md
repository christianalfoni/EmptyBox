# Creating apps with observables

Functional Reactive Programming concepts is really grabbing a hold in the community these days. Projects like [Elm](http://elm-lang.org/), [Cycle JS](http://cycle.js.org/), [Angular2](https://angular.io/) and soon to come [RxJs5](https://github.com/ReactiveX/rxjs) is all over twitter, at least on my account :) They are all about observables. If you have not heard of observables they can quickly be explained as a way to handle input over time. This input coming from a mouse click, messages over websocket or whatever really.

My biggest concern with Functional Reactive Programming, related to building applications, is the too simplistic view on **input -> output**. Applications are not as simple as **input -> output**, there are lots of things happening between the input and the output. I really like the idea of using observables at the core of driving your application state changes, like in CycleJS, but there are some things I do not understand. Here are some open questions I am having a hard time finding the answers to:

1. When the observables in my application needs to produce multiple state changes, how do I express that?
2. When my state changes can take multiple paths, have conditional paths etc. how do I express that with observables?
3. How do I keep my UI optimized, not doing unnecessary renders?
4. How do I let my observables change state across each other? So one observable handling a click needs to change the same state that some other observable handling a different click does

So when I can not find answers I try to come up with some myself. Maybe you can help me validate them? I built a small lib for this article called [HotDiggeDy](https://github.com/christianalfoni/HotDiggeDy), just to emphasize it is not a serious project. It implements observables as the "application state driver" and uses [Snabbdom](https://github.com/paldepind/snabbdom) to expose state and observables as first class citizens to the components.

I have high respects for projects like Elm and CycleJS, but I still have no idea how you can build actual web applications with these projects. There are no examples of full scale complex web applications and I can not see how you can structure your application in a way that scales to hundreds of views and hundreds of models, where views can extract any state and request any state change. To allow any view/component to extract any state and ask for any state change is what I think needs to be at the core to create a scalable application.

### A simple application
I am going to use React as an example to show you what I mean when stating "observables driving your application state changes". I am using [RxJs5](https://github.com/ReactiveX/rxjs) to create these observables, which *HotDiggeDy* also does.

```javascript

import React from 'react';
import {Oservable, Subject} from 'rxjs';

class Counter extends React.Component {
  constructor() {

    // We create some initial state for our component
    this.state = {count: 0};

    // We create two observables for increasing and decreasing the count
    this.increase$ = new Subject();
    this.decrease$ = new Subject();

    // We merge these two observables and whenever they trigger
    // we "reduce" a count. Then we subscribe to it all to run
    // setState on our component
    Observable.merge(this.increase$, this.decrease$)
      .scan((count, value) => count + value, 0)
      .subscribe((count) => this.setState({count: count}));
  }
  render() {
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button onClick={() => this.increase$.next(1)}>Increase</button>
        <button onClick={() => this.decrease$.next(-1)}>Decrease</button>
      </div>
    );
  }
}
```

So this looks like a lot of unnecessary boilerplate to do a very simple thing. And yeah, I completely agree. Too bad most examples of using observables are like this. Either counters or BMI calculators. But there are a couple of things to take away from this:

1. We can use observables to handle our click events and really anything else. That means having a common concept of "something happening in our app", it being a mouse click, a websocket message, an ajax response etc.
2. We can transform these observables into state. In the example above we just created a count, but this could actually be an object holding lots of different state. We also moved the count to the state of the component, isolating it, but we could create our own state concept which made the count available to any component

### The need for a global state store
So to build an application we have to move our state outside of our components. Flux Stores,  Redux Reducers or Elm Models might come to mind... and yeah, that is basically what we are going to do. But lets first talk about the scope of this store/reducer/model.

When something happens in our applications we want to produce some new state. In the example above we just changed a counter, but a more typical example would be:

1. Reset an array, `posts: []`
2. Set a state to `isLoading: true`
3. Fetch some data from the server
4. Update posts array with data from server
5. Set the isLoading state to `isLoading: false`
6. Set an error state if server response fails

So we need the observables of our app to access a lot more than a *count state*. The question is how we can share this state produced between different observables. Like the count on the initial example can only be changed through the created observables, not a completely new one inside a different component.

To solve this we create a global state store. Personally I have very good experience with creating a single state store/tree for the application. This prevents you getting into issues where one part of your state is isolated from other state. We will use [ImmutableJS](https://facebook.github.io/immutable-js/) to hold the state. This will also allow for render optimizations later and gives a nice API for updating the state in our state store.

#### Producing state with observables
Lets see how our little framework creates a new application with some state and an observable which changes some state.

```javascript

import HotDiggeDy from 'HotDiggeDy';

// Define the initial state of the app
const initialState = {
  isLoading: false,
  posts: [],
  error: null
};

// Define observables
const observables = {
  fetchClicked(observable) {
    return observable.map(() => state => state.set('isLoading', true));
  }
};

const app = HotDiggeDy(initialState, observables);
```

Lets first take a look at `return observable.map(() => state => state.set('isLoading', true));`. What is happening here? Let us first break it down to normal JavaScript:

```js

return observable.map(function () {
  return function (state) {
    return state.set('isLoading', true);
  }
});
```

What we are doing here is mapping to a function that will change the state of the app. This is what I mean by "generically changing the state". This function receives the current state of the app and returns the new state. So how is this state changing function used?

Lets imagine we just call the `fetchClicked` function and it returns our state changing observable.

```javascript

const state$ = fetchClickedStateChange$
  .scan((state, changeFunction) => (
    return changeFunction(state);
  ), Immutable.fromJS({
    isLoading: false,
    posts: [],
    error: null
  })

state$.subscribe(function (state) {
  // Whenever the state changes
});
```

This piece of code effectively takes observables that emits this state change function that returns new state. So if we had many observables in our application we could:

```javascript

const state$ = Observable.merge(
    fetchClickedStateChange$,
    someOtherStateChange$,
    someCoolStateChange$
  )
  .scan((state, changeFunction) => (
    return changeFunction(state);
  ), Immutable.fromJS({
    isLoading: false,
    posts: [],
    error: null
  });

state$.subscribe(function (state) {
  // Whenever the state changes
});
```
The important thing is that every type of observable we define returns one or merged observables that produces this "change state function". So let us see how we can let one observable produce two state changes:

```javascript

const observables = {
  fetchClicked(observable) {
    const setLoading$ = observable
      .map(() => state => state.set('isLoading', true));
    const resetPosts$ = observable
      .map(() => state => state.set('posts', Immutable.fromJS([])));

    return Observable.merge(setLoading$, resetPosts$);
  }
};
```
So now we are able to express multiple state changes on one observable in our application. This is a really important concept for application development that is very often lost in Observable examples. And I think the reason is that Observables are really about plain
**input -> output** transformation at its core. Driving complex application state changes needs to be an abstraction over it.

But lets get more into it, we need an even more important feature. We need to handle side effects that also eventually produces state. Typically ajax requests. So lets add that:

```javascript

const observables = {
  fetchClicked(observable) {

    // Whenever we click we start fetching posts
    const posts$ = observable
      .flatMap(() =>     
        Observable.fromPromise(axios.get('http://jsonplaceholder.typicode.com/posts'))
      )
      .map(result => result.data)
      .share(); // Make it HOT (run once regardless of subscriber count)

    // Whenever we click we also want to reset the posts array
    const resetPosts$ = observable
      .map(() => state => state.set('posts', Immutable.fromJS([])));

    // And we want to set a loading state to true
    const fetchingStarted$ = observable
      .map(() => state => state.set('isLoading', true));

    // Though setting loading to false should happen after the posts
    // are fetched, so we map over the "posts$" observable instead
    const fetchingStopped$ = posts$
      .map(() => state => state.set('isLoading', false));

    // Also setting the news posts, or an error, should happen after
    // the posts are fetched
    const setNewPosts$ = posts$
      .map(posts => state => state.set('posts', Immutable.fromJS(posts)))
      .catch(err => state => state.set('error', err.message));

    // We expose all the state changes as one observable
    return Observable.merge(
      resetPosts$,
      setNewPosts$,
      fetchingStarted$,
      fetchingStopped$
    );
  }
};
```

So now you might say... is this really how observables should be used? Should not the click of a button be just one observable producing some state? Yeah, it can be, like with a counter. But it can not be that simple in a real application because an event, like a button click, might produce a lot of different state changes. What we want, at least what I want, is a way to express what is happening on that button click as "one coherent thing". I want to be able to easily read all the possible requests for state change in the application and I want to easily read what exactly happens when these requests occur, top down. And that is exactly what we have achieved above.

### Side effects
So a big question in application development is "where to trigger side effects?". With side effects I mean for example the ajax request in the example above. Like in Elm you return side effects from a request for state change, which triggers new requests for state change. With Redux you just run your side effects in the action creators.

The one single reason I favor the Redux approach is the readability. If you have a complex request for state change, like above, you have to compose a lot more in your head if you can not just read "top down" what happens. Like in Elm you would have to create an Effect separated from your state changing logic, "at the edge of your app". That means when you compose in your head how some request for state change runs you have to jump back and forth between actions and effects to understand the complete flow.

What I like about the approach in the example above is that you return normal state changes and side effects both as observables, allowing you to compose everything in your head by just reading the logic of your defined observable (fetchClicked).

### Creating the UI
So any event in our application now gets its own observable that will return a new observable of merged state changes. Some events might just lead to a single state change, but others might be more complex, like the one in the example above.

So now let us attach a UI to our application. I chose [Snabbdom]() as it allows me to easily wrap my own first class citizens, those being the state of our application and the observables we have created. This is how our code looks:

```javascript

import {Component, DOM} from 'HotDiggeDy';

const renderPost = post => <li>{post.title}</li>;
const Demo = Component((props, state, observables) => (
  <div>
    <h1>Number of posts {state('posts').size}</h1>
    <button
      on-click={observables.fetchClicked}
      disabled={state('isLoading')}>
      Fetch
    </button>
    {state('isLoading') ? <div>Loading stuff</div> : ''}
    {
      state('posts').size ?
        <ul>{state('posts').toJS().map(renderPost)}</ul>
      :
        ''
    }
  </div>
));
```

So this is a typical component. It receives some *props*, *state* and *observables*. This is all we really care about in components. We need to be able to grab properties passed by parent components, grab state from the application state store and trigger requests for state change. State and request for state change is often what leads to insane amounts of boilerplate in our apps, but with Snabbdom we can just make it a natural part of our component concept.

What to notice specifically here is how *state* is grabbed. It is grabbed using a function. Basically it translates to Immutable JS: `state.get('foo')`. But what is very interesting about this approach is that it is possible to analyze the state requirements of the component.

### Optimizing UI
What I can not find any information on in Elm and CycleJS is how views/components are optimized, maybe they are not? When scaling up an application you will need to optimize the need for render. What this basically means is:

1. A new render of the component is requested
2. The props passed and the state required is checked
3. If there are no changes to props or state the previous render is returned, as nothing changed. This saves up a lot of processing in large applications

The really great thing about requesting state as a function, instead of exposing all the state as a plain object (`state.isLoading`), is that it can be automized. An example of this can be seen here [CerebralJS Computed](http://www.cerebraljs.com/utilities/compute). So that means when the component renders the first time the state requested is tracked and on the next render the component already knows what state is to be checked to verify the need for another render. This is not implemented in *HotDiggeDy*, but it could be and I think it is an interesting concept to bring up. In an ideal world we would not have to care about optimizing rendering, we would just rerender everything on every state change, but that is not realistic currently. That said, an approach like this would completely hide it.

### Scaling up!
So how would an application like this scale? First of all our views/components are completely detached from the state and the observables. That means any component can grab any state and trigger any observable. But more importantly, how do we structure our state and observables in big applications?

What I have come to realize, through experiences with [Cerebral](http://www.cerebral.com), is that scalability is often better handled with namespacing rather than isolation. What I specifically mean is:

```js

const initialState = {
  isLoading: false,
  posts: [],
  error: null
};

// With namespacing
const initialState = {
  posts: {
    isLoading: false,
    list: [],
    error: null
  }
};

// With isolation
const adminState = {
  isLoading: false
};

const postsState = {
  isLoading: false,
  posts: [],
  error: null
};
```

The key difference here is that isolation prevents you from changing the admin state from posts and posts state from admin. But what you really just wanted was to structure your state. Namespacing does that for you and still gives you the freedom to change any state from any observable.

The same goes for the observables themselves:

```javascript

const observables = {
  fetchClicked(observable) {}
}

const observables = {
  posts: {
    fetchClicked(observable) {}
  }
}
```

### Debugging
I also want to bring up thoughts on debugging. When debugging observables in the context of creating an application you do not care about how each and every observable run, that is just way too much information. What you care about is what "requests for state change" are made, what state is changed and when is the state changed. That means in `HotDiggeDy` it would be easy to map over all the observables defined to figure out when they trigger. It would also be just as easy to map over the returned state changing observables to figure out what state they change. To get some inspiration on this, take a look at the [Cerebral Debugger](https://www.youtube.com/watch?v=ZMXcSRiq6fU) which I think gives the information you care about when developing an application in terms of state changes.

### Summary
So I have been jumping a bit all over the place here. I hope I got the message through that observables can drive applications, but it is difficult to wrap a concept around them that handles everything between the *input* and the *output* in a way that is flexible and scales. If you feel I am completely lost or that my statements are completely wrong, GREAT!, please comment and I will learn something! :)

If the ideas resonates with you, please also comment, as I would love to to get some validation on the thoughts and ideas. You can check out `HotDiggeDy` at this [repo](https://github.com/christianalfoni/HotDiggeDy), also including a demo of the example above.

Thanks for reading!
