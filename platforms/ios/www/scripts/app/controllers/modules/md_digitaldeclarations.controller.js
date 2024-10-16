app.controller('MdDigitalController', MdDigitalController);

function MdDigitalController($scope, $location, updateData, $q, $filter, $sessionStorage) {

    var vm = this;
    vm.Code = "dd_mstrdtl";
    var parentController = $scope.$parent.$parent.vm;
    parentController.canGoToNextStep = true;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;


    $q.all([updateData.GetLocalData("ImportedAgreement", "*", " Where Signed = " + false)])
                              .then(function (result) {
                                  var importedAgreements = Enumerable.From(result[0][1])
                                      .ToArray();
                                  vm.importedAgreements = importedAgreements[0];
                              });

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