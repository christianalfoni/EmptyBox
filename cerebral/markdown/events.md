# Events

Cerebral will emit events when running signals. Normally you do not need to listen to these events.

```javascript

controller.on('change', function () {});
controller.on('error', function (error) {});
controller.on('signalStart', function (signal) {});
controller.on('signalEnd', function (signal) {});
controller.on('actionStart', function (isAsync) {});
controller.on('actionEnd', function () {})
```
