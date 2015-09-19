# React UI package

### Install
`$ npm install cerebral-react`.

### Repo
[cerebral-react](https://github.com/christianalfoni/cerebral-react)

Read more about **decorators**, **hoc**, **mixins** and **stateless** components. Also information on recording state is located in the repo.

### Get started

#### Render application

```javascript

// Your cerebral instance
import controller from './controller.js';
import React from 'react';
import {Container} from 'cerebral-react';

// Your main application component
import App from './components/App.js';

// Render the app
React.render(<Container controller={cerebral} app={App}/>, document.body);
```

#### Get state in component
```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  title: ['title']
})
class MyComponent extends React.Component {
  componentDidMount() {
    this.props.signals.appMounted();
  }
  render() {
    return <h1>{this.props.title}</h1>;
  }
}
```
