'use strict';

//***************************************

// Main Application

//***************************************

angular.module('app', [
  'app.nowfeed',
  'ngResource',
  'ngSanitize'
])

.run(
  [          '$rootScope', '$window', 
    function ($rootScope,   $window) {

			// It's very handy to add references to $state and $stateParams to the $rootScope
      $rootScope.nowfeedApi = _.get(Drupal, 'settings.nowfeed.nowfeedApi') || 'http://localhost:8084/api/';
    }
  ]
);

