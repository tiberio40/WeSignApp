
app.controller('SyncController', function ($scope, $location, appValues, SyncService, updateData, ImportService, AuthenticationService, $q, readData, $localStorage, $sessionStorage) {
    var vm = this;
    vm.isLoadingSync = false;
    vm.arraySyncResp = [];
    vm.syncFinished = false;
    vm.userChangedGeography = false;
    vm.navigateTo = navigateTo;
    vm.CallImportService = CallImportService;
    $scope.progressBarValueSync = 0;
    $scope.countSyncActionsSync = 0;
    
    
    $scope.$watch('progressBarValueSync', function () {
        $('#progress-bar-sync').css('width', $scope.progressBarValueSync + '%').attr('aria-valuenow', $scope.progressBarValueSync);
    });
    
    
    vm.SyncMessages = function (type, functionName, value) {
        
        if (type != 'init') {
            
            //Assign the result to the correct object
            switch (type) {
                case "export":
                    vm.exportMessageArray[functionName].value = value;
                    break;
                case "get":
                    vm.getMessageArray[functionName].value = value;
                    break;
                case "import":
                    vm.importMessageArray[functionName].value = value;
                    break;
            }
            
            //Increases the progress bar value if final value is defined
            if (value == "OK" || value == "WNG" || value == "ERROR" || value == "No Network") {
                $scope.countSyncActions ++;
                $scope.progressBarValueSync = ($scope.countSyncActions / $scope.syncTotalActions) * 100;
                console.log(type + "   |   " + functionName + "   ->   " + $scope.countSyncActions + "   /   " + $scope.syncTotalActions + "   ->   " + $scope.progressBarValueSync)
            }
        } else {
            
            //Inits the Messages for the export
            var exportMessageArray = [
                { functionName: 'CheckIfActive', message: 'Checking if Sync is Available' },
                { functionName: 'CheckUserActive', message: 'Checking User Permissions' },
                { functionName: 'isChangedGeography', message: 'Checking User Geographies' },
                { functionName: 'GetFrontendConfigurations', message: 'Get Export Configurations ' },
                { functionName: 'GetLocalDocumentsIdAndStep', message: 'Verifying Local Documents' },
                { functionName: 'GetModifiedDocuments', message: 'Verifying Modified Documents' },
                { functionName: 'GetLocalDataSync2Documents', message: 'Collecting Documents' },
                { functionName: 'GetLocalDataSync2DocumentModuleValue', message: 'Collecting Document Values' },
                { functionName: 'GetLocalDataSync2DocumentItemValue', message: 'Collecting Documents Item Values' },
                { functionName: 'GetLocalDataSync2WorkflowHistory', message: 'Collecting Workflow History' },
                { functionName: 'GetLocalDataSync2DocumentDocument', message: 'Collecting  Document Relations' },
                { functionName: 'GetLocalDataSync2Customer', message: 'Collecting Customers' },
                { functionName: 'GetLocalDataSync2CustomerIBAN', message: 'Collecting Customer IBANs' },
                { functionName: 'GetLocalDataSync2ImportedAgreement', message: 'Collecting Imported Agreements' },
                { functionName: 'doSyncExport2', message: 'Exporting to server' }
            ]
            
            //Inits the Messages for the get
            var getMessagesFunctions = [
                { functionName: 'GetConfigurations', message: 'Configurations from server' },
                { functionName: 'GetUserPermission', message: 'User Permission from server' },
                { functionName: 'GetGeography', message: 'Geographies from server' },
                { functionName: 'GetCustomers', message: 'Customers from server' },
                { functionName: 'GetCustomerIBAN', message: 'Customer IBAN from server' },
                { functionName: 'GetDocumentTypes', message: 'Document Types from server' },
                { functionName: 'GetDocumentTypeModules', message: 'Document Type Modules from server' },
                { functionName: 'doSyncImportDocument', message: 'Documents from server' },
                { functionName: 'GetDocumentNumber', message: 'Document Number from server' },
                { functionName: 'doSyncImportDocumentModuleValue', message: 'Document Values from server' },
                { functionName: 'GetDocumentItemValue', message: 'Document Item Value from server' },
                { functionName: 'doSyncImportDocumentDocument', message: 'Document Relation from server' },
                { functionName: 'GetModules', message: 'Modules from server' },
                { functionName: 'GetModuleObjective', message: 'Module Objectives from server' },
                { functionName: 'GetTemplate', message: 'Templates from server' },
                { functionName: 'GetTemplateGeography', message: 'Template Geography from server' },
                { functionName: 'doSyncTemplateItem', message: 'Templates Items from server' },
                { functionName: 'GetTemplateModule', message: 'Template Modules from server' },
                { functionName: 'GetTemplateBodyConstant', message: 'Template Body Constant from server' },
                { functionName: 'GetTemplateImage', message: 'Template Images from server' },
                { functionName: 'doSyncImportUploadedImages', message: 'Uploaded Images from server' },
                { functionName: 'GetStep', message: 'Step from server' },
                { functionName: 'GetWorkflow', message: 'Workflow from server' },
                { functionName: 'GetWorkflowStep', message: 'Workflow Step from server' },
                { functionName: 'doSyncImportWorkflowHistory', message: 'Workflow History from server' },
                { functionName: 'GetImportedAgreement', message: 'Imported Agreement from server' },
            ]
            
            //Inits the Messages for the Import
            var importMessagesFunctions = [
                { functionName: 'AddConfiguration', message: 'Configuration to device' },
                { functionName: 'AddUserPermissions', message: 'User Permissions to device' },
                { functionName: 'AddGeography', message: 'Geographies to device' },
                { functionName: 'AddCustomer', message: 'Customers to device' },
                { functionName: 'AddCustomerIBAN', message: 'Customer IBAN to device' },
                { functionName: 'AddDocumentTypes', message: 'Document Types to device' },
                { functionName: 'AddDocumentTypeModules', message: 'Document Type Modules to device' },
                { functionName: 'UpdateSyncDocument', message: 'Documents to device' },
                { functionName: 'AddDocumentNumber', message: 'Document Number to device' },
                { functionName: 'UpdateSyncDocumentModuleValue', message: 'Document Values to device' },
                { functionName: 'AddDocumentItemValue', message: 'Document Item Value to device' },
                { functionName: 'UpdateSyncDocumentDocument', message: 'Document Relation to device' },
                { functionName: 'AddDocumentModules', message: 'Document Modules to device' },
                { functionName: 'AddModuleObjectives', message: 'Module Objectives to device' },
                { functionName: 'AddTemplates', message: 'Templates to device' },
                { functionName: 'AddTemplateGeography', message: 'Template Geography to device' },
                { functionName: 'UpdateSyncTemplateItem', message: 'Template Items to device' },
                { functionName: 'AddTemplateModules', message: 'Template Modules to device' },
                { functionName: 'AddTemplateBodyConstant', message: 'Template Body constant to device' },
                { functionName: 'AddTemplateImage', message: 'Template Image to device' },
                { functionName: 'UpdateSyncUploadedImages', message: 'Uploaded Images to device' },
                { functionName: 'AddSteps', message: 'Steps to device' },
                { functionName: 'AddWorkflow', message: 'Workflow to device' },
                { functionName: 'AddWorkflowStep', message: 'Workflow Step to device' },
                { functionName: 'UpdateSyncWorkflowHistory', message: 'Workflow History to device' },
                { functionName: 'AddImportedAgreement', message: 'Imported Agreement to device' },
            ]
            
            //Populates the objects with the messages;
            
            vm.exportMessageArray = {};
            exportMessageArray.forEach(function (element) {
                vm.exportMessageArray[element.functionName] = {}
                vm.exportMessageArray[element.functionName].message = element.message;
                vm.exportMessageArray[element.functionName].value = 'Pending';
            });
            
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
            $scope.progressBarValueSync = 0;
            $scope.countSyncActions = 0;
            $scope.syncTotalActions = exportMessageArray.length + getMessagesFunctions.length + importMessagesFunctions.length;
        }
        
    }
    
    //INITATES THE SYNC CONTROLLER
    InitSyncController();
    
    function CallImportService(localDocuments) {
        $q.all([SyncService.GetFrontendConfigurations("Import", vm.SyncMessages)])
        .then(function (responses) {
            var resp = responses[0];
            if (resp == null || (resp.code != null && resp.code == "ENOENT") || (resp.ExceptionMessage !== undefined && resp.ExceptionMessage !== '') || (resp.code != undefined && resp.code == "ETIMEDOUT")) {
                swal({
                title: "Connection Error.",
                text: "Please Check your connection.",
                type: "error",
                closeOnConfirm: true
                },
                     function (isConfirm) {
                    $scope.$apply(function () {
                        $location.path('/home');
                    });
                });
            }
            else {
                var username = $scope.globals.currentUser.username;
                var password = $scope.globals.currentUser.password;
                var market = $scope.globals.currentUser.market;
                
                data = [];
                if (resp.length > 0) {
                    //vm.arraySyncResp.pop();
                    
                    var count = 0;
                    callRecursiveImport(resp, count, username, password, market, localDocuments, vm.SyncMessages);
                    
                    //for (var i = resp.length - 1; i >= 0; i--) {
                    //var arr = SyncData(calresp[i], username, password, market);
                    //}
                }
                
                
            }
        });
    }
    
    function SyncData2(resp, username, password, market, modifiedDocs, ctrlSyncMessages) {
        var deferred = $q.defer();
        
        var arrTotal = [];
        var total = resp.length;
        
        for (var i = 0; i != resp.length; ++i) {
            var elem = resp[i];
            elem.Data = [];
            $q.all([updateData.GetLocalDataSync2(elem, "", modifiedDocs, ctrlSyncMessages)]).then(function (responsesImport) {
                arrTotal.push(responsesImport[0]);
                
                if (arrTotal.length == total) {
                    deferred.resolve(arrTotal);
                    
                }
                
            });
            
            
        }
        return deferred.promise;
    }
    
    function SyncData(resp, username, password, market, localDocuments, syncMessages) {
        var deferred = $q.defer()
        
        if (resp.SyncType === 'Import') {
            
            var table = resp.Table;
            console.log(table);
            var columns = resp.Columns;
            var description = resp.Description;
            var fullQualifiedName = resp.fullQualifiedName;
            var returnQualifiedName = resp.returnQualifiedName;
            var dllName = resp.dllName;
            var sourceDataMethod = resp.sourceDataMethod;
            var colstoupdate = resp.ColumnsToUpdate;
            var importType = resp.importType;
            var colsType = resp.dataType;
            
            $q.all([updateData.GetLocalDataSync(table, columns, localDocuments)]).then(function (responsesImport) {
                var arrData = responsesImport[0];
                var localTable = arrData[0];
                var localData = arrData[1];
                
                if (importType == "DROP&CREATE") {
                    
                    if (table == "Customer") {
                        $q.all([ImportService.GetCustomers(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddCustomer(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Customers' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Customers' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Customers' + " Import", result: 'No Network' };
                                syncMessages("get", "GetCustomers", "No Network");
                                syncMessages("import", "AddCustomer", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "Configuration") {
                        $q.all([ImportService.GetConfigurations(syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddConfiguration(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Configuration' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Configuration' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Configuration' + " Import", result: 'No Network' };
                                syncMessages("get", "GetConfigurations", "No Network");
                                syncMessages("import", "AddConfiguration", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "Module") {
                        $q.all([ImportService.GetModules(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddDocumentModules(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Module' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Module' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Module' + " Import", result: 'No Network' };
                                syncMessages("get", "GetModules", "No Network");
                                syncMessages("import", "AddDocumentModules", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                                
                            }
                        });
                    }
                    if (table == "CustomerIBAN") {
                        $q.all([ImportService.GetCustomerIBAN(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddCustomerIBAN(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Customer IBAN' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Customer IBAN' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            } else {
                                var res = { text: 'Customer IBAN' + " Import", result: 'No Network' };
                                syncMessages("get", "GetCustomerIBAN", "No Network");
                                syncMessages("import", "AddCustomerIBAN", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "DocumentType") {
                        $q.all([ImportService.GetDocumentTypes(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddDocumentTypes(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Document Type' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Document Type' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            } else {
                                var res = { text: 'Document Type' + " Import", result: 'No Network' };
                                syncMessages("get", "GetDocumentTypes", "No Network");
                                syncMessages("import", "AddDocumentTypes", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "DocumentTypeModule") {
                        $q.all([ImportService.GetDocumentTypeModules(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddDocumentTypeModules(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Document Type Modules' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Document Type Modules' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Document Type Modules' + " Import", result: 'No Network' };
                                syncMessages("get", "GetDocumentTypeModules", "No Network");
                                syncMessages("import", "AddDocumentTypeModules", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "Geography") {
                        $q.all([ImportService.GetGeography(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddGeography(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Geography' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Geography' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Geography' + " Import", result: 'No Network' };
                                syncMessages("get", "GetGeography", "No Network");
                                syncMessages("import", "AddGeography", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "ModuleObjective") {
                        $q.all([ImportService.GetModuleObjective(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddModuleObjectives(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Module Objective' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Module Objective' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            } else {
                                var res = { text: 'Module Objective' + " Import", result: 'No Network' };
                                syncMessages("get", "GetModuleObjective", "No Network");
                                syncMessages("import", "AddModuleObjectives", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "Step") {
                        $q.all([ImportService.GetStep(syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddSteps(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Steps' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Steps' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            } else {
                                var res = { text: 'Steps' + " Import", result: 'No Network' };
                                syncMessages("get", "GetStep", "No Network");
                                syncMessages("import", "AddSteps", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "Template") {
                        $q.all([ImportService.GetTemplate(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddTemplates(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Template' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Template' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            } else {
                                var res = { text: 'Template' + " Import", result: 'No Network' };
                                syncMessages("get", "GetTemplate", "No Network");
                                syncMessages("import", "AddTemplates", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                                
                            }
                        });
                    }
                    if (table == "TemplateBodyConstant") {
                        $q.all([ImportService.GetTemplateBodyConstant(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddTemplateBodyConstant(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Template Body Constant' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Template Body Constant' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            } else {
                                var res = { text: 'Template Body Constant' + " Import", result: 'No Network' };
                                syncMessages("get", "GetTemplateBodyConstant", "No Network");
                                syncMessages("import", "AddTemplateBodyConstant", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "TemplateGeography") {
                        $q.all([ImportService.GetTemplateGeography(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddTemplateGeography(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Template Geography' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Template Geography' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Template Geography' + " Import", result: 'No Network' };
                                syncMessages("get", "GetTemplateGeography", "No Network");
                                syncMessages("import", "AddTemplateGeography", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "TemplateModule") {
                        $q.all([ImportService.GetTemplateModule(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddTemplateModules(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Template Modules' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Template Modules' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Template Modules' + " Import", result: 'No Network' };
                                syncMessages("get", "GetTemplateModule", "No Network");
                                syncMessages("import", "AddTemplateModules", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "UserPermission") {
                        $q.all([ImportService.GetUserPermission(syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddUserPermissions(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'User Permission' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'User Permission' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'User Permission' + " Import", result: 'No Network' };
                                syncMessages("get", "GetUserPermission", "No Network");
                                syncMessages("import", "AddUserPermissions", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "Workflow") {
                        $q.all([ImportService.GetWorkflow(market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddWorkflow(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Workflow' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Workflow' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Workflow' + " Import", result: 'No Network' };
                                syncMessages("get", "GetWorkflow", "No Network");
                                syncMessages("import", "AddWorkflow", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "WorkflowStep") {
                        $q.all([ImportService.GetWorkflowStep(market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddWorkflowStep(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Workflow Step' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Workflow Step' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Workflow Step' + " Import", result: 'No Network' };
                                syncMessages("get", "GetWorkflowStep", "No Network");
                                syncMessages("import", "AddWorkflowStep", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "TemplateItem") {
                        $q.all([ImportService.GetTemplateItem(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddTemplateItems(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Template Item' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Template Item' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            } else {
                                var res = { text: 'Template Item' + " Import", result: 'No Network' };
                                syncMessages("get", "GetTemplateItem", "No Network");
                                syncMessages("import", "AddTemplateItems", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "UploadedImages") {
                        $q.all([ImportService.GetUploadedImages(market, username, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddUploadedImages(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Uploaded Images' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Uploaded Images' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Uploaded Images' + " Import", result: 'No Network' };
                                syncMessages("get", "GetUploadedImages", "No Network");
                                syncMessages("import", "AddUploadedImages", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "DocumentNumber") {
                        $q.all([ImportService.GetDocumentNumber(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddDocumentNumber(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Document Number' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Document Number' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Document Number' + " Import", result: 'No Network' };
                                syncMessages("get", "GetDocumentNumber", "No Network");
                                syncMessages("import", "AddDocumentNumber", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "TemplateImage") {
                        $q.all([ImportService.GetTemplateImage(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddTemplateImage(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Template Image' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Template Image' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Template Image' + " Import", result: 'No Network' };
                                syncMessages("get", "GetTemplateImage", "No Network");
                                syncMessages("import", "AddTemplateImage", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "WorkflowHistory") {
                        $q.all([ImportService.GetWorkflowHistory(market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddWorkflowHistory(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Workflow History' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Workflow History' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Workflow History' + " Import", result: 'No Network' };
                                syncMessages("get", "GetWorkflowHistory", "No Network");
                                syncMessages("import", "AddWorkflowHistory", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "DocumentItemValue") {
                        $q.all([ImportService.GetDocumentItemValue(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddDocumentItemValue(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Document Item Value' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Document Item Value' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Document Item Value' + " Import", result: 'No Network' };
                                syncMessages("get", "GetDocumentItemValue", "No Network");
                                syncMessages("import", "AddDocumentItemValue", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    if (table == "ImportedAgreement") {
                        $q.all([ImportService.GetImportedAgreement(username, market, syncMessages)]).then(function (response) {
                            var data = response[0];
                            if (data != null) {
                                $q.all([readData.AddImportedAgreement(data, syncMessages)]).then(function (responsesUpt) {
                                    if (responsesUpt == -1) {
                                        var res = { text: 'Imported Agreement' + " Import", result: 'Not Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(-1);
                                    }
                                    else {
                                        var res = { text: 'Imported Agreement' + " Import", result: 'Ok' };
                                        vm.arraySyncResp.push(res);
                                        deferred.resolve(1);
                                    }
                                });
                            }
                            else {
                                var res = { text: 'Imported Agreement' + " Import", result: 'No Network' };
                                syncMessages("get", "GetImportedAgreement", "No Network");
                                syncMessages("import", "AddImportedAgreement", "ERROR");
                                vm.arraySyncResp.push(res);
                                deferred.resolve(-1);
                            }
                        });
                    }
                    
                }
                else {
                    $q.all([SyncService.doSyncImport(localData, username, market, localTable, fullQualifiedName, returnQualifiedName, dllName, sourceDataMethod, colsType, syncMessages)]).then(function (responsesVer) {
                        var dataToUpdate = responsesVer[0];
                        
                        
                        $q.all([updateData.UpdateSync(dataToUpdate, username, market, localTable, columns, colsType, syncMessages)]).then(function (responsesUpt) {
                            if (responsesUpt == -1 || responsesUpt.length == 0) {
                                var localTableSynced = localTable;
                                var strResult = '' + arrDataSynced[2] + 'Error.';
                                var res = { text: localTableSynced.toUpperCase() + " Import", result: strResult };
                                vm.arraySyncResp.push(res);
                                deferred.resolve('OK');
                            }
                            else {
                                var arrDataSynced = responsesUpt[0];
                                var localTableSynced = arrDataSynced[0];
                                var dataUpdated = arrDataSynced[1];
                                //var strResult = '' + arrDataSynced[2] + ' Rows Added. ' + '' + arrDataSynced[3] + ' Rows Updated';
                                //var dataUpdated = responsesUpt[0];
                                var res = { text: localTableSynced.toUpperCase() + " Import", result: 'Ok' };
                                vm.arraySyncResp.push(res);
                                deferred.resolve('OK');
                            }
                            
                            
                        });
                        
                    });
                }
                
                
                
            });
            
        }
        
        
        return deferred.promise;
    }
    
    function callRecursive(resp, count, username, password, market, modifiedDocs, localDocuments, ctrlSyncMessages, isUserActive, isUserGeographyChanged) {
            $scope.progressBarValueSync = (count / 10) * 100;
            //if (count < resp.length) {
            $q.all([SyncData2(resp, username, password, market, modifiedDocs, ctrlSyncMessages)])
            .then(function (responses) {
                console.log("Get Normal Documents")
                $q.all([readData.getDraftDocuments()]).then(function (result){
                    console.log("Get Draft Documents")
                    $q.all([SyncService.doSyncExport2(username, market, responses, result, ctrlSyncMessages)]).then(function (responsesVer) {
                        
                        //Control var to set the export status
                        var isExportError = false;
                        
                        var result = responsesVer[0];
                        if (result == '-1') {
                            ctrlSyncMessages("export", "doSyncExport2", "ERROR");
                            var res = { text: "Export", result: 'Not Ok' };
                            vm.arraySyncResp.push(res);
                            isExportError = true;
                        }
                        else {
                            $q.all([readData.removeDeletedDocuments()]).then(function (result){
                                console.log("DELETE state" + result);
                            });
                            ctrlSyncMessages("export", "doSyncExport2", "OK");
                            var res = { text: "Export", result: 'Ok' };
                            vm.arraySyncResp.push(res);
                        }
                        
                        
                        if (isUserActive == "OK" && isUserGeographyChanged == false) {
                            
                            //DO IMPORT
                            CallImportService(localDocuments);
                            
                        }else if (isUserActive != "OK"){
                            
                            //USER IS INACTIVE
                            //Localy inactivates the user account to prevent clock rollback
                            readData.setUserExpired($scope.globals.currentUser.username, 1);
                            
                            swal({
                            title: "Sync",
                            text: "Your access to the application has been removed.\nPlease contact system administrator.",
                            type: "error",
                            closeOnConfirm: true
                            },
                                 function (isConfirm) {
                                $scope.$apply(function () {
                                    $sessionStorage.IsInCreationMode = false;
                                    appValues.userChangedGeography = false;
                                    AuthenticationService.ClearCredentials();
                                    $location.path('/login');
                                });
                            });
                            
                            
                        }else if (isUserGeographyChanged == true){
                            
                            //validates if there was an error during the export
                            if (isExportError == false) {
                                
                                //User geo has changed, redirect to login page to do initial sync
                                $location.path('/login');
                                
                            } else {
                                
                                //If the export was not successful show's warning and redirect's to page.
                                swal({
                                title: "Sync Error",
                                text: "There was an error during the export.\nIt is not possible to continue with the sync.\nPlease try again later.",
                                type: "error",
                                closeOnConfirm: true
                                },
                                     function (isConfirm) {
                                    $scope.$apply(function () {
                                        $location.path('/home');
                                    });
                                });
                            }
                        }
                    });
                });
            });
        }
    
    function callRecursiveImport(resp, count, username, password, market, localDocuments, syncMessages) {
        //$scope.progressBarValueSync = (count / 10) * 100;
        if (count < resp.length) {
            
            $q.all([SyncData(resp[count], username, password, market, localDocuments, syncMessages)])
            .then(function (responses) {
                if (count <= resp.length) {
                    count += 1;
                    
                    callRecursiveImport(resp, count, username, password, market, localDocuments, syncMessages);
                    
                }
                
            }, function (error){
                console.log(error);
            });
        }
        else {
            vm.syncFinished = true;
            $localStorage.lastSync = new Date();
            
            //Refreshes the document cache
            $sessionStorage.isDocumentsModifed.agreement = true;
            $sessionStorage.isDocumentsModifed.cancelation = true;
            $sessionStorage.isDocumentsModifed.iban = true;
            $sessionStorage.isDocumentsModifed.digitalAgreement = true;
            $sessionStorage.isDocumentsModifed.digitalForm = true;
        }
    }
    
    function InitSyncController() {
        
        //var res = { text: "Sync Started...", result: "Please Wait" };
        //           vm.arraySyncResp.push(res);
        
        db = localDatabase;
        
        //Inits the syncronization messages
        vm.SyncMessages('init');
        
        $q.all([SyncService.CheckIfActive($scope.globals.currentUser.market, vm.SyncMessages)]).then(function (responses) {
            
            var res = responses[0];
            
            if (res == null) {
                swal({
                title: "Sync",
                text: "Error getting Synchronization Status.",
                type: "error",
                closeOnConfirm: true
                },
                     function (isConfirm) {
                    
                    $scope.$apply(function () {
                        $location.path('/home');
                    });
                });
                
            }else{
                
                if (res.Value == "ON") {
                    
                    //--------------------------------------------------------------------------------------
                    $q.all([SyncService.CheckUserActive($scope.globals.currentUser.username, $scope.globals.currentUser.market, vm.SyncMessages), SyncService.isChangedGeography($scope.globals.currentUser.username, $scope.globals.currentUser.market, vm.SyncMessages), readData.getUserGeographies()]).then(function (responses) {
                        
                        var isUserActive = responses[0];
                        var serverGeo = responses[1];
                        var localGeo = responses[2];
                        var isUserGeographyChanged = (serverGeo.toLowerCase() === localGeo.toLowerCase()) ? false : true;
                        
                        
                        //alert("OK | " + serverGeo + " | " + localGeo + " | " + isUserGeographyChanged);
                        
                        
                        if (isUserActive == null) {
                            swal({
                            title: "Sync",
                            text: "Error getting User Status.",
                            type: "error",
                            closeOnConfirm: true
                            },
                                 function (isConfirm) {
                                
                                $scope.$apply(function () {
                                    $location.path('/home');
                                });
                            });
                        }else {
                            
                            
                            db.transaction(function populateDB(tx) {
                                var sql = 'UPDATE Customer Set Email = "" WHERE Id = "1"';
                                //tx.executeSql(sql);
                                //sql = '';
                                //tx.executeSql(sql);
                            }, function errorCB(tx, err) {
                            }, function successCB() {
                                
                                vm.isLoadingSync = true;
                                vm.syncProcess = 'Synchronization Started. Please Wait...';
                                
                                $q.all([SyncService.GetFrontendConfigurations("Export", vm.SyncMessages)])
                                .then(function (responses) {
                                    var resp = responses[0];
                                    if (resp == null || (resp.code != null && resp.code == "ENOENT") || (resp.ExceptionMessage !== undefined && resp.ExceptionMessage !== '') || (resp.code != undefined && resp.code == "ETIMEDOUT")) {
                                        swal({
                                        title: "Connection Error.",
                                        text: "Please Check your connection.",
                                        type: "error",
                                        closeOnConfirm: true
                                        },
                                             function (isConfirm) {
                                            $scope.$apply(function () {
                                                $location.path('/home');
                                            });
                                        });
                                    }
                                    else {
                                        var username = $scope.globals.currentUser.username;
                                        var password = $scope.globals.currentUser.password;
                                        var market = $scope.globals.currentUser.market;
                                        
                                        data = [];
                                        if (resp.length > 0) {
                                            //vm.arraySyncResp.pop();
                                            
                                            //Obtains all the documents in the ipad
                                            $q.all([updateData.GetLocalDocumentsIdAndStep(vm.SyncMessages)])
                                            .then(function (localDocs) {
                                                
                                                //obtains which documents are modifiend between the ipad and the backend
                                                $q.all([SyncService.GetModifiedDocuments(localDocs, vm.SyncMessages)])
                                                .then(function (modifiedDocs) {
                                                    
                                                    var count = 0;
                                                    
                                                    //validates if the user has changed geography
                                                    if (isUserGeographyChanged == false) {
                                                        
                                                        callRecursive(resp, count, username, password, market, modifiedDocs, localDocs, vm.SyncMessages, isUserActive, isUserGeographyChanged);
                                                        
                                                    } if (isUserGeographyChanged != false) {
                                                        
                                                        //THE GEOGRAPHY HAS CHANGED
                                                        //Localy inactivates the user account to prevent clock rollback
                                                        //var string = 'UPDATE User SET isGeographyChanged = 1 WHERE code = "' + $scope.globals.currentUser.username + '"';
                                                        //alert(string);
                                                        //db.transaction(function populateDB(tx5) {
                                                        //    tx5.executeSql(string);
                                                        //}, function errorCB(tx5, err) {
                                                        //    alert("ERROR")
                                                        //}, function successCB() {
                                                        //    alert("OK")
                                                        //});
                                                        
                                                        readData.setUserChangedGeo(username, 1);
                                                        
                                                        //sets the global var
                                                        appValues.userChangedGeography = true;
                                                        
                                                        swal({
                                                        title: "Geographies Changed!",
                                                        text: "Your territory has been changed.\nThe data (documents and customers) from old territory will be deleted.\nAlso ‘Draft’ documents will be removed.\n\nYES - Continue with sync and reload all data\nNO - Abort sync and finish draft's",
                                                        type: "warning",
                                                        showCancelButton: true,
                                                        confirmButtonColor: "#DD6B55",
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true
                                                        },
                                                             function (isConfirm) {
                                                            if (isConfirm) {
                                                                
                                                                callRecursive(resp, count, username, password, market, modifiedDocs, localDocs, vm.SyncMessages, isUserActive, isUserGeographyChanged);
                                                                $scope.$apply();
                                                                
                                                            } else {
                                                                $location.path('/home');
                                                                $scope.$apply();
                                                            }
                                                        });
                                                        
                                                    }
                                                });
                                                
                                            });
                                        }
                                    }
                                });
                            });
                            
                            
                        }
                    });
                    
                    //--------------------------------------------------------------------------------------
                } else if (res.Value == "OFF") {
                    swal({
                    title: "Sync",
                    text: "Synchronization is temporary disabled.",
                    type: "warning",
                    closeOnConfirm: true
                    },
                         function (isConfirm) {
                        
                        $scope.$apply(function () {
                            $location.path('/home');
                        });
                    });
                }
            }
        });
    }
    
    function navigateTo(to) {
        $location.path(to);
        
    }
});



