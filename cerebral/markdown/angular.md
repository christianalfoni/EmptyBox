# Angular UI package

### Install
`$ npm install cerebral-angular`.

### Repo
[cerebral-angular](https://github.com/christianalfoni/cerebral-angular)

Read more about structuring code, services and extract mutable state from Cerebral.

### Get started

#### Render application

```javascript

import 'cerebral-angular'; // Exposes module
import controller from './controller.js';

angular.module('app', ['cerebral'])
  .config(function (cerebralProvider) {

    // Sets the controller for the application
    cerebralProvider.setController(controller);

    // Defines angular injectable services exposed to actions
    cerebralProvider.setServices(['$http', '$resource']);
  })
```

#### Get state in directive
```javascript

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
