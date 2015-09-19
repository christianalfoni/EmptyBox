# Type Checking

When working on large applications you will have a lot of signals and actions. Large applications also requires team members that work on the same codebase. It is important to define intents in the code. Intents helps ensuring that the code runs as intended. One such intent is type checking. With Cerebral you can type checking the inputs to an action and its output.

### Input

```javascript

function myAction (input, state, output, services) {

}

myAction.input = {
  foo: String
};
```

Cerebral lets you do very basic type checking using the native constructors of JavaScript. In the example above we expect that the input reaching *myAction* will have a *foo* property where the value is a string. The following type checks are available.

```javascript

function myAction (input, state, output, services) {

}

myAction.input = {
  a: String,
  b: Number,
  c: Boolean,
  d: Object,
  e: Array,
  f: null,
  g: undefined
};
```

### Custom type checking

If this type checking does not meet your requirements you can add your own. A type check can also be a function.

```javascript

function myAction (input, state, output, services) {

}

myAction.input = {
  foo: function (value) {
    return typeof value === 'string';
  }
};
```

This allows you to bring in other type checking libraries. An example of that would be:

```javascript

import check from 'check-types';

function myAction (input, state, output, services) {

}

myAction.input = {
  foo: check.number,
  bar: check.array.of.string
};
```

### Output

The outputs of an action can also be type checked.

```javascript

function myAction (input, state, output, services) {
  output({
    foo: 'bar'
  });
}

myAction.output = {
  foo: String
};
```

Or with multiple outputs:

```javascript

function myAction (input, state, output, services) {
  output.a({
    foo: 'string'
  });
  // Or
  output.b({
    bar: 'string'
  });
}

myAction.outputs = {
  a: {
    foo: String
  },
  b: {
    bar: String
  }
};
```
