module.
directive('item', function ($compile) {
    return {
        //restrict: 'E',
        scope: true,
        transclude: true,
        template: '<div></div>',

        //'<div>Select: <select ng-model="tempItem" ng-change="change()" ng-options="item.Name for item in itemTypes">' +
        //'</select></div>' +
        //'<div>name: <input name="txtbxName" ng-model="$parent.templateItem.Name" value="{{$parent.templateItem.Name}}" \></div>' +
        //'<div>sort: <input name="txtbxSort" ng-model="$parent.templateItem.Sort" value="{{$parent.templateItem.Sort}}" \></div>' +
        //'<div>label: <input name="txtbxLabel" ng-model="$parent.templateItem.Label" value="{{$parent.templateItem.Label}}"  \></div>' +
        //'<div>default value: <input name="txtbxDefaultValue" ng-model="$parent.templateItem.DefaultValue" value="{{$parent.templateItem.DefaultValue}}" \></div>' +
        //'<div>mandatory: <input type="checkbox" name="chkbxMandatory" ng-model="$parent.templateItem.Mandatory" checked="{{$parent.templateItem.Mandatory}}" \></div>' +
        //'<div>editable: <input type="checkbox" name="chkbxEditable" ng-model="$parent.templateItem.Editable" checked="{{$parent.templateItem.Editable}}" \></div>' +
        //'<div>regular expression: <input name="txtbxRegExpression" ng-model="$parent.templateItem.RegularExpression" value="{{$parent.templateItem.RegularExpression}}" \></div>' +
        //'<div>validation message: <input name="txtbxValidationMsg" ng-model="$parent.templateItem.ValidationMessage" value="{{$parent.templateItem.ValidationMessage}}" \></div>' +
        //'<div>deleted: <input name="txtbxDeleted" ng-model="$parent.templateItem.Deleted" value="{{$parent.templateItem.Deleted}}" \></div>' +
        //'<div class="itemtype">optional params</div>',

        controller: function ($scope, $element, $http, config, $compile) {

            var dynamicItem = $scope.$parent.dynamicItem;
            (dynamicItem.Editable == "false" || dynamicItem.Editable == 0 || dynamicItem.Editable == false) ? dynamicItem.Editable = 0 : dynamicItem.Editable = 1;

            //add optional properties of components
            //var itemTypeElem = $compile("<div style='border-bottom:2px solid #ccc; padding-top:15px; padding-bottom:15px;'><span style='font-weight: 600; padding-top:10px !important; width: 10vw; color:#0D4C93; font-size: 16px; font-family: 'Open Sans';'>" + dynamicItem.Label + "</span><" + dynamicItem.ItemTypeName + "></" + dynamicItem.ItemTypeName + "></div>")($scope);
            var strHtml = '';

            if (dynamicItem.ItemTypeName != "labeltext") {
                strHtml += '<div class="row" style="margin-top:10px;">';
                strHtml += '<div class="col-xs-12 col-sm-12" style=""><span class="spanCustomerText" style="font-weight:bold;">' + dynamicItem.Label + '</span></div>';
                strHtml += '</div>';
            }
            //strHtml += '<div class="col-xs-2 col-sm-2" style=""><span style="color:#004D8B; font-size:12px; font-family:"Open Sans"; text-transform:none;">' + dynamicItem.ItemTypeName + '</span></div>';
            strHtml += '<div class="row">';
            strHtml += '<div class="col-xs-12 col-sm-12" style=""><' + dynamicItem.ItemTypeName + '></' + dynamicItem.ItemTypeName + '></div>';
            strHtml += '</div>';

            //strHtml += '<div class="col-xs-2 col-sm-2" style=""><span style="color:#004D8B; font-size:12px; font-family:"Open Sans"; text-transform:none;">' + dynamicItem.ValidationMessage + '</span></div>';
            //strHtml += '<div class="col-xs-1 col-sm-1" style=""><input ng-model="" style="width:100%; height:35px; line-height:35px; margin-left:0px;" class="form-control-custom" type="checkbox" value="" /></div>';
            var itemTypeElem = $compile(strHtml)($scope);

            //code to replace properties fom item types
            var pp = $element.children("div");
            $element.append(itemTypeElem);

       

            //var teste = dynamicItem.getValue();
            //if ($scope.itemTypes == undefined) {
            //    getItemTypes();
            //} else {
            //    $scope.tempItem = findItemInArray($scope.$parent.templateItem.TemplateItemType.Id, $scope.itemTypes);
            //    selectItemType($scope.tempItem.Name);
            //}

            //$scope.validate = function ()
            //{
            //    return ($scope.$parent.templateItem.Id > 0 && $scope.$parent.$parent.ti.templateStepCode == "Publish");
            //}

            //$scope.change = function (index) {
            //    //selected itemtype  
            //    var selectedItemType = $scope.tempItem.Name;
            //    $scope.$parent.templateItem.Other = null;
            //    $scope.$parent.templateItem.TemplateItemType = $scope.tempItem;
            //    selectItemType(selectedItemType, index);
            //};

            //function getItemTypes() {
            //    $http.get(config.serviceUrl + "/api/ItemType").then(
            //        function (result) {
            //            $scope.itemTypes = result.data;
            //            $scope.tempItem = findItemInArray($scope.$parent.templateItem.TemplateItemType.Id, $scope.itemTypes);
            //            selectItemType($scope.tempItem.Name);
            //        },
            //        function (error) {
            //            handleException(error);
            //        }
            //    );
            //}

            //function findItemInArray(itemId, array) {
            //    for (var i = 0; i < array.length; i++) {
            //        if (array[i].Id == itemId)
            //            return array[i];
            //    }
            //    return undefined;
            //}

            //function selectItemType(selectedItemType, index) {

            //    //add optional properties of components
            //    var itemTypeElem = $compile("<div><" + selectedItemType + "></" + selectedItemType + "></div>")($scope);
            //    //code to replace properties fom item types
            //    var pp = $element.children("div");
            //    var browser = get_browser();
            //    if(browser.name == "IE")
            //        pp[pp.length - 1].removeNode(true);
            //    else
            //        pp[pp.length - 1].remove();
            //    $element.append(itemTypeElem);
            //}
        }
    };
});