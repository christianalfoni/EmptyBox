# Modals

You might be used to calling a method to toggle a modal. With Cerebral you do this with state.

### A simple approach with React

*controller.js*
```javascript

import Controller from 'Cerebral';
import Model from 'cerebral-baobab';

const model = Model({
  modalA: {
    show: true
  }
});

export default Controller(model);
```

*App.js*
```javascript

import {Component} from 'cerebral-react';
import Modal from './Modal.js';

export default Component({
  showModal: ['showModal']
}, function (props) {

  <div>
    {props.showModal ? <Modal/> : null}
  </div>

});
```

But you probably want to display different content in the modal. There are two approaches to this. You can add multiple modals, where each modal has its own *showModal* state.
