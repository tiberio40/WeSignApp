app.controller('MdAgreementController', MdAgreementController);

function MdAgreementController($scope, $location, updateData, $q, $sessionStorage, readData) {

    var vm = this;
    vm.showTable = false;
    vm.Code = "ag_mstrdtl";
    var parentController = $scope.$parent.$parent.vm;
    vm.masterdetails = parentController.agreement_masterDetails;
    vm.market = parentController.market;
    parentController.canGoToNextStep = true;
    vm.options = {
        date: new Date(),
        mode: 'date'
    };
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;
    vm.replacedDocuments = [];

    //Replace Documents
    if(parentController.template.IdDocumentType == 12 && parentController.template.IsReplace == 'true' && parentController.template.IdMarket == 4){
        
        var replacedTemplate = JSON.parse(parentController.template.ReplacedTemplate);
        replacedTemplate = replacedTemplate.map(x => x.Id);

        replacedTemplate = replacedTemplate.join(',');
        var documentId = ''
        try {
            documentId = $sessionStorage.Document.DocumentId;
        } catch (error) {}
            

        $q.all([readData.getSelectedTemplateReplaced(parentController.client.Id, replacedTemplate, documentId)]).then(data => {
            vm.replacedDocuments = data[0];
            if(data[0].length > 0){
                vm.showTable = true;
                var document = data[0].filter(x => x.idStep == 2 || x.idStep == 4);
                parentController.deleteDocument = document.map(x => x.id);

            }
        });
    }

    vm.isNextMonthFromToday = function(){
        if(vm.masterdetails.NextMonthFromToday == true){
            var date = new Date();
            date.setDate(1);
            date.setMonth(date.getMonth() + 1);
            return date;
        }else{
            return new Date(parseInt(vm.masterdetails.StartDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1")));
        }
    }


    vm.iniciateController = function ()
    {
        //objecto que vai ser guardado no documento
        if (parentController.documentModules[vm.Code] == undefined) {
            vm.documentMasterDetails =
                {
                    'Name': parentController.template.Name,
                    'MaxValue': vm.masterdetails.Value.MaxValue,
                    'ContractValue': vm.masterdetails.Value.CurrentContractValue.DefaultValue,
                    'QuarterValue': vm.masterdetails.Value.QuarterValue == undefined || vm.masterdetails.Value.QuarterValue == '' ? 0 : vm.masterdetails.Value.QuarterValue,
                    'Multiplier': vm.masterdetails.Value.Multiplier == undefined || vm.masterdetails.Value.Multiplier == '' ? 1 : vm.masterdetails.Value.Multiplier,
                    'Renewable': vm.masterdetails.Renewable,
                    'StartDate': vm.isNextMonthFromToday(),
                    'EndDate': new Date(parseInt(vm.masterdetails.EndDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))),
                    'ApprovalLevels': vm.masterdetails.Value.ApprovalLevels,
                    'ShowQuarterValue': vm.masterdetails.Value.ShowQuarterValue == undefined ? false : vm.masterdetails.Value.ShowQuarterValue
                };
            parentController.documentMasterDetails = vm.documentMasterDetails;
            parentController.documentModules[vm.Code] = vm.documentMasterDetails;
        } else {
            vm.documentMasterDetails = parentController.documentModules[vm.Code];
            parentController.documentMasterDetails = vm.documentMasterDetails;

            vm.documentMasterDetails.StartDate = new Date(vm.documentMasterDetails.StartDate);
            vm.documentMasterDetails.EndDate = new Date(vm.documentMasterDetails.EndDate);
        }
        vm.validateQuarterValue();
        vm.validateCurrentContractValue();
        vm.validateDates();
    }
   

    vm.navigateTo2 = function ()
    {
        $location.path(to);
    }

    vm.IsContractValueEditable = function () 
    {
        if (vm.masterdetails.Value.CurrentContractValue.Editable == true || vm.masterdetails.Value.CurrentContractValue.Editable == 'true')
            return false;
        return true;
    }

    vm.validateCurrentContractValue = function ()
    {
        if (vm.market.Code == 'PT' && vm.documentMasterDetails.ShowQuarterValue == true)
        {
            vm.documentMasterDetails.ContractValue = Number(vm.documentMasterDetails.QuarterValue) * Number(vm.documentMasterDetails.Multiplier);
        }

        vm.IsContractValueValid = true;
        vm.ContractValueValidationMessage = "";
        if(vm.documentMasterDetails.ContractValue > vm.documentMasterDetails.MaxValue)
        {
            vm.IsContractValueValid = false;
            vm.ContractValueValidationMessage = "The CV cannot be superior to the MV Contract Value";
        }
        parentController.addValidation("Master Details", "CV Input", vm.IsContractValueValid, vm.ContractValueValidationMessage);
    }

    vm.validateQuarterValue = function () {
        vm.IsQuarterValueValid = true;
        vm.QuarterValueValidationMessage = "";
        if (vm.market.Code == 'PT' && vm.documentMasterDetails.ShowQuarterValue == true)
        {
            if (vm.documentMasterDetails.QuarterValue == '' || Number(vm.documentMasterDetails.QuarterValue) == 0) {
                vm.IsQuarterValueValid = false;
                vm.QuarterValueValidationMessage = "The QV is mandatory and cannot be 0.";
             }
        }
        parentController.addValidation("Master Details", "QV Input", vm.IsQuarterValueValid, vm.QuarterValueValidationMessage);
    }

    vm.validateDates = function () {
        vm.IsDateValueValid = true;
        vm.DateValueValidationMessage = "";
        if (vm.documentMasterDetails.StartDate > vm.documentMasterDetails.EndDate) {
            vm.IsDateValueValid = false;
            vm.DateValueValidationMessage = "Start Date cannot be superior to the End Date";
        }
        if (vm.masterdetails.StartDate.Visible) {
            if (!vm.documentMasterDetails.StartDate || vm.documentMasterDetails.StartDate.toString() === "Invalid Date") {
                vm.IsDateValueValid = false;
                vm.DateValueValidationMessage += "Start Date is invalid.";
            }
        }
        if (vm.masterdetails.EndDate.Visible) {
            if (!vm.documentMasterDetails.EndDate || vm.documentMasterDetails.EndDate.toString() === "Invalid Date") {
                vm.IsDateValueValid = false;
                vm.DateValueValidationMessage += "End Date is invalid.";
            }
        }
        parentController.addValidation("Master Details", "Start or End Date Input", vm.IsDateValueValid, vm.DateValueValidationMessage);
    }

    vm.startdateopen = function()
    {
        /*$cordovaDatePicker.show(vm.options).then(function (date) {
            alert(date);
        });*/
    }
  
    vm.iniciateController();

    readData.getSelectedTemplateReplaced();
}