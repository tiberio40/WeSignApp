
app.factory('readData', function ($q) {

    var localData = [];
    var data = [];
    var dataSync = [];
    var db = localDatabase;
    //var db = window.openDatabase('CMTLocal', '1.0', 'CMT Local', 100000);
    //var db = window.sqlitePlugin.openDatabase({ name: "CMTLocal.db", location: 1 });
    var loginPrefix = 'PMI';


    //Evaluates the result of each action
    var evaluateResult = function (methodResult) {

        var result;

        switch (methodResult) {
            case 1:
                result = "OK";
                break;
            case 0:
                result = "WNG";
                break;
            default:
                result = "ERROR"
                break;
        }

        return result;
    }

    getLocalUser = function (username, password, market, PasswordExpireWarning) {
        // initialize a deferred method
        var deferred = $q.defer()


        //db.transaction(function (tr) {
        //    tr.executeSql("UPDATE DocumentModuleValue Set VALUE = Replace(Value, 'Morada','[#LegalRepresentative_Signature]') where IdDocument = '1AEB6F6C-930E-4CAD-9A5B-E0ACDBC52083' and IdModule = 7", [], function (tr, rs) {

        //    });
        //});

        //db.transaction(function populateDB(tx) {
        //    tx.executeSql("UPDATE DocumentModuleValue Set value = '[#LegalRepresentative_Signature]' where IdDocument = '1aeb6f6c-930e-4cad-9a5b-e0acdbc52083' and IdModule = 7");
        //}, function errorCB(tx, err) {
        //    alert(err);
        //}, function successCB() {
        //    alert('ok');
        //});

        db.transaction(function (tr) {
            tr.executeSql("CREATE TABLE IF NOT EXISTS User (id unique, code, firstName, lastName, password, market, isSynced, numLogins, IsReset, LastPasswordChange, expired, isGeographyChanged, securityToken, isSSO, IdUserGroup)", [], function (tr, rs) {
                db.transaction(function (tx) {
                    data = [];
                    if (username !== '' && password !== '') {
                        tx.executeSql("SELECT * FROM User where code = '" + username + "' and password = '" + password + "' and IsReset = 'false' and expired = 0 AND CAST(numLogins AS INT) <= (SELECT CAST(Value as INT) FROM Configuration WHERE Name = 'NrFailAttempLock' and IdMarket = " + market + ")", [], function (tr, rs2) {
                            var dataset = rs2.rows;
                            for (var i = dataset.length - 1; i >= 0; i--) {
                                data[i] = dataset.item(i);
                            }


                            if (data.length == 1) {

                                var code = data[0].code;
                                var LastPasswordChange = data[0].LastPasswordChange;
                                var sqlQuery = ""
                                var NrDaysPasswordExpires;
                                var NrDaysPasswordExpireWarning;


                                db.transaction(function populateDB(tx3) {
                                    sqlQuery = "Select Value from Configuration where Name = 'NrDaysPasswordExpireWarning' and IdMarket = " + market;
                                    tx3.executeSql(sqlQuery, [], function (tr, rs4) {

                                        NrDaysPasswordExpireWarning = rs4.rows.item(0).Value;


                                        db.transaction(function populateDB(tx2) {
                                            sqlQuery = "Select Value from Configuration where Name = 'NrDaysPasswordExpires' and IdMarket = " + market;
                                            tx2.executeSql(sqlQuery, [], function (tr, rs3) {

                                                NrDaysPasswordExpires = rs3.rows.item(0).Value;

                                                if (LastPasswordChange != null && typeof LastPasswordChange != 'undefined') {

                                                    var currentDate = new Date();
                                                    LastPasswordChange = new Date(LastPasswordChange);

                                                    NrDaysPasswordExpires = parseInt(NrDaysPasswordExpires);
                                                    NrDaysPasswordExpireWarning = parseInt(NrDaysPasswordExpireWarning);

                                                    var expireDate = new Date()
                                                    var warningDate = new Date()
                                                    expireDate.setTime(LastPasswordChange.getTime() + (24 * 60 * 60 * 1000) * NrDaysPasswordExpires);
                                                    warningDate.setTime(expireDate.getTime() - (24 * 60 * 60 * 1000) * NrDaysPasswordExpireWarning);

                                                    //var a = currentDate.toString();
                                                    //var b = LastPasswordChange.toString();
                                                    //var c = expireDate.toString();
                                                    //var d = warningDate.toString();

                                                    //Fallback to allow access to users that have never set a password
                                                    if (LastPasswordChange < new Date("2007-01-01")) {
                                                        deferred.resolve(data);
                                                        return deferred.promise;
                                                    }

                                                    //Password has expired, return with error
                                                    if (expireDate < currentDate) {

                                                        //Localy inactivates the user account to prevent clock rollback
                                                        db.transaction(function populateDB(tx5) {
                                                            tx5.executeSql('UPDATE User SET expired = 1 WHERE code = "' + code + '"');
                                                        }, function errorCB(tx5, err) {
                                                        }, function successCB() {
                                                        });

                                                        deferred.resolve(-1);
                                                        return deferred.promise;
                                                    } else {

                                                        //Validates the warning message
                                                        if (currentDate > warningDate) {
                                                            //It has warning, sets the variable to Warning
                                                            PasswordExpireWarning.value = true;
                                                            PasswordExpireWarning.days = Math.round(Math.abs((expireDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)));
                                                            deferred.resolve(data);
                                                            return deferred.promise;
                                                        } else {
                                                            //No warning, return the data
                                                            PasswordExpireWarning.value = false;
                                                            deferred.resolve(data);
                                                            return deferred.promise;
                                                        }
                                                    }

                                                } else {
                                                    //The user does not have password history, simply return
                                                    deferred.resolve(data);
                                                    return deferred.promise;
                                                }

                                            });

                                        }, function successCB() {

                                        });

                                    }, function successCB() {

                                    }, function errorCB(tx3, err) {
                                        deferred.resolve(-1);
                                    });
                                }, function errorCB(tx2, err) {
                                    deferred.resolve(-1);
                                });
                            } else {

                                //Multiples users found, return the data
                                deferred.resolve(data);
                                return deferred.promise;
                            }
                        });
                    }
                    else {
                        data = [];
                        tx.executeSql("SELECT * FROM User", [], function (tr, rs) {
                            var dataset = rs.rows;
                            for (var i = dataset.length - 1; i >= 0; i--) {
                                data[i] = dataset.item(i);
                            }
                            deferred.resolve(data);
                            return deferred.promise;
                        });
                    }

                }, function errorCB(tx, err) {
                    deferred.resolve(-1);
                });
            });
        });

        // return the promise (that is, the async data)
        return deferred.promise
    }

    AddUserToLocal = function (user, password) {
        var deferred = $q.defer()


        db.transaction(function populateDB(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS User (id unique, code, firstName, lastName, password, market, isSynced, numLogins, IsReset, LastPasswordChange, expired, isGeographyChanged, securityToken, isSSO, IdUserGroup)');
        }, function errorCB(tx, err) {
            //vm.Message += vm.Message + "\r\n" + "Error processing SQL: " + err;
        }, function successCB() {
            //vm.Message += vm.Message + "\r\n" + "Table users Created ";

            var sqlQuery = ""
            var message = ""

            db.transaction(function populateDB(tx2) {
                tx2.executeSql('Select Count(*) AS UserCount from User where id = "' + user.Id + '"', [], function (tr, rs3) {

                    var userExists = rs3.rows.item(0).UserCount

                    if (userExists == 0) {
                        sqlQuery = 'INSERT INTO User (id, code, firstName, lastName, password, market, isSynced, numLogins, IsReset, LastPasswordChange, expired, isGeographyChanged, securityToken, isSSO, IdUserGroup) VALUES ("' + user.Id + '","' + user.Code.replace('PMI\\', '') + '","' + user.FirstName + '","' + user.LastName + '","' + password + '","' + user.IdMarket + '",0,0,"' + user.IsReset + '","' + user.LastPasswordChange + '", 0,0, "' + user.securityToken + '", ' + user.sso + ', "' + user.IdUserGroup + '")';
                        message = "insert";
                    } else {
                        sqlQuery = 'UPDATE User SET firstName = "' + user.FirstName + '", lastName = "' + user.LastName + '", market = "' + user.IdMarket + '", numLogins = 0, IsReset = "' + user.IsReset + '", LastPasswordChange = "' + user.LastPasswordChange + '", expired = 0, securityToken = "' + user.securityToken + '"';
                        message = "update";
                    }


                });
            }, function errorCB(tx, err) {
                console.log("error usuario")
                console.log(err)
            }, function successCB() {
                db.transaction(function populateDB(tx3) {
                    tx3.executeSql(sqlQuery);
                }, function errorCB(tx, err) {
                    deferred.resolve(tx);
                }, function successCB() {
                    data = { 'username': user.Code, 'password': password, 'market': user.market, 'message': message };
                    deferred.resolve(data);
                });

            });
        });

        return deferred.promise;
    }

    AddLoginError = function (user) {
        var deferred = $q.defer()

        db.transaction(function populateDB(tx) {
            tx.executeSql('UPDATE User SET numLogins = numLogins + 1 WHERE code = "' + user + '"');
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    GetNumberAttemps = function () {
        var deferred = $q.defer()

        db.transaction(function populateDB(tx) {
            tx.executeSql('SELECT Top 1 Value FROM Configuration Where Name = "NrFailAttempLock"', [], function (tr, rs2) {
                var dataset = rs2.rows;
                for (var i = dataset.length - 1; i >= 0; i--) {
                    data[i] = dataset.item(i);
                }
                deferred.resolve(data);
            });
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    ResetLoginError = function (user) {
        var deferred = $q.defer()

        db.transaction(function populateDB(tx) {
            tx.executeSql('UPDATE User SET numLogins = 0 WHERE code = "' + user + '"');
        }, function errorCB(tx, err) {
            deferred.resolve(tx);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    UpdatePassword = function (user, password) {
        var deferred = $q.defer()


        db.transaction(function populateDB(tx) {
            var sql = 'UPDATE User SET password = "' + password + '" WHERE code = "' + user + '"';
            tx.executeSql(sql);
        }, function errorCB(tx, err) {
            deferred.resolve(tx);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    setUserReset = function (user, IsReset) {
        var deferred = $q.defer()

        db.transaction(function populateDB(tx) {
            tx.executeSql('UPDATE User SET IsReset = "' + IsReset + '" WHERE code = "' + user + '"');
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    AddServerVersion = function (version) {
        var deferred = $q.defer()


        db.transaction(function populateDB(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS FrontendVersion (version unique)');
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {
            //vm.Message += vm.Message + "\r\n" + "Table users Created ";
            db.transaction(function populateDB(tx2) {
                var sql = 'INSERT OR REPLACE INTO FrontendVersion(version) VALUES ("' + version + '")';
                tx2.executeSql(sql);
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {
                deferred.resolve(1);
            });
        });

        return deferred.promise;
    }

    GetLocalFrontendVersion = function (version) {
        var deferred = $q.defer()
        db.transaction(function populateDB(tx) {
            tx.executeSql("SELECT Version FROM FrontendVersion", [], function (tr, rs2) {
                var dataset = rs2.rows;
                for (var i = dataset.length - 1; i >= 0; i--) {
                    data[i] = dataset.item(i);
                }
                deferred.resolve(data);
            });
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {

        });

        return deferred.promise;
    }

    doSync = function () {

        var deferred = $q.defer()
        var returnData = [];

        db.transaction(function populateDB(tx2) {
            var q = 'SELECT isSynced FROM User';

            tx2.executeSql(q, [], function (tr, rs) {
                var dataset = rs.rows;
                for (var i = dataset.length - 1; i >= 0; i--) {
                    returnData[i] = dataset.item(i);
                }
            });


        }, function errorCB(tx, err) {
            //deferred.resolve('0');
        }, function successCB() {
            deferred.resolve(returnData);
            //deferred.resolve(dataSync);
        });

        return deferred.promise;
    }

    updateSync = function (username, value) {

        var deferred = $q.defer()

        db.transaction(function populateDB(tx2) {
            //var q = 'UPDATE User set isSynced = ' + value + ' where code = "' + username + '"';
            var q = "UPDATE User set isSynced = " + value + " where UPPER(code) LIKE UPPER('" + username + "')";

            tx2.executeSql(q);

        }, function errorCB(tx, err) {
            deferred.resolve('0');
        }, function successCB() {
            deferred.resolve(dataSync);
        });

        return deferred.promise;
    }

    AddCustomer = function (customer, ctrlSyncMessages) {
        var deferred = $q.defer()
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Customer', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS Customer (Id unique, IdGeography, Code, Name, RegisteredName, Address1, Address2, Locality, Region, PostCode, TaxNumber, Telephone, Email, IBANUpdated, Deleted)');
                if (customer !== undefined && customer.length > 0) {
                    for (var i = 0; i !== customer.length; ++i) {
                        var sql = 'INSERT INTO Customer (Id, IdGeography, Code, Name, RegisteredName, Address1, Address2, Locality, Region, PostCode, TaxNumber, Telephone, Email, IBANUpdated, Deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [customer[i].Id, customer[i].IdGeography, customer[i].Code, customer[i].Name, customer[i].RegisteredName, customer[i].Address1, customer[i].Address2, customer[i].Locality, customer[i].Region, customer[i].PostCode, customer[i].TaxNumber, customer[i].Telephone, customer[i].Email, customer[i].IBANUpdated, customer[i].Deleted]);
                    }
                    result = 1;
                }
                else {
                    result = 0;
                }
            });

        }, function errorCB(tx, err) {
            result = -1
            ctrlSyncMessages("import", "AddCustomer", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddCustomer", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddConfiguration = function (configuration, ctrlSyncMessages) {
        var deferred = $q.defer()
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Configuration', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS Configuration (Id unique, Name, Value, IdMarket)');
                if (configuration !== undefined && configuration.length > 0) {
                    for (var i = 0; i !== configuration.length; ++i) {
                        var sql = 'INSERT INTO Configuration (Id, Name, Value, IdMarket) VALUES (?, ?, ?, ?)';
                        tx2.executeSql(sql, [configuration[i].Id, configuration[i].Name, configuration[i].Value, configuration[i].IdMarket]);
                    }
                    result = 1;
                }
                else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            result = -1
            ctrlSyncMessages("import", "AddConfiguration", evaluateResult(result));
            deferred.resolve(tx2);
        }, function successCB() {
            ctrlSyncMessages("import", "AddConfiguration", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddDocuments = function (document, ctrlSyncMessages) {
        var deferred = $q.defer()
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Document', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS Document (Id unique, IdStep, IdTemplate, IdDocumentType, Deleted, IdGeography, Commentary, IdBudget, CreatedOn, CreatedBy, SignatureType, SignatureStatus, Email, EmailRepresentative, CustomerSignature, CustomerRepresentativeSignature)');
                if (document !== undefined && document.length > 0) {
                    for (var i = 0; i !== document.length; ++i) {
                        var sql = 'INSERT INTO Document (Id, IdStep, IdTemplate, IdDocumentType, Deleted, IdGeography, Commentary, IdBudget, CreatedOn, CreatedBy, SignatureType, SignatureStatus, Email, EmailRepresentative, CustomerSignature, CustomerRepresentativeSignature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [document[i].Id, document[i].IdStep, document[i].IdTemplate, document[i].IdDocumentType, (document[i].Deleted == false ? 0 : 1), document[i].IdGeography, (document[i].Commentary == undefined || document[i].Commentary == 'null' ? '' : document[i].Commentary), document[i].IdBudget, document[i].CreatedOn, document[i].CreatedBy, document[i].SignatureType, document[i].SignatureStatus, document[i].Email, document[i].EmailRepresentative, document[i].CustomerSignature, document[i].CustomerRepresentativeSignature]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            result = -1
            ctrlSyncMessages("import", "AddDocuments", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddDocuments", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddDocumentValues = function (rowlist, importedRows) {

        var deferred = $q.defer()

        var importData = function () {

            db.transaction(function (tx3) {
                for (var i = 0; i !== rowlist.length; ++i) {
                    var sql = 'INSERT INTO DocumentModuleValue (IdDocument, IdModule, Value) VALUES (?, ?, ?)';
                    tx3.executeSql(sql, [rowlist[i].IdDocument, rowlist[i].IdModule, rowlist[i].Value]);

                    //Clears the objects and increases the number of imported rows
                    rowlist[i] = {};
                    importedRows.value++;
                }

            }, function errorCB(tx3, err) {
                deferred.resolve(-1);
            }, function successCB() {
                deferred.resolve(1);
            });
        }

        //If no row have been imported creates the table
        if (importedRows.value == 0) {
            db.transaction(function populateDB(tx2) {
                tx2.executeSql('DROP TABLE IF EXISTS DocumentModuleValue', [], function (tx, results) {
                    tx2.executeSql('CREATE TABLE IF NOT EXISTS DocumentModuleValue (IdDocument, IdModule, Value, PRIMARY KEY(IdDocument, IdModule))');
                });
            }, function errorCB(tx2, err) {
                deferred.resolve(-1);
            }, function successCB() {
                //Makes que call to import data
                importData();
            });
        } else {
            importData();   //Table has already been created, just import data
        }

        return deferred.promise;
    }

    AddDocumentModules = function (documentModules, ctrlSyncMessages) {
        var deferred = $q.defer()
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Module', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS Module (Id unique, Code, Name, TemplateControl, DocumentControl, Deleted)');
                if (documentModules !== undefined && documentModules.length > 0) {
                    for (var i = 0; i !== documentModules.length; ++i) {
                        var sql = 'INSERT INTO Module (Id, Code, Name, TemplateControl, DocumentControl, Deleted) VALUES (?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [documentModules[i].Id, documentModules[i].Code, documentModules[i].Name, documentModules[i].TemplateControl, documentModules[i].DocumentControl, documentModules[i].Deleted]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            result = -1
            ctrlSyncMessages("import", "AddDocumentModules", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddDocumentModules", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddModuleObjectives = function (moduleObjective, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS ModuleObjective', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS ModuleObjective (Id unique, Name, Target, Weight)');
                if (moduleObjective !== undefined && moduleObjective.length > 0) {
                    for (var i = 0; i !== moduleObjective.length; ++i) {
                        var sql = 'INSERT INTO ModuleObjective (Id, Name, Target, Weight) VALUES (?, ?, ?, ?)';
                        tx2.executeSql(sql, [moduleObjective[i].Id, moduleObjective[i].Name, moduleObjective[i].Target, moduleObjective[i].Weight]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            result = -1
            ctrlSyncMessages("import", "AddModuleObjectives", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddModuleObjectives", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddSteps = function (step, ctrlSyncMessages) {
        var deferred = $q.defer()
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Step', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS Step (Id unique, Name, Description, Code, DivId)');
                if (step !== undefined && step.length > 0) {
                    for (var i = 0; i !== step.length; ++i) {
                        var sql = 'INSERT INTO Step (Id, Name, Description, Code, DivId) VALUES (?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [step[i].Id, step[i].Name, step[i].Description, step[i].Code, step[i].DivId]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            result = -1
            ctrlSyncMessages("import", "AddSteps", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddSteps", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddTemplates = function (template, ctrlSyncMessages) {
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Template', [], function (tx, results) {

                tx2.executeSql('CREATE TABLE IF NOT EXISTS Template (Id unique, IdDocumentType, IdMarket, IdStep, Name, Deleted, RemoteSignature, IsReplace, ReplacedTemplate)');
                if (template !== undefined && template.length > 0) {
                    for (var i = 0; i !== template.length; ++i) {
                        var sql = 'INSERT INTO Template (Id, IdDocumentType, IdMarket, IdStep, Name, Deleted, RemoteSignature, IsReplace, ReplacedTemplate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [template[i].Id, template[i].IdDocumentType, template[i].IdMarket, template[i].IdStep, template[i].Name, template[i].Deleted, template[i].RemoteSignature, template[i].IsReplace, template[i].ReplacedTemplate]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            result = -1
            ctrlSyncMessages("import", "AddTemplates", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddTemplates", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddTemplateItems = function (rowlist, importedRows) {

        var deferred = $q.defer()

        var importData = function () {

            db.transaction(function (tx3) {
                for (var i = 0; i !== rowlist.length; ++i) {

                    var sql = 'INSERT INTO TemplateItem (Id, IdTemplate, IdItemType, ItemTypeName, Name, Label, Mandatory, RegularExpression, ValidationMessage, DefaultValue, Editable, Sort, Other, Deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    tx3.executeSql(sql, [rowlist[i].Id, rowlist[i].IdTemplate, rowlist[i].IdItemType, rowlist[i].ItemTypeName, rowlist[i].Name, rowlist[i].Label, rowlist[i].Mandatory, rowlist[i].RegularExpression, rowlist[i].ValidationMessage, rowlist[i].DefaultValue, rowlist[i].Editable, rowlist[i].Sort, rowlist[i].Other, rowlist[i].Deleted]);

                    //Clears the objects and increases the number of imported rows
                    rowlist[i] = {};
                    importedRows.value++;
                }

            }, function errorCB(tx3, err) {
                var msg = tx3.message;
                deferred.resolve(-1);
            }, function successCB() {
                deferred.resolve(1);
            });
        }

        //If no row have been imported creates the table
        if (importedRows.value == 0) {
            db.transaction(function populateDB(tx2) {
                tx2.executeSql('DROP TABLE IF EXISTS TemplateItem', [], function (tx, results) {
                    tx2.executeSql('CREATE TABLE IF NOT EXISTS TemplateItem (Id unique, IdTemplate, IdItemType, ItemTypeName, Name, Label, Mandatory, RegularExpression, ValidationMessage, DefaultValue, Editable, Sort, Other, Deleted)');
                });
            }, function errorCB(tx2, err) {
                var msg = tx2.message;
                deferred.resolve(-1);
            }, function successCB() {
                //Makes que call to import data
                importData();
            });
        } else {
            importData();   //Table has already been created, just import data
        }

        return deferred.promise;
    }

    AddTemplateModules = function (templateModule, ctrlSyncMessages) {
        var dataTi = '';
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS TemplateModule', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS TemplateModule (IdTemplate, IdModule, Sort, DefaultValue, PRIMARY KEY(IdTemplate, IdModule))');
                if (templateModule !== undefined && templateModule.length > 0) {
                    for (var i = 0; i !== templateModule.length; ++i) {
                        var sql = 'INSERT INTO TemplateModule (IdTemplate, IdModule, Sort, DefaultValue) VALUES (?, ?, ?, ?)';
                        tx2.executeSql(sql, [templateModule[i].IdTemplate, templateModule[i].IdModule, templateModule[i].Sort, templateModule[i].DefaultValue]);
                        dataTi = 'OK';
                    }
                    result = 1;
                } else {
                    dataTi = 'none';
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var erro = tx2.message;

            dataTi = 'NOK';
            result = -1
            ctrlSyncMessages("import", "AddTemplateModules", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddTemplateModules", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddUserPermissions = function (userPerm, ctrlSyncMessages) {
        var dataTi = '';
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {
            tx2.executeSql('DROP TABLE IF EXISTS UserPermission', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS UserPermission (Id unique, Name, Description)');
                if (userPerm !== undefined && userPerm.length > 0) {
                    for (var i = 0; i !== userPerm.length; ++i) {
                        var sql = 'INSERT INTO UserPermission (Id, Name, Description) VALUES (?, ?, ?)';
                        tx2.executeSql(sql, [userPerm[i].Id, userPerm[i].Name, userPerm[i].Description]);
                        dataTi = 'OK';
                    }
                    result = 1;
                } else {
                    dataTi = 'none';
                    result = 0;
                }
            });

        }, function errorCB(tx2, err) {
            dataTi = 'NOK';
            result = -1
            ctrlSyncMessages("import", "AddUserPermissions", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddUserPermissions", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddCustomerIBAN = function (customerIBAN, ctrlSyncMessages) {
        var dataTi = '';
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS CustomerIBAN', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS CustomerIBAN (IdCustomer, IdDocument, IBAN, IBANImageValidation, Active, CreatedOn)');
                if (customerIBAN !== undefined && customerIBAN.length > 0) {
                    for (var i = 0; i !== customerIBAN.length; ++i) {
                        var sql = 'INSERT INTO CustomerIBAN (IdCustomer, IdDocument, IBAN, IBANImageValidation, Active, CreatedOn) VALUES (?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [customerIBAN[i].IdCustomer, customerIBAN[i].IdDocument, customerIBAN[i].IBAN, customerIBAN[i].IBANImageValidation, customerIBAN[i].Active, customerIBAN[i].CreatedOn]);
                        dataTi = 'OK';
                    }
                    result = 1;
                } else {
                    dataTi = 'none';
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            dataTi = 'NOK';
            result = -1
            ctrlSyncMessages("import", "AddCustomerIBAN", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddCustomerIBAN", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddDocumentTypes = function (documentTypes, ctrlSyncMessages) {
        var dataTi = '';
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS DocumentType', [], function (tx, results) {

                tx2.executeSql('CREATE TABLE IF NOT EXISTS DocumentType (Id unique, DocumentLabelCode, IdWorkflow, Name, Description, Sort, Code, Deleted)');
                if (documentTypes !== undefined && documentTypes.length > 0) {
                    for (var i = 0; i < documentTypes.length; ++i) {
                        var sql = 'INSERT INTO DocumentType (Id, DocumentLabelCode, IdWorkflow, Name, Description, Sort, Code, Deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [documentTypes[i].Id, documentTypes[i].DocumentLabelCode, documentTypes[i].IdDocumentdWorkflow, documentTypes[i].Name, documentTypes[i].Description, documentTypes[i].Sort, documentTypes[i].Code, documentTypes[i].Deleted]);
                        dataTi = 'OK';
                    }
                    result = 1;
                } else {
                    dataTi = 'none';
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            dataTi = 'NOK';
            result = -1
            ctrlSyncMessages("import", "AddDocumentTypes", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddDocumentTypes", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddDocumentTypeModules = function (documentTypeModules, ctrlSyncMessages) {
        var dataTi = '';
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS DocumentTypeModule', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS DocumentTypeModule (IdDocumentType, IdModule, Sort, PRIMARY KEY (IdDocumentType, IdModule))');
                if (documentTypeModules !== undefined && documentTypeModules.length > 0) {
                    for (var i = 0; i !== documentTypeModules.length; ++i) {
                        var sql = 'INSERT INTO DocumentTypeModule (IdDocumentType, IdModule, Sort) VALUES (?, ?, ?)';
                        tx2.executeSql(sql, [documentTypeModules[i].IdDocumentType, documentTypeModules[i].IdModule, documentTypeModules[i].Sort]);
                        dataTi = 'OK';
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            dataTi = 'NOK';
            result = -1
            ctrlSyncMessages("import", "AddDocumentTypeModules", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddDocumentTypeModules", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddMarkets = function (markets, ctrlSyncMessages) {
        var dataTi = '';
        var deferred = $q.defer();
        var result = undefined;

        console.log()

        db.transaction(function populateDB(tx2) {
            tx2.executeSql('DROP TABLE IF EXISTS Market', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS Market (Id unique, Language, Code, DocumentLabelCode, Name)');
                if (markets !== undefined && markets.length > 0) {
                    for (var i = 0; i !== markets.length; ++i) {
                        var sql = 'INSERT INTO Market (Id, Language, Code, DocumentLabelCode, Name) VALUES (?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [markets[i].Id, markets[i].LanguageCode, markets[i].Code, markets[i].DocumentLabelCode, markets[i].Name]);
                        dataTi = 'OK';
                    }
                    result = 1;
                } else {
                    dataTi = 'none';
                    result = 0;
                }

            });
        }, function errorCB(tx2, err) {
            dataTi = 'NOK';
            result = -1
            //ctrlSyncMessages("import", "AddMarkets", evaluateResult(result)); //Does not have this field in the messages view
            deferred.resolve(result);
        }, function successCB() {
            //ctrlSyncMessages("import", "AddMarkets", evaluateResult(result)); //Does not have this field in the messages view
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddTemplateGeography = function (templateGeography, ctrlSyncMessages) {
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS TemplateGeography', [], function (tx, results) {


                tx2.executeSql('CREATE TABLE IF NOT EXISTS TemplateGeography (IdTemplate, IdGeography, PRIMARY KEY (IdTemplate, IdGeography))');
                if (templateGeography !== undefined && templateGeography.length > 0) {
                    for (var i = 0; i !== templateGeography.length; ++i) {
                        var sql = 'INSERT INTO TemplateGeography (IdTemplate, IdGeography) VALUES (?, ?)';
                        tx2.executeSql(sql, [templateGeography[i].IdTemplate, templateGeography[i].IdGeography]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddTemplateGeography", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddTemplateGeography", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddTemplateBodyConstant = function (templateBodyConstant, ctrlSyncMessages) {
        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS TemplateBodyConstant', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS TemplateBodyConstant (Id Unique, Name, DB_Table, DB_Column, Sort)');
                if (templateBodyConstant !== undefined && templateBodyConstant.length > 0) {
                    for (var i = 0; i !== templateBodyConstant.length; ++i) {
                        var sql = 'INSERT INTO TemplateBodyConstant (Id, Name, DB_Table, DB_Column, Sort) VALUES (?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [templateBodyConstant[i].Id, templateBodyConstant[i].Name, templateBodyConstant[i].Table, templateBodyConstant[i].Column, templateBodyConstant[i].Sort]);
                    }
                    result = 1;
                } else {
                    ctrlSyncMessages("import", "AddTemplateBodyConstant", evaluateResult(0))
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddTemplateBodyConstant", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddTemplateBodyConstant", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddGeography = function (geographyList, ctrlSyncMessages) {

        var geography = $.map(geographyList, function (el) { return el; })

        for (var i = geography.length - 1; i >= 0; i--) {
            if (geography[i].remove == 1) {
                geography.splice(i, 1);
            }
        }

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Geography', [], function (tx, results) {

                tx2.executeSql('CREATE TABLE IF NOT EXISTS Geography (Id Unique, IdGeography, Code, Description, Deleted)');
                if (geography !== undefined && geography.length > 0) {
                    for (var i = 0; i !== geography.length; ++i) {
                        var sql = 'INSERT INTO Geography (Id, IdGeography, Code, Description, Deleted) VALUES (?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [geography[i].Id, geography[i].IdGeography, geography[i].Code, geography[i].Description, geography[i].Deleted]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddGeography", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddGeography", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddUserGeography = function (geographyList, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS UserGeography', [], function (tx, results) {

                tx2.executeSql('CREATE TABLE IF NOT EXISTS UserGeography (Id Unique, IdGeography, Code, Description, ChildGeos, Deleted)');
                if (geographyList !== undefined && geographyList.length > 0) {
                    for (var i = 0; i !== geographyList.length; ++i) {
                        var sql = 'INSERT INTO UserGeography (Id, IdGeography, Code, Description, ChildGeos, Deleted) VALUES (?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [geographyList[i].IdGuid, geographyList[i].IdGeography, geographyList[i].code, geographyList[i].name, geographyList[i].children, geographyList[i].remove]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddUserGeography", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddUserGeography", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddWorkflow = function (workflowList, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS Workflow', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS Workflow (Id Unique, Name, Description, Deleted)');
                if (workflowList !== undefined && workflowList.length > 0) {
                    for (var i = 0; i !== workflowList.length; ++i) {
                        var sql = 'INSERT INTO Workflow (Id, Name, Description, Deleted) VALUES (?, ?, ?, ?)';
                        tx2.executeSql(sql, [workflowList[i].Id, workflowList[i].Name, workflowList[i].Description, workflowList[i].Deleted]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddWorkflow", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddWorkflow", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddWorkflowStep = function (workflowStepList, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS WorkflowStep', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS WorkflowStep (IdWorkflow, Step1, Step2, Action, Frontend, PRIMARY KEY(IdWorkflow, Step1, Step2))');
                if (workflowStepList !== undefined && workflowStepList.length > 0) {
                    for (var i = 0; i !== workflowStepList.length; ++i) {
                        var sql = 'INSERT INTO WorkflowStep (IdWorkflow, Step1, Step2, Action, Frontend) VALUES (?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [workflowStepList[i].IdWorkflow, workflowStepList[i].Step1, workflowStepList[i].Step2, workflowStepList[i].Action, workflowStepList[i].Frontend]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddWorkflowStep", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddWorkflowStep", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddDocumentDocument = function (documentDocument, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS DocumentDocument', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS DocumentDocument (IdDocument1, IdDocument2, PRIMARY KEY(IdDocument1, IdDocument2))');
                if (documentDocument !== undefined && documentDocument.length > 0) {
                    for (var i = 0; i !== documentDocument.length; ++i) {
                        var sql = 'INSERT INTO DocumentDocument (IdDocument1, IdDocument2) VALUES (?, ?)';
                        tx2.executeSql(sql, [documentDocument[i].IdDocument1, documentDocument[i].IdDocument2]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }
            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddDocumentDocument", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddDocumentDocument", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddUploadedImages = function (rowlist, importedRows) {

        var deferred = $q.defer()

        var importData = function () {

            db.transaction(function (tx3) {
                for (var i = 0; i !== rowlist.length; ++i) {

                    var sql = 'INSERT INTO UploadedImages (Id, IdMarket, Code, FileData, FileName, IsDefault) VALUES (?, ?, ?, ?, ?, ?)';
                    tx3.executeSql(sql, [rowlist[i].Id, rowlist[i].IdMarket, rowlist[i].Code, rowlist[i].FileData, rowlist[i].FileName, rowlist[i].IsDefault]);

                    //Clears the objects and increases the number of imported rows
                    rowlist[i] = {};
                    importedRows.value++;
                }

            }, function errorCB(tx3, err) {
                deferred.resolve(-1);
            }, function successCB() {
                deferred.resolve(1);
            });
        }

        //If no row have been imported creates the table
        if (importedRows.value == 0) {
            db.transaction(function populateDB(tx2) {
                tx2.executeSql('DROP TABLE IF EXISTS UploadedImages', [], function (tx, results) {
                    tx2.executeSql('CREATE TABLE IF NOT EXISTS UploadedImages (Id unique, IdMarket, Code, FileData, FileName, IsDefault)');
                });
            }, function errorCB(tx2, err) {
                deferred.resolve(-1);
            }, function successCB() {
                //Makes que call to import data
                importData();
            });
        } else {
            importData();   //Table has already been created, just import data
        }

        return deferred.promise;
    }

    AddWorkflowHistory = function (workflowHistory, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS WorkflowHistory', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS WorkflowHistory (Id unique, IdDocument, IdStep1, IdStep2, Action, Comment, CreatedOn, CreatedBy)');
                if (workflowHistory !== undefined && workflowHistory.length > 0) {
                    for (var i = 0; i !== workflowHistory.length; ++i) {
                        var sql = 'INSERT INTO WorkflowHistory (Id, IdDocument, IdStep1, IdStep2, Action, Comment, CreatedOn, CreatedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [workflowHistory[i].Id, workflowHistory[i].IdDocument, workflowHistory[i].IdStep1, workflowHistory[i].IdStep2, workflowHistory[i].Action, (workflowHistory[i].Comment == 'null' || workflowHistory[i].Comment == null || workflowHistory[i].Comment == undefined ? '' : workflowHistory[i].Comment), workflowHistory[i].CreatedOn, workflowHistory[i].CreatedBy]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddWorkflowHistory", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddWorkflowHistory", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddBudgetAccount = function (budgetAccount, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS BudgetAccount', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS BudgetAccount (Id unique, Name, Deleted)');
                if (budgetAccount !== undefined && budgetAccount.length > 0) {
                    for (var i = 0; i !== budgetAccount.length; ++i) {
                        var sql = 'INSERT INTO BudgetAccount (Id, Name, Deleted) VALUES (?, ?, ?)';
                        tx2.executeSql(sql, [budgetAccount[i].Id, budgetAccount[i].Name, budgetAccount[i].Deleted]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddBudgetAccount", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddBudgetAccount", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddDocumentItemValue = function (documentItemValue, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS DocumentItemValue', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS DocumentItemValue (IdDocument, IdTemplateItem, Value, CreatedOn, CreatedBy, PRIMARY KEY(IdDocument, IdTemplateItem))');
                if (documentItemValue !== undefined && documentItemValue.length > 0) {
                    for (var i = 0; i !== documentItemValue.length; ++i) {
                        var sql = 'INSERT INTO DocumentItemValue (IdDocument, IdTemplateItem, Value, CreatedOn, CreatedBy) VALUES (?, ?, ?, ?, ?)';
                        tx2.executeSql(sql, [documentItemValue[i].IdDocument, documentItemValue[i].IdTemplateItem, documentItemValue[i].Value, documentItemValue[i].CreatedOn, documentItemValue[i].CreatedBy]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddDocumentItemValue", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddDocumentItemValue", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddDocumentNumber = function (documentNumber, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS DocumentNumber', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS DocumentNumber (Id unique, IdDocument)');
                if (documentNumber !== undefined && documentNumber.length > 0) {
                    for (var i = 0; i !== documentNumber.length; ++i) {
                        var sql = 'INSERT INTO DocumentNumber (Id, IdDocument) VALUES (?, ?)';
                        tx2.executeSql(sql, [documentNumber[i].ID, documentNumber[i].IDDocument]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddDocumentNumber", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddDocumentNumber", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddTemplateImage = function (templateImage, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS TemplateImage', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS TemplateImage (IdTemplate, IdUploadedImage)');
                if (templateImage !== undefined && templateImage.length > 0) {
                    for (var i = 0; i !== templateImage.length; ++i) {
                        var sql = 'INSERT INTO TemplateImage (IdTemplate, IdUploadedImage) VALUES (?, ?)';
                        tx2.executeSql(sql, [templateImage[i].IdTemplate, templateImage[i].IdUploadedImage]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddTemplateImage", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddTemplateImage", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    AddImportedAgreement = function (importedAgreement, ctrlSyncMessages) {

        var deferred = $q.defer();
        var result = undefined;

        db.transaction(function populateDB(tx2) {

            tx2.executeSql('DROP TABLE IF EXISTS ImportedAgreement', [], function (tx, results) {
                tx2.executeSql('CREATE TABLE IF NOT EXISTS ImportedAgreement (Id,IdMarket,CustomerCode,CustomerName,CustomerRegisteredName,Territory,BrandBuilder,DDType,Template,Offer,City,Col1,Col2,Col3,Col4,Col5,Signed,Discarded,Deleted,CreatedOn,ModifiedOn,CreatedBy,ModifiedBy)');
                if (importedAgreement !== undefined && importedAgreement.length > 0) {
                    for (var i = 0; i !== importedAgreement.length; ++i) {
                        var sql = 'INSERT INTO ImportedAgreement (Id,IdMarket,CustomerCode,CustomerName,CustomerRegisteredName,Territory,BrandBuilder,DDType,Template,Offer,City,Col1,Col2,Col3,Col4,Col5,Signed,Discarded,Deleted,CreatedOn,ModifiedOn,CreatedBy,ModifiedBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                        tx2.executeSql(sql, [importedAgreement[i].Id, importedAgreement[i].IdMarket, importedAgreement[i].CustomerCode, importedAgreement[i].CustomerName, importedAgreement[i].CustomerRegisteredName, importedAgreement[i].Territory, importedAgreement[i].BrandBuilder, importedAgreement[i].DDType, importedAgreement[i].Template, importedAgreement[i].Offer, importedAgreement[i].City, importedAgreement[i].Col1, importedAgreement[i].Col2, importedAgreement[i].Col3, importedAgreement[i].Col4, importedAgreement[i].Col5, importedAgreement[i].Signed, importedAgreement[i].Discarded, importedAgreement[i].Deleted, importedAgreement[i].CreatedOn, importedAgreement[i].ModifiedOn, importedAgreement[i].CreatedBy, importedAgreement[i].ModifiedBy]);
                    }
                    result = 1;
                } else {
                    result = 0;
                }

            });


        }, function errorCB(tx2, err) {
            var msg = tx2.message;
            result = -1
            ctrlSyncMessages("import", "AddImportedAgreement", evaluateResult(result));
            deferred.resolve(result);
        }, function successCB() {
            ctrlSyncMessages("import", "AddImportedAgreement", evaluateResult(result));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    getUserGeographies = function () {
        var deferred = $q.defer()
        var data = [];
        var localGeo = ""

        db.transaction(function populateDB(tx) {
            tx.executeSql('SELECT Code from UserGeography', [], function (tr, rs2) {
                var dataset = rs2.rows;
                for (var i = dataset.length - 1; i >= 0; i--) {
                    data[i] = dataset.item(i);
                }

                localGeo = Enumerable.From(data).OrderBy(function (x) { return x.Code }).Select(function (x) { return x.Code }).ToArray();
                localGeo = localGeo.join(",");
                deferred.resolve(localGeo);
            });
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    setUserChangedGeo = function (user, IsChanged) {
        var deferred = $q.defer()

        db.transaction(function populateDB(tx) {
            tx.executeSql('UPDATE User SET isGeographyChanged = "' + IsChanged + '" WHERE Code = "' + user + '"');
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    setUserExpired = function (user, IsExpired) {
        var deferred = $q.defer()

        db.transaction(function populateDB(tx) {
            tx.executeSql('UPDATE User SET expired = "' + IsExpired + '" WHERE Code = "' + user + '"');
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    queryForScript = function (sql) {
        var deferred = $q.defer();

        db.transaction(function populateDB(tx) {
            tx.executeSql(sql, [], function (tr, rs2) {
                var array = [];

                for (var index = 0; index < rs2.rows.length; index++) {
                    array.push(rs2.rows.item(index));
                }

                deferred.resolve(array);
            });
        }, function (tx, error) {
            deferred.resolve(error);
        });


        return deferred.promise;

    }

    getIdDocument = function (idDocument) {
        return new Promise(resolve => {
            resolve(idDocument);
        });
    }

    getDraftDocuments = function () {
        var deferred = $q.defer();
        var documents = [];
        var step = 0;

        //Get all Draft Documents

        db.transaction(function populateDB(tx) {
            tx.executeSql("SELECT * FROM Document WHERE IdStep IN (2, 18, 19, 4, 5)", [], function (tx, rs) {
                step = rs.rows.length;
                if (rs.rows.length == 0) {
                    deferred.resolve(documents);
                }
                for (var i = 0; i < rs.rows.length; i++) {
                    var document = rs.rows.item(i);
                    document.SignatureType = document.SignatureType == 'null' ? null : document.SignatureType;
                    documents.push({ document: document });
                }

                for (var i = 0; i < rs.rows.length; i++) {
                    $q.all([
                        this.queryForScript("SELECT * FROM DocumentModuleValue WHERE IdDocument = '" + documents[i].document.Id + "'"),
                        this.queryForScript("SELECT * FROM DocumentDocument WHERE IdDocument2 = '" + documents[i].document.Id + "'"),
                        this.queryForScript("SELECT * FROM WorkflowHistory WHERE IdDocument = '" + documents[i].document.Id + "'"),
                        this.queryForScript("SELECT * FROM DocumentItemValue WHERE IdDocument = '" + documents[i].document.Id + "'"),
                        getIdDocument(documents[i].document.Id)
                    ]).then(function (data) {
                        let index = documents.findIndex(x => x.document.Id == data[4]);

                        documents[index].documentModuleValue = data[0];
                        documents[index].documentDocument = data[1];
                        documents[index].workflowHistory = data[2];
                        documents[index].documentItemValue = data[3];

                        step--;
                        if (step == 0) {
                            deferred.resolve(documents);
                        }
                    }, function (tx, error) {
                        deferred.resolve(error);
                    });
                }

            })
        }, function (tx, error) {
            deferred.resolve(error);
        });

        return deferred.promise;
    }

    removeDeletedDocuments = function () {
        var deferred = $q.defer()

        db.transaction(function populateDB(tx) {
            var str = 'DELETE FROM DocumentModuleValue WHERE IdDocument IN (SELECT Id FROM Document WHERE IdStep = 18)';
            var str2 = 'DELETE FROM DocumentDocument WHERE IdDocument2 IN (SELECT Id FROM Document WHERE IdStep = 18)';
            var str3 = 'DELETE FROM Document WHERE IdStep = 18';

            tx.executeSql(str, [], function (tx2, results) {
                tx.executeSql(str2, [], function (tx2, results) {
                    tx.executeSql(str3, [], function (tx2, results) {
                        deferred.resolve(1);
                    })
                })
            });
        }, function errorCB(tx, err) {
            console.log(err);
            deferred.resolve(-1);
        }, function successCB() {
            deferred.resolve(1);
        });

        return deferred.promise;
    }

    getSelectedTemplateReplaced = function (IdCustomer, ReplacedTemplate, documentId) {
        var sql = "select "+
        "dn.ID documentNumber,"+
        "(SELECT Value FROM DocumentModuleValue dm1 WHERE IdModule = (SELECT Id FROM Module WHERE Code = 'clnt') AND dm1.IdDocument = dc.id) customer,"+
        "(SELECT Value FROM DocumentModuleValue dm2 WHERE IdModule = (SELECT Id FROM Module WHERE Code = 'ag_mstrdtl') AND dm2.IdDocument = dc.id) master,"+
        "tp.Name documentTemplate,"+
        "dc.CreatedOn creationDate,"+
        "dc.IdStep,"+
        "dc.Id,"+
        "st.Name status "+
        "FROM Document dc "+
        "LEFT JOIN DocumentNumber dn ON dn.IDDocument = dc.Id "+
        "INNER JOIN Template tp ON dc.IdTemplate = tp.Id "+
        "INNER JOIN Step st ON dc.IdStep = st.Id "+
        "WHERE dc.IdTemplate IN (" + ReplacedTemplate + ") AND dc.IdStep NOT IN (9, 10, 11, 7, 5)";

        if(documentId != ''){
            sql += " AND dc.Id != '"+ documentId + "'"
        }
        var deferred = $q.defer()
        db.transaction(function populateDB(tx) {
            tx.executeSql(sql, [], function (tr, rs2) {
                var dataset = rs2.rows;
                var data = [];
                for (var i = dataset.length - 1; i >= 0; i--) {
                    let documentNumber = dataset.item(i).documentNumber;
                    let customer = JSON.parse(dataset.item(i).customer);
                    let master = JSON.parse(dataset.item(i).master);
                    let documentTemplate = dataset.item(i).documentTemplate
                    let creationDate = dataset.item(i).creationDate;
                    let status = dataset.item(i).status;
                    let idStep = dataset.item(i).IdStep;
                    let id = dataset.item(i).Id;
                    data[i] = {
                        IdCustomer: customer.Id,
                        documentNumber: documentNumber,
                        documentTemplate: documentTemplate,
                        creationDate: creationDate,
                        status: status,
                        startDate: master.StartDate,
                        endDate: master.EndDate,
                        idStep: idStep,
                        id: id
                    }
                }

                data = data.filter(x => x.IdCustomer == IdCustomer);
                deferred.resolve(data);
            });
        }, function errorCB(tx, err) {
            deferred.resolve(-1);
        }, function successCB() {

        });

        return deferred.promise;
    }

    return {
        getLocalUser: getLocalUser,
        AddUserToLocal: AddUserToLocal,
        AddLoginError: AddLoginError,
        GetNumberAttemps: GetNumberAttemps,
        ResetLoginError: ResetLoginError,
        UpdatePassword, UpdatePassword,
        setUserReset: setUserReset,
        AddServerVersion: AddServerVersion,
        GetLocalFrontendVersion: GetLocalFrontendVersion,
        doSync: doSync,
        updateSync: updateSync,
        AddCustomer: AddCustomer,
        AddConfiguration: AddConfiguration,
        AddDocuments: AddDocuments,
        AddDocumentValues: AddDocumentValues,
        AddDocumentModules: AddDocumentModules,
        AddModuleObjectives: AddModuleObjectives,
        AddSteps: AddSteps,
        AddTemplates: AddTemplates,
        AddTemplateItems: AddTemplateItems,
        AddTemplateModules: AddTemplateModules,
        AddUserPermissions: AddUserPermissions,
        AddCustomerIBAN: AddCustomerIBAN,
        AddDocumentTypes: AddDocumentTypes,
        AddDocumentTypeModules: AddDocumentTypeModules,
        AddMarkets: AddMarkets,
        AddTemplateGeography: AddTemplateGeography,
        AddTemplateBodyConstant: AddTemplateBodyConstant,
        AddGeography: AddGeography,
        AddUserGeography: AddUserGeography,
        AddWorkflow: AddWorkflow,
        AddWorkflowStep: AddWorkflowStep,
        AddDocumentDocument: AddDocumentDocument,
        AddUploadedImages: AddUploadedImages,
        AddWorkflowHistory: AddWorkflowHistory,
        AddBudgetAccount: AddBudgetAccount,
        AddDocumentItemValue: AddDocumentItemValue,
        AddDocumentNumber: AddDocumentNumber,
        AddTemplateImage: AddTemplateImage,
        AddImportedAgreement: AddImportedAgreement,
        getUserGeographies: getUserGeographies,
        setUserChangedGeo: setUserChangedGeo,
        setUserExpired: setUserExpired,
        queryForScript: queryForScript,
        getDraftDocuments: getDraftDocuments,
        removeDeletedDocuments: removeDeletedDocuments,
        getSelectedTemplateReplaced: getSelectedTemplateReplaced
    }
});
