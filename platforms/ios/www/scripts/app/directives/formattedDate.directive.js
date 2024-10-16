﻿module.directive('formattedDate', function (dateFilter) {
    return {
        require: 'ngModel',
        scope: {
            format: "="
        },
        link: function (scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function (data) {
                //convert data from view format to model format
                return dateFilter(data, scope.format); //converted
            });

            ngModelController.$formatters.push(function (data) {
                //convert data from model format to view format
                return dateFilter(data, scope.format); //converted
            });
        }
    }
});