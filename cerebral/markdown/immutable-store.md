# Immutable-Store STATE package

### Install
`$ npm install cerebral-immutable-store`.

### Repo
[cerebral-immutable-store](https://github.com/christianalfoni/cerebral-immutable-store)

### Features
Immutable-Store allows you to map state to new state.

```javascript

const state = {
  items: {},
  displayedItems() {
    return {
      value: [],
      deps: {
        items: ['items']
      },
      get(value, deps) {
        return value.map((id) => {
          return deps.items[id];
        });
      }
    };
  }
};
```
You can read more about this in the [immutable-store](https://github.com/christianalfoni/immutable-store) repo.

### Get started

```javascript

import Controller from 'cerebral';
import Model from 'cerebral-immutable-store';
import request from 'superagent';

// The initial state of the application
const model = Model({
  isLoading: false,
  user: null,
  error: null
});

// Any services you want each action to receive
const services = {
  request: request
};

// Instantiate the controller
export default Controller(model, services);
```
