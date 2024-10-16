﻿module.
directive('radiobuttonlist', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template: '<div ng-init="$ctrl.init()" ng-repeat="item in $ctrl.options"><input ng-disabled="!$ctrl.dynamicItem.Editable" style="margin-right:10px;transform: scale(1.5);margin-bottom:10px" type="radio" name="{{$ctrl.dynamicItem.Name}}" ng-model="$ctrl.selectedItem"  ng-value="item" ng-change="$ctrl.change()" /><label>{{item.description}}</label></div>' +
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

            vm.change = function ()
            {
                for (var i = 0; i < vm.options.length; ++i) {
                    if (vm.options[i].id == vm.selectedItem.id)
                        vm.options[i].Value = true;
                    else
                        vm.options[i].Value = false;
                }
                vm.dynamicItem.Other = angular.toJson(vm.options);
                vm.dynamicItem.Value = Enumerable.From(vm.options)
                                       .Where(function (x) { return x.Value == true })
                                       .ToArray();

                dynamicController.change(vm.dynamicItem);
                vm.validate();
            }

            vm.init = function ()
            {
                dynamicController.init(vm.dynamicItem, false);
            }

            function iniciateController() {
                if (vm.dynamicItem.Other != null) {
                    var options = jQuery.parseJSON(vm.dynamicItem.Other);

                    vm.options = Enumerable.From(options)
                    .Where(function (x) { return x.deleted == false })
                    .OrderBy(function (x) { return x.id })
                    .ToArray();

                    for (var i = 0; i < vm.options.length; ++i) {
                        if (vm.options[i].Value == undefined) {
                            vm.options[i].Value = vm.options[i].default;
                        }
                        if (vm.options[i].Value == true)
                            vm.selectedItem = vm.options[i];
                    }

                    vm.dynamicItem.Other = angular.toJson(vm.options);
                    vm.dynamicItem.Value = Enumerable.From(vm.options)
                                            .Where(function (x) { return x.Value == true })
                                            .ToArray();
                    
                }
                vm.validate();
            }
            iniciateController();
        },
        controllerAs: '$ctrl'
    };
});