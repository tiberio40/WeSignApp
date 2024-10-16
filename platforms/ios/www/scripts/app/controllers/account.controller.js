app.controller('AccountController', AccountController);

function AccountController($window, $scope, appValues, $location, $http, $q, md5, $sessionStorage, $localStorage, $window, $timeout, readData, updateData, AuthenticationService, ImportService) {
    var vm = this;

    // Set initial values for view model properties
    vm.environment = environmentConfig;
    vm.showChangeUser = showChangeUser;
    vm.isLoading = false;
    vm.allUsers = [];
    vm.localUsers = [];
    vm.displayedCollection = [];
    vm.columns = [];
    vm.userSelected = '';
    vm.searchText = '';

    // Define functions for view model

    vm.login = login;
    
    vm.resetPassword = resetPassword;
    vm.cancelResetPassword = cancelResetPassword;
    vm.sendRecoveryMail = sendRecoveryMail;
    vm.ShowDetails = ShowDetails;
    vm.CloseDetails = CloseDetails;
    vm.navigateTo = navigateTo;
    vm.startInitialSync = startInitialSync;
    vm.SyncMessages = SyncMessages
    vm.GetModules = GetModules
    

    // View model properties for messages and state
    vm.Message = '';
    vm.synFinished = false;
    vm.syncStarted = false;
    vm.loginShow = true;
    vm.RecoverPasswordScreen = false;
    vm.PasswordExpireWarning = { 'value': false, 'days': 0 };

    // Properties for AngularJS integration
    $scope.displayMessage = '';
    vm.showDetails = false;
    $scope.progressBarValue = 0;
    $scope.countSyncActions = 0;

    // SSO related properties
    vm.userIsLoginedBySSO = false;
    vm.userOptionView = 'main';
    vm.rolesSSOList = [];
    vm.selectedRole = '';
    vm.selectedRoleObject = null;
    vm.isSSO = 0;
    vm.roleSelected = null;

    vm.arrayDisplayGet = [];
    vm.arrayDisplayImport = [];

    // vm.dataLoading = true;

    // Selected market property
    vm.selectedMarket = '';
    vm.loginResult = '';
    vm.loginDisable = true;

    var db = null;

    $scope.isOnline = false;

    vm.columnsData = [];


    initController();

    $scope.$watch('progressBarValue', function () {
        $('#progress-bar').css('width', $scope.progressBarValue + '%').attr('aria-valuenow', $scope.progressBarValue);
    });


    function initController() {


        db = localDatabase;

        //Forces the refresh of the document cache
        $sessionStorage.isDocumentsModifed = {};
        $sessionStorage.isDocumentsModifed.agreement = true;
        $sessionStorage.isDocumentsModifed.cancelation = true;
        $sessionStorage.isDocumentsModifed.iban = true;
        $sessionStorage.isDocumentsModifed.digitalAgreement = true;
        $sessionStorage.isDocumentsModifed.digitalForm = true;

        //Validates if the user has changed geography
        if (appValues.userChangedGeography == false) {

            $scope.environment = environmentConfig;
            $scope.version = vesionAppConfig;
            $sessionStorage.version = vesionAppConfig;

            console.log(serviceUrl);
            if (serviceUrl == undefined || serviceUrl == '') {
                swal("Check Environment.", "No Environment Key detected.", "error");
                return;
            }

            if (localStorage.getItem('ngStorage-sso_token') !== null) {
                console.log('tiene el tocken')
                getRolesBySSO();
            } else {
                vm.userOptionView = 'main';
            }

            readData.getLocalUser('', '', '', '')
                .then(function (data) {
                    if (data.length > 0) {
                        vm.userOptionView = 'login-classic';
                        vm.usernameDisable = true;

                        vm.username = data[0].code;
                        vm.password = '';
                        appValues.securityToken = data[0].securityToken;
                        appValues.userChangedGeography = (data[0].isGeographyChanged == 0) ? false : true;
                        vm.isSSO = data[0].isSSO ?? 0;
                        vm.selectedMarket = data[0].market;

                        //
                        if (vm.isSSO = data[0].isSSO == 1) {
                            vm.roleSelected = {
                                codeId: data[0].IdUserGroup.split(";")[0] ?? "",
                                codeName: data[0].IdUserGroup.split(";")[1] ?? ""
                            }
                        }
                        $q.all([updateData.GetLocalData('Market', '*', ' where id = ' + data[0].market)])
                            .then(function (result) {
                                var res = result[0];
                                vm.markets = [];
                                vm.markets.push(res[1][0]);
                            });

                    } else {
                        vm.usernameDisable = false;
                        vm.password = '';
                        vm.GetValueMarkets();
                    }
                });

        } else {
            //User has changed Geo, preforms the inital syncronization and resets the value
            appValues.userChangedGeography = false;
            readData.setUserChangedGeo($scope.globals.currentUser.username, 0);

            //Reloads the market's from the database to then save them again
            $q.all([updateData.GetLocalData('Market', '*', '')])
                .then(function (result) {
                    vm.markets = result[0][1];
                });

            //Assigns the vars so that the controller can sync
            vm.username = $scope.globals.currentUser.username;
            vm.selectedMarket = $scope.globals.currentUser.market;
            console.log(vm.selectedMarket)

            //Start Sync        
            vm.startInitialSync();
        }
    }

    function getRolesBySSO() {
        vm.userOptionView = 'loading-info';
        vm.dataLoading = true;
        let data = {
            access_token: $localStorage.sso_token.access_token
        }
        AuthenticationService.GetRolesBySSO(data, function (response) {
            vm.rolesSSOList = response.data;
            vm.dataLoading = false;
            let option = vm.rolesSSOList != null ? vm.rolesSSOList.length : -1;
            switch (option) {
                case -1:
                    swal(
                        "Attention",
                        "Your token has expired, please try again",
                        "error"
                    );
                    localStorage.removeItem('ngStorage-sso_code');
                    localStorage.removeItem('ngStorage-sso_token');
                    vm.userOptionView = 'main';
                    break;
                case 0:
                    swal(
                        "Attention",
                        "The PMI account does not have a registered role",
                        "error"
                    );

                    localStorage.removeItem('ngStorage-sso_code');
                    localStorage.removeItem('ngStorage-sso_token');
                    vm.userOptionView = 'main';
                    break;
                case 1:
                    vm.selectedRoleObject = response.data[0]

                    //vm.setRole();
                    vm.loginBySSO();
                    break;
                default:
                    vm.userOptionView = 'sso';
                    break;
            }




        }, function (error) {
            vm.dataLoading = false;
            vm.userOptionView = 'main';
        })
    }


    function resetPassword() {
        vm.RecoverPasswordScreen = true;
    }

    function cancelResetPassword() {
        vm.RecoverPasswordScreen = false;
        vm.recoveryEmail = ""
    }

    function sendRecoveryMail() {

        var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if (vm.recoveryEmail === "") {
            swal("Error!", "User email is required", "error");
            return;
        } else if (!emailRegex.test(vm.recoveryEmail)) {
            swal("Error!", "Invalid e-mail", "error");
            return;
        } else if (vm.selectedMarket === 0) {
            swal("Error!", "You must insert your domain", "error");
            return;
        }


        var market = this.selectedMarket.Id;


        swal({
            title: "Confirm?",
            text: "Request new temporary pass for user " + vm.recoveryEmail + " ?",
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
        },
            function () {


                var url = serviceUrl + "/api/Account/sendRecoveryMail/";

                $http(
                    {
                        method: 'POST',
                        url: url,
                        data: {
                            "email": vm.recoveryEmail,
                            "market": market,
                        },
                        headers: { 'Content-Type': 'application/json' }
                    }
                ).success(function (response) {
                    readData.setUserReset(vm.recoveryEmail, true);
                    vm.RecoverPasswordScreen = false;
                    vm.recoveryEmail = ""
                    swal({
                        title: "Success",
                        text: "Temporary password successfully sent.\nPlease check your e-mail.",
                        type: "success",
                        animation: "slide-from-top"
                    });

                }).error(function (data) {
                    swal({
                        title: "Error",
                        text: "There was an error sending the e-mail.\nPlease review account your details.",
                        type: "error",
                        animation: "slide-from-top"
                    });
                });
            });
    }

    function loginByClassic() {
        vm.dataLoading = true;
        readData.getLocalUser(vm.username, md5.createHash(vm.password || ''), vm.selectedMarket, vm.PasswordExpireWarning)
            .then(function (data) {
                if (data.length > 0) {


                    var code = data[0].code;
                    var password = data[0].password;
                    var market = data[0].market;
                    appValues.securityToken = data[0].securityToken;
                    appValues.userChangedGeography = (data[0].isGeographyChanged == 0) ? false : true;

                    vm.Message += vm.Message + '\r\nUser exists Locally :: going for authentication';
                    vm.loginDisable = true;


                    var messageType;
                    var messageBody;

                    if (vm.PasswordExpireWarning.value == true) {
                        messageType = "warning";
                        messageBody = "Your password expires in " + vm.PasswordExpireWarning.days + " days. \n Please change it to avoid a blocked access.\n\nLocal Authentication"
                    } else {
                        messageType = "success";
                        messageBody = "Local Authentication"
                    }

                    swal({
                        title: "Login Successful",
                        text: messageBody,
                        type: messageType,
                        closeOnConfirm: true
                    })

                    AuthenticationService.SetCredentials(code, password, market);

                    readData.ResetLoginError(vm.username)
                        .then(function (data) {

                        });

                    $location.path('/home');


                } else {
                    vm.Message += vm.Message + '\r\nUser doesn\'t exists Locally :: going for authentication'
                    vm.loginDisable = false;

                    readData.AddLoginError(vm.username)
                        .then(function (data) {

                        });

                    if (vm.selectedMarket == 0) {
                        swal("Login Error.", "You must insert your domain", "error");
                        vm.dataLoading = false;
                        return;
                    }

                    vm.Message += vm.Message + "\r\n" + "Server Login Called ";
                    AuthenticationService.Login(vm.username, vm.password, vm.selectedMarket, function (response) {
                        response = response.data;

                        if (response !== null && response !== "" && response.IsReset == false && (response.errno === undefined && response.errno !== 'ECONNREFUSED') && (response.ExceptionMessage === undefined || response.ExceptionMessage === '')) {
                            response['sso'] = 0;

                            readData.ResetLoginError(vm.username)
                                .then(function (data) {

                                });

                            appValues.securityToken = response.securityToken;

                            var messageType;
                            var messageBody;

                            if (response.passwordExpireDayAlert != -1) {
                                messageType = "warning";
                                messageBody = "Your password expires in " + response.passwordExpireDayAlert + " days. \n Please change it to avoid a blocked access.\n\nServer Authentication"
                            } else {
                                messageType = "success";
                                messageBody = "Server Authentication"
                            }

                            swal({
                                title: "Login Successful",
                                text: messageBody,
                                type: messageType,
                                closeOnConfirm: true
                            },
                                function (isConfirm) {
                                    vm.loginShow = false

                                    vm.syncProcess = 'Synchronization Started.';
                                    vm.displayMessage = 'Synchronization Started';
                                    var cust = false;
                                    var conf = false;
                                    var doc = false;

                                    vm.Message += vm.Message + '\r\n' + "Server Authentication for username (" + vm.username + ") password (" + vm.password + ") market (" + vm.selectedMarket + ")";
                                    vm.Message += vm.Message + '\r\n' + 'User Found';
                                    vm.loginDisable = false;
                                    vm.loginResult = 'User Found';
                                    vm.dataLoading = false;

                                    readData.AddUserToLocal(response, md5.createHash(vm.password || ''))
                                        .then(function (data) {

                                            if (data.message !== 'update') {


                                                $q.all([readData.doSync()])
                                                    .then(function (responsesSync) {

                                                        var respSync = responsesSync[0];

                                                        if (respSync[0]?.isSynced == 1) {
                                                            console.log("user is Synced!! -> NOT TYPICAL BECAUSE THE USER HAS JUST BEEN INSERTED WITH 0")
                                                            $location.path('/home');
                                                        }
                                                        else {
                                                            vm.startInitialSync();
                                                        }
                                                    });


                                            }
                                            else {


                                                readData.ResetLoginError(vm.username)
                                                    .then(function (data) {

                                                    });

                                                readData.UpdatePassword(vm.username, md5.createHash(vm.password || ''))
                                                    .then(function (data) {

                                                        if (data === 1) {
                                                            swal({
                                                                title: "Information",
                                                                text: "Password updated locally.",
                                                                type: "success",
                                                                closeOnConfirm: true
                                                            },
                                                                function (isConfirm) {
                                                                    AuthenticationService.SetCredentials(vm.username, vm.password, vm.selectedMarket);
                                                                    $scope.$apply(function () {
                                                                        $location.path('/home');
                                                                    });
                                                                });
                                                        }
                                                        else {
                                                            swal({
                                                                title: "Information",
                                                                text: "Error storing new password.",
                                                                type: "error",
                                                                closeOnConfirm: true
                                                            }, function (isConfirm) {
                                                                $scope.$apply(function () {
                                                                    $location.path('/login');
                                                                });
                                                            });
                                                        }


                                                    });


                                            }

                                        });
                                });

                        } else if (response.IsReset == true) {
                            readData.setUserReset(vm.username, true);
                            swal("Login Unsuccessful\nPassword has been reset", "Please define a new password in the backend\n\nServer Authentication", "error");
                            vm.Message += vm.Message + '\r\n' + 'Server:: User Reset';
                            vm.dataLoading = false;
                        } else {
                            swal("Login Unsuccessful. Check your credentials.", "Server Authentication: " + response.ExceptionMessage, "error");
                            vm.Message += vm.Message + '\r\n' + 'Server:: No User Found';
                            vm.dataLoading = false;
                        }
                    });
                }
            });
    }

    function login() {
        if (vm.isSSO == 1) {
            var code = '';
            var ref = cordova.InAppBrowser.open('https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/authorize?client_id=' + clientId + '&response_type=code&response_mode=query&scope=openid%20profile%20email&state=201', '_blank', 'location=no,closebuttoncaption=Go Back');

            ref.addEventListener('loadstart', function (event) {
                if (event.url.includes('state=201') && event.url.includes('wesignapp')) {
                    var urlParams = new URLSearchParams(event.url.split("?")[1]);
                    code = urlParams.get("code");
                    ref.close();
                }
            });

            ref.addEventListener('exit', function (event) {
                if (code) {
                    vm.dataLoading = true;
                    AuthenticationService.GetTokenSSO({ code: code }, function (success) {
                        let response = success;
                        if (response.hasOwnProperty('error')) {
                            vm.dataLoading = false;
                            return;
                        }

                        AuthenticationService.GetUserSSO({ token: response.access_token }, function (success) {
                            var userRole = success.roles.find(x => x.codeId == vm.roleSelected.codeId);
                            vm.dataLoading = false;
                            if (success.userPrincipalName.toUpperCase() == vm.username.toUpperCase() && userRole != undefined) {
                                AuthenticationService.SetCredentials(vm.username, vm.password, vm.selectedMarket);
                                $timeout(function () {
                                    $location.path('/home');
                                }, 500);
                            } else {
                                swal(
                                    "Attention",
                                    success.userPrincipalName.toUpperCase() != vm.username.toUpperCase()
                                        ? "The PMI account is not the same as the PMI account registered on this iPad"
                                        : "The PMI account does not have a registered role",
                                    "error"
                                );
                            }
                        }, function (error) {
                            vm.dataLoading = false;
                        })
                    }, function (error) {
                        vm.dataLoading = false;
                    });
                }

            });

        } else {
            loginByClassic();
        }
    };

    function ShowDetails() {
        vm.showDetails = true;
    }

    function CloseDetails() {
        vm.showDetails = false;
    }

    function navigateTo(to) {
        AuthenticationService.SetCredentials(vm.username, vm.password, vm.selectedMarket);
        $location.path(to);

    }

    vm.GetValueMarkets = function () {
        AuthenticationService.GetMarkets(function (response) {
            if (response.code != null && response.code == -1) {
                swal("Request Unsuccessful", responses.enabledMarkets.Message, "error");
            } else {
                vm.EnabledMarkets = response;
            }
        });

        AuthenticationService.GetEnabledMarkets(function (response) {
            if (response.code != null && response.code == -1) {
                swal("Request Unsuccessful", responses.enabledMarkets.Message, "error");
            } else {
                vm.markets = response;
                vm.dataLoading = false;
                vm.loginDisable = false;
            }
        });
    }
    
    function SyncMessages(type, functionName, value) {
        if (type !== 'init') {

            //Assign the result to the correct object
            switch (type) {
                case "get":
                    vm.getMessageArray[functionName].value = value;
                    break;
                case "import":
                    vm.importMessageArray[functionName].value = value;
                    break;
            }

            //Increases the progress bar value if final value is defined            
            if (value == "OK" || value == "WNG" || value == "ERROR") {
                $scope.countSyncActions++;
                $scope.progressBarValue = ($scope.countSyncActions / $scope.totalActions) * 100;
            }

        } else {

            //Inits the Messages for the get
            var getMessagesFunctions = [
                { functionName: 'GetConfigurations', message: 'Configurations from server' },
                { functionName: 'GetUserPermission', message: 'User Permission from server' },
                { functionName: 'GetUserGeography', message: 'User Geography from server' },
                { functionName: 'GetGeography', message: 'Geographies from server' },
                { functionName: 'GetCustomers', message: 'Customers from server' },
                { functionName: 'GetCustomerIBAN', message: 'Customer IBAN from server' },
                { functionName: 'GetDocumentTypes', message: 'Document Types from server' },
                { functionName: 'GetDocumentTypeModules', message: 'Document Type Modules from server' },
                { functionName: 'GetDocuments', message: 'Documents from server' },
                { functionName: 'GetDocumentNumber', message: 'Document Number from server' },
                { functionName: 'GetDocumentValues', message: 'Document Values from server' },
                { functionName: 'GetDocumentItemValue', message: 'Document Item Value from server' },
                { functionName: 'GetDocumentDocument', message: 'Document Relation from server' },
                { functionName: 'GetModules', message: 'Modules from server' },
                { functionName: 'GetModuleObjective', message: 'Module Objectives from server' },
                { functionName: 'GetTemplate', message: 'Templates from server' },
                { functionName: 'GetTemplateGeography', message: 'Template Geography from server' },
                { functionName: 'GetTemplateItem', message: 'Templates Items from server' },
                { functionName: 'GetTemplateModule', message: 'Template Modules from server' },
                { functionName: 'GetTemplateBodyConstant', message: 'Template Body Constant from server' },
                { functionName: 'GetTemplateImage', message: 'Template Images from server' },
                { functionName: 'GetUploadedImages', message: 'Uploaded Images from server' },
                { functionName: 'GetStep', message: 'Step from server' },
                { functionName: 'GetWorkflow', message: 'Workflow from server' },
                { functionName: 'GetWorkflowStep', message: 'Workflow Step from server' },
                { functionName: 'GetWorkflowHistory', message: 'Workflow History from server' },
                { functionName: 'GetImportedAgreement', message: 'Imported Agreement from server' },
                { functionName: 'GetBudgetAccount', message: 'Budget Account from server' }
            ]

            //Inits the Messages for the Import
            var importMessagesFunctions = [
                { functionName: 'AddConfiguration', message: 'Configuration to device' },
                { functionName: 'AddUserPermissions', message: 'User Permissions to device' },
                { functionName: 'AddUserGeography', message: 'User Geography to device' },
                { functionName: 'AddGeography', message: 'Geographys to device' },
                { functionName: 'AddCustomer', message: 'Customers to device' },
                { functionName: 'AddCustomerIBAN', message: 'Customer IBAN to device' },
                { functionName: 'AddDocumentTypes', message: 'Document Types to device' },
                { functionName: 'AddDocumentTypeModules', message: 'Document Type Modules to device' },
                { functionName: 'AddDocuments', message: 'Documents to device' },
                { functionName: 'AddDocumentNumber', message: 'Document Number to device' },
                { functionName: 'AddDocumentValues', message: 'Document Values to device' },
                { functionName: 'AddDocumentItemValue', message: 'Document Item Value to device' },
                { functionName: 'AddDocumentDocument', message: 'Document Relation to device' },
                { functionName: 'AddDocumentModules', message: 'Document Modules to device' },
                { functionName: 'AddModuleObjectives', message: 'Module Objectives to device' },
                { functionName: 'AddTemplates', message: 'Templates to device' },
                { functionName: 'AddTemplateGeography', message: 'Template Geography to device' },
                { functionName: 'AddTemplateItems', message: 'Template Items to device' },
                { functionName: 'AddTemplateModules', message: 'Template Modules to device' },
                { functionName: 'AddTemplateBodyConstant', message: 'Template Body constant to device' },
                { functionName: 'AddTemplateImage', message: 'Template Image to device' },
                { functionName: 'AddUploadedImages', message: 'Uploaded Images to device' },
                { functionName: 'AddSteps', message: 'Steps to device' },
                { functionName: 'AddWorkflow', message: 'Workflow to device' },
                { functionName: 'AddWorkflowStep', message: 'Workflow Step to device' },
                { functionName: 'AddWorkflowHistory', message: 'Workflow History to device' },
                { functionName: 'AddImportedAgreement', message: 'Imported Agreement to device' },
                { functionName: 'AddBudgetAccount', message: 'Budget Account to device' }
            ]

            //Populates the objects with the messages;

            vm.getMessageArray = {};
            getMessagesFunctions.forEach(function (element) {
                vm.getMessageArray[element.functionName] = {}
                vm.getMessageArray[element.functionName].message = element.message;
                vm.getMessageArray[element.functionName].value = 'Pending';
            });

            vm.importMessageArray = {};
            importMessagesFunctions.forEach(function (element) {
                vm.importMessageArray[element.functionName] = {}
                vm.importMessageArray[element.functionName].message = element.message;
                vm.importMessageArray[element.functionName].value = 'Pending';
            });

            //Sets the value of the progess bar        
            $scope.progressBarValue = 0;
            $scope.countSyncActions = 0;
            $scope.totalActions = getMessagesFunctions.length + importMessagesFunctions.length;
        }

    }

    function startInitialSync() {
        $scope.message = [];

        vm.isLoading = true;
        vm.syncStarted = true;
        vm.arrayModalMessage = [];

        //Inits the syncronization messages
        vm.SyncMessages('init');

        vm.GetModules(vesionAppConfig);
    }

    function GetModules(version) {
        if (version != null && version == -1) {
            swal("Request Unsuccessful", "", "error");
        }
        else {
            readData.AddServerVersion(version)
                .then(function (data) {

                    if (data != -1) {

                        $q.all([ImportService.GetCustomers(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetConfigurations(vm.SyncMessages), ImportService.GetDocuments(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetDocumentValues(vm.username, vm.selectedMarket, [], vm.SyncMessages), ImportService.GetModules(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetModuleObjective(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetStep(vm.SyncMessages), ImportService.GetTemplate(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetTemplateItem(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetTemplateModule(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetUserPermission(vm.SyncMessages), ImportService.GetCustomerIBAN(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetDocumentTypes(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetDocumentTypeModules(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetTemplateGeography(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetTemplateBodyConstant(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetGeography(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetWorkflow(vm.selectedMarket, vm.SyncMessages), ImportService.GetWorkflowStep(vm.selectedMarket, vm.SyncMessages), ImportService.GetDocumentDocument(vm.selectedMarket, vm.username, vm.SyncMessages), ImportService.GetUploadedImages(vm.selectedMarket, vm.username, vm.SyncMessages), ImportService.GetWorkflowHistory(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetBudgetAccount(vm.selectedMarket, vm.SyncMessages), ImportService.GetDocumentItemValue(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetDocumentNumber(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetTemplateImage(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetImportedAgreement(vm.username, vm.selectedMarket, vm.SyncMessages), ImportService.GetUserGeography(vm.username, vm.selectedMarket, vm.SyncMessages)])
                            .then(function (responses) {

                                $localStorage.lastSync = new Date();

                                //GETTING DATA
                                var respCustomer = responses[0];
                                var respConfigurations = responses[1];
                                var respDocuments = responses[2];
                                var respDocumentValues = responses[3];
                                var respDocumentsModules = responses[4];
                                var respModuleObjective = responses[5];
                                var respStep = responses[6];
                                var respTemplate = responses[7];
                                var respTemplateItem = responses[8];
                                var respTemplateModule = responses[9];
                                var respUserPerm = responses[10];
                                var respCustomerIBAN = responses[11];
                                var respDocumentTypes = responses[12];
                                var respDocumentTypeModules = responses[13];
                                var respTemplateGeography = responses[14];
                                var respTemplateBodyConstant = responses[15];
                                var respGeography = responses[16];
                                var respWorkflow = responses[17];
                                var respWorkflowStep = responses[18];
                                var respDocumentDocument = responses[19];
                                var respUploadedImages = responses[20];
                                var respWorkflowHistory = responses[21];
                                var respBudgetAccount = responses[22];
                                var respDocumentItemValue = responses[23];
                                var respDocumentNumber = responses[24];
                                var respTemplateImage = responses[25];
                                var respImportedAgreement = responses[26];
                                var respGetUserGeography = responses[27];


                                var count = 0;

                                $q.all([
                                    readData.AddCustomer(respCustomer, vm.SyncMessages),
                                    readData.AddConfiguration(respConfigurations, vm.SyncMessages),
                                    readData.AddDocuments(respDocuments, vm.SyncMessages),
                                    readData.AddDocumentModules(respDocumentsModules, vm.SyncMessages),
                                    readData.AddModuleObjectives(respModuleObjective, vm.SyncMessages),
                                    readData.AddSteps(respStep, vm.SyncMessages),
                                    readData.AddTemplates(respTemplate, vm.SyncMessages),
                                    readData.AddTemplateModules(respTemplateModule, vm.SyncMessages),
                                    readData.AddUserPermissions(respUserPerm, vm.SyncMessages),
                                    readData.AddCustomerIBAN(respCustomerIBAN, vm.SyncMessages),
                                    readData.AddDocumentTypes(respDocumentTypes, vm.SyncMessages),
                                    readData.AddDocumentTypeModules(respDocumentTypeModules, vm.SyncMessages),
                                    readData.AddMarkets(vm.EnabledMarkets, vm.SyncMessages),
                                    readData.AddTemplateGeography(respTemplateGeography, vm.SyncMessages),
                                    readData.AddTemplateBodyConstant(respTemplateBodyConstant, vm.SyncMessages),
                                    readData.AddGeography(respGeography, vm.SyncMessages),
                                    readData.AddWorkflow(respWorkflow, vm.SyncMessages),
                                    readData.AddWorkflowStep(respWorkflowStep, vm.SyncMessages),
                                    readData.AddDocumentDocument(respDocumentDocument, vm.SyncMessages),
                                    readData.AddWorkflowHistory(respWorkflowHistory, vm.SyncMessages),
                                    readData.AddBudgetAccount(respBudgetAccount, vm.SyncMessages),
                                    readData.AddDocumentItemValue(respDocumentItemValue, vm.SyncMessages),
                                    readData.AddDocumentNumber(respDocumentNumber, vm.SyncMessages),
                                    readData.AddTemplateImage(respTemplateImage, vm.SyncMessages),
                                    readData.AddImportedAgreement(respImportedAgreement, vm.SyncMessages),
                                    readData.AddUserGeography(respGetUserGeography, vm.SyncMessages)
                                ])
                                    .then(function (responsesAdd) {
                                        localStorage.removeItem('ngStorage-sso_code');
                                        localStorage.removeItem('ngStorage-sso_token');
                                        vm.userOptionView = 'main';

                                        vm.synFinished = true;
                                        vm.syncStarted = false;
                                        $q.all([readData.updateSync(vm.username, 1)])
                                            .then(function (responses2) {

                                            });

                                    }).catch(function (data) {
                                        alert('error importing');
                                    })['finally'](function () {
                                    });

                            }).catch(function (data) {
                                //alert(data);
                            })['finally'](function () {
                            });
                    }

                });

        }

    }

    vm.loginBySSO = function () {
        if (vm.selectedRoleObject == null) {
            if (vm.userOptionView == 'loading-info'){
                vm.userOptionView = 'sso';
            }
            return
        }

        let data = {
            marketId: vm.selectedRoleObject.idMarket,
            code: vm.selectedRoleObject.codeId,
            access_token: $localStorage.sso_token.access_token,
            typeOfAccess: "FrontEnd"
        }
        vm.dataLoading = true;

        AuthenticationService.LoginBySSO(data, function (response) {
            console.log(response);
            if (response !== null && response !== "" && (response.errno === undefined && response.errno !== 'ECONNREFUSED') && (response.ExceptionMessage === undefined || response.ExceptionMessage === '') && response.hasOwnProperty('Code')) {



                appValues.securityToken = response.securityToken;
                response['sso'] = 1;

                //Role
                let userRole = vm.rolesSSOList.find(x => x.codeId == vm.selectedRoleObject.codeId)

                response['IdUserGroup'] = userRole.codeId + ";" + userRole.market + " - " + userRole.codeName;

                vm.username = response.Code.replace('PMI\\', '');
                vm.selectedMarket = vm.selectedRoleObject.idMarket;

                let messageType = "success";
                let messageBody = "Server Authentication"
                vm.dataLoading = false;
                swal({ title: "Login Successful", text: messageBody, type: messageType, closeOnConfirm: true }, function (isConfirm) {
                    vm.loginShow = false

                    vm.syncProcess = 'Synchronization Started.';
                    vm.displayMessage = 'Synchronization Started';

                    vm.Message += vm.Message + '\r\n' + "Server Authentication for username (" + vm.username + ") password (" + vm.password + ") market (" + vm.selectedMarket + ")";
                    vm.Message += vm.Message + '\r\n' + 'User Found';
                    vm.loginDisable = false;
                    vm.loginResult = 'User Found';
                    vm.dataLoading = false;



                    readData.AddUserToLocal(response, '')
                        .then(function (data) {
                            $q.all([readData.doSync()])
                                .then(function (responsesSync) {

                                    var respSync = responsesSync[0];

                                    if (respSync[0]?.isSynced == 1) {
                                        console.log("user is Synced!! -> NOT TYPICAL BECAUSE THE USER HAS JUST BEEN INSERTED WITH 0");
                                        localStorage.removeItem('ngStorage-sso_code');
                                        localStorage.removeItem('ngStorage-sso_token');
                                        $location.path('/home');
                                    }
                                    else {
                                        //executes data import for the initial sync
                                        vm.startInitialSync();
                                    }
                                });

                        });



                });
            } else {
                swal({
                    title: "Warning",
                    text: response,
                    type: "warning",
                });
            }
            vm.dataLoading = false;
        }, function (error) {
            vm.dataLoading = false;
        })

    }

    vm.openSSO = function () {
        var ref = cordova.InAppBrowser.open('https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/authorize?client_id=' + clientId + '&response_type=code&response_mode=query&scope=openid%20profile%20email&state=201', '_blank', 'location=no,closebuttoncaption=Go Back');

        ref.addEventListener('loadstart', function (event) {
            if (event.url.includes('state=201') && event.url.includes('wesignapp')) {
                console.log(event.url)
                var urlParams = new URLSearchParams(event.url.split("?")[1]);
                var code = urlParams.get("code");
                $scope.$apply(function () {
                    $localStorage.sso_code = code;
                    ref.close();
                });
            }
        });

        ref.addEventListener('exit', function (event) {
            if (localStorage.getItem('ngStorage-sso_code') !== null) {
                $scope.$apply(function () {
                    $location.path('/oauth');
                });
            }

        });
    }

    vm.logOutSSO = function () {
        var tokenHasBeenRemoved = false;
        var ref = cordova.InAppBrowser.open('https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/logout?post_logout_redirect_uri=' + redirect_uri, '_blank', 'location=no,closebuttoncaption=Go Back');

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
                });
            }
        });

        ref.addEventListener('exit', function (event) {
            if (tokenHasBeenRemoved == true) {
                $scope.$apply(function () {
                    vm.userOptionView = 'main';
                });
            }
        });
    }

    vm.setRole = function () {
        vm.selectedRoleObject = null;

        if (vm.selectedRole) {
            vm.selectedRoleObject = vm.rolesSSOList.find(x => x.codeId == vm.selectedRole);
        }

    }

    //DEBUG function to quickly change the user
    vm.DEBUG_changeUser = function () {
        db.transaction(function (tx) {
            tx.executeSql("drop table user", [], function (tr, rs) {
                $sessionStorage.IsInCreationMode = false;
                appValues.userChangedGeography = false;
                AuthenticationService.ClearCredentials();
                window.location.reload();
            });
        });
    }
}


