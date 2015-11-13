# React UI package

### Install
`$ npm install cerebral-react`.

### Repo
[cerebral-react](https://github.com/christianalfoni/cerebral-react)

Read more about **decorators**, **hoc**, **mixins** and **stateless/stateful** components.

### Get started

It is encouraged that you put all the state of your application in the Cerebral state store. Also any initial/default state should also be defined in the state store. Keep your components as render/UI focused as possible.

#### Render application

```javascript

// Your cerebral instance
import controller from './controller.js';
import React from 'react';
import {Container} from 'cerebral-react';

// Your main application component
import App from './components/App.js';

// Render the app
React.render(
  <Container controller={controller}>
    <App/>
  </Container>, document.body.querySelector('#app'));
```

#### Get state in component
```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  title: ['title']
})
class App extends React.Component {
  render() {
    return <h1>{this.props.title}</h1>  
  }
}
```

#### Create hyperlinks
If you are using the `cerebral-router` you can use a component to create links.
```javascript

import React from 'react';
import {Decorator as Cerebral, Link} from 'cerebral-react';

@Cerebral()
class App extends React.Component {
  render() {
    return (
      <Link
        signal={this.props.signals.somethingHappened}
        params={{foo: 'bar'}}
        className="my-class"
      >Click me</Link>
    );
  }
}
```
