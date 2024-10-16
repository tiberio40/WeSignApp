app.factory('DocumentService', DocumentService);

DocumentService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout', 'config'];
function DocumentService($http, $cookieStore, $rootScope, $timeout, config) {
    var service = {};
    var server = "192.168.0.52";
    service.GetDocumentByGeo = GetDocumentByGeo;
    service.GetUsers = GetUsers;
    service.SendDocumentError = SendDocumentError;
    
    return service;
    
    function GetDocumentByGeo(username, idMarket, callback) {
        
        username = 'PMI\\MSANTOS7';
        
        $http.get(
                  serviceUrl + "/api/DocumentByGeo",
                  {
                  params: {
                      "currentYear": true,
                      "username": username
                  }
                  }
                  ).then(function (response) {
                      callback(response.data);
                  });
        
    }
    function GetUsers(callback) {
        
        
        $http.get(
                  serviceUrl + "/api/account/GetUsers"
                  ).then(function (response) {
                      alert(response.data);
                  });
        
    }
    
    function SendDocumentError(message, callback) {
        var url = serviceUrl + "/api/Account/registerError/";
        
        var currUser = null;
        var currMkt = null;
        
        currUser = angular.element('body').scope().globals.currentUser.username;
        currMkt = angular.element('body').scope().globals.currentUser.market;
        
        $http(
              {
              method: 'POST',
              url: url,
              data: {
                  "message": message,
                  "market": currMkt,
                  "user": currUser,
                  "stack": 'Loading Document'
              },
              headers: { 'Content-Type': 'application/json' }
              }
              ).success(function (response) {
                  callback(response);
                  
              }).error(function (data) {
                  callback(data);
              });
        
    }
}
