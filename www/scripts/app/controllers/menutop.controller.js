
app.controller('MenuTopController', MenuTopController);

function MenuTopController($scope, $location, appValues, AuthenticationService, updateData, $q, $sessionStorage, $localStorage, $filter, $sessionStorage) {
    var vm = this;
    vm.logout = logout;
    vm.settings = settings;
    vm.lastSync = $filter('date')(new Date($localStorage.lastSync), 'dd-MM-yyyy HH:mm:ss');
    var username = $scope.globals.currentUser.username;
    var idmarket = $scope.globals.currentUser.market;
    vm.version = $sessionStorage.version;
    if ((username == null || username == undefined) || (idmarket == null || username == idmarket)) {
        //redirect to login
    }

    $q.all([updateData.GetLocalData('User', 'firstname, lastname, isSSO',)]).then(function (data) {
        if (data != null) {
            vm.firstName = data[0][1][0].firstName;
            vm.lastName = data[0][1][0].lastName;
            vm.isSSO = data[0][1][0].isSSO ?? 0;
        }
    });

    vm.createdocument = function (to) {
        if (appValues.userChangedGeography == true) {

            swal({
                title: "Error",
                text: "Your territory has been changed.\nTo create a new document is necessary to sync and load the new data.",
                type: "error",
                closeOnConfirm: true
            });

        } else if ($sessionStorage.IsInCreationMode == true) {
            swal({
                title: "Are you sure?",
                text: "If you continue your current document will be cancelled.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                closeOnConfirm: true
            },
                function () {
                    $scope.$apply(function () {
                        $sessionStorage.Document = undefined;
                        $sessionStorage.IBANChange = false;
                        $sessionStorage.selectedDocumentId = null;

                        $location.path(to);
                    });

                });
        } else {
            $sessionStorage.Document = undefined;
            $sessionStorage.IsInCreationMode = true;
            $sessionStorage.IBANChange = false;
            $location.path(to);
        }
    }

    vm.navigateTo = function (to) {
        if ($sessionStorage.IsInCreationMode == true) {
            swal({
                title: "Are you sure?",
                text: "If you continue your document will be cancelled.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                closeOnConfirm: true
            },
                function () {
                    $scope.$apply(function () {
                        $sessionStorage.IsInCreationMode = false;
                        $sessionStorage.IBANChange = false;
                        $sessionStorage.selectedDocumentId = '';
                        $location.path(to);
                    });

                });
        } else {
            $location.path(to);
        }

    }

    function settings() {
        //alert('Under Development');
        //var page = '<h1>Hello Document</h1>';
        //cordova.plugins.printer.print(page, 'Document.html', function () {
        //    alert('printing finished or canceled')
        //});
    }

    function logout() {
        //AuthenticationService.ClearCredentials();
        //$location.path('/');
        swal({
            title: "Are you sure?",
            text: "You will be disconnected from the application.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: true
        },
            function () {
                if (vm.isSSO == 1) {
                    var tokenHasBeenRemoved = false;
                    var ref = cordova.InAppBrowser.open('https://login.microsoftonline.com/' + tenant +  '/oauth2/v2.0/logout?post_logout_redirect_uri=' + redirect_uri, '_blank', 'location=no,closebuttoncaption=Go Back');
                    
                    ref.addEventListener('loadstart', function (event) {
                        //logoutsession
                        console.log(event.url)
                        if (event.url.includes('state=300') && event.url.includes('wesignapp') && !event.url.includes('microsoft')) {
                            tokenHasBeenRemoved = true;
                            ref.close();
                        }
                    });

                    ref.addEventListener('loadstop', function (event) {
                        //logoutsession
                        console.log(event.url)
                        if (event.url.includes('logoutsession') && event.url.includes('microsoft')) {
                            $scope.$apply(function () {
                                tokenHasBeenRemoved = true;
                                localStorage.removeItem('ngStorage-sso_code');
                                localStorage.removeItem('ngStorage-sso_token');
                                $sessionStorage.IsInCreationMode = false;
                                appValues.userChangedGeography = false;     //resets this value so that the app remains at login
                                AuthenticationService.ClearCredentials();
                            });
                        }
                    });

                    ref.addEventListener('exit', function (event) {
                        if(tokenHasBeenRemoved == true){
                            $scope.$apply(function () {
                                $location.path('/login');
                            });
                        }
                    });



                } else { }
                $scope.$apply(function () {
                    $sessionStorage.IsInCreationMode = false;
                    appValues.userChangedGeography = false;     //resets this value so that the app remains at login
                    AuthenticationService.ClearCredentials();
                    $location.path('/login');
                });
            });
    }


}


