app.factory('auth', ['$http', function($http){
  var auth = {};

  auth.register = function(user){
  	//we kind of invoke and return the object from the register.html
  	//the return will redirect me to the server.js file where the register route is
    return $http.post('/register', user);
  };

  return auth;
}]);

