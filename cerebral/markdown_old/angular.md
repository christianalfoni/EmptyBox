[cerebral-angular](https://github.com/christianalfoni/cerebral-angular) - @christianalfoni **/** [angular](https://github.com/angular/angular) - @angular

`npm install cerebral-angular`

*Instantiate*
```javascript

// Exposes Cerebral angular module
import 'cerebral-angular';
import controller from './controller.js';

angular.module('app', ['cerebral'])
  .config(function (cerebralProvider) {

    // Sets the controller for the application
    cerebralProvider.setController(controller);

  });
```

*Get and change state*
```javascript

// A directive
export default function () {
  return {
    controllerAs: 'myComponent',
    scope: {},
    templateUrl: 'myComponent.html',
    controller: function ($scope, cerebral) {

      // Adds a "list" prop to the $scope which
      // will automatically update when the list
      // updates
      cerebral.injectState($scope, {
        list: ['list']
      });

      // Trigger signals
      $scope.addItemClicked = function () {
        cerebral.signals.addItemClicked({
          item: 'foo'
        });
      };

    }
  };
};
```
