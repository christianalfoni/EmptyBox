# Immutable JS STATE package

### Install
`$ npm install cerebral-immutable-js`

### Repo
[cerebral-immutable-js](https://github.com/christianalfoni/cerebral-immutable-js)

### Features
The is Facebooks super high performance immutable library. Note that all values extracted from the state store is extracted as they would be with
immutable-js. Read more about immutable-js at the [webpage](https://facebook.github.io/immutable-js/).

### Get started

```javascript

import Controller from 'cerebral';
import Model from 'cerebral-immutable-js';
import request from 'superagent';

// The initial state of the application
const model = Model({
  isLoading: false,
  user: null,
  error: null
});

// Any utils you want each action to receive
const services = {
  request: request
};

// Instantiate the controller
export default Controller(model, services);
```
