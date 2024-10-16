app.controller('EditClientController', EditClientController);

function EditClientController($scope, $location, updateData, $q, $sessionStorage) {

    var vm = this;
    vm.IsIbanUpdated = false;
    vm.Code = "clnt_edit";
    var parentController = $scope.$parent.$parent.vm;
    parentController.client.IBANUpdated = false;
    vm.currentclient = parentController.client;
    vm.market = parentController.market;
    vm.customerIBAN = parentController.clientIBAN;
    vm.selectedDocumentId = '';
    vm.IBANReadOnly = false;
    vm.currentIBANNumber = "";
    parentController.canGoToNextStep = true;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    vm.iniciateController = function () {

        vm.IsIbanUpdated = false;
        vm.IsIbanUpdatedFromIbanChange = false;
        $q.all([updateData.GetPendingIBANDocument(vm.currentclient.Id)]).then(function (result) {
            var arr = [];
            var arrAux = Enumerable.From(result[0]).ToArray();
            if (arrAux.length > 0) {
                if ($sessionStorage.DocumentTypeObj.Code == 'PT_IBAN') {
                    for (var i = 0; i != arrAux.length; ++i) {
                        if (arrAux[i].DocTypeId == 4 && JSON.parse(arrAux[i].customer).IdCustomer == vm.currentclient.Id) {
                            vm.IsIbanUpdatedFromIbanChange = true;
                            vm.IsIbanUpdated = true;
                        }
                    }
                }
                else {
                    for (var i = 0; i != arrAux.length; ++i) {
                        if (JSON.parse(arrAux[i].customer).IdCustomer == vm.currentclient.Id)
                            vm.IsIbanUpdated = true;
                    }
                }

            }


            if ($sessionStorage.DocumentTypeObj.Code == 'PT_IBAN') {
                if ($sessionStorage.Document != undefined) {
                    $q.all([updateData.GetLocalData("Customer", "*", ' Where Id = "' + vm.currentclient.Id + '"')])
                                                 .then(function (result) {




                                                     $q.all([updateData.GetPendingIBANDocument(vm.currentclient.Id)])
                                                                             .then(function (result) {
                                                                                 var arr = [];
                                                                                 var arrAux = Enumerable.From(result[0]).ToArray();
                                                                                 for (var i = 0; i != arrAux.length; ++i)
                                                                                     arr.push(arrAux[i]);
                                                                                 var iban = '';
                                                                                 var documentId = -1

                                                                                 for (var j = 0; j < arr.length; ++j) {
                                                                                     if (JSON.parse(arr[j].customer) != null && JSON.parse(arr[j].customer).IdCustomer == vm.currentclient.Id) {
                                                                                         iban = JSON.parse(arr[j].customer).IBAN;
                                                                                         documentId = arr[j].DocumentId;
                                                                                         vm.IBANReadOnly = true;
                                                                                     }
                                                                                 }


                                                                                 var customer = Enumerable.From(result[0][1]).ToArray();
                                                                                 if (vm.customerIBAN == undefined || vm.customerIBAN == null)
                                                                                     vm.customerIBAN = jQuery.parseJSON($sessionStorage.Document.CustomerIBAN);
                                                                                 parentController.documentModules[vm.Code] = parentController.clientIBAN = vm.customerIBAN;
                                                                                 vm.currentIBANNumber = parentController.clientIBAN.IBAN;
                                                                                 vm.validateIBAN();


                                                                                 //if (parentController.documentModules[vm.Code] == undefined) {
                                                                                 //    parentController.clientIBAN =
                                                                                 //    vm.customerIBAN =
                                                                                 //        {
                                                                                 //            'IdCustomer': vm.currentclient.Id,
                                                                                 //            'IdDocument': documentId,
                                                                                 //            'IBAN': iban,
                                                                                 //            'IBANImageValidation': null,
                                                                                 //            'Active': false,
                                                                                 //            'CreatedOn': new Date()
                                                                                 //        }
                                                                                 //    parentController.documentModules[vm.Code] = vm.customerIBAN;

                                                                                 //} else {
                                                                                 //    parentController.clientIBAN =  vm.customerIBAN = parentController.documentModules[vm.Code];
                                                                                 //}
                                                                                 //vm.validateIBAN();


                                                                             });

                                                 });
                }
                else {
                    $q.all([updateData.GetLocalData("Customer", "*", ' Where Id = "' + vm.currentclient.Id + '"')])
                                         .then(function (result) {
                                             $q.all([updateData.GetPendingIBANDocument(vm.currentclient.Id)])
                                                                              .then(function (result) {
                                                                                  var arr = [];
                                                                                  var arrAux = Enumerable.From(result[0]).ToArray();
                                                                                  for (var i = 0; i != arrAux.length; ++i)
                                                                                      arr.push(arrAux[i]);
                                                                                  var iban = '';
                                                                                  var documentId = -1
                                                                                  for (var j = 0; j < arr.length; ++j) {

                                                                                      if (arr[j].customer != null && JSON.parse(arr[j].customer) != null && JSON.parse(arr[j].customer).IdCustomer == vm.currentclient.Id) {
                                                                                          iban = JSON.parse(arr[j].customer).IBAN;
                                                                                          documentId = arr[j].DocumentId;

                                                                                          vm.IBANReadOnly = true;
                                                                                      }
                                                                                      else {
                                                                                          documentId = arr[j].DocumentId;

                                                                                      }
                                                                                  }

                                                                                  if (parentController.documentModules[vm.Code] == undefined) {
                                                                                      if (iban == '') {
                                                                                          $q.all([updateData.GetLocalData("CustomerIBAN", "*", ' Where IdCustomer = "' + vm.currentclient.Id + '" AND Active = "true" ORDER BY CreatedOn DESC')])
                                                                                           .then(function (result) {
                                                                                               var customerIBAN = Enumerable.From(result[0][1])
                                                                                               .ToArray();

                                                                                               if (customerIBAN.length > 0) {
                                                                                                   parentController.clientIBAN = vm.customerIBAN = angular.copy(customerIBAN[0]);
                                                                                                   vm.currentIBANNumber = vm.customerIBAN.IBAN;
                                                                                                   parentController.clientIBAN =
                                                                                                   vm.customerIBAN =
                                                                                                       {
                                                                                                           'IdCustomer': vm.currentclient.Id,
                                                                                                           'IdDocument': documentId,
                                                                                                           'IBAN': vm.currentIBANNumber,
                                                                                                           'IBANImageValidation': null,
                                                                                                           'Active': false,
                                                                                                           'CreatedOn': new Date()
                                                                                                       }
                                                                                               }
                                                                                               else {
                                                                                                   parentController.clientIBAN = vm.customerIBAN =
                                                                                                       {
                                                                                                           'IdCustomer': vm.currentclient.Id,
                                                                                                           'IdDocument': documentId,
                                                                                                           'IBAN': '',
                                                                                                           'IBANImageValidation': null,
                                                                                                           'Active': false,
                                                                                                           'CreatedOn': new Date()
                                                                                                       }
                                                                                               }
                                                                                               parentController.documentModules[vm.Code] = vm.customerIBAN;
                                                                                               vm.validateIBAN();

                                                                                           });
                                                                                      }
                                                                                      else {
                                                                                          vm.currentIBANNumber = iban;
                                                                                          parentController.clientIBAN =
                                                                                          vm.customerIBAN =
                                                                                              {
                                                                                                  'IdCustomer': vm.currentclient.Id,
                                                                                                  'IdDocument': documentId,
                                                                                                  'IBAN': iban,
                                                                                                  'IBANImageValidation': null,
                                                                                                  'Active': false,
                                                                                                  'CreatedOn': new Date()
                                                                                              }
                                                                                          parentController.documentModules[vm.Code] = vm.customerIBAN;
                                                                                          vm.validateIBAN();
                                                                                      }

                                                                                  } else {
                                                                                      parentController.clientIBAN = vm.customerIBAN = parentController.documentModules[vm.Code];
                                                                                  }

                                                                              });


                                         });
                }
            }
            else {
                if ($sessionStorage.Document != undefined) {
                    $q.all([updateData.GetLocalData("Customer", "*", ' Where Id = "' + vm.currentclient.Id + '"')])
                                                  .then(function (result) {
                                                      var customer = Enumerable.From(result[0][1]).ToArray();
                                                      //vm.IsIbanUpdated = customer[0].IBANUpdated;


                                                      if (vm.customerIBAN == undefined || vm.customerIBAN == null)
                                                          vm.customerIBAN = jQuery.parseJSON($sessionStorage.Document.CustomerIBAN);
                                                      parentController.documentModules[vm.Code] = parentController.clientIBAN = vm.customerIBAN;
                                                      vm.currentIBANNumber = parentController.clientIBAN.IBAN;
                                                      vm.validateIBAN();

                                                  });
                }
                else {
                    $q.all([updateData.GetLocalData("Customer", "*", ' Where Id = "' + vm.currentclient.Id + '"')])
                                       .then(function (result) {
                                           var customer = Enumerable.From(result[0][1]).ToArray();
                                           $q.all([updateData.GetLocalData("CustomerIBAN", "*", ' Where IdCustomer = "' + vm.currentclient.Id + '" AND Active = "true" ORDER BY CreatedOn DESC')])
                                                                               .then(function (result) {
                                                                                   var customerIBAN = Enumerable.From(result[0][1])
                                                                                       //.Where(function (item) { return item.Id == parentController.client.Id; })
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

                                       });
                }
            }
        });




    }
    vm.validateIBAN = function () {
        if (vm.customerIBAN != undefined && vm.customerIBAN.IBAN != undefined && vm.customerIBAN.IBAN != "") {
            var reg;
            vm.IsIBANValid = true;
            switch (vm.market.Code) {
                case "PT":
                    reg = new RegExp("P[Tt][0-9]{23}$");
                    if (!reg.test(vm.customerIBAN.IBAN)) {
                        vm.IsIBANValid = false;
                        vm.IBANValidationMessage = "IBAN not in the correct format. (ex: PT50000201231234567890154)"
                    }
                    break;
                case "ES":
                    vm.IsIBANValid = true;
                    //reg = new RegExp("ES[0-9]{22}$");
                    //if (!reg.test(vm.customerIBAN.IBAN)) {
                    //    vm.IsIBANValid = false;
                    //    vm.IBANValidationMessage = "IBAN not in the correct format. (ex: ES9121000418450200051332)"
                    //}
                    break;
                case "CI":
                    vm.IsIBANValid = true;
                    //reg = new RegExp("ES[0-9]{22}$");
                    //if (!reg.test(vm.customerIBAN.IBAN)) {
                    //    vm.IsIBANValid = false;
                    //    vm.IBANValidationMessage = "IBAN not in the correct format. (ex: ES9121000418450200051332)"
                    //}
                    break;
                case "UK":
                    vm.IsIBANValid = true;
                    break;
                default:
                    vm.IsIBANValid = true;
            }
        } else {
            switch (vm.market.Code) {
                case "PT":
                    vm.IsIBANValid = false;
                    vm.IBANValidationMessage = "This field is Mandatory.";
                    break;
                case "CI":
                case "ES":
                case "UK":
                default:
                    vm.IsIBANValid = true;
                    vm.IBANValidationMessage = "";
                    break;

            }
            //if (vm.market.Code != "CI" && vm.market.Code != "ES") {
            //}
            //else {
            //}
        }
        parentController.addValidation("Customer", "Customer IBAN Input", vm.IsIBANValid, vm.IBANValidationMessage);



        if ((vm.IsIbanUpdated == 'true' || vm.IsIbanUpdated == true) && $sessionStorage.DocumentTypeObj.Code.indexOf('_Agreement') !== -1) parentController.canGoToNextStep = false;
        if ((vm.IsIbanUpdatedFromIbanChange == 'true' || vm.IsIbanUpdatedFromIbanChange == true) && $sessionStorage.DocumentTypeObj.Code.indexOf('_IBAN') !== -1) parentController.canGoToNextStep = false;
    }

    vm.CanGoToNextStep = function () {
        var can = true;
        can = ((vm.IsIbanUpdated || vm.IsIbanUpdated == 'true') && $sessionStorage.DocumentTypeObj.Code.indexOf('_Agreement') !== -1);
        if (!can)
            can = ((vm.IsIbanUpdatedFromIbanChange == 'true' || vm.IsIbanUpdatedFromIbanChange == true) && $sessionStorage.DocumentTypeObj.Code.indexOf('_IBAN') !== -1);
        return can;
    }

    vm.validateEmail = function () {
        vm.IsEmailValid = true;
        vm.EmailValidationMessage = " ";
        if (vm.currentclient.Email != undefined && vm.currentclient.Email != "") {
            var reg = new RegExp(/^(([^<>()\[\]\\.,;:\s@"']+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            if (!reg.test(vm.currentclient.Email)) {
                vm.IsEmailValid = false;
                vm.EmailValidationMessage = "The Email format is invalid.";
            }
        }
        parentController.addValidation("Customer", "Email Input", vm.IsEmailValid, vm.EmailValidationMessage);
    }

    vm.validateTelephone = function () {
        vm.IsTelephoneValid = true;
        vm.TelephoneValidationMessage = " ";
        if (vm.currentclient.Telephone != undefined && vm.currentclient.Telephone != "") {
            var reg = new RegExp(/^\d+$/);
            if (!reg.test(vm.currentclient.Telephone)) {
                vm.IsTelephoneValid = false;
                vm.TelephoneValidationMessage = "The Telephone format is invalid.";
            }
        }
        parentController.addValidation("Customer", "Telephone Input", vm.IsTelephoneValid, vm.TelephoneValidationMessage);
    }

    vm.IsPTAgreement = function () {
        return ($sessionStorage.DocumentTypeObj.Code == 'PT_Agreement');
    }

    vm.IsIBAN = function () {
        return ($sessionStorage.DocumentTypeObj.Code.indexOf('_IBAN') !== -1);
    }

    vm.ForceEmptyStringIfNullorUndefined = function (str) {
        if (str == undefined || str == null)
            return "";
        return str;
    };

    vm.IBANChange = function (iban) {
        //parentController.documentModules[vm.Code] = parentController.clientIBAN = vm.customerIBAN;

        //if (vm.currentIBANNumber != '' && vm.currentIBANNumber != iban) {
        //    parentController.client.IBANUpdated = true;
        //} else {
        //    parentController.client.IBANUpdated = false;
        //}

        vm.validateIBAN();
    }

    vm.iniciateController();
    vm.validateEmail();
    vm.validateTelephone();
}