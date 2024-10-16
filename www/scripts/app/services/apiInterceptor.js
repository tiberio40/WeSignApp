app.factory('APIInterceptor', ['$q', '$location', '$localStorage', 'appValues', function ($q, $location, $localStorage, appValues) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (typeof (appValues.securityToken) != 'undefined')
                config.headers.Authorization = 'Bearer ' + appValues.securityToken;
            return config;
        }
    };
}]);