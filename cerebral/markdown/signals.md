# Signals

The way you think of signals is that something happened in your application. Either in your UI, a router, maybe a websocket connection etc. So the name of a signal should define what happened: *appMounted*, *inputChanged*, *formSubmitted*. The functions in a signal is called **actions**. They are named by their purpose, like *setInputValue*, *postForm* etc. This will make it very easy for you to read and understand the flow of the application.

This is a typical signal:

```javascript

const signal = [
  setLoading,
  [
    getUser, {
      success: [setUser],
      error: [setUserError]
    }
  ],
  unsetLoading
];

controller.signal('appMounted', signal);
```

As you see there are not only functions that are used to express flow. You also have arrays and objects. Normally array and object literals defines data structure. In a signal it defines behaviour. When an array is an item of an other array it means that its contents will run asynchronously. The *getUser* action will run asynchronously. An object is used to define paths. This means that the execution of an action can result in different outcomes. Paths are also defined as arrays, but they are not asynchronous because they are not items of an array. If you would define an array inside a path though, that would run asynchronous.

### Namespace signals

In larger applications it can be convenient to namespace your signals. You do that simply by using dot notation.

```javascript

const signal = [
  action1
];

controller.signal('admin.userOpened', signal);

controller.signals.admin.userOpened();
```

### Sync signals

By default Cerebral will run your signals between animation frames. Sometimes you want to trigger signals synchronously. Typically this is related to inputs.

```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  value: ['inputValue']
})
class App extends React.Component {
  render() {
    return (
      <div>
        <input
          type="text"
          value={this.props.value}
          onChange={(e) => this.props.signals.valueChanged.sync({value: e.target.value})}
        />
      </div>
    );
  }
}
```

All signals has a `.sync()` method. Use this with inputs to avoid glitches in UI.
