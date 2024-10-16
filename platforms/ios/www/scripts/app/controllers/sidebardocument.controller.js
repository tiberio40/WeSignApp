app.controller('SidebarController', SidebarController);

function SidebarController($scope, $location) {
    var vm = this;


    vm.parentController = $scope.$parent.vm;


}