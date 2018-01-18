(function () {
angular.module('myApp5.controllers')
.controller('ManualAttendanceCtrl', ManualAttendanceCtrl);

function ManualAttendanceCtrl($scope, $rootScope, $ionicNavBarDelegate, $state, $stateParams, $ionicLoading, $http, $ionicPopup, $ionicListDelegate, $cordovaGeolocation){

	$scope.view_title = "Manual Class Attendance";
	$scope.is_visible_search = false;
	$scope.search = [];
	$scope.showhideSearch = function () {
        $scope.is_visible_search = $scope.is_visible_search ? false : true;
    };

    $scope.clearSearch = function(){
    	$scope.search.student = "";
    };

	$scope.$on('$ionicView.beforeEnter', function(){

		if(localStorage.getItem('user_obj') == null || localStorage.getItem('app_type') == null || localStorage.getItem('user_id') == null){
			userNotLoggedIn();
		}
		else{
			$ionicLoading.show();

			$scope.user_id = localStorage.getItem('user_id');
			$scope.app_type = localStorage.getItem('app_type');

			$scope.class_obj = JSON.parse($stateParams.class_obj);
		    $scope.class_id = $scope.class_obj.class_id;
		    $scope.class_date = new Date($scope.class_obj.current_date);
    		$scope.class_date_str_obj = $scope.class_date.toISOString().split("T");
		    $scope.class_student_list = [];
		    $scope.firebase_db = firebase.database();

			$scope.firebase_db.ref().child("manual_cummulative_list/"+$scope.class_id).once("value", function(snapshot) {
               
                if (snapshot.exists()){
                	var classData = snapshot.toJSON();
                	angular.forEach(classData, function(value, key){
					  	var student_obj = {};
					  	student_obj.student_id = key;
					  	student_obj.student_name = value;
					  	$scope.class_student_list.push(student_obj);
					});
                	// console.log($scope.class_student_list);
                    $ionicLoading.hide();
                }
                else{
                	$ionicLoading.hide();
                    // userNotLoggedIn();
                }
                
            });
		}

	});

	function userNotLoggedIn(){

		localStorage.removeItem("user_obj");
		localStorage.removeItem("user_id");
		localStorage.removeItem("app_type");

		$state.go('login');
	
	}

	$scope.confirmMarkAttendance = function(student_id, student_name){
			
		   	var confirmPopup = $ionicPopup.confirm({
		    	 title: 'Mark Attendance',
		    	 template: 'Are you sure you want to mark attendance for '+student_name+'?'
		   	});

		   	confirmPopup.then(function(res) {
		    if(res) {
		       $ionicListDelegate.closeOptionButtons();
		       checkClassDay(student_id, student_name);
		    } else {
		       $ionicListDelegate.closeOptionButtons();
		    }
		   });
		 
	};

	function checkClassDay(student_id, student_name){

		$ionicLoading.show();
		var lat  = 0.00;
	    var lng = 0.00;
	    try{
		    var posOptions = {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true};
		    $cordovaGeolocation
		        .getCurrentPosition(posOptions)
		        .then(function (position) {
	          
		        lat  = position.coords.latitude;
		        lng = position.coords.longitude;

		        var request_url = "http://api.timezonedb.com/v2/get-time-zone?key=A1UKGG32WZ9F&format=json&by=position&lat="+lat+"&lng="+lng; 
	          	$http({
	              method: 'GET',
	              url: request_url
	            }).then(function (response) {
	            		compareDayTime(response.data.formatted, student_id, student_name);
	              }, function (error) {
	              		$ionicLoading.hide();
	              		var notimefound_alertPopup = $ionicPopup.alert({
			                title: 'Error!',
			                template: 'Please try again!'
		            	});
	              		console.log(error);
	              });
	        }, function(err) {
	        	$ionicLoading.hide();
	         	var nolocationfound_alertPopup = $ionicPopup.alert({
	                title: 'Error!',
	                template: 'Please try again!'
            	});
	          console.log("Sorry unable to fetch current location");
	        });
		}
	    catch(e){
        	$ionicLoading.hide();
	        console.log("Sorry, Cordova geolocation plugin is not working");
      	}
	}

	$scope.days_of_week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

	function compareDayTime(current_day_time, student_id, student_name){
		
		var current_day_time_obj = current_day_time.split(" ");
		var current_date_obj = new Date(current_day_time.replace(" ", "T")+".000Z");
		var class_days = $scope.class_obj.course_days_offered.split(",");
		var class_timings = $scope.class_obj.course_timing.split("-");

		var is_valid_day = checkValidDay(current_date_obj.getDay(), class_days);

		if(is_valid_day == true){
			markAttendance(student_id, student_name);
		}
		else{
			$ionicLoading.hide();
			var notvalidday_alertPopup = $ionicPopup.alert({
	                title: 'Sorry!',
	                template: 'There is no lecture today!'
            });
            notvalidday_alertPopup.then(function(res) {
                var class_obj_string = JSON.stringify($scope.class_obj);
				if(class_obj_string != ""){
					if($scope.app_type == "professor")
					{	
						$state.go('app.class_detail', { class_obj : class_obj_string });
					}
					else{
						userNotLoggedIn();
					}
				}
				else{
					userNotLoggedIn();
				}
           });
		}
	}

	function checkValidDay(current_day_index, class_days){
		for(var i = 0; i < class_days.length; i++){
			if($scope.days_of_week.indexOf(class_days[i]) == current_day_index){
				return true;
			}
		}
		return false;
	}

	function markAttendance(student_id, student_name){
		
		$scope.firebase_db.ref().child("login_details/"+student_id+"/courses/"+$scope.class_id).once("value", function(snapshot) {
               
          if (snapshot.exists()){
              var student_course_data = snapshot.toJSON();
              if(student_course_data.no_of_days_attended == 0){
                updateStudentAttendance(false, student_id, student_name, student_course_data);
              }
              else{
                if(student_course_data.days_attended.includes($scope.class_date_str_obj[0]) == false){
                  updateStudentAttendance(true, student_id, student_name, student_course_data);
                }
                else{
                	$ionicLoading.hide();
		         	var nolocationfound_alertPopup = $ionicPopup.alert({
		                title: 'Attention!',
		                template: student_name+' has already been given attendance for '+$scope.class_date_str_obj[0]+'!'
	            	});
                }
              }
          }
          else{
              userNotLoggedIn();
          }
          
      });

	}

	function updateStudentAttendance(has_days_attended, student_id, student_name, student_course_data){

		  var days_attended = $scope.class_date_str_obj[0];
	      var no_of_days_attended = student_course_data.no_of_days_attended + 1;
	      if(has_days_attended == true){
	        days_attended = student_course_data.days_attended+","+$scope.class_date_str_obj[0];
	      }
	      $scope.firebase_db.ref().child("login_details/"+student_id+"/courses/"+$scope.class_id).update({
	        days_attended : days_attended,
	        no_of_days_attended : no_of_days_attended
	      }, function(error){
        	if(error){
        		$ionicLoading.hide();
	         	var nolocationfound_alertPopup = $ionicPopup.alert({
	                title: 'Error!',
	                template: 'Please try again!'
            	});
        	}
        	else{
          		$ionicLoading.hide();
	         	var nolocationfound_alertPopup = $ionicPopup.alert({
	                title: 'Success!',
	                template: student_name+' has been successfully given attendance for '+$scope.class_date_str_obj[0]+'!'
            	});
        	}
      	});
	}

	$scope.updateClassStudentList = function(){

		$scope.firebase_db.ref().child("manual_cummulative_list/"+$scope.class_id).once("value", function(snapshot) {
               
            if (snapshot.exists()){
            	$scope.class_student_list = [];
            	var classData = snapshot.toJSON();
            	angular.forEach(classData, function(value, key){
				  	var student_obj = {};
				  	student_obj.student_id = key;
				  	student_obj.student_name = value;
				  	$scope.class_student_list.push(student_obj);
				});
            	// console.log($scope.class_student_list);
                $scope.$broadcast('scroll.refreshComplete');
            }
            else{
            	$ionicLoading.hide();
                userNotLoggedIn();
            }
            
        });		

	};
	
}

})();
