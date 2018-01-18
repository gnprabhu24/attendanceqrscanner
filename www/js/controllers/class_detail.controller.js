
(function () {
angular.module('myApp5.controllers')
.controller('ClassDetailCtrl', ClassDetailCtrl);

function ClassDetailCtrl($scope, $rootScope, $ionicNavBarDelegate, $state, $stateParams, $ionicLoading, $http, $cordovaGeolocation, $ionicPopup, $ionicModal, $cordovaBarcodeScanner, constants, $ionicPopover, $cordovaClipboard, $timeout){

	$scope.view_title = "Class Details";
	$scope.class_obj = [];
	$scope.$on('$ionicView.beforeEnter', function(){
		
		if(localStorage.getItem('user_obj') == null || localStorage.getItem('app_type') == null || localStorage.getItem('user_id') == null){
			userNotLoggedIn();
		}
		else{
			$ionicLoading.show();
			if($scope.class_obj.length == 0){

				$scope.user_id = localStorage.getItem('user_id');
				$scope.app_type = localStorage.getItem('app_type');

				$scope.class_obj = JSON.parse($stateParams.class_obj);
			    $scope.class_id = $scope.class_obj.class_id;
			    if($scope.app_type == 'student'){
			    	$scope.class_obj.days_attended_obj = $scope.class_obj.days_attended.split(",");
			    }
			    else if($scope.app_type == 'professor'){
			    	$scope.class_obj.days_in_session_obj = $scope.class_obj.days_in_session.split(",");
			    	var course_add_link_obj = {"key": "add_course" , "obj": { "class_id" : $scope.class_id, "course_name": $scope.class_obj.course_name} };
			    	$scope.class_obj.course_add_link = "attendancescanner://?id="+window.btoa(encodeURI(JSON.stringify(course_add_link_obj)));
			    }

			    $scope.firebase_db = firebase.database();

				$scope.firebase_db.ref().child("list_of_courses/"+$scope.class_id).once("value", function(snapshot) {
	               
	                if (snapshot.exists()){
	                	var classData = snapshot.toJSON();
	                	angular.forEach(classData, function(value, key){
						  	$scope.class_obj[key] = value;
						});
	                    $ionicLoading.hide();
	                }
	                else{
	                	$ionicLoading.hide();
	                    userNotLoggedIn();
	                }
	                
	            });
			}
			else{
				$scope.updateClassDetail();
			}
		}

	});

	$ionicModal.fromTemplateUrl('templates/class_days.html', {
    	scope: $scope
  	}).then(function(modal) {
    	$scope.modal = modal;
	});

	$ionicPopover.fromTemplateUrl('templates/popover.html', {
	    scope: $scope,
	}).then(function(popover) {
	    $scope.popover = popover;
	    $scope.linkcopied = false;
	});

	$scope.copyAddCourseLink = function(){
		try{
			$cordovaClipboard
		    .copy($scope.class_obj.course_add_link)
		    .then(function () {
		    	$scope.linkcopied = true;
		    	$timeout(function() {
		    		$scope.linkcopied = false;
	    			$scope.popover.hide();
		    	}, 700);
		      	
		    }, function () {
		      
		    });
		}
		catch(e){
			console.log("Please try on a device");
			$scope.linkcopied = true;
		 	$timeout(function() {
	    		$scope.linkcopied = false;
    			$scope.popover.hide();
	    	}, 700);
		}

	};

	function userNotLoggedIn(){

		localStorage.removeItem("user_obj");
		localStorage.removeItem("user_id");
		localStorage.removeItem("app_type");

		$state.go('login');
	
	}

	$scope.checkClassTime = function(button_type){
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
		        
		        var request_url = "http://api.timezonedb.com/v2/get-time-zone?key="+constants.timezonedb_key+"&format=json&by=position&lat="+lat+"&lng="+lng; 
	          	$http({
	              method: 'GET',
	              url: request_url
	            }).then(function (response) {
	            		compareCourseStartEndDayTime(response.data.formatted, button_type);
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
	};

	$scope.days_of_week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

	function compareCourseStartEndDayTime(current_day_time, button_type){
		
		var current_day_time_obj = current_day_time.split(" ");
		var current_date_obj = new Date(current_day_time.replace(" ", "T")+".000Z");
		var class_days = $scope.class_obj.course_days_offered.split(",");
		var class_timings = $scope.class_obj.course_timing.split("-");
		var is_valid_course_start_end = checkValidCourseStartEnd(current_date_obj);

		if(is_valid_course_start_end == true){

		var is_valid_day = checkValidDay(current_date_obj.getDay(), class_days);

			if(is_valid_day == true){

				var is_valid_time = checkValidTime(current_date_obj, class_timings, button_type);

				if(is_valid_time == true){
					$ionicLoading.hide();
					$scope.class_obj.current_date = current_date_obj;

					var class_obj_string = JSON.stringify($scope.class_obj);
					if(class_obj_string != ""){
						if($scope.app_type == "professor")
						{	
							if(button_type == "qrcode"){
								$state.go('app.qrcode', { class_obj : class_obj_string });
							}
							else if(button_type == "manual"){
								$state.go('app.manual_attendance', { class_obj : class_obj_string });	
							}
						}
					}
				}
			}
			else{
				$ionicLoading.hide();
				var notvalidday_alertPopup = $ionicPopup.alert({
		                title: 'Sorry!',
		                template: 'There is no lecture today!'
	            });
			}
		}
	}

	function checkValidCourseStartEnd(current_date_obj){

		var current_date = current_date_obj.getTime();
		var start_date = Date.parse($scope.class_obj.start_date);
		var end_date = Date.parse($scope.class_obj.end_date);

		if(current_date >= start_date && current_date <= end_date){
			return true;
		}
		else if(current_date < start_date){
			$ionicLoading.hide();
			var coursenotstarted_alertPopup = $ionicPopup.alert({
                title: 'Sorry!',
                template: 'The course has not started yet!'
    		});
			return false;
		}
		else if(current_date > end_date){
			$ionicLoading.hide();
			var coursehasended_alertPopup = $ionicPopup.alert({
                title: 'Sorry!',
                template: 'The course has ended!'
    		});
			return false;
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

	function checkValidTime(current_date_obj, class_timings, button_type){

		var start_class_time = new Date((current_date_obj.toISOString().split('T'))[0]+"T"+ class_timings[0]+":00.000Z");
		var end_class_time = new Date((current_date_obj.toISOString().split('T'))[0]+"T"+ class_timings[1]+":00.000Z");

		var current_time = current_date_obj.getTime();

		if(current_time >= start_class_time && current_time <= end_class_time){
			if(button_type == "qrcode"){
				return true;
			}
			else if(button_type == "manual"){
				$ionicLoading.hide();
				var notvalidtimestart_alertPopup = $ionicPopup.alert({
	                title: 'Sorry!',
	                template: 'The lecture has not ended!'
	    		});
				return false;
			}
		}
		else if(current_time < start_class_time){
				$ionicLoading.hide();
				var notvalidtimestart_alertPopup = $ionicPopup.alert({
	                title: 'Sorry!',
	                template: 'The lecture is yet to start!'
	    		});
				return false;
		}
		else if(current_time > end_class_time){
			if(button_type == "qrcode"){
				var alert_text = "";
				if($scope.app_type == "professor"){
					alert_text = 'The lecture has ended, but you can mark attendance manually!';
				}
				else if($scope.app_type == "student"){
					alert_text = 'The lecture has ended!';
				}
				$ionicLoading.hide();
				var notvalidtimestart_alertPopup = $ionicPopup.alert({
	                title: 'Sorry!',
	                template: alert_text
	    		});
				return false;
			}
			else if(button_type == "manual"){
				return true;
			}
		}

	}

	$scope.updateClassDetail = function(){

		$scope.firebase_db.ref().child("login_details/"+$scope.user_id+"/courses/"+$scope.class_id).once("value", function(snapshot) {
	               
            if (snapshot.exists()){


                	$scope.class_obj = [];
                    $scope.class_obj = snapshot.toJSON();
                    if($scope.app_type == 'student'){
				    	$scope.class_obj.days_attended_obj = $scope.class_obj.days_attended.split(",");
				    }
				    else if($scope.app_type == 'professor'){
				    	$scope.class_obj.days_in_session_obj = $scope.class_obj.days_in_session.split(",");
				    }
					$scope.firebase_db.ref().child("list_of_courses/"+$scope.class_id).once("value", function(snapshot) {
               
		                if (snapshot.exists()){
		                	var classData = snapshot.toJSON();
		                	angular.forEach(classData, function(value, key){
							  	$scope.class_obj[key] = value;
							});
							$ionicLoading.hide();
		                    $scope.$broadcast('scroll.refreshComplete');
		                }
		                else{
		                	$ionicLoading.hide(); 
		                	$scope.$broadcast('scroll.refreshComplete');
		                    userNotLoggedIn();
		                }
		                
		            });
            }
            else{
            	$ionicLoading.hide();
                userNotLoggedIn();
            }
        });

	};

	$scope.scanAttendanceQR = function(){

		try{
        $cordovaBarcodeScanner.scan().then(function(qrcodeData) {
        	if(qrcodeData.cancelled == 0){
        		var qrcodeData_obj = JSON.parse(qrcodeData.text);
        		if(qrcodeData_obj.class_id == $scope.class_id){
            		checkMarkAttendanceTime(qrcodeData_obj);
        		}
        		else{
        			var wrongclass_alertPopup = $ionicPopup.alert({
		                title: 'Error!',
		                template: 'You are scanning for the wrong class!'
		            });
        		}
            }

        }, function(error) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error!',
                template: 'Bar code scanner is not working, try again!'
            });
            console.log("An error happened -> " + error);
        });
      }
      catch(e){
      	alert("Please test on a mobile device.");
        console.log("Please test on a mobile device.");
      }

	};

    function checkMarkAttendanceTime(qrcodeData){

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
	            		compareMarkAttendanceDayTime(response.data.formatted, qrcodeData, position);
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

    function compareMarkAttendanceDayTime(current_day_time, qrcodeData, position){

    	var current_day_time_obj = current_day_time.split(" ");
		var current_date_obj = new Date(current_day_time.replace(" ", "T")+".000Z");
		var class_days = $scope.class_obj.course_days_offered.split(",");
		var class_timings = $scope.class_obj.course_timing.split("-");

		var is_valid_day = checkValidDay(current_date_obj.getDay(), class_days);

		if(is_valid_day == true){

			var is_valid_time = checkValidTime(current_date_obj, class_timings, 'qrcode');

			if(is_valid_time == true){

				var is_valid_distance = checkMarkAttendanceDistance(qrcodeData, position);
				
				if(is_valid_distance == true){
					markAttendance(qrcodeData);
				}
				else{
					$ionicLoading.hide();
					var notvaliddistance_alertPopup = $ionicPopup.alert({
			                title: 'Sorry!',
			                template: 'You are not in the class premesis!'
		            });
				}
			}
		}
		else{
			$ionicLoading.hide();
			var notvalidday_alertPopup = $ionicPopup.alert({
	                title: 'Sorry!',
	                template: 'There is no lecture today!'
            });
		}
	}

	function checkMarkAttendanceDistance(qrcodeData, position){
			
		from = new google.maps.LatLng(qrcodeData.lat.toFixed(4), qrcodeData.lng.toFixed(4));
      	to = new google.maps.LatLng(position.coords.latitude.toFixed(4), position.coords.longitude.toFixed(4));
      	dist = google.maps.geometry.spherical.computeDistanceBetween(from, to);
		console.log(qrcodeData.lat.toFixed(4), qrcodeData.lng.toFixed(4));
		console.log(position.coords.latitude.toFixed(4), position.coords.longitude.toFixed(4));
      	console.log(dist);
      	console.log(getDistanceFromLatLonInKm(qrcodeData.lat.toFixed(3), qrcodeData.lng.toFixed(3), position.coords.latitude.toFixed(3), position.coords.longitude.toFixed(3)));
      	console.log(from.equals(to));
      	console.log(new google.maps.LatLngBounds(from,from).contains(to));
      	if(dist < 20.0 || from.equals(to) || new google.maps.LatLngBounds(from,from).contains(to)){
      		return true;
      	}
      	else{
      		return false;
      	}
	}

	function markAttendance(qrcodeData){
		
	  if($scope.class_obj.no_of_days_attended == 0){
	    updateStudentAttendance(false, qrcodeData);
	  }
	  else{
	    if($scope.class_obj.days_attended.includes(qrcodeData.class_date) == false){
	      updateStudentAttendance(true, qrcodeData);
	    }
	    else{
	    	$ionicLoading.hide();
	    	var alreadyMarked_alertPopup = $ionicPopup.alert({
	                title: 'Attention!',
	                template: 'Your attendance for '+qrcodeData.class_date+' has already been marked!'
            });
	    }
	  }

	}

	function updateStudentAttendance(has_attended_lectures, qrcodeData){

	  var days_attended = qrcodeData.class_date;
      var no_of_days_attended = $scope.class_obj.no_of_days_attended + 1;
      if(has_attended_lectures == true){
        days_attended = $scope.class_obj.days_attended+","+qrcodeData.class_date;
      }
      $scope.firebase_db.ref().child("login_details/"+$scope.user_id+"/courses/"+$scope.class_id).update({
        days_attended : days_attended,
        no_of_days_attended : no_of_days_attended
      }, function(error){
        if(error){
        	$ionicLoading.hide();
        	var notMarked_alertPopup = $ionicPopup.alert({
	                title: 'Sorry!',
	                template: 'Please try again!'
            });
        }
        else{
        	$ionicLoading.hide();
        	var attendanceMarked_alertPopup = $ionicPopup.alert({
	                title: 'Success!',
	                template: 'Your attendance for '+qrcodeData.class_date+' has been successfully marked!'
            });
           attendanceMarked_alertPopup.then(function(res) {
                 $scope.updateClassDetail();
           });
        }
      });

	}

	function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	  var R = 6371; // Radius of the earth in km
	  var dLat = deg2rad(lat2-lat1);  // deg2rad below
	  var dLon = deg2rad(lon2-lon1); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  return d;
	}

	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	}

	$scope.goToEditClassDetail = function(){

		$state.go('app.add_course', {class_obj: JSON.stringify($scope.class_obj)});

	};	
	
}

})();
