app.controller('IbanChangeController', MdDigitalController);

function MdDigitalController($scope, $location, updateData, $q, $filter, $sessionStorage) {

    var vm = this;
    vm.Code = "iban_change";
    var parentController = $scope.$parent.$parent.vm;
    parentController.canGoToNextStep = true;
    vm.currentclient = parentController.client;
    vm.market = parentController.market;
    vm.customerIBAN = parentController.clientIBAN;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    vm.iniciateController = function () {
        //objecto que vai ser guardado no documento

        $q.all([updateData.GetLocalData("CustomerIBAN", "*", ' Where IdCustomer = "' + vm.currentclient.Id + '" ORDER BY CreatedOn DESC')])
                          .then(function (result) {
                              var customerIBAN = Enumerable.From(result[0][1])
                              .ToArray();

                              if (customerIBAN.length > 0) {
                                  parentController.clientIBAN = vm.customerIBAN = angular.copy(customerIBAN[0]);
                                  vm.currentIBANNumber = vm.customerIBAN.IBAN;
                              } else {

                                  if (parentController.documentModules[vm.Code] == undefined) {
                                      var documentId = -1
                                      if ($sessionStorage.Document != undefined)
                                          documentId = $sessionStorage.Document.Id;

                                      parentController.clientIBAN =
                                      vm.customerIBAN =
                                          {
                                              'IdCustomer': vm.currentclient.Id,
                                              'IdDocument': documentId,
                                              'IBAN': null,
                                              'IBANImageValidation': null,
                                              'Active': false,
                                              'CreatedOn': new Date()
                                          }
                                      parentController.documentModules[vm.Code] = vm.customerIBAN;

                                  } else {
                                      vm.customerIBAN = parentController.documentModules[vm.Code];
                                      //vm.currentIBANNumber = vm.customerIBAN.IBAN;
                                  }

                              }
                              vm.validateIBAN();

                          });
    }

    vm.validateIBAN = function () {
        if (vm.customerIBAN != undefined && vm.customerIBAN.IBAN != undefined && vm.customerIBAN.IBAN != "") {
            var reg;
            vm.IsIBANValid = true;
            switch (vm.market.Code) {
                case "PT":
                    reg = new RegExp("PT[0-9]{23}$");
                    if (!reg.test(vm.customerIBAN.IBAN)) {
                        vm.IsIBANValid = false;
                        vm.IBANValidationMessage = "IBAN not in the correct format. (ex: PT50000201231234567890154)"
                    }
                    break;
                case "UK":
                case "CI":
                default:
                    vm.IsIBANValid = true;
                    //reg = new RegExp("ES[0-9]{22}$");
                    //if (!reg.test(vm.customerIBAN.IBAN)) {
                    //    vm.IsIBANValid = false;
                    //    vm.IBANValidationMessage = "IBAN not in the correct format. (ex: ES9121000418450200051332)"
                    //}
                    break;
            }
        } else {
            switch (vm.market.Code) {
                case "CI":
                    vm.IsIBANValid = true;
                    vm.IBANValidationMessage = "";
                    break;
                case "PT":
                case "ES":
                case "UK":
                default:
                    vm.IsIBANValid = false;
                    vm.IBANValidationMessage = "This field is Mandatory.";
                    break;
            }
            //if (vm.market.Code != "CI") {
            //}
            //else { 
            //}
        }
        parentController.addValidation("Customer", "Customer IBAN Input", vm.IsIBANValid, vm.IBANValidationMessage);
    }

    vm.iniciateController();

}