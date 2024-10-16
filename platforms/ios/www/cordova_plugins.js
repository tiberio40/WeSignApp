cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-camera.Camera",
      "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "Camera"
      ]
    },
    {
      "id": "cordova-plugin-camera.CameraPopoverOptions",
      "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "CameraPopoverOptions"
      ]
    },
    {
      "id": "cordova-plugin-camera.camera",
      "file": "plugins/cordova-plugin-camera/www/Camera.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "navigator.camera"
      ]
    },
    {
      "id": "cordova-plugin-camera.CameraPopoverHandle",
      "file": "plugins/cordova-plugin-camera/www/ios/CameraPopoverHandle.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "CameraPopoverHandle"
      ]
    },
    {
      "id": "cordova-plugin-inappbrowser.inappbrowser",
      "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
      "pluginId": "cordova-plugin-inappbrowser",
      "clobbers": [
        "cordova.InAppBrowser.open"
      ]
    },
    {
      "id": "cordova-plugin-printer.Printer",
      "file": "plugins/cordova-plugin-printer/www/printer.js",
      "pluginId": "cordova-plugin-printer",
      "clobbers": [
        "cordova.plugins.printer"
      ]
    },
    {
      "id": "cordova-plugin-wkwebview-file-xhr.formdata-polyfill",
      "file": "plugins/cordova-plugin-wkwebview-file-xhr/src/www/ios/formdata-polyfill.js",
      "pluginId": "cordova-plugin-wkwebview-file-xhr",
      "runs": true
    },
    {
      "id": "cordova-plugin-wkwebview-file-xhr.xhr-polyfill",
      "file": "plugins/cordova-plugin-wkwebview-file-xhr/src/www/ios/xhr-polyfill.js",
      "pluginId": "cordova-plugin-wkwebview-file-xhr",
      "runs": true
    },
    {
      "id": "cordova-plugin-wkwebview-file-xhr.fetch-bootstrap",
      "file": "plugins/cordova-plugin-wkwebview-file-xhr/src/www/ios/fetch-bootstrap.js",
      "pluginId": "cordova-plugin-wkwebview-file-xhr",
      "runs": true
    },
    {
      "id": "cordova-plugin-wkwebview-file-xhr.fetch-polyfill",
      "file": "plugins/cordova-plugin-wkwebview-file-xhr/src/www/ios/whatwg-fetch-2.0.3.js",
      "pluginId": "cordova-plugin-wkwebview-file-xhr",
      "runs": true
    },
    {
      "id": "cordova-sqlite-storage.SQLitePlugin",
      "file": "plugins/cordova-sqlite-storage/www/SQLitePlugin.js",
      "pluginId": "cordova-sqlite-storage",
      "clobbers": [
        "SQLitePlugin"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-custom-config": "5.1.1",
    "cordova-plugin-camera": "7.0.0",
    "cordova-plugin-inappbrowser": "6.0.0",
    "cordova-plugin-printer": "0.8.0",
    "cordova-plugin-splashscreen": "6.0.2",
    "cordova-plugin-wkwebview-file-xhr": "3.1.1",
    "cordova-sqlite-storage": "6.1.0"
  };
});