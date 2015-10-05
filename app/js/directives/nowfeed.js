'use strict';

angular.module('app.nowfeed', [
])

// See https://www.wikipedia.com/services/api/wikipedia.photos.search.html
// Photo url documentation: https://www.wikipedia.com/services/api/misc.urls.html
.factory('NowFeed', ['$resource', '$rootScope', function ($resource, $rootScope) {
  
  return {
    getUser: function(name, services, count) {
      var url = $rootScope.nowfeedApi + name + '/feed';
      return $resource(url, {
        format: 'json',
        action: 'query',
        callback: 'JSON_CALLBACK'
      }, { 
        'load': { 
          method: 'JSONP',
          cache : true
        },
        'query': {
          cache : true,
          method: 'GET',
          isArray: true
        }
      });
    }
  }
}])

.filter('parseUrlFilter', function () {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    var hashPattern = /(^|\s)#(\w*[a-zA-Z_]+\w*)/gim;
    var mentionPattern =  /(^|\s)\@(\w*[a-zA-Z_]+\w*)/gim;
    return function (text, target, service) {
      var replacedText = text 
                       ? text.replace(urlPattern, '<a target="' + target + '" href="$&">$&</a>')
                       : text;
      if(replacedText) {
        if(service === 'twitter'){
            // replace #hashtags and send them to twitter
            replacedText = replacedText.replace(hashPattern, '$1<a class="hashtag" href="https://twitter.com/search?q=%23$2" target="' + target + '">#$2</a>');
            replacedText = replacedText.replace(mentionPattern, '$1<a class="hashtag" href="https://twitter.com/$2" target="' + target + '">@$2</a>');
        } 
        else if(service === 'instagram'){
            replacedText = replacedText.replace(hashPattern, '$1<a class="hashtag" href="https://instagram.com/explore/tags/$2" target="' + target + '">#$2</a>');
            replacedText = replacedText.replace(mentionPattern, '$1<a class="hashtag" href="https://instagram.com/$2" target="' + target + '">@$2</a>');

        }
        else if(service === 'facebook'){
            replacedText = replacedText.replace(hashPattern, '$1<a class="hashtag" href="https://facebook.com/hashtag/$2" target="' + target + '">#$2</a>');
        }
      }
      return replacedText;
    };
})

.controller('NowFeedController', ['$scope', 'NowFeed', '$filter', '$sce', 
                         function($scope,    NowFeed,   $filter,   $sce){

  $scope.inited = false;

  $scope.services = {
    'facebook': {title: 'Facebook', icon: 'fa-facebook-square'},
    'twitter': {title: 'Twitter', icon: 'fa-twitter-square'},
    'youtube': {title: 'Youtube', icon: 'fa-youtube-play'},
    'instagram': {title: 'instagram', icon: 'fa-instagram'}
  };

  $scope.activeServices = 'all';

  var userFeed = NowFeed.getUser('goredmond');

  // Toggle nowfeed source
  $scope.switchService = function(service, limit) {
    var isActive = $scope.isServiceActive(service),
        runQuery = false;

    if($scope.inited && !isActive) {
      $scope.activeServices = service;
      runQuery = true;
    }

    if(runQuery || !$scope.inited) {
      userFeed.query({
        'services[]': $scope.activeServices == 'all' ? [] : [$scope.activeServices],
        limit: $scope.nowfeedPostCount
      }, function(data) {
        // First time through, find available services
        if(!$scope.inited) {
          var active = [], services = _.clone($scope.services);
          _.map(data, function(item) {
            active = _.union(active, [item.service]);
          });
          _.map(services, function(service, key) {
            if(_.contains(active, key)) {
              services[key].active = true;
            }
          });
          $scope.services = services;
        }
        $scope.nowfeed = _.chain(data).sortBy('date').reverse().value();
        $scope.inited = true;
      });
    }
    return false;
  };

  $scope.isServiceActive = function(service) {
    return $scope.activeServices == service;
  }

  $scope.showServiceTab = function(service) {
    return $scope.services[service].active;
  }

  // $scope.recent = function() {
  //   $scope.container.isotope({sortBy : 'date'});
  // }

  // $scope.shuffle = function() {
  //   $scope.$emit('iso-method', {name:'shuffle', params:null});
  // }

  $scope.getPublishedDate = function(date) {
    return new Date(date).getTime();
  }

  $scope.getPostUrl = function(item) {
    switch(item.service) {
      case 'facebook':
        var url = 'http://facebook.com/' + item.account;
        return item.id
             ? url + '/posts/' + item.id.substring((item.id.indexOf('_') + 1))
             : url;
        break;
      
      default:
        return item.url;
        break;
    }
  }

  $scope.toSafe = function(text, service) {
    return $sce.trustAsHtml($filter('parseUrlFilter')(text, '_blank', service));
  }

}])

.directive('nowfeed', function factory($window, $browser, $http, $timeout) {
  return {
    restrict: 'A',
    controller: "NowFeedController",
    templateUrl: 'views/nowfeed.html',
    scope: {
      nowfeedPostCount: '@',
      nowfeedHideControls: '@'
    },
    link: function($scope, $element, $attributes) {

      // Init vars
      $scope.nowfeedPostCount = $scope.nowfeedPostCount || 20;
      $scope.nowfeedShowControls = $scope.nowfeedHideControls || false;

      // call init
      if(!$scope.inited) {
        $scope.switchService(null, $scope.nowfeedPostCount);
      }

      // Watch nowfeed
      $scope.$watch('nowfeed', function(value) {
        if($scope.nowfeed) {
          console.log("yup");
        }
      });
    }
  }
});

