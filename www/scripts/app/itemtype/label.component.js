module.
  component('labeltext', {
      template: '<p><span style="color:#000;font-family:"Open Sans"; text-transform:none;">{{$ctrl.dynamicItem.DefaultValue}}</span></p>',
  	  controller: function ($scope, $element, $http) {
  	      var vm = this;

  	      vm.dynamicItem = $scope.$parent.$parent.dynamicItem;
  	      vm.dynamicItem.IsValid = true;

  	      if (vm.dynamicItem.DefaultValue == "undefined") vm.dynamicItem.DefaultValue = "";

  	      if (vm.dynamicItem.Value == undefined) {
  	          vm.dynamicItem.Value = vm.dynamicItem.DefaultValue;
  	      }

  	      vm.init = function () {
  	          dynamicController.init(vm.dynamicItem, false);
  	      }
  	  },
  	  controllerAs: '$ctrl'
  });