# Baobab STATE package

### Install
`$ npm install cerebral-baobab`

### Repo
[cerebral-baobab](https://github.com/christianalfoni/cerebral-baobab)

### Features
Baobab allows you to use facets to map state. Baobab also allows you to validate any changes
to the state tree. Read more about Baobab at the [github repo](https://github.com/Yomguithereal/baobab/tree/v2).

### Get started

```javascript

import Controller from 'cerebral';
import Model from 'cerebral-baobab';
import request from 'superagent';

// Any Baobab options
const options = {

};

// The initial state of the application
const model = Model({
  isLoading: false,
  user: null,
  error: null
}, options);

// You have access to the Baobab tree itself
model.tree.on('invalid', function () {

});

// Any utils you want each action to receive
const services = {
  request: request
};

// Instantiate the controller
export default Controller(model, services);
```

### Monkeys

Monkeys are a high performant way to map state.

```javascript

import Controller from 'cerebral';
import Model from 'cerebral-baobab';

const VisibleTodos = Model.monkey({
  cursors: {
      todos: ['todos'],
      ids: ['visibleTodos', 'ids']
  },
  get(data) {
    return data.ids.map((id) => data.todos[id]);
  }
});

// The initial state of the application
const model = Model({
  todos: {},
  visibleTodos: {
    ids: [],
    list: VisibleTodos
  }
});
```

This allows you to handle relational state with ease. It also makes it possible to separate the data from how you want to display that data.
