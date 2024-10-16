
'use strict';

app
     .factory('UserService', UserService);

UserService.$inject = ['$http'];
function UserService($http) {
    var service = {};

    service.GetAll = GetAll;


    return service;

    function GetAll() {
        return $http.get(serviceUrl + '/api/account/GetUsers').then(handleSuccess, handleError('Error getting all users'));
    }


    // private functions

    function handleSuccess(res) {
        return res.data;
    }

    function handleError(error) {
        return function () {
            return { success: false, message: error };
        };
    }
}


