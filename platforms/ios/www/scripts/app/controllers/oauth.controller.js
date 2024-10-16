app.controller('OauthController', OauthController);

function OauthController($scope, $localStorage, AuthenticationService, $location, $timeout) {
    var vm = this;

    vm.getToken = function () {
        let code = $localStorage.sso_code;
        console.log(code)
        AuthenticationService.GetTokenSSO({ code: code }, function (success) {
            let response = success;

            if (response.hasOwnProperty('error')) {
                showExpirationMessage();
            } else {
                response['is_login'] = false;
                $localStorage.sso_token = response;
            }    


            $timeout(function () {
                $location.path('/login');
            }, 2000);

        }, function (error) {
            console.log(error)
            showExpirationMessage();
            localStorage.removeItem('ngStorage-sso_code');
            $timeout(function () {
                console.log('vuelve al login')
                $location.path('/login');
            }, 500);
        });
    }


    vm.getToken();

    function showExpirationMessage() {
        swal({
            title: "Attention",
            text: "The token has expired. Please try again",
            type: "warning",
            closeOnConfirm: true
        });
    }


}