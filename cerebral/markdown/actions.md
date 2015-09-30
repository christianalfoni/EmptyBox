# Actions

An action is just a pure function.

```javascript

function myAction (input, state, output) {

}
```

A pure function means that the functions does not call or reference anything outside itself. Anything and everything you do inside an action is related to its arguments. When you write a test for an action you can mock these arguments to fit your test. This makes it easy to verify that actions run as they should. This also ensures that the test breaks if someone changes the action in a way that affects the expected behavior. On larger teams this is crucial to ensure that the application always runs as expected.
