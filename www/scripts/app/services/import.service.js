
'use strict';

app.factory('ImportService', ['$http', '$cookieStore', '$rootScope', '$timeout', '$q', 'readData',
function ImportService($http, $cookieStore, $rootScope, $timeout, $q, readData) {
    var service = {};

    var server = '192.168.0.52';
    service.GetCustomers = GetCustomers;
    service.GetConfigurations = GetConfigurations;
    service.GetDocuments = GetDocuments;
    service.GetDocumentValues = GetDocumentValues;
    service.GetModules = GetModules;
    service.GetModuleObjective = GetModuleObjective;
    service.GetStep = GetStep;
    service.GetTemplate = GetTemplate;
    service.GetTemplateItem = GetTemplateItem;
    service.GetTemplateModule = GetTemplateModule;
    service.GetUserPermission = GetUserPermission;
    service.GetCustomerIBAN = GetCustomerIBAN;
    service.GetDocumentTypes = GetDocumentTypes;
    service.GetDocumentTypeModules = GetDocumentTypeModules;
    service.GetTemplateGeography = GetTemplateGeography;
    service.GetTemplateBodyConstant = GetTemplateBodyConstant;
    service.GetGeography = GetGeography;
    service.GetWorkflow = GetWorkflow;
    service.GetWorkflowStep = GetWorkflowStep;
    service.GetDocumentDocument = GetDocumentDocument;
    service.GetUploadedImages = GetUploadedImages;
    service.GetWorkflowHistory = GetWorkflowHistory;
    service.GetBudgetAccount = GetBudgetAccount;
    service.GetDocumentItemValue = GetDocumentItemValue;
    service.GetDocumentNumber = GetDocumentNumber;
    service.GetTemplateImage = GetTemplateImage;
    service.GetImportedAgreement = GetImportedAgreement;
    service.GetUserGeography = GetUserGeography;
  

    //Function that evaluates the result of each import
    var evaluateResult = function (responseData) {

        var result;

        if (responseData == null) {
            result = "ERROR";
        }else{
            if (responseData.Message !== undefined && responseData.Message !== '')
                result = "ERROR";
            else
                result = "OK";
        }
        
        return result;
    }

    //var increaseSyncBar = function (scope, value) {
    //    scope.countSyncActions += value;
    //    scope.progressBarValue = (scope.countSyncActions / totalActions) * 100;
    //}

    return service;

    function GetCustomers(username, market, ctrlSyncMessages, callback) {        
        var deferred = $q.defer()
        var url = serviceUrl + "/api/import/GetCustomers?username=" + username + "&market=" + market + "";

        $http.get(
             url
        ).success(function (response) {            
            ctrlSyncMessages("get", "GetCustomers", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetCustomers", "ERROR");
            
            deferred.resolve(data);
        });        
        return deferred.promise

    }

    function GetConfigurations(ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetConfigurations"
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetConfigurations", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetConfigurations", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetDocumentTypes(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetDocumentTypes?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetDocumentTypes", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetDocumentTypes", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetDocumentTypeModules(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetDocumentTypeModules?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetDocumentTypeModules", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetDocumentTypeModules", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetDocuments(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetDocuments?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetDocuments", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetDocuments", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetDocumentValues(username, market, docsList, ctrlSyncMessages, callback) {

        var deferred = $q.defer();
            
        var importedRows = {value : 0};

        var paginatedGetDocumentValues = function () {

            var url = serviceUrl + "/api/import/GetDocumentModuleValues_v2"
            
            $http.post(url, { "username": username, "market": market, "startRow": importedRows.value, "docsList": docsList }).
                success(function (response) {

                $q.all([readData.AddDocumentValues(response.rowlist, importedRows)])
                .then(function (returnResponse) {

                    var result = returnResponse[0];
                     
                    if (result == 1) {

                        if (response.rowlist.length > 0) {

                            //Sets the percentage imported
                            var percentageImported = Math.round((importedRows.value / response.totalRows) * 100) + "%";
                            ctrlSyncMessages("get", "GetDocumentValues", percentageImported);

                            //Call the function again
                            paginatedGetDocumentValues();
                        } else {

                            if (response.totalRows == 0) {                                       //No rows to import is not normal! Warning
                                
                                ctrlSyncMessages("get", "GetDocumentValues", "OK");
                                ctrlSyncMessages("import", "AddDocumentValues", "WNG");
                                deferred.resolve(0);
                            } else if (importedRows.value == response.totalRows) {                    //If all the rows are imported then is OK
                                
                                ctrlSyncMessages("get", "GetDocumentValues", "OK");
                                ctrlSyncMessages("import", "AddDocumentValues", "OK");                                
                                deferred.resolve(1);
                            } else {                                                            //Any other condition is an ERROR INSERTING
                                
                                ctrlSyncMessages("get", "GetDocumentValues", "OK");
                                ctrlSyncMessages("import", "AddDocumentValues", "ERROR");
                                deferred.resolve(-1);
                            }
                        }
                    } else {
                        //if result is (-1) there was an error inserting the data
                        
                        ctrlSyncMessages("get", "GetDocumentValues", "OK");
                        ctrlSyncMessages("import", "AddDocumentValues", "ERROR");
                        deferred.resolve(data);
                    }

                }).catch(function (data) {
                    
                    ctrlSyncMessages("get", "GetDocumentValues", "OK");
                    ctrlSyncMessages("import", "AddDocumentValues", "ERROR");
                    deferred.resolve(data);
                })['finally'](function () {});

            }).error(function (data, status, headers, config) {
                
                ctrlSyncMessages("get", "GetDocumentValues", "ERROR");
                ctrlSyncMessages("import", "AddDocumentValues", "ERROR");
                deferred.resolve(data);
            });

        }
        
        
        //Makes the first recursive call
        paginatedGetDocumentValues();

        return deferred.promise;
    }


    function GetModules(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetModules?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetModules", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetModules", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetModuleObjective(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetModuleObjective?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetModuleObjective", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            
            ctrlSyncMessages.progressBarValue = (ctrlSyncMessages.countSyncActions / totalActions) * 100;
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetStep(ctrlSyncMessages, callback) {
        
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetStep"
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetStep", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetStep", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetTemplate(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetTemplate?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetTemplate", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetTemplate", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetTemplateGeography(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetTemplateGeography?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetTemplateGeography", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (data, status, headers, config) {
            ctrlSyncMessages("get", "GetTemplateGeography", "ERROR");
            
            deferred.resolve(data);
        });
        return deferred.promise

    }

    function GetTemplateItem(username, market, ctrlSyncMessages, callback) {

        var deferred = $q.defer();

        var importedRows = { value: 0 };

        var paginatedGetTemplateItem = function () {

            var url = serviceUrl + "/api/import/GetTemplateItem_v2?username=" + username + "&market=" + market + "&startRow=" + importedRows.value + "";

            $http.get(url).
                success(function (response) {

                    $q.all([readData.AddTemplateItems(response.rowlist, importedRows)])
                    .then(function (returnResponse) {

                        var result = returnResponse[0];

                        if (result == 1) {

                            if (response.rowlist.length > 0) {

                                //Sets the percentage imported
                                var percentageImported = Math.round((importedRows.value / response.totalRows) * 100) + "%";
                                ctrlSyncMessages("get", "GetTemplateItem", percentageImported);

                                //Call the function again
                                paginatedGetTemplateItem();
                            } else {

                                if (response.totalRows == 0) {                                       //No rows to import is not normal! Warning
                                    
                                    ctrlSyncMessages("get", "GetTemplateItem", "OK");
                                    ctrlSyncMessages("import", "AddTemplateItems", "WNG");
                                    deferred.resolve(0);
                                } else if (importedRows.value == response.totalRows) {                    //If all the rows are imported then is OK
                                    
                                    ctrlSyncMessages("get", "GetTemplateItem", "OK");
                                    ctrlSyncMessages("import", "AddTemplateItems", "OK");
                                    deferred.resolve(1);
                                } else {                                                            //Any other condition is an ERROR INSERTING
                                    
                                    ctrlSyncMessages("get", "GetTemplateItem", "OK");
                                    ctrlSyncMessages("import", "AddTemplateItems", "ERROR");
                                    deferred.resolve(-1);
                                }
                            }
                        } else {
                            //if result is (-1) there was an error inserting the data
                            
                            ctrlSyncMessages("get", "GetTemplateItem", "OK");
                            ctrlSyncMessages("import", "AddTemplateItems", "ERROR");
                            deferred.resolve(data);
                        }

                    }).catch(function (data) {
                        
                        ctrlSyncMessages("get", "GetTemplateItem", "OK");
                        ctrlSyncMessages("import", "AddTemplateItems", "ERROR");
                        deferred.resolve(data);
                    })['finally'](function () { });

                }).error(function (data, status, headers, config) {
                    ctrlSyncMessages("get", "GetTemplateItem", "ERROR");
                    ctrlSyncMessages("import", "AddTemplateItems", "ERROR");
                    
                    deferred.resolve(data);
                });

        }


        //Makes the first recursive call
        paginatedGetTemplateItem();

        return deferred.promise;
    }


    function GetTemplateItem_old(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetTemplateItem?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetTemplateItem", evaluateResult(response));
            ctrlSyncMessages.countSyncActions += 1;
            ctrlSyncMessages.progressBarValue = (ctrlSyncMessages.countSyncActions / totalActions) * 100;
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetTemplateItem", "ERROR");
            ctrlSyncMessages.countSyncActions += 1;
            ctrlSyncMessages.progressBarValue = (ctrlSyncMessages.countSyncActions / totalActions) * 100;
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetTemplateModule(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()
        
        var url = serviceUrl + "/api/import/GetTemplateModule?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetTemplateModule", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetTemplateModule", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetUserPermission(ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetUserPermission";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetUserPermission", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetUserPermission", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetCustomerIBAN(username, market, ctrlSyncMessages, callback) {
        
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetCustomerIBAN?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetCustomerIBAN", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetCustomerIBAN", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetTemplateBodyConstant(username, market, ctrlSyncMessages, callback) {
        
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetTemplateBodyConstant?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetTemplateBodyConstant", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetTemplateBodyConstant", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetGeography(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetGeography2?userId=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetGeography", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetGeography", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetUserGeography(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetUserAssignedGeograpies?userCode=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetUserGeography", evaluateResult(response));

            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetUserGeography", "ERROR");

            deferred.resolve(datati);
        });
        return deferred.promise
    }

    function GetWorkflow(market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetWorkflow?market=" + market + "";

        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetWorkflow", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetWorkflow", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetWorkflowStep(market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetWorkflowStep?market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetWorkflowStep", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetWorkflowStep", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetDocumentDocument(market, username, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetDocumentDocument?market=" + market + "&username=" + username;
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetDocumentDocument", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetDocumentDocument", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }


    function GetUploadedImages(market, username, ctrlSyncMessages, callback) {

        var deferred = $q.defer();

        var importedRows = { value: 0 };

        var paginatedGetUploadedImages = function () {

            var url = serviceUrl + "/api/import/GetUploadedImages_v2?username=" + username + "&market=" + market + "&startRow=" + importedRows.value + "";

            $http.get(url).
                success(function (response) {

                    $q.all([readData.AddUploadedImages(response.rowlist, importedRows)])
                    .then(function (returnResponse) {

                        var result = returnResponse[0];

                        if (result == 1) {

                            if (response.rowlist.length > 0) {

                                //Sets the percentage imported
                                var percentageImported = Math.round((importedRows.value / response.totalRows) * 100) + "%";
                                ctrlSyncMessages("get", "GetUploadedImages", percentageImported);

                                //Call the function again
                                paginatedGetUploadedImages();
                            } else {

                                if (response.totalRows == 0) {                                       //No rows to import is not normal! Warning
                                    ctrlSyncMessages("get", "GetUploadedImages", "OK");
                                    ctrlSyncMessages("import", "AddUploadedImages", "WNG");
                                    
                                    deferred.resolve(0);
                                } else if (importedRows.value == response.totalRows) {                    //If all the rows are imported then is OK
                                    ctrlSyncMessages("get", "GetUploadedImages", "OK");
                                    ctrlSyncMessages("import", "AddUploadedImages", "OK");
                                    
                                    deferred.resolve(1);
                                } else {                                                            //Any other condition is an ERROR INSERTING
                                    ctrlSyncMessages("get", "GetUploadedImages", "OK");
                                    ctrlSyncMessages("import", "AddUploadedImages", "ERROR");
                                    
                                    deferred.resolve(-1);
                                }
                            }
                        } else {
                            //if result is (-1) there was an error inserting the data
                            ctrlSyncMessages("get", "GetUploadedImages", "OK");
                            ctrlSyncMessages("import", "AddUploadedImages", "ERROR");
                            
                            deferred.resolve(data);
                        }

                    }).catch(function (data) {
                        ctrlSyncMessages("get", "GetUploadedImages", "OK");
                        ctrlSyncMessages("import", "AddUploadedImages", "ERROR");
                        
                        deferred.resolve(data);
                    })['finally'](function () { });

                }).error(function (data, status, headers, config) {
                    ctrlSyncMessages("get", "GetUploadedImages", "ERROR");
                    ctrlSyncMessages("import", "AddUploadedImages", "ERROR");
                    
                    deferred.resolve(data);
                });

        }


        //Makes the first recursive call
        paginatedGetUploadedImages();

        return deferred.promise;
    }



    function GetUploadedImages_old(market, username, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetUploadedImages?market=" + market + "&username=" + username;
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetUploadedImages", evaluateResult(response));
            ctrlSyncMessages.countSyncActions += 1;
            ctrlSyncMessages.progressBarValue = (ctrlSyncMessages.countSyncActions / totalActions) * 100;
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetUploadedImages", "ERROR");
            ctrlSyncMessages.countSyncActions += 1;
            ctrlSyncMessages.progressBarValue = (ctrlSyncMessages.countSyncActions / totalActions) * 100;
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetWorkflowHistory(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()
                
        var url = serviceUrl + "/api/import/GetWorkflowHistory_v2?username=" + username + "&market=" + market + "";

        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetWorkflowHistory", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetWorkflowHistory", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetBudgetAccount(market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetBudgetAccount?market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetBudgetAccount", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetBudgetAccount", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetDocumentItemValue(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetDocumentItemValue?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetDocumentItemValue", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetDocumentItemValue", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetDocumentNumber(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetDocumentNumber?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetDocumentNumber", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetDocumentNumber", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetTemplateImage(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetTemplateImage?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetTemplateImage", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetTemplateImage", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }

    function GetImportedAgreement(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()

        var url = serviceUrl + "/api/import/GetImportedAgreement?username=" + username + "&market=" + market + "";
        $http.get(
             url
        ).success(function (response) {
            ctrlSyncMessages("get", "GetImportedAgreement", evaluateResult(response));
            
            deferred.resolve(response);
        }).error(function (datati, status, headers, config) {
            ctrlSyncMessages("get", "GetImportedAgreement", "ERROR");
            
            deferred.resolve(datati);
        });
        return deferred.promise

    }
}]);


