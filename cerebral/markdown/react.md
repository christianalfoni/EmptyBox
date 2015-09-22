# React UI package

### Install
`$ npm install cerebral-react`.

### Repo
[cerebral-react](https://github.com/christianalfoni/cerebral-react)

Read more about **decorators**, **hoc**, **mixins** and **stateless/stateful** components.

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

import {Component} from 'cerebral-react';

export default Component({
  title: ['title']
}, (props) => (
  <h1>{props.title}</h1>  
));
```
