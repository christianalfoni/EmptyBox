# Internet Explorer

To support IE9 there has been done some basic implementations to the Cerebral Router and its dependencies. To fully support IE9 you will need to support Promises, which Babel takes care of with its *runtime* option, `babel?optional[]=runtime`.

Cerebral also needs **CustomEvent** to work and here is its polyfill:

```javascript

(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();
```
