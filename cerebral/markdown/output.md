# Output

All actions are able to output values. These values will be merged with the input on
the next actions.

```javascript

function actionA (input, state, output, services) {
    output({
      bip: 'bop'
    });
}

function actionB (input, state, output, services) {
  input.foo; // "bar"
  input.bip; // "bop"
}

controller.signal('somethingHappened', actionA, actionB);

controller.signals.somethingHappened({
  foo: 'bar'
});

```

In the exampel above we call *output* directly. When doing so the next item in the signal has to be an action. By default you can also use *success* or *error* to output to paths.

### Paths
An action might want to take different paths based on some conditional. A example of this would be:

```javascript

function getItems (input, state, output, services) {
  fetch('/items')
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      output.success({json: json});
    }).catch(function(ex) {
      output.error({ex: ex});
    });
}

controller.signal('somethingHappened',
  [
    getItems, {
      success: [setItems],
      error: [setError]
    }
  ]
);
```

But you can define your own custom output paths if you want to.

### Custom outputs

```javascript

function getItems (input, state, output, services) {
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

controller.signal('somethingHappened',
  [
    getItems, {
      success: [setItems],
      notFound: [displayNotFoundError],
      notAuthenticated: [displayAuthenticationError]
      error: [setError]
    }
  ]
);
```
This is a powerful tool to express the flow of your application. This can be combined with *factories* and *chains* to create default behavior in your signals. The new ES6 *spread* operator is also a great tool for signals. An example of that would be:

```javascript

controller.signal('somethingHappened',
  [
    ...get('/items', {
      success: [setItems]
    })
  ]
);
```
If this is not perfectly clear to you, do not worry. You will learn more about *factories*, *chains* and the *spread operator*.

### Default output

When defining outputs you can also define which one of those outputs are default.

```javascript

function myAction (input, state, output, services) {
  output(); // Will go to path "foo"
}

myAction.outputs = ['foo', 'bar'];
myAction.defaultOutput = 'foo';
```
