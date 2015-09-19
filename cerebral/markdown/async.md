# Async

All actions are defined the same way, they being asynchronous or not. What decides if an action runs asynchronously is the signal. This is done by using an array.

```javascript

controller.signal('somethingHappened',
  syncAction,
  [
    asyncAction
  ]
);
```

If you define multiple actions in the same array they will run in parallel.

```javascript

controller.signal('somethingHappened',
  syncAction,
  [
    asyncAction,
    asyncAction2
  ]
);
```

Actions defined after an asynchronous array will run after all the actions inside the array are done.

```javascript

controller.signal('somethingHappened',
  syncAction,
  [
    asyncAction,
    asyncAction2
  ],
  afterAsyncsAreDone
);
```

Even though the actions run in parallel they also have individual behavior. This is related to paths. In the following example the success path of each action will run when it outputs.

```javascript

controller.signal('somethingHappened',
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
);
```

Sometimes you want to track the progress of parallel async operations. You achieve this simply by using actions.

```javascript

function resetProgress (input, state, output, services) {
  state.set('progress', 0);
}

function progress (input, state, output, services) {
  state.set('progress', state.get('progress') + 50);
}

controller.signal('somethingHappened',
  resetProgress,
  [
    wait1000, {
      success: [progress]
    },
    wait2000, {
      success: [progress]
    }
  ]
);
```

You could of course create a factory to make this more dynamic.
