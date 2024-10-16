app.factory('documentLocalData', function ($q, $filter) {

    var db = localDatabase;

    return {
        saveDocument: function (documentArray, username, documentRelationId, workflowGuid, market) {
            var deferred = $q.defer()
            var sqlqueries = "";
            db.transaction(function populateDB(tx) {

                var today = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

                var strDelete = 'DELETE FROM Document WHERE Id = "' + documentArray.Id + '"';

                sqlqueries += "---" + strDelete + "---\n";

                tx.executeSql(strDelete, [], function (tx2, results1) {

                    sqlqueries += "---OK:" + strDelete + "---\n";

                    var strStep = "SELECT Id FROM Step WHERE Code = " + (documentArray.HasClientSignature == true ? "'WaitingForSync'" : "'Draft'");

                    sqlqueries += "---" + strStep + "---\n";

                    tx2.executeSql(strStep, [], function (tx2, resultsStep) {

                        sqlqueries += "---OK:" + strStep + "---\n";

                        var IdStep = 0;
                        var dataset = resultsStep.rows;
                        for (var i = 0; i != dataset.length; ++i) {
                            IdStep = dataset.item(i);
                        }

                        var idbudget = null;
                        if (documentArray.IdBudget != null) idbudget = '\"' + documentArray.IdBudget + '\"';

                        //var today = new Date();
                        //CREATE NEW DOCUMENT
                        var str = 'INSERT INTO Document (Id, IdStep, IdTemplate, IdDocumentType, Deleted, CreatedOn, CreatedBy, IdGeography, IdBudget, Commentary, SignatureType, SignatureStatus, Email, EmailRepresentative, CustomerSignature, CustomerRepresentativeSignature) VALUES ' +
                            '("' + documentArray.Id + '",' +
                            IdStep.Id + ',' +
                            //4 + ',' +
                            documentArray.IdTemplate + ',' +
                            documentArray.IdDocumentType + ',' +
                            0 + ',' +
                            "'" + today + "', " +
                            "'" + username + "',";

                        str += documentArray.IdGeography != null ? '"' + documentArray.IdGeography + '",' : 'null,';
                        str += documentArray.IdBudget != null ? '"' + documentArray.IdBudget + '",' : 'null,';
                        str += (documentArray.Comment != null && documentArray.Comment != undefined) ? "'" + documentArray.Comment.replace(/'/g, "''") + '",' : 'null,';
                        str += "'" + documentArray.SignatureType + "'" + ","
                        str += "'" + documentArray.SignatureStatus + "'" + ","
                        str += "'" + documentArray.Email + "'" + ","
                        str += "'" + documentArray.EmailRepresentative + "'" + ","
                        str += "'" + documentArray.CustomerSignature + "'" + ","
                        str += "'" + documentArray.CustomerRepresentativeSignature + "'"
                        str += ')';

                        sqlqueries += "---" + str + "---\n";

                        tx2.executeSql(str, [], function (tx3, results2) {

                            sqlqueries += "---OK:" + str + "---\n";

                            strDelete = 'DELETE FROM DocumentModuleValue WHERE IdDocument = "' + documentArray.Id + '"';
                            sqlqueries += "---" + strDelete + "---\n";

                            tx3.executeSql(strDelete, [], function (tx4, results3) {

                                sqlqueries += "---OK:" + strDelete + "---\n";

                                //if (documentArray.HasClientSignature == true) {
                                if (documentRelationId != null && documentRelationId != undefined && documentRelationId != '') {
                                    var strDocRelation = "INSERT OR REPLACE INTO DocumentDocument (IdDocument1, IdDocument2) VALUES " +
                                        '("' + documentRelationId + '",' + '"' + documentArray.Id + '")';

                                    sqlqueries += "---" + strDocRelation + "---\n";

                                    tx4.executeSql(strDocRelation, [], function (tx, results6) {

                                        sqlqueries += "---OK:" + strDocRelation + "---\n";
                                        var teste = "asfsdf";


                                    });
                                }
                                //}

                                for (var i = 0; i != documentArray.DocumentModuleValues.length; ++i) {
                                    var documentModule = documentArray.DocumentModuleValues[i];


                                    if (documentArray.HasClientSignature == true && documentModule.Value != undefined && documentModule.Value != null) {
                                        documentModule.Value = documentModule.Value.replace('<button id=\\"btnSignatureCR\\" style=\\"width:100px;height:80px;background-color:white;\\" ng-click=\\"openModal(&quot;cr&quot;)\\">Add Customer Representative Signature</button>', ' ');
                                        //documentModule.Value = documentModule.Value.replace('>Add Image</button>', ' style=\\"display:none;\\";>Add Image</button>');
                                    }

                                    //if (documentModule.IdModule == 7) {
                                    var strDocMod = "INSERT INTO DocumentModulevalue (IdDocument, IdModule, Value) VALUES " +
                                        "('" + documentArray.Id + "'," +
                                        documentModule.IdModule + "," +
                                        "'" + (documentModule.Value != undefined && documentModule.Value != null ? documentModule.Value.toString().replace(/'/g, "''") : "[]") + "'" +
                                        ")";

                                    sqlqueries += "---" + strDocMod + "---\n";

                                    tx4.executeSql(strDocMod, [], function (tx5, results5) {
                                        var teste = "asfsdf";
                                        sqlqueries += "---OK:" + strDocMod + "---\n";
                                    });
                                    //}
                                }

                                //deferred.resolve(results2.insertId);
                            });

                            strDelete = 'DELETE FROM DocumentItemValue WHERE IdDocument = "' + documentArray.Id + '"';

                            sqlqueries += "---" + strDelete + "---\n";

                            tx3.executeSql(strDelete, [], function (tx4, results3) {

                                sqlqueries += "---OK:" + strDelete + "---\n";

                                for (var i = 0; i != documentArray.DocumentItemValues.length; ++i) {
                                    var documentModuleItemValue = documentArray.DocumentItemValues[i];


                                    //(IdDocument, IdTemplateItem, Value, CreatedOn, CreatedBy) VALUES (?, ?, ?, ?, ?)
                                    //if (documentModule.IdModule == 7) {
                                    var strDocMod = "INSERT INTO DocumentItemValue (IdDocument, IdTemplateItem, Value, CreatedOn, CreatedBy) VALUES " +
                                        "('" + documentArray.Id + "'," +
                                        documentModuleItemValue.IdTemplateItem + "," +
                                        "'" + (documentModuleItemValue.Value != null && documentModuleItemValue.Value != undefined ? documentModuleItemValue.Value.toString().replace(/'/g, "''") : "[]") + "'," +
                                        "'" + today + "'," +
                                        "'" + username + "'" +
                                        ")";

                                    sqlqueries += "---" + strDocMod + "---\n";

                                    tx4.executeSql(strDocMod, [], function (tx, results5) {

                                        sqlqueries += "---OK:" + strDocMod + "---\n";
                                        var teste = "asfsdf";

                                    });
                                    //}
                                }

                                //deferred.resolve(results2.insertId);
                            });

                            var isibanstepupdated = false;
                            var idStepIban = 0;
                            if (market == 3 && (documentArray.DocumentTypeCode.indexOf('_Agreement') != -1 || documentArray.DocumentTypeCode.indexOf('_IBAN') != -1) && documentArray.HasClientSignature == true && documentArray.CustomerIBAN != undefined && documentArray.CustomerIBAN.IBAN != null) {

                                //check last clientIban
                                var q = "SELECT IBAN FROM CustomerIBAN WHERE IdCustomer = '" + documentArray.CustomerIBAN.IdCustomer + "' AND Active = 'true' ORDER BY CreatedOn DESC";

                                sqlqueries += "---" + q + "---\n";

                                tx.executeSql(q, [], function (tx, res) {

                                    sqlqueries += "---OK:" + q + "---\n";

                                    var currentIban = '';
                                    var dataset = res.rows;

                                    for (var i = 0; i != dataset.length; ++i) {
                                        currentIban = dataset.item(i);
                                    }

                                    //UPDATE IBAN
                                    if ((currentIban.IBAN != documentArray.CustomerIBAN.IBAN) || documentArray.DocumentTypeCode.indexOf('_IBAN') != -1) { //It always insert the costumer IF THE DOCUMENT IS OF TYPE IBAN

                                        documentArray.IBANChange = true;
                                        //var strDeleteIBAN = 'DELETE FROM CustomerIBAN WHERE IdCustomer = "' + documentArray.CustomerIBAN.IdCustomer + '" and IdDocument = "' + documentArray.Id + '"';

                                        //tx.executeSql(strDeleteIBAN, [], function (tx, resultsIbanDeleted) {

                                        //var qqu = "UPDATE CustomerIBAN SET Active = 'false' where IdCustomer = '" + documentArray.CustomerIBAN.IdCustomer + "'";

                                        //tx.executeSql(qqu, [], function (tx, resultsIbanUpdated) {

                                        var date = new Date();

                                        var strIbanUpdated = 'INSERT INTO CustomerIBAN (IdCustomer, IdDocument, IBAN, IBANImageValidation, Active, CreatedOn) VALUES ' +
                                            '("' + documentArray.CustomerIBAN.IdCustomer + '",' +
                                            '"' + documentArray.Id + '",' +
                                            '"' + documentArray.CustomerIBAN.IBAN + '",' +
                                            '"' + documentArray.CustomerIBAN.IBANImageValidation + '",' +
                                            '"false",' +
                                            '"' + JSON.stringify(new Date()).toString().replace('"', '') +
                                            ')';

                                        sqlqueries += "---" + strIbanUpdated + "---\n";

                                        tx.executeSql(strIbanUpdated, [], function (tx, resultsIbanUpdated) {

                                            sqlqueries += "---OK:" + strIbanUpdated + "---\n";

                                            var qq = "UPDATE Customer SET IBANUpdated = 'true' where Id = '" + documentArray.CustomerIBAN.IdCustomer + "'";

                                            sqlqueries += "---" + qq + "---\n";

                                            tx.executeSql(qq, [], function (tx, resultsIbanUpdated) {

                                                sqlqueries += "---OK:" + qq + "---\n";

                                                var strStepIban = "SELECT Id FROM Step WHERE Code = 'PendingIBAN'";

                                                sqlqueries += "---" + strStepIban + "---\n";
                                                if (documentArray.DocumentTypeCode.indexOf('_Agreement') != -1) {
                                                    tx.executeSql(strStepIban, [], function (tx, resultStepIban) {

                                                        sqlqueries += "---OK:" + strStepIban + "---\n";

                                                        var IdStepIban = 0;
                                                        var dataset = resultStepIban.rows;
                                                        for (var i = 0; i != dataset.length; ++i) {
                                                            IdStepIban = dataset.item(i);
                                                        }

                                                        var strUpdateDocStep = "UPDATE Document Set IdStep = " + IdStepIban.Id + " WHERE Id = '" + documentArray.Id + "'";
                                                        sqlqueries += "---" + strUpdateDocStep + "---\n";

                                                        tx.executeSql(strUpdateDocStep, [], function (tx, resultDoc) {

                                                            sqlqueries += "---OK:" + strUpdateDocStep + "---\n";

                                                            var str = 'Insert into WorkflowHistory (Id, IdDocument,IdStep1,IdStep2,Action,Comment, CreatedOn, CreatedBy) Values ("'
                                                                + workflowGuid + '","' + documentArray.Id + '",' + documentArray.IdStep + ',' + IdStepIban.Id + ',"","' + ' ' + '","' + today + '","' + username + '")';

                                                            sqlqueries += "---" + str + "---\n";
                                                            tx.executeSql(str, [], function (tx, results) {
                                                                sqlqueries += "---OK:" + str + "---\n";
                                                            });

                                                        });
                                                    });
                                                }

                                            });
                                        });


                                        //});
                                        //});
                                    }
                                    else {

                                        var str = 'Insert into WorkflowHistory (Id, IdDocument,IdStep1,IdStep2,Action,Comment, CreatedOn, CreatedBy) Values ("'
                                            + workflowGuid + '","' + documentArray.Id + '",' + documentArray.IdStep + ',' + IdStep.Id + ',"","' + ' ' + '","' + today + '","' + username + '")';

                                        sqlqueries += "---" + str + "---\n";

                                        tx.executeSql(str, [], function (tx, results) {
                                            sqlqueries += "---OK:" + str + "---\n";
                                        });
                                    }
                                });




                            }
                            else {
                                //var str = 'Insert into WorkflowHistory Id, IdDocument,IdStep1,IdStep2,Action,Comment, CreatedOn, CreatedBy) Values ("'
                                var str = 'Insert into WorkflowHistory (Id, IdDocument,IdStep1,IdStep2,Action,Comment, CreatedOn, CreatedBy) Values ("'
                                    + workflowGuid + '","' + documentArray.Id + '",' + documentArray.IdStep + ',' + IdStep.Id + ',"","' + ' ' + '","' + today + '","' + username + '")';

                                sqlqueries += "---" + str + "---\n";

                                tx.executeSql(str, [], function (tx, results) {
                                    sqlqueries += "---OK:" + str + "---\n";
                                });
                            }

                            //if (documentArray.DocumentTypeCode.indexOf('_Agreement') != -1 && documentArray.Client != undefined) {

                            //    var str = 'UPDATE Customer ' +
                            //              'SET Telephone = "' + documentArray.Client.Telephone + '", ' +
                            //              'Email = "' + documentArray.Client.Email + '", ' +
                            //              'IBANUpdated = "' + documentArray.Client.IBANUpdated + '"';

                            //    //(documentArray.Client.IBANUpdated) ? str += '1 ' : str += '0 ';

                            //    str += ' WHERE Id = "' + documentArray.Client.Id + '"';

                            //    tx.executeSql(str, [], function (tx, results) {

                            //    });
                            //}

                            //insert history
                            //var str = 'Insert into WorkflowHistory (Id, IdDocument,IdStep1,IdStep2,Action,Comment, CreatedOn, CreatedBy) Values ("'
                            //            + workflowGuid + '","' + documentArray.Id + '",' + documentArray.IdStep + ',' + IdStep.Id + ',"","' + ' ' + '","' + today + '","' + username + '")';
                            //tx.executeSql(str, [], function (tx, results) {

                            //});


                            //update digital declaration
                            if (documentArray.HasClientSignature == true && (documentArray.DocumentTypeCode.indexOf("_DigitalAgreement") !== -1)) {
                                var str = "Update ImportedAgreement set signed = 'true' where Id = " + documentArray.DD.Id;

                                sqlqueries += "---" + str + "---\n";

                                tx.executeSql(str, [], function (tx, results) {
                                    sqlqueries += "---OK:" + str + "---\n";
                                });
                            }

                        });


                    });

                });


            }, function errorCB(tx, err) {
                var tt = tx.message;
                sqlqueries += "---ERROR: " + tt + "---\n";
                deferred.resolve(-1);
                return true;
            }, function successCB() {
                deferred.resolve(1);
            });

            return deferred.promise;
        },
        deleteDocument: function (document) {
            var deferred = $q.defer();
            //var db = localDatabase;

            db.transaction(function populateDB(tx) {
                /*
                var str = 'DELETE FROM DocumentModuleValue WHERE IdDocument = "' + document + '"';
                var str2 = 'DELETE FROM Document WHERE ID =  "' + document + '"';
                var str3 = 'DELETE FROM DocumentDocument WHERE IdDocument2 =  "' + document + '"';
                */

                var str = "DELETE FROM DocumentModuleValue WHERE IdDocument IN (";
                var str2 = "DELETE FROM Document WHERE ID IN (";
                var str3 = "DELETE FROM DocumentDocument WHERE IdDocument2 IN (";

                for (var i = 0; i < document.length; i++) {
                    str += "'" + document[i] + "',";
                    str2 += "'" + document[i] + "',";
                    str3 += "'" + document[i] + "',";
                }

                str = str.slice(0, -1) + ")";
                str2 = str2.slice(0, -1) + ")";
                str3 = str3.slice(0, -1) + ")";

                console.log(str); console.log(str);
                console.log(str); console.log(str2);
                console.log(str); console.log(str3);

                tx.executeSql(str, [], function (tx2, results) {
                    tx.executeSql(str2, [], function (tx2, results) {
                        tx.executeSql(str3, [], function (tx2, results) {
                            deferred.resolve('Elimino');
                        })
                    })
                });
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

        }
    }
});

app.controller('CreateDocumentController', CreateDocumentController);

function CreateDocumentController($sessionStorage, $scope, $location, updateData, documentLocalData, $q) {
    var vm = this;
    vm.documenttypemodules = [];
    vm.modules = [];
    vm.client = undefined;
    vm.emailClient = "";
    vm.emailRepresentative = "";
    vm.stepIndex = 0;
    vm.documenttypemodulesfull = [];
    vm.selectedModule = '';
    vm.template = undefined;
    vm.templateModules = [];
    vm.agreement_masterDetails = undefined;
    vm.periods = undefined;
    vm.objectives = undefined;
    vm.body = undefined;
    vm.budgetaccount = undefined;
    vm.dynamicitems = undefined;
    vm.minimize = true;
    vm.documentModules = [];
    vm.currentUser = $scope.globals.currentUser;
    vm.clientIBAN = undefined;
    vm.selectedBudgetAccount = undefined;
    vm.buttonEnabled = false;
    vm.needsSignatureCustomer = false;
    vm.needsSignatureBusinessBuilder = false;
    vm.images = [];
    vm.documentTypes = [];
    vm.canGoToNextStep = false;
    vm.clientGeography = undefined;
    vm.validations = [];
    vm.selectedDocumentId = '';
    vm.noCustomer = false;
    vm.ddtemplate = undefined;
    vm.alternateGeography = null;
    vm.deleteDocument = [];
    vm.saving = false;
    vm.count = 0;
    $sessionStorage.hasCustomerSignature = false;
    $sessionStorage.hasBBSignature = false;
    $sessionStorage.hasUserPictures = false;

    if ($sessionStorage.Document != undefined) {
        $sessionStorage.documentType = $sessionStorage.Document.DocTypeId;
        if ($sessionStorage.DocumentTypeObj == undefined) {

            $q.all([updateData.GetLocalData("DocumentType", "*")])
                .then(function (result) {
                    vm.documentTypes = Enumerable
                        .From(result[0][1])
                        .Where(function (item) { return item.Code == $sessionStorage.Document.Code; })
                        .ToArray();

                    $sessionStorage.DocumentTypeObj = vm.documentTypes[0];
                });

        }

    }

    $q.all([updateData.GetLocalData("Market", "*", " Where Id = " + vm.currentUser.market)])
        .then(function (result) {
            var market = Enumerable.From(result[0][1])
                .ToArray();
            vm.market = market[0];
        });

    $q.all([updateData.GetLocalData("UploadedImages", "*")])
        .then(function (result) {
            var images = Enumerable.From(result[0][1])
                .ToArray();
            vm.images = images;
        });

    $q.all([updateData.GetLocalData("DocumentType", "*")])
        .then(function (result) {
            vm.documentTypes = Enumerable
                .From(result[0][1])
                .Where(function (item) { return item.Deleted == "false"; })
                .ToArray();
        });


    $q.all([updateData.GetLocalData("Module", "*")])
        .then(function (result) {
            vm.modules = Enumerable.From(result[0][1])
                .Where(function (item) { return item.Deleted === "false"; })
                .ToArray();
            vm.selectFirstModule($sessionStorage.documentType);

        });

    $q.all([updateData.GetLocalData("Geography", "*")])
        .then(function (result) {
            var geography = Enumerable.From(result[0][1])
                .Where(function (item) { return item.Deleted === "false"; })
                .ToArray();

            vm.alternateGeography = geography[0].Id;

        });

    vm.selectModule = function (moduleCode) {
        if (vm.canProceed(moduleCode)) {
            vm.selectedModule = moduleCode;
            vm.selectSpecificStep(moduleCode);
        }
    }

    vm.minmax = function () {
        vm.minimize = !vm.minimize;
    }

    vm.selectFirstModule = function (documentTypeId) {
        $q.all([updateData.GetLocalData("DocumentTypeModule", "*", "WHERE IdDocumentType = " + documentTypeId + " ORDER BY SORT")])
            .then(function (result) {
                vm.documenttypemodules = Enumerable.From(result[0][1]).ToArray();

                for (var i = 0; i !== vm.documenttypemodules.length; ++i) {
                    var arr = Enumerable.From(vm.modules)
                        .Where(function (item) { return item.Id == vm.documenttypemodules[i].IdModule && vm.documenttypemodules[i].IdDocumentType == documentTypeId; })
                        .ToArray();

                    if (arr != null)
                        vm.documenttypemodulesfull.push(arr[0]);
                }
                vm.selectedModule = vm.documenttypemodules[vm.stepIndex].IdModule;
                selectNextModule(vm.documenttypemodules[vm.stepIndex].IdModule);
            });
    }

    vm.selectNextStep = function () {

        if (vm.canGoToNextStep == true) {
            ++vm.stepIndex;
            var documentTypeModule = vm.documenttypemodules[vm.stepIndex];
            selectNextModule(documentTypeModule.IdModule);
            vm.selectedModule = documentTypeModule.IdModule;
            vm.canGoToNextStep = false;
        }

        if (vm.stepIndex >= vm.documenttypemodules.length - 1) {
            vm.buttonEnabled = true;
        }

    }

    vm.selectPrevStep = function () {

        if (vm.documenttypemodulesfull[vm.stepIndex].Code == "bdy" && $sessionStorage.hasCustomerSignature || $sessionStorage.hasBBSignature || $sessionStorage.hasUserPictures) {
            swal({
                title: "Are you sure?",
                text: "If you confirm, you will lose signatures and pictures taken.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm",
                cancelButtonText: "Cancel",
                closeOnConfirm: true,
                closeOnCancel: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        $scope.$apply(function () {
                            if (--vm.stepIndex < 0)
                                vm.stepIndex = 0;
                            var documentTypeModule = vm.documenttypemodules[vm.stepIndex];

                            selectNextModule(documentTypeModule.IdModule);
                            vm.selectedModule = documentTypeModule.IdModule;

                            $sessionStorage.hasCustomerSignature = false;
                            $sessionStorage.hasBBSignature = false;
                            $sessionStorage.hasUserPictures = false;

                        });
                    } else {
                        $scope.$apply(function () {
                            var documentTypeModule = vm.documenttypemodules[vm.stepIndex];

                            selectNextModule(documentTypeModule.IdModule);
                            vm.selectedModule = documentTypeModule.IdModule;
                        });
                    }
                });
        }
        else {
            if (--vm.stepIndex < 0)
                vm.stepIndex = 0;
            var documentTypeModule = vm.documenttypemodules[vm.stepIndex];

            selectNextModule(documentTypeModule.IdModule);
            vm.selectedModule = documentTypeModule.IdModule;
        }



    }

    vm.showPreviousButton = function () {
        if (vm.stepIndex == 0) return false;
        return true;
    }

    vm.showNextButton = function () {
        if (vm.stepIndex >= vm.documenttypemodules.length - 1) return false;
        return true;
    }

    vm.IsEnabled = function () {
        return !vm.buttonEnabled;
    }

    function selectNextModule(moduleId) {

        var temp = Enumerable.From(vm.modules)
            .Where(function (item) { return item.Id === moduleId; })
            .ToArray();

        vm.templateURL = temp[0].DocumentControl;
    }

    vm.selectNextModule = function(moduleId) {

        var temp = Enumerable.From(vm.modules)
            .Where(function (item) { return item.Id === moduleId; })
            .ToArray();

        vm.templateURL = temp[0].DocumentControl;
    }

    vm.selectSpecificStep = function (IdModule) {


        var tempModule = Enumerable.From(vm.documenttypemodules)
            .Where(function (item) { return item.IdModule == IdModule; })
            .ToArray();

        var documentTypeModule = tempModule[0];

        //if (vm.canProceed(documentTypeModule.Code)) {
        selectNextModule(documentTypeModule.IdModule);

        vm.stepIndex = documentTypeModule.Sort;

        vm.selectedModule = documentTypeModule.IdModule;
        //}
        //var documentTypeModule = vm.documenttypemodules[vm.stepIndex++];
        //selectNextModule(documentTypeModule.IdModule);
        //vm.selectedModule = documentTypeModule.IdModule;

    }

    vm.ClearTemplateModules = function (code) {
        var update = false;

        for (var i = 0; i < vm.documenttypemodulesfull.length; ++i) {
            var moduleId = vm.documenttypemodulesfull[i].Id;
            var module = Enumerable.From(vm.modules)
                .Where(function (item) { return item.Id == moduleId; })
                .Select(function (item) { return item; })
                .ToArray();
            if (code == module[0].Code)
                update = true;

            if (update) vm.documentModules[module[0].Code] = undefined;
        }
    }


    vm.SetTemplateModules = function (template) {
        vm.template = template;
        var idDynItms = Enumerable.From(vm.modules)
            .Where(function (item) { return item.Code == 'dynmctms' }).First().Id;
        //MARTELADA ALTERAR
        if ($sessionStorage.Document != undefined) {
            var documentModuleValue = Enumerable.From($sessionStorage.Document.DocumentModuleValues)
                .Where(function (item) { return item.IdModule == idDynItms; })
                .Select(function (item) { return item; })
                .ToArray();
            if (documentModuleValue != undefined && documentModuleValue.length > 0) {
                var temp = jQuery.parseJSON(documentModuleValue[0].Value);
                vm.documentModules["dynmctms"] = temp;
                vm.dynamicitems = temp;
            }


        } else {

            getDynamicItems(template.Id);
        }

        $q.all([updateData.GetLocalData("TemplateModule", "*", "WHERE IdTemplate = " + template.Id + " ORDER BY SORT")])
            .then(function (result) {
                vm.templateModules = Enumerable.From(result[0][1]).ToArray();
                var documentModuleValue = undefined;
                for (var i = 0; i < vm.templateModules.length; ++i) {
                    var moduleId = vm.templateModules[i].IdModule;
                    var module = Enumerable.From(vm.modules)
                        .Where(function (item) { return item.Id == moduleId; })
                        .Select(function (item) { return item; })
                        .ToArray();

                    if ($sessionStorage.Document != undefined) {
                        documentModuleValue = Enumerable.From($sessionStorage.Document.DocumentModuleValues)
                            .Where(function (item) { return item.IdModule == moduleId; })
                            .Select(function (item) { return item; })
                            .ToArray();

                    }

                    switch (module[0].Code) {
                        case "canc_mstrdtl":
                        case "ag_mstrdtl":
                            vm.agreement_masterDetails = jQuery.parseJSON(vm.templateModules[i].DefaultValue);
                            if (documentModuleValue != undefined && documentModuleValue.length > 0) {
                                var temp = jQuery.parseJSON(documentModuleValue[0].Value);
                                vm.documentModules[module[0].Code] = temp;
                            }
                            break;
                        case "clnt_edit":

                            break;
                        case "dynmctms":

                            break;
                        case "ag_prds":
                            vm.periods = jQuery.parseJSON(vm.templateModules[i].DefaultValue);
                            if (documentModuleValue != undefined && documentModuleValue.length > 0) {
                                var temp = jQuery.parseJSON(documentModuleValue[0].Value);
                                vm.documentModules["ag_prds"] = temp;
                            }
                            break;
                        case "bdy":
                            vm.body = jQuery.parseJSON(vm.templateModules[i].DefaultValue);
                            if (documentModuleValue != undefined && documentModuleValue.length > 0) {
                                var temp = jQuery.parseJSON(documentModuleValue[0].Value);
                                vm.documentModules["bdy"] = temp;
                            }
                            break;
                        case "ag_obj":
                            vm.objectives = jQuery.parseJSON(vm.templateModules[i].DefaultValue);
                            if (documentModuleValue != undefined && documentModuleValue.length > 0) {
                                var temp = jQuery.parseJSON(documentModuleValue[0].Value);
                                vm.documentModules["ag_obj"] = temp;
                            }
                            break;
                        case "ag_budget":
                            vm.budgetaccount = jQuery.parseJSON(vm.templateModules[i].DefaultValue);
                            if (documentModuleValue != undefined && documentModuleValue.length > 0) {
                                var temp = jQuery.parseJSON(documentModuleValue[0].Value);
                                vm.documentModules["ag_budget"] = temp;
                            }
                            break;
                    }
                }

                //vm.selectNextStep();
                vm.canGoToNextStep = true;
            });
    }

    function getDynamicItems(templateId) {
        $q.all([updateData.GetLocalData("TemplateItem", "*", "WHERE Deleted = 'false' and IdTemplate = " + templateId + " ORDER BY SORT")])
            .then(function (result) {
                vm.dynamicitems = [];
                var temp = Enumerable.From(result[0][1])
                    .ToArray();
                for (var i = 0; i < temp.length; ++i) {
                    vm.dynamicitems.push(angular.copy(temp[i]));
                }
            });
    }

    vm.Cancel = function () {


        swal({
            title: "Are you sure you want to Cancel Document Creation?",
            text: "You will not be able to recover.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: false
        },
            function (isConfirm) {
                if (isConfirm) {
                    $sessionStorage.documentType = null;
                    $sessionStorage.selectedDocumentId = '';

                    $sessionStorage.Document = undefined;
                    $sessionStorage.DocumentTypeObj = undefined;

                    swal({ title: "Success", text: "Canceled.", type: "success" }, function () {
                        $scope.$apply(function () {
                            $location.path('/home');
                        });
                    });
                    $sessionStorage.IsInCreationMode = false;
                } else {
                    swal("Cancelled", "You can continue Document creation.", "success");
                }
            });

    }

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };



    vm.Save = function () {
        console.log("entra a cambiar la variable");
        console.log(vm.saving);
        vm.buttonEnabled = true;

        if (vm.saving == true) { return; }
        vm.saving = true;
        console.log("entra a guardar");
        vm.count++;
        console.log(vm.saving);
        console.log(vm.count);




        var signature = 0;
        var allSignatures = $scope.$parent.globals.allSignatures;
        var saveAsWaitingForSync = false;
        var SignatureType = null;
        var SignatureStatus = "";
        var HasClientSignature = false;

        // Value 1 = without Signature, Value 2 = iPad and Value 3 = remote
        for (const [key, value] of allSignatures) {
            let sign = parseInt(value);
            if (![2, 3].includes(sign) && key == "customer") {
                SignatureType = null;
                SignatureStatus = '';
                break;
            }
            /*
            if (signature < sign) {
                signature = sign;
            }
            */
            if (sign == 2 && signature < 3) {
                signature = sign;
            }

            if (sign == 3) {
                signature = sign;
            }

        }

        //SignatureStatus: 1 ipad and 2 remote
        switch (signature) {
            case 2:
                SignatureStatus = '1';
                SignatureType = false;
                break;
            case 3:
                SignatureStatus = '0';
                SignatureType = true;
                break;
            default:
                SignatureType = null;
                SignatureStatus = '';
                break;
        }



        if (SignatureType == true) {
            vm.emailClient = $scope.$parent.globals.emailClient;
            vm.emailRepresentative = $scope.$parent.globals.emailRepresentative;
            signatureStatus = "0";
        } else if (SignatureType == false) {
            vm.emailClient = "";
            vm.emailRepresentative = "";
            signatureStatus = "1";

        } else {
            vm.emailClient = "";
            vm.emailRepresentative = "";
        }


        if (vm.needsSignatureCustomer == true && vm.needsSignatureBusinessBuilder == true) {
            if (['2', '3'].includes(allSignatures.get("customer")) && $sessionStorage.hasBBSignature == true)
                var saveAsWaitingForSync = true;
        }
        else {
            if (vm.needsSignatureCustomer == true) {
                if (['2', '3'].includes(allSignatures.get("customer")))
                    saveAsWaitingForSync = true;
            } else
                if (vm.needsSignatureBusinessBuilder == true) {
                    if ($sessionStorage.hasBBSignature == true)
                        saveAsWaitingForSync = true;
                } else if(SignatureType != null){
                    saveAsWaitingForSync = true;
                }
        }

        var canSave = true;
        var messageSave = '';
        if (saveAsWaitingForSync) {
            if ($sessionStorage.isNIFImageMandatory) {
                if ($sessionStorage.hasNIF1ImageTag) {
                    if (!$sessionStorage.hasNIF1Image) {
                        canSave = false;
                        messageSave = messageSave + 'NIF1 Image is Mandatory.';
                    }
                }

                if ($sessionStorage.hasNIF2ImageTag) {
                    if (!$sessionStorage.hasNIF2Image) {
                        canSave = false;
                        messageSave = messageSave + '\nNIF2 Image is Mandatory.';
                    }
                }
            }

            if ($sessionStorage.hasIBANImageTag) {
                if (!$sessionStorage.hasIBANImage) {
                    canSave = false;
                    messageSave = messageSave + '\nIBAN Image is Mandatory.';
                }
            }
        }


        if (canSave) {

            if (allSignatures.size == 0) {
                SignatureType = false;
                SignatureStatus = "1";
            }

            var documentModulesArray = [];
            var documantItemArray = [];

            vm.documentModules["dynmctms"] = vm.dynamicitems;

            for (var i = 0; i < vm.dynamicitems.length; ++i) {
                var value = '';
                switch (vm.dynamicitems[i].ItemTypeName) {
                    case 'radiobuttonlist':
                    case 'multipleselect':
                    case 'checkboxlist':
                        var temp = Enumerable.From(vm.dynamicitems[i].Value)
                            .Select(function (x) { return x.description; })
                            .ToArray();
                        value = temp.join();
                        break;
                    case 'dropdown':
                        value = vm.dynamicitems[i].Value.description;
                        break;
                    case 'imagedropdown':
                        value = vm.dynamicitems[i].Value.fileName;
                        break;
                    case 'imagemultipleselect':
                        var temp = Enumerable.From(vm.dynamicitems[i].Value)
                            .Select(function (x) { return x.fileName; })
                            .ToArray();
                        value = temp.join();
                        break;
                    default:
                        value = vm.dynamicitems[i].Value;
                        break;
                }

                var documentItemValue =
                {
                    'IdTemplateItem': vm.dynamicitems[i].Id,
                    'Value': value
                };
                documantItemArray.push(documentItemValue);
            }

            if (vm.client != undefined)
                vm.documentModules["clnt"] = vm.client;
            if (vm.clientIBAN != undefined)
                vm.documentModules["clnt_edit"] = vm.clientIBAN;

            //convert to array so that
            for (var i = 0; i < vm.documenttypemodulesfull.length; ++i) {

                var value = vm.documentModules[vm.documenttypemodulesfull[i].Code];

                if (value != null && value != undefined && value.length != null && value.length != undefined) {
                    for (var j = 0; j != value.length; ++j) {
                        if (value[j].RegularExpression != null && value[j].RegularExpression != undefined) {
                            value[j].RegularExpression = value[j].RegularExpression.toString().replace(/'/g, "''")
                        }
                    }
                }


                var documentModule =
                {
                    'IdDocument': -1,
                    'IdModule': vm.documenttypemodulesfull[i].Id,
                    'Value': angular.toJson(value)
                }
                documentModulesArray[i] = documentModule;

            }
            var idgeography = null;
            if (vm.client != undefined)
                idgeography = vm.client.IdGeography;
            else {
                idgeography = vm.alternateGeography;
            }

            var idBudgetAccount = null;
            if (vm.selectedBudgetAccount != undefined) idBudgetAccount = vm.selectedBudgetAccount.Id;

            var documentId = -1;
            var syncUniqueIdentifier = null;
            if ($sessionStorage.Document != undefined) {
                documentId = $sessionStorage.Document.DocumentId;
            } else {
                documentId = generateUUID();
            }

            var stepId = 1;
            if ($sessionStorage.Document != undefined) {
                stepId = $sessionStorage.Document.IdStep;
            }

            var document =
            {
                'Id': documentId,
                'IdStep': stepId,
                'IdTemplate': vm.template.Id,
                'IdDocumentType': $sessionStorage.documentType,
                'SyncUniqueIdentifier': syncUniqueIdentifier,
                'DocumentModuleValues': documentModulesArray,
                'IdGeography': idgeography,
                'IdBudget': idBudgetAccount,
                'Client': vm.client,
                'CustomerIBAN': vm.clientIBAN,
                'HasClientSignature': (saveAsWaitingForSync == true) ? true : false,
                'DocumentItemValues': documantItemArray,
                'DocumentTypeCode': $sessionStorage.DocumentTypeObj.Code,
                'DD': vm.dd,
                'IBANChange': false,
                'SignatureType': SignatureType,
                'SignatureStatus': SignatureStatus,
                'Email': validateValueNull(vm.emailClient),
                'EmailRepresentative': validateValueNull(vm.emailRepresentative),
                'CustomerSignature': validateValueNull(allSignatures.get("customer")),
                'CustomerRepresentativeSignature': validateValueNull(allSignatures.get("cr"))
            };


            var workflowGuid = generateUUID();


            $q.all([documentLocalData.saveDocument(document, $scope.$parent.globals.currentUser.username, vm.selectedDocumentId, workflowGuid, $scope.$parent.globals.currentUser.market)])
                .then(function (result) {
                    //Success: ID Error: -1
                    if (result[0] > 0) {
                        console.log(vm.deleteDocument);
                        if (vm.deleteDocument.length > 0) {
                            $q.all([documentLocalData.deleteDocument(vm.deleteDocument)]).then(
                                function (x) {
                                    console.log(x);
                                    swal({
                                        title: "Success",
                                        text: "Document Saved.",
                                        type: "success"
                                    },
                                        function () {

                                            //$location.path('/home');
                                            $scope.$apply(function () {

                                                if (document.IBANChange == true && document.DocumentTypeCode.indexOf('_IBAN') <= 0) {
                                                    $sessionStorage.IBANChange = true;
                                                    $sessionStorage.IBANChangeClient = document.Client;
                                                    $location.path('/document');
                                                    $sessionStorage.isDocumentsModifed.agreement = true;

                                                }
                                                else {
                                                    $location.path('/home');
                                                    $sessionStorage.IBANChange = false;
                                                    $sessionStorage.IBANChangeClient = undefined;

                                                    //Refreshes the document cache
                                                    if (document.DocumentTypeCode.indexOf('_Agreement') != -1)
                                                        $sessionStorage.isDocumentsModifed.agreement = true;
                                                    else if (document.DocumentTypeCode.indexOf('_Cancelation') !== -1)
                                                        $sessionStorage.isDocumentsModifed.cancelation = true;
                                                    else if (document.DocumentTypeCode.indexOf('_IBAN') !== -1)
                                                        $sessionStorage.isDocumentsModifed.iban = true;
                                                    else if (document.DocumentTypeCode.indexOf('_DigitalAgreement') !== -1)
                                                        $sessionStorage.isDocumentsModifed.digitalAgreement = true;
                                                    else if (document.DocumentTypeCode.indexOf('_DigitalForm') !== -1)
                                                        $sessionStorage.isDocumentsModifed.digitalForm = true;

                                                }
                                            });
                                        });
                                }
                            )
                        } else {
                            swal({
                                title: "Success",
                                text: "Document Saved.",
                                type: "success"
                            },
                                function () {

                                    //$location.path('/home');
                                    $scope.$apply(function () {

                                        if (document.IBANChange == true && document.DocumentTypeCode.indexOf('_IBAN') <= 0) {
                                            $sessionStorage.IBANChange = true;
                                            $sessionStorage.IBANChangeClient = document.Client;
                                            $location.path('/document');
                                            $sessionStorage.isDocumentsModifed.agreement = true;

                                        }
                                        else {
                                            $location.path('/home');
                                            $sessionStorage.IBANChange = false;
                                            $sessionStorage.IBANChangeClient = undefined;

                                            //Refreshes the document cache
                                            if (document.DocumentTypeCode.indexOf('_Agreement') != -1)
                                                $sessionStorage.isDocumentsModifed.agreement = true;
                                            else if (document.DocumentTypeCode.indexOf('_Cancelation') !== -1)
                                                $sessionStorage.isDocumentsModifed.cancelation = true;
                                            else if (document.DocumentTypeCode.indexOf('_IBAN') !== -1)
                                                $sessionStorage.isDocumentsModifed.iban = true;
                                            else if (document.DocumentTypeCode.indexOf('_DigitalAgreement') !== -1)
                                                $sessionStorage.isDocumentsModifed.digitalAgreement = true;
                                            else if (document.DocumentTypeCode.indexOf('_DigitalForm') !== -1)
                                                $sessionStorage.isDocumentsModifed.digitalForm = true;

                                        }
                                    });
                                });
                        }


                    }
                    else {
                        swal({
                            title: "Error",
                            text: "Document not saved.",
                            type: "error"
                        },
                            function () {
                                vm.saving = false;
                            });
                    }


                    $sessionStorage.selectedDocumentId = null;
                    $sessionStorage.IsInCreationMode = false;

                    //$sessionStorage.selectedDocumentId = '';
                });

        }
        else {
            swal({
                title: "Information",
                text: messageSave,
                type: "error"
            }, function (result) {
                vm.saving = false;
            });
        }
        console.log("final");
        console.log(vm.saving);
    }

    function validateValueNull(data) {
        if (typeof data === 'undefined') {
            return '';
        }

        if (data == null || data == 'null') {
            return '';
        }

        return data;
    }

    vm.addValidation = function (code, description, isValid, msg) {
        var val =
        {
            'IsValid': isValid,
            'Msg': msg
        };

        if (vm.validations[code] == undefined) {
            var arr = [];
            arr[description] = val;
            vm.validations[code] = arr;
        } else {
            vm.validations[code][description] = val;
        }
    }
    vm.removeValidation = function (code) {
        vm.validations[code] = undefined;
    }

}
