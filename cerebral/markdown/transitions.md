# Transitions

With the Cerebral router you handle route transitions like any other transitions. Transitioning from one page to an other is no different than transitioning items in a list.

We are going to look at an example using the *CSSTransitionGroup* plugin from React. It is inspired by *ng-animate* which you can use with Angular. You can create even better effects with other transition libraries like [react-motion](https://github.com/chenglou/react-motion) etc.

```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';
import {CSSTransitionGroup} from 'react/addons';

import HomePage from './HomePage.js';
import AdminPage from './AdminPage.js';

@Cerebral({
  currentPage: ['currentPage']
})
class App extends React.Component {
  renderCurrentPage() {
    switch (this.props.currentPage) {
      case 'home':
        return <HomePage key="home"/>;
      case 'admin':
        return <AdminPage key="admin"/>;
    }     
  }
  render() {
    return (
      <div className="page-container">
        <CSSTransitionGroup transitionName="example">
          {this.renderCurrentPage()}
        </CSSTransitionGroup>
      </div>
    );  
  }
}
```
