module.
directive('multipleselect', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template:
             '<select class="form-control" ng-style="!$ctrl.dynamicItem.IsValid && {\'border-color\':\'red\'}" ng-init="$ctrl.init()" ng-disabled="!$ctrl.dynamicItem.Editable" multiple ng-model="$ctrl.selectedItem" ng-change="$ctrl.change()" ng-options="item.description for item in $ctrl.options">' +
             '</select>' +
             '<p style="display:block;height:16px"><span ng-show="!$ctrl.dynamicItem.IsValid" style="color:red">{{$ctrl.dynamicItem.ValMessage}}</span></p>',

        controller: function ($scope, $element, $http) {
            var vm = this;

            var dynamicController = $scope.$parent.$parent.$parent.di;

            vm.dynamicItem = $scope.$parent.$parent.dynamicItem;

            vm.validate = function () {

                if (vm.dynamicItem.Mandatory == "true" || vm.dynamicItem.Mandatory == true) {
                    if (vm.dynamicItem.Value == undefined || vm.dynamicItem.Value == null || vm.dynamicItem.Value.length == 0) {
                        vm.dynamicItem.IsValid = false;
                        vm.dynamicItem.ValMessage = "This field is mandatory";
                        return;
                    }
                }
                vm.dynamicItem.IsValid = true;
                vm.dynamicItem.ValMessage = "";

            }

            vm.change = function () {
                vm.dynamicItem.Value = vm.selectedItem;
                dynamicController.change(vm.dynamicItem);
                vm.validate();
            };

            vm.init = function () {
                dynamicController.init(vm.dynamicItem, false);
            }

            function iniciateController() {
                if (vm.dynamicItem.Other != null) {
                    var options = jQuery.parseJSON(vm.dynamicItem.Other);

                    vm.options = Enumerable.From(options)
                    .Where(function (x) { return x.deleted == false })
                    .OrderBy(function (x) { return x.id })
                    .ToArray();

                    if (vm.dynamicItem.Value == undefined) {
                        var defaultOptions = Enumerable.From(vm.options)
                                  .Where(function (item) { return item.default == true; })
                                  .ToArray();

                        if (defaultOptions.length > 0) {
                            vm.dynamicItem.Value = defaultOptions;
                            vm.selectedItem = defaultOptions;
                        } else {
                            //vm.selectedItem = vm.options[0];
                            //vm.dynamicItem.Value = vm.options[0];
                        }
                    } else {
                        vm.selectedItem = [];
                        for (var i = 0; i < vm.dynamicItem.Value.length; ++i) {
                            var selectedItem = Enumerable.From(vm.options)
                                       .Where(function (item) { return item.id == vm.dynamicItem.Value[i].id; })
                                       .ToArray();

                            vm.selectedItem[i] = selectedItem[0];
                        }
                    }
                    
                }
                vm.validate();
            }
            iniciateController();

        },
        controllerAs: '$ctrl'
    };
});