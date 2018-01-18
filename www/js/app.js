// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('myApp5', ['ionic', 'myApp5.controllers', 'myApp5.services', 'myApp5.constants', 'ngCordova', 'ionic-datepicker', 'ionic-timepicker'])

.run(function($ionicPlatform, constants, $rootScope, $state, $ionicPopup, $ionicLoading, $window) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    var firebase_config = { apiKey: constants.firebase_apiKey,
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

    function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function userNotLoggedIn(){

      localStorage.removeItem("user_obj");
      localStorage.removeItem("user_id");
      localStorage.removeItem("app_type");

      $state.go('login');

    }

    window.handleOpenURL = function (url) {

      try{
        var id = getParameterByName('id', url);
        var decoded_id = decodeURI(window.atob(id));
        var id_obj = JSON.parse(decoded_id);

        if(typeof id_obj.key != "undefined" && id_obj.key != ""){
          if(id_obj.key == "add_course"){
            if(localStorage.getItem('user_obj') == null || localStorage.getItem('app_type') == null || localStorage.getItem('user_id') == null){
              localStorage.setItem("add_course_obj", JSON.stringify(id_obj.obj));
              userNotLoggedIn();
            }
            else{
              if(localStorage.getItem('app_type') == "student"){
                $ionicLoading.show({template: 'Adding the Course: '+id_obj.obj.class_id.replace("_"," ")});
                var user_id = localStorage.getItem('user_id');

                firebase.database().ref().child('login_details/'+user_id+'/courses/'+id_obj.obj.class_id).once("value", function(snapshot) {

                    if(snapshot.exists()){
                        $ionicLoading.hide();
                        var failedStudentCourseAdd_alertPopup = $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Course aleady exists for User ID: '+user_id+'!'
                        });
                  }
                  else{
                      firebase.database().ref().child('login_details/'+user_id+'/courses/'+id_obj.obj.class_id).set({
                        course_id : id_obj.obj.class_id.replace("_"," "),
                        course_name : id_obj.obj.course_name,
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

                            firebase.database().ref().child('manual_cummulative_list/'+id_obj.obj.class_id).update({
                                [user_id] : user_obj.username
                            }, function(error){
                              if(error){
                                $ionicLoading.hide();
                              }
                              else{
                                $ionicLoading.hide();
                                $window.location.reload(true);
                              }
                            });
                                  
                        }
                      });
                  }
                });
              }
            }
          }
        }
      }
      catch(e){
        console.log('Error: ',e);
        userNotLoggedIn();
      }
      
    };

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.views.maxCache(0);
  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.backButton.text("");
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/app.html',
    controller: 'AppController'
  })

  // Each tab has its own nav history stack:

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'appContent': {
        templateUrl: 'templates/app-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('app.class_detail', {
    url: '/class_detail/:class_obj',
    views: {
      'appContent': {
        templateUrl: 'templates/app-class_detail.html',
        controller: 'ClassDetailCtrl'
      }
    }
  })

  .state('app.qrcode', {
    url: '/qrcode/:class_obj',
    views: {
      'appContent': {
        templateUrl: 'templates/app-qrcode.html',
        controller: 'QrcodeCtrl'
      }
    }
  })

  .state('app.manual_attendance', {
    url: '/manual_attendance/:class_obj',
    views: {
      'appContent': {
        templateUrl: 'templates/app-manual_attendance.html',
        controller: 'ManualAttendanceCtrl'
      }
    }
  })

  .state('app.add_course', {
    url: '/add_course/:class_obj',
    views: {
      'appContent': {
        templateUrl: 'templates/app-add_course.html',
        controller: 'AddCourseCtrl'
      }
    }
  })
  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');

});
