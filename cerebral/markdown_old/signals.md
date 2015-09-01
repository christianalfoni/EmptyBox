## 4. Create signals

### Naming
The way you think of signals is that something happened in your application. Either in your VIEW layer, a router, maybe a websocket connection etc. So the name of a signal should define what happened: "appMounted", "inputChanged", "formSubmitted". The actions are named by their purpose, like "setInputValue", "postForm" etc. This will make it very easy for you to read and understand the flow of the application. All signal definitions first tells you "what happened in your app". Then each action describes its part of the flow that occurs when the signal triggers.

### Action
The convention is to create each action as its own module. This will keep your project clean and let you easily extend actions with type checks and other options. It is important to name your functions as that will make it easier to read debugging information.

```javascript

function myAction () {

};

export default myAction;
```

### Arguments
```javascript

function MyAction (input, state, output) {

  // Input contains all inputs passed to the signal itself
  // and any outputs from the previous actions. Using packages
  // you can also add default input like AJAX libs etc.
  input // {}

  // Use an array as path to reach nested values
  state.set(['admin', 'foo'], 'bar');

  // State contains the methods for mutating the state of
  // your application.
  state.set('isLoading', false);
  state.unset('isLoading'); // Or use array for deeper paths
  state.merge('user', {name: 'foo'});
  state.push('list', 'foo');
  state.unshift('list', 'bar');
  state.pop('list'); // Or use array for deeper paths
  state.shift('list'); // Or use array for deeper paths
  state.concat('list', [1, 2, 3]);
  state.splice('list', 1, 1, [1]);

  // It also contains the method for getting state
  state.get('foo');
  state.get(['foo', 'bar']);

  // The output argument is what you use to resolve values for
  // the next actions and choose paths. By default you can use
  // "success" or "error" path
  output({foo: 'bar'});
  output.success({foo: 'bar'});
  output.error({foo: 'bar'});

};

export default MyAction;
```
*Note:* Asynchronous actions *cannot* mutate state. Calling set or merge on the state parameter above will throw an error, as they will be undefined.

It is best practice not to mutate state in async actions.

### Chain
*actions/setLoading.js*
```javascript

function setLoading (input, state) {
  state.set('isLoading', true);
};
export default setLoading;
```

*actions/setTitle.js*
```javascript

function setTitle (input, state) {
  state.set('title', 'Welcome!');
};
export default setTitle;
```

*main.js*
```javascript

import controller from './controller.js';

import setLoading from './actions/setLoading.js';
import setTitle from './actions/setTitle.js';

controller.signal('appMounted',
  setLoading,
  setTitle
);
```

### Trigger
```javascript

controller.signal('appMounted',
  setLoading,
  setTitle
);

// Just trigger
controller.signals.appMounted();

// With argument
controller.signals.appMounted({
  foo: 'bar'
});

// Force sync trigger
controller.signals.appMounted(true, {
  foo: 'bar'
});
```

### Paths
Paths allows you to conditionally run actions depending on the result of the previous action. This is typically useful with asynchronous actions, but you can use them next to any action you run. The default paths are success and error, but you can define custom paths if you need to.

*main.js*
```javascript

import controller from './controller.js';

import checkSomething from './actions/checkSomething.js';
import setSuccessMessage from './actions/setSuccessMessage.js';
import setErrorMessage from './actions/setErrorMessage.js';

controller.signal('appMounted',
  checkSomething, {
    success: [setSuccessMessage],
    error: [setErrorMessage]
  }
);
```

### Async
Async actions are defined like normal actions, only inside an array.

*main.js*
```javascript

import controller from './controller.js';

import loadUser from './actions/loadUser.js';
import setUser from './actions/setUser.js';
import setError from './actions/setError.js';

controller.signal('appMounted',
  [
    loadUser, {
      success: [setUser],
      error: [setError]
    }
  ]
);
```
When defining multiple actions in an array, they will run async in parallel and their outputs will run after all initial async actions are done.

*main.js*
```javascript

import controller from './controller.js';

import loadUser from './actions/loadUser.js';
import setUser from './actions/setUser.js';
import setUserError from './actions/setUserError.js';
import loadProjects from './actions/loadProjects.js';
import setProjects from './actions/setProjects.js';
import setProjectsError from './actions/setProjectsError.js';

controller.signal('appMounted',
  [
    loadUser, {
      success: [setUser],
      error: [setUserError]
    },
    loadProjects, {
      success: [setProjects],
      error: [setProjectsError]
    }
  ]
);
```

### Outputs
You can define custom outputs. This will override the default "success" and "error" outputs. What is especially nice with manually defining outputs is that they will be analyzed by Cerebral. You will get errors if you use your actions wrong, are missing paths for your outputs etc.

```javascript

function myAction (input, state, output) {
  if (state.get('isCool')) {
    output.foo();
  } else if (state.get('isAwesome')) {
    output.bar();
  } else {
    output();
  }
};

// The defaultOutput property lets you call "output"
// to the default output path
myAction.defaultOutput = 'foo';
myAction.outputs = ['foo', 'bar'];

export default myAction;
```

### Types
You can type check the inputs and outputs of an action to be notified when you are using your signals the wrong way.

```javascript

function myAction (input, state, output) {
  output({foo: 'bar'});
};

// Define what args you expect to be received on this action
myAction.input = {
  isCool: String
};

// If the action only has one output
myAction.output = {
    foo: String
};

// If having multiple outputs
myAction.outputs = {
  success: {
    result: Object
  },
  error: {
    message: String
  }
};

export default myAction;
```
The following types are available: **String, Number, Boolean, Object, Array**, its the default type constructors in JavaScript.

### Custom Types

You can use a function instead. That allows you to use any typechecker.

```javascript

function myAction (input, state, output) {
  output({foo: 'bar'});
};

// Define what args you expect to be received on this action
myAction.input = {
  isCool: function (value) {
    return typeof value === 'string' || typeof value === 'number';
  },
  isNotCool: MyTypeChecker.isString
};
```

### Groups

By using ES6 syntax you can easily create groups of actions that can be reused.

```javascript

const MyGroup = [Action1, Action2, Action3];
controller.signal('appMounted', Action4, ...MyGroup);
controller.signal('appMounted', Action5, ...MyGroup, Action6);
```
