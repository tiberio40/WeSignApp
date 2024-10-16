app.controller('CancelationTemplateController', CancelationTemplateController);

function CancelationTemplateController($scope, $location, updateData, $q, $sessionStorage, $filter) {

    var vm = this;
    vm.Code = "tmplt";
    var parentController = $scope.$parent.$parent.vm;
    vm.templates = [];
    vm.txtSearch = '';
    vm.idSelected = -1;
    vm.selectedTemplate = '';
    //vm.templateMasterDetails = [];
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;


    if ($sessionStorage.Document != undefined) {
        var template = jQuery.parseJSON($sessionStorage.Document.template);
        parentController.documentModules[vm.Code] = parentController.template = template;

        var documentType = Enumerable
                        .From(parentController.documentTypes)
                        .Where(function (item) { return item.Id == $sessionStorage.Document.DocTypeId; })
                        .ToArray();

        $sessionStorage.DocumentTypeObj = documentType[0];
        parentController.SetTemplateModules(template);
         
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
    }

    function getTemplateMasterDetails(moduleId, temp) {
        if ($sessionStorage.Document == undefined) {
            $q.all([updateData.GetLocalData("Template", "*", "where Deleted =='false' and Id in (" + temp.join() + ")  and IdDocumentType = " + $sessionStorage.documentType)])
             .then(function (result) {
                 vm.templates = result[0][1];

                 //for (var i = 0; i < vm.templates.length; ++i) {
                 //    $q.all([updateData.GetLocalData("TemplateModule", "*", "where IdTemplate=" + vm.templates[i].Id + " and IdModule=" + moduleId)])
                 //    .then(function (result) {
                 //        var templateModule = result[0][1];
                 //        var agreementmodule = jQuery.parseJSON(templateModule[0].DefaultValue);
                 //        createTemplateMasterDetails(agreementmodule);

                 //    });
                 //}
             });
        } else {
            $q.all([updateData.GetLocalData("Template", "*", "where Id in (" + temp.join() + ")")])
             .then(function (result) {
                 vm.templates = Enumerable.From(result[0][1])
                             .Where(function (item) { return item.Id == parentController.template.Id; })
                             .ToArray();

                 //for (var i = 0; i < vm.templates.length; ++i) {
                 //    $q.all([updateData.GetLocalData("TemplateModule", "*", "where IdTemplate=" + vm.templates[i].Id + " and IdModule=" + moduleId)])
                 //    .then(function (result) {
                 //        var templateModule = result[0][1];
                 //        var agreementmodule = jQuery.parseJSON(templateModule[0].DefaultValue);
                 //        createTemplateMasterDetails(agreementmodule);

                 //    });
                 //}
             });
        }
    }
    function init() {

        $q.all([updateData.GetLocalData("TemplateGeography", "*", "where IdGeography = '" + parentController.client.IdGeography + "'")])
                   .then(function (result) {
                       vm.templateGeos = result[0][1];

                       var temp = Enumerable.From(vm.templateGeos)
                                .Select(function (item) { return item.IdTemplate })
                                .ToArray();

                       //var moduleId = getIdOfDocumentTypeMasterDetails();


                       if ($sessionStorage.DocumentTypeObj.Code.indexOf("_Cancelation") !== -1)
                       {
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
                           
                       //    case "ES_Cancelation":
                       //    case "CI_Cancelation":
                       //    case "PT_Cancelation":
                       //        $q.all([updateData.GetLocalData("Module", "*")])
                       //                .then(function (result) {
                       //                    var temp1 = Enumerable.From(result[0][1])
                       //                    .Where(function (item) { return item.Code == "canc_mstrdtl"; })
                       //                    .Select(function (item) { return item.Id })
                       //                    .ToArray();
                       //                    var moduleId = temp1[0];
                       //                    getTemplateMasterDetails(moduleId, temp);
                       //                });
                       //        break;
                       //}

                   });

    }

    //function createTemplateMasterDetails(agreementmodule) {
    //    switch ($sessionStorage.DocumentTypeObj.Code) {
    //        case "CI_Agreement":
    //        case "PT_Cancelation":
    //            var templatemasterdetails =
    //            {
    //                "DocumentType": $sessionStorage.DocumentTypeObj.Code,
    //                "StartDate": $filter('date')(new Date(parseInt(agreementmodule.StartDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))), 'dd-MM-yyyy'),
    //                "EndDate": $filter('date')(new Date(parseInt(agreementmodule.EndDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))), 'dd-MM-yyyy'),
    //                "MaxValue": agreementmodule.Value.MaxValue,
    //                "CurrentValue": agreementmodule.Value.CurrentContractValue.DefaultValue
    //            };
    //            vm.templateMasterDetails.push(templatemasterdetails);
    //            break;
    //    }

    //}

    vm.settemplate = function (templateId) {
        vm.idSelected = templateId;

        //objecto que vai ser guardado no documento
        var temp = Enumerable.From(vm.templates)
                                .Where(function (item) { return item.Id == templateId; })
                                .ToArray();

        parentController.template = temp[0];
        parentController.documentModules[vm.Code] = parentController.template;
        parentController.ClearTemplateModules("tmplt");
        parentController.SetTemplateModules(temp[0]);
        parentController.canGoToNextStep = true;

    }

}