module.
directive('imagemultipleselect', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template:
            //'<select multiple ng-model="$ctrl.dynamicItem.Value" ng-options="item.fileName for item in $ctrl.options">' +
            //'</select>',
              '<ui-select multiple theme="bootstrap" ng-style="!$ctrl.dynamicItem.IsValid && {\'border-color\':\'red\'}" ng-init="$ctrl.init()" ng-change="$ctrl.change()" ng-disabled="!$ctrl.dynamicItem.Editable" ng-model="$ctrl.dynamicItem.Value" style="width:100%;" >' +
                '<ui-select-match placeholder="">{{$item.fileName }}' +
                '</ui-select-match>' +
            '<ui-select-choices repeat="item in $ctrl.options">' +
              '<img ng-src="{{ item.fileData }}" />' +
              '{{item.fileName}}></div>' +
            '</ui-select-choices>' +
          '</ui-select>' +
          '<p style="display:block;height:16px"><span ng-show="!$ctrl.dynamicItem.IsValid" style="color:red">{{$ctrl.dynamicItem.ValMessage}}</span></p>',

        controller: function ($scope, $element, $http) {
            var vm = this;

            vm.dynamicItem = $scope.$parent.$parent.dynamicItem;

            var dynamicController = $scope.$parent.$parent.$parent.di;

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
                dynamicController.change(vm.dynamicItem);
                vm.validate();
            }
            vm.init = function () {
                dynamicController.init(vm.dynamicItem, false);
            }

            function iniciateController() {
                if (vm.dynamicItem.Other != null) {

                    var options = jQuery.parseJSON(vm.dynamicItem.Other);
                    vm.options = [];

                    //Não pode ser com o linq porque a propriedade deleted foi acrescentada depois.
                    for (var i = 0; i < options.length; ++i) {
                        if (options[i].hasOwnProperty("deleted")) {
                            if (options[i].deleted == false) {
                                vm.options.push(options[i]);
                            }
                        } else {
                            vm.options.push(options[i]);
                        }
                    }

                    vm.options = Enumerable.From(vm.options)
                    .OrderBy(function (x) { return x.id })
                    .ToArray();


                    if (vm.dynamicItem.Value == undefined) {
                        var defaultOptions = Enumerable.From(vm.options)
                                  .Where(function (item) { return item.default == true; })
                                  .ToArray();

                        if (defaultOptions.length > 0) {
                            vm.dynamicItem.Value = defaultOptions;
                        }// else {
                        //    vm.dynamicItem.Value = vm.options[0];
                        //}
                    }

                    
                }
                vm.validate();
            }
            iniciateController();
        },
        controllerAs: '$ctrl'
    };
});
