# The case for function tree

In this article I am going to talk about writing good code and what challenges we face reaching for it. Readable, declarative, composable and testable are all terms related to writing good code. Often pure functions is referred to as the solution, but writing web applications is mostly about side effects and complex asynchronous flows, concepts that are inherently impure. We are going to look at a concept that allows us to inherit all these great attributes of pure functions and still embrace side effects and complex asynchronous flows.

## Writing good code
The holy grail of writing good code is **pure functions**. A pure function is basically a function that will always produce the same output based on the input:


```javascript

function add(numA, numB) {
  return numA + numB
}
```

The benefits of pure functions is that they are easy to test.

```javascript

test.equals(add(2, 2), 4)
```

They also have the benefit of composability.

```javascript

test.equals(add(2, add(4, 4)), 10)
```

And they can easily be used in a declarative manner, here with two other pure functions.

```javascript

const totalPoints = users
  .map(take('points'))
  .reduce(sum, 0)
```

But if you take a look at your application. How much of it can really be expressed as a pure function? How much of it is really about transforming values, which pure functions traditionally do? I would suggest most of your code is not about transforming values, but running side effects. You do http requests, DOM manipulation, websockets, local storage, workers, state changes etc. That is what application development is all about, at least on the web.

## Side effects
Typically we refer to side effects as:

```javascript

var numberThatMayChange = 5
function add(num) {
  return num + numberThatMayChange
}
```

Our function points to something "outside itself", so we can not ensure that the function will return the same result every time.

A popular term with projects like [Elm](), [Cycle](), and implementations in [redux](), is to "push side effects to the edge of your app". This basically means that your application business logic is kept pure and whenever you want to do a side effect you have to decouple it. The problem with this approach, arguably, is that it does not help readability. You can not express a coherent complex flow. Your application will have multiple decoupled cycles which hides the relationship of one side effect causing an other side effect, and so on. This does not matter on simple apps, because you rarely have more than one extra cycle, but in big applications you can end up with a lot of cycles and it is very difficult to understand how it is all connected.

But what about this function, is it pure?

```javascript

function getUsers(fetch) {
  return fetch('/users')
}
```

Given the function gets the request object, it will always return a promise. It still causes a side effect though and we can not ensure the promised value. Nevertheless a promise will be returned. By this definition I would state that this is indeed a pure function. You might not agree with that, but my point here is not to argue the definition of a pure function, but rather say that we can achieve readable, declarative, composable and testable code embracing side effects as well... we just need to handle them in a way that allows us to get these benefits.

Lets dive a bit more into this.

## A typical application flow
So lets say you have an application. When the application mounts you want to grab data about the user to verify if the user is logged in or not. Then you want to grab some assignments. These assignments refers to other users, so you need to dynamically grab information about them as well based on the result of the assignments. How would we go about making this flow readable, declarative, composable and testable?

A naive implementation would be, using [redux]() as an example:

```javascript

function loadData() {
  return (dispatch, getState) => {
    dispatch({
      type: AUTHENTICATING
    })
    axios.get('/user')
      .then((response) => {
        if (response.data) {
          dispatch({
            type: AUTHENTICATION_SUCCESS,
            user: response.data
          })
          dispatch({
            type: ASSIGNMENTS_LOADING
          })
          return axios.get('/assignments')
            .then((response) => {
              dispatch({
                type: ASSIGNMENTS_LOADED_SUCCESS,
                assignments: response.data
              })
              const missingUsers = response.data.reduce((currentMissingUsers, assignment) => {
                if (!getState().users[assigment.userId]) {
                  return currentMissingUsers.concat(assignment.userId)
                }
                return currentMissingUsers
              }, [])
              dispatch({
                type: USERS_LOADING,
                users: users
              })
              return Promise.all(
                missingUsers.map((userId) => {
                  return axios.get('/users/' + userId)
                })
              )
                .then((responses) => {
                  const users = responses.map(response => response.data)
                  dispatch({
                    type: USERS_LOADED,
                    users: users
                  })
                })
            })
            .catch((error) => {
              dispatch({
                type: ASSIGNMENTS_LOADED_ERROR,
                error: error.response.data
              })
            })
        } else {
          dispatch({
            type: AUTHENTICATION_ERROR
          })
        }
      })
      .catch(() => {
        dispatch({
          type: LOAD_DATA_ERROR
        })  
      })
  }
}
```
As you can see we are doing everything wrong here. This is not readable, declarative, composable or testable. But there is actually one benefit. Everything that happens when you call **loadData** is defined in one file. If we would push our side effects "to the edge of the application" this would look more like:

```javascript

function loadData() {
  return (dispatch, getState) => {
    dispatch({
      type: AUTHENTICATING_LOAD_DATA
    })
  }
}

function loadDataAuthenticated() {
  return (dispatch, getState) {
    axios.get('/user')
      .then((response) => {
        if (response.data) {
          dispatch({
            type: AUTHENTICATION_SUCCESS,
            user: response.data
          })
        } else {
          dispatch({
            type: AUTHENTICATION_ERROR
          })
        }
      })
  }
}

function getAssignments() {
  return (dispatch, getState) {
    dispatch({
      type: ASSIGNMENTS_LOADING
    })
    axios.get('/assignments')
      .then((response) => {
        dispatch({
          type: ASSIGNMENTS_LOADED_SUCCESS,
          assignments: response.data
        })
      })
      .catch((error) => {
        dispatch({
          type: ASSIGNMENTS_LOADED_ERROR,
          error: error.response.data
        })
      })
  }
}
```

Note that this is just part of the flow.

Each part reads better than our previous example and it is also easier to compose these into other flows. The problem though is the decoupling. It is very hard to understand how these parts relate to each other, because you can not see which function leads to the execution of an other function. We need to jump into multiple files and compose in our head how one dispatch causes a side effect, which does something and triggers a new dispatch which causes another side effect, which again causes something else to happen with a new dispatch...

So pushing side effects to the edge of your application to keep the code pure does not necessarily make it easier to reason about the code. This can of course be argued, and it should, but I hope I got the point through with the examples and the reasoning above.

## Making it declarative
So what if we could write the flow above like this:

```javascript

[
  dispatch(AUTHENTICATING),
  authenticateUser, {
    error: [
      dispatch(AUTHENTICATED_ERROR)
    ],
    success: [
      dispatch(AUTHENTICATED_SUCCESS),
      dispatch(ASSIGNMENTS_LOADING),
      getAssignments, {
        error: [
          dispatch(ASSIGNMENTS_LOADED_ERROR)
        ],
        success: [
          dispatch(ASSIGNMENTS_LOADED_SUCCESS),
          dispatch(MISSING_USERS_LOADING),
          getMissingUsers, {
            error: [
              dispatch(MISSING_USERS_LOADED_ERROR)
            ],
            success: [
              dispatch(MISSING_USERS_LOADED_SUCCESS)
            ]
          }
        ]
      }
    ]
  }
]
```

Notice here that this is valid code for what we are about to dive into. Also notice that we are not using any magical API here, it is just arrays, objects and functions. But most importantly we take full advantage of declarative code to create a coherent and readable description of a complex application flow.

## Function Tree
So what we just did now was to define a function tree. As mentioned there was no special API to define this. It is just functions **decleared** in a tree... a function tree. Any of the functions used here, also the factories (dispatch) can be reused in any other tree definition. That means it is **composable**. What makes these trees particularly interesting in regards of composability is that not only each function can be composed into other trees, but you can compose a whole tree into an other:

```javascript

[
  dispatch(AUTHENTICATING),
  authenticateUser, {
    error: [
      dispatch(AUTHENTICATED_ERROR)
    ],
    success: [
      dispatch(AUTHENTICATED_SUCCESS),
      ...getAssignments
    ]
  }
]
```

In this example we have created a new tree, *getAssignments*, which is also an array. With the spread operator we are able to compose in the whole tree.

Before we move to **testability** we should explore a bit more how these function trees work. Lets run one!

## Running a function tree
So a compressed example of how to run a function tree looks like:

```javascript

import FunctionTree from 'function-tree'

const execute = new FunctionTree()

function foo() {}

execute([
  foo
])
```

When you instantiate a function tree it will return a function that lets you execute trees. In the example above the function **foo** will be run. If we added more functions it would run them in order:

```javascript

function foo() {
  // Me first
}

function bar() {
  // Then me
}

execute([
  foo,
  bar
])
```

### Async
A function-tree understands promises. So when a function returns a promise, or you define a function as `async function` it will wait until it resolves/rejects, before moving on.

```javascript

function foo() {
  return new Promise(resolve => {
    setTimeout(resolve, 1000)
  })
}

function bar() {
  // After 1 second I run
}

execute([
  foo,
  bar
])
```

But often asynchronous code can have different outcomes. To understand how we can declaratively define these outcomes we  need to explore the **context** of a function tree.

### The context
All the functions run by the function tree will receive one single argument, the **context**. This context argument is the only argument these functions should operate on. By default this context has two properties, **input** and **path**.

The input holds the current payload. So if you execute a tree with a payload it will hold that payload.

```javascript

// We use destructuring
function foo({input}) {
  input.foo // "bar"
}

execute([
  foo
], {
  foo: 'bar'
})
```

When a function wants to pass payload down the tree it will need to return an object which will be merged into the current payload.

```javascript

// We use destructuring
function foo({input}) {
  input.foo // "bar"
  return {
    foo2: 'bar2'
  }
}

function bar({input}) {
  input.foo // "bar"
  input.foo2 // "bar2"
}

execute([
  foo
], {
  foo: 'bar'
})
```

It does not matter if the function is synchronous or asynchronous, you just return an object.

```javascript

// Sync
function foo() {
  return {
    foo: 'bar'
  }
}

// Async
function foo() {
  return new Promise(resolve => {
    resolve({
      foo: 'bar'
    })
  })
}
```

As you might have noticed in earlier examples you also need a way to choose a path to execute.

### Paths
The result returned from a function can also define a path to take. The **path** on the context already knows what paths can be taken due to the function tree static analysis. That means it is only available and can only move down execution paths that is actually defined in the tree.

```javascript

function foo({path}) {
  return path.pathA()
}

function bar() {
  // I will trigger
}

execute([
  foo, {
    pathA: [
      bar
    ],
    pathB: []  
  }
])
```

You can also pass a payload to a path by passing an object to the path method.

So why are these paths a good thing? First of all, they are declarative. There are no **IF** or **SWITCH** statements here. This increases the readability. But there are small hidden traits here as well. For example when you define a function tree you can do so without implementing anything. That means all the possible paths of execution is also defined before implementation. This forces you to think about what you need to handle and it is less likely that you ignore or forget about scenarios that might occur.

### Providers
So an **input** and a **path** does not get you very far. That is why function tree is based on a concept called **providers**. Actually both the input and the path are providers. There are already optional providers available and you are completely free to build your own. Lets say you want to use Redux:

```javascript

import FunctionTree from 'function-tree'
import ReduxProvider from 'function-tree/providers/Redux'
import store from './store'

const execute = new FunctionTree([
  ReduxProvider(store)
])

export default execute;
```

Now you have access to **dispatch** and **getState** in your functions:

```javascript

function doSomething({dispatch, getState}) {
  dispatch({
    type: SOME_CONSTANT
  })
  getState() // {}
}
```

You can add whatever other tools by simply using the **ContextProvider**:

```javascript

import FunctionTree from 'function-tree'
import ReduxProvider from 'function-tree/providers/Redux'
import ContextProvider from 'function-tree/providers/Context'
import axios from 'axios'
import store from './store'

const execute = new FunctionTree([
  ReduxProvider(store),
  ContextProvider({
    axios
  })
])

export default execute;
```

But maybe the one provider you definitely want to use is the **DebuggerProvider**. In combination with the chrome extension you can debug whatever you are working on. For example adding the debugger provider to the above example:

```javascript

import FunctionTree from 'function-tree'
import DebuggerProvider from 'function-tree/providers/Debugger'
import ReduxProvider from 'function-tree/providers/Redux'
import ContextProvider from 'function-tree/providers/Context'
import axios from 'axios'
import store from './store'

const execute = new FunctionTree([
  DebuggerProvider(),
  ReduxProvider(store),
  ContextProvider({
    axios
  })
])

export default execute;
```

Allows you to see everything that is happening as you execute these trees in your application. The debugger provider will automatically wrap and track the use of whatever you put on the context:

![debugger](/images/functiontreedebugger.png)

If you use function tree on the server you can debug using the **NodeDebuggerProvider** which looks something like this:

## Testability
But maybe most importantly we need a good way to test the function tree. As it turns out this is very easy to do. To test one of the functions in a function tree you just call it with a custom context. For example a function doing this side effect:

```javascript

function setData({window, input}) {
  window.app.data = input.result
}
```

```javascript

const mockedWindow = { app: {}}

setData({
  input: {result: 'foo'},
  window: mockedWindow
})

test.deepEqual(mockedWindow, {app: {data: 'foo'}})
```

### Testing returned results

```javascript

function setData({window, input}) {
  window.app.data = input.result
  return {
    foo: 'bar'
  }
}
```

```javascript

const mockedWindow = { app: {}}
const result = setData({
  input: {result: 'foo'},
  window: mockedWindow
})

test.deepEqual(mockedWindow, {app: {data: 'foo'}})
test.deepEqual(result, {foo: 'bar'})
```

### Testing async functions
Many test libraries allows you to mock global dependencies etc. There is no reason to do this with a function tree because everything the function uses is on the context. That means for example using [axios]() to get some data...

```javascript

function getData({axios, path}) {
  return axios.get('/data')
    .then(response => path.success({data: response.data}))
    .catch(error => path.error({error: error.response.data}))
}
```
...can be tested like:
```javascript

const context = {
  axios: {
    get: Promise.resolve({
      data: {foo: 'bar'}
    })
  }
}

getData(context)
  .then((result) => {
    test.equal(result.path, 'success')
    test.deepEqual(result.payload, {data: {foo: 'bar'}})
  })
```

### Testing the whole tree
So this is where it gets interesting. The same way we tested each function we can also test the whole tree.

Let us imagine a simple tree like:

```javascript

[
  getData, {
    success: [
      setData
    ],
    error: [
      setError
    ]
  }
]
```

These functions uses axios to fetch data and then sets the data on the window. We test this by creating a new function tree where we mock the providers. Then we execute it and verify the changes when it is done running.

```javascript

const FunctionTree = require('function-tree')
const ContextProvider = require('function-tree/providers/Context')
const loadData = require('../src/trees/loadData')

const context = {
  window: {app: {}},
  axios: {
    get: Promise.resolve({data: {foo: 'bar'}})
  }
}
const execute = new FunctionTree([
  ContextProvider(context)
])

execute(loadData, () => {
  test.deepEquals(context.window, {app: {data: 'foo'}})
})
```

So it does not really matter what library you are using. As long as you hook it on the context of the function tree you can easily test it.

## Factories
Since the tree is functional you can create factories that will speed up your development. One such factory you saw in the Redux example above, **dispatch**. It was built doing:

```javascript

function dispatchFactory(action) {
  function dispatchFunction({input, dispatch}) {
    dispatch({
      type: action,
      payload: input
    })
  }
  dispatchFunction.displayName = `dispatch - ${action}`;

  return dispatchFunction;
}

export default dispatchFactory;
```

It is a good idea to create factories for your application to avoid creating specific functions for everything. Let us say you want to use the [Baobab]() project, the single state tree, to store state.

```javascript

function setFactory(path, value) {
  function set({baobab}) {
    baobab.set(path.split('.'), value);
  }

  return set;
}

export default set;
```

This factory allows you to make state changes directly in the tree with:

```javascript

[
  set('foo', 'bar'),
  set('admin.isLoading', true)
]
```

You can pretty much use factories to create a domain specific language for the app. Some of these factories are so generic that they are actually part of function tree.

### Debounce
Debounce allows you to hold an execution for a set time. If new executions are triggered on the same tree existing holding executions will go down the *discarded* path. If no new executions are triggered within the time set, it will run down the *accepted* path. This is typically used for search typeahead.

```javascript

...
import debounce from 'function-tree/factories/debounce';

export default [
  updateSearchQuery,
  debounce(500), {
    accepted: [
      getData, {
        success: [
          setData,
        ],
        error: [
          setError
        ]
      }
    ],
    discarded: []
  }
]
```

### Throttle

### Wait
