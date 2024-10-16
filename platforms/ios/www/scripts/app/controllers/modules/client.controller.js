app.controller('SelectClientController', SelectClientController);

function SelectClientController($scope, $location, updateData, $q, $sessionStorage) {

    var vm = this;
    vm.Code = "clnt";
    var parentController = $scope.$parent.$parent.vm;
    vm.customers = [];
    vm.txtSearch = '';
    vm.OpenModalEdit = OpenModalEdit;
    vm.navigateTo2 = navigateTo2;
    vm.selectRow = selectRow;
    vm.idSelected = '';
    vm.noCustomer = parentController.noCustomer;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;
    vm.editAndNoCustomer = false;

    if ($sessionStorage.Document != undefined) {

        if ($sessionStorage.Document.Code.indexOf("_DigitalForm") !== -1 && ($sessionStorage.Document.customer == null || $sessionStorage.Document.customer == "undefined" || $sessionStorage.Document.customer == "[]")) {
            parentController.noCustomer = vm.noCustomer = true;
            vm.editAndNoCustomer = true;
        }
        else {
            var customer = jQuery.parseJSON($sessionStorage.Document.customer);
            parentController.documentModules[vm.Code] = parentController.client = customer;
            parentController.canGoToNextStep = true;
            $q.all([updateData.GetLocalData("Geography", "*", " where Id = '" + parentController.client.IdGeography + "' COLLATE NOCASE")])
                            .then(function (result) {
                                var geography = Enumerable.From(result[0][1])
                                                    .ToArray();
                                parentController.clientGeography = geography[0].Description;
                            });
        }
    }

    if (parentController.client != null && parentController.client != undefined) {
        vm.idSelected = parentController.client.Id;
        parentController.canGoToNextStep = true;
        vm.noCustomer = false;
    }
    else {
        if (vm.noCustomer) parentController.canGoToNextStep = true;
    }


    //if (parentController.client != null && parentController.client != undefined && (parentController.clientGeography == null || parentController.clientGeography == undefined)) {
    //    $q.all([updateData.GetLocalData("Geography", "*", " where Id = '" + parentController.client.IdGeography + "' COLLATE NOCASE")])
    //                       .then(function (result) {
    //                           var geography = Enumerable.From(result[0][1])
    //                                             .ToArray();
    //                           parentController.clientGeography = geography[0].Description;
    //                       });
    //}

    var where = "";
    if ($sessionStorage.Document != undefined && !vm.noCustomer) {
        where = 'WHERE Id = "' + parentController.client.Id + '"';
    } else {
        where = 'WHERE (Deleted is null) OR (Deleted = "false")';
        if ($sessionStorage.IBANChange == true) {
            where = 'WHERE Id = "' + $sessionStorage.IBANChangeClient.Id + '"';
            parentController.client = $sessionStorage.IBANChangeClient;
            vm.idSelected = $sessionStorage.IBANChangeClient.Id;
            parentController.canGoToNextStep = true;
            $q.all([updateData.GetLocalData("Geography", "*", " where Id = '" + parentController.client.IdGeography + "' COLLATE NOCASE")])
                               .then(function (result) {
                                   var geography = Enumerable.From(result[0][1])
                                                     .ToArray();
                                   parentController.clientGeography = geography[0].Description;
                               });

        }
    }

    if (!vm.editAndNoCustomer) {
        $q.all([updateData.GetLocalData("Customer", "*", where + " ORDER BY Name ASC")])
                                .then(function (result) {
                                    vm.customers = [];
                                    var temp = Enumerable.From(result[0][1])
                                               .ToArray();
                                    for (var i = 0; i < temp.length; ++i) {
                                        vm.customers.push(angular.copy(temp[i]));
                                    }
                                });
    }

    $q.all([updateData.GetLocalData("CustomerIBAN", "*", "IdCustomer = '" + vm.idSelected + "'")])
                            .then(function (result) {
                                vm.customersIban = [];
                                var temp = Enumerable.From(result[0][1])
                                           .ToArray();
                                for (var i = 0; i < temp.length; ++i) {
                                    vm.customersIban.push(angular.copy(temp[i]));
                                }
                            });


    vm.resetTemplate = function () {
        if ($sessionStorage.Document != null && $sessionStorage.Document != undefined && $sessionStorage.Document.template != null && $sessionStorage.Document.template != undefined)
            $sessionStorage.Document.template = undefined;
        if (parentController.template != null && parentController.template != undefined)
            parentController.template = undefined;

    }

    vm.resetSelection = function () {
        //parentController.template = null;

        vm.resetTemplate();

        parentController.documentModules[vm.Code] = parentController.client = undefined;
        parentController.documentModules["clnt_edit"] = undefined;
        parentController.canGoToNextStep = false;
    }

    vm.noCustomerChange = function () {
        //parentController.template = null;
        vm.resetTemplate();
        var documentType = $sessionStorage.DocumentTypeObj.Code;
        if (documentType.indexOf("_DigitalForm") !== -1 || documentType.indexOf("_DigitalAgreement") !== -1) {
            if (vm.noCustomer == true) {
                parentController.canGoToNextStep = true;
                parentController.documentModules[vm.Code] = parentController.client = undefined;
                vm.idSelected = undefined;
                $sessionStorage.Document = undefined;
            } else {
                parentController.canGoToNextStep = false;
            }
        }
        parentController.noCustomer = vm.noCustomer;
    };


    vm.showIfDF = function () {
        if ($sessionStorage.DocumentTypeObj.Code.indexOf("_DigitalForm") !== -1)
            return true;
        return false;
    };

    vm.showIfDD = function () {
        var documentType = $sessionStorage.DocumentTypeObj.Code;
        if (documentType.indexOf("_DigitalForm") !== -1 || documentType.indexOf("_DigitalAgreement") !== -1)
            return true;
        return false;
    };

    function navigateTo2(to) {
        $location.path(to);
    }

    vm.criteriaMatch = function (criteria) {
        if (criteria !== '') {
            return function (item) {
                return item.Code.toString().toLowerCase().indexOf(criteria.toLowerCase()) > -1 ||
                    item.Name.toString().toLowerCase().indexOf(criteria.toLowerCase()) > -1 ||
                item.RegisteredName.toString().toLowerCase().indexOf(criteria.toLowerCase()) > -1
                //return item[vm.selectedItem.id] === criteria.name;
            };
        }
    }

    function selectRow(item) {
        //parentController.template = null;
        if (parentController.client == null || item.Id != parentController.client.Id)
            vm.resetTemplate();

        parentController.client = item;
        vm.idSelected = item.Id;
        if (parentController.client.Telephone == null) parentController.client.Telephone = '';
        if (parentController.client.Email == null) parentController.client.Email = '';
        //objecto que vai ser guardado no documento
        parentController.documentModules[vm.Code] = parentController.client;
        parentController.documentModules["clnt_edit"] = undefined;
        parentController.canGoToNextStep = true;
        parentController.noCustomer = vm.noCustomer = false;
        $q.all([updateData.GetLocalData("Geography", "*", " where Id = '" + parentController.client.IdGeography + "' COLLATE NOCASE")])
                            .then(function (result) {
                                var geography = Enumerable.From(result[0][1])
                                                  .ToArray();
                                parentController.clientGeography = geography[0].Description;
                            });

    }

    function OpenModalEdit(item) {
        vm.currentCustomer = item;

        $('#modalCustomerDetail').modal('toggle');

    };



    vm.ForceEmptyStringIfNullorUndefined = function (str) {
        if (str == undefined || str == null)
            return "";
        return str;
    };


}