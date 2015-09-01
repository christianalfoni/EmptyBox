[cerebral-baobab](https://github.com/christianalfoni/cerebral-baobab) - @christianalfoni **/** [baobab](https://github.com/Yomguithereal/baobab) - @Yomguithereal

`npm install cerebral-baobab`


- Uses V2 release candidate
- An immutable state tree
- Allows you to use facets to map state
- Does not currently support recording

```javascript

// controller.js

import Controller from 'cerebral';
import Model from 'cerebral-baobab';
import request from 'superagent';

// Baobab specific options
const options = {};

// The initial state of the application
const state = {
  isLoading: false,
  user: null,
  error: null
};

// Instantiate the model
const model = Model(state, options);

// Any default input you want each action to receive. In this
// example we pass in superagent ajax library
const defaultInput = {
  utils: {
    request: request
  }
};

// Instantiate the controller
export default Controller(model, defaultInput);
```
