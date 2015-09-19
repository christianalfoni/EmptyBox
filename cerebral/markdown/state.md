# State

The state argument is your endpoint to the state store. Think of the state store as a plain
object and the mutation methods operates on that object.

Let us start with an example:

```javascript

function myAction (input, state, output, services) {

  state.set('isLoading', false);

  state.get(); // {isLoading: false}

}
```

This will change the state at the top level of the object. To change nested values you
use an array.

```javascript

function myAction (input, state, output, services) {

  state.set(['user', 'isLoading'], false);

  state.get(); // {{user: {isLoading: false }}

}
```

As you can see we are using the *get* method to grab state from the state store. We can use
strings and arrays here also to be more specific.

```javascript

function myAction (input, state, output, services) {

  state.get('isLoading'); // false
  state.get(['user', 'isLoading']); // false

}
```

### Mutation methods
The methods you use to change the state of your application are typical mutation methods
you know from JavaScript.

```javascript

function myAction (input, state, output, services) {

  // Set value on property
  state.set('isLoading', false);

  // Remove property
  state.unset('isLoading');

  // Merge object with object on property
  state.merge('user', {name: 'foo'});

  // Normal array push
  state.push('list', 'foo');

  // Normal array unshift
  state.unshift('list', 'bar');

  // Normal array pop
  state.pop('list');

  // Normal array shift
  state.shift('list');

  // Normal array concat
  state.concat('list', [1, 2, 3]);

  // Normal array splice
  state.splice('list', 1, 1, [1]);

}
```
