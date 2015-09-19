# Signals

The way you think of signals is that something happened in your application. Either in your UI, a router, maybe a websocket connection etc. So the name of a signal should define what happened: *appMounted*, *inputChanged*, *formSubmitted*. The functions in a signal is called **actions**. They are named by their purpose, like *setInputValue*, *postForm* etc. This will make it very easy for you to read and understand the flow of the application.

This is a typical signal:

```javascript

controller.signal('appMounted',
  setLoading,
  [
    getUser, {
      success: [setUser],
      error: [setUserError]
    }
  ],
  unsetLoading
);
```

As you see there are not only functions that are used to express flow. You also have arrays and objects. Arrays are used to express asynchronous actions. That means any actions defined inside an array can resolve at a later point in time. An object is used to define paths. This means that the execution of an action can result in different outcomes.

Note that the actions *setUser* and *setUserError* are not asynchronous. This means that "every other" nested array expresses asynchronous flow.

### Why are not all actions asynchronous?
It would indeed be easier if all actions ran asynchronous, like *promises* do. The problem with this approach though is that sync/async execution matters. In the example above we want to express that we first set a loading state. When Cerebral runs this action it will actually emit an event to the UI and tell it to update itself. The reason is that the next item in line is an array, asynchronous execution. So now our UI displays the loading state and the asynchronous code runs. When it is done the last *unsetLoading* action will run and the UI updates again. If all actions were asynchronous this flow would not be possible.
