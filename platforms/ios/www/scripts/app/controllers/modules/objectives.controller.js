app.controller('ObjectivesController', ObjectivesController);

function ObjectivesController($scope, $location, updateData, $q, $sessionStorage) {

    var vm = this;
    vm.Code = "ag_obj";
    vm.currencyToken = currencyToken;
    var parentController = $scope.$parent.$parent.vm;
    vm.navigateTo2 = navigateTo2;
    vm.isActive = [];
    vm.currentContractValue = parentController.documentMasterDetails.ContractValue;
    vm.reloadTotalValues = reloadTotalValues;
    parentController.canGoToNextStep = true;
    vm.min = 0;
    vm.max = 100;
    vm.totalWeigths = 0;
    vm.totalObjTotal = 0;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    //vm.currentContractValue = parentController.agreement_masterDetails.Value.CurrentContractValue.DefaultValue;
    //only objectives that are not deleted
    vm.objectives = Enumerable.From(parentController.objectives.Objectives)
                                    .Where(function (item) { return item.Deleted == false; })
                                    .OrderBy(function (item) { return item.Sort; })
                                    .ToArray();
                                    
    //TEMP
    //for (var i = 0; i != 10; ++i) {
    //    var a = {
    //        Deleted: false,
    //        Description: { DefaultValue: 'description description description description description description description description description description description ', Editable: true, Visible: true }, IsNew: false,
    //        Target: { DefaultValue: 'targettargettargettargettarge ttargettargettargettargetta rgettargettargettargettargettargettarge ttarget', Editable: true, Visible: true },
    //        Weight: { DefaultValue: '100', Editable: true, Visible: true }
    //    };

    //    vm.objectives.push(a);
    //}
    
    //objecto que vai ser guardado no documento
    if (parentController.documentModules[vm.Code] == undefined) {
        vm.documentObjectives = [];
        for (var i = 0; i < vm.objectives.length; ++i) {
            var documentObjective =
            {
                'Description': vm.objectives[i].Description.DefaultValue,
                'Target': vm.objectives[i].Target.DefaultValue,
                'Weight': vm.objectives[i].Weight.DefaultValue,
                'Total': (vm.objectives[i].ObjectiveTotal == '-' ? 0: vm.objectives[i].ObjectiveTotal),
                'Mandatory': vm.objectives[i].Mandatory,
                'Selected': vm.objectives[i].Mandatory,
                'DynamicItem': vm.objectives[i].DynamicItem
            };
            vm.documentObjectives[i] = documentObjective;
        }
        parentController.documentModules[vm.Code] = vm.documentObjectives;
    } else {
        vm.documentObjectives = parentController.documentModules[vm.Code];
    }

    for (var i = 0; i != vm.objectives.length; ++i) {
        vm.isActive.push(false);
        vm.documentObjectives[i].Total = (vm.currentContractValue > 0 ? (vm.documentObjectives[i].Weight * vm.currentContractValue) / 100 : 0);

    }

    reloadTotalValues();

    function reloadTotalValues() {
        vm.totalWeigths = 0;
        vm.totalObjTotal = 0;

        if (vm.objectives.length == 0)
            return;

        for (var i = 0; i != vm.documentObjectives.length; ++i) {
            if (vm.documentObjectives[i].Selected)
                vm.totalWeigths += Number(vm.documentObjectives[i].Weight);
        }

        for (var i = 0; i != vm.documentObjectives.length; ++i) {
            if (vm.documentObjectives[i].Selected)
                vm.totalObjTotal += Number(vm.documentObjectives[i].Total);
        }

        if(vm.totalWeigths != 100)
        {
            parentController.addValidation("Objectives", "Total Weight", false, "The Weight total is not equal to 100.");
        }else
        {
            parentController.addValidation("Objectives", "Total Weight", true, "");
        }

    }

    function navigateTo2(to) {
        $location.path(to);
    }

    vm.select = function (item)
    {
        if (item.Mandatory == false)
        {
            item.Selected = !item.Selected
        }
        reloadTotalValues();
    }

    vm.selectNextStep = function () {
        parentController.selectNextStep();
    }
    vm.selectPrevStep = function () {


        parentController.selectPrevStep(vm.Code);
    }

    vm.changeTotal = function (item, $index) {

        vm.documentObjectives[$index].Weight = (vm.documentObjectives[$index].Weight <= vm.max && vm.documentObjectives[$index].Weight >= vm.min ? vm.documentObjectives[$index].Weight : (vm.documentObjectives[$index].Weight < vm.min ? vm.min : (vm.documentObjectives[$index].Weight > vm.max ? vm.max : 0)));
      
        vm.documentObjectives[$index].Total = (vm.currentContractValue > 0 ? (vm.documentObjectives[$index].Weight * vm.currentContractValue) / 100 : 0);

        reloadTotalValues();
    }
}