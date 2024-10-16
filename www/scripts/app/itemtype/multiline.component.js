module.
directive('multiline', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template: '<textarea id="{{$ctrl.dynamicItem.Id}}" style="width:100%" cols="40" rows="5" ng-style="!$ctrl.dynamicItem.IsValid && {\'border-color\':\'red\'}" ng-init="$ctrl.init()" ng-change="$ctrl.change()" ng-disabled="!$ctrl.dynamicItem.Editable" ng-model="$ctrl.dynamicItem.Value"></textarea>' +
            '<p style="display:block;height:16px"><span ng-show="!$ctrl.dynamicItem.IsValid" style="color:red">{{$ctrl.dynamicItem.ValMessage}}</span></p>',
  	  controller: function ($scope, $element, $http) {
  	      var vm = this;

  	      var dynamicController = $scope.$parent.$parent.$parent.di;

  	      vm.dynamicItem = $scope.$parent.$parent.dynamicItem;
  	    

  	      vm.validate = function (inputValue) {

  	          if (inputValue == "") {
  	              if (vm.dynamicItem.Mandatory == "true" || vm.dynamicItem.Mandatory == true) {
  	                  vm.dynamicItem.IsValid = false;
  	                  vm.dynamicItem.ValMessage = "This field is mandatory";
  	              } else {
  	                  vm.dynamicItem.IsValid = true;
  	                  vm.dynamicItem.ValMessage = "";
  	              }

  	          } else {
  	              if (vm.RegularExpression != null && vm.RegularExpression != "null" && vm.RegularExpression != "") {
  	                  var re = new RegExp(vm.RegularExpression);
  	                  if (!re.test(inputValue)) {
  	                      vm.dynamicItem.IsValid = false;
  	                      vm.dynamicItem.ValMessage = vm.dynamicItem.ValidationMessage;
  	                  } else {
  	                      vm.dynamicItem.IsValid = true;
  	                      vm.dynamicItem.ValMessage = " ";
  	                  }
  	              } else {
  	                  vm.dynamicItem.IsValid = true;
  	                  vm.dynamicItem.ValMessage = " ";
  	              }
  	          }
  	      }

  	      vm.change = function () {
  	          var input = document.getElementById(vm.dynamicItem.Id);
  	          vm.validate(input.value);
  	          dynamicController.change(vm.dynamicItem);
  	      }
  	      vm.init = function () {
  	          var strVal = vm.dynamicItem.Value.toString();
  	          if (strVal.indexOf('$') !== -1) {
  	              vm.dynamicItem.Macro = vm.dynamicItem.Value;
  	              dynamicController.init(vm.dynamicItem, true);
  	          } else {
  	              if (vm.dynamicItem.Macro != undefined) {
  	                  dynamicController.init(vm.dynamicItem, true);
  	              } else
  	                  dynamicController.init(vm.dynamicItem, false);

  	          }
  	      }

  	      function iniciateController() {

  	          if (vm.dynamicItem.DefaultValue == "undefined" || vm.dynamicItem.DefaultValue == null) vm.dynamicItem.DefaultValue = "";
  	          vm.RegularExpression = vm.dynamicItem.RegularExpression;
  	          vm.dynamicItem.ValMessage = vm.dynamicItem.ValidationMessage;
  	          if (vm.dynamicItem.Value == undefined) {
  	              vm.dynamicItem.Value = vm.dynamicItem.DefaultValue;
  	              
  	          }
              vm.validate(vm.dynamicItem.Value);
  	      }
  	      iniciateController();

  	  },    
  	  controllerAs: '$ctrl'
    };
});