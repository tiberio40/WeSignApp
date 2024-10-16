app.controller('DDRowController', DDRowController);

function DDRowController($scope, $location, updateData, $q, $filter, $sessionStorage, DTOptionsBuilder, DTColumnDefBuilder, $compile, $element, $document) {

    var vm = this;
    vm.Code = "dd_row";
    var parentController = $scope.$parent.$parent.vm;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    vm.showNoDD = false;

    vm.dtColumns = [
      { Name: 'CustomerName' }, { Name: 'CustomerRegisteredName' }, { Name: 'DDType' }, { Name: 'Offer' }, { Name: 'Template' },
      { Name: 'City' }, { Name: 'Col1' }, { Name: 'Col2' }, { Name: 'col3' }, { Name: 'Col4' }, { Name: 'Col5' }
    ];



    //vm.dtOptions = DTOptionsBuilder.newOptions().withDOM('ftr').withOption('paging', false);

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM('frt')
        .withScroller()
        .withOption('deferRender', true)
         //Do not forget to add the scorllY option!!!
        .withOption('scrollY', 380)
        .withOption('scrollX', 380);
    

    var html = '<button ng-click="md.clearInput()" style="width: 115px; height: 5vh; background-color:#6aa7f1; border-radius:5vh; border:0;" class="btn btn-primary">Clear</button>';
    var itemTypeElem = $compile(html)($scope);
    var xx = $('.dataTables_filter');
    var yy = $element.children('dataTables_filter')
    yy.append('<p>teste</p>');
    xx.append('<p>teste</p>');
    $('.dataTables_filter').append('<p>teste</p>');

    var tt = angular.element('dataTables_filter');
    tt.append('<p>teste</p>');
    var ttx = angular.element('#dataTables_filter');
    ttx.append('<p>teste</p>');



    //var tty = $document[0].getElementById("ddListTable_filter");
    //tty.append('<p>teste</p>');
    //var zz = $element[0].getElementsByClassName("dataTables_filter");
    //zz.append('<p>teste</p>');

    var where = '';
    if ($sessionStorage.Document != undefined) {
        where = " Where (Signed = 'false' or (Signed is null)) and (Discarded = 'false' or (Discarded is null)) and Id=" + $sessionStorage.Document.DD.Id;
    } else
    {
        where = " Where (Signed = 'false' or (Signed is null)) and (Discarded = 'false' or (Discarded is null))"
    }

    $q.all([updateData.GetLocalData("ImportedAgreement", "*", where)])
                                 .then(function (result) {
                                     var importedAgreements = Enumerable.From(result[0][1])
                                         .ToArray();
                                     vm.importedAgreements = importedAgreements;
                                     if (importedAgreements.length == 0){
                                         vm.showNoDD = true;
                                         parentController.canGoToNextStep = false;
                                     }else{
                                         if ($sessionStorage.Document != undefined)
                                         {
                                             vm.selectDD(vm.importedAgreements[0]);
                                         }
                                         
                                     }
                                 });


    vm.clearInput = function ()
    {

    }

    vm.selectDD = function (item) {
        vm.idSelected = item.Id;
        parentController.documentModules[vm.Code] = parentController.dd = item;
        $q.all([updateData.GetLocalData("Template", "*", " Where Name = '" + item.Template + "' COLLATE NOCASE")])
                    .then(function (result) {
                        var template = Enumerable.From(result[0][1])
                            .ToArray();

                        if (template.length == 0) {
                    
                            swal({
                                title: "No Template",
                                text: "There is no template for this agreement.",
                                type: "error",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "OK",
                                closeOnConfirm: true
                            },
                            function (isConfirm) {

                               $sessionStorage.documentType = null;

                               $sessionStorage.Document = undefined;

                                $scope.$apply(function () {
                                    
                                    $location.path('/home');
                                });
                                $sessionStorage.IsInCreationMode = false;

                            });
                        } else {
                            parentController.ddtemplate = template[0];
                            parentController.alternateGeography = parentController.dd.Territory;
                            $q.all([updateData.GetLocalData("Geography", "*", " where Id = '" + parentController.dd.Territory + "' COLLATE NOCASE")])
                              .then(function (result) {
                                  var geography = Enumerable.From(result[0][1])
                                                      .ToArray();
                                  if (geography.length > 0)
                                      parentController.dd.TerritoryName = geography[0].Description;
                                  else
                                      parentController.dd.TerritoryName = '';
                                  parentController.canGoToNextStep = true;
                              });

                        }
                    });
    }
    vm.resetSelection = function (item) {
        vm.idSelected = undefined;
        parentController.documentModules[vm.Code] = parentController.dd = undefined;
        parentController.canGoToNextStep = false;
    }
}