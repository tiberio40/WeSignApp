iframeApp = angular.module('iframeApp', []);

iframeApp.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

iframeApp.controller('iFrameCtrl', function ($scope, $parentScope) {

    $parentScope.$on('sendSignatureImage', function (e) {
        $scope.receiveImage();
    });

    $parentScope.$on('sendPhotoImage', function (e) {
        $scope.receiveUserImage();
    });

    $parentScope.$on('sendIBANPhotoImage', function (e) {
        $scope.receiveIBANImage();
    });

    $parentScope.$on('sendNIF1PhotoImage', function (e) {
        $scope.receiveNIF1Image();
    });

    $parentScope.$on('sendNIF2PhotoImage', function (e) {
        $scope.receiveNIF2Image();
    });
    
    $parentScope.$on('digitalSignature', function (e) {
        $scope.digitalSignature();
    });


    $scope.receiveUserImage = function () {
        $scope.userImageSrc = $parentScope.bc.userImageSrc;
        $scope.imageWidth = $parentScope.bc.imageWidth;
        $scope.$apply();
        $('#btnUserPhoto' + $parentScope.bc.imageIndex).remove();

        //Clean Signatures
        $scope.signatureCustomer = ' ';
        $('#btnSignatureCustomer').show();
        $('#signatureCustomerimage').hide();
        $scope.signatureBB = ' ';
        $('#btnSignatureBB').show();
        $('#signatureBBimage').hide();
        $scope.$apply();

        var str = $('#mainBodyDiv').html();
        $parentScope.bc.documentModules[$parentScope.bc.Code] = str;
    };

    $scope.receiveIBANImage = function () {
        $scope.ibanImage = $parentScope.bc.ibanImage;
        $scope.$apply();
        $('#btnIBAN').remove();

        //Clean Signatures
        $scope.signatureCustomer = ' ';
        $('#btnSignatureCustomer').show();
        $('#signatureCustomerimage').hide();
        $scope.signatureBB = ' ';
        $('#btnSignatureBB').show();
        $('#signatureBBimage').hide();
        $scope.$apply();

        var str = $('#mainBodyDiv').html();
        $parentScope.bc.documentModules[$parentScope.bc.Code] = str;
    };

    $scope.receiveNIF1Image = function () {
        $scope.nif1Image = $parentScope.bc.nif1Image;
        $scope.$apply();
        $('#btnNIF1').remove();

        //Clean Signatures
        $scope.signatureCustomer = ' ';
        $('#btnSignatureCustomer').show();
        $('#signatureCustomerimage').hide();
        $scope.signatureBB = ' ';
        $('#btnSignatureBB').show();
        $('#signatureBBimage').hide();
        $scope.$apply();

        var str = $('#mainBodyDiv').html();
        $parentScope.bc.documentModules[$parentScope.bc.Code] = str;
    };

    $scope.receiveNIF2Image = function () {
        $scope.nif2Image = $parentScope.bc.nif2Image;
        $scope.$apply();
        $('#btnNIF2').remove();

        //Clean Signatures
        $scope.signatureCustomer = ' ';
        $('#btnSignatureCustomer').show();
        $('#signatureCustomerimage').hide();
        $scope.signatureBB = ' ';
        $('#btnSignatureBB').show();
        $('#signatureBBimage').hide();
        $scope.$apply();

        var str = $('#mainBodyDiv').html();
        $parentScope.bc.documentModules[$parentScope.bc.Code] = str;
    };

    $scope.receiveImage = function () {

        if ($parentScope.bc.signatureType == "customer") {
            $scope.signatureCustomer = $parentScope.bc.signatureCustomer;
            $("button[id=btnSignatureCustomer]").hide(); //remove all buttons 
            $('#signatureCustomerimage').show();

            //#signatureCustomerimage
            //$("button[id=btnSignatureCustomer]").focus();
        }
        if ($parentScope.bc.signatureType == "bb") {
            $scope.signatureBB = $parentScope.bc.signatureBB;
            $('#btnSignatureBB').hide();
            $('#signatureBBimage').show();
        }

        if ($parentScope.bc.signatureType == "cr") {
            $scope.signatureCR = $parentScope.bc.signatureCR;
            $('#btnSignatureCR').remove();
        }

        $scope.$apply();
        $parentScope.bc.closeModel();

        var str = $('#mainBodyDiv').html();
        $parentScope.bc.documentModules[$parentScope.bc.Code] = str;
    };

    $scope.digitalSignature = function(){
        if ($parentScope.bc.signatureType == "customer") {
            $scope.signatureCustomer = $parentScope.bc.signatureCustomer;
            $("button[id=btnSignatureCustomer]").hide(); //remove all buttons
            $('#signatureCustomerimage').show();
        }else{
            $scope.signatureCR = $parentScope.bc.signatureCustomer;
            $("button[id=btnSignatureCR]").hide(); //remove all buttons
            $('#signatureCRimage').show();
        }
        
        $scope.$apply();
        var str = $('#mainBodyDiv').html();
        $parentScope.bc.documentModules[$parentScope.bc.Code] = str;
    };
    
    $scope.hide = function () {
        $parentScope.$apply(function () {
            $parentScope.$emit('from-iframe', 'Sent from iframe');
        });
    };

    $scope.openModal = function (type) {
        $parentScope.$apply(function () {
            $parentScope.bc.openModal(type);
        });
    };

    $scope.openModalPhoto = function (type) {
        $parentScope.$apply(function () {
            $parentScope.bc.openModalPhoto(type);
        });
    };

    $scope.openModalIBAN = function (type) {
        $parentScope.$apply(function () {
            $parentScope.bc.openModalIBAN(type);
        });
    };

});
