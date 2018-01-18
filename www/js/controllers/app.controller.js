(function () {
angular.module('myApp5.controllers', [])
.controller('AppController', AppController);
function AppController($scope, $ionicSideMenuDelegate, $rootScope, $state, $location) {

    $scope.pageActive = function(location_url) {
      if($location.path() == location_url){
        return true;
      }
      return false;
    };

  	$scope.toggleLeft = function() {
    	$ionicSideMenuDelegate.toggleLeft();
  	};

  	$scope.logout = function(){

  		localStorage.removeItem("user_obj");
		  localStorage.removeItem("app_type");

		  $state.go('login');

  	};

	
	  
}

})();