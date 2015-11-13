# Get Started

This is one example of how you can get started using Cerebral. The article [The ultimate Webpack setup](http://www.christianalfoni.com/articles/2015_04_19_The-ultimate-webpack-setup) will help you get going with a boilerplate that fits very nicely with Cerebral. It is recommended to use Node from version **4.x.x**.

`npm install cerebral cerebral-baobab cerebral-react`

*controller.js*
```javascript

import Controller from 'cerebral';
import Model from 'cerebral-baobab';

const model = Model({
  title: 'Hello world'
});

export default Controller(model);
```

*App.js*
```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  title: ['title']
})
class App extends React.Component {
  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <input
          type="text"
          value={this.props.title}
          onChange={(e) => this.props.signals.titleChanged({title: e.target.value})}
        />
      </div>
    );
  }
}

export default App;
```

*main.js*
```javascript

import React from 'react';
import controller from './controller.js';
import {Container} from 'cerebral-react';
import ReactDOM from 'react-dom';
import App from './App.js';

function changeTitle (input, state) {
  state.set('title', input.title);
}

const signal = [
  changeTitle
];

controller.signal('titleChanged', signal);

ReactDOM.render(
  <Container controller={controller}>
    <App/>
  </Container>
, document.querySelector('#app'));

```

## Overview

Cerebral is all about signals. A signal is what starts a flow of actions that will update
the state of your application. When a signal has finished it will let your UI know that
it is time to update. There are two main benefits of signals.

1. First of all signals makes it easy to understand complex flows in your application. They are basically just
a list of functions, where each of them has a specific task. They are declarative, but
also has functional traits to them. This allows you to easily compose and reuse the functions
of your signals
2. The readability of a signal does not only benefit you as a developer though. It also benefits the application
itself. Cerebral understands what a signals are. It can analyze them and collect data about them when
they run. This allows for developer tools, like the Cerebral Debugger.

Take a look at this illustration.

![architecture](architecture.png)

This explains how Cerebral fits into your application architecture. The signals will be called from your
UI layer. Each function that runs in the signal has access to the STATE layer. With multiple functions
in your signal, you might do multiple updates to the state. When all functions has run Cerebral tells
the UI layer to update itself. This "one way flow" makes it easy for you to reason about your application. It also
gives Cerebral a predictable flow that it can understand.

You might recognize this architecture. It is actually inspired by a relatively old architecture, before we got
*single page applications*. Lets take a look at an other illustration.

![architecture](mvc.png)

Single page applications has certainly given users a better experience. But it has not made it easier to develop
applications. The predictable and simple architecture of old web applications was actually really great from a
developer standpoint. If you scroll back up to the Cerebral architecture you can see two main differences.

1. Cerebral takes the role of the router. If you think about it the router does indeed handle requests from the UI.
It runs a set of functions and tells the UI when to update itself. The functions run by the router are called middleware.
You can think of the signals in Cerebral being middleware built for the client
2. With Cerebral it is not a request/response pattern. This would not work with modern applications. Instead Cerebral will
emit events to the UI layer when it is time for an update. The UI layer then extracts state from Cerebral and uses its own
logic to do the changes needed in the UI layer. This keeps the state in sync with the ui

This has given you an overview of what Cerebral is and how it works as a concept. Dive into more documentation to see how you actually express and trigger these signals.
