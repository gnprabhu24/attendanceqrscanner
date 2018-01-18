
(function () {
angular.module('myApp5.controllers')
.controller('LoginCtrl', LoginCtrl);

function LoginCtrl($scope, $rootScope, $ionicPopup, $state, $ionicLoading, constants){

	$scope.view_title = "Login";
	$scope.data = {};
 
    $scope.login = function() {

        resetAllErrors();

        var is_valid = validateLoginDetails();
        
        if(is_valid == true){

            $ionicLoading.show();

            // console.log("LOGIN user: " + $scope.data.user_id + " - PW: " + $scope.data.password);

            $scope.firebase_db = firebase.database();

            $scope.firebase_db.ref().child("login_details").orderByChild("user_id").equalTo($scope.data.user_id).once("value", function(snapshot) {
               
                if (snapshot.exists()){

                    snapshot.forEach(function(userSnapshot) {

                        var userData = userSnapshot.toJSON();
                        
                        if(CryptoJS.AES.decrypt(userData.password, constants.pass_secret_key).toString(CryptoJS.enc.Utf8) == $scope.data.password){

                            localStorage.setItem("user_obj", JSON.stringify(userData));
                            localStorage.setItem("user_id", userData.user_id);
                            localStorage.setItem("app_type", userData.app_type);
                            $ionicLoading.hide();
                            $state.go('app.home');

                        }
                        else{
                            $ionicLoading.hide();
                            $scope.data = {};
                            var notvalid_alertPopup = $ionicPopup.alert({
                                title: 'Login failed!',
                                template: 'Please check your credentials!'
                            });
                        }

                    });

                }
                else{
                    $ionicLoading.hide();
                    var notregistered_alertPopup = $ionicPopup.alert({
                        title: 'Login failed!',
                        template: 'User id is not yet registered!'
                    });
                    $scope.data = {};
                }
                
            });
        }


    }

    function resetAllErrors(){

        $scope.err_user_id = false;
        $scope.err_password = false;

    }

    function validateLoginDetails(){

        if($scope.data.user_id == "" || $scope.data.user_id == null){
            $scope.err_user_id = true;
            return false;
        }
        if($scope.data.password == "" || $scope.data.password == null){
            $scope.err_password = true;
            return false;
        }
        return true;

    }

    $scope.gotoState = function(state_name){
        $state.go(state_name);
    };

}

})();
