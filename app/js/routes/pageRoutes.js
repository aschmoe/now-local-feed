'use strict';

angular.module('app')

.config(
  [ '$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

      // Redirect if on city hompage
      $urlRouterProvider.when(/get\/[a-zA-z]*\/[a-zA-z]*$/i, ['$match', '$stateParams', function ($match, $stateParams) {
        return $match.input + '/answers';
      }]);

      $stateProvider
        
        .state("home", {
          url: '/',
          data: { 
            doScroll: true  // Scrolls on route change
          },
          templateUrl: 'views/home.html',
          controller: function($scope, $rootScope, $state, $filter){

          }
        })

    }
  ]
)
