# Tcomb STATE package

### Install
`$ npm install cerebral-tcomb`

### Repo
[cerebral-tcomb](https://github.com/gcanti/cerebral-tcomb)

### Features
With Tcomb you define your state using types. Read more about that at the [cerebral-tcomb repo](https://github.com/gcanti/cerebral-tcomb).

### Get started

```javascript

var Controller = require('cerebral');
var Model = require('cerebral-tcomb');
var t = Model.t;

// define the state type
var State = t.struct({
  email: t.String,
  profile: t.struct({
    age: t.Number
  }),
  tags: t.list(t.String),
  other: t.Any
});

// the initial state of the application
var initialState = State({
  email: 'a@domain.com',
  profile: {
    age: 41
  },
  tags: ['web developer'],
  other: {a: 1}
});

// any services you want each action to receive
var services = {};

// instantiate the model
// the argument `State` is optional, by default its value
// is the initialState's constructor
var model = Model(initialState, State);

// instantiate the controller
export default Controller(model, services);
```
