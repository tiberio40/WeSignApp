module.
  component('radiobutton', {
      template: '<input  style="transform: scale(1.5);" ng-init="$trl.init()" ng-disabled="!$ctrl.dynamicItem.Editable" class="" ng-checked="$ctrl.dynamicItem.Value" type="radio" ng-click="$ctrl.change()" />',
      controller: function ($scope, $element, $http) {
          var vm = this;

          var dynamicController = $scope.$parent.$parent.$parent.di;

          vm.dynamicItem = $scope.$parent.$parent.dynamicItem;
          if (vm.dynamicItem.DefaultValue == "undefined" || vm.dynamicItem.DefaultValue == undefined || vm.dynamicItem.DefaultValue == null || vm.dynamicItem.DefaultValue == "" || vm.dynamicItem.DefaultValue == "false")
              vm.dynamicItem.DefaultValue = false;
          else vm.dynamicItem.DefaultValue = true;

          if (vm.dynamicItem.Value == undefined) {
              vm.dynamicItem.Value = vm.dynamicItem.DefaultValue;
          }
          vm.change = function ()
          {
              vm.dynamicItem.Value = !vm.dynamicItem.Value;
              dynamicController.change(vm.dynamicItem);
          }

          vm.init = function () {
              dynamicController.init(vm.dynamicItem, false);
          }
      },
      controllerAs: '$ctrl'
  });