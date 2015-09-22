# Signals

The way you think of signals is that something happened in your application. Either in your UI, a router, maybe a websocket connection etc. So the name of a signal should define what happened: *appMounted*, *inputChanged*, *formSubmitted*. The functions in a signal is called **actions**. They are named by their purpose, like *setInputValue*, *postForm* etc. This will make it very easy for you to read and understand the flow of the application.

This is a typical signal:

```javascript

controller.signal('appMounted',
  setLoading,
  [
    getUser, {
      success: [setUser],
      error: [setUserError]
    }
  ],
  unsetLoading
);
```

As you see there are not only functions that are used to express flow. You also have arrays and objects. Arrays are used to express asynchronous actions. That means any actions defined inside an array can resolve at a later point in time. An object is used to define paths. This means that the execution of an action can result in different outcomes.

Note that the actions *setUser* and *setUserError* are not asynchronous. This means that "every other" nested array expresses asynchronous flow.

### Namespace signals

In larger applications it can be convenient to namespace your signals. You do that simply by using dot notation.

```javascript

controller.signal('admin.userOpened', action1);

controller.signals.admin.userOpened();
```

### Sync signals

By default Cerebral will run your signals between animation frames. Sometimes you want to trigger signals synchronously. Typically this is related to inputs.

```javascript

import {Component} from 'cerebral-react';

export default Component({
  value: ['inputValue']
}, (props) => (

  <div>
    <input
      type="text"
      value={props.value}
      onChange={(e) => props.signals.valueChanged.sync({value: e.target.value})}
    />
  </div>

));
```

All signals has a `.sync()` method. Use this with inputs to avoid glitches in UI.
