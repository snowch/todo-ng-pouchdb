angular.module('TodoNgPouchdb', ['ionic','pouchdb'])
  .controller('TodoCtrl', function($scope, $ionicPopup, $ionicListDelegate, pouchCollection) {

    var dbName = 'ireland_demo';
    var userid = 'chris.snow';
    var url = 'https://ireelimemeneveredstainli:2744c65d0fff0689ad703385786044bf720ad612@rmgdemo2.cloudant.com/' + dbName;



    $scope.tasks = pouchCollection(dbName);

    $scope.toggleCompletion = function(task) {
      task.completed = !task.completed;
      if (task.completed) {
          var dt = new Date();
          task.date_completed = dt.toISOString();
      } else {
          delete task.date_completed;
      }
      $scope.tasks.$update(task);
    };

    $scope.deleteTask = function(task) {
      $scope.tasks.$remove(task);
    };

    $scope.newTask = function() {
      $ionicPopup.prompt({
        task_name: "New Task",
        template: "Enter task:",
        inputPlaceholder: "What do you need to do?",
        okText: 'Create task'
      }).then(function(res) {    // promise
        var dt = new Date();
        if (res) $scope.tasks.$add(
            {
                userid: userid,
                task_name: res, 
                date_created: dt.toISOString(), 
                completed: false
            }
        );
      })
    };

    $scope.editTask = function(task) {
      $scope.data = { response: task.task_name }; // A hack to pre-populate prompt
      $ionicPopup.prompt({
        title: "Edit Task",
        scope: $scope
      }).then(function(res) {    // promise
        if (res !== undefined && task.task_name !== $scope.data.response) {
          task.task_name = $scope.data.response;
          $scope.tasks.$update(task);
        } // response not res has new title (hack)
        $ionicListDelegate.closeOptionButtons();
      })
    };

    $scope.online = false;
    $scope.toggleOnline = function() {
      $scope.online = !$scope.online;
      if ($scope.online) {  // Read http://pouchdb.com/api.html#sync
        $scope.sync = $scope.tasks.$db.replicate.sync(url, {live: true})
          .on('error', function (err) {
            console.log("Syncing stopped");
            console.log(err);
          });
      } else {
        $scope.sync.cancel();
      }
    };
  })

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  });
