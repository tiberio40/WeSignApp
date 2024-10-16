app.controller('DynamicItemsController', DynamicItemsController);

function DynamicItemsController($scope, $location, updateData, $q, $element, $compile, $sessionStorage) {

    var vm = this;
    vm.Code = "dynmctms";
    vm.Count = 0;
    vm.dynamicItemsWithMacros = [];
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    var parentController = $scope.$parent.$parent.vm;
    parentController.canGoToNextStep = true;

    if (parentController.documentModules[vm.Code] != undefined) {
        vm.dynamicitems = parentController.documentModules[vm.Code];
    } else {
        vm.dynamicitems = parentController.dynamicitems;
    }

   



   vm.change = function (item)
   {
       inputValues();
   }

   vm.init = function (item, hasmacro)
   {
        //if (item.DefaultValue != null && (item.DefaultValue.indexOf('$sum(') > 0 || item.DefaultValue.indexOf('$itemcount(') > 0 || item.DefaultValue.indexOf('$func(') > 0))
       if(hasmacro){
            vm.dynamicItemsWithMacros.push(item);
       }
       //if (vm.Count++ >= vm.dynamicitems.length)
           inputValues();
   }

   function inputValues ()
   {
       for (var j = 0; j < vm.dynamicItemsWithMacros.length; ++j) {

           var indexOfSum = vm.dynamicItemsWithMacros[j].Macro.indexOf('$sum[');
           if (indexOfSum >= 0) {
               var macro = vm.dynamicItemsWithMacros[j].Macro.replace(/ /g, '');
               macro = macro.replace(/\$sum\[/g, '');
               macro = macro.replace(/\]/g, '');
               var dynamicItemNames = macro.split('+');
               var sum = 0;
               for (var i = 0; i < dynamicItemNames.length; ++i) {
                   var dynamicItem = Enumerable.From(vm.dynamicitems)
                                              .Where(function (item) { return item.Name == dynamicItemNames[i]; })
                                              .ToArray();

                   if (dynamicItem.length > 0 && !isNaN(dynamicItem[0].Value)) {
                       sum += Number(dynamicItem[0].Value);
                   }
               }
               vm.dynamicItemsWithMacros[j].Value = sum;
           }
           var indexOfItemCount = vm.dynamicItemsWithMacros[j].Macro.indexOf('$itemcount[');
           if (indexOfItemCount >= 0) {
               var macro = vm.dynamicItemsWithMacros[j].Macro.replace(/ /g, '');
               macro = macro.replace(/\$itemcount\[/g, '');
               macro = macro.replace(/\]/g, '');
               var dynamicItemNames = macro.split('+');
               var sum = 0;
               for (var i = 0; i < dynamicItemNames.length; ++i) {
                   var dynamicItem = Enumerable.From(vm.dynamicitems)
                                              .Where(function (item) { return item.Name == dynamicItemNames[i]; })
                                              .ToArray();

                   if (dynamicItem.length > 0 && dynamicItem[0].Value != undefined) {
                       sum += Number(dynamicItem[0].Value.length);
                   }
               }
               vm.dynamicItemsWithMacros[j].Value = sum;
           }
           var indexOfFun = vm.dynamicItemsWithMacros[j].Macro.indexOf('$func[');
           if (indexOfFun >= 0) {
               var macro = vm.dynamicItemsWithMacros[j].Macro.replace(/ /g, '');
               macro = macro.replace(/\$func\[/g, '');
               macro = macro.replace(/\]/g, '');
               var dynamicItemNames = macro.split(/[\+\*\/\-]+/);
               //var sum = 0;
               for (var i = 0; i < dynamicItemNames.length; ++i) {
                   var dynamicItem = Enumerable.From(vm.dynamicitems)
                                              .Where(function (item) { return item.Name == dynamicItemNames[i]; })
                                              .ToArray();
                   var reg = new RegExp(dynamicItem[0].Name, 'g');
                   if (dynamicItem.length > 0 && dynamicItem[0].Value != undefined && !isNaN(dynamicItem[0].Value)) {
                       macro = macro.replace(reg, dynamicItem[0].Value);
                   } else 
                   {
                       if (dynamicItem[0].Value == undefined)
                            macro = macro.replace(reg, 0);
                   }
               }
               vm.dynamicItemsWithMacros[j].Value = eval(macro);;
           }
       }
   }

 
   
}