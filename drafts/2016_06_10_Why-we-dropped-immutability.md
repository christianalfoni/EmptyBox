# Why we dropped immutability

In this article I will talk about the story of why Cerebral went from using immutability and then later decided to drop it.

So lets first align our thoughts on what immutability is. JavaScript has no concept of immutability. Any object or array is passed around the code by reference and you can mutate them wherever you want. That means any objects or arrays you create and pass around will look the same in any part of your code, because it is the same object/array.

With immutability you can still pass objects and arrays around your code by reference, but when you make a change to them you will always create a new object or array.

```javascript

const obj = {};
const array = [];
const immutableObj = Immutable({});
const immutableArray = Immutable([]);

obj.foo = 'bar';
array.push('foo');
console.log(obj); // { foo: "bar" }
console.log(array); // ["foo"]

const newImmutableObj = immutableObj.set('foo', 'bar');
const newImmutableArray = immutableArray.push('foo');
console.log(immutableObj); // {}
console.log(immutableArray); // []
console.log(newImmutableObj); // { foo: "bar" }
console.log(newImmutableArray); // ["foo"]
```

So this trait of immutability is often the argument for why you should use it. You just avoid some part of your code to change something in other parts of your code.

### Immutability in Cerebral
The reason Cerebral used immutability was not related to "code control" at all. Actually, I would have a really hard time building Cerebral without the ability to pass objects to different core modules and allow them to operate on them as kind of a "common register".

The reason Cerebral introduced immutability was to give features to Cerebral developers. So this is an important point I think. Immutability in itself is not a feature, immutability is a tool. A feature you get out of the box using immutability is "code control", as mentioned above. Though in Cerebrals case it was used to implement recording of interactions, time travel debugging and the change log in the debugger.

### What Cerebral tries to do
Cerebral is all about helping the developer create a mental image of how their application works. The more complex things we build, the more we have to compose in our head to understand how it works. That is just how it is. There are abstractions that helps us reduce the code verbosity and better explaining what the code does. Tools like observable streams, promises, components and architectures like flux, mvc etc. are all very helpful, but they are just pieces. When these pieces are put together it is still very hard to understand how they all affect each other just looking at code. Like... composing components with props passed from a parent with actions dispatched, with side effects, with reducers, with selectors back into the component... it is very very difficult.

So how does Cerebral help you create a mental image of the complexities in your app? And how does immutability fit in with that goal?

### Time travel debugging
When Dan Abramov showed off time travel debugging at React Europe in 2015, this was actually already running in Cerebral. That said, Dans approach also allowed you to change business logic in your reducers for hot reloading, where Cerebral only supported hot reloading of the components when travelling through time.

The initial idea behind time travel debugging in Cerebral was actually just give a log of changes, which the developer could review. Being able to "double click" one of these log items and put the application in the state at that time was really just a "cool thing"... a selling point, and in my opinion it still is. It is not time travel debugging that helps you debug your app, it is reviewing the log of changes.

With Cerebral this "log of changes" became the signals implementation. The way signals differs from plain action dispatches is that you define a whole flow of changes, rather than individual actions. I thought this would be an important feature to help the developer build a mental image. One of the biggest challenges in flux, or any architecture really, is understanding complex flows.

So in my experience time travel is just a fancy feature, the real value lies in the log of changes. The question is, do you need immutability to log the changes in your app? As it turns out, you do not. With Cerebral there is only one way to change the state of the app and that is using a **state API** in the actions. You never do: `user.name = 'bob'`, you always do: `state.set('user.name', 'bob')`. This allows the framework to make "a copy" of the described state change. Of course with immutability this would just work out of the box, but it is not a requirement. The signal and its tracked state changes are passed to the debugger and there you have it... a change log for debugging.

![cerebral](/images/cerebral_signals.png)

### The cost of immutability
So why drop immutability if it actually makes the implementation of the change log simpler? And you get time travel on top of it? Well, immutability also has a cost. Both in terms of the overhead of forcing immutability in the language, but also readability and understanding how your app works.

#### Performance
Since JavaScript does not support immutability you have a few different approaches to achieving it:

1. Use the spread operator or `Object.assign` to create copies
2. Use [ImmutableJS](https://facebook.github.io/immutable-js/docs/#/) which has optimized data structures for working with immutable values
3. Use [baobab](https://github.com/Yomguithereal/baobab) which is an immutable application state tree

The biggest problem with all these approaches is performance. They all slow down the changes in your app. Normally this is of course not a problem, but when you want to create an immutable list of 1500 contacts it can take several frames to accomplish that. Yeah, I say frames, because that is a good measure for how users are affected. And now you might say, why put 1500 contacts into your your app in the first place? Well, as mentioned we are building more and more complex apps and we want to give a great user experience. That requires us to download a lot more data into the client than we used to.

#### Readability
Looking at the three approaches above:

*Vanilla JS*
```js

const newUser = {
  ...user,
  config: {
    ...user.config,
    foo: 'bar'
  }
};
const newUser = Object.assign({}, user, {
  config: Object.assign({}, user.config, {
    foo: 'bar'
  })
})
```

*ImmutableJS*
```javascript

const newUser = user.setIn(['config', 'foo'], 'bar');
```

*Baobab*
```javascript

tree.set(['user', 'config', 'foo'], 'bar');
```
With Baobab the new value is contained inside the tree, it is not returned. You have to explicitly say: `tree.get(['user'])` to get the new user.

Readability is of a subjective thing, but I just wanted to point out that is not natural for JavaScript to handle immutability so we have to create abstractions around it.

#### Understanding the app
One of the biggest challenges with immutable data in my experience is handling relational data. Since no objects can safely reference other objects you will have to turn to other abstractions to for example know the author of a comment. Typically you create a selector for this:

```javascript

function Comment(comment, users) {
  return {
    ...comment,
    author: users[comment.authorId]
  };
}
```

And this has to rerun every time there is a change to either the comment or the users. This is just overhead for your brain. More things to compose to understand how the application works.

## Is immutability bad?
I think it is time to point out that immutability is not bad at all. Personally I am really excited about the evolving concept of "immutable apps", popularized by Lee Byron in Facebook ([great talk](https://vimeo.com/166790294)). But currently in Cerebral we have met issues with performance and we strive to making it easier to build this mental image of how your app works. So even though referencing can be looked at as bad in terms of "code control", or that it in fact was only necessary because of memory constraints in early browsers etc. Maybe this referencing can help us make things simpler?

## Referencing objects and arrays
So with typical immutable flux solutions you will spend quite a bit of time and mental effort on handling relational data. Often you have to use projects like [normalizer.js](https://github.com/paularmstrong/normalizr) in combination with selectors to make the data look like what the view wants. In Cerebral we want to take a different turn and embrace referencing. The reason we can do it is because Cerebral has such a strong concept of where to do your state changes. It is a specific API that is only available in signals. You are not supposed to do state changes other places in your app.

So the way this works is that you can for example do things like this:

```js

state.push('comments', {
  text: input.text,
  author: state.get('user')
})
```

There is no need to grab the user id and create a selector to show the comment correctly in the UI and prevent duplication. It just works, because it is a reference. Also any change done directly on the `user` path will be reflected wherever the user has been referenced. You can not make changes any faster than this and with less mental effort in my opinion.

The fact that we are not working with immutable values means that we can also create dynamic objects. We can create getters on objects like:

```javascript

Object.assign(post, {
  get comments() {
    return post.commentIds.map(id => state.get(`comments.${id}`));
  }
})
```

This allows you to define how an object in your state store looks like AND it will actually look like this in the state store. It is not a decoupled calculated value only your views knows about. That means with Cerebral, when you use the debugger and traverse the state tree it will hold all these comments and you can see it. But the data is not duplicated, it is by reference. So the memory footprint is low, updates are superfast and the state tree reflects your mental image:

![model](/images/cerebral_model.png)

## Summary
So removing immutability is currently the right choice for Cerebral. That does not mean that Cerebral will never bring back immutability, but it will only be done if it actually helps Cerebral developers build a mental image of how the application works. Either in code or as debugging tools that can not be built without immutability.

I hope this article gave some balance to the idea of using immutability. Again, I am not saying it is bad at all, I am just saying that it is a tool with advantages and disadvantages as everything else :-)

If you want to know more on how Cerebral is able to update the UI using references take a look at this [state-tree presentation](https://www.youtube.com/watch?v=xN7yg95AwXU). Thanks for reading!
