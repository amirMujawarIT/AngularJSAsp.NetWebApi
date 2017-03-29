var myApp = angular.module('myApp', ['ngRoute']);
//config routing
myApp.config(['$routeProvider', function ($routeProvider) {


    $routeProvider
    .when('/', {
        redirectTo: '/home'
    })
    .when('/home', {
        templateUrl: '/pages/home.html'
    })
    .when('/authenticated', {
        templateUrl: '/pages/authenticate.html',
        controller: 'authenticateController'
    })
    .when('/authorized', {
        templateUrl: '/pages/authorize.html',
        controller: 'authorizeController'
    })
    .when('/login', {
        templateUrl: '/pages/login.html',
        controller: 'loginController'
    })
    .when('/unauthorized', {
        templateUrl: '/pages/unauthorize.html',
        controller: 'unauthorizeController'
    })
}])

//global veriable for store service base path
myApp.constant('serviceBasePath', 'http://localhost:52883');
//controllers
myApp.controller('authenticateController', ['$scope', 'dataService', function ($scope, dataService) {
    //FETCH DATA FROM SERVICES
    $scope.data = "";
    dataService.GetAuthenticateData().then(function (data) {
        $scope.data = data;
    })
}])
myApp.controller('authorizeController', ['$scope', 'dataService', function ($scope, dataService) {
    //FETCH DATA FROM SERVICES
    $scope.data = "";
    dataService.GetAuthorizeData().then(function (data) {
        $scope.data = data;
    })
}])
myApp.controller('loginController', ['$scope', 'accountService', '$location', function ($scope, accountService, $location) {
//FETCH DATA FROM SERVICES
    $scope.account = {
        username: '',
        password: ''
    }
    $scope.message = "";
    $scope.login = function () {
        accountService.login($scope.account).then(function (data) {
            $location.path('/home');
        }, function (error) {
            $scope.message = error.error_description;
        })
    }
}])
myApp.controller('unauthorizeController', ['$scope', function ($scope) {
    //FETCH DATA FROM SERVICES
    $scope.data = "Sorry you are not authorize to access this page";
}])

//services
myApp.factory('dataService', ['$http', 'serviceBasePath', 'userService', function ($http, serviceBasePath, userService) {
    var fac = {};
    //var defer = $q.defer();

    fac.GetAuthenticateData = function () {

        return $http({
            method: 'POST',
            url: serviceBasePath + '/Token?',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: { username: 'amir@twigsoftwares.com', password: 'Amir#123', grant_type: 'password' }
        }).success(function (response) {
            alert("Success...!");
            console.log(response);
            sessionStorage.user = angular.toJson(response);         
        });
    }

    fac.GetAuthorizeData = function () {       
        return $http({
            method: 'GET',
            url: serviceBasePath + '/api/Values',
            headers: { "Authorization": "bearer GknPy2VT1giljpd6VDMEmmDY2379-JiaUfecdTGgDMSqY8T0qde0jhNjaxOs5oHtTDcA4SBdhXTv-o5kBOg4xLiidkH0DsEhdMUrdbaDiRkqW2j3j3jh2af0iGJ1qKuI3ZYJOoOdMRBh_Lm4XUOvpW6nwwV7ttxmR1jXYfk28r-Vy-4-DFqUpYvbUe8CZ21wbDhpT0Epp3_goZGQjJgr3F0Wu_xXg84BFh4F3XfRa3jVF4BENFsXmVo0u14nGKG6-utR9BCMyRP0XpNKAbT3cG5rnXnTRiZi1uJXQsYFKFvbPWw_lUOmRfP9dnp-FJD10-w8mB-c9yZAPEwq0Xb5qv9abrEZY5xp0d8UiIKJAVP6QZ3NUkc8VbxD28IoouwB6puHirygdpJsrM8_Zc0KruQj-_WT1y8pMIfuRabOXiSp9Sd5qbRI_H4bs4Ggq1qxSQ1AoG8ThdD3cv1gGaed-8C5q1nLgY14hjsblLeDNnklAEBDBuaVQOl6P-OhaNgu" },

        }).success(function (response) {
            alert("Success...!");
            console.log(response);
            sessionStorage.user = angular.toJson(response);          
        });
    }
    return fac;
}])

myApp.factory('userService', function () {
    var fac = {};
    fac.CurrentUser = null;
    fac.SetCurrentUser = function (user) {

        fac.CurrentUser = user;
        console.log('CU' + user);
        sessionStorage.user = angular.toJson(user);
    }
    fac.GetCurrentUser = function () {
        fac.CurrentUser = angular.fromJson(sessionStorage.user);
        return fac.CurrentUser;
    }
    return fac;
})

myApp.factory('accountService', ['$http', '$q', 'serviceBasePath', 'userService', function ($http, $q, serviceBasePath, userService) {
    var fac = {};
    fac.login = function (user) {
        var obj = { 'username': user.username, 'password': user.password, 'grant_type': 'password' };
        Object.toparams = function ObjectsToParams(obj) {
            var p = [];
            for (var key in obj) {
                p.push(key + '=' + encodeURIComponent(obj[key]));
            }
            return p.join('&');
        }

        var defer = $q.defer();
        $http({
            method: 'post',
            url: serviceBasePath + "/token",
            data: Object.toparams(obj),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response) {
            userService.SetCurrentUser(response.data);
            defer.resolve(response.data);
        }, function (error) {
            defer.reject(error.data);
        })
        return defer.promise;
    }
    fac.logout = function () {
        userService.CurrentUser = null;
        userService.SetCurrentUser(userService.CurrentUser);
    }
    return fac;
}])

//http interceptor
myApp.config(['$httpProvider', function ($httpProvider) {
    var interceptor = function (userService, $q, $location) {
        return {
            request: function (config) {


                var currentUser = userService.GetCurrentUser();

                if (config.headers != null) {
                    if (currentUser != null) {

                        config.headers['Authorization'] = 'Bearer ' + currentUser.access_token;

                    }
                }

                return config;
            },
            responseError: function (rejection) {
                if (rejection.status === 401) {
                    $location.path('/login');
                    return $q.reject(rejection);
                }
                if (rejection.status === 403) {
                    $location.path('/unauthorized');
                    return $q.reject(rejection);
                }
                return $q.reject(rejection);
            }

        }
    }
    var params = ['userService', '$q', '$location'];
    interceptor.$inject = params;
    $httpProvider.interceptors.push(interceptor);
}]);
