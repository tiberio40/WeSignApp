
app.controller('SelectDocumentTypeController', SelectDocumentTypeController);

function SelectDocumentTypeController($sessionStorage, $scope, $location, updateData, $q) {
    var vma = this;
    vma.documentTypes = [];
    vma.selectedDocumentType = undefined;
    vma.documenttypemodules = [];
    vma.next = next;

    vma.navigateTo2 = navigateTo2;
    //vma.init = init;
    vma.init = function () {
        $q.all([updateData.GetLocalData("DocumentType", "*", "")])
                                                      .then(function (result) {
                                                          vma.documentTypes = Enumerable
                                                              .From(result[0][1])
                                                              .Where(function (item) { return item.Deleted == "false"; })
                                                              .ToArray();

                                                          //for(var i = 0; i != result[0][1].rows.lenght; ++i)
                                                          //{
                                                          //    vma.documentTypes.push(result[0][1].rows.item(i));
                                                          //}


                                                          if ($sessionStorage.IBANChange == true) {
                                                              //Open new IBAN Creation Document
                                                              $sessionStorage.IsInCreationMode = true;
                                                              var documentType = Enumerable
                                                                                  .From(vma.documentTypes)
                                                                                  .Where(function (item) { return item.Code == 'PT_IBAN'; })
                                                                                  .ToArray();

                                                              $sessionStorage.DocumentTypeObj = documentType[0];
                                                              vma.selectedDocumentType = documentType[0].Id;
                                                              vma.selectNextStep();
                                                          }

                                                      });
    }




    //var p1 = updateData.GetLocalData("DocumentType", "*", '').then(function (result2) {

    //    vma.documentTypes = Enumerable.From(result2[0][1].rows).ToArray();

    //    //vma.documentTypes = result2[1].rows;

    //    //for (var i = 0; i != result2[1].rows.length ; ++i)
    //    //{
    //    //    var arr = { Id: result2[1].rows.item(i).Id, Name: result2[1].rows.item(i).Name, DocumentLabelCode: result2[1].rows.item(i).DocumentLabelCode, Description: result2[1].rows.item(i).Description};
    //    //    vma.documentTypes.push(arr);
    //    //}

    //    //vma.documentTypes = [{Id:1,Name:'Agreement'}];
    //}, function (error) {
    //    alert('error');
    //});

    //$q.all([updateData.GetLocalData("DocumentType", "*")])
    //                                             .then(function (result2) {
    //                                                 vma.documentTypes = result2[0][1].rows;
    //                                             });


    function navigateTo2(to) {
        $location.path(to);
    }

    vma.select = function (selected) {
        vma.selectedDocumentType = selected;

        var documentType = Enumerable
                            .From(vma.documentTypes)
                            .Where(function (item) { return item.Id == selected; })
                            .ToArray();

        $sessionStorage.DocumentTypeObj = documentType[0];
        
    }

    vma.Cancel = function () {
        if ($sessionStorage.IsInCreationMode == true) {
            swal({
                title: "Are you sure?",
                text: "If you continue your current document will be cancelled.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                closeOnConfirm: true
            },
           function () {
               $scope.$apply(function () {
                   $sessionStorage.Document = undefined;
                   $sessionStorage.IsInCreationMode = false;
                   $location.path('/home');
               });

           });
        } else {
            $sessionStorage.Document = undefined;
            $sessionStorage.IsInCreationMode = false;
            $location.path('/home');
        }

    }

    vma.selectNextStep = function () {
        //$scope.$parent.$parent.vm.selectFirstModule(vma.selectedDocumentType);

        if (vma.selectedDocumentType != null) {
            $sessionStorage.documentType = vma.selectedDocumentType;
            $sessionStorage.DocumentPreview = undefined;
            $sessionStorage.Document = undefined;
            $location.path('/createdocument');
        } else {
            swal("Information", "You need to select a Document Type.", "warning");
        }
    }


    function next() {

        //$scope.$parent.$parent.vm.selectFirstModule(vma.selectedDocumentType);
        //$q.all([updateData.GetLocalData("DocumentTypeModule", "*")])
        //                                             .then(function (result) {
        //                                                 alert('buh2.2');
        //                                             });

        //var p1 = updateData.GetLocalData("DocumentTypeModule", "*", '').then(function (data) {
        //    alert('buh');
        //}, function (error) {
        //    alert('error');
        //});

        //return $q.all([updateData.GetLocalData("DocumentTypeModule", "*")])
        //                                            .then(function (result) {
        //                                                alert('buh');
        //                                                return result;
        //                                                //vm.documenttypemodules = result1[0][1].rows;
        //                                                //vm.documenttypemodules = 
        //                                                //Enumerable.From(result[0][1].rows)
        //                                                // .OrderBy("$.Sort")
        //                                                // .ToArray();
        //                                            });

        //$scope.$parent.$parent.vm.selectFirstModule(vm.selectedDocumentType);
    }
    vma.init();
}