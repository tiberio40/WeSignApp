module.
directive('numeric', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template: 
             '<input id="{{$ctrl.dynamicItem.Id}}" ng-style="!$ctrl.dynamicItem.IsValid && {\'border-color\':\'red\'}" class="form-control" onkeypress="return event.charCode >= 48 && event.charCode <= 57 || event.charCode == 46" ng-init="$ctrl.init()" ng-change="$ctrl.change()" ng-disabled="!$ctrl.dynamicItem.Editable" type="number" min="{{$ctrl.min}}" max="{{$ctrl.max}}" step="any" ng-model="$ctrl.dynamicItem.Value" />' +
             '<p style="display:block;height:16px"><span ng-show="!$ctrl.dynamicItem.IsValid" style="color:red">{{$ctrl.dynamicItem.ValMessage}}</span></p>',

        controller: function ($scope, $element, $http, $sessionStorage) {
            var dynamicController = $scope.$parent.$parent.$parent.di;

            var vm = this;
            vm.dynamicItem = $scope.$parent.$parent.dynamicItem;


            vm.validate = function (numberValue, inputValue) {
                if (isNaN(numberValue)) {
                    if (inputValue == null || inputValue == "") {
                        if (vm.dynamicItem.Mandatory == "true" || vm.dynamicItem.Mandatory == true) {
                            vm.dynamicItem.IsValid = false;
                            vm.dynamicItem.ValMessage = "This field is mandatory";
                        } else {
                            vm.dynamicItem.IsValid = true;
                            vm.dynamicItem.ValMessage = "";
                        }
                    }
                } else {
                    if (!isNaN(vm.max) && !isNaN(vm.min)) {
                        if (numberValue <= vm.max && numberValue >= vm.min) {
                            vm.dynamicItem.IsValid = true;
                            vm.dynamicItem.ValMessage = "";
                        } else {
                            vm.dynamicItem.IsValid = false;
                            vm.dynamicItem.ValMessage = "Number must be greater or equal to " + vm.min + " and less or equal to " + vm.max;
                        }
                    } else {
                        if (isNaN(vm.max) && isNaN(vm.min)) {
                            vm.dynamicItem.IsValid = true;
                            vm.dynamicItem.ValMessage = "";
                        }
                        else {

                            if (isNaN(vm.max)) {
                                if (numberValue >= vm.min) {
                                    vm.dynamicItem.IsValid = true;
                                    vm.dynamicItem.ValMessage = "";
                                } else {
                                    vm.dynamicItem.IsValid = false;
                                    vm.dynamicItem.ValMessage = "Number must be greater or equal to " + vm.min;
                                }
                            }
                            if (isNaN(vm.min)) {
                                if (numberValue <= vm.max) {
                                    vm.dynamicItem.IsValid = true;
                                    vm.dynamicItem.ValMessage = "";
                                } else {
                                    vm.dynamicItem.IsValid = false;
                                    vm.dynamicItem.ValMessage = "Number must be less or equal to " + vm.max;
                                }
                            }
                        }
                    }
                }
            }


            if (vm.dynamicItem.Other != null) {
                vm.options = jQuery.parseJSON(vm.dynamicItem.Other);
                if (vm.dynamicItem.Value == undefined) {
                    vm.dynamicItem.Value = Number(vm.options.default);
                }

                vm.max = Number(vm.options.max);
                vm.min = Number(vm.options.min);
            }
            vm.validate(vm.dynamicItem.Value, null);

            vm.change = function () {
                var input = document.getElementById(vm.dynamicItem.Id);
                vm.validate(input.valueAsNumber, input.value);
                dynamicController.change(vm.dynamicItem);
            }

            vm.init = function () {
                dynamicController.init(vm.dynamicItem, false);
            }



        },
        controllerAs: '$ctrl'
    };
});