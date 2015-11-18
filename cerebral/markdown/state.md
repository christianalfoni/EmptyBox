# State

The state argument is your endpoint to the state store. Think of the state store as a plain
object and the mutation methods operates on that object.

Let us start with an example:

```javascript

function myAction (input, state, output) {

  state.set('isLoading', false);

  state.get(); // {isLoading: false}

}
```

This will change the state at the top level of the object. To change nested values you
use an array.

```javascript

function myAction (input, state, output) {

  state.set(['user', 'isLoading'], false);

  state.get(); // {{user: {isLoading: false }}

}
```

As you can see we are using the *get* method to grab state from the state store. We can use
strings and arrays here also to be more specific.

```javascript

function myAction (input, state, output) {

  state.get('isLoading'); // false
  state.get(['user', 'isLoading']); // false

}
```

### Mutation methods
The methods you use to change the state of your application are typical mutation methods
you know from JavaScript. Collection methods however returns the mutated value instead
of the value the corresponding Array.prototype method returns.

**Note!** These methods are not available when an action runs asynchronously.

```javascript

function myAction (input, state, output) {

  // Set value on property
  state.set('isLoading', false);

  // Remove property
  state.unset('isLoading');

  // Remove multiple properties
  state.unset('messages', ['123', '456', '789']);

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

### Accessors
Accessors are methods that lets you grab state from the state store.

```javascript

function myAction (input, state, output) {

  // Get from the top level of tree
  state.get('isLoading'); // false

  // Get from nested level of tree
  state.get(['user', 'isLoading']); // false

  // Get keys, given state is an object
  state.keys('messages'); // ["id1", "id2", "id3"]

  // Get first match given state is an array with objects
  state.findWhere(['admin', 'users'], {name: 'Jack Frost'});

  // Exports a guaranteed serializable version of the state store
  state.export(); // {foo: 'bar'}

  // Deep merges data into state store
  state.import({
    foo: 'bar',
    admin: {
      isLoading: true
    }
  }); // {foo: 'bar', somethingElse: 'hey', admin: {isLoading: true, users: []}}

  // EXPERIMENTAL: get computed state
  state.getComputed(['someComputed']);

}
```
