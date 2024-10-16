
app.factory('updateData', function ($q) {
    var localData = [];
    var data = [];
    var db = localDatabase;

    //var db = window.openDatabase('CMTLocal', '1.0', 'CMT Local', 100000);
    //var db = window.sqlitePlugin.openDatabase({ name: "CMTLocal.db", location: 1 });

    //Funtion that evaluates the results of the tables that have no specfic query
    function evaluateResult(ctrlSyncMessages, type, table, result){
    
        //Assign the result to the correct object

        if (type == "export") {
            switch (table) {
                case "Customer":
                    ctrlSyncMessages("export", "GetLocalDataSync2Customer", result);
                    break;
                case "CustomerIBAN":
                    ctrlSyncMessages("export", "GetLocalDataSync2CustomerIBAN", result);
                    break;
            }
        } else {
            switch (table) {
                case "Document":
                    ctrlSyncMessages("import", "UpdateSyncDocument", result);
                    break;
                case "DocumentModuleValue":
                    ctrlSyncMessages("import", "UpdateSyncDocumentModuleValue", result);
                    break;
                case "WorkflowHistory":
                    ctrlSyncMessages("import", "UpdateSyncWorkflowHistory", result);
                    break;
                case "DocumentDocument":
                    ctrlSyncMessages("import", "UpdateSyncDocumentDocument", result);
                    break;
                case "UploadedImages":
                    ctrlSyncMessages("import", "UpdateSyncUploadedImages", result);
                    break;
                case "TemplateItem":
                    ctrlSyncMessages("import", "UpdateSyncTemplateItem", result);
                    break;
            }
        }
    
    }

    // here starts your public API, that is the method you can invoke
    return {

        ExecuteLocalSqlQuery: function (query) {

            var deferred = $q.defer()

            db.transaction(function populateDB(tx) {
                tx.executeSql(query);
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {
                deferred.resolve(1);

            });

            return deferred.promise

        },
        ExecuteCustomQuery: function (query) {

            var deferred = $q.defer()

            db.transaction(function populateDB(tx) {
                tx.executeSql(query, [], function successCB(tx, result) {
                    deferred.resolve(result);
                }, function errorCB(tx, err) {
                    deferred.resolve(-1);
                })
            });

            return deferred.promise;

        },
        ImportData: function (table, columns) {
            var deferred = $q.defer()

            db.transaction(function populateDB(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS User (id unique, code, firstName, lastName, password, market, IsReset, LastPasswordChange, expired, isGeographyChanged, securityToken, IdUserGroup)');
            }, function errorCB(tx, err) {
                //vm.Message += vm.Message + "\r\n" + "Error processing SQL: " + err;
            }, function successCB() {
                //vm.Message += vm.Message + "\r\n" + "Table users Created ";
                db.transaction(function populateDB(tx2) {
                    var sql = 'INSERT INTO USERS (id, code, firstName, lastName, password, market, IsReset) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    tx2.executeSql(sql, [user.Id, user.Code, user.FirstName, user.LastName, user.password, user.IdMarket, user.IsReset, user.LastPasswordChange, 0, 0, user.securityToken, user.IdUserGroup]);
                }, function errorCB(tx, err) {
                    deferred.resolve(tx);
                }, function successCB() {
                    data = { 'username': user.Code, 'password': user.password, 'market': user.market };
                    deferred.resolve(data);
                });
            });

            return deferred.promise
        },
        GetLocalData: function (table, columns, where) {
            if (where == undefined) where = '';

            var deferred = $q.defer()

            db.transaction(function (tx2) {
                //tx2.executeSql('SELECT ' + columns + ' FROM ' + table);
                //alert(columns);

                //if (table == 'UploadedImages') {
                //    var sql = 'INSERT INTO UploadedImages (Id, IdTemplate, IdMarket, Code, FileData, FileName, IsDefault) VALUES (?, ?, ?, ?, ?, ?, ?)';
                //    tx2.executeSql(sql, ['A9ADB596-6307-4FB1-8955-00018A799CBF', 3, 3, 'code', 'FileData', 'FileName', 0]);
                //}

                //if (table == 'CustomerIBAN') {
                //    var sql = 'INSERT INTO CustomerIBAN (Id, IdCustomer, IdDocument, IBAN, IBANImageValidation, Active) VALUES (?, ?, ?, ?, ?, ?)';
                //    tx2.executeSql(sql, ['A9ADB596-6307-4FB1-8955-00018A799CBF', 'A9ADB596-6307-4FB1-8955-00018A799CBF', 1, 'iban', 'image', 1]);
                //}

                //if (table == 'DocumentDocument') {
                //    var sql = 'INSERT INTO DocumentDocument (IdDocument1, IdDocument2) VALUES (?, ?)';
                //    tx2.executeSql(sql, ['A9ADB596-6307-4FB1-8955-00018A799CBF', 'A9ADB596-6307-4FB1-8955-00018A799EDF']);
                //}

                tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where, [], function (tx, results) {
                    var arr = [];
                    arr.push(table);
                    var arrData = [];
                    if (results.rows != undefined && results.rows != null) {
                        for (var i = 0; i <= results.rows.length - 1; ++i) {
                            arrData.push(results.rows.item(i));
                        }
                    }
                    else
                        arrData.push([]);

                    for (var j = 0; j != arrData.length; ++j) {
                        if (arrData[j].SyncUniqueIdentifier == "null")
                            arrData[j].SyncUniqueIdentifier = null;
                    }


                    arr.push(arrData);
                    deferred.resolve(arr);

                }, function (tx, results) {
                    var arr = [];
                    arr.push(table);
                    arr.push("");
                    deferred.resolve(arr);

                });
            });

            return deferred.promise;
        },
        GetLocalDataSync: function (table, columns, localDocuments, where) {
            if (where == undefined) where = '';

            var deferred = $q.defer()

            db.transaction(function (tx2) {

                if (table == "Document") {
                    tx2.executeSql('SELECT Id FROM Step WHERE Code IN ("WaitingForSync","Annuled", "Revoked", "Ended", "PendingIBAN")', [], function (tx, resultsStep) {
                        where = ' WHERE IdStep IN (';
                        //var idStep = resultsStep.rows[0].Id;
                        if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0) {
                            for (var j = 0; j != resultsStep.rows.length; ++j)
                                where += resultsStep.rows.item(j).Id + ",";

                            where = where.substring(0, where.length - 1);
                            where += ")";

                            tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where, [], function (tx, results) {
                                var arr = [];
                                arr.push(table);
                                var arrData = [];
                                if (results.rows != undefined && results.rows != null) {
                                    for (var i = 0; i <= results.rows.length - 1; ++i) {
                                        arrData.push(results.rows.item(i));
                                    }
                                }
                                else
                                    arrData.push([]);

                                for (var j = 0; j != arrData.length; ++j) {
                                    if (arrData[j].SyncUniqueIdentifier == "null")
                                        arrData[j].SyncUniqueIdentifier = null;
                                }


                                arr.push(arrData);
                                deferred.resolve(arr);

                            }, function (tx, results) {
                                var arr = [];
                                arr.push(table);
                                arr.push("");
                                deferred.resolve(arr);

                            });
                        }
                        else {
                            var arr = [];
                            arr.push(table);
                            arr.push("");
                            deferred.resolve(arr);
                        }

                    }, function (tx, results) {


                    });



                } else if (table == "DocumentModuleValue") {

                    tx2.executeSql('SELECT Id FROM Step', [], function (tx, resultsStep) {
                        where = ' WHERE IdStep IN (';
                        //var idStep = resultsStep.rows[0].Id;
                        if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0) {
                            for (var j = 0; j != resultsStep.rows.length; ++j)
                                where += resultsStep.rows.item(j).Id + ",";

                            where = where.substring(0, where.length - 1);
                            where += ")";


                            //vai criar uma lista com todos os documentos já fechados no iPad
                            var where2 = " AND Document.Id NOT IN ('"
                            for (var k = 0; k != localDocuments[0].DocumentsClosedOnIpad.length; ++k)
                                where2 += localDocuments[0].DocumentsClosedOnIpad[k].Id + "','";

                            where2 = where2.substring(0, where2.length - 2);
                            where2 += ")";
                            
                            var query = 'SELECT Id, CASE WHEN IdStep = 6 AND (length(DocumentModuleValue.Value)-length(REPLACE(DocumentModuleValue.Value,"[#LegalRepresentative_Signature]","")))/length("[#LegalRepresentative_Signature]") > 0 THEN 0 ELSE IdStep END as IdStep FROM Document Join DocumentModuleValue ON DocumentModuleValue.IdDocument = Document.Id WHERE Document.IdStep > 2 AND DocumentModuleValue.IdModule = (select Id From Module where code = "bdy")' + where2;

                            //tx2.executeSql('SELECT Id, IdStep FROM Document ' + where, [], function (tx, resultDocs) {
                            tx2.executeSql(query, [], function (tx, resultDocs) {

                                var arr = [];
                                var arrData = [];

                                if (resultDocs.rows.length != undefined && resultDocs.rows.length > 0) {

                                    for (var j = 0; j != resultDocs.rows.length; ++j)
                                        arrData.push(resultDocs.rows.item(j).Id + "#" + resultDocs.rows.item(j).IdStep);                                   

                                } 

                                //Obtains all the renewed dos already synced in order to only download the newer ones
                                var query = 'SELECT Id, IdStep from Document Where IdStep = (select Id From Step where code = "Renewed")';
                                tx2.executeSql(query, [], function (tx, renewedDocs) {

                                    if (renewedDocs.rows.length != undefined && renewedDocs.rows.length > 0) {

                                        for (var j = 0; j != renewedDocs.rows.length; ++j)
                                            arrData.push(renewedDocs.rows.item(j).Id + "#" + renewedDocs.rows.item(j).IdStep);

                                        arr.push(table);
                                        arr.push(arrData);
                                        deferred.resolve(arr);

                                    } else {
                                        arr.push(table);
                                        arr.push(arrData);
                                        deferred.resolve(arr);
                                    }

                                }, function (tx, results) {
                                    var arr = [];
                                    arr.push(table);
                                    arr.push("");
                                    deferred.resolve(arr);

                                });



                            }, function (tx, results) {
                                var arr = [];
                                arr.push(table);
                                arr.push("");
                                deferred.resolve(arr);

                            });
                            

                        }
                        else {
                            var arr = [];
                            arr.push(table);
                            arr.push("");
                            deferred.resolve(arr);
                        }

                    }, function (tx, results) {


                    });


                }
                else {
                    tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where, [], function (tx, results) {
                        var arr = [];
                        arr.push(table);
                        var arrData = [];
                        if (results.rows != undefined && results.rows != null) {
                            for (var i = 0; i <= results.rows.length - 1; ++i) {
                                arrData.push(results.rows.item(i));
                            }
                        }
                        else
                            arrData.push([]);

                        for (var j = 0; j != arrData.length; ++j) {

                            if (arrData[j].SyncUniqueIdentifier == "null") {
                                arrData[j].SyncUniqueIdentifier = null;
                            }

                            //Clears the images filedata to not create a heavy exports
                            if (table == "UploadedImages") {                                
                                arrData[j].FileData = ""
                            } else if (table === 'TemplateItem') {
                                arrData[j].Other = ""
                            }
                        }


                        arr.push(arrData);
                        deferred.resolve(arr);

                    }, function (tx, results) {
                        var arr = [];
                        arr.push(table);
                        arr.push("");
                        deferred.resolve(arr);

                    });
                }


            });

            return deferred.promise;
        },



        GetLocalDataSync2: function (elem, where, modifiedDocs, ctrlSyncMessages) {
            if (where == undefined) where = '';

            var deferred = $q.defer()

            var table = elem.Table;
            var columns = elem.Columns;

            db.transaction(function (tx2) {

                if (table == "Document") {
                    tx2.executeSql('SELECT Id FROM Step WHERE Code IN ("WaitingForSync","Annuled", "Revoked", "Ended", "PendingIBAN")', [], function (tx, resultsStep) {
                        where = ' WHERE IdStep IN (';
                        //var idStep = resultsStep.rows[0].Id;
                        if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0 && modifiedDocs[0].Documents.length != undefined && modifiedDocs[0].Documents.length > 0) {
                            for (var j = 0; j != resultsStep.rows.length; ++j)
                                where += resultsStep.rows.item(j).Id + ",";

                            where = where.substring(0, where.length - 1);
                            where += ")";

                            //Adds the documents modified
                            where += ' and Id IN ('
                            for (var k = 0; k != modifiedDocs[0].Documents.length; ++k)
                                where += "'" + modifiedDocs[0].Documents[k] + "',";
                            where = where.substring(0, where.length - 1);
                            where += ")";

                            tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where, [], function (tx, results) {
                                var arr = [];
                                arr.push(table);
                                var arrData = [];
                                if (results.rows != undefined && results.rows != null) {
                                    for (var i = 0; i <= results.rows.length - 1; ++i) {
                                        arrData.push(results.rows.item(i));
                                    }
                                }
                                else
                                    arrData.push([]);

                                for (var j = 0; j != arrData.length; ++j) {
                                    if (arrData[j].SyncUniqueIdentifier == "null")
                                        arrData[j].SyncUniqueIdentifier = null;
                                }


                                arr.push(arrData);
                                elem.Data = arrData;
                                ctrlSyncMessages("export", "GetLocalDataSync2Documents", "OK");
                                deferred.resolve(elem);

                            }, function (tx, results) {
                                elem.Data = [];
                                ctrlSyncMessages("export", "GetLocalDataSync2Documents", "OK");
                                deferred.resolve(elem);

                            });
                        }
                        else {
                            elem.Data = [];
                            ctrlSyncMessages("export", "GetLocalDataSync2Documents", "OK");
                            deferred.resolve(elem);
                        }

                    }, function (tx, results) {


                    });



                } else if (table == "DocumentModuleValue") {

                    tx2.executeSql('SELECT Id FROM Step WHERE Code IN ("WaitingForSync","Annuled", "Revoked", "Ended", "PendingIBAN")', [], function (tx, resultsStep) {
                        where = ' WHERE IdStep IN (';
                        //var idStep = resultsStep.rows[0].Id;
                        if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0 && modifiedDocs[0].Documents.length != undefined && modifiedDocs[0].Documents.length > 0) {
                            for (var j = 0; j != resultsStep.rows.length; ++j)
                                where += resultsStep.rows.item(j).Id + ",";

                            where = where.substring(0, where.length - 1);
                            where += ")";

                            //Adds the documents modified
                            where += ' and Id IN ('
                            for (var k = 0; k != modifiedDocs[0].Documents.length; ++k)
                                where += "'" + modifiedDocs[0].Documents[k] + "',";
                            where = where.substring(0, where.length - 1);
                            where += ")";

                            tx2.executeSql('SELECT Id FROM Document ' + where, [], function (tx, resultDocs) {

                                if (resultDocs.rows.length != undefined && resultDocs.rows.length > 0) {


                                    var where2 = ' WHERE IdDocument IN ('
                                    for (var j = 0; j != resultDocs.rows.length; ++j)
                                        where2 += "'" + resultDocs.rows.item(j).Id + "',";

                                    where2 = where2.substring(0, where2.length - 1);
                                    where2 += ")";

                                    tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where2, [], function (tx, results) {
                                        var arr = [];
                                        arr.push(table);
                                        var arrData = [];
                                        if (results.rows != undefined && results.rows != null) {
                                            for (var i = 0; i <= results.rows.length - 1; ++i) {
                                                arrData.push(results.rows.item(i));
                                            }
                                        }
                                        else
                                            arrData.push([]);

                                        for (var j = 0; j != arrData.length; ++j) {
                                            if (arrData[j].SyncUniqueIdentifier == "null")
                                                arrData[j].SyncUniqueIdentifier = null;
                                        }


                                        arr.push(arrData);
                                        elem.Data = arrData;
                                        ctrlSyncMessages("export", "GetLocalDataSync2DocumentModuleValue", "OK");
                                        deferred.resolve(elem);

                                    }, function (tx, results) {
                                        elem.Data = [];
                                        ctrlSyncMessages("export", "GetLocalDataSync2DocumentModuleValue", "OK");
                                        deferred.resolve(elem);

                                    });
                                } else {
                                    elem.Data = [];
                                    ctrlSyncMessages("export", "GetLocalDataSync2DocumentModuleValue", "OK");
                                    deferred.resolve(elem);
                                }

                            }, function (tx, results) {
                                ctrlSyncMessages("export", "GetLocalDataSync2DocumentModuleValue", "OK");
                                elem.Data = [];
                                deferred.resolve(elem);

                            });
                        }
                        else {
                            ctrlSyncMessages("export", "GetLocalDataSync2DocumentModuleValue", "OK");
                            elem.Data = [];
                            deferred.resolve(elem);
                        }

                    }, function (tx, results) {


                    });


                }
                else
                    if (table == "DocumentDocument") {

                        tx2.executeSql('SELECT Id FROM Step where Code IN ("WaitingForSync")', [], function (tx, resultsStep) {
                            where = ' WHERE IdStep IN (';
                            //var idStep = resultsStep.rows[0].Id;
                            if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0) {
                                for (var j = 0; j != resultsStep.rows.length; ++j)
                                    where += resultsStep.rows.item(j).Id + ",";

                                where = where.substring(0, where.length - 1);
                                where += ")";

                                tx2.executeSql('SELECT Id FROM Document ' + where, [], function (tx, resultDocs) {

                                    if (resultDocs.rows.length != undefined && resultDocs.rows.length > 0) {


                                        var where2 = ' WHERE IdDocument2 IN ('
                                        for (var j = 0; j != resultDocs.rows.length; ++j)
                                            where2 += "'" + resultDocs.rows.item(j).Id + "',";

                                        where2 = where2.substring(0, where2.length - 1);
                                        where2 += ")";

                                        tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where2, [], function (tx, results) {
                                            var arr = [];
                                            arr.push(table);
                                            var arrData = [];
                                            if (results.rows != undefined && results.rows != null) {
                                                for (var i = 0; i <= results.rows.length - 1; ++i) {
                                                    arrData.push(results.rows.item(i));
                                                }
                                            }
                                            else
                                                arrData.push([]);

                                            for (var j = 0; j != arrData.length; ++j) {
                                                if (arrData[j].SyncUniqueIdentifier == "null")
                                                    arrData[j].SyncUniqueIdentifier = null;
                                            }


                                            arr.push(arrData);
                                            elem.Data = arrData;
                                            ctrlSyncMessages("export", "GetLocalDataSync2DocumentDocument", "OK");
                                            deferred.resolve(elem);

                                        }, function (tx, results) {
                                            elem.Data = [];
                                            ctrlSyncMessages("export", "GetLocalDataSync2DocumentDocument", "OK");
                                            deferred.resolve(elem);

                                        });
                                    } else {
                                        elem.Data = [];
                                        ctrlSyncMessages("export", "GetLocalDataSync2DocumentDocument", "OK");
                                        deferred.resolve(elem);
                                    }

                                }, function (tx, results) {
                                    elem.Data = [];
                                    ctrlSyncMessages("export", "GetLocalDataSync2DocumentDocument", "OK");
                                    deferred.resolve(elem);

                                });
                            }
                            else {
                                elem.Data = [];
                                ctrlSyncMessages("export", "GetLocalDataSync2DocumentDocument", "OK");
                                deferred.resolve(elem);
                            }

                        }, function (tx, results) {


                        });


                    }

                    else

                        if (table == "WorkflowHistory") {

                            tx2.executeSql('SELECT Id FROM Step WHERE Code IN ("WaitingForSync","Annuled", "Revoked", "Ended", "PendingIBAN","PendingApprovalManager","PendingApprovalSupervisor","PendingApproval")', [], function (tx, resultsStep) {
                                where = ' WHERE IdStep IN (';
                                //var idStep = resultsStep.rows[0].Id;
                                if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0 && modifiedDocs[0].Documents.length != undefined && modifiedDocs[0].Documents.length > 0) {
                                    for (var j = 0; j != resultsStep.rows.length; ++j)
                                        where += resultsStep.rows.item(j).Id + ",";

                                    where = where.substring(0, where.length - 1);
                                    where += ")";

                                    //Adds the documents modified
                                    where += ' and Id IN ('
                                    for (var k = 0; k != modifiedDocs[0].Documents.length; ++k)
                                        where += "'" + modifiedDocs[0].Documents[k] + "',";
                                    where = where.substring(0, where.length - 1);
                                    where += ")";

                                    tx2.executeSql('SELECT Id FROM Document ' + where, [], function (tx, resultDocs) {

                                        if (resultDocs.rows.length != undefined && resultDocs.rows.length > 0) {


                                            var where2 = ' WHERE IdDocument IN ('
                                            for (var j = 0; j != resultDocs.rows.length; ++j)
                                                where2 += "'" + resultDocs.rows.item(j).Id + "',";

                                            where2 = where2.substring(0, where2.length - 1);
                                            where2 += ")";

                                            tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where2, [], function (tx, results) {
                                                var arr = [];
                                                arr.push(table);
                                                var arrData = [];
                                                if (results.rows != undefined && results.rows != null) {
                                                    for (var i = 0; i <= results.rows.length - 1; ++i) {
                                                        arrData.push(results.rows.item(i));
                                                    }
                                                }
                                                else
                                                    arrData.push([]);

                                                for (var j = 0; j != arrData.length; ++j) {
                                                    if (arrData[j].SyncUniqueIdentifier == "null")
                                                        arrData[j].SyncUniqueIdentifier = null;
                                                }


                                                arr.push(arrData);
                                                elem.Data = arrData;
                                                ctrlSyncMessages("export", "GetLocalDataSync2WorkflowHistory", "OK");
                                                deferred.resolve(elem);

                                            }, function (tx, results) {
                                                elem.Data = [];
                                                ctrlSyncMessages("export", "GetLocalDataSync2WorkflowHistory", "OK");
                                                deferred.resolve(elem);

                                            });
                                        } else {
                                            elem.Data = [];
                                            ctrlSyncMessages("export", "GetLocalDataSync2WorkflowHistory", "OK");
                                            deferred.resolve(elem);
                                        }

                                    }, function (tx, results) {
                                        elem.Data = [];
                                        ctrlSyncMessages("export", "GetLocalDataSync2WorkflowHistory", "OK");
                                        deferred.resolve(elem);

                                    });
                                }
                                else {
                                    elem.Data = [];
                                    ctrlSyncMessages("export", "GetLocalDataSync2WorkflowHistory", "OK");
                                    deferred.resolve(elem);
                                }

                            }, function (tx, results) {


                            });


                        }

                        else if (table == "DocumentItemValue") {

                            //Old Query Before Trying to Correct Dynamic Items
                            //tx2.executeSql('SELECT Id FROM Step WHERE Code IN ("WaitingForSync","Annuled", "Revoked", "Ended","PendingApprovalManager","PendingApprovalSupervisor","PendingApproval", "PendingIBAN")', [], function (tx, resultsStep) {

                            //Only Sends Dynamic Items when the documents are created for the first time (Anulled is a state set by the iPAD and "PendingIban" is the out STATE when an agreement changes IBAN)
                            tx2.executeSql('SELECT Id FROM Step WHERE Code IN ("WaitingForSync","Annuled", "PendingIBAN")', [], function (tx, resultsStep) {
                                where = ' WHERE IdStep IN (';
                                //var idStep = resultsStep.rows[0].Id;
                                if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0 && modifiedDocs[0].Documents.length != undefined && modifiedDocs[0].Documents.length > 0) {
                                    for (var j = 0; j != resultsStep.rows.length; ++j)
                                        where += resultsStep.rows.item(j).Id + ",";

                                    where = where.substring(0, where.length - 1);
                                    where += ")";

                                    //Adds the documents modified
                                    where += ' and Id IN ('
                                    for (var k = 0; k != modifiedDocs[0].Documents.length; ++k)
                                        where += "'" + modifiedDocs[0].Documents[k] + "',";
                                    where = where.substring(0, where.length - 1);
                                    where += ")";

                                    tx2.executeSql('SELECT Id FROM Document ' + where, [], function (tx, resultDocs) {

                                        if (resultDocs.rows.length != undefined && resultDocs.rows.length > 0) {


                                            var where2 = ' WHERE IdDocument IN ('
                                            for (var j = 0; j != resultDocs.rows.length; ++j)
                                                where2 += "'" + resultDocs.rows.item(j).Id + "',";

                                            where2 = where2.substring(0, where2.length - 1);
                                            where2 += ")";

                                            tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where2, [], function (tx, results) {
                                                var arr = [];
                                                arr.push(table);
                                                var arrData = [];
                                                if (results.rows != undefined && results.rows != null) {
                                                    for (var i = 0; i <= results.rows.length - 1; ++i) {
                                                        arrData.push(results.rows.item(i));
                                                    }
                                                }
                                                else
                                                    arrData.push([]);

                                                for (var j = 0; j != arrData.length; ++j) {
                                                    if (arrData[j].SyncUniqueIdentifier == "null")
                                                        arrData[j].SyncUniqueIdentifier = null;
                                                }


                                                arr.push(arrData);
                                                elem.Data = arrData;
                                                ctrlSyncMessages("export", "GetLocalDataSync2DocumentItemValue", "OK");
                                                deferred.resolve(elem);

                                            }, function (tx, results) {
                                                ctrlSyncMessages("export", "GetLocalDataSync2DocumentItemValue", "OK");
                                                elem.Data = [];
                                                deferred.resolve(elem);

                                            });
                                        } else {                                            
                                            elem.Data = [];
                                            ctrlSyncMessages("export", "GetLocalDataSync2DocumentItemValue", "OK");
                                            deferred.resolve(elem);
                                        }

                                    }, function (tx, results) {                                        
                                        elem.Data = [];
                                        ctrlSyncMessages("export", "GetLocalDataSync2DocumentItemValue", "OK");
                                        deferred.resolve(elem);

                                    });
                                }
                                else {
                                    elem.Data = [];
                                    ctrlSyncMessages("export", "GetLocalDataSync2DocumentItemValue", "OK");
                                    deferred.resolve(elem);
                                }

                            }, function (tx, results) {


                            });


                        }
                        else if (table == "ImportedAgreement") {

                            if (modifiedDocs[0].ImportedAgreements.length != undefined && modifiedDocs[0].ImportedAgreements.length > 0) {
                                whereIAG = 'WHERE Id IN ('
                                for (var l = 0; l != modifiedDocs[0].ImportedAgreements.length; ++l)
                                    whereIAG += modifiedDocs[0].ImportedAgreements[l] + ",";
                                whereIAG = whereIAG.substring(0, whereIAG.length - 1);
                                whereIAG += ")";


                                tx2.executeSql('SELECT ' + columns + ' FROM ImportedAgreement ' + whereIAG, [], function (tx, results) {
                                    var arr = [];
                                    arr.push(table);
                                    var arrData = [];
                                    if (results.rows != undefined && results.rows != null) {
                                        for (var i = 0; i <= results.rows.length - 1; ++i) {
                                            arrData.push(results.rows.item(i));
                                        }
                                    }
                                    else
                                        arrData.push([]);

                                    for (var j = 0; j != arrData.length; ++j) {
                                        if (arrData[j].SyncUniqueIdentifier == "null")
                                            arrData[j].SyncUniqueIdentifier = null;
                                    }


                                    arr.push(arrData);
                                    elem.Data = arrData;
                                    ctrlSyncMessages("export", "GetLocalDataSync2ImportedAgreement", "OK");
                                    deferred.resolve(elem);

                                }, function (tx, results) {
                                    elem.Data = [];
                                    ctrlSyncMessages("export", "GetLocalDataSync2ImportedAgreement", "OK");
                                    deferred.resolve(elem);

                                });
                            }
                            else {
                                elem.Data = [];
                                ctrlSyncMessages("export", "GetLocalDataSync2ImportedAgreement", "OK");
                                deferred.resolve(elem);
                            }


                        }
                        else {
                            tx2.executeSql('SELECT ' + columns + ' FROM ' + table + ' ' + where, [], function (tx, results) {
                                var arr = [];
                                arr.push(table);
                                var arrData = [];
                                if (results.rows != undefined && results.rows != null) {
                                    for (var i = 0; i <= results.rows.length - 1; ++i) {
                                        arrData.push(results.rows.item(i));
                                    }
                                }
                                else
                                    arrData.push([]);

                                for (var j = 0; j != arrData.length; ++j) {
                                    if (arrData[j].SyncUniqueIdentifier == "null")
                                        arrData[j].SyncUniqueIdentifier = null;
                                }


                                arr.push(arrData);
                                elem.Data = arrData;
                                evaluateResult(ctrlSyncMessages, "export", table, "OK");
                                deferred.resolve(elem);

                            }, function (tx, results) {
                                elem.Data = [];
                                evaluateResult(ctrlSyncMessages, "export", table, "OK");
                                deferred.resolve(elem);

                            });
                        }


            });

            return deferred.promise;
        },

        UpdateSync: function (dataToUpdate, username, market, table, columns, columnsType, ctrlSyncMessages) {
            var deferred = $q.defer()
            var arr = [];
            var arrData = [];
            var inserted = 0;
            var updated = 0;

            db.transaction(function (tx2) {
                //For Update
                var arrayColumns = columns.split(',');
                var arrayColumnsType = columnsType.split(',');
                var strColumns = '';
                for (var j = 1; j !== arrayColumns.length; ++j) {
                    if (arrayColumnsType == undefined) {
                        strColumns += arrayColumns[j] + " = '#" + arrayColumns[j] + "#' ,";
                    }
                    else {
                        if (arrayColumnsType[j] == "string")
                            strColumns += arrayColumns[j] + " = '#" + arrayColumns[j] + "#' ,";
                        else
                            strColumns += arrayColumns[j] + " = #" + arrayColumns[j] + "# ,";
                    }
                }

                strColumns = strColumns.substring(0, strColumns.length - 1);

                //For Insert
                var insertColsValues = '';
                var insertCols = '';
                for (var k = 1; k !== arrayColumns.length; ++k) {
                    insertColsValues = insertColsValues + '?,';
                    insertCols = insertCols + arrayColumns[k] + ',';
                }
                insertColsValues = insertColsValues.substring(0, insertColsValues.length - 1);
                insertCols = insertCols.substring(0, insertCols.length - 1);

                var insertCols2 = '';
                for (var k = 0; k !== arrayColumns.length; ++k) {
                    insertCols2 = insertCols2 + arrayColumns[k] + ',';
                }
                insertCols2 = insertCols2.substring(0, insertCols2.length - 1);


                var res = '';
                if (dataToUpdate != undefined && dataToUpdate.length > 0) {

                    var arrayQuery = [];

                    for (var i = 0; i !== dataToUpdate.length; ++i) {
                        var values = '';
                        var strColumns2 = strColumns;
                        var dataArr = dataToUpdate[i];
                        var Id = dataArr[0];
                        for (var m = 1; m !== arrayColumns.length; ++m) {

                            //Fixes to ensure that the bolean values are converted to string
                            if (table === 'UploadedImages' && arrayColumns[m] == 'IsDefault') {
                                dataArr[m] = ("'" + dataArr[m] + "'").toLowerCase();
                            } else if (table === 'TemplateItem' && (arrayColumns[m] == 'Mandatory' || arrayColumns[m] == 'Editable' || arrayColumns[m] == 'Deleted' || arrayColumns[m] == 'Report')) {
                                dataArr[m] = ("'" + dataArr[m] + "'").toLowerCase();
                            }

                            strColumns2 = strColumns2.replace("#" + arrayColumns[m] + "#", dataArr[m]);

                            //if (arrayColumnsType[i] == "string")
                            //    values += '"' + dataArr[m] + '"' + ',';
                            //else
                            //    values += dataArr[m] + ',';
                        }
                        for (var m = 0; m !== arrayColumns.length; ++m) {
                            if (arrayColumnsType[m] == "string") {
                                if (dataArr[m] != null && dataArr[m] != undefined && dataArr[m] != '')
                                    values += "'" + dataArr[m].toString().replace(/'/g, "''") + "'" + ",";
                                else if (dataArr[m] == null && table === 'TemplateItem')
                                    values += null +  ","; //Fix to preserve value as NULL 
                                else
                                    values += "'" + dataArr[m] + "'" + ",";
                            }
                            else
                                values += dataArr[m] + ',';
                        }
                        values = values.substring(0, values.length - 1);

                        var id = '';
                        if (table === 'Document')
                            id = 'Id =  "' + Id + '"';
                        if (table === 'DocumentModuleValue')
                            id = 'IdModule = ' + dataArr[1] + ' and IdDocument = "' + Id + '"';
                        if (table === 'WorkflowHistory') {
                            id = 'Id =  "' + Id + '"';
                            values = values.toString().replace("'null'", "''");
                        }


                        //var queryupdate = 'UPDATE ' + table + ' SET ' + strColumns2 + ' Where ' + id;


                        var queryupdate = 'INSERT OR REPLACE INTO ' + table + '(' + insertCols2 + ')' + ' VALUES (' + values + ')';

                        arrayQuery.push(queryupdate);
                    }

                    var sqlqueries = '';

                               
                    //Batch SQL Can only be made when using native SQLite
                    if (deployEnviron == 'release' || environSource.toLowerCase() == 'qa') {

                        db.sqlBatch(arrayQuery, function () {                            
                            arr.push(table);
                            arr.push('OK');
                            arr.push(inserted);
                            arr.push(updated);
                            evaluateResult(ctrlSyncMessages, "import", table, "OK");
                            deferred.resolve(arr);
                        }, function (error) {
                            alert('Populate table error: ' + error.message);
                            evaluateResult(ctrlSyncMessages, "import", table, "ERROR");
                            deferred.resolve(arr);
                        });

                    } else {

                        //Validates the error state
                        var isErrorInsert = false;

                        //In DEV it is necessary to use the for cycle synce the batch doesn't work
                        for (var j = 0; j != arrayQuery.length; ++j) {
                            var q = arrayQuery[j];

                            doQuery(tx2, q, []);

                            function doQuery(tx2, query) {
                                tx2.executeSql(query, [], successHandler, errorHandler);
                                function errorHandler(transaction, error) {
                                    //alert("Error : " + error.message + " in " + query);
                                    isErrorInsert = true;   //THIS error.message TIPICALLY IS 'no such table'                                 
                                }
                                function successHandler(transaction) {
                                }
                            }

                            //tx2.executeSql(q, [], function (tx, results) {
                            //    updated += 1;


                            //}, function (txtx2, err) {
                            //    sqlqueries += "---" + "OK" + "---\n";

                            //});
                        }

                        if (arrayQuery.length > 0 && isErrorInsert == false) {
                            arr.push(table);
                            arr.push('OK');
                            arr.push(inserted);
                            arr.push(updated);
                            evaluateResult(ctrlSyncMessages, "import", table, "OK");
                            deferred.resolve(arr);
                        } else {
                            arr.push(table);
                            arr.push('NONE');
                            arr.push(inserted);
                            arr.push(updated);
                            evaluateResult(ctrlSyncMessages, "import", table, "ERROR");
                            deferred.resolve(arr);
                        }
                    }                  

                }
                else {
                    arr.push(table);
                    arr.push('NONE');
                    arr.push(inserted);
                    arr.push(updated);
                    evaluateResult(ctrlSyncMessages, "import", table, "OK");
                    deferred.resolve(arr);
                }


            });

            return deferred.promise
        },


        GetPendingIBANDocument: function (elem, where) {
            var deferred = $q.defer()
            var arrData = [];

            db.transaction(function populateDB(tx) {


                var str = 'SELECT Document.Id as DocumentId, Document.IdStep,  DocumentType.Id as DocTypeId, ' +
                          '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt_edit") AND IdDocument = Document.Id) as customer ' +
                          'FROM Document ' +
                          'INNER JOIN DocumentType ON DocumentType.Id = Document.IdDocumentType ' +
                          'WHERE Document.IdStep IN (SELECT Id FROM Step WHERE Step.Code = "PendingIBAN") ' +
                            'UNION ALL ' +
                            'SELECT Document.Id as DocumentId, Document.IdStep, DocumentType.Id as DocTypeId, ' +
                          '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt_edit") AND IdDocument = Document.Id) as customer ' +
                          'FROM Document ' +
                          'INNER JOIN DocumentType ON DocumentType.Id = Document.IdDocumentType WHERE Document.IdDocumentType = 4 ' +
                          'AND Document.IdStep IN (SELECT Id FROM Step WHERE Step.Code = "WaitingForSync") ';


                tx.executeSql(str, [], function (tx2, results) {

                    if (results != undefined && results.rows.length > 0) {

                        for (var i = 0; i <= results.rows.length - 1; ++i) {
                            arrData.push(results.rows.item(i));
                        }
                    }
                    deferred.resolve(arrData);

                });


            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        },

        GetLocalDocumentsIdAndStep: function (ctrlSyncMessages) {

            var deferred = $q.defer()
            var dataToSend = {};
            dataToSend.Documents = [];
            dataToSend.ImportedAgreements = [];
            dataToSend.DocumentsClosedOnIpad = [];

            db.transaction(function (tx2) {

                tx2.executeSql('SELECT Id FROM Step WHERE Code NOT IN ("WaitingForSync","Draft")', [], function (tx, resultsStep) {
                    where = ' WHERE IdStep IN (';
                    //var idStep = resultsStep.rows[0].Id;
                    if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0) {
                        for (var j = 0; j != resultsStep.rows.length; ++j)
                            where += resultsStep.rows.item(j).Id + ",";

                        where = where.substring(0, where.length - 1);
                        where += ")";

                        //NOTA!!! -> WHERE DEIXOU DE SER USADO E PASSOU A SEREM ENVIADOS TODOS OS DOCS PARA O BACKEND
                        //tx2.executeSql('SELECT Id, IdStep FROM Document ' + where, [], function (tx, results) {
                        tx2.executeSql('SELECT Id, IdStep FROM Document', [], function (tx, results) {
                            var arrData = [];
                            if (results.rows != undefined && results.rows != null) {
                                for (var i = 0; i <= results.rows.length - 1; ++i) {
                                    arrData.push(results.rows.item(i));
                                }
                            }
                            else
                                arrData.push([]);

                            for (var j = 0; j != arrData.length; ++j) {
                                if (arrData[j].SyncUniqueIdentifier == "null")
                                    arrData[j].SyncUniqueIdentifier = null;
                            }

                            dataToSend.Documents = arrData;

                            //Gets all the signed imported agreements to compare if they have been uploaded
                            tx2.executeSql("Select Id, Signed FROM ImportedAgreement", [], function (tx, results) {
                                var arrData = [];
                                if (results.rows != undefined && results.rows != null) {
                                    for (var i = 0; i <= results.rows.length - 1; ++i) {
                                        arrData.push(results.rows.item(i));
                                    }
                                }
                                else
                                    arrData.push([]);

                                for (var j = 0; j != arrData.length; ++j) {
                                    if (arrData[j].SyncUniqueIdentifier == "null")
                                        arrData[j].SyncUniqueIdentifier = null;
                                }

                                dataToSend.ImportedAgreements = arrData;


                                //Obtem todos os documentos locais que já tenham sido dados como terminados -> É USADO PARA SABER QUE DOCUMENT MODULE VALUES TRAZER OU NÃO
                                tx2.executeSql('SELECT Id FROM Step WHERE Code IN ("Annuled","Approved","Rejected","Ended","Revoked","Renewed","Publish","Signed","Synced")', [], function (tx, resultsStep) {
                                    where = ' WHERE IdStep IN (';
                                    //var idStep = resultsStep.rows[0].Id;
                                    if (resultsStep.rows.length != undefined && resultsStep.rows.length > 0) {
                                        for (var j = 0; j != resultsStep.rows.length; ++j)
                                            where += resultsStep.rows.item(j).Id + ",";

                                        where = where.substring(0, where.length - 1);
                                        where += ")";

                                        tx2.executeSql('SELECT Id FROM Document' + where, [], function (tx, results) {
                                            var arrData = [];
                                            if (results.rows != undefined && results.rows != null) {
                                                for (var i = 0; i <= results.rows.length - 1; ++i) {
                                                    arrData.push(results.rows.item(i));
                                                }
                                            }
                                            else
                                                arrData.push([]);

                                            for (var j = 0; j != arrData.length; ++j) {
                                                if (arrData[j].SyncUniqueIdentifier == "null")
                                                    arrData[j].SyncUniqueIdentifier = null;
                                            }

                                            dataToSend.DocumentsClosedOnIpad = arrData;
                                            ctrlSyncMessages("export", "GetLocalDocumentsIdAndStep", "OK");
                                            deferred.resolve(dataToSend);

                                        }, function (tx, results) {
                                            ctrlSyncMessages("export", "GetLocalDocumentsIdAndStep", "WNG");
                                            deferred.resolve(dataToSend);

                                        });
                                    }
                                    else {
                                        ctrlSyncMessages("export", "GetLocalDocumentsIdAndStep", "WNG");
                                        deferred.resolve(dataToSend);
                                    }

                                }, function (tx, results) {


                                });

                            }, function (tx, results) {
                                ctrlSyncMessages("export", "GetLocalDocumentsIdAndStep", "WNG");
                                deferred.resolve(dataToSend);
                            });

                        }, function (tx, results) {
                            ctrlSyncMessages("export", "GetLocalDocumentsIdAndStep", "WNG");
                            deferred.resolve(dataToSend);

                        });
                    }
                    else {
                        ctrlSyncMessages("export", "GetLocalDocumentsIdAndStep", "WNG");
                        deferred.resolve(dataToSend);
                    }

                }, function (tx, results) {


                });

            });

            return deferred.promise;
        }
    }
});
