
(function () {
angular.module('myApp5.controllers')
.controller('SignupCtrl', SignupCtrl);

function SignupCtrl($scope, $rootScope, $ionicPopup, $state, $ionicLoading, constants){

	$scope.view_title = "Sign Up";

	$scope.data = {};

    // $scope.user_roles = [
    //     {  label: "Student", value:"student" },
    //     {  label: "Professor", value:"professor" }
    // ];
 
    $scope.signup = function() {
        
        resetAllErrors();

        var is_valid = validateSignUpDetails();

        if(is_valid == true){

            $ionicLoading.show();

            console.log("Sign Up user: ", $scope.data);

            $scope.firebase_db = firebase.database();

            $scope.firebase_db.ref().child("login_details").orderByChild("user_id").equalTo($scope.data.user_id).once("value", function(snapshot) {
               
                if (snapshot.exists()){
                    $ionicLoading.hide();
                    var userExists_alertPopup = $ionicPopup.alert({
                        title: 'Registration failed!',
                        template: 'User id already exists!'
                    });

                }
                else{
                    $scope.data.app_type = "student";
                    $scope.data.courses = false;
                    var password = CryptoJS.AES.encrypt($scope.data.password, constants.pass_secret_key).toString();
                    $scope.firebase_db.ref().child("login_details/"+$scope.data.user_id).set({
                        user_id: $scope.data.user_id,
                        username: $scope.data.username,
                        user_email: $scope.data.email,
                        password: password,
                        app_type: $scope.data.app_type,
                        courses: $scope.data.courses
                      }, function(error) {
                      if (error) {
                        $ionicLoading.hide();
                        var failedRegistration_alertPopup = $ionicPopup.alert({
                            title: 'Registration failed!',
                            template: 'Please try again!'
                        });
                        // console.log(error);
                       
                      } else {
                        
                        $ionicLoading.hide();
                        var userRegistrationSuccess_alertPopup = $ionicPopup.alert({
                            title: 'Registration successful!',
                            template: 'You have successfully registered!'
                        });

                        userRegistrationSuccess_alertPopup.then(function(res) {
                             $state.go('login');
                       });
                        
                        
                      }
                    });


                }
                
            });
        }


    }

    function resetAllErrors(){

        $scope.err_user_id = false;
        // $scope.err_app_type = false;
        $scope.err_username = false;
        $scope.err_email = false;
        $scope.err_password = false;
        $scope.err_confirm_password = false;
        $scope.err_confirm_password_valid = false;


    }

    function validateSignUpDetails(){

        if($scope.data.user_id == "" || $scope.data.user_id == null){
            $scope.err_user_id = true;
            return false;
        }
        // if($scope.data.app_type == "" || $scope.data.app_type == null){
        //     $scope.err_app_type = true;
        //     return false;
        // }
        if($scope.data.username == "" || $scope.data.username == null){
            $scope.err_username = true;
            return false;
        }
        if($scope.data.email == "" || $scope.data.email == null){
            $scope.err_email = true;
            return false;
        }
        if($scope.data.password == "" || $scope.data.password == null){
            $scope.err_password = true;
            return false;
        }
        if($scope.data.confirm_password == "" || $scope.data.confirm_password == null){
            $scope.err_confirm_password = true;
            return false;
        }
        if($scope.data.password != $scope.data.confirm_password){
            $scope.err_confirm_password_valid = true;
            return false;
        }
        return true;

    }

    $scope.validatePassword = function(){
        if($scope.data.confirm_password != $scope.data.password){
            $scope.err_confirm_password_valid = true;
        }
        else{
            $scope.err_confirm_password_valid = false;   
        }
    };

}

})();
