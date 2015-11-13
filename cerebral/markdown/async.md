# Async

All actions are defined the same way, they being asynchronous or not. What decides if an action runs asynchronously is the signal. This is done by using an array. **Note!** that you can not use the state mutation methods in async actions. Looking at the the *state* page you can see what methods or not available in async actions.

```javascript

const signal = [
  syncAction,
  [
    asyncAction
  ]
];

controller.signal('somethingHappened', signal);
```

If you define multiple actions in the same array they will run in parallel.

```javascript

const signal = [
  syncAction,
  [
    asyncAction,
    asyncAction2
  ]
];

controller.signal('somethingHappened', signal);
```

Actions defined after an asynchronous array will run after all the actions inside the array are done.

```javascript

const signal = [
  syncAction,
  [
    asyncAction,
    asyncAction2
  ],
  afterAsyncsAreDone
];

controller.signal('somethingHappened', signal);
```

Even though the actions run in parallel they also have individual behavior. This is related to paths. In the following example the success path of each action will run when it outputs.

```javascript

const signal = [
  syncAction,
  [
    wait1000, {
      success: [runsAfter1000]
    },
    wait2000, {
      success: [runsAfter2000]
    }
  ],
  runsAfter2000
];

controller.signal('somethingHappened', signal);
```

Sometimes you want to track the progress of parallel async operations. You achieve this simply by using actions.

```javascript

function resetProgress (input, state, output) {
  state.set('progress', 0);
}

function progress (input, state, output) {
  state.set('progress', state.get('progress') + 50);
}

const signal = [
  resetProgress,
  [
    wait1000, {
      success: [progress]
    },
    wait2000, {
      success: [progress]
    }
  ]
];

controller.signal('somethingHappened', signal);
```

You could of course create a factory to make this more dynamic.
