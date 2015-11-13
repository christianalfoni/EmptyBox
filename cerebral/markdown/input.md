# Input

```javascript

function myAction (input, state, output) {
  input.foo; // "bar"
}

const signal = [
  myAction
];

controller.signal('somethingHappened', signal);

controller.signals.somethingHappened({
  foo: 'bar'
});
```

The input argument has to be serializable. That means it only supports the base JavaScript types. These are *objects*, *arrays*, *strings*, *numbers*, *booleans* and *null*. Think of it as JSON compatible. There are two reasons for this:

1. Cerebral will need to store information about the signals, also their inputs. This is related to debugging and recording. The information is stored either in *localStorage* or on the server. That means it has to be serialized to the string format
2. It is simpler to reason about your application as objects, arrays etc. Many frameworks and libraries hides these simple data structures in complex abstractions

The input can be updated in two different ways. Any object passed when you trigger a signal will be merged with the input. Also any outputs from an action will be merged with the input. Take notice that the input is available to all actions in the signal.

```javascript

function myAction (input, state, output) {
  input.foo; // "bar"
}

function myAction2 (input, state, output) {
  input.foo; // "bar"
}

const signal = [
  myAction,
  myAction2
];

controller.signal('somethingHappened', signal);

controller.signals.somethingHappened({
  foo: 'bar'
});
```

Look more into outputs to see more examples of how the input updates.

### Default input
You can set default inputs to actions.

```javascript

function myAction (input, state, output) {
  input.foo; // "bar"
}

myAction.defaultInput = {
  foo: 'bar'
};
```
