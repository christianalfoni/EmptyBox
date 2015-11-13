# Factories

Factories are a well known concept in the functional world of JavaScript. It is just a function that returns a function. We can use this to empower our actions.

```javascript
function get (url) {

  function action (input, state, output, services) {

    services.ajax(url)
      .then(output.success)
      .catch(output.error);

  }

  return action;

}

const signal = [
  [
    get('/items'), {
      success: [setItems],
      error: [setItemsError]
    }
  ]
];

controller.signal('somethingHappened', signal);
```

### Custom action names

Actions created by factories has the same name in the debugger. That can be a bit confusing. To increase readability you can give custom names to actions.

```javascript

function get (url) {

  function action (input, state, output, services) {

    services.ajax(url)
      .then(output.success)
      .catch(output.error);

  }

  action.displayName = 'get(' + url + ')';

  return action;

}
```

Now the debugger will display *get(/items)* and *get(/users)* instead of *action*.
