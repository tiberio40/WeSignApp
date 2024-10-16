

app
.factory('SyncService', SyncService);

function SyncService($http, $cookieStore, $rootScope, $timeout, $q) {
    var service = {};
    var server = '192.168.0.52';
    service.GetFrontendConfigurations = GetFrontendConfigurations;
    service.CheckUserActive = CheckUserActive;
    service.isChangedGeography = isChangedGeography;
    service.doSyncImport = doSyncImport;
    service.doSyncExport = doSyncExport;
    
    service.doSyncExport2 = doSyncExport2;
    service.CheckIfActive = CheckIfActive;
    service.GetModifiedDocuments = GetModifiedDocuments;
    
    var db = localDatabase;
    return service;
    
    
    //Funtion that evaluates the results of the tables that have no specfic query
    function evaluateResult(ctrlSyncMessages, table, result) {
        
        switch (table) {
            case "Document":
                ctrlSyncMessages("get", "doSyncImportDocument", result);
                break;
            case "DocumentModuleValue":
                ctrlSyncMessages("get", "doSyncImportDocumentModuleValue", result);
                break;
            case "WorkflowHistory":
                ctrlSyncMessages("get", "doSyncImportWorkflowHistory", result);
                break;
            case "DocumentDocument":
                ctrlSyncMessages("get", "doSyncImportDocumentDocument", result);
                break;
            case "UploadedImages":
                ctrlSyncMessages("get", "doSyncImportUploadedImages", result);
                break;
            case "TemplateItem":
                ctrlSyncMessages("get", "doSyncTemplateItem", result);
                break;
        }
    }
    
    
    function CheckIfActive(market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()
        var url = serviceUrl + "/api/import/CheckIfActive?market=" + market + "";
        $http.get(
                  url
                  ).success(function (response) {
                      ctrlSyncMessages("export", "CheckIfActive", "OK");
                      deferred.resolve(response);
                  }).error(function (data, status, headers, config) {
                      ctrlSyncMessages("export", "CheckIfActive", "ERROR");
                      deferred.resolve(data);
                  });
        
        return deferred.promise;
    }
    
    function CheckUserActive(code, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()
        var url = serviceUrl + "/api/account/CheckUserActive?username=" + code + "&market=" + market;
        $http.get(
                  url
                  ).success(function (response) {
                      ctrlSyncMessages("export", "CheckUserActive", "OK");
                      deferred.resolve(response);
                  }).error(function (data, status, headers, config) {
                      ctrlSyncMessages("export", "CheckUserActive", "ERROR");
                      deferred.resolve(data);
                  });
        
        return deferred.promise;
    }
    
    function GetFrontendConfigurations(type, ctrlSyncMessages, callback) {
        var deferred = $q.defer()
        var url = serviceUrl + "/api/import/GetFrontendConfigurations2?type=" + type + "";
        $http.get(
                  url
                  ).success(function (response) {
                      //callback(response);
                      if (type == 'Export') { ctrlSyncMessages("export", "GetFrontendConfigurations", "OK");}
                      deferred.resolve(response);
                  }).error(function (data, status, headers, config) {
                      if (type == 'Export') { ctrlSyncMessages("export", "GetFrontendConfigurations", "ERROR"); }
                      deferred.resolve(data);
                  });
        
        return deferred.promise
    }
    
    function doSyncImport(localDataInput, username, market, table, fullQualifiedName, returnQualifiedName, dllName, sourceDataMethod, dataType, ctrlSyncMessages) {
        var deferred = $q.defer()
        var url = serviceUrl + "/api/import/doSyncImport";
        console.log(table);
        var arr = [];
        for (var i = 0; i !== localDataInput.length; ++i)
            arr.push(localDataInput[i]);
        
        var objectToSerialize = { 'localData': arr, 'username': username, 'market': market, 'table': table, 'fullQualifiedName': fullQualifiedName, 'returnQualifiedName': returnQualifiedName, 'dllName': dllName, 'sourceDataMethod': sourceDataMethod, 'dataType': dataType };
        
        evaluateResult(ctrlSyncMessages, table, "Waiting");
        
        $http({
        method: 'POST',
        url: url,
        data: objectToSerialize,
        headers: { 'Content-Type': 'application/json' }
        }).success(function (response) {
            evaluateResult(ctrlSyncMessages, table, "OK");
            deferred.resolve(response);
        }).error(function (data, status, headers, config){
            evaluateResult(ctrlSyncMessages, table, "ERROR");
            deferred.resolve(data);
        });
        
        return deferred.promise;
    }
    
    function jsonCallback(json) {
        document.getElementById("content").innerHTML = json.html;
    }
    
    function doSyncExport2(username, market, data, draft, ctrlSyncMessages) {
        console.log(draft)
        var deferred = $q.defer()
        var url = serviceUrl + "/api/import/doSyncExport2";
        if (data != undefined) {
            var arr = [];
            var obj = { 'username': username, 'market': market };
            arr.push(obj);
            arr.push(draft[0]);
            
            for (var i = 0; i !== data[0].length; ++i) {
                var objectToSerialize = { 'localData': data[0][i].Data, 'table': data[0][i].Table };
                arr.push(objectToSerialize);
            }
            
            $.support.cors = true;
            
            ctrlSyncMessages("export", "doSyncExport2", "Waiting");
            
            $http.post(url, arr).success(function (response) {
                
                db.transaction(function populateDB(tx) {
                    
                }, function errorCB(tx, err) {
                    deferred.resolve(-1);
                }, function successCB() {
                    deferred.resolve(response);
                    
                });
                
            }).error(function (data, status, headers, config) {
                deferred.resolve(-1);
            });
        }
        
        return deferred.promise;
    }
    
    function GetModifiedDocuments(localDocs, ctrlSyncMessages) {
        var deferred = $q.defer()
        var url = serviceUrl + "/api/import/GetModifiedDocuments";
        var deferred = $q.defer()
        
        if (localDocs != undefined) {
            var dataToSend = {};
            dataToSend.Documents = [];
            dataToSend.ImportedAgreements = [];
            
            for (var i = 0; i !== localDocs[0].Documents.length; ++i) {
                var objectToSerialize = { 'Id': localDocs[0].Documents[i].Id, 'IdStep': localDocs[0].Documents[i].IdStep };
                dataToSend.Documents.push(objectToSerialize);
            }
            
            for (var i = 0; i !== localDocs[0].ImportedAgreements.length; ++i) {
                var objectToSerialize = { 'Id': localDocs[0].ImportedAgreements[i].Id, 'Signed': localDocs[0].ImportedAgreements[i].Signed };
                dataToSend.ImportedAgreements.push(objectToSerialize);
            }
            
            $.support.cors = true;
            
            ctrlSyncMessages("export", "GetModifiedDocuments", "Waiting");
            
            $http.post(url, dataToSend).success(function (response) {
                
                db.transaction(function populateDB(tx) {
                    
                }, function errorCB(tx, err) {
                    var modifiedDocs = {};
                    modifiedDocs.Documents = [];
                    modifiedDocs.ImportedAgreements = [];
                    ctrlSyncMessages("export", "GetModifiedDocuments", "ERROR");
                    deferred.resolve(modifiedDocs);
                }, function successCB() {
                    var modifiedDocs = {};
                    modifiedDocs.Documents = response[0];
                    modifiedDocs.ImportedAgreements = response[1];
                    ctrlSyncMessages("export", "GetModifiedDocuments", "OK");
                    deferred.resolve(modifiedDocs);
                    
                });
                
            }).error(function (data, status, headers, config) {
                var modifiedDocs = {};
                modifiedDocs.Documents = [];
                modifiedDocs.ImportedAgreements = [];
                ctrlSyncMessages("export", "GetModifiedDocuments", "ERROR");
                deferred.resolve(modifiedDocs)
            });
        }
        
        return deferred.promise
        
        
        
        
        
        
        
        
        //var deferred = $q.defer()
        //var url = serviceUrl + "/api/import/GetModifiedDocuments";
        //if (localDocs != undefined) {
        //    var arr = [];
        //    var obj = { 'username': username, 'market': market };
        //    arr.push(obj);
        
        //    for (var i = 0; i !== localDocs[0].length; ++i) {
        //        var objectToSerialize = { 'Id': localDocs[0][i].Id, 'IdStep': localDocs[0][i].IdStep };
        //        arr.push(objectToSerialize);
        //    }
        
        //    $.support.cors = true;
        
        //    $http.post(url, arr).success(function (response) {
        
        //        db.transaction(function populateDB(tx) {
        
        //        }, function errorCB(tx, err) {
        //            var b = "asd";
        //            deferred.resolve(response);
        //        }, function successCB() {
        //            var b = "asd";
        //            deferred.resolve(response);
        
        //        });
        
        //    }).error(function (data, status, headers, config) {
        //        var b = "asd";
        //        deferred.resolve(-1);
        //    });
        //}
        
        //return deferred.promise;
    }
    
    
    function doSyncExport(localDataInput, columns, colstoupdate, username, market, table, fullQualifiedName, returnQualifiedName, dllName, sourceDataMethod, dataType) {
        var deferred = $q.defer()
        var url = serviceUrl + "/api/import/doSyncExport";
        if (localDataInput != undefined) {
            var arr = [];
            
            for (var i = 0; i !== localDataInput.length; ++i) {
                arr.push(localDataInput[i]);
            }
            
            var objectToSerialize = { 'localData': arr, 'columns': columns, 'columnsToUpdate': colstoupdate, 'username': username, 'market': market, 'table': table, 'fullQualifiedName': fullQualifiedName, 'returnQualifiedName': returnQualifiedName, 'dllName': dllName, 'sourceDataMethod': sourceDataMethod, 'dataType': dataType };
            
            $.support.cors = true;
            
            $http.post(url, objectToSerialize).success(function (response) {
                
                db.transaction(function populateDB(tx) {
                    
                }, function errorCB(tx, err) {
                    deferred.resolve(response);
                }, function successCB() {
                    deferred.resolve(response);
                    
                });
                
            }).error(function (data, status, headers, config) {
                deferred.resolve(-1);
            });
        }
        
        return deferred.promise;
    }
    
    
    function isChangedGeography(username, market, ctrlSyncMessages, callback) {
        var deferred = $q.defer()
        
        var url = serviceUrl + "/api/import/GetUserAssignedGeograpies?userCode=" + username + "&market=" + market + "";
        $http.get(
                  url
                  ).success(function (response) {
                      
                      var serverGeo = Enumerable.From(response).OrderBy(function (x) { return x.code }).Select(function (x) { return x.code }).ToArray();
                      serverGeo = serverGeo.join(",")
                      
                      ctrlSyncMessages("export", "isChangedGeography", "OK");
                      
                      deferred.resolve(serverGeo);
                      
                  }).error(function (datati, status, headers, config) {
                      ctrlSyncMessages("export", "isChangedGeography", "ERROR");
                      deferred.resolve(datati);
                      
                  });
        return deferred.promise
    }
    
    function jsonCallback2(json) {
        alert(json);
    }
    
    
}


