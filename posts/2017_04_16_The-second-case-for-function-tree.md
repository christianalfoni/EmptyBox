# The second case for function-tree

Talking about new concepts is difficult. Especially when those concepts aim to solve complexity. The initial article on function-tree was a very direct approach. It might not have made much sense, cause there was nothing to compare it to. Well, in this article we are going to go from a single promise to a complete function-tree, talking about what problems it solves a long the way.

## A promise
If you are not familiar with promises it is explained as "a future value". Think of it as a wrapper for a value you can only access with a callback:

```javascript

const promisedValue = Promise.resolve('foo')

promisedValue.then(function (value) {
  value // "foo"
})
```

Now typically you would not just resolve a value, but you would execute something to create that value:

```javascript

const promisedValue = new Promise(function (resolve, reject) {
  ajax.get('/items', function (error, result) {
    if (error) reject(error)
    else resolve(result)
  })
})

promisedValue
  .then(
    function (result) {},
    function (error) {}
  )
```

Creating a promise allows you to either resolve with a value or reject with an error. Now, the good thing about promises is its ability to create a flow.

## Promise flow

```javascript

// We create a factory that takes a url and returns
// a promise of fetching data
function get (url) {
  return new Promise(function (resolve, reject) {
    ajax.get(url, function (error, result) {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function startFlow (bananasUrl, applesUrl) {
  let bananasResult

  // BAD: running side effect from outer scope
  return get(bananasUrl)
    // BAD: Not declarative cause need to assign to outer scope
    .then(function (bananas) {
      // BAD: assigning to outer scope
      bananasResult = bananas

      // BAD: running side effect from outer scope
      return get(applesUrl)
    })
    // BAD: Not declarative cause need to get value from outer scope
    .then(function (apples) {
      const fruitBasket = [bananasResult, apples]

      return fruitBasket
    })
    .catch(function (error) {

    })  
}

startFlow('/bananas', '/apples')
```

So this is a typical way to create a promise flow. You start with a promise and add to it. At the end you catch any possible errors (if you bother). Even though promises are a great concept, it is very low level and it is difficult to discipline yourself to write good code. For example with the code above I show off some typical problems you can get yourself into:

1. The flow accesses variables in its outer scope. **applesUrl**. With promises you easily get into a mess of pointing to outer scope variables, making your code harder to understand and reason about. Basically it is more difficult to write declarative code
2. With promises you typically return only one value, meaning that a concept for "passing on values" from previous steps is not opinionated. The example above creates a variable that is assigned later. This is not ideal
3. Our side effect (ajax) is also accessed in the outer scope. This makes promise flows harder to test. Even though promises hints to be a great concept for declarative code, where each **.then** just references a function, it is difficult to do in practice

Maybe you already have ideas to make this code better, that is great! Maybe you feel provoked as "this is not the way to write promises", great! We have something in common :) My point with this example is to show that Promises are low level and gives a lot of freedom, freedom that can easily move you down the wrong path.

So how can we make this flow better?

## Improving the flow

### Injecting a payload
First of all we want to prevent ourselves from pointing to the outer scope. This will allow us to write our code in a declarative way. Starting our flow by resolving the input to it, our urls, we are able to make our first "bananaGet" declarative:

```javascript

function get (url) {
  return new Promise(function (resolve, reject) {
    ajax.get(url, function (error, result) {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function getBananas (payload) {
  return get(payload.bananasUrl)
}

function startFlow (payload) {  
  return Promise.resolve(payload)
}

startFlow({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
})
  .then(getBananas)
```

### Passing the payload
The second thing we need to do is make it possible for us to rather extend the existing payload with new properties. This will make sure that whatever payload we start with and add, will be available all the way through the flow:

```javascript

function get (url) {...}

function getBananas (payload) {
  return get(payload.bananasUrl)
    .then(function (bananas) {
      payload.bananas = bananas

      return payload
    })
}

function getApples (payload) {
  return get(payload.applesUrl)
    .then(function (apples) {
      payload.apples = apples

      return payload
    })
}

function createBasket (payload) {
  payload.basket = [payload.bananas, payload.apples]

  return payload
}

function startFlow (payload) {  
  return Promise.resolve(payload)
}

startFlow({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
})
  .then(getBananas)
  .then(getApples)
  .then(createBasket)
  .catch(function (error) {

  })
```

### Side effects
One last thing we want to improve here is the side effect that is happening. Ideally we want to separate the side effects and the flow completely. We can do that by passing in the side effect as part of the flow:

```javascript

// We use an object to represent our
// state store
const state = {}

function get (url) {...}

// We rather pass an object containing
// our side effects and props
function startFlow (props) {
  return Promise.resolve({
    get,
    state,
    props
  })
}

// Note that we are running our "get" from
// the context
function getBananas (context) {
  return context.get(context.props.bananasUrl)
    .then(function (bananas) {
      context.props.bananas = bananas

      return context
    })
}

function getApples (context) {
  return context.get(context.props.applesUrl)
    .then(function (apples) {
      context.props.apples = apples

      return context
    })
}

function createBasket (context) {
  context.props.basket = [context.props.bananas, context.props.apples]

  return context
}

// We create a function factory to show more functional power. It just
// moves a value from the props into our state store
function set (stateKey, propsKey) {
  return function (context) {
    context.state[stateKey] = context.props[propsKey]
  }
}

startFlow({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
})
  .then(getBananas)
  .then(getApples)
  .then(createBasket)
  .then(set('fruitBasket', 'basket'))
  .catch(function (error) {

  })
```

### Summary
With a bit of boilerplate we have solved our three issues:

1. We have made our flow declarative. It is very easy to understand what this flow is doing, as we can just read the function names
2. We have solved the passing of data. By having an argument we in this example call **context**, we can pass in a payload that is added to, instead of replaced for every step in the flow
3. We also pass in the side effect itself to the flow, meaning that we have completely decoupled execution from side effects

What we gain by this is:

1. Reading a step by step reference to named functions gives an instant understanding of what the flow does. This allows you to understand code without the distraction of implementation details and you can also plan implementation as a flow first, then implement
2. We have a consistent way of passing data through our flow. The **props** property is where initial and added data is contained
3. We have increased testability. We can test each function in the flow individually by mocking the **context** passed in. We can even test the whole flow in isolation by using a mocked **context**

If you identify yourself with the promise issues mentioned so far and you see the benefits of the pattern explained here you will have a blast reading the rest of the article. If not, I suggest you keep reading anyways as these ideas gives benefits far beyond readability and testability.

## Defining a context

So in the example above we separated our side effects from the execution:

```javascript

function startFlow (props) {
  return Promise.resolve({
    get,
    state,
    props
  })
}
```

When you instantiate a function-tree, that is exactly what you do. You configure a context that can be used in multiple executions:

```javascript

import FunctionTree from 'function-tree'

const state = {}

function get (url) {...}

const ft = new FunctionTree({get, state})
```

## Executing
To execute our example with plain promises you would:

```javascript

startPromiseFlow({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
})
  .then(getBananas)
  .then(getApples)
  .then(createBasket)
  .then(set('fruitBasket', 'basket'))
```

When you execute a function tree you would rather list the functions in an array:

```javascript

ft.run({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
}, [
  getBananas,
  getApples,
  createBasket,
  set('fruitBasket', 'basket')
])
```

This looks pretty similar, but there is one big hidden secret here. A function tree runs synchronously. That means:

```javascript

// PROMISE
startPromiseFlow({})
  .then(somethingSync)
  .then(somethingElseSync)

console.log('I run before everything else')

// FUNCTION-TREE
ft.run({}, [
  somethingSync,
  somethingElseSync
])

console.log('I run after everything else')
```

Being able to run a flow completely synchronous is important. State changes often needs to trigger a synchronous update to the UI for example.

## Extending props
In our promise example we have to explicitly extend the props and return the context.

```javascript

function getApples (context) {
  return context.get(context.props.applesUrl)
    .then(function (apples) {
      context.props.apples = apples

      return context
    })
}
```

With function tree we can just return an object from any function and it will be merged with existing props, meaning we can take advantage of destructuring as well:

```javascript

function getApples ({get, props}) {
  return get(props.applesUrl)
    .then(function (apples) {
      return {apples}
    })
}
```

## Parallel
Promises has a really nice helper function that allows you to execute multiple promises and wait for their results. Lets say we want to grab the bananas and apples at the same time:

```javascript

startPromiseFlow({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
})
  .then(function (context) {
    return Promise.all([
      getBananas(context)
      getApples(context)
    ])
      .then(function (results) {
        context.props.bananas = results[0]
        context.props.apples = results[1]

        return context
      })
  })
  .then(createBasket)
  .then(set('fruitBasket', 'basket'))
```

With function-tree we have the possibility to create a parallel execution:

```javascript

import {parallel} from 'function-tree'

ft.run({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
}, [
  parallel(
    getBananas,
    getApples,
  ),
  createBasket,
  set('fruitBasket', 'basket')
])
```

## Conditional paths
For promises to run conditional paths you would probably use an if statement:

```javascript

startPromiseFlow({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
})
  .then(function (context) {
    if (context.props.bananasUrl) {
      return getBananas(context)
    }
  })
  .then(getApples)
  .then(createBasket)
  .then(set('fruitBasket', 'basket'))
```

With function tree you can define paths of execution declaratively:

```javascript

import {parallel} from 'function-tree'

function hasBananasUrl ({props, path}) {
  return props.bananasUrl ? path.true() : path.false()
}

ft.run({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
}, [
  hasBananasUrl, {
    true: getBananas,
    false: []
  },
  getApples,
  createBasket,
  set('fruitBasket', 'basket')
])
```

Function tree analyses the whole tree before it executes, meaning that it will identify execution paths and make those available to the functions that can execute them... like **hasBananasUrl** in this example. Being able to also declaratively express conditional paths improves readability even more, especially in complex flows.

## Static analysis
So promises is a low level tool. We used it to create a concept of flow, but as with all low level tools, abstractions can be made to make them more powerful. Also because it is low level there is no way to statically analyse how things will run, but function-tree can. A static analysis means that we get a serializable representation of the flow. For example the flow above:

```javascript

{
  type: 'sequence',
  items: [{
    type: 'function',
    name: 'hasBananasUrl',
    paths: {
      true: {
        type: 'function',
        name: 'getBananas'
      },
      false: {
        type: 'sequence',
        items: []
      }
    }
  }, {
    type: 'function',
    name: 'getApples'
  }, {
    type: 'function',
    name: 'createBasket'    
  }, {
    type: 'function',
    name: 'set'    
  }]
}
```

With a static representation like this we are able to create developer tools. When you use function-tree, either in the browser or on the server you will be able to use a developer tool that gives you all the information about the executions. You will see what executions are made, the props, side effects run and their arguments, sequence execution, parallel execution... even how you compose together the functions and sequences of functions. This is not something you would be able to do with pure promises.

This is an example of the function-tree debugger:

![ft_debugger](/images/ft_debugger.png)

## Async / Await
But you might say... why even try to define this flow with promises? You can just use the new [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function). Even though async await does make it easier to define flows compared to promises it does not encourage declarative code, it encourages imperative code. Let us convert the example above:

```js

async function startAsyncAwaitFlow (props) {
  let bananas = null

  if (props.bananasUrl) {
    bananas = await get(bananasUrl)
  }

  const apples = await get(props.applesUrl)
  const basket = [bananas, apples]

  state.fruitBasket = basket
}

startAsyncAwaitFlow({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
})
```

 Async / await allows us to more naturally access shared variables, as the flow is defined in one function, but it is not declarative. In this example we need to read all the implementation details to understand what it does conceptually. Declarative by definition helps readability and it allows us to create tools like the debugger.
 
 It is also difficult to test this code, as we are likely to point to "outside side effects".
 
 None of the code in the example above can be partly reused, unlike:

```js

const getFruits = [
  hasBananasUrl, {
    true: getBananas,
    false: []
  },
  getApples
]

ft.run({
  bananasUrl: '/bananas',
  applesUrl: '/apples'
}, [
  getFruits,
  createBasket,
  set('fruitBasket', 'basket')
])
```

## Summary
So this article was not about saying that promises and async/await are bad. They are great! But they are also a bit too low level when we want to handle complex flows and write code that is readable and maintainable. With function-tree you get some opinions and guarantees:

- Your side effects are separated from the execution, meaning that testing is easier
- You never have to break out of declarative code, as all you need is on the context. Even when diverging execution you use declarative paths
- High degree of composability. You can safely create a function that operates on its context without thinking about "the stuff around it". You can compose this function into any tree definition, making flows truly feel like putting together lego blocks
- Debugging flows can be difficult when your only reference is the code itself. With function-tree you get a debugger that understands the flow and gives you insight on a higher abstraction level

The function-tree project was not just some idea or theory. After the first iteration of the [Cerebral project](http://www.cerebraljs.com) it was obvious that this implementation could power more than the framework itself, it could be published as a standalone abstraction to handle flows. During development of Cerebral 2 there has been many iterations, testing function-tree in many different scenarios and it has proven itself to be a practical way to structure your code.

If you want to try function-tree you can head over to the [Cerebral website](http://www.cerebraljs.com) or check out the [repo](https://github.com/cerebral/cerebral/tree/master/packages/function-tree) to get going quickly.
