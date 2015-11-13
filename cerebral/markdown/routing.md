# Routing

### Install

`npm install cerebral-router path-to-regexp`

A demo can be found at [this repo](https://github.com/christianalfoni/cerebral-router-demo).

### How to use

The Cerebral router binds urls to signals. This gives you a flexible approach to what your urls should represent in your application. You might be surprised that the router does not affect your UI layer at all. Lets take a look.

```javascript

import Router from 'cerebral-router';
import controller from './controller.js';
import homeOpened from './signals/homeOpened';
import messagesOpened from './signals/messagesOpened';
import messageOpened from './signals/messageOpened';

controller.signal('homeOpened', homeOpened);
controller.signal('messagesOpened', messagesOpened);
controller.signal('messageOpened', messageOpened);

Router(controller, {
  '/': 'homeOpened',
  '/messages': 'messagesOpened',
  '/messages/:id': 'messageOpened'
}).trigger();
```

When you go to url **/messages** the signal **messagesOpened** will be triggered. This signal will set the application in the correct state to display the messages page.

When you go to url **/messages/123** the signal **messageOpened** will be triggered. The params of the url will be merged with the input to the signal. In this example the input will be: `{id: '123'}`.

What makes this powerful is the possibility to trigger the signal directly. `controller.signals.messageOpened({id: '456'})` will also work and the url will update. You are now free from thinking urls to change the state of your application. You only think about signals. You can of course use hyperlinks with urls if you want to.

**Trigger** is the method that will run the current route and fire off a signal.

### Nested urls

In the example above you might want to force the user to the messages page when you open a message. With the Cerebral router you handle these situations with actions.

```javascript

import Router from 'cerebral-router';
import controller from './controller.js';
import homeOpened from './signals/homeOpened';
import messagesOpened from './signals/messagesOpened';
import messageOpened from './signals/messageOpened';

controller.signal('homeOpened', homeOpened);
controller.signal('messagesOpened', messagesOpened);

// We just add the actions that puts the application in
// "messagesOpened" state
controller.signal('messageOpened', [...messagesOpened, ...messageOpened]);

Router(controller, {
  '/': 'homeOpened',
  '/messages': {
    '/': 'messagesOpened',
    '/:id': 'messageOpened'
  }
}).trigger();
```

When the user goes to **/messages/123** the **messagesOpened** and **messageOpened** will run.

### Hash urls

To only handle hash urls, use the option `onlyHash`.

```javascript

Router(controller, {
  '/': 'homeOpened',
  '/messages': 'messagesOpened',
  '/messages/:id': 'messageOpened'
}, {
  onlyHash: true
}).trigger();
```

Any hyperlinks you use must also use the hash in their *href* attribute.

### Base url

Sometimes your application is not running on the root path */*. To keep urls consistent you can tell Cerebral router what the base url is.

```javascript

Router(controller, {
  '/': 'homeOpened',
  '/messages': 'messagesOpened',
  '/messages/:id': 'messageOpened'
}, {
  baseUrl: '/myapp'
}).trigger();
```

### Redirect
You can redirect to a different url from within a signal. This will cause a new signal to trigger. Using the debugger you will have to time travel debug to see the initial signal that caused the redirect. To redirect you need to use the exposed router service:

```javascript

function redirectAction(input, state, output, services) {
  services.router.redirect('/someurl', {
    replace: false // Default true
  });
}

signal('appMounted', [
  myConditionalAction, {
    success: [someOtherAction],
    error: [redirectAction]
  }
]);
```

Or you can use the redirect action factory from the router:

```javascript

import {redirect} from 'cerebral-router';

signal('appMounted', [
  myConditionalAction, {
    success: [someOtherAction],
    error: [redirect('/error')]
  }
]);
```

### Regexp routes
You can also use normal regexp to handle routes. This example ensures that the id is actually a number.

```javascript

Router(controller, {
  '/': 'homeOpened',
  '/messages/:id(\\d+)': 'messageOpened'
}).trigger();
```

### Hyperlinks
With Cerebral Router we encourage you to use signals, rather than urls. They are more expressive and since the url automatically updates you get the behavior you want. If you have to use a url we would like you to use the `getUrl` helper on the signal. Both examples are shown below.

```javascript

// Given the route and signal: "/messages/:id": "messagesOpened"
render() {
  return (
    <div>
      <a onClick={() => this.props.signals.messageOpened({id: this.props.messageId})}>Open</a>
      <a href={this.props.signals.messageOpened.getUrl({id: this.props.messageId})}>Open</a>
    </div>
  )
}
```

### The setUrl action

The router needs to keep state of the current url. This is what allows you to do time travel debugging with the router. This is accomplished by injecting a Cerebral action called **setUrl**. By default it will hijack a property in your state store called *url*. You can change this with an option.

```javascript

Router(controller, {
  '/': 'homeOpened',
  '/messages': 'messagesOpened',
  '/messages/:id': 'messageOpened'
}, {
  urlStorePath: 'browserUrl'
}).trigger();
```
