app.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth){
  $scope.register = function () {
    auth.register($scope.user); //$http.post('/register', {username: "John", password: "Smith"})
 	$state.go('home');
  };
}]);
