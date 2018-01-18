
(function () {
angular.module('myApp5.controllers')
.controller('AddCourseCtrl', AddCourseCtrl);

function AddCourseCtrl($scope, $rootScope, $ionicNavBarDelegate, $state, $stateParams, ionicDatePicker, ionicTimePicker, $ionicPopup, $ionicLoading, $location){

	
	$scope.view_title = "Add Course";

	$scope.data = {};

	$scope.course_terms = [
        {  label: "Spring", value:"Spring" },
        {  label: "Summer", value:"Summer" },
        {  label: "Fall", value:"Fall" },
        {  label: "Winter", value:"Winter" }
    ];

    $scope.days_of_week = [ { value:"Sunday", isChecked: false },
							{ value:"Monday", isChecked: false },
							{ value:"Tuesday", isChecked: false },
							{ value:"Wednesday", isChecked: false },
							{ value:"Thursday", isChecked: false },
							{ value:"Friday", isChecked: false },
							{ value:"Saturday", isChecked: false } ];

	$scope.course_days_rows = 1;
	
	$scope.$on('$ionicView.beforeEnter', function(){


		$scope.user_id = localStorage.getItem('user_id');
		$scope.class_obj = $stateParams.class_obj;
		$scope.mode = "";
		if($scope.class_obj != 0){
			$scope.class_obj = JSON.parse($stateParams.class_obj);
		}

		$scope.firebase_db = firebase.database();
		
		if($scope.class_obj == 0){
			
		}
		else if(typeof $scope.class_obj.class_id != "undefined" && $scope.class_obj.class_id != ""){
			$ionicLoading.show({template: "Loading Class Details to Edit...."});
			$scope.mode = "edit";
			$scope.view_title = "Edit Course";
			getClassDetailData();
		}
		else{
			userNotLoggedIn();
		}
		

	});

	function getClassDetailData(){

		$scope.data.course_name = $scope.class_obj.course_name;
		$scope.data.course_term = {  label: ($scope.class_obj.Term_offered.split(" "))[0], value: ($scope.class_obj.Term_offered.split(" "))[0] }; 
		$scope.data.course_start_date = $scope.class_obj.start_date;
        $scope.data.course_start_date_obj = new Date($scope.class_obj.start_date+"T12:00:00.000Z");
		$scope.data.course_end_date = $scope.class_obj.end_date;
        $scope.data.course_end_date_obj = new Date($scope.class_obj.end_date+"T12:00:00.000Z");
        $scope.data.course_start_time = ($scope.class_obj.course_timing.split("-"))[0];
        $scope.data.course_start_time_val = Number(($scope.data.course_start_time.split(":"))[0]) * 60 * 60 + Number(($scope.data.course_start_time.split(":"))[1]) * 60;
        $scope.data.course_end_time = ($scope.class_obj.course_timing.split("-"))[1];
        $scope.data.course_end_time_val = Number(($scope.data.course_end_time.split(":"))[0]) * 60 * 60 + Number(($scope.data.course_end_time.split(":"))[1]) * 60;
        $scope.data.course_days_offered = $scope.class_obj.course_days_offered.replace(/,/g,", ");
        var cnt = 0;
        var course_days_offered = $scope.data.course_days_offered.split(", ");
    	for(var i = 0; i < course_days_offered.length; i++){
    		for(var j = 0; j < $scope.days_of_week.length; j++){
	      		if($scope.days_of_week[j]['value'] == course_days_offered[i]){
	          		$scope.days_of_week[j]['isChecked'] = true;
	          		cnt++;
		          	if(cnt >= 4 && cnt <= 6){
	          			$scope.course_days_rows = 2;
	          		}
	          		else if(cnt > 6){
	          			$scope.course_days_rows = 3;
	          		}
	      		}
	      	}
      	}

        $ionicLoading.hide();

	}

	function userNotLoggedIn(){

		localStorage.removeItem("user_obj");
		localStorage.removeItem("user_id");
		localStorage.removeItem("app_type");

		$state.go('login');
	
	}

    $scope.openDatePicker = function(type){
    	if(type == 'start'){
    		var start_date_ipObj = {
		      callback: function (val) {  //Mandatory
		      	$scope.data.course_start_date_obj = new Date(val); 
		      	$scope.data.course_start_date = ($scope.data.course_start_date_obj.toISOString().split('T'))[0];
		      },
		      mondayFirst: false,          //Optional
		      closeOnSelect: true,       //Optional
		      templateType: 'popup'       //Optional
		    };

		    var start_date_ipObj_selected = {
		      callback: function (val) {  //Mandatory
		      	$scope.data.course_start_date_obj = new Date(val); 
		      	$scope.data.course_start_date = ($scope.data.course_start_date_obj.toISOString().split('T'))[0];
		      },
		      inputDate: $scope.data.course_start_date_obj,
		      mondayFirst: false,          //Optional
		      closeOnSelect: true,       //Optional
		      templateType: 'popup'       //Optional
		    };

    		if(typeof $scope.data.course_start_date == "undefined" || $scope.data.course_start_date == ""){
    			ionicDatePicker.openDatePicker(start_date_ipObj);
    		}
    		else{
      			ionicDatePicker.openDatePicker(start_date_ipObj_selected);
			}
      	}
      	else if(type == 'end'){
      		var end_date_ipObj = {
		      callback: function (val) {  //Mandatory
		      	$scope.data.course_end_date_obj = new Date(val); 
		      	$scope.data.course_end_date = ($scope.data.course_end_date_obj.toISOString().split('T'))[0];
		      },
		      mondayFirst: false,          //Optional
		      closeOnSelect: true,       //Optional
		      templateType: 'popup'       //Optional
		    };

		    var end_date_ipObj_selected = {
		      callback: function (val) {  //Mandatory
		      	$scope.data.course_end_date_obj = new Date(val); 
		      	$scope.data.course_end_date = ($scope.data.course_end_date_obj.toISOString().split('T'))[0];
		      },
		      inputDate: $scope.data.course_end_date_obj,
		      mondayFirst: false,          //Optional
		      closeOnSelect: true,       //Optional
		      templateType: 'popup'       //Optional
		    };

    		if(typeof $scope.data.course_end_date == "undefined" || $scope.data.course_end_date == ""){
    			ionicDatePicker.openDatePicker(end_date_ipObj);
    		}
    		else{
      			ionicDatePicker.openDatePicker(end_date_ipObj_selected);
			}
      	}
    };

    function addZero(i) {
	    if (i < 10) {
	        i = "0" + i;
	    }
	    return i;
	}
  
	$scope.openTimePicker = function(type){
	  if(type == 'start'){
    		var start_time_ipObj = {
			    callback: function (val) {      //Mandatory
			      if (typeof (val) === 'undefined') {
			        console.log('Time not selected');
			      } else {
			      	$scope.data.course_start_time_val = val;
			        var course_start_time_obj = new Date(val * 1000);
			        $scope.data.course_start_time = course_start_time_obj.getUTCHours()+":"+addZero(course_start_time_obj.getUTCMinutes());
			      }
			    },
			    inputTime: 43200,
			    format: 24,         //Optional
			    step: 5,           //Optional
			  };

		    var start_time_ipObj_selected = {
			    callback: function (val) {      //Mandatory
			      if (typeof (val) === 'undefined') {
			        console.log('Time not selected');
			      } else {
			      	$scope.data.course_start_time_val = val;
			        var course_start_time_obj = new Date(val * 1000);
			        $scope.data.course_start_time = course_start_time_obj.getUTCHours()+":"+addZero(course_start_time_obj.getUTCMinutes());
			      }
			    },
			    inputTime: $scope.data.course_start_time_val,   //Optional
			    format: 24,         //Optional
			    step: 5,           //Optional
			  };

    		if(typeof $scope.data.course_start_time == "undefined" || $scope.data.course_start_time == ""){
    			ionicTimePicker.openTimePicker(start_time_ipObj);
    		}
    		else{
      			ionicTimePicker.openTimePicker(start_time_ipObj_selected);
			}
      	}
      	else if(type == 'end'){
      		var end_time_ipObj = {
			    callback: function (val) {      //Mandatory
			      if (typeof (val) === 'undefined') {
			        console.log('Time not selected');
			      } else {
			      	$scope.data.course_end_time_val = val;
			        var course_end_time_obj = new Date(val * 1000);
			        $scope.data.course_end_time = course_end_time_obj.getUTCHours()+":"+addZero(course_end_time_obj.getUTCMinutes());
			      }
			    },
			    inputTime: 43200,
			    format: 24,         //Optional
			    step: 5,           //Optional
			  };

		    var end_time_ipObj_selected = {
			    callback: function (val) {      //Mandatory
			      if (typeof (val) === 'undefined') {
			        console.log('Time not selected');
			      } else {
			      	$scope.data.course_end_time_val = val;
			        var course_end_time_obj = new Date(val * 1000);
			        $scope.data.course_end_time = course_end_time_obj.getUTCHours()+":"+addZero(course_end_time_obj.getUTCMinutes());
			      }
			    },
			    inputTime: $scope.data.course_end_time_val,   //Optional
			    format: 24,         //Optional
			    step: 5,           //Optional
			  };

    		if(typeof $scope.data.course_end_time == "undefined" || $scope.data.course_end_time == ""){
    			ionicTimePicker.openTimePicker(end_time_ipObj);
    		}
    		else{
      			ionicTimePicker.openTimePicker(end_time_ipObj_selected);
			}
		}
	};

	$scope.openCourseDaysOffered = function(){

		$ionicPopup.show({
	      templateUrl: 'templates/courseSelectDaysTemplate.html',
	      title: 'Select Course Days',
	      scope: $scope,
	      cssClass: 'course_days_offered_popup',
	      buttons: [{
	        text: 'Cancel',
	        //type: 'button-positive',
	        onTap: function(e) {

	        }
	      }, {
	        text: 'Save',
	        type: 'button-normal',
	        onTap: function(e) {
	        	$scope.data.course_days_offered = "";
	        	$scope.course_days_rows = 1;
	        	var cnt = 0;
	        	for(var i = 0; i < $scope.days_of_week.length; i++){
	          		if($scope.days_of_week[i]['isChecked'] == true){
		          		if(typeof $scope.data.course_days_offered != "undefined" && $scope.data.course_days_offered != ""){
		          			$scope.data.course_days_offered = $scope.data.course_days_offered+", "+$scope.days_of_week[i].value;
		          		}
		          		else{
		          			$scope.data.course_days_offered = $scope.days_of_week[i].value;
		          		}
		          		cnt++;

			          	if(cnt >= 4 && cnt <= 6){
		          			$scope.course_days_rows = 2;
		          		}
		          		else if(cnt > 6){
		          			$scope.course_days_rows = 3;
		          		}
	          		}
	          	}
	        }
	      }]
	    });

	};



	$scope.addcourse = function(){
		
		resertAllErrors();
		var is_valid = validateCourseDetails();

		if(is_valid == true){

			$ionicLoading.show();

			var class_id = $scope.data.course_id.toUpperCase().replace(" ","_");
			$scope.data.course_id = $scope.data.course_id.toUpperCase();
			$scope.firebase_db.ref().child("list_of_courses/"+class_id).once("value", function(snapshot) {
				
				if(snapshot.exists()){
					$ionicLoading.hide();
					var courseIDExits_alertPopup = $ionicPopup.alert({
		                title: 'Error!',
		                template: 'This Course ID already exists!'
	            	});			
				}
				else{
					$scope.firebase_db.ref().child("list_of_courses/"+class_id).set({
                        Term_offered: $scope.data.course_term.value+" "+$scope.data.course_start_date_obj.getFullYear(),
                        course_days_offered: $scope.data.course_days_offered.replace(/, /g,","),
                        course_id: $scope.data.course_id,
                        course_name: $scope.data.course_name,
                        course_timing: $scope.data.course_start_time+"-"+$scope.data.course_end_time,
                        end_date: $scope.data.course_end_date,
                        num_of_lectures_conducted: 0,
                        prof_id: $scope.user_id,
                        start_date: $scope.data.course_start_date
                      }, function(error) {
                      if (error) {
                        $ionicLoading.hide();
                        var addCourseFailed_alertPopup = $ionicPopup.alert({
                            title: 'Course Add failed!',
                            template: 'Please try again!'
                        });
                      } else {
                        	updateProfCourses(class_id);
                    	}
					});
				}


			});

		}
	};

	function updateProfCourses(class_id){
		$scope.firebase_db.ref().child("login_details/"+$scope.user_id+"/courses/"+class_id).set({
	        course_id: $scope.data.course_id,
	        course_name: $scope.data.course_name,
	        days_in_session: "0",
	        no_of_classes_completed: 0
	      }, function(error) {
	      if (error) {
	        updateProfCourses(class_id);
	      } else {
	        
	            $ionicLoading.hide();
	            var addCourseSuccess_alertPopup = $ionicPopup.alert({
	                title: 'Course Add Successful!',
	                template: 'Course '+class_id.replace("_"," ")+' has been successfully added!'
	            });

	            addCourseSuccess_alertPopup.then(function(res) {
	                 $scope.data = {};
	           });

	    	}
		});
	}

	function resertAllErrors(){
		if($scope.mode != "edit"){
			$scope.err_course_id = false;
		}
		$scope.err_course_name = false;
		$scope.err_course_term = false;
		$scope.err_course_start_date = false;
		$scope.err_course_end_date = false;
		$scope.err_course_end_date_valid = false;
		$scope.err_course_start_time = false;
		$scope.err_course_end_time = false;
		$scope.err_course_end_time_valid = false;
		$scope.err_course_days_offered = false;
	}

	function validateCourseDetails(){

		if($scope.mode != "edit"){
			if($scope.data.course_id == "" || $scope.data.course_id == null){
				$scope.err_course_id = true;
				return false;
			}
		}
		if($scope.data.course_name == "" || $scope.data.course_name == null){
			$scope.err_course_name = true;
			return false;
		}
		if($scope.data.course_term == "" || $scope.data.course_term == null){
			$scope.err_course_term = true;
			return false;
		}
		if($scope.data.course_start_date == "" || $scope.data.course_start_date == null){
			$scope.err_course_start_date = true;
			return false;
		}
		if($scope.data.course_end_date == "" || $scope.data.course_end_date == null){
			$scope.err_course_end_date = true;
			return false;
		}
		if($scope.data.course_end_date_obj.getTime() <= $scope.data.course_start_date_obj.getTime()){
			$scope.err_course_end_date_valid = true;
			return false;
		}
		if($scope.data.course_start_time == "" || $scope.data.course_start_time == null){
			$scope.err_course_start_time = true;
			return false;
		}
		if($scope.data.course_end_time == "" || $scope.data.course_end_time == null){
			$scope.err_course_end_time = true;
			return false;
		}
		if($scope.data.course_end_time_val <= $scope.data.course_start_time_val){
			$scope.err_course_end_time_valid = true;
			return false;
		}
		if($scope.data.course_days_offered == "" || $scope.data.course_days_offered == null){
			$scope.err_course_days_offered = true;
			return false;
		}

		return true;

	}

	$scope.updatecourse = function(){
		
		resertAllErrors();
		var is_valid = validateCourseDetails();

		if(is_valid == true){

			$ionicLoading.show();

			$scope.firebase_db.ref().child("list_of_courses/"+$scope.class_obj.class_id).update({
				Term_offered: $scope.data.course_term.value+" "+$scope.data.course_start_date_obj.getFullYear(),
                course_days_offered: $scope.data.course_days_offered.replace(/, /g,","),
                course_name: $scope.data.course_name,
                course_timing: $scope.data.course_start_time+"-"+$scope.data.course_end_time,
                end_date: $scope.data.course_end_date,
                start_date: $scope.data.course_start_date
			}, function(error){

				if(error){
					$ionicLoading.hide();
                    var updateCourseFailed_alertPopup = $ionicPopup.alert({
                        title: 'Course Update failed!',
                        template: 'Please try again!'
                    });
				}
				else{
					updateProfCourse_edit($scope.class_obj.class_id);
				}

			});

		}
	};

	function updateProfCourse_edit(class_id){
		$scope.firebase_db.ref().child("login_details/"+$scope.user_id+"/courses/"+class_id).update({
	        course_name: $scope.data.course_name
	      }, function(error) {
	      if (error) {
	        updateProfCourse_edit(class_id);
	      } else {
	        
	            $ionicLoading.hide();
	            var updateCourseSuccess_alertPopup = $ionicPopup.alert({
	                title: 'Course Update Successful!',
	                template: 'Course '+class_id.replace("_"," ")+' has been successfully updated!'
	            });

	    	}
		});
	}

	
}

})();
