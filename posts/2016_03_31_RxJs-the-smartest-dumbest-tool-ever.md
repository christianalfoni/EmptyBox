# RxJS, the smartest dumbest tool ever

Let me just fire off a disclaimer here first. I am a JavaScript developer. I did not go to school to learn programming, I do not know .Net, Java or other languages. Maybe you think that makes me a bad programmer, and maybe it does, but I did not learn JavaScript to learn programming. I learned JavaScript to build things. And with JavaScript running in the browsers I have the right tool for the job.

What is kinda interesting is that JavaScript has been evaluated as this silly language by so many programmers, but people are starting to understand how powerful it is, mostly to the fact that it runs everywhere. And the language is getting better, more "programmy", every year now. So now we are in this huge pool of developers who learned JavaScript to just build things on the web and hardcore programmers who sees the potential in the language. This creates a gap of how one approaches tools and APIs, even approaches learning new things in general.

I also just want to say that I wrote this article to get out some frustration, so in advance I am really sorry if I am ranting a bit, but it is not an attack on the maintainers of [RxJS](https://github.com/Reactive-Extensions/RxJS). They are really brilliant people and are contributing a lot to the community. I have just been really frustrated trying to understand how to use RxJS.

### What makes a tool dumb?
So let me define "dumb" in the context of this article. When I state that a tool is dumb I mean that the tool does not understand its target audience/platform. There are two parts to this.

#### Explaining the concept

From the ReactiveX website:
```javascript

Observables fill the gap by being the ideal way
to access asynchronous sequences of multiple items

              # single items #      # multiple items #
              -------------------   -----------------------
synchronous   T getData()           Iterable<T> getData()
asynchronous  Future<T> getData()   Observable<T> getData()
```

And now lets look at [jQuery](http://jquery.com/):

```javascript

DOM Traversal and Manipulation

Get the <button> element with the class 'continue'
and change its HTML to 'Next Step...'

1 $( "button.continue" ).html( "Next Step..." )
```

Now, the description from RxJS is very smart, but it is dumb in the context of making developers in the JavaScript world understand it. It's the exact same reason why:

`Router(routesConfig: RoutesConfig, options?: object): any` sucks compared to:

```javascript

Router({
  '/': 'something'
}, {
  onlyHash: true
});
```

I can not prove this with facts, but I believe that the JavaScript community is hardwired to learning by example. Maybe this is due to lack of good documentation on tools, maybe because we use [stackoverflow](http://stackoverflow.com/) a lot or that we are more focused on solving our own problem than learning the tools. I am not stating that technical API descriptions are worthless, only that they become worthless without examples. At least in the world of JavaScript.

#### API
In the world of .Net and Java there is a certain convention to name API methods and also how to expose functionality. JavaScript has a lot more freedom, which jQuery is also a really good example of. How would you feel using jQuery if the syntax was:

```javascript

var selection = new jQuery.DomSelection('div', null, 'someClass', null, true);
```

In JavaScript we have taken a lot of liberties creating really good APIs that makes the tools more approachable. The goal is making it simple and intuitive. Not exposing the functionality as it is implemented, but rather as "how it should be used". I will get back to this later.

### If RxJS was an approachable tool
So how could RxJS become an approachable tool for the JavaScript community? I have created a list here which touches on everything from the webpage to specific APIs, naming, explanations and behavior. Some of this is closer to personal opinions rather than factual statements, but either you agree or you do not. I am not trying to convert anyone here :-)

#### Solve some problem first
When I look into tools I want a problem solved, or find a better solution to problems I have already solved. I think it is important to identify that state of mind when explaining a tool. I completely agree that JavaScript developers should be better at understanding the tools they use, but that is often a huge investment.

Like with jQuery. Understanding that jQuery is really an array of DOM nodes populated with methods that iterates the array is probably not something a lot of jQuery users know. But a lot of them do because they have either used it so much that it has become apparent, or they have used it so much that the investment of understanding it completely has proved its worth.

To understand RxJS I need to use it, but to use it I need to know what it solves and to know what it solves I need examples of how it solves some existing challenge. So looking at the example from the repo:

```javascript

/* Get stock data somehow */
const source = getAsyncStockData();

const subscription = source
  .filter(quote => quote.price > 30)
  .map(quote => quote.price)
  .forEach(price => console.log(`Prices higher than $30: ${price}`);
```

This does not really solve a common problem. How often do you create a web application that sends data over websockets which you need to filter and map over? And why invest in a new tool just to filter and map some simple data like this? But what about:

```javascript

const searchInput = document.querySelector('#search')

// Listen to keypresses on input
Rx.Observable.fromEvent(searchInput, 'keypress')
  // Get the value of the input
  .map(event => event.target.value)
  // Only pass through values with 3 or more characters
  .filter(value => value.length > 2)
  // As keypresses does not necessarily change the value of the input
  // make sure we only move on when the value has changed
  .distinctUntilChanged()
  // Only move on with latest keypress with 500 ms interval
  .debounce(500)
  // Send search request, retry 3 times on fail and return request. Since we
  // return a request observable we need to use flatMap to extract the actual value
  .flatMap(value => Rx.DOM.request(`/api/items?query=${value}`).retry(3))
  // Extract the data of the response
  .map(response => response.data)
  // Render the items
  .forEach(items => renderItems(items))
  // If something fails show error
  .catch(err => renderError(err.message))
```

Search is such a common thing in web applications and it is really difficult to make it a good experience. With this example we see so much RxJS power solved beautifully compared to how we would imagine solving it with other tools. There is an example using jQuery far down on the repo, but it is split up into many observables which is confusing for someone who does not quite get the chaining of methods.

#### Not standalone solution
There are many places you can use RxJS, but it is difficult to understand how. For example with React. You can not use `fromEvent` to attach an event listener.

```javascript

class SomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
    this.onClick$ = new Subject().subscribe(() => this.setState({count: this.state.count + 1}));
  }
  render() {
    return (
      <div>
        <h1>Clicked {this.state.count} times</h1>
        <button onClick={() => this.onClick$.next()}>Click me!</button>
      </div>
    );
  }
}
```

Looking at the usage areas of RxJS could also inspire other helpers like:

```javascript

class SomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
    this.onClick = Observable.toMethod(this.onClick.bind(this));
  }
  onClick(observable) {
    observable.subscribe((event) => this.setState({count: this.state.count + 1});
  }
  render() {
    return (
      <div>
        <h1>Clicked {this.state.count} times</h1>
        <button onClick={this.onClick}>Click me!</button>
      </div>
    );
  }
}
```

#### Really bad naming
So what is a **Subject**? What is a **BehaviorSubject**? And what is an **AsyncSubject**? And **ReplaySubject**? They are basically the same thing, it's just their behavior that is different. But that behavior has some amazingly strange names. There is probably a very good reason technically, but considering approachability it hurts RxJS a lot.

In my mind it seems that things has been switched around a bit. I would expect from an API standpoint that:

```javascript

// Default behavior is to create an observable that is also an observer (Subject)
const myObservable = Observable.create()
myObservable.subscribe(value => console.log(value))
myObservable.next('hey')

// You configure your observable for different behavior
const myObservable = Observable.create({
  buffer: 2, // ReplaySubject (keep history for new subscribers)
  initialValue: '42', // BehaviorSubject (Just has an initial value)
  emitLastValue: true // AsyncSubject (Just emits the last value on subscription)
});
myObservable.subscribe(value => console.log(value))
myObservable.next('hey')

// You create a custom one
const myObservable = Observable.create((observer) => {
  observer.next('42')
  observer.completed()
  return () => console.log('disposed')
}, {
  buffer: 2,
  initialValue: '42',
  emitLastValue: true
});
myObservable.subscribe(value => console.log(value))
```

To me, as a JavaScript developer, it just feels a lot more intuitive. But again, I might be colored by my personal preferences as a JavaScript developer as well. Maybe I am completely wrong. And I know the feeling when somebody suggests an API change and does not understand the consequences, which is highly likely here ;-) But I just want to make a point. RxJS is not approachable with this strange naming to explain different behavior.

#### Paper language
A lot of the documentation on RxJS looks like a paper from a PhD student. Like, wtf?

"The Reactive Extensions for JavaScript (RxJS) is a set of libraries for **composing asynchronous and event-based programs** using observable sequences and **fluent query operators** that many of you already know by Array#extras in JavaScript. Using RxJS, developers represent asynchronous data streams with Observables, **query asynchronous data streams using our many operators, and parameterize the concurrency in the asynchronous data streams using Schedulers**. Simply put, RxJS = Observables + Operators + Schedulers.""

This does not help me at all solving any problem. Honestly it scares the crap out of me. It basically states that this is a tool for very smart people, people a lot smarter than me at least. If it said something like:

*What jQuery did for DOM nodes, RxJS does for JavaScript values*

Maybe it's silly and it certainly does not say anything about the asynchronous powers of RxJS. You can not even compare these two tools! But still it does not matter I think. What matters is that it really is an amazing tool that can help you solve a lot of complexities with values, much like jQuery solved complexities with talking to the DOM. And it's short, simple and catches interest.

#### Unexpected behavior
So even if you get past the initial threshold of using RxJS you will quickly meet unexpected behavior. It is the infamous scenario of HOT and COLD observables. And again... why call them HOT and COLD? It does not explain how they differ. HOT and COLD refers to the observable itself, but from an actual usage perspective it is the subscription that is affected by the difference in behavior.

So a COLD observable means that each subscription gets its own instance of that observable, running from the start. A HOT observable has only one instance where the first subscriber triggers it and any additional subscribers will just hook into the existing subscription. So instead of saying that the observable itself is HOT and COLD, why not define this behavior on the subscription? To me it feels a lot more intuitive. Lets look a bit more into this.

This is current behavior:
```javascript

const someObservable = Rx.Observable.interval(1000).take(3);

someObservable.subscribe(x => console.log(x))

// This will actually start from scratch, giving 0, 1, 2
setTimeout(() => someObservable.subscribe(x => console.log(x)), 2000)
```

To make the observable HOT you have to use a method called `share()`, go figure.

```javascript

const someObservable = Rx.Observable.interval(1000).take(3).share();

someObservable.subscribe(x => console.log(x))

// This will only display 2
setTimeout(() => someObservable.subscribe(x => console.log(x)), 2000)
```

So one suggestion is to flip it around. By default observables are HOT and instead of defining its subscription behavior at the observable, you define it at the subscription. So removing `shared()` and using `clone()` instead, like this:

```javascript

const someObservable = Rx.Observable.interval(1000).take(3);
someObservable.subscribe(x => console.log(x))
// This will only display 2
setTimeout(() => someObservable.subscribe(x => console.log(x)), 2000)

const someObservable = Rx.Observable.interval(1000).take(3);
someObservable.subscribe(x => console.log(x))
// "Clone" the observable to indicate that you want a new instance
// before subscribing, displaying 0, 1, 2
setTimeout(() => someObservable.clone().subscribe(x => console.log(x)), 2000)
```

Again, there is probably a very good technical reason why it works like this. And maybe saying "clone" is not what you technically would do under the hood. But that does not matter. What matters is creating an API that feels intuitive and does what you expect it to do.

### Summary

I think I have tried looking into Observables about three times now and finally things are starting to dawn on me. Really looking forward to RxJS 5 release and keep exploring how observables can be more approachable in the different usage areas. An example of this is [Vue.js](https://vuejs.org/). By making observables the entry point of state changes you can get a lot of benefits from using RxJS:

```javascript

import Vue from 'vue';
import {Observable, Subject} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import axios from 'axios';

// This function is a typical Observable.fromEvent
// type of thing. Though specific to Vue JS and making state changes
function createObservable(cb) {
  let state = null;
  const subject = new Subject();
  cb(subject).subscribe(function (change) {
    change(state);
  });
  return function (arg) {
    state = this;
    subject.next(arg);
  }
}

new Vue({
  el: '#app',
  data: {
    posts: [],
    isLoading: false,
    error: null
  },
  methods: {

    // Instead of normal methods we make them expose an observable instead.
    // The returned observable(s) has to map to a function that receives the state
    // that can be changed. Pretty cool!
    fetchClick: createObservable((observable) => {
      const getPosts$ = observable
        .flatMap(() => Observable.fromPromise(axios.get('http://jsonplaceholder.typicode.com/posts')))
        .map(result => result.data)
        .share()

      const resetPosts$ = observable.map(() => state => state.posts = []);
      const startFetching$ = observable.map(() => state => state.isLoading = true);
      const stopFetching$ = getPosts$.map(() => state => state.isLoading = false);
      const setNewPosts$ = getPosts$
        .map(posts => state => state.posts = posts)
        .catch(err => state => state.error = err.message);

      return Observable.merge(
        resetPosts$,
        setNewPosts$,
        startFetching$,
        stopFetching$
      );
    })
  }
})
```

Thanks for reading up on this, and again sorry if my rants got offensive, I was just venting. Looking forward to see where RxJS goes in the future and how we can better integrate a really great concept into our existing tools.
