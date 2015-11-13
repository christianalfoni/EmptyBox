# Output

All actions are able to output values. These values will be merged with the input on
the next actions.

```javascript

function actionA (input, state, output) {
    output({
      bip: 'bop'
    });
}

function actionB (input, state, output) {
  input.foo; // "bar"
  input.bip; // "bop"
}

const signal = [
  actionA,
  actionB
];

controller.signal('somethingHappened', signal);

controller.signals.somethingHappened({
  foo: 'bar'
});

```

In the example above we call *output* directly. When doing so the next item in the signal has to be an action, it can not be an object representing paths.

### Paths
An action might want to take different paths based on some conditional. A example of this would be:

```javascript

function getItems (input, state, output) {
  fetch('/items')
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      output.success({json: json});
    }).catch(function(ex) {
      output.error({ex: ex});
    });
}

const signal = [
  [
    getItems, {
      success: [setItems],
      error: [setError]
    }
  ]
];

controller.signal('somethingHappened', signal);
```

But you can define your own custom output paths if you want to. Note that actions does not know about paths they are currently running on. They only get inputs. The previous action could do an `output({})` or `output.success({})`, or nothing at all. An action always just starts with some input and can itself decide a path to take next.

### Custom outputs

```javascript

function getItems (input, state, output) {
  // For simplicities sake
  output.success();
  output.notFound();
  output.notAuthenticated();
  output.error();
}

getItems.outputs = [
  'success',
  'notFound',
  'notAuthenticated',
  'error'
];

const signal = [
  [
    getItems, {
      success: [setItems],
      notFound: [displayNotFoundError],
      notAuthenticated: [displayAuthenticationError]
      error: [setError]
    }
  ]
];

controller.signal('somethingHappened', signal);
```
This is a powerful tool to express the flow of your application. This can be combined with *factories* and *chains* to create default behavior in your signals. The new ES6 *spread* operator is also a great tool for signals. An example of that would be:

```javascript

const signal = [
  [
    ...get('/items', {
      success: [setItems]
    })
  ]
];

controller.signal('somethingHappened', signal);
```
If this is not perfectly clear to you, do not worry. You will learn more about *factories*, *chains* and the *spread operator*.

### Default output

When defining outputs you can also define which one of those outputs are default.

```javascript

function myAction (input, state, output) {
  output(); // Will go to path "foo"
}

myAction.outputs = ['foo', 'bar'];
myAction.defaultOutput = 'foo';
```
