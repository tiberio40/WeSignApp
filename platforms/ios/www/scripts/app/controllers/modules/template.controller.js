app.controller('TemplateController', TemplateController);

function TemplateController($scope, $location, updateData, $q, $sessionStorage, $filter) {

    var vm = this;
    vm.Code = "tmplt";
    var parentController = $scope.$parent.$parent.vm;
    vm.templates = [];
    vm.txtSearch = '';
    vm.idSelected = -1;
    vm.selectedTemplate = '';
    vm.templateMasterDetails = [];
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;


    if ($sessionStorage.Document != undefined) {
        if ($sessionStorage.Document.template != undefined) {

            var template = jQuery.parseJSON($sessionStorage.Document.template);
            var selectModules = true;
            if (parentController.template != undefined && template.Id == parentController.template.Id) selectModules = false;

            parentController.documentModules[vm.Code] = parentController.template = template;

            var documentType = Enumerable
                            .From(parentController.documentTypes)
                            .Where(function (item) { return item.Id == $sessionStorage.Document.DocTypeId; })
                            .ToArray();

            $sessionStorage.DocumentTypeObj = documentType[0];
            if (selectModules)
                parentController.SetTemplateModules(template);
        }

    }

    if (parentController.template != null && parentController.template != undefined) {
        vm.idSelected = parentController.template.Id;
        parentController.canGoToNextStep = true;
    }

    init();


    function navigateTo2(to) {
        $location.path(to);
    }

    vm.criteriaMatch = function (criteria) {
        if (criteria !== '') {
            return function (item) {
                return item.Id.toString().toLowerCase().indexOf(criteria.toLowerCase()) > -1 ||
                    item.Name.toString().toLowerCase().indexOf(criteria.toLowerCase()) > -1
            };
        }
    }

    vm.resetSelection = function () {
        parentController.template = undefined;
        parentController.canGoToNextStep = false;
    }

    function getTemplateMasterDetails(moduleId, temp) {
        var templates = [];
        if ($sessionStorage.Document == undefined) {
            $q.all([updateData.GetLocalData("Template", "*", "where Deleted =='false' and Id in (" + temp.join() + ") and IdDocumentType = " + $sessionStorage.documentType)])
             .then(function (result) {
                 vm.templates = result[0][1];
                 templates = result[0][1];

                 for (var i = 0; i < vm.templates.length; ++i) {
                     let remoteSignature = templates[i].RemoteSignature;
                     $q.all([updateData.GetLocalData("TemplateModule", "*", "where IdTemplate=" + vm.templates[i].Id + " and IdModule=" + moduleId)])
                     .then(function (result) {
                         
                         var templateModule = result[0][1];
                         var agreementmodule = jQuery.parseJSON(templateModule[0].DefaultValue);
                         createTemplateMasterDetails(agreementmodule, templateModule[0].IdTemplate, remoteSignature);

                     });
                 }
             });
        } else {
            $q.all([updateData.GetLocalData("Template", "*", "where Id in (" + temp.join() + ")")])
             .then(function (result) {
                 vm.templates = Enumerable.From(result[0][1])
                             .Where(function (item) { return item.Id == parentController.template.Id; })
                             .ToArray();

                 for (var i = 0; i < vm.templates.length; ++i) {
                     let remoteSignature = vm.templates[i].RemoteSignature;
                     $q.all([updateData.GetLocalData("TemplateModule", "*", "where IdTemplate=" + vm.templates[i].Id + " and IdModule=" + moduleId)])
                     .then(function (result) {
                         var templateModule = result[0][1];
                         var agreementmodule = jQuery.parseJSON(templateModule[0].DefaultValue);
                         createTemplateMasterDetails(agreementmodule, templateModule[0].IdTemplate, remoteSignature);

                     });
                 }
             });
        }
    }
    function init() {

        var idGeography = undefined;
        var where = "";
        if (parentController.client != undefined) {
            idGeography = parentController.client.IdGeography;
            where = "where IdGeography = '" + idGeography + "'";
        }

        $q.all([updateData.GetLocalData("TemplateGeography", "*", where)])
                   .then(function (result) {
                       vm.templateGeos = result[0][1];

                       var temp = Enumerable.From(vm.templateGeos)
                                .Select(function (item) { return item.IdTemplate })
                                .ToArray();

                       //var moduleId = getIdOfDocumentTypeMasterDetails();


                       if ($sessionStorage.DocumentTypeObj.Code.indexOf("_Agreement") !== -1) {
                           $q.all([updateData.GetLocalData("Module", "*")])
                                       .then(function (result) {
                                           var temp1 = Enumerable.From(result[0][1])
                                           .Where(function (item) { return item.Code == "ag_mstrdtl"; })
                                           .Select(function (item) { return item.Id })
                                           .ToArray();
                                           var moduleId = temp1[0];
                                           getTemplateMasterDetails(moduleId, temp);
                                       });
                       }

                       if ($sessionStorage.DocumentTypeObj.Code.indexOf("_IBAN") !== -1) {
                           $q.all([updateData.GetLocalData("Module", "*")])
                                      .then(function (result) {
                                          var temp1 = Enumerable.From(result[0][1])
                                          .Where(function (item) { return item.Code == "iban_mstrdtl"; })
                                          .Select(function (item) { return item.Id })
                                          .ToArray();
                                          var moduleId = temp1[0];
                                          getTemplateMasterDetails(moduleId, temp);
                                      });
                       }

                       if ($sessionStorage.DocumentTypeObj.Code.indexOf("_DigitalForm") !== -1) {
                           $q.all([updateData.GetLocalData("Module", "*")])
                                      .then(function (result) {
                                          var temp1 = Enumerable.From(result[0][1])
                                          .Where(function (item) { return item.Code == "df_mstrdtl"; })
                                          .Select(function (item) { return item.Id })
                                          .ToArray();
                                          var moduleId = temp1[0];
                                          getTemplateMasterDetails(moduleId, temp);
                                      });
                       }

                       if ($sessionStorage.DocumentTypeObj.Code.indexOf("_DigitalAgreement") !== -1) {
                           var tempArray = new Array();
                           tempArray.push(parentController.ddtemplate.Id);

                           $q.all([updateData.GetLocalData("Module", "*")])
                                  .then(function (result) {
                                      var temp1 = Enumerable.From(result[0][1])
                                      .Where(function (item) { return item.Code == "dd_mstrdtl"; })
                                      .Select(function (item) { return item.Id })
                                      .ToArray();
                                      var moduleId = temp1[0];
                                      getTemplateMasterDetails(moduleId, tempArray);
                                  });
                       }

                       if ($sessionStorage.DocumentTypeObj.Code.indexOf("_Cancelation") !== -1) {
                           $q.all([updateData.GetLocalData("Module", "*")])
                                       .then(function (result) {
                                           var temp1 = Enumerable.From(result[0][1])
                                           .Where(function (item) { return item.Code == "canc_mstrdtl"; })
                                           .Select(function (item) { return item.Id })
                                           .ToArray();
                                           var moduleId = temp1[0];
                                           getTemplateMasterDetails(moduleId, temp);
                                       });
                       }
                       //switch ($sessionStorage.DocumentTypeObj.Code) {
                       //    case "ES_Agreement":
                       //    case "CI_Agreement":
                       //    case "PT_Agreement":
                       //        $q.all([updateData.GetLocalData("Module", "*")])
                       //                .then(function (result) {
                       //                    var temp1 = Enumerable.From(result[0][1])
                       //                    .Where(function (item) { return item.Code == "ag_mstrdtl"; })
                       //                    .Select(function (item) { return item.Id })
                       //                    .ToArray();
                       //                    var moduleId = temp1[0];
                       //                    getTemplateMasterDetails(moduleId, temp);
                       //                });
                       //        break;
                       //    case "PT_IBAN":
                       //        $q.all([updateData.GetLocalData("Module", "*")])
                       //               .then(function (result) {
                       //                   var temp1 = Enumerable.From(result[0][1])
                       //                   .Where(function (item) { return item.Code == "iban_mstrdtl"; })
                       //                   .Select(function (item) { return item.Id })
                       //                   .ToArray();
                       //                   var moduleId = temp1[0];
                       //                   getTemplateMasterDetails(moduleId, temp);
                       //               });
                       //        break;
                       //    case "CI_DigitalForm":
                       //    case "PT_DigitalForm":
                       //        $q.all([updateData.GetLocalData("Module", "*")])
                       //               .then(function (result) {
                       //                   var temp1 = Enumerable.From(result[0][1])
                       //                   .Where(function (item) { return item.Code == "df_mstrdtl"; })
                       //                   .Select(function (item) { return item.Id })
                       //                   .ToArray();
                       //                   var moduleId = temp1[0];
                       //                   getTemplateMasterDetails(moduleId, temp);
                       //               });
                       //        break;

                       //    case "PT_DigitalAgreement":
                       //    case "CI_DigitalAgreement":

                       //        var tempArray = new Array();
                       //        tempArray.push(parentController.ddtemplate.Id);

                       //        $q.all([updateData.GetLocalData("Module", "*")])
                       //               .then(function (result) {
                       //                   var temp1 = Enumerable.From(result[0][1])
                       //                   .Where(function (item) { return item.Code == "dd_mstrdtl"; })
                       //                   .Select(function (item) { return item.Id })
                       //                   .ToArray();
                       //                   var moduleId = temp1[0];
                       //                   getTemplateMasterDetails(moduleId, tempArray);
                       //               });
                       //        break;
                       //}

                   });

    }

    function createTemplateMasterDetails(agreementmodule, templateId, remoteSignature) {

        if ($sessionStorage.DocumentTypeObj.Code.indexOf("_Agreement") !== -1) {
            var templatemasterdetails =
            {
                   "TemplateId": templateId,
                   "DocumentType": $sessionStorage.DocumentTypeObj.Code,
                   "StartDate": $filter('date')(new Date(parseInt(agreementmodule.StartDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))), 'dd-MM-yyyy'),
                   "EndDate": $filter('date')(new Date(parseInt(agreementmodule.EndDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))), 'dd-MM-yyyy'),
                   "MaxValue": agreementmodule.Value.MaxValue,
                   "CurrentValue": agreementmodule.Value.CurrentContractValue.DefaultValue,
                   "QuarterValue": agreementmodule.Value.QuarterValue == undefined ? 0 : agreementmodule.Value.QuarterValue,
                   "ShowQuarterValue": agreementmodule.Value.ShowQuarterValue == undefined ? false : agreementmodule.Value.ShowQuarterValue,
                    "RemoteSignature": remoteSignature
               };
            vm.templateMasterDetails.push(templatemasterdetails);

        }
        if ($sessionStorage.DocumentTypeObj.Code.indexOf("_DigitalForm") !== -1) {

            var templatemasterdetails =
                {
                    "DocumentType": $sessionStorage.DocumentTypeObj.Code,
                    "HasCustomer": agreementmodule.typeOfDigitalForm == 'fromISMSClient' ? true : false,
                    "RemoteSignature": remoteSignature
                };
            if (parentController.noCustomer != undefined && parentController.noCustomer == !templatemasterdetails.HasCustomer) {
                vm.templateMasterDetails.push(templatemasterdetails);
            } else {
                for (var i = 0; i < vm.templates.length; ++i) {
                    if (vm.templates[i].Id == templateId)
                        vm.templates.splice(i, 1);
                }

            }
        }

        if ($sessionStorage.DocumentTypeObj.Code.indexOf("_DigitalAgreement") !== -1) {
            var templatemasterdetails =
                {
                    "DocumentType": $sessionStorage.DocumentTypeObj.Code,
                    "RemoteSignature": remoteSignature
                };
            vm.templateMasterDetails.push(templatemasterdetails);
        }

        if ($sessionStorage.DocumentTypeObj.Code.indexOf("_IBAN") !== -1) {
            var templatemasterdetails =
                {
                    "DocumentType": $sessionStorage.DocumentTypeObj.Code,
                    "RemoteSignature": remoteSignature
                };
            vm.templateMasterDetails.push(templatemasterdetails);
        }

        if ($sessionStorage.DocumentTypeObj.Code.indexOf("_Cancelation") !== -1) {
            var templatemasterdetails =
                {
                    "DocumentType": $sessionStorage.DocumentTypeObj.Code,
                    "RemoteSignature": remoteSignature
                };
            vm.templateMasterDetails.push(templatemasterdetails);
        }

        //switch ($sessionStorage.DocumentTypeObj.Code) {
        //    case "CI_Agreement":
        //    case "PT_Agreement":
        //        var templatemasterdetails =
        //        {
        //            "DocumentType": $sessionStorage.DocumentTypeObj.Code,
        //            "StartDate": $filter('date')(new Date(parseInt(agreementmodule.StartDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))), 'dd-MM-yyyy'),
        //            "EndDate": $filter('date')(new Date(parseInt(agreementmodule.EndDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))), 'dd-MM-yyyy'),
        //            "MaxValue": agreementmodule.Value.MaxValue,
        //            "CurrentValue": agreementmodule.Value.CurrentContractValue.DefaultValue,
        //            "QuarterValue": agreementmodule.Value.QuarterValue == undefined ? 0 : agreementmodule.Value.QuarterValue
        //        };
        //        vm.templateMasterDetails.push(templatemasterdetails);
        //        break;

        //    case "CI_DigitalForm":
        //    case "PT_DigitalForm":
        //        var templatemasterdetails =
        //        {
        //           "DocumentType": $sessionStorage.DocumentTypeObj.Code,
        //           "HasCustomer": agreementmodule.typeOfDigitalForm  == 'fromISMSClient' ? true : false  
        //        };
        //        if (parentController.noCustomer != undefined && parentController.noCustomer == !templatemasterdetails.HasCustomer)
        //        {
        //            vm.templateMasterDetails.push(templatemasterdetails);
        //        } else {
        //            for (var i = 0; i < vm.templates.length; ++i)
        //            {
        //                if(vm.templates[i].Id == templateId)
        //                    vm.templates.splice(i,1);
        //            }

        //        }
        //        break;
        //    case "PT_IBAN":
        //    case "PT_DigitalAgreement":
        //    case "CI_DigitalAgreement":
        //        var templatemasterdetails =
        //        {
        //            "DocumentType": $sessionStorage.DocumentTypeObj.Code
        //        };
        //        vm.templateMasterDetails.push(templatemasterdetails);
        //        break;
        //}

    }

    vm.showIfDD = function (index) {
        var documentType = $sessionStorage.DocumentTypeObj.Code;//vm.templateMasterDetails[index].DocumentType;
        if (documentType.indexOf("_DigitalForm") !== -1 || documentType.indexOf("_DigitalAgreement") !== -1)
            return true;
        return false;
    };

    vm.settemplate = function (templateId) {

        parentController.canGoToNextStep = false;

        parentController.ClearTemplateModules("tmplt");

        vm.idSelected = templateId;

        //objecto que vai ser guardado no documento
        var temp = Enumerable.From(vm.templates)
                                .Where(function (item) { return item.Id == templateId; })
                                .ToArray();

        parentController.SetTemplateModules(temp[0]);
        parentController.template = temp[0];
        parentController.documentModules[vm.Code] = parentController.template;
        parentController.remoteSignatureTemplate = temp[0].RemoteSignature;
        //parentController.canGoToNextStep = true;

    }

    vm.showTemplateMarterDetails = function(templateId){
        for (var i = 0; i < vm.templateMasterDetails.length; i++) {
            if (vm.templateMasterDetails[i].TemplateId == templateId) {
                return vm.templateMasterDetails[i];
            }
        }

        var templatemasterdetailsEmpty =
        {
            "TemplateId": templateId,
            "DocumentType": "",
            "StartDate": "",
            "EndDate": "",
            "MaxValue": "",
            "CurrentValue": "",
            "QuarterValue": "",
            "ShowQuarterValue": false,
        };

        return templatemasterdetailsEmpty;
    }

}
