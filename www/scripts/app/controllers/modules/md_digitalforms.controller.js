app.controller('MdDigitalFormController', MdDigitalFormController);

function MdDigitalFormController($scope, $location, updateData, $q, $filter, $sessionStorage) {

    var vm = this;
    vm.Code = "df_mstrdtl";
    var parentController = $scope.$parent.$parent.vm;
    parentController.canGoToNextStep = true;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    vm.iniciateController = function () {
        //objecto que vai ser guardado no documento
        if (parentController.documentModules[vm.Code] == undefined) {
            vm.documentMasterDetails =
                {
                    'Name': parentController.template.Name
                };
            parentController.documentMasterDetails = vm.documentMasterDetails;
            parentController.documentModules[vm.Code] = vm.documentMasterDetails;
        } else {
            vm.documentMasterDetails = parentController.documentModules[vm.Code];
            parentController.documentMasterDetails = vm.documentMasterDetails;
        }
    }
    vm.iniciateController();
}