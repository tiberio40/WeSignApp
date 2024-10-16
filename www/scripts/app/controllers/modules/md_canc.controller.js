
app.controller('MdCancelController', MdCancelController);

function MdCancelController($scope, $sessionStorage, $location, updateData, $q, $filter, documentData, DTOptionsBuilder, DTColumnDefBuilder) {

    var vm = this;
    vm.Code = "canc_mstrdtl";
    var parentController = $scope.$parent.$parent.vm;

    parentController.canGoToNextStep = true;
    vm.ReasonChanged = ReasonChanged;
    vm.validateCancelationDate = validateCancelationDate;
    vm.validateDocumentSelection = validateDocumentSelection;
    vm.masterdetails = parentController.agreement_masterDetails;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    vm.documents = [];
    vm.rowClickHandler = rowClickHandler;
    //vm.IsReasonValid = false;
    //vm.ReasonValidationMessage = 'Reason is mandatory.';

    //vm.IsCancelationDateValid = false;
    //vm.CancelationDateValidationMessage = 'Cancelation Date is mandatory.';

    vm.IsDocumentSelected = false;
    //vm.DocumentValidationMessage = 'Select a document to cancel.';


    vm.dtColumns = [
        { Name: 'DocumentId', show: false }, { Name: 'DocumentNumber', show: true }, { Name: 'Owner', show: true }, { Name: 'Customer', show: true }, { Name: 'Template', show: true }, { Name: 'Creation Date', show: true }, { Name: 'Start Date', show: true },
           { Name: 'End Date', show: true }, { Name: 'Status', show: true }, { Name: 'Territory (Code)', show: true }, { Name: 'Value', show: true }, { Name: 'Comment', show: true }, { Name: 'Budget', show: true }
           , { Name: 'StepCode', show: false }
    ];

    //vm.dtOptions = DTOptionsBuilder.newOptions().withDOM('pitrfl').withPaginationType('');
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('bFilter', true).withDOM('tr').withOption('paging', false).withOption('rowCallback', rowCallback);

    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef([3, 4, 5]).withOption('type', 'date')

    ];

    if (parentController.documentModules[vm.Code] == undefined) {

        vm.documentMasterDetails =
            {
                'DocumentId': null,
                'CancelationDate': null,
                'Reason': null
            };

        parentController.documentMasterDetails = vm.documentMasterDetails;
        parentController.documentModules[vm.Code] = vm.documentMasterDetails;

    } else {
        vm.documentMasterDetails = parentController.documentModules[vm.Code];
        parentController.documentMasterDetails = vm.documentMasterDetails;

        if (vm.documentMasterDetails.CancelationDate != null && vm.documentMasterDetails.CancelationDate != undefined)
            vm.documentMasterDetails.CancelationDate = new Date(vm.documentMasterDetails.CancelationDate);
        //$sessionStorage.selectedDocumentId = vm.documentMasterDetails.DocumentId;
        vm.selectedDocumentId = vm.documentMasterDetails.DocumentId;//vm.documentMasterDetails.DocumentId;

       
    }

    function ReasonChanged() {
        vm.IsReasonValid = true;
        vm.ReasonValidationMessage = '';

        if (vm.documentMasterDetails.Reason == null || vm.documentMasterDetails.Reason == '') {
            vm.IsReasonValid = false;
            vm.ReasonValidationMessage = 'Reason is mandatory.';
        }
        parentController.addValidation("Master Details", "Reason", vm.IsReasonValid, vm.ReasonValidationMessage);

    }

    function validateCancelationDate() {
        var date = new Date(vm.documentMasterDetails.CancelationDate);

        vm.IsCancelationDateValid = true;
        vm.CancelationDateValidationMessage = '';

        if (date == 'Invalid Date' || vm.documentMasterDetails.CancelationDate == null) {
            vm.IsCancelationDateValid = false;
            vm.CancelationDateValidationMessage = 'Cancellation Date is mandatory.';
        }
        else {
            if (vm.documentMasterDetails.DocumentId != null && vm.documentMasterDetails.DocumentId != undefined && vm.documentMasterDetails.DocumentId != '') {
                var doc = Enumerable
                        .From(vm.documents)
                        .Where(function (item) { return item.DocumentId == vm.documentMasterDetails.DocumentId; })
                        .ToArray();

                var startdate = new Date(doc[0].StartDate);
                var enddate = new Date(doc[0].EndDate);

                if (date < startdate || date > enddate) {
                    vm.IsCancelationDateValid = false;
                    vm.CancelationDateValidationMessage = 'Cancellation Date needs to be between Agreement Start and End Date.';
                }
            }
        }
        parentController.addValidation("Master Details", "Cancellation Date", vm.IsCancelationDateValid, vm.CancelationDateValidationMessage);
    }


    function rowClickHandler(info) {
        //vm.message = info.id + ' - ' + info.firstName;
        //vm.selectedDocumentId = info[0];
        $sessionStorage.selectedDocumentId = info[0];
        vm.selectedDocumentId = info[0];
        parentController.selectedDocumentId = info[0];
        vm.documentMasterDetails.DocumentId = info[0];

        vm.IsDocumentSelected = true;
        vm.DocumentValidationMessage = '';

        validateDocumentSelection();
        validateCancelationDate();
    }

    function validateDocumentSelection() {
        vm.IsDocumentSelected = true;
        vm.DocumentValidationMessage = '';

        //if ($sessionStorage.selectedDocumentId == null || $sessionStorage.selectedDocumentId == undefined || $sessionStorage.selectedDocumentId == '') {
        //    vm.IsDocumentSelected = false;
        //    vm.DocumentValidationMessage = 'Select a document to cancel.';
        //}

        if (vm.documentMasterDetails.DocumentId == null || vm.documentMasterDetails.DocumentId == '' || vm.documentMasterDetails.DocumentId == undefined)
        {
                vm.IsDocumentSelected = false;
                vm.DocumentValidationMessage = 'Select a document to cancel.';
        }

        parentController.addValidation("Master Details", "Document to Cancel", vm.IsDocumentSelected, vm.DocumentValidationMessage);
    }

    function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
        $('td', nRow).unbind('click');
        $('td', nRow).bind('click', function () {
            $scope.$apply(function () {
                //alert($(nRow).index());
                $sessionStorage.selectedDocumentId = vm.documents[$(nRow).index()].DocumentId;
                vm.selectedDocumentId = vm.documents[$(nRow).index()].DocumentId;
                vm.documentMasterDetails.DocumentId = vm.documents[$(nRow).index()].DocumentId;
                vm.rowClickHandler(aData);
            });
        });
        return nRow;
    }
    Init();

    function Init() {


        if (vm.documentMasterDetails.DocumentId != undefined && vm.documentMasterDetails.DocumentId != null && vm.documentMasterDetails.DocumentId != "") {
            vm.IsDocumentSelected = true;
            vm.selectedDocumentId = vm.documentMasterDetails.DocumentId;
        }

        parentController.selectedDocumentId = vm.documentMasterDetails.DocumentId;

        if (vm.documentMasterDetails.DocumentId != undefined && vm.documentMasterDetails.DocumentId != null && vm.documentMasterDetails.DocumentId != '') {


            $q.all([documentData.GetDocumentByStepAndCustomer('"Approved", "Renewed"')])
                            .then(function (result) {

                                var arr = [];
                                var arrAux = Enumerable.From(result[0]).ToArray();
                                for (var i = 0; i != arrAux.length; ++i) {
                                    if (vm.documentMasterDetails.DocumentId != undefined && vm.documentMasterDetails.DocumentId != null && vm.documentMasterDetails.DocumentId != '') {
                                        if (arrAux[i].DocumentId == vm.documentMasterDetails.DocumentId) {
                                            arr.push(arrAux[i]);
                                        }
                                    }
                                }

                                if (arr != undefined && arr.length > 0) {

                                    vm.documents = []; // arr;
                                    for (var j = 0; j < arr.length; ++j) {

                                        if (parentController.client != undefined) {
                                            //validate client
                                            if (JSON.parse(arr[j].customer).Id == parentController.client.Id && arr[j].AgreementId == null) {
                                                var document = {
                                                    "customer": arr[j].customer,
                                                    "DocumentId": arr[j].DocumentId,
                                                    "DocTypeId": arr[j].DocTypeId,
                                                    "DocTypeName": arr[j].DocTypeName,
                                                    "IdStep": arr[j].IdStep,
                                                    "StepCode": arr[j].StepCode,
                                                    "StepName": arr[j].StepName,
                                                    "Name": arr[j].Name,
                                                    "TemplateName": JSON.parse(arr[j].template).Name,
                                                    "GeographyCode": arr[j].GeographyCode,
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
                                                    "DocumentNumber": arr[j].DocumentNumber

                                                };

                                                vm.documents.push(document);
                                            }
                                        }
                                        else {
                                            var document = {
                                                "customer": arr[j].customer,
                                                "DocumentId": arr[j].DocumentId,
                                                "DocTypeId": arr[j].DocTypeId,
                                                "DocTypeName": arr[j].DocTypeName,
                                                "IdStep": arr[j].IdStep,
                                                "StepCode": arr[j].StepCode,
                                                "StepName": arr[j].StepName,
                                                "Name": arr[j].Name,
                                                "TemplateName": JSON.parse(arr[j].template).Name,
                                                "GeographyCode": arr[j].GeographyCode,
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
                                                "DocumentNumber": arr[j].DocumentNumber

                                            };
                                            vm.documents.push(document);
                                        }



                                    }
                                }

                                ReasonChanged();
                                validateCancelationDate();
                                validateDocumentSelection();



                            });

        }
        else {

            $q.all([documentData.GetDocumentByStepAndCustomerWithRelations('"Approved", "Renewed"')])
                            .then(function (result) {

                                var arr = [];
                                var arrAux = Enumerable.From(result[0]).ToArray();
                                for (var i = 0; i != arrAux.length; ++i) {
                                    arr.push(arrAux[i]);
                                }

                                if (arr != undefined && arr.length > 0) {

                                    vm.documents = []; // arr;
                                    for (var j = 0; j < arr.length; ++j) {

                                        if (parentController.client != undefined) {
                                            //validate client
                                            if (JSON.parse(arr[j].customer).Id == parentController.client.Id && arr[j].AgreementId == null) {
                                                var document = {
                                                    "customer": arr[j].customer,
                                                    "DocumentId": arr[j].DocumentId,
                                                    "DocTypeId": arr[j].DocTypeId,
                                                    "DocTypeName": arr[j].DocTypeName,
                                                    "IdStep": arr[j].IdStep,
                                                    "StepCode": arr[j].StepCode,
                                                    "StepName": arr[j].StepName,
                                                    "Name": arr[j].Name,
                                                    "TemplateName": JSON.parse(arr[j].template).Name,
                                                    "GeographyCode": arr[j].GeographyCode,
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
                                                    "DocumentNumber": arr[j].DocumentNumber

                                                };

                                                vm.documents.push(document);
                                            }
                                        }
                                        else {
                                            var document = {
                                                "customer": arr[j].customer,
                                                "DocumentId": arr[j].DocumentId,
                                                "DocTypeId": arr[j].DocTypeId,
                                                "DocTypeName": arr[j].DocTypeName,
                                                "IdStep": arr[j].IdStep,
                                                "StepCode": arr[j].StepCode,
                                                "StepName": arr[j].StepName,
                                                "Name": arr[j].Name,
                                                "TemplateName": JSON.parse(arr[j].template).Name,
                                                "GeographyCode": arr[j].GeographyCode,
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
                                                "DocumentNumber": arr[j].DocumentNumber

                                            };
                                            vm.documents.push(document);
                                        }



                                    }
                                }

                                ReasonChanged();
                                validateCancelationDate();
                                validateDocumentSelection();



                            });
        }

    }
}