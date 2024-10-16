module.
  component('checkbox', {
      template: '<input style="transform: scale(1.5);" ng-disabled="!$ctrl.dynamicItem.Editable" class="" type="checkbox" ng-init="$ctrl.init()" ng-change="$ctrl.change()" ng-model="$ctrl.dynamicItem.Value" />',
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

  	      vm.change = function () {
  	          dynamicController.change(vm.dynamicItem);
  	      }
  	      vm.init = function () {
  	          dynamicController.init(vm.dynamicItem, false);
  	      }

  	  },
  	  controllerAs: '$ctrl'
  });