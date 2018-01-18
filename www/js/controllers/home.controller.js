
(function () {
angular.module('myApp5.controllers')
.controller('HomeCtrl', HomeCtrl);

function HomeCtrl($scope, $rootScope, constants, $ionicNavBarDelegate, $state, $cordovaBarcodeScanner, $ionicLoading, $timeout){

	$scope.view_title = "Class List";
	
	$scope.no_registered_classes = false;
	$scope.$on('$ionicView.beforeEnter', function(){
	  	
		if(localStorage.getItem('user_obj') == null || localStorage.getItem('app_type') == null || localStorage.getItem('user_id') == null){
			userNotLoggedIn();
		}
		else{	
				var firebase_config = {  apiKey: constants.firebase_apiKey,
			                             authDomain: constants.firebase_authDomain,
			                             databaseURL: constants.firebase_databaseURL,
			                             projectId: constants.firebase_projectId,
			                             storageBucket: constants.firebase_storageBucket,
			                             messagingSenderId: constants.firebase_messagingSenderId
			                          };
				try{			                          
    				firebase.initializeApp(firebase_config);
				}
				catch(e){

				}

				$scope.firebase_db = firebase.database();

				$rootScope.username = JSON.parse(localStorage.getItem('user_obj')).username;
				$rootScope.user_id = localStorage.getItem('user_id');
				$scope.app_type = localStorage.getItem('app_type');
				$rootScope.app_type = localStorage.getItem('app_type');

				
				if(localStorage.getItem('add_course_obj') != null){
					if($scope.app_type == "student"){
						var add_course_obj = JSON.parse(localStorage.getItem('add_course_obj'));
						localStorage.removeItem('add_course_obj');
						$ionicLoading.show({template: 'Adding the Course: '+add_course_obj.class_id.replace("_"," ")});
						
						
						$scope.firebase_db.ref().child('login_details/'+$rootScope.user_id+'/courses/'+add_course_obj.class_id).once("value", function(snapshot) {

		                    if(snapshot.exists()){
	                        	$ionicLoading.hide();
	                        	var failedStudentCourseAdd_alertPopup = $ionicPopup.alert({
	                           	 	title: 'Error!',
	                            	template: 'Course aleady exists for User ID: '+$rootScope.user_id+'!'
	                        	});
		                  }
		                  else{
		                      firebase.database().ref().child('login_details/'+$rootScope.user_id+'/courses/'+add_course_obj.class_id).set({
		                        course_id : add_course_obj.class_id.replace("_"," "),
		                        course_name : add_course_obj.course_name,
		                        days_attended : "",
		                        no_of_days_attended : 0
		                      }, function(error){
		                        if(error){
		                            $ionicLoading.hide();
	                              	var failedStudentCourseAdd_alertPopup = $ionicPopup.alert({
		                                  title: 'Course Add failed!',
		                                  template: 'Please try again!'
	                              	});
		                        }
		                        else{
        
                                  var user_obj = JSON.parse(localStorage.getItem('user_obj'));

                                  firebase.database().ref().child('manual_cummulative_list/'+add_course_obj.class_id).update({
                                      [$rootScope.user_id] : user_obj.username
                                  }, function(error){
                                    if(error){
                                      $ionicLoading.hide();
                                    }
                                    else{
                                      $ionicLoading.hide();
                                    }
                                  });
		                                  
		                        }
		                      });
		                  	}
		                });

					}
					else{
						localStorage.removeItem('add_course_obj');
					}
				}
				
				
				$ionicLoading.show();
				$scope.firebase_db.ref().child("login_details").orderByChild("user_id").equalTo($rootScope.user_id).once("value", function(snapshot) {
	               
	                if (snapshot.exists()){

	                    snapshot.forEach(function(userSnapshot) {
	               
	                        var userData = userSnapshot.toJSON();
							if(userData.courses == false){
						       	$scope.classes = [];
	                        	$ionicLoading.hide();
	                        	$scope.no_registered_classes = true;
	                        }
	                        else{
	                        	$scope.classes = [];
	                        	$scope.no_registered_classes = false;
								$ionicLoading.hide();
								angular.forEach(userData.courses, function(value, key) {
									value.class_id = key;
								  	$scope.classes.push(value);
								});

	                        }
	                    });
                    	$ionicLoading.hide();
	                }
	                else{
	                	$ionicLoading.hide();
	                    userNotLoggedIn();
	                }
	                
	            });
		}


	});


	function getClassObj(key, value){
		var returnObj = {};
		for(var i = 0; i < $scope.classes.length; i++){
			if($scope.classes[i][key] == value){
				returnObj = $scope.classes[i];
				break;
			}
		}
		return returnObj;

	}

	$scope.classAttendance = function(class_id){

		if(class_id != ""){

			var class_obj_string = JSON.stringify(getClassObj("class_id", class_id));
			if(class_obj_string != ""){
				if($scope.app_type == "professor")
				{	
					$state.go('app.class_detail', { class_obj : class_obj_string });
				}
				else if($scope.app_type == "student"){
					$state.go('app.class_detail', { class_obj : class_obj_string });
				}
				else{
					userNotLoggedIn();
				}
			}
		}

	};

	function userNotLoggedIn(){

		localStorage.removeItem("user_obj");
		localStorage.removeItem("user_id");
		localStorage.removeItem("app_type");

		$state.go('login');
	
	}

	// function scanBarcode(){
 //      try{
 //        $cordovaBarcodeScanner.scan().then(function(qrcodeData) {
            
 //            markAttendance(qrcodeData);

 //        }, function(error) {
 //            var alertPopup = $ionicPopup.alert({
 //                title: 'Error!',
 //                template: 'Bar code scanner is not working!'
 //            });
 //            console.log("An error happened -> " + error);
 //        });
 //      }
 //      catch(e){
 //      	alert("Please test on a mobile device.");
 //        console.log("Please test on a mobile device.");
 //      }
 //    }

 //    function markAttendance(qrcodeData){

 //    	alert(JSON.stringify(qrcodeData));
    	
 //        console.log(qrcodeData);
            

 //    }

    $scope.updateClassList = function(){

    	$scope.firebase_db.ref().child("login_details").orderByChild("user_id").equalTo($rootScope.user_id).once("value", function(snapshot) {
	               
            if (snapshot.exists()){

                snapshot.forEach(function(userSnapshot) {

                    var userData = userSnapshot.toJSON();
					if(userData.courses == false){
                    	$scope.classes = [];
                    	$ionicLoading.hide();
                    	$scope.no_registered_classes = true;
                    	$scope.$broadcast('scroll.refreshComplete');
                    }
                    else{
                    	$scope.classes = [];
                    	$scope.no_registered_classes = false;
						$ionicLoading.hide();
						angular.forEach(userData.courses, function(value, key) {
							value.class_id = key;
						  	$scope.classes.push(value);
						});
						$scope.$broadcast('scroll.refreshComplete');
                    }
                });

            }
            else{
            	$ionicLoading.hide();
                userNotLoggedIn();
            }
            
        });
    	
    	
    };

	
}

})();
