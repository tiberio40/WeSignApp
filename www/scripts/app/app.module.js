
'use strict';

var localDatabase;

var errorFunctionRegister;

var app = angular.module('app', ['angular-md5', 'ngStorage', 'ui.router', 'ngCookies', 'ui.bootstrap', 'angular-loading-bar', 'ngSanitize', 'ui.select', 'datatables', 'ngCordova', 'datatables.scroller'])
    .factory("$exceptionHandler", function () {
        return function (exception, cause) {
            var message = exception.message;
            var stack = exception.stack;
            var currUser = null;
            var currMkt = null;
            try {
                currUser = angular.element('body').scope().globals.currentUser.username;
                currMkt = angular.element('body').scope().globals.currentUser.market;
                errorFunctionRegister(currUser, currMkt, message, stack);
            } catch (e) {
                console.error("Can´t register error in Log: " + e);
            }

            console.error(exception, cause);
        };
    });

var appConstant = app.constant("config",
    {
        "serviceUrl": ''
    });

app.value("appValues", {
    "securityToken": undefined,
    "userChangedGeography": false
});


var module = appConstant.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $httpProvider) {


        $stateProvider
            .state("/", {
                url: "/login",
                templateUrl: "login/login.view.html",
                controller: "AccountController",
                controllerAs: "vm"
            })
            .state("oauth", {
                url: "/oauth",
                //url: "/oauth",
                templateUrl: "oauth/oauth.view.html",
                controller: "OauthController",
                controllerAs: "oac",
                authenticate: false
            })
            .state("home", {
                url: "/home",
                views: {
                    'menutop':
                    {
                        templateUrl: "menu/menutop.view.html",
                        controller: "MenuTopController",
                        controllerAs: "vm"
                    },
                    'content': {
                        templateUrl: "home/home.view.html",
                        controller: "HomeController",
                        controllerAs: "vm"
                    }
                },
                //templateUrl: "home/home.view.html",
                //controller: "HomeController",
                //controllerAs: "vm"
            })
            .state("newdocument", {
                url: "/document",
                views: {
                    'menutop':
                    {
                        templateUrl: "menu/menutop.view.html",
                        controller: "MenuTopController",
                        controllerAs: "vm"
                    },
                    'content': {
                        templateUrl: "document/selectdocumenttype.view.html",
                        controller: "SelectDocumentTypeController",
                        controllerAs: "vm"
                    }
                },
            })
            .state("editdocument", {
                url: "/editdocument",
                views: {
                    'menutop':
                    {
                        templateUrl: "menu/menutop.view.html",
                        controller: "MenuTopController",
                        controllerAs: "vm"
                    },
                    'content': {
                        templateUrl: "document/createdocument.view.html",
                        controller: "CreateDocumentController",
                        controllerAs: "vm"
                    }
                },
            })
            .state("createdocument", {
                url: "/createdocument",
                views: {
                    'menutop':
                    {
                        templateUrl: "menu/menutop.view.html",
                        controller: "MenuTopController",
                        controllerAs: "vm"
                    },
                    'content': {
                        templateUrl: "document/createdocument.view.html",
                        controller: "CreateDocumentController",
                        controllerAs: "vm"
                    }
                }
            })
            .state("sync", {
                url: "/sync",
                templateUrl: "sync/sync.view.html",
                controller: "SyncController",
                controllerAs: "vm"
            })
            .state("preview", {
                url: "/preview",
                views: {
                    'menutop':
                    {
                        templateUrl: "menu/menutop.view.html",
                        controller: "MenuTopController",
                        controllerAs: "vm"
                    },
                    'content': {
                        templateUrl: "document/preview.html",
                        controller: "BodyController",
                        controllerAs: "vm"
                    }
                }
            })
            .state("previewHTMLBody", {
                url: "/view/template/previewHTMLBody.html",
                authenticate: true
            });

        $urlRouterProvider.otherwise("/login");

        

        $httpProvider.interceptors.push('APIInterceptor');



    }]);


appConstant.run(function ($rootScope, $state, $cookieStore, $http, $sessionStorage) {
    localDatabase = window.sqlitePlugin.openDatabase({ name: "CMTLocal.db", location: 1 });


    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {

    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {

    });

    $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        $rootScope.isOnline = true;

        $rootScope.$apply();
    })

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
        console.log("got offline");
        $rootScope.isOnline = false;
        $rootScope.$apply();
    })
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        if (toState.authenticate) {
            // User isn’t authenticated
            event.preventDefault();
        }
    });

    errorFunctionRegister = function (userCode, marketId, message, stack) {
        var url = serviceUrl + "/api/Account/registerError/";

        $http(
            {
                method: 'POST',
                url: url,
                data: {
                    "message": message,
                    "market": marketId,
                    "user": userCode,
                    "stack": stack
                },
                headers: { 'Content-Type': 'application/json' }
            }
        ).success(function (response) {
            console.log("Error Message Registered")

        }).error(function (data) {
            console.error("Error Message Not Registered")
        });
    }

});