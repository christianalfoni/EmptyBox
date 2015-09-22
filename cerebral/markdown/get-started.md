# Get Started

This is one example of how you can get started using Cerebral. The article [The ultimate Webpack setup](http://www.christianalfoni.com/articles/2015_04_19_The-ultimate-webpack-setup) will help you get going with a boilerplate that fits very nicely with Cerebral.

`npm install cerebral && npm install cerebral-baobab && npm install cerebral-react`

This example also uses React 0.14, which is currently in release candidate. Install it using `npm install react@0.14.0-rc1`.

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

import {Component} from 'cerebral-react';

export default Component({
  title: ['title']
}, (props) => (

  <div>
    <h1>{props.title}</h1>
    <input
      type="text"
      value={props.title}
      onChange={(e) => props.signals.titleChanged({title: e.target.value})}
    />
  </div>

));
```

*main.js*
```javascript

import controller from './controller.js';
import {Container} from 'cerebral-react';
import ReactDOM from 'react-dom';
import App from './App.js';

function changeTitle (input, state) {
  state.set('title', input.title);
}

controller.signal('titleChanged', changeTitle);

ReactDOM.render(
  <Container controller={controller}>
    <App/>
  </Container>
, document.querySelector('#app'));

```
