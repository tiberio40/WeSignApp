

app.factory('documentData', function ($q, $sessionStorage) {

    //Control variables to verify if the documents list have been changes and need to be reloaded
    $sessionStorage.isDocumentsModifed = {
        agreement: true,
        cancelation: true,
        iban: true,
        digitalAgreement: true,
        digitalForm: true,
    }

    var db = localDatabase;
    return {
        cachedDocuments: {},
        GetDocument: function (documentType) {
            var deferred = $q.defer()

            var documentList = [];

            var arrData = [];

            var masterDetailsCode = "";
            if (documentType.Code.indexOf('_Agreement') !== -1)
                masterDetailsCode = 'ag_mstrdtl';
            if (documentType.Code.indexOf('_Cancelation') !== -1)
                masterDetailsCode = 'canc_mstrdtl';
            if (documentType.Code.indexOf("_DigitalAgreement") !== -1)
                masterDetailsCode = 'dd_mstrdtl';
            if (documentType.Code.indexOf("_DigitalForm") !== -1)
                masterDetailsCode = 'df_mstrdtl';

            db.transaction(function populateDB(tx) {



                var str = 'SELECT Document.Commentary, Document.IdBudget, DateTime(Document.CreatedOn) as CreatedOn, Document.CreatedBy, Document.Id as DocumentId, DocumentType.Id as DocTypeId, DocumentType.Name as DocTypeName, Document.IdStep, (SELECT Description from Step Where Id = Document.IdStep) as StepName, (SELECT Code from Step Where Id = Document.IdStep) as StepCode, DocumentType.Name, ' +
                    'Geography.Code as GeographyCode, Geography.Description as GeographyDescription, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt") AND IdDocument = Document.Id) as customer, "" as CustomerName, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "tmplt") AND IdDocument = Document.Id) as template, "" as TemplateName,  ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "' + masterDetailsCode + '") AND IdDocument = Document.Id) as MasterDetails, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt_edit") AND IdDocument = Document.Id) as CustomerIBAN, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "dd_row") AND IdDocument = Document.Id) as DD, ' +
                    '(select Name FROM BudgetAccount WHERE Id = CAST(Document.IdBudget as numeric)) as BudgetAccount, ' +
                    '(select Id FROM DocumentNumber WHERE IdDocument = Document.Id) as DocumentNumber, ' +
                    '(select Id FROM DocumentNumber WHERE IdDocument = DocumentDocument.IdDocument1) as AgreementId, ' +
                    'Document.SignatureType as SignatureType, ' +
                    'Document.SignatureStatus as SignatureStatus, ' +
                    'Document.Email as Email, ' +
                    'Document.EmailRepresentative as EmailRepresentative, ' +
                    'Document.CustomerSignature as CustomerSignature, ' +
                    'Document.CustomerRepresentativeSignature as CustomerRepresentativeSignature ' +
                    'FROM Document ' +
                    'LEFT OUTER JOIN Geography ON Document.IdGeography = Geography.Id ' +
                    'LEFT OUTER JOIN DocumentDocument ON Document.Id = DocumentDocument.IdDocument2 ' +
                    'INNER JOIN DocumentType ON DocumentType.Id = Document.IdDocumentType WHERE Document.IdDocumentType = ' + documentType.Id +
                    ' and  case when exists(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt") AND IdDocument = Document.Id) then Geography.Id else "" end is not null'
                ' ORDER BY Document.CreatedOn DESC';



                tx.executeSql(str, [], function (tx2, results) {

                    if (results != undefined && results.rows.length > 0) {

                        for (var i = 0; i <= results.rows.length - 1; ++i) {
                            arrData.push(results.rows.item(i));
                        }

                        deferred.resolve(arrData);
                    } else {
                        //No documents, but has to return the result
                        deferred.resolve(arrData);
                    }
                });


            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        },
        GetGeography: function () {
            var deferred = $q.defer()
            var arrData = [];
            db.transaction(function populateDB(tx) {

                var str = 'SELECT * FROM Geography';

                tx.executeSql(str, [], function (tx2, results) {

                    for (var i = 0; i <= results.rows.length - 1; ++i) {
                        arrData.push(results.rows.item(i));
                    }

                    deferred.resolve(arrData);
                });


            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        },


        DeleteDocument: function (document) {
            var deferred = $q.defer()
            if (document.IdStep == 2) {
                db.transaction(function populateDB(tx) {
                    var str = 'DELETE FROM DocumentModuleValue WHERE IdDocument = "' + document.DocumentId + '"';
                    var str2 = 'DELETE FROM Document WHERE ID =  "' + document.DocumentId + '"';
                    var str3 = 'DELETE FROM DocumentDocument WHERE IdDocument2 =  "' + document.DocumentId + '"';

                    tx.executeSql(str, [], function (tx2, results) {
                        tx.executeSql(str2, [], function (tx2, results) {
                            tx.executeSql(str3, [], function (tx2, results) {
                                deferred.resolve(1);
                            })
                        })
                    });
                }, function errorCB(tx, err) {
                    deferred.resolve(-1);
                }, function successCB() {

                });
            }
            if (document.IdStep == 19) {
                db.transaction(function populateDB(tx) {
                    var str = 'UPDATE Document SET IdStep = 18 WHERE ID =  "' + document.DocumentId + '"';

                    tx.executeSql(str, [], function (tx2, results) {
                        deferred.resolve(1);
                    });
                }, function errorCB(tx, err) {
                    deferred.resolve(-1);
                }, function successCB() {

                });
            }

            return deferred.promise;
        },


        Configurations: function (name) {
            var deferred = $q.defer();

            db.transaction(function GetConfigDB(tx) {

                var str = 'select value from configuration where name="' + name + '"';
                tx.executeSql(str, [], function (tx2, results) {
                    if (results != undefined && results.rows.length > 0)
                        deferred.resolve(results.rows.item(0).Value);
                    else
                        deferred.resolve('');
                });
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        },
        DocumentHTML: function (item) {
            var deferred = $q.defer();

            db.transaction(function GetDocHtmlDB(tx) {

                var str = 'select * from documentmodulevalue' +
                    ' inner join Module' +
                    ' on Module.id==DocumentModuleValue.idModule' +
                    ' where DocumentModuleValue.iddocument=\'' + item.DocumentId + '\' and code=\'bdy\'';
                tx.executeSql(str, [], function (tx2, results) {
                    if (results != undefined && results.rows.length > 0)
                        deferred.resolve(results.rows.item(0).Value);
                    else
                        deferred.resolve('');
                });
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        },
        GetSteps: function (IdDocumentType) {
            var deferred = $q.defer();

            db.transaction(function GetConfigDB(tx) {

                var arr = [];
                var str = 'select * from Step ' +
                    'where code != "PendingApproval" And Code !="Created" AND ' +
                    '(Id in (select Step1 from WorkflowStep where idworkflow in (select IdWorkflow from DocumentType where id = ' + IdDocumentType + ')) ' +
                    'OR Id in (select Step2 from WorkflowStep where idworkflow in (select IdWorkflow from DocumentType where id = ' + IdDocumentType + '))) ' +
                    'OR Step.Code IN ("DraftOnCloud")';
                tx.executeSql(str, [], function (tx2, results) {
                    if (results != undefined && results.rows.length > 0) {
                        var arrData = [];
                        for (var i = 0; i <= results.rows.length - 1; ++i) {
                            arrData.push(results.rows.item(i));
                        }

                        deferred.resolve(arrData);
                    }
                    else
                        deferred.resolve(0);
                });
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        },
        GetDocumentByStepAndCustomerWithRelations: function (stepCodes) {
            var deferred = $q.defer()

            var documentList = [];

            var arrData = [];

            db.transaction(function populateDB(tx) {

                var str = 'SELECT Document.Commentary, Document.IdBudget, DateTime(Document.CreatedOn) as CreatedOn, Document.CreatedBy, Document.Id as DocumentId, DocumentType.Id as DocTypeId, DocumentType.Name as DocTypeName, Document.IdStep, (SELECT Description from Step Where Id = Document.IdStep) as StepName, (SELECT Code from Step Where Id = Document.IdStep) as StepCode, DocumentType.Name, ' +
                    'Geography.Code as GeographyCode, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt") AND IdDocument = Document.Id) as customer, "" as CustomerName, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "tmplt") AND IdDocument = Document.Id) as template, "" as TemplateName,  ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "ag_mstrdtl") AND IdDocument = Document.Id) as MasterDetails, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt_edit") AND IdDocument = Document.Id) as CustomerIBAN, ' +
                    '(select Name FROM BudgetAccount WHERE Id = CAST(Document.IdBudget as numeric)) as BudgetAccount, ' +
                    '(select Id FROM DocumentNumber WHERE IdDocument = Document.Id) as DocumentNumber ' +
                    'FROM Document ' +
                    'INNER JOIN Geography ON Document.IdGeography = Geography.Id ' +
                    'INNER JOIN DocumentType ON DocumentType.Id = Document.IdDocumentType WHERE Document.IdDocumentType = ' + '(select Id from DocumentType where Name = "Agreement")' + ' AND Document.IdStep IN (SELECT Id FROM Step WHERE Step.Code IN (' + stepCodes + ')) ' +
                    'AND Document.Id NOT IN (SELECT IdDocument1 FROM DocumentDocument where IdDocument1 = Document.Id) ' +
                    'ORDER BY Document.CreatedOn DESC';

                //MARTELADA DO RUBEN NO ID DOCUMENTTYPE
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
        GetDocumentByStepAndCustomer: function (stepCodes) {
            var deferred = $q.defer()

            var documentList = [];

            var arrData = [];

            db.transaction(function populateDB(tx) {

                var str = 'SELECT Document.Commentary, Document.IdBudget, DateTime(Document.CreatedOn) as CreatedOn, Document.CreatedBy, Document.Id as DocumentId, DocumentType.Id as DocTypeId, DocumentType.Name as DocTypeName, Document.IdStep, (SELECT Description from Step Where Id = Document.IdStep) as StepName, (SELECT Code from Step Where Id = Document.IdStep) as StepCode, DocumentType.Name, ' +
                    'Geography.Code as GeographyCode, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt") AND IdDocument = Document.Id) as customer, "" as CustomerName, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "tmplt") AND IdDocument = Document.Id) as template, "" as TemplateName,  ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "ag_mstrdtl") AND IdDocument = Document.Id) as MasterDetails, ' +
                    '(select Value FROM DocumentModuleValue WHERE IdModule = (select Id FROM Module Where code = "clnt_edit") AND IdDocument = Document.Id) as CustomerIBAN, ' +
                    '(select Name FROM BudgetAccount WHERE Id = CAST(Document.IdBudget as numeric)) as BudgetAccount, ' +
                    '(select Id FROM DocumentNumber WHERE IdDocument = Document.Id) as DocumentNumber ' +
                    'FROM Document ' +
                    'INNER JOIN Geography ON Document.IdGeography = Geography.Id ' +
                    'INNER JOIN DocumentType ON DocumentType.Id = Document.IdDocumentType WHERE Document.IdDocumentType = (select Id from DocumentType where Name = "Agreement") AND Document.IdStep IN (SELECT Id FROM Step WHERE Step.Code IN (' + stepCodes + ')) ' +
                    'ORDER BY Document.CreatedOn DESC';

                //MARTELADA DO RUBEN NO ID DOCUMENTTYPE
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
        GetDocumentTypes: function (IdDocumentType) {
            var deferred = $q.defer();

            db.transaction(function GetConfigDB(tx) {

                var arr = [];
                var str = 'SELECT * FROM DocumentType';
                tx.executeSql(str, [], function (tx2, results) {
                    if (results != undefined && results.rows.length > 0) {
                        var arrData = [];
                        for (var i = 0; i <= results.rows.length - 1; ++i) {
                            arrData.push(results.rows.item(i));
                        }

                        deferred.resolve(arrData);
                    }
                    else
                        deferred.resolve(0);
                });
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        },
        GetPendingIbanDocument: function (clientId) {

            var deferred = $q.defer();

            db.transaction(function GetConfigDB(tx) {

                var arr = [];
                var str = 'SELECT * FROM Customer WHERE Id = "' + clientId + '" AND IBANUpdated = "true"';
            }, function errorCB(tx, err) {
                deferred.resolve(-1);
            }, function successCB() {

            });

            return deferred.promise;
        }
    }
});

app.filter('SignaturaType', function () {
    return function (data) {
        let text = data == null ? "Null" : data.toLowerCase();
        switch (text) {
            case 'true':
                return "Remote Signature";
                break;
            case 'false':
                return "iPad Signature";
                break;
            default:
                return 'Without Value';
                break;

        }
    }
});

app.filter('SignaturaStatus', function () {
    return function (data) {
        let documentType = data[0];
        let documentStatus = data[1];

        switch (documentStatus) {
            case '0':
                return 'Pending';
                break;
            case '1':
                return 'Signatured';
                break;
            case '2':
                return 'Without Email';
                break;
            case '3':
                return 'Error - Mail Sending';
                break;
            case '4':
                return 'Error - Without Email Template';
                break;
            case '5':
                return 'Pending Signature Customer';
                break;
            case '6':
                return 'Pending Signature Customer Representative';
                break;
            case '7':
                return 'Error - Mail Sending to Customer';
                break;
            case '8':
                return 'Error - Mail Sending to Customer Representative';
                break;
            case '9':
                return 'Error - Mail Sending to Customer and Representative';
                break;
            default:
                return 'Without Value';
                break;
        }
    }
});

app.controller('HomeController', HomeController);

function HomeController($scope, $location, $filter, $rootScope, DocumentService, updateData, $q, documentData, $sessionStorage, $http, DTOptionsBuilder, DTColumnDefBuilder, $cordovaCamera, readData) {
    var vm = this;
    vm.updateView = updateView;
    vm.txtSearch = '';
    vm.documents = [];
    vm.errorInDocuments = [];

    //Object that will cache the loaded documents
    vm.cachedDocuments = documentData.cachedDocuments;

    //Sets the loading documents screen
    vm.documentsLoaded = false;

    vm.OpenModal = OpenModal;
    vm.firstName = '';
    vm.lastName = '';
    vm.selectedStep = 0;
    vm.rootscope = $rootScope;
    vm.StepFilter = '';
    vm.IsCommentDisabled = true;
    vm.currentItemComment = undefined;

    vm.selectedDocumentType = [];

    vm.filterOptionsAG = [
        { id: 'StepName', name: 'Status', col: 7 },
        { id: 'CustomerName', name: 'Customer', col: 2 },
        { id: 'GeographyDescription', name: 'Territory', col: 8 },
        { id: 'TemplateName', name: 'Template', col: 3 },
        { id: 'StartDate', name: 'Start Date', col: 5 },
        { id: 'EndDate', name: 'End Date', col: 6 },
        { id: 'CreationDate', name: 'Creation Date', col: 4 }
    ];

    vm.filterOptionsCC = [
        { id: 'StepName', name: 'Status', col: 7 },
        { id: 'CustomerName', name: 'Customer', col: 8 },
        { id: 'TemplateName', name: 'Template', col: 2 },
        { id: 'RevokedDate', name: 'Revoked Date', col: 4 },
        { id: 'Reason', name: 'Reason', col: 5 },
        { id: 'CreationDate', name: 'Creation Date', col: 6 }
    ];

    vm.filterOptionsIB = [
        { id: 'StepName', name: 'Status', col: 7 },
        { id: 'CustomerName', name: 'Customer', col: 3 },
        { id: 'TemplateName', name: 'Template', col: 2 },
        { id: 'IBAN', name: 'IBAN', col: 4 },
        { id: 'NIF', name: 'NIF', col: 5 },
        { id: 'CreationDate', name: 'Creation Date', col: 6 }
    ];

    vm.filterOptionsDD = [
        { id: 'StepName', name: 'Status', col: 5 },
        { id: 'CustomerName', name: 'Customer', col: 3 },
        { id: 'TemplateName', name: 'Template', col: 2 },
        { id: 'CreationDate', name: 'Creation Date', col: 4 }
    ];

    vm.filterOptionsDF = [
        { id: 'StepName', name: 'Status', col: 5 },
        { id: 'CustomerName', name: 'Customer', col: 3 },
        { id: 'TemplateName', name: 'Template', col: 2 },
        { id: 'CreationDate', name: 'Creation Date', col: 4 }
    ];

    vm.filterOptions = [];




    $('#formSendEmail').validator();
    $('#modalAgreementSendMail').on('shown.bs.modal', function () {
        $('#modal-SendMailto-template').focus();
    });

    vm.dtColumnsAG = [
        { Name: 'DocumentNumber', show: true }, { Name: 'Owner', show: true }, { Name: 'Customer', show: true }, { Name: 'Template', show: true }, { Name: 'Creation Date', show: true }, { Name: 'Start Date', show: true },
        { Name: 'End Date', show: true }, { Name: 'Status', show: true }, { Name: 'Signature Type', show: true }, { Name: 'Signature Status', show: true }, { Name: 'Territory', show: true }, { Name: 'Value', show: true }, { Name: 'Comment', show: true }, { Name: 'Budget', show: true }
        , { Name: 'StepCode', show: false }

    ];
    vm.dtColumnsCC = [
        { Name: 'DocumentNumber', show: true }, { Name: 'Owner', show: true }, { Name: 'TemplateName', show: true }, { Name: 'AgreementId', show: true },
        { Name: 'RevokedDate', show: true }, { Name: 'Reason', show: true }, { Name: 'CreationDate', show: true }, { Name: 'StepName', show: true },
        { Name: 'Signature Type', show: true }, { Name: 'Signature Status', show: true },
        { Name: 'CustomerName', show: true }, { Name: 'StepCode', show: false },
    ];
    vm.dtColumnsIB = [
        { Name: 'DocumentNumber', show: true }, { Name: 'Owner', show: true }, { Name: 'TemplateName', show: true },
        { Name: 'CustomerName', show: true }, { Name: 'IBAN', show: true }, { Name: 'NIF', show: true },
        { Name: 'Signature Type', show: true }, { Name: 'Signature Status', show: true },
        { Name: 'CreationDate', show: true },
        { Name: 'StepName', show: true }, { Name: 'StepCode', show: false },
    ];

    vm.dtColumnsDD = [
        { Name: 'DocumentNumber', show: true }, { Name: 'Owner', show: true }, { Name: 'TemplateName', show: true },
        { Name: 'CustomerName', show: true },
        { Name: 'Signature Type', show: true }, { Name: 'Signature Status', show: true },
        { Name: 'CreationDate', show: true }, { Name: 'StepName', show: true }, { Name: 'StepCode', show: false },
    ];

    vm.dtColumnsDF = [
        { Name: 'DocumentNumber', show: true }, { Name: 'Owner', show: true }, { Name: 'TemplateName', show: true },
        { Name: 'CustomerName', show: true },
        { Name: 'Signature Type', show: true }, { Name: 'Signature Status', show: true },
        { Name: 'CreationDate', show: true }, { Name: 'StepName', show: true }, { Name: 'StepCode', show: false },
    ];

    vm.dtOptionsAG = DTOptionsBuilder.newOptions().withOption('bFilter', true).withDOM('tr').withOption('paging', false);
    vm.dtOptionsCC = DTOptionsBuilder.newOptions().withOption('bFilter', true).withDOM('tr').withOption('paging', false);
    vm.dtOptionsIB = DTOptionsBuilder.newOptions().withOption('bFilter', true).withDOM('tr').withOption('paging', false);
    vm.dtOptionsDD = DTOptionsBuilder.newOptions().withOption('bFilter', true).withDOM('tr').withOption('paging', false);
    vm.dtOptionsDF = DTOptionsBuilder.newOptions().withOption('bFilter', true).withDOM('tr').withOption('paging', false);

    vm.dtColumnDefsAG = [
        //DTColumnDefBuilder.newColumnDef([3, 4, 5]).withOption('type', 'date')
    ];
    vm.dtColumnDefsCC = [
        //DTColumnDefBuilder.newColumnDef([4, 6]).withOption('type', 'date')
    ];
    vm.dtColumnDefsIB = [
        //DTColumnDefBuilder.newColumnDef([7]).withOption('type', 'date')
    ];

    vm.dtColumnDefsDD = [
        //DTColumnDefBuilder.newColumnDef([4]).withOption('type', 'date')
    ];

    vm.dtColumnDefsDF = [
        //DTColumnDefBuilder.newColumnDef([4]).withOption('type', 'date')
    ];

    vm.selectedItem = undefined;

    vm.AddComment = function () {
        vm.IsCommentDisabled = true;

        if (vm.selectedStep != undefined) {
            switch (vm.selectedStep.Code) {
                case "Annuled":
                    vm.currentItemComment = vm.currentItem.Comment;
                    vm.currentItem.Comment = '';
                    vm.IsCommentDisabled = false;
                case "Ended":
                case "Revoked":
                    vm.currentItemComment = vm.currentItem.Comment;
                    vm.currentItem.Comment = '';
                    vm.IsCommentDisabled = false;
                    break;
                default:
                    vm.currentItem.Comment = vm.currentItemComment;
                    vm.IsCommentDisabled = true;
                    break;

            }

        }

    }

    var username = $scope.globals.currentUser.username;
    var idmarket = $scope.globals.currentUser.market;

    if ((username == null || username == undefined) || (idmarket == null || username == idmarket)) {
        //redirect to login
    }

    vm.geographyList = [];

    updateView();

    vm.StepFilterDocumentToggle = function ($event, doc, index) {

        vm.selectedDocumentType = doc;
        vm.documentsLoaded = false;

        if (vm.selectedDocumentType.Code.indexOf('_Agreement') != -1 && $sessionStorage.isDocumentsModifed.agreement == false) {
            vm.documents = angular.copy(vm.cachedDocuments.agreement);
            updateView(true);
        } else if (vm.selectedDocumentType.Code.indexOf('_Cancelation') !== -1 && $sessionStorage.isDocumentsModifed.cancelation == false) {
            vm.documents = angular.copy(vm.cachedDocuments.cancelation);
            updateView(true);
        } else if (vm.selectedDocumentType.Code.indexOf('_IBAN') !== -1 && $sessionStorage.isDocumentsModifed.iban == false) {
            vm.documents = angular.copy(vm.cachedDocuments.iban);
            updateView(true);
        } else if (vm.selectedDocumentType.Code.indexOf('_DigitalAgreement') !== -1 && $sessionStorage.isDocumentsModifed.digitalAgreement == false) {
            vm.documents = angular.copy(vm.cachedDocuments.digitalAgreement);
            updateView(true);
        } else if (vm.selectedDocumentType.Code.indexOf('_DigitalForm') !== -1 && $sessionStorage.isDocumentsModifed.digitalForm == false) {
            vm.documents = angular.copy(vm.cachedDocuments.digitalForm);
            updateView(true);

        } else {
            updateView();
        }

    };


    vm.StepFilterToggle = function ($event, step, index) {
        var btn = $event.currentTarget;
        var table = $('.dataTableDashboard').dataTable();

        step.Selected = !step.Selected;
        vm.StepFilter = [];

        var sup = false;
        var man = false;
        var str = '';

        for (var i = 0; i != vm.steps.length; ++i) {

            if (vm.steps[i].Selected) {
                vm.StepFilter.push(vm.steps[i].Code);
                str += vm.steps[i].Code + '|';

                if (vm.steps[i].Code == "PendingApprovalSupervisor")
                    sup = true;
                if (vm.steps[i].Code == "PendingApprovalManager")
                    man = true;
                //table.column(6).search('Approved').draw();

            }
        }


        if (sup)
            str += 'PendingApproval';
        else {
            str = str.substring(0, str.length - 1);
        }

        if (vm.selectedDocumentType.Code.indexOf('_Agreement') !== -1)
            table.api().columns(14).search(str, true).draw();
        if (vm.selectedDocumentType.Code.indexOf('_Cancelation') !== -1)
            table.api().columns(11).search(str, true).draw();
        if (vm.selectedDocumentType.Code.indexOf('_IBAN') !== -1)
            table.api().columns(10).search(str, true).draw();
        if (vm.selectedDocumentType.Code.indexOf('_DigitalAgreement') !== -1)
            table.api().columns(8).search(str, true).draw();
        if (vm.selectedDocumentType.Code.indexOf('_DigitalForm') !== -1)
            table.api().columns(8).search(str, true).draw();
    };

    vm.Clear = function () {

        var arr = ['docListTableAG', 'docListTableCC', 'docListTableIB', 'docListTableDD', 'docListTableDF'];

        for (var j = 0; j < arr.length; ++j) {

            var table = $('#' + arr[j]).dataTable();

            var oSettings = table.fnSettings();
            if (oSettings != null) {
                for (iCol = 0; iCol < oSettings.aoPreSearchCols.length; iCol++) {
                    oSettings.aoPreSearchCols[iCol].sSearch = '';
                }
            }
            table.fnDraw();
            //$scope.activeBtn = -1;
            vm.StepFilter = [];
            for (var i = 0; i != vm.steps.length; ++i) {
                vm.steps[i].Selected = false;
            }
        }
    }

    vm.StepNameFilter = function (item) {
    }

    vm.closemodal = function (idModel) {
        $(idModel).modal('toggle');
    };

    vm.DateIsNullOrEmptyOrUndefinedOrMin = function (date) {
        if (date == "0001-01-01T00:00:00" || date == null || date == undefined || date == "")
            return true;
        return false;
    };

    vm.ForceEmptyStringIfNullorUndefined = function (str) {
        if (str == undefined || str == null)
            return "";
        return str;
    };

    vm.criteriaMatch = function (criteria) {

        var table = $('.dataTableDashboard').dataTable();


        table.api().columns(vm.selectedItem.col).search(criteria.toLowerCase(), true).draw();
    };

    vm.reverseOrder = false;

    function updateView(isDocumentsCached) {

        //Filter that shows the no documents
        vm.documentsLoaded_NoDocuments = false;

        if (typeof isDocumentsCached != 'undefined' && isDocumentsCached === true)
            vm.documentsLoaded = true;
        else
            vm.documentsLoaded = false;


        $q.all([documentData.GetDocumentTypes()]).then(function (result) {

            vm.docTypesAux = Enumerable.From(result[0]).ToArray();
            vm.docTypes = [];
            for (var i = 0; i != vm.docTypesAux.length; ++i) {
                var s = { 'Id': vm.docTypesAux[i].Id, 'DocumentLabelCode': vm.docTypesAux[i].DocumentLabelCode, 'Name': vm.docTypesAux[i].Name, 'Code': vm.docTypesAux[i].Code };
                vm.docTypes.push(s);
            }


            if (vm.selectedDocumentType == null || vm.selectedDocumentType.length == 0)
                vm.selectedDocumentType = vm.docTypes[0];

            $q.all([documentData.GetSteps(vm.selectedDocumentType.Id)]).then(function (result) {

                vm.stepsAux = Enumerable.From(result[0]).ToArray();

                vm.steps = [];
                for (var i = 0; i != vm.stepsAux.length; ++i) {
                    var s = { 'Id': vm.stepsAux[i].Id, 'Name': vm.stepsAux[i].Name, 'Code': vm.stepsAux[i].Code, 'Description': vm.stepsAux[i].Description, 'DivId': vm.stepsAux[i].DivId, 'Selected': false };
                    vm.steps.push(s);
                }

            });

            //Only loads the documents if they are not cached
            if (vm.documentsLoaded == false) {
                vm.documents = [];
                $q.all([documentData.GetDocument(vm.selectedDocumentType)]).then(function (result) {

                    if (vm.selectedDocumentType.Code.indexOf('_Agreement') != -1)
                        vm.filterOptions = vm.filterOptionsAG;
                    if (vm.selectedDocumentType.Code.indexOf('_Cancelation') !== -1)
                        vm.filterOptions = vm.filterOptionsCC;
                    if (vm.selectedDocumentType.Code.indexOf('_IBAN') !== -1)
                        vm.filterOptions = vm.filterOptionsIB;
                    if (vm.selectedDocumentType.Code.indexOf('_DigitalAgreement') !== -1)
                        vm.filterOptions = vm.filterOptionsDD;
                    if (vm.selectedDocumentType.Code.indexOf('_DigitalForm') !== -1)
                        vm.filterOptions = vm.filterOptionsDF;

                    var arr = [];
                    var arrAux = Enumerable.From(result[0]).ToArray();
                    for (var i = 0; i != arrAux.length; ++i)
                        arr.push(arrAux[i]);

                    if (arr != undefined && arr.length > 0) {

                        vm.documents = [];
                        for (var j = 0; j < arr.length; ++j) {
                            var document;

                            if (vm.selectedDocumentType.Code.indexOf("_Agreement") !== -1) {
                                document = {
                                    "customer": arr[j].customer,
                                    "DocumentId": arr[j].DocumentId,
                                    "DocTypeId": arr[j].DocTypeId,
                                    "DocTypeName": arr[j].DocTypeName,
                                    "IdStep": arr[j].IdStep,
                                    "StepCode": arr[j].StepCode,
                                    "StepName": arr[j].StepName,
                                    "Name": arr[j].Name,
                                    "Code": vm.selectedDocumentType.Code,
                                    "TemplateName": JSON.parse(arr[j].template).Name,
                                    "GeographyCode": arr[j].GeographyCode,
                                    "GeographyDescription": arr[j].GeographyDescription,
                                    "MasterDetails": JSON.parse(arr[j].MasterDetails),
                                    "StartDate": new Date(JSON.parse(arr[j].MasterDetails).StartDate),
                                    "EndDate": new Date(JSON.parse(arr[j].MasterDetails).EndDate),
                                    "ContractValue": JSON.parse(arr[j].MasterDetails).ContractValue,
                                    "CustomerName": JSON.parse(arr[j].customer).Name,
                                    "template": arr[j].template,
                                    "CustomerIBAN": arr[j].CustomerIBAN,
                                    "Comment": arr[j].Commentary,
                                    "BudgetName": arr[j].BudgetAccount,
                                    "CreationDate": arr[j].CreatedOn,
                                    "Owner": arr[j].CreatedBy.toLowerCase(),
                                    "Commentary": arr[j].Commentary,
                                    "DocumentNumber": arr[j].DocumentNumber,
                                    "SignatureType": arr[j].SignatureType,
                                    "SignatureStatus": arr[j].SignatureStatus,
                                    "Email": arr[j].Email,
                                    "EmailRepresentative": arr[j].EmailRepresentative,
                                    "CustomerSignature": arr[j].CustomerSignature,
                                    "CustomerRepresentativeSignature": arr[j].CustomerRepresentativeSignature
                                };
                            }
                            else if (vm.selectedDocumentType.Code.indexOf("_Cancelation") !== -1) {
                                document = {
                                    "customer": arr[j].customer,
                                    "DocumentId": arr[j].DocumentId,
                                    "DocTypeId": arr[j].DocTypeId,
                                    "IdStep": arr[j].IdStep,
                                    "StepCode": arr[j].StepCode,
                                    "StepName": arr[j].StepName,
                                    "Name": arr[j].Name,
                                    "Code": vm.selectedDocumentType.Code,
                                    "TemplateName": JSON.parse(arr[j].template).Name,
                                    "MasterDetails": JSON.parse(arr[j].MasterDetails),
                                    "CustomerName": JSON.parse(arr[j].customer).Name,
                                    "template": arr[j].template,
                                    "Comment": arr[j].Commentary,
                                    "CreationDate": arr[j].CreatedOn,
                                    "Owner": arr[j].CreatedBy.toLowerCase(),
                                    "Commentary": arr[j].Commentary,
                                    "DocumentNumber": arr[j].DocumentNumber,
                                    "AgreementId": arr[j].AgreementId,
                                    "RevokedDate": JSON.parse(arr[j].MasterDetails).CancelationDate != undefined ? $filter('date')(new Date(JSON.parse(arr[j].MasterDetails).CancelationDate), 'yyyy-MM-dd') : '',
                                    "Reason": JSON.parse(arr[j].MasterDetails).Reason,
                                    "   ": arr[j].Signature_Type,
                                    "SignatureType": arr[j].SignatureType,
                                    "SignatureStatus": arr[j].SignatureStatus,
                                    "Email": arr[j].Email,
                                    "EmailRepresentative": arr[j].EmailRepresentative,
                                    "CustomerSignature": arr[j].CustomerSignature,
                                    "CustomerRepresentativeSignature": arr[j].CustomerRepresentativeSignature

                                };
                            }
                            else if (vm.selectedDocumentType.Code == "PT_IBAN") {
                                document = {
                                    "customer": arr[j].customer,
                                    "DocumentId": arr[j].DocumentId,
                                    "DocTypeId": arr[j].DocTypeId,
                                    "IdStep": arr[j].IdStep,
                                    "StepCode": arr[j].StepCode,
                                    "StepName": arr[j].StepName,
                                    "Name": arr[j].Name,
                                    "Code": vm.selectedDocumentType.Code,
                                    "TemplateName": JSON.parse(arr[j].template).Name,
                                    "MasterDetails": JSON.parse(arr[j].MasterDetails),
                                    "CustomerName": JSON.parse(arr[j].customer).Name,
                                    "template": arr[j].template,
                                    "Comment": arr[j].Commentary,
                                    "CreationDate": arr[j].CreatedOn,
                                    "Owner": arr[j].CreatedBy.toLowerCase(),
                                    "Commentary": arr[j].Commentary,
                                    "DocumentNumber": arr[j].DocumentNumber,
                                    "IBAN": JSON.parse(arr[j].CustomerIBAN).IBAN,
                                    "NIF": JSON.parse(arr[j].customer).TaxNumber,
                                    "CustomerIBAN": arr[j].CustomerIBAN,
                                    "SignatureType": arr[j].SignatureType,
                                    "SignatureStatus": arr[j].SignatureStatus,
                                    "Email": arr[j].Email,
                                    "EmailRepresentative": arr[j].EmailRepresentative,
                                    "CustomerSignature": arr[j].CustomerSignature,
                                    "CustomerRepresentativeSignature": arr[j].CustomerRepresentativeSignature
                                };
                            }
                            else if (vm.selectedDocumentType.Code.indexOf("_DigitalAgreement") !== -1) {
                                document = {


                                    "DocumentId": arr[j].DocumentId,
                                    "DocTypeId": arr[j].DocTypeId,
                                    "IdStep": arr[j].IdStep,
                                    "StepCode": arr[j].StepCode,
                                    "StepName": arr[j].StepName,
                                    "Name": arr[j].Name,
                                    "Code": vm.selectedDocumentType.Code,
                                    "DD": JSON.parse(arr[j].DD),
                                    "customer": arr[j].customer,
                                    "CustomerName": JSON.parse(arr[j].DD).CustomerName,
                                    "TemplateName": JSON.parse(arr[j].template).Name,
                                    "Offer": JSON.parse(arr[j].DD).Offer,
                                    "template": arr[j].template,
                                    "Comment": arr[j].Commentary,
                                    "CreationDate": arr[j].CreatedOn,
                                    "Owner": arr[j].CreatedBy.toLowerCase(),
                                    "Commentary": arr[j].Commentary,
                                    "DocumentNumber": arr[j].DocumentNumber,
                                    "SignatureType": arr[j].SignatureType,
                                    "SignatureStatus": arr[j].SignatureStatus,
                                    "Email": arr[j].Email,
                                    "EmailRepresentative": arr[j].EmailRepresentative,
                                    "CustomerSignature": arr[j].CustomerSignature,
                                    "CustomerRepresentativeSignature": arr[j].CustomerRepresentativeSignature

                                };
                            }
                            else if (vm.selectedDocumentType.Code.indexOf("_DigitalForm") !== -1) {


                                document = {

                                    "DocumentId": arr[j].DocumentId,
                                    "DocTypeId": arr[j].DocTypeId,
                                    "IdStep": arr[j].IdStep,
                                    "StepCode": arr[j].StepCode,
                                    "StepName": arr[j].StepName,
                                    "Name": arr[j].Name,
                                    "Code": vm.selectedDocumentType.Code,
                                    "customer": arr[j].customer,
                                    "CustomerName": arr[j].customer != null && arr[j].customer != "undefined" ? JSON.parse(arr[j].customer).Name : 'no customer',
                                    "TemplateName": JSON.parse(arr[j].template).Name,
                                    "template": arr[j].template,
                                    "Comment": arr[j].Commentary,
                                    "CreationDate": arr[j].CreatedOn,
                                    "Owner": arr[j].CreatedBy.toLowerCase(),
                                    "Commentary": arr[j].Commentary,
                                    "DocumentNumber": arr[j].DocumentNumber,
                                    "SignatureType": arr[j].SignatureType,
                                    "SignatureStatus": arr[j].SignatureStatus,
                                    "Email": arr[j].Email,
                                    "EmailRepresentative": arr[j].EmailRepresentative,
                                    "CustomerSignature": arr[j].CustomerSignature,
                                    "CustomerRepresentativeSignature": arr[j].CustomerRepresentativeSignature
                                };
                            }

                            vm.documents[j] = document;

                        }

                        //Assigns the loaded documents to the cached documents
                        //and sets the var tha controls if the docs have been modified or not
                        if (vm.selectedDocumentType.Code.indexOf('_Agreement') != -1) {
                            vm.cachedDocuments.agreement = angular.copy(vm.documents);
                            $sessionStorage.isDocumentsModifed.agreement = false;
                        } else if (vm.selectedDocumentType.Code.indexOf('_Cancelation') !== -1) {
                            vm.cachedDocuments.cancelation = angular.copy(vm.documents);
                            $sessionStorage.isDocumentsModifed.cancelation = false;
                        } else if (vm.selectedDocumentType.Code.indexOf('_IBAN') !== -1) {
                            vm.cachedDocuments.iban = angular.copy(vm.documents);
                            $sessionStorage.isDocumentsModifed.iban = false;
                        } else if (vm.selectedDocumentType.Code.indexOf('_DigitalAgreement') !== -1) {
                            vm.cachedDocuments.digitalAgreement = angular.copy(vm.documents);
                            $sessionStorage.isDocumentsModifed.digitalAgreement = false;
                        } else if (vm.selectedDocumentType.Code.indexOf('_DigitalForm') !== -1) {
                            vm.cachedDocuments.digitalForm = angular.copy(vm.documents);
                            $sessionStorage.isDocumentsModifed.digitalForm = false;
                        }


                        setTimeout(continueExecution, 1000) //wait 1 second before continue for angular tables render all the data

                        function continueExecution() {
                            //Sets the documents as loaded
                            vm.documentsLoaded = true;
                            $scope.$apply();

                        }
                    } else {
                        vm.documentsLoaded_NoDocuments = true;
                    }

                });
            }

        });

    }


    vm.deleteDocument = function () {
        swal({
            title: "Are you sure?",
            text: "You will delete the document.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: false
        }, function (isConfirm) {
            if (isConfirm) {
                $q.all([documentData.DeleteDocument(vm.currentItem)]).then(function (result) {
                    if (result[0] == 1) {
                        swal({
                            title: "Success",
                            text: "Document deleted.",
                            type: "success"
                        }, function () {
                            $('#modalAgreementDetail').modal('toggle');
                            $scope.$apply(function () {
                                $location.path('/home');
                            });

                            vm.updateView();
                        });
                    } else {
                        swal({ title: "Error", text: "Document not deleted.", type: "error" });
                    }
                });
            } else {
                swal("Cancelled", "", "error");
            }
        });
    }

    function OpenModal(item) {
        vm.currentItem = item;
        vm.getWorkflowHistory();

        vm.availableStatus = [];
        vm.workflow = 0;

        vm.hideDelete = !["Draft", "DraftOnCloud"].includes(item.StepCode);


        $q.all([updateData.GetLocalData("DocumentType", "*", "WHERE Id = " + item.DocTypeId)])
            .then(function (result) {
                var Idworkflow = result[0][1][0].IdWorkflow;


                $q.all([updateData.GetLocalData("Step", "*", "WHERE Id = " + item.IdStep)])
                    .then(function (resultstep) {
                        if (resultstep[0][1] != undefined) {
                            var step = { Code: resultstep[0][1][0].Code, Name: resultstep[0][1][0].Description, Id: resultstep[0][1][0].Id };
                            vm.availableStatus.push(step);
                            vm.selectedStep = step;
                        }

                        $q.all([updateData.GetLocalData("WorkflowStep", "*", "WHERE IdWorkflow = " + Idworkflow + " AND Step1 = " + item.IdStep + " AND Frontend = 'true'")])
                            .then(function (result2) {
                                //vm.availableStatus = result2[0][1];
                                for (var i = 0; i != result2[0][1].length; ++i) {
                                    var obj = result2[0][1][i];

                                    $q.all([updateData.GetLocalData("Step", "*", "WHERE Id = " + obj.Step2)])
                                        .then(function (result3) {
                                            if (result3[0][1] != undefined && result3[0][1].length > 0) {
                                                var step = { Code: result3[0][1][0].Code, Name: result3[0][1][0].Description, Id: result3[0][1][0].Id };
                                                if (step.Code == "Ended") {
                                                    if (vm.currentItem != undefined && new Date(vm.currentItem.EndDate) <= new Date().setHours(0, 0, 0, 0))
                                                        vm.availableStatus.push(step);
                                                }
                                                else
                                                    vm.availableStatus.push(step);
                                                //else
                                                //    vm.availableStatus.push(step);
                                            }

                                        });
                                }


                            });


                    });




            });



        var workflowSteps = [];

        var start = item.DMVStartDate;
        if (vm.DateIsNullOrEmptyOrUndefinedOrMin(start))
            start = "";
        else
            start = $filter('date')(new Date(start), 'dd-MM-yyyy');

        var end = item.DMVEndDate;
        if (vm.DateIsNullOrEmptyOrUndefinedOrMin(end))
            end = "";
        else
            end = $filter('date')(new Date(end), 'dd-MM-yyyy');

        var created = item.DocumentCreatedOn;
        if (vm.DateIsNullOrEmptyOrUndefinedOrMin(created))
            created = "";
        else
            created = $filter('date')(new Date(created), 'dd-MM-yyyy');

        var revoked = item.WorkflowHistoryRevokeDate;
        if (vm.DateIsNullOrEmptyOrUndefinedOrMin(revoked))
            revoked = "";
        else
            revoked = $filter('date')(new Date(revoked), 'dd-MM-yyyy');

        var Signature_Status = "iPad Signature";
        var Signature_Type = '';

        if ((item.SignatureType == 'true') || (item.SignatureType == 'True')) {
            Signature_Type = "Remote Signature";
        } else {
            if ((item.SignatureType == 'false') || (item.SignatureType == 'False')) {
                Signature_Type = "iPad Signature";
            }
            else {
                Signature_Type = 'Without Value';
            }
        }

        switch (item.SignatureStatus) {
            case '0':
                Signature_Status = 'Pending';
                break;
            case '1':
                Signature_Status = 'Signatured';
                break;
            case '2':
                Signature_Status = 'Without Email';
                break;
            case '3':
                Signature_Status = 'Error - Mail Sending';
                break;
            case '4':
                Signature_Status = 'Error - Without Email Template';
                break;
            case '5':
                Signature_Status = 'Pending Signature Customer';
                break;
            case '6':
                Signature_Status = 'Pending Signature Customer Representative';
                break;
            case '7':
                Signature_Status = 'Error - Mail Sending to Customer';
                break;
            case '8':
                Signature_Status = 'Error - Mail Sending to Customer Representative';
                break;
            case '9':
                Signature_Status = 'Error - Mail Sending to Customer and Representative';
                break;
            default:
                Signature_Status = 'Without Value';
                break;
        }




        $('#modal-body-signature-type').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(Signature_Type) + '</div>');
        $('#modal-body-signature-status').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(Signature_Status) + '</div>');

        if (vm.currentItem.Code.indexOf("_Agreement") !== -1) {
            $('#modal-body-id').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.DocumentId) + '</div>');
            $('#modal-body-owner').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.DocumentCreatedBy) + '</div>');
            $('#modal-body-customer').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CustomerName) + '</div>');
            $('#modal-body-poscode').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CustomerCode) + '</div>');
            $('#modal-body-template').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.TemplateName) + '</div>');
            $('#modal-body-value').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.MasterDetails.ContractValue) + '</div>');
            $('#modal-body-territory').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.GeographyDescription) + '</div>');
            $('#modal-body-startdate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined($filter('date')(new Date(item.MasterDetails.StartDate), 'dd-MM-yyyy')) + '</div>');
            $('#modal-body-enddate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined($filter('date')(new Date(item.MasterDetails.EndDate), 'dd-MM-yyyy')) + '</div>');
            $('#modal-body-createdate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CreationDate) + '</div>');
        }

        if (vm.currentItem.Code.indexOf("_Cancelation") !== -1) {
            $('#modal-body-id').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.DocumentId) + '</div>');
            $('#modal-body-owner').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.Owner) + '</div>');
            $('#modal-body-customer').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CustomerName) + '</div>');
            $('#modal-body-template').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.TemplateName) + '</div>');
            $('#modal-body-agreementId').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.AgreementId) + '</div>');
            if (item.MasterDetails.CancelationDate == '' || item.MasterDetails.CancelationDate == null || item.MasterDetails.CancelationDate == undefined) {
                $('#modal-body-revokedDate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.MasterDetails.CancelationDate) + '</div>');

            } else {
                $('#modal-body-revokedDate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(($filter('date')(new Date(item.MasterDetails.CancelationDate), 'dd-MM-yyyy'))) + '</div>');
            }
            $('#modal-body-reason').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.MasterDetails.Reason) + '</div>');
            $('#modal-body-createdate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CreationDate) + '</div>');

        }

        if (vm.currentItem.Code.indexOf("_IBAN") !== -1) {
            $('#modal-body-id').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.DocumentId) + '</div>');
            $('#modal-body-owner').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.Owner) + '</div>');
            $('#modal-body-customer').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CustomerName) + '</div>');
            $('#modal-body-template').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.TemplateName) + '</div>');
            $('#modal-body-iban').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.IBAN) + '</div>');
            $('#modal-body-nif').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.NIF) + '</div>');
            $('#modal-body-createdate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CreationDate) + '</div>');

        }


        if (vm.currentItem.Code.indexOf("_DigitalAgreement") !== -1) {
            $('#modal-body-id').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.DocumentId) + '</div>');
            $('#modal-body-owner').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.Owner) + '</div>');
            $('#modal-body-customer').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CustomerName) + '</div>');
            $('#modal-body-template').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.TemplateName) + '</div>');
            $('#modal-body-createdate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CreationDate) + '</div>');

        }

        if (vm.currentItem.Code.indexOf("_DigitalForm") !== -1) {
            $('#modal-body-id').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.DocumentId) + '</div>');
            $('#modal-body-owner').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.Owner) + '</div>');
            $('#modal-body-customer').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CustomerName) + '</div>');
            $('#modal-body-template').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.TemplateName) + '</div>');
            $('#modal-body-createdate').html('<div>' + vm.ForceEmptyStringIfNullorUndefined(item.CreationDate) + '</div>');

        }

        $('#modalAgreementDetail').modal('toggle');


    };

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    $('#modalAgreementDetail').on('hidden.bs.modal', function () {

        if (vm.selectedStep.Id != vm.currentItem.IdStep) {
            //UPDATE STEP
            vm.currentItem.Comment = (vm.currentItem.Comment != null && vm.currentItem.Comment != "null" ? vm.currentItem.Comment : "");
            var query = 'UPDATE Document SET IdStep = ' + vm.selectedStep.Id + ", Commentary = '" + vm.currentItem.Comment.replace(/'/g, "''") + "' WHERE Id = '" + vm.currentItem.DocumentId + "'";
            $q.all([updateData.ExecuteCustomQuery(query)])
                .then(function (result) {
                    if (result[0].rowsAffected != undefined && result[0].rowsAffected > 0) {
                        swal({
                            title: "Status Updated",
                            text: "Document Status has been updated.",
                            type: "success",
                            closeOnConfirm: true
                        },
                            function (isConfirm) {
                                $scope.$apply(function () {
                                    $location.path('/home');
                                });
                                vm.updateView();
                            });
                    }
                    else {

                    }

                });

            var workflowGuid = generateUUID();
            var username = $scope.$parent.globals.currentUser.username;
            var today = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var query = 'Insert into WorkflowHistory (Id, IdDocument,IdStep1,IdStep2,Action,Comment, CreatedOn, CreatedBy) Values ("'
                + workflowGuid + '","' + vm.currentItem.DocumentId + '",' + vm.currentItem.IdStep + ',' + vm.selectedStep.Id + ',"","' + vm.currentItem.Comment.replace(/'/g, "''") + '","' + today + '","' + username + '")';
            $q.all([updateData.ExecuteCustomQuery(query)])
                .then(function (result) {

                    var queryDoc = "UPDATE Document Set Commentary = '" + vm.currentItem.Comment + "' where Id = '" + vm.currentItem.DocumentId + "'";

                    $q.all([updateData.ExecuteCustomQuery(queryDoc)])
                        .then(function (result) {





                        });


                });



        }


    })

    vm.edit = function () {

        $sessionStorage.DocumentPreview = undefined;
        $sessionStorage.Document = vm.currentItem;
        $q.all([updateData.GetLocalData("DocumentModuleValue", "*", 'WHERE IdDocument = "' + vm.currentItem.DocumentId + '"')])
            .then(function (result) {
                $('.modal-backdrop').remove();
                $sessionStorage.Document.DocumentModuleValues = result[0][1];
                $location.path('/editdocument');
            });
    }

    vm.print = function () {


        $sessionStorage.DocumentPreview = vm.currentItem;
        $sessionStorage.Document = undefined;
        $q.all([updateData.GetLocalData("DocumentModuleValue", "*", 'WHERE IdDocument = "' + vm.currentItem.DocumentId + '"')])
            .then(function (result) {
                $sessionStorage.DocumentPreview.DocumentModuleValues = result[0][1];
                $location.path('/preview');

                $sessionStorage.print = true;

                $('.modal-backdrop').remove();

            });
    }

    vm.preview = function () {


        $sessionStorage.DocumentPreview = vm.currentItem;
        $sessionStorage.Document = undefined;
        $q.all([updateData.GetLocalData("DocumentModuleValue", "*", 'WHERE IdDocument = "' + vm.currentItem.DocumentId + '"')])
            .then(function (result) {
                $sessionStorage.DocumentPreview.DocumentModuleValues = result[0][1];
                $location.path('/preview');

                $('.modal-backdrop').remove();

            });
    }

    vm.sendEmail = function (item) {

        if (item == undefined) item = vm.currentItem;
        var customerTmp;
        if (item.customer) customerTmp = JSON.parse(item.customer);
        $('#modal-to-template').val('');
        if (customerTmp)
            if (customerTmp.Email)
                $('#modal-SendMailto-template').val(customerTmp.Email);


        documentData.Configurations('EmailSendContractSubject').then(
            function (res) {
                if (res) {
                    res = (res + '').replace('{StepName}', item.StepName);
                    $('#modal-SendMailsubject-template').val(res);
                }
            });
        documentData.Configurations('EmailSendContractBody').then(
            function (res) {
                if (res) {
                    res = res.replace('{StepName}', item.StepName);
                    $('#modal-SendMailbody-template').val(res);
                }
            });

        $('#modalAgreementSendMail').modal('toggle');

    }

    vm.showErrorList = function () {
        $('#modalShowErrorList').modal('toggle');
    }

    vm.resendEmailRemote = function (item) {
        var customerTmp;
        if (item == undefined) {
            item = vm.currentItem;
        }
        if (item.customer) customerTmp = JSON.parse(item.customer);
        if (item.template) template = JSON.parse(item.template);

        if (customerTmp != undefined) {
            $('#modal-SendMailto-template-remote').val(customerTmp.Email);
        } else if (item != undefined) {
            $('#modal-SendMailto-template-remote').val(item.Email);
        } else {
            $('#modal-SendMailto-template-remote').val("");
        }


        if (item.CustomerSignature == '3') {
            $('input:radio[name=person_remote][value=customer]').prop('checked', true);
            $('input:radio[name=person_remote][value=customer]').parent().removeAttr('style').addClass('col-md-5');
        } else {
            $('input:radio[name=person_remote][value=customer]').parent().css('visibility', 'hidden').css('display', 'none').removeClass('col-md-5');
        }

        if (item.CustomerRepresentativeSignature == '3') {
            $('input:radio[name=person_remote][value=cr]').parent().removeAttr('style').addClass('col-md-5');
            if (item.CustomerSignature != '3') {
                $('input:radio[name=person_remote][value=cr]').prop('checked', true);
            }
        } else {
            $('input:radio[name=person_remote][value=cr]').parent().css('visibility', 'hidden').css('display', 'none').removeClass('col-md-5');
        }





        $('#modalAgreementSendMailRemote').modal('toggle');
    }
    //llega hasta aquì

    vm.hideEdit = function () {
        if (vm.currentItem != undefined)
            return !(vm.currentItem.StepCode == "Draft" || vm.currentItem.StepCode == "DraftOnCloud");
    }
    vm.isSending = false;

    vm.CompleteSendEmail = function () {
        if (vm.isSending) return;
        vm.isSending = true;
        //validate if email is valid
        if ($('form#formSendEmail input#modal-SendMailto-template').val() != '' && $('form#formSendEmail input#modal-SendMailto-template').val().indexOf('@') > 0) {
            var item = vm.currentItem;
            var toMail = $('#modal-SendMailto-template').val();
            var subjectmail = $('#modal-SendMailsubject-template').val();
            var bodymail = $('#modal-SendMailbody-template').val();
            var userName = vm.rootscope.globals.currentUser.username;
            var html;

            documentData.DocumentHTML(item).then(
                function (res) {
                    if (res) {
                        html = res;
                    }
                }).then(function () {
                    var url = serviceUrl + "/api/SendDocumentEmail/" + item.DocumentId;
                    $http(
                        {
                            method: 'POST',
                            url: url,
                            data: {
                                "to": toMail,
                                "subject": subjectmail,
                                "body": bodymail,
                                "html": html,
                                "market": vm.rootscope.globals.currentUser.market,
                                "userName": userName,
                                "customerId": item.customer == null ? JSON.parse('[]').Id : JSON.parse(item.customer).Id,
                                "templateId": item.template == null ? JSON.parse('[]').Id : JSON.parse(item.template).Id,
                            },
                            headers: { 'Content-Type': 'application/json' }
                        }
                    ).success(function (response) {
                        swal(response, "Send Mail", "success");
                        $('#modalAgreementSendMail').modal('toggle');
                        vm.isSending = false;
                    }).error(function (data) {
                        console.log(data);
                        swal({ title: "Error sending email, please try again later.", text: "Send Mail", type: "error" });
                        vm.isSending = false;
                    });
                });
        }
    }
    // llega hasta aqui 2

    vm.CompleteSendEmailRemote = function () {
        if (vm.isSending) return;
        vm.isSending = true;

        let item = vm.currentItem;
        var template;
        var customerTmp;

        if (item.customer) customerTmp = JSON.parse(item.customer);
        if (item.template) template = JSON.parse(item.template);
        //
        let toMail = $('#modal-SendMailto-template-remote').val();
        let person_remote = $("input[name='person_remote']:checked").val();
        let customerId = customerTmp.Id;
        let idMarket = template.IdMarket;

        if ((toMail != '') && (toMail.indexOf('@') > 0)) {
            var url = serviceUrl + "/api/ReSendMailRemoteSignature/" + item.DocumentId;
            $http({
                method: 'POST',
                url: url,
                data: {
                    "to": toMail,
                    "customerId": customerId,
                    "idMarket": idMarket.toString(),
                    "type": person_remote
                },
                headers: { 'Content-Type': 'application/json' }
            }).success(function (response) {
                swal(response, "Send Mail", "success");
                $('#modalAgreementSendMailRemote').modal('toggle');
                vm.isSending = false;
                let text = response.text;
                switch (response.code) {
                    case "1":
                        swal({ title: "Attention!", text: "Send Mail", type: "success" });
                        break;
                    case "2":
                        swal("Attention!", text, "warning");
                        break;
                    default:
                        swal("Attention!", "Bad Request", "error");
                        break;
                }
            }).error(function (data) {
                console.log(data);
                swal({ title: "Error sending email, please try again later.", text: "Send Mail", type: "error" });
                vm.isSending = false;
            });
        } else {
            vm.isSending = false;
            swal("Attention!", "Email cannot be empty or enter valid Email Address")
        }
    }

    vm.takePicture = function () {
        var Camera = navigator.camera;

        navigator.camera.getPicture(onSuccess, onFail,
            {
                sourceType: Camera.PictureSourceType.CAMERA,
                correctOrientation: true,
                quality: 75,
                targetWidth: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                encodingType: Camera.EncodingType.PNG,
                saveToPhotoAlbum: false
            });
        function onSuccess(imageData) {
            var image = document.getElementById('myImage');
            image.src = "data:image/jpeg;base64," + imageData;
        }

        function onFail(message) {
            if (appConstants.debug) {
                alert('Failed because: ' + message);
            }
        }
    }


    vm.getWorkflowHistory = function (currentItem) {
        $q.all([updateData.GetLocalData("WorkflowHistory", "*", 'WHERE IdDocument = "' + vm.currentItem.DocumentId + '" ORDER BY CreatedOn ASC')])
            .then(function (result) {
                vm.workflowHistory = result[0][1];

                vm.workflowHistory.sort(function (a, b) {
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return new Date(b.CreatedOn) - new Date(a.CreatedOn);
                });

                $q.all([updateData.GetLocalData("Step", "*")])
                    .then(function (result) {
                        for (var i = 0; i < vm.workflowHistory.length; ++i) {
                            var step1 = Enumerable.From(result[0][1])
                                .Where(function (item) { return item.Id == vm.workflowHistory[i].IdStep1; })
                                .ToArray();
                            var step2 = Enumerable.From(result[0][1])
                                .Where(function (item) { return item.Id == vm.workflowHistory[i].IdStep2; })
                                .ToArray();
                            vm.workflowHistory[i].StepName1 = step1.length == 0 ? '' : step1[0].Description;
                            vm.workflowHistory[i].StepName2 = step2.length == 0 ? '' : step2[0].Description;
                            var date = $filter('date')(vm.workflowHistory[i].CreatedOn, 'yyyy-MM-dd HH:mm:ss');
                            vm.workflowHistory[i].CreatedOn = date;
                        }
                    });

            });
    }

    vm.hideSendSignatureEmail = function () {
        if (vm.currentItem != undefined) {
            if (vm.currentItem.SignatureType != null) {
                let signatureType = vm.currentItem.SignatureType.toLowerCase();
                if (signatureType == 'true' && !(vm.currentItem.StepCode == 'Draft' || vm.currentItem.StepCode == 'DraftOnCloud')) {
                    return false;
                }
            }
        }
        return true;
    }

    vm.prueba = function () {
        $q.all([readData.getSelectedTemplateReplaced('ee3ac6c1-ec7b-43ec-8167-445eb5f3f911', '8171')]).then(data => {
            console.log(data);
        });
    }
}
