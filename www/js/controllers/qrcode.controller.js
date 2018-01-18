
(function () {
angular.module('myApp5.controllers')
.directive('actualImage', ['$timeout', function($timeout) {
      return {
           link: function($scope, element, attrs) {
               function waitForImage(url) {
                   var tempImg = new Image();
                   tempImg.onload = function() {
                       $timeout(function() {
                           element.attr('src', url);
                       });
                   }
                   tempImg.src = url;
               }

               attrs.$observe('actualImage', function(newValue) {
                   if (newValue) {
                       waitForImage(newValue);
                   }
               });
           }
      }
  }])
.controller('QrcodeCtrl', QrcodeCtrl);

function QrcodeCtrl($scope, $rootScope, $ionicNavBarDelegate, $state, $stateParams, $cordovaGeolocation, $ionicLoading){

	$scope.view_title = "Attendance QR Code";
	
	$scope.$on('$ionicView.beforeEnter', function(){
	  
		$scope.class_obj = JSON.parse($stateParams.class_obj);
    $scope.class_id = $scope.class_obj.class_id;
    $scope.class_date = new Date($scope.class_obj.current_date);
    var class_date_str_obj = $scope.class_date.toISOString().split("T");
    var lat  = 0.00;
    var lng = 0.00;
    try{
      var posOptions = {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          
          lat  = position.coords.latitude;
          lng = position.coords.longitude;
          console.log(position);
          var code_array = { class_id: $scope.class_id, class_date:  class_date_str_obj[0], lat: lat, lng: lng };

          console.log(code_array);

          var code = encodeURIComponent(JSON.stringify(code_array));

          $scope.qrcode_image = 'https://api.qrserver.com/v1/create-qr-code/?data='+code+'&amp;size=300x300';
          
          checkProfSession(class_date_str_obj[0]);

        }, function(err) {
          $scope.qrcode_image = 'img/no_data_available.jpg';
          console.log("Sorry unable to fetch current location");
        });
      }
      catch(e){
        $scope.qrcode_image = 'img/no_data_available.jpg';
        console.log("Sorry, Cordova geolocation plugin is not working");
      }

      

	});

function checkProfSession(class_date_str){

      $scope.firebase_db = firebase.database();

      $scope.firebase_db.ref().child("login_details/"+$scope.class_obj.prof_id+"/courses/"+$scope.class_id).once("value", function(snapshot) {
               
          if (snapshot.exists()){
              var prof_course_data = snapshot.toJSON();
              // angular.forEach(classData, function(value, key){
              //     $scope.class_obj[key] = value;
              // });
              if(prof_course_data.no_of_classes_completed == 0){
                updateProfSession(false, class_date_str);
              }
              else{
                if(prof_course_data.days_in_session.includes(class_date_str) == false){
                  updateProfSession(true, class_date_str);
                }
              }
          }
          else{
              userNotLoggedIn();
          }
          
      });

}

function userNotLoggedIn(){

    localStorage.removeItem("user_obj");
    localStorage.removeItem("user_id");
    localStorage.removeItem("app_type");

    $state.go('login');
  
}

function updateProfSession(has_days_in_session, class_date_str){

      var days_in_session = class_date_str;
      var no_of_classes_completed = $scope.class_obj.no_of_classes_completed + 1;
      if(has_days_in_session == true){
        days_in_session = $scope.class_obj.days_in_session+","+class_date_str;
      }
      $scope.firebase_db.ref().child("login_details/"+$scope.class_obj.prof_id+"/courses/"+$scope.class_id).update({
        days_in_session : days_in_session,
        no_of_classes_completed : no_of_classes_completed
      }, function(error){
        if(error){
          updateProfSession(has_days_in_session, class_date_str);
        }
        else{
          checkCourseDaysCompleted();
        }
      });
}

function checkCourseDaysCompleted()	{

  var num_of_lectures_conducted = $scope.class_obj.num_of_lectures_conducted + 1;
      $scope.firebase_db.ref().child("list_of_courses/"+$scope.class_id).update({
        num_of_lectures_conducted : num_of_lectures_conducted
      }, function(error){
        if(error){
          checkCourseDaysCompleted();
        }
        else{
        }
      });

}

	

	
}

})();
