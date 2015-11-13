# Structure

Depending on the size of your application there are two main differences in how you structure your application. This is common with most projects. You treat your project as one module or a collection of modules.

### Normal setup

Your project file structure can look something like this:

```javascript

signals
  | appMounted.js
actions
  | setLoading.js
  | unsetLoading.js
  | setUser.js
chains
  | getUser.js
factories
  | get.js
controller.js
main.js
```

In your *main.js* file you define all your signals, but bring them in from the *signals* folder:

```javascript

import controller from './controller.js';
import appMounted from './signals/appMounted.js';

controller.signal('appMounted', appMounted);

```

This makes it easy to reason about what signals can be triggered by just looking at the file structure. The signals are defined as arrays. Looking at *appMounted.js*.

```

import setLoading from './../actions/setLoading.js';
import unsetLoading from './../actions/unsetLoading.js';
import getUser from './../chains/getUser.js';

export default [
  setLoading,
  [
    ...getUser
  ],
  unsetLoading
];
```

### Modules

On larger projects you would just put this structure into parent folders. You would probably also need a *common* folder for common actions, chains and factories.

```javascript

admin
  | signals
    | appMounted.js
  | actions
    | setLoading.js
    | unsetLoading.js
    | setUser.js
  | chains
    | getUser.js
common
  | factories
    | get.js
controller.js
main.js
```
