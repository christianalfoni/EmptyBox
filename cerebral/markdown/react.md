[cerebral-react](https://github.com/christianalfoni/cerebral-react) - @christianalfoni **/** [react](https://github.com/facebook/react) - @facebook

`npm install cerebral-react`

*Instantiate*
```javascript

// Your controller instance
import controller from './controller.js';
import React from 'react';
import {Container} from 'cerebral-react';

// Your main application component
import App from './components/App.js';

// With React 0.14 you can also write:
// <Container controller={controller}><App/></Container>
React.render(<Container controller={controller} app={App}/>, document.body);
```

*Get and change state*
```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  isLoading: ['isLoading'],
  user: ['user'],
  error: ['error']  
})
class App extends React.Component {
  componentDidMount() {
    this.props.signals.appMounted();
  }
  render() {
    return (
      <div>
        {this.props.isLoading ? 'Loading...' : 'hello ' + this.props.user.name}
        {this.props.error ? this.props.error : null}
      </div>
    );
  }
}
```
