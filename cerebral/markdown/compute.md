# Compute (EXPERIMENTAL)

Very often it is necessary to compute state. Some libraries do this inside the components, others do it inside the state store. With Cerebral you do it when state is extracted from Cerebral. This allows computed state to be run on any state store. Computed state supports

```javascript

const model = Model({
  messages: {},
  title: 'whatap!',
  displayedMessagesIds: []
});

const services = {};

const computed = {
  displayedMessages: function (get) {
    return get(['displayedMessagesIds']).map((id) => get(['messages', id]));
  },

  // You can also grab existing computed state
  foo: function (get, getComputed) {
    return getComputed(['bar']) + '!!!!';
  }
  bar: function (get) {
    return 'Wazah!';
  }
};

export default Controller(model, services, computed);

```

The compute functions are very smart. They will automatically run when needed by analyzing the state you are grabbing when running it. This means that in this case if *displayedMessagesIds* change or any of the grabbed *messages*, this function will run when the UI updates. If nothing has changed it will return the previous value.

```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  title: ['title']
}, { // Second argument is computed
  messages: ['displayedMessages']
})
class App extends React.Component {
  renderMessage(message, index) {
    return (
      <li key={index}>
        {message.name}
      </li>
    );
  }
  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <ul>
          {this.props.messages.map(this.renderMessage)}
        </ul>
      </div>
    );
  }
}

export default App;
```
