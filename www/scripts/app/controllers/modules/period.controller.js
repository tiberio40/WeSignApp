app.controller('PeriodController', PeriodController);

function PeriodController($scope, $location, updateData, $q, $filter, $sessionStorage) {

    var vm = this;
    vm.Code = "ag_prds";
    vm.currencyToken = currencyToken;
    var parentController = $scope.$parent.$parent.vm;
    parentController.canGoToNextStep = false;
    vm.validationMessage = [];
    vm.validateStartDates = validateStartDates;
    vm.validateEndDates = validateEndDates;
    vm.min = 0;
    vm.max = 100;
    vm.navigateTo2 = navigateTo2;
    vm.selectedIndex = 0;
    vm.selectedType = '';
    vm.differenceInDays = differenceInDays;
    vm.currentContractValue = parentController.documentMasterDetails.ContractValue;
    vm.options = {
        date: new Date(),
        mode: 'date'
    };
    vm.reloadTotalValues = reloadTotalValues;

    vm.StartDatesErrorMessages = [];
    vm.EndDatesErrorMessages = [];

    vm.totalWeigths = 0;
    vm.totalPeriodTotal = 0;

    parentController.canGoToNextStep = true;

    //only periods that are not deleted
    vm.periods = Enumerable.From(parentController.periods.Periods)
                                    .Where(function (item) { return item.Deleted == false; })
                                    .ToArray();

    vm.arePeriodsEditable = parentController.periods.ArePeriodsEditable;
    vm.DocumentTypeObjName = $sessionStorage.DocumentTypeObj.Name;

    //objecto que vai ser guardado no documento
    if (parentController.documentModules[vm.Code] == undefined) {
        vm.documentPeriods = [];
        vm.periodsCalculations = [];
        for (var i = 0; i < vm.periods.length; ++i) {

            vm.StartDatesErrorMessages.push('');
            vm.EndDatesErrorMessages.push('');

            var documentPeriod =
            {
                'EndDate': new Date(parseInt(vm.periods[i].EndDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))),
                'StartDate': new Date(parseInt(vm.periods[i].StartDate.DefaultValue.replace(/\/Date\((\d+)\)\//g, "$1"))),
                'PeriodDuration': vm.periods[i].PeriodDuration,
                'PeriodTotal': vm.periods[i].PeriodTotal,
                'Weight': vm.periods[i].Weight.DefaultValue,
                'Mandatory': vm.periods[i].Mandatory,
                'Selected': vm.periods[i].Mandatory
            };

            vm.documentPeriods[i] = documentPeriod;

            var p = {
                PeriodDuration: Number(differenceInDays(new Date(vm.documentPeriods[i].EndDate), new Date(vm.documentPeriods[i].StartDate))),
                PeriodTotal: (vm.currentContractValue * vm.documentPeriods[i].Weight) / 100//(Number(differenceInDays(new Date(vm.documentPeriods[i].EndDate), new Date(vm.documentPeriods[i].StartDate))) * vm.currentContractValue) / 100
            };

            if (vm.periods[i].EndDate.Editable)
                vm.documentPeriods[i].EndDate = new Date(vm.documentPeriods[i].EndDate);
            if (vm.periods[i].StartDate.Editable)
                vm.documentPeriods[i].StartDate = new Date(vm.documentPeriods[i].StartDate);

            vm.periodsCalculations[i] = p;

            vm.documentPeriods[i].PeriodTotal = p.PeriodTotal;
            vm.documentPeriods[i].PeriodDuration = p.PeriodDuration;


        }
        parentController.documentModules[vm.Code] = vm.documentPeriods;

        reloadTotalValues();

    } else {
        vm.documentPeriods = [];
        vm.documentPeriods = parentController.documentModules[vm.Code];
        vm.periodsCalculations = [];
        for (var i = 0; i < vm.documentPeriods.length; ++i) {

            vm.StartDatesErrorMessages.push('');
            vm.EndDatesErrorMessages.push('');

            var p = {
                PeriodDuration: Number(differenceInDays(new Date(vm.documentPeriods[i].EndDate), new Date(vm.documentPeriods[i].StartDate))),
                PeriodTotal: (vm.currentContractValue * vm.documentPeriods[i].Weight) / 100//(Number(differenceInDays(new Date(vm.documentPeriods[i].EndDate), new Date(vm.documentPeriods[i].StartDate))) * vm.currentContractValue) / 100
            };

            vm.periodsCalculations[i] = p;

            //if (vm.periods[i].EndDate.Editable)
            vm.documentPeriods[i].EndDate = new Date(vm.documentPeriods[i].EndDate);

            //if (vm.periods[i].StartDate.Editable)
            vm.documentPeriods[i].StartDate = new Date(vm.documentPeriods[i].StartDate);

            vm.documentPeriods[i].PeriodTotal = p.PeriodTotal;
            vm.documentPeriods[i].PeriodDuration = p.PeriodDuration;
        }
        reloadTotalValues();
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }


    function validateStartDates(index) {
        vm.StartDatesErrorMessages[index] = '';
        var isInvalid = false;
        var msg = "";
        //Validate Start Date
        if (index == 0) {
            var dateDoc = parentController.documentMasterDetails.StartDate;
            var datePeriod = vm.documentPeriods[index].StartDate;
            if (new Date(datePeriod).setHours(0, 0, 0, 0) != new Date(dateDoc).setHours(0, 0, 0, 0)) {
                isInvalid = true;
                vm.StartDatesErrorMessages[index] = 'Start Date cannot be different than document Start Date';
                msg = 'Start Date cannot be different than document Start Date';
            }

        }
        else {
            var previousEndDate = vm.documentPeriods[index - 1].EndDate;
            var diff = differenceInDays(previousEndDate, vm.documentPeriods[index].StartDate);
            if (diff != 2 || (previousEndDate > vm.documentPeriods[index].StartDate)) {
                isInvalid = true;
                vm.StartDatesErrorMessages[index] = 'Period ' + (Number(index) + 1) + ': Start Date has to be the next day of previous End Date.';
                msg = 'Start Date has to be the next day of previous End Date.';
            }
        }
        parentController.addValidation("Periods", "Start Date Input " + (Number(index) + 1), !isInvalid, msg);

        return isInvalid;
    }

    function validateEndDates(index) {

        vm.EndDatesErrorMessages[index] = '';
        var msg = "";
        var isInvalid = false;
        //moment(today).add(1, 'day');
        if (index == vm.documentPeriods.length - 1) {
            var dateDoc = parentController.documentMasterDetails.EndDate;
            var datePeriod = vm.documentPeriods[index].EndDate;
            if (new Date(datePeriod).setHours(0, 0, 0, 0) != new Date(dateDoc).setHours(0, 0, 0, 0)) {
                vm.EndDatesErrorMessages[index] = 'End Date cannot be different than document End Date';
                msg = 'End Date cannot be different than document End Date';
                isInvalid = true;
            }

            if (vm.documentPeriods[index].EndDate < vm.documentPeriods[index].StartDate) {
                vm.EndDatesErrorMessages[index] = 'Period ' + (Number(index) + 1) + ': End Date cannot be less than Start Date';
                msg = 'End Date cannot be less than Start Date';
                isInvalid = true;
            }
        }
        else {
            if (vm.documentPeriods[index].EndDate < vm.documentPeriods[index].StartDate) {
                vm.EndDatesErrorMessages[index] = 'Period ' + (Number(index) + 1) + ': End Date cannot be less than Start Date';
                msg = 'End Date cannot be less than Start Date';
                isInvalid = true;
            }
        }

        parentController.addValidation("Periods", "End Date Input " + (Number(index) + 1), !isInvalid, msg);

        return isInvalid;
    }



    function navigateTo2(to) {
        $location.path(to);
    }

    vm.select = function (item) {
        if (item.Mandatory == false) {
            item.Selected = !item.Selected
        }
    }


    vm.showDate = function (index, type) {
        vm.selectedIndex = index;
        vm.selectedType = type;
        //datePicker.show(vm.options, onSuccess, onError);
    }

    function reloadTotalValues() {
        vm.totalWeigths = 0;
        vm.totalPeriodTotal = 0;

        if (vm.periods.length == 0)
            return;

        for (var i = 0; i != vm.documentPeriods.length; ++i)
            vm.totalWeigths += Number(vm.documentPeriods[i].Weight);

        for (var i = 0; i != vm.periodsCalculations.length; ++i)
            vm.totalPeriodTotal += Number(vm.periodsCalculations[i].PeriodTotal);

        if (vm.totalWeigths != 100) {
            parentController.addValidation("Periods", "Total Weight", false, "The Weight total is not equal to 100.");
        } else {
            parentController.addValidation("Periods", "Total Weight", true, "");
        }
    }



    vm.changeWeight = function ($index) {

        vm.documentPeriods[$index].Weight = (vm.documentPeriods[$index].Weight <= vm.max && vm.documentPeriods[$index].Weight >= vm.min ? vm.documentPeriods[$index].Weight : (vm.documentPeriods[$index].Weight < vm.min ? vm.min : (vm.documentPeriods[$index].Weight > vm.max ? vm.max : 0)));

        vm.periodsCalculations[$index].PeriodTotal = (vm.currentContractValue * vm.documentPeriods[$index].Weight) / 100;

        vm.documentPeriods[$index].PeriodTotal = vm.periodsCalculations[$index].PeriodTotal;

        reloadTotalValues();


    }

    vm.changedDate = function (index, type) {

        vm.periodsCalculations = [];

        for (var i = 0; i < vm.documentPeriods.length; ++i) {
            var p = {
                PeriodDuration: Number(differenceInDays(vm.documentPeriods[i].EndDate, vm.documentPeriods[i].StartDate)),
                PeriodTotal: vm.documentPeriods[i].PeriodTotal

            };
            vm.periodsCalculations[i] = p;
            vm.documentPeriods[i].PeriodTotal = p.PeriodTotal;
            vm.documentPeriods[i].PeriodDuration = p.PeriodDuration;
        }

        reloadTotalValues();
    }

    vm.selectPeriod = function (index) {

    }

    function onSuccess(date) {

        if (vm.selectedType = 'start')
            vm.documentPeriods[vm.selectedIndex].StartDate = date;

        if (vm.selectedType = 'end')
            vm.documentPeriods[vm.selectedIndex].EndDate = date;
        vm.periodsCalculations = [];
    }

    function onError(error) { // Android only
        alert('Error: ' + error);
    }

    function differenceInDays(firstdate, seconddate) {
        console.log(firstdate);
        if (firstdate != null & seconddate != null) {

            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            var diffDays = Math.round(Math.abs((firstdate.getTime() - seconddate.getTime()) / (oneDay)))

            return diffDays + 1; //+1 porque o ultimo dia é para incluir
        } else {
            return 0;
        }
    };

    vm.selectPrevStep = function () {
        parentController.selectPrevStep(vm.Code);
    }

    vm.removePeriod = function (index) {
        swal({
            title: "Are you sure?",
            text: "Do you want to remove the selected period?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: false
        },
        function (isConfirm) {
            if (isConfirm) {

                vm.periods.splice(index, 1);
                vm.documentPeriods.splice(index, 1);
                vm.periodsCalculations.splice(index, 1);

                vm.StartDatesErrorMessages = [];
                vm.EndDatesErrorMessages = [];

                parentController.removeValidation("Periods");

                for (var i = 0; i != vm.documentPeriods.length; ++i) {
                    validateEndDates(i);
                    validateStartDates(i);
                }


                reloadTotalValues();

                $scope.$apply(function () {

                });
                swal("Deleted!", "The Period has been deleted.", "success");
            } else {
                swal("Cancelled", "", "error");
            }
        });
    }

    vm.addNewPeriod = function () {

        var startdate = new Date();
        var enddate = new Date();
        if (vm.documentPeriods.length > 0)
            startdate = addDays(new Date(vm.documentPeriods[vm.documentPeriods.length - 1].EndDate), 1);
        else
            startdate = parentController.documentMasterDetails.StartDate;
        enddate.setDate(startdate.getDate() + 1);

        var documentPeriod =
            {
                'EndDate': enddate,
                'StartDate': startdate,
                'PeriodDuration': 0,
                'PeriodTotal': 0,
                'Weight': 0,
                'Mandatory': false,
                'Selected': true
            };

        var p = {
            PeriodDuration: Number(differenceInDays(enddate, startdate)),
            PeriodTotal: 0
        };

        var period = {
            Deleted: false,
            EndDate: { DefaultValue: enddate, Editable: true, Visible: true },
            IsNew: true,
            Mandatory: false,
            PeriodDuration: 0,
            PeriodTotal: 0,
            StartDate: { DefaultValue: startdate, Editable: true, Visible: true },
            Weight: { DefaultValue: 0, Editable: true, Visible: true }
        };

        vm.periods.push(period);
        vm.documentPeriods.push(documentPeriod);
        vm.periodsCalculations.push(p);

        parentController.periods.Periods = vm.periods;

        reloadTotalValues();


    }
}