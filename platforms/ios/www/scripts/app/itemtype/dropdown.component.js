module.
directive('dropdown', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template:
             '<select class="form-control" ng-disabled="!$ctrl.dynamicItem.Editable" ng-model="$ctrl.selectedItem" ng-init="$ctrl.init()" ng-change="$ctrl.change()" ng-options="item.description for item in $ctrl.options">' +
             '</select>',

        controller: function ($scope, $element, $http) {
            var vm = this;
            vm.dynamicItem = $scope.$parent.$parent.dynamicItem;
            var dynamicController = $scope.$parent.$parent.$parent.di;

            vm.dynamicItem.IsValid = true;

            vm.change = function () {
                vm.dynamicItem.Value = vm.selectedItem;
                dynamicController.change(vm.dynamicItem);
            };

            vm.init = function () {
                dynamicController.init(vm.dynamicItem, false);
            }

            vm.IsMandatory = function () {
                if (vm.dynamicItem.Mandatory == undefined || vm.dynamicItem.Mandatory == false || vm.dynamicItem.Mandatory == "false") {
                    return false;
                }
                return true;
            }

            function iniciateController() {
                if (vm.dynamicItem.Other != null) {
                    var options = angular.fromJson(vm.dynamicItem.Other); //jQuery.parseJSON(vm.dynamicItem.Other);

                    vm.options = Enumerable.From(options)
                                  .Where(function (item) { return item.deleted != undefined && item.deleted == false; })
                                  .ToArray();

                    if (vm.dynamicItem.Mandatory == undefined || vm.dynamicItem.Mandatory == false || vm.dynamicItem.Mandatory == "false") {
                        var emptyOption =
                            {
                                'default': false,
                                'deleted': false,
                                'description': '---------------------',
                                'id': -1
                            };
                        vm.options.splice(0, 0, emptyOption);
                    }

                    if (vm.dynamicItem.Value == undefined) {
                        var defaultOption = Enumerable.From(vm.options)
                                   .Where(function (item) { return item.default == true })
                                   .ToArray();

                        if (defaultOption.length > 0) {
                            vm.dynamicItem.Value = defaultOption[0];
                            vm.selectedItem = defaultOption[0];
                        } else {
                            vm.selectedItem = vm.options[0];
                            vm.dynamicItem.Value = vm.options[0];
                        }

                    } else {
                        var selectedItem = Enumerable.From(vm.options)
                                   .Where(function (item) { return item.id == vm.dynamicItem.Value.id; })
                                   .ToArray();

                        vm.selectedItem = selectedItem[0];
                    }
                }
            }
            iniciateController();

        },
        controllerAs: '$ctrl'
    };
});