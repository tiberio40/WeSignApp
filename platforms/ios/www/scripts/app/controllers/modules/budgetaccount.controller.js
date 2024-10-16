app.controller('BudgetAccountController', BudgetAccountController);

function BudgetAccountController($scope, $location, updateData, $q, $sessionStorage) {

    var vm = this;
    vm.Code = "ag_budget";
    var parentController = $scope.$parent.$parent.vm;
    vm.budgetaccount = parentController.budgetaccount.BudgetAccounts;
    vm.idSelected = '';
        vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;


    if (vm.budgetaccount == null || vm.budgetaccount.length <= 0) parentController.canGoToNextStep = true;

    if (parentController.documentModules[vm.Code] == undefined) {
        vm.documentBudgets = [];
        if (vm.budgetaccount != null) {
            for (var i = 0; i < vm.budgetaccount.length; ++i) {
                var documentBudget =
                {
                    'Id': vm.budgetaccount[i].Id,
                    'Name': vm.budgetaccount[i].Name,
                    'Selected': false
                };

                vm.documentBudgets[i] = documentBudget;

            }
        }
        parentController.documentModules[vm.Code] = vm.documentBudgets;
    } else {
        vm.documentBudgets = parentController.documentModules[vm.Code];
        var temp = Enumerable.From(vm.documentBudgets)
                                   .Where(function (item) { return item.Selected === true; })
                                   .ToArray();

        if (temp != undefined && temp.length > 0){
            vm.idSelected = temp[0].Name;
            parentController.selectedBudgetAccount = temp[0];
            }

        parentController.canGoToNextStep = true;
    }

    vm.selectRow = function (item) {
        vm.idSelected = item.Name;
        Enumerable.From(vm.documentBudgets)
            .Select(function (item) { item.Selected = false; return item;})
            .ToArray();
        item.Selected = true;
        parentController.selectedBudgetAccount = item;
        parentController.canGoToNextStep = true;
 
    }

}