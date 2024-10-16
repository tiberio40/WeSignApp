
app.controller('ModalInstanceController', ModalInstanceController);

function ModalInstanceController($timeout, $uibModal, $scope) {
    var vm = this;

    vm.message = $scope.message;
    //controller across a bunch of modals

    $scope.ok = function () {

        $scope.modalInstance.dismiss();

    };

}


//app.controller('ModalController',  ['$scope', '$location', 'message', function ($scope, $location, message){
//    alert(message);
//    var vm = this;
//    vm.message = message;

//}]);



//app.controller('ModalInstanceController', function ($scope, $modalInstance) {
//    $scope.ok = function () {
//        $modalInstance.close();
//    };

//    $scope.cancel = function () {
//        $modalInstance.dismiss('cancel');
//    };
//});