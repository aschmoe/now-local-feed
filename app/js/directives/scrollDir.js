angular.module('app')

.directive("scroll", function ($window, $rootScope) {
  return function(scope, element, attrs) {
    //var $main = jQuery('#main');
    angular.element($window).bind("scroll", function() {

      var /*$main          = angular.element(document.querySelector('#main')),
          height         = $main.height()+100,*/
          apply          = false;

      // From top
      if (this.pageYOffset >= 100) {
        if(!scope.scrolled) {
          scope.scrolled = true;
          apply = true;
        }
      } else {
        if(scope.scrolled) {
          scope.scrolled = false;
          apply = true;
        }
      }
      if(apply) {
        scope.$apply();
        apply = false;
      }
    });
  };
});