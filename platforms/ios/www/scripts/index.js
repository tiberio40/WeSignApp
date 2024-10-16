// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        app = angular.element(document).ready(function () {

            angular.bootstrap(document, ["app"]);


        });

        //var localDatabase = window.sqlitePlugin.openDatabase({ name: "CMTLocal.db", location: 'default' });

    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();

$(function () {
    FastClick.attach(document.body);



  
});



$(document).ready(function () {
    //$.fn.dataTable.moment('dd-MM-yyyy');
    //$.fn.dataTable.moment('dd-MM-yyyy HH:mm');
    //$('#docListTable').DataTable();
   

 
});
