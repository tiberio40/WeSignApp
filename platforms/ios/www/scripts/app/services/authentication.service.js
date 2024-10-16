
'use strict';

app.factory('AuthenticationService', AuthenticationService);

AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout', 'UserService', 'config'];
function AuthenticationService($http, $cookieStore, $rootScope, $timeout, UserService, config) {
    var service = {};
    var server = "192.168.0.52";
    service.Login = Login;
    service.SetCredentials = SetCredentials;
    service.ClearCredentials = ClearCredentials;
    service.GetMarkets = GetMarkets;
    service.GetEnabledMarkets = GetEnabledMarkets;
    service.LoginToken = LoginToken;
    service.GetTokenSSO = GetTokenSSO;
    service.GetRolesBySSO = GetRolesBySSO;
    service.LoginBySSO = LoginBySSO;
    service.GetUserSSO = GetUserSSO;
    service.LogOutSSO = LogOutSSO;
    service.GetFrontendVersion = GetFrontendVersion;

    return service;

    function GetMarkets(callback) {
        var url = serviceUrl + "/api/market/Getmarkets";
        $http.post(
            url
        ).success(function (response) {
            callback(response);
        }).error(function (data) {
            var arr = { code: -1, Message: data.Message };
            callback(arr);
        });
    }

    function GetEnabledMarkets(callback) {
        var url = serviceUrl + "/api/market/GetEnabledMarkets";
        $http.post(
            url
        ).success(function (response) {
            callback(response);
        }).error(function (data) {
            var arr = { code: -1, Message: data.Message };
            callback(arr);
        });
    }

    function GetFrontendVersion(callback) {
        var url = serviceUrl + "/api/account/getFrontendVersion";
        $http.post(
            url
        ).success(function (response) {
            callback(response);
        }).error(function (data) {
            callback(-1);
        });
    }

    function GetTokenSSO(data, callback) {
        var url = serviceUrl + "/api/Account/GetSSOToken";
        console.log('API: ' + url)
        $http.post(serviceUrl + "/api/Account/GetSSOToken", data).success(function (response) {
            callback(response);
        }).error(function (error) {
            callback(error);
        });
    }

    function GetRolesBySSO(data, callback) {
        
        $http.post(serviceUrl + "/api/Account/getRolesSSO", data).then(
            function (result) {
                callback(result);
            },
            function (error) {
                callback(error);
            }
        );
    }

    function Login(username, password, market, callback) {
        //var url = serviceUrl + "/api/account/checkUser?username=" + username + "&password=" + password + "&market=" + market + "&typeOfAccess=FrontEnd";

        delete $http.defaults.headers.common['X-Requested-With'];
        $http.post(serviceUrl + "/api/Account/checkUser", { args: [{ "username": username, "password": password, "market": market, "typeOfAccess": "FrontEnd" }] }).then(
            function (result) {
                callback(result);
            },
            function (error) {
                callback(error);
            });
    }

    function LoginBySSO(data, callback){
        var url = serviceUrl + "/api/Account/LogInSSO";
        $http.post(
            url,
            data
        ).success(function (response) {
            callback(response);
        }).error(function (error) {
            callback(error);
        });
    }

    function LogOutSSO(){

    }

    function GetUserSSO(data, callback){
        var url = serviceUrl + "/api/Account/GetUserSSO";
        $http.post(url, data).success(function (response) {
            callback(response);
        }).error(function (error) {
            callback(error);
        });
    }

    function SetCredentials(username, password, market) {
        console.log("Pone las credenciales")
        var authdata = Base64.encode(username + ':' + password);

        $rootScope.globals = {
            currentUser: {
                username: username,
                authdata: authdata,
                market: market,
                password: password
            }
        };

        $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
        $cookieStore.put('globals', $rootScope.globals);
    }

    function ClearCredentials() {
        $rootScope.globals = {};
        $cookieStore.remove('globals');
        $http.defaults.headers.common.Authorization = 'Basic';
    }

    function GetCredentials() {
        var arr = [];
        arr.push();
    }

    function LoginToken(userlogin) {
        var resp = $http({
            url: serviceUrl + "/TOKEN",
            method: "POST",
            data: $.param({ grant_type: 'password', username: userlogin.username, password: userlogin.password }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return resp;
    }
}

// Base64 encoding service used by AuthenticationService
var Base64 = {

    keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this.keyStr.charAt(enc1) +
                this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) +
                this.keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = this.keyStr.indexOf(input.charAt(i++));
            enc2 = this.keyStr.indexOf(input.charAt(i++));
            enc3 = this.keyStr.indexOf(input.charAt(i++));
            enc4 = this.keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
    }
};

