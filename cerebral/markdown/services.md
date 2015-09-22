# Services

It is important that the actions in the signals are pure. They should not call or reference anything outside themselves. But we do need tools like ajax libraries, maybe underscore and the likes. This is what you use services for. You can think of it as an injection system that gives reliability and testability to the signals and their actions.

Services are defined when you instantiate the Cerebral controller. By default you have the *recorder* service available. We are going to use *baobab* as an example to show how this works.

```javascript

import Controller from 'cerebral';
import Model from 'cerebral-baobab';
import request from 'superagent';

const model = Model({
  foo: 'bar'
});

const services = {
  request: request
};

export default Controller(model, services);
```

In this example we are exposing [superagent](https://github.com/visionmedia/superagent). This will allow us to do HTTP requests inside our actions. You can of course choose whatever ajax library and other tools you want.

### Using a service

```javascript

function myAction (input, state, output, services) {

  services.request(url, function (err, response) {

    if (err) {
      output.error({
        error: err.toString()
      });
    } else {
      output.success({
        result: JSON.stringify(response.text)
      });
    }

  });

}

return action;
```
