[cerebral-tcomb](https://github.com/gcanti/cerebral-tcomb) - @gcanti **/** [tcomb](https://github.com/gcanti/tcomb) - @gcanti

`npm install cerebral-tcomb`

- An immutable state tree
- Type checking of state built in
- Supports recording

```javascript

// controller.js

import Controller from 'cerebral';
import Model from 'cerebral-tcomb';
import request from 'superagent';

// The tcomb library
const t = Model.t;

// Define the state type
const State = t.struct({
  email: t.String,
  profile: t.struct({
    age: t.Number
  }),
  tags: t.list(t.String),
  other: t.Any
});

// The initial state of the application
const initialState = State({
  email: 'a@domain.com',
  profile: {
    age: 41
  },
  tags: ['web developer'],
  other: {a: 1}
});

// Any servicesyou want each action to receive. In this
// example we pass in superagent ajax library
const services = {
  request: request
};

// instantiate the controller
// the argument `State` is optional, by default its value
// is the initialState's constructor
var model = Model(initialState, State);

// instantiate the controller
export default Controller(model, services);
```
