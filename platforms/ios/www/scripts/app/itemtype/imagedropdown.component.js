module.
directive('imagedropdown', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template:

            '<ui-select theme="bootstrap" ng-style="!$ctrl.dynamicItem.IsValid && {\'border-color\':\'red\'}" ng-init="$ctrl.init()" ng-change="$ctrl.change()" ng-disabled="!$ctrl.dynamicItem.Editable" ng-model="$ctrl.dynamicItem.Value" style="width:100%;" >' +
                '<ui-select-match placeholder="">{{$ctrl.dynamicItem.Value.fileName }}' +
                '</ui-select-match>' +
            '<ui-select-choices repeat="item in $ctrl.options">' +
              '<img ng-src="{{ item.fileData }}" />' +
              '{{item.fileName}}></div>' +
            '</ui-select-choices>' +
          '</ui-select>',         

        controller: function ($scope, $element, $http) {
            var vm = this;

            vm.dynamicItem = $scope.$parent.$parent.dynamicItem;
            vm.IsValid = true;
            var dynamicController = $scope.$parent.$parent.$parent.di;

            vm.change = function () {
                dynamicController.change(vm.dynamicItem);
   
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

                    if (vm.dynamicItem.Mandatory == undefined || vm.dynamicItem.Mandatory == false || vm.dynamicItem.Mandatory == "false") {
                        var emptyOption =
                            {
                                'default': false,
                                'fileData': undefined,
                                'fileName': '---- no image ----',
                                'id': -1
                            };
                        vm.options.splice(0, 0, emptyOption);
                    }


                    if (vm.dynamicItem.Value == undefined) {

                        var defaultOption = Enumerable.From(vm.options)
                                   .Where(function (item) { return item.default == true; })
                                   .ToArray();

                        if (defaultOption.length > 0) {
                            vm.dynamicItem.Value = defaultOption[0];
                        } else {
                            vm.dynamicItem.Value = vm.options[0];
                        }
                    }
                    
                }
            }
            iniciateController();
        },
        controllerAs: '$ctrl'
    };
});
