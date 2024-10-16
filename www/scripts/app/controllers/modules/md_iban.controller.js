app.controller('MdIbanController', MdIbanController);

function MdIbanController($scope, $location, documentData, $q, $filter, $sessionStorage) {

    var vm = this;
    vm.Code = "iban_mstrdtl";
    var parentController = $scope.$parent.$parent.vm;
    parentController.canGoToNextStep = true;

    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;


    vm.iniciateController = function () {

        //Check pending iban doc
        $q.all([documentData.GetPendingIbanDocument(parentController.client.Id)])
                  .then(function (result) {
                   
                  });


        //objecto que vai ser guardado no documento
        if (parentController.documentModules[vm.Code] == undefined) {
            vm.documentMasterDetails =
                {
                    'Name': parentController.template.Name,
                    'DocumentNumber': undefined
                };
            parentController.documentMasterDetails = vm.documentMasterDetails;
            parentController.documentModules[vm.Code] = vm.documentMasterDetails;
        } else {
            vm.documentMasterDetails = parentController.documentModules[vm.Code];
            parentController.documentMasterDetails = vm.documentMasterDetails;
        }
    }
    

  

    vm.startdateopen = function () {
        /*$cordovaDatePicker.show(vm.options).then(function (date) {
            alert(date);
        });*/
    }

    vm.iniciateController();
}