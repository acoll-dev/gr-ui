'use strict';
(function(){
    angular.module('gr-autofields', ['autofields', 'gr-alert'])
        .directive('grAutofields', ['$compile', '$timeout', '$grAlert', function ($compile, $timeout, $grAlert) {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {

                    if (!$attrs.name) {
                        return false;
                    }

                    var $input = angular.element('<auto:fields/>'),
                        $alert = $grAlert.new(),
                        $errors = [],
                        defaults = $attrs.grAutofields ? angular.copy($scope.$eval($attrs.grAutofields)) : false,
                        autofields = $attrs.grAutofields ? $scope.$eval($attrs.grAutofields) : false;

                    if (!autofields) {
                        return false;
                    } else {
                        autofields.name = $attrs.grAutofields;
                    };

                    if (autofields.schema) {
                        $input.attr('fields', autofields.name + '.schema');
                    }
                    if (autofields.data) {
                        $input.attr('data', autofields.name + '.data');
                    }
                    if (autofields.options) {
                        $input.attr('options', autofields.name + '.options');
                    }

                    $element.prepend($input).removeAttr('gr-autofields').attr({
                        'novalidate': true,
                        'ng-submit': $attrs.name + '.submit()'
                    });

                    if ($element.find('[type="submit"]').length === 0) {
                        $element.append('<button type="submit" class="hidden" />');
                    }

                    $scope.$watch(function(){
                        if ($scope[$attrs.name].autofields) {
                            return $scope[$attrs.name].autofields.$error;
                        } else {
                            return {};
                        }
                    }, checkError, true);

                    function getError($error) {
                        var _errors = {};
                        angular.forEach($error, function (errors, errorId) {
                            angular.forEach(errors, function (field, id) {
                                angular.forEach(autofields.schema, function (item) {
                                    if (item.type !== 'multiple') {
                                        if (item.property === field.$name && item.msgs && item.msgs[errorId]) {
                                            _errors[item.property] = angular.copy(item.msgs[errorId]);
                                        }
                                    } else {
                                        angular.forEach(item.fields, function (subitem) {
                                            if (subitem.property === field.$name && subitem.msgs && subitem.msgs[errorId]) {
                                                _errors[subitem.property] = angular.copy(subitem.msgs[errorId]);
                                            }
                                        });
                                    }
                                });
                            });
                        });
                        return _errors;
                    };

                    function checkError($error) {
                        var _errors = sort(getError($error));
                        if (_errors !== $errors) {
                            $errors = _errors;
                        }
                        if ($scope[$attrs.name].$submitted) {
                            if (!$alert.isShown) {
                                $alert.show('danger', $errors);
                            } else {
                                $alert.update('danger', $errors);
                            }
                        }
                    };

                    function sort(errors) {
                        var _errors = [];
                        angular.forEach(autofields.schema, function (item) {
                            if (item.type !== 'multiple') {
                                if (errors[item.property]) {
                                    _errors.push(angular.copy(errors[item.property]));
                                };
                            } else {
                                angular.forEach(item.fields, function (subitem) {
                                    if (errors[subitem.property]) {
                                        _errors.push(angular.copy(errors[subitem.property]));
                                    }
                                });
                            }
                        });
                        return angular.copy(_errors);
                    };

                    function submit() {
                        var field;
                        angular.forEach(getError($scope[$attrs.name].autofields.$error), function (value, id) {
                            if (!field) {
                                field = id;
                            }
                        });
                        if (!$scope[$attrs.name].$submitted) {
                            $scope[$attrs.name].$setSubmitted(true);
                        }
                        if (!$scope[autofields.name].options.validation.enabled) {
                            $scope[autofields.name].options.validation.enabled = true
                        };
                        if ($scope[$attrs.name].$invalid) {
                            checkError($scope[$attrs.name].autofields.$error);
                        } else {
                            $scope[autofields.name].submit(autofields.data);
                        }
                    };

                    function reset() {
                        $timeout(function(){
                            $scope[autofields.name] = angular.copy(defaults);
                            $scope[$attrs.name].$setPristine();
                            $alert.hide();
                        });
                    };

                    $timeout(function(){
                        $scope[$attrs.name].submit = submit;
                        $scope[$attrs.name].reset = reset;
                    });

                    $compile($element)($scope);
                }
            }
        }]);
})();
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.12.0 - 2014-11-16
 * License: MIT
 */
(function(){
    angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.datepicker", "ui.bootstrap.dateparser", "ui.bootstrap.position"]);
    angular.module("ui.bootstrap.tpls", ["template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html"]);
    angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])
        .constant('datepickerConfig', {
            formatDay: 'dd',
            formatMonth: 'MMMM',
            formatYear: 'yyyy',
            formatDayHeader: 'EEE',
            formatDayTitle: 'MMMM yyyy',
            formatMonthTitle: 'yyyy',
            datepickerMode: 'day',
            minMode: 'day',
            maxMode: 'year',
            showWeeks: true,
            startingDay: 0,
            yearRange: 20,
            minDate: null,
            maxDate: null
        })
        .controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig', function ($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
            var self = this,
                ngModelCtrl = {
                    $setViewValue: angular.noop
                }; // nullModelCtrl;

            // Modes chain
            this.modes = ['day', 'month', 'year'];

            // Configuration attributes
            angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
                       'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange'], function (key, index) {
                self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
            });

            // Watchable date attributes
            angular.forEach(['minDate', 'maxDate'], function (key) {
                if ($attrs[key]) {
                    $scope.$parent.$watch($parse($attrs[key]), function (value) {
                        self[key] = value ? new Date(value) : null;
                        self.refreshView();
                    });
                } else {
                    self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
                }
            });

            $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
            $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
            this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();

            $scope.isActive = function (dateObject) {
                if (self.compare(dateObject.date, self.activeDate) === 0) {
                    $scope.activeDateId = dateObject.uid;
                    return true;
                }
                return false;
            };

            this.init = function (ngModelCtrl_) {
                ngModelCtrl = ngModelCtrl_;

                ngModelCtrl.$render = function(){
                    self.render();
                };
            };

            this.render = function(){
                if (ngModelCtrl.$modelValue) {
                    var date = new Date(ngModelCtrl.$modelValue),
                        isValid = !isNaN(date);

                    if (isValid) {
                        this.activeDate = date;
                    } else {
                        $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                    }
                    ngModelCtrl.$setValidity('date', isValid);
                }
                this.refreshView();
            };

            this.refreshView = function(){
                if (this.element) {
                    this._refreshView();

                    var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
                    ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
                }
            };

            this.createDateObject = function (date, format) {
                var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
                return {
                    date: date,
                    label: dateFilter(date, format),
                    selected: model && this.compare(date, model) === 0,
                    disabled: this.isDisabled(date),
                    current: this.compare(date, new Date()) === 0
                };
            };

            this.isDisabled = function (date) {
                return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({
                    date: date,
                    mode: $scope.datepickerMode
                })));
            };

            // Split array into smaller arrays
            this.split = function (arr, size) {
                var arrays = [];
                while (arr.length > 0) {
                    arrays.push(arr.splice(0, size));
                }
                return arrays;
            };

            $scope.select = function (date) {
                if ($scope.datepickerMode === self.minMode) {
                    var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                    dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    ngModelCtrl.$setViewValue(dt);
                    ngModelCtrl.$render();
                } else {
                    self.activeDate = date;
                    $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1];
                }
            };

            $scope.move = function (direction) {
                var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
                    month = self.activeDate.getMonth() + direction * (self.step.months || 0);
                self.activeDate.setFullYear(year, month, 1);
                self.refreshView();
            };

            $scope.toggleMode = function (direction) {
                direction = direction || 1;

                if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
                    return;
                }

                $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction];
            };

            // Key event mapper
            $scope.keys = {
                13: 'enter',
                32: 'space',
                33: 'pageup',
                34: 'pagedown',
                35: 'end',
                36: 'home',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            };

            var focusElement = function(){
                $timeout(function(){
                    self.element[0].focus();
                }, 0, false);
            };

            // Listen for focus requests from popup directive
            $scope.$on('datepicker.focus', focusElement);

            $scope.keydown = function (evt) {
                var key = $scope.keys[evt.which];

                if (!key || evt.shiftKey || evt.altKey) {
                    return;
                }

                evt.preventDefault();
                evt.stopPropagation();

                if (key === 'enter' || key === 'space') {
                    if (self.isDisabled(self.activeDate)) {
                        return; // do nothing
                    }
                    $scope.select(self.activeDate);
                    focusElement();
                } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
                    $scope.toggleMode(key === 'up' ? 1 : -1);
                    focusElement();
                } else {
                    self.handleKeyDown(key, evt);
                    self.refreshView();
                }
            };
    }])
        .directive('datepicker', function(){
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/datepicker/datepicker.html',
                scope: {
                    datepickerMode: '=?',
                    dateDisabled: '&'
                },
                require: ['datepicker', '?^ngModel'],
                controller: 'DatepickerController',
                link: function (scope, element, attrs, ctrls) {
                    var datepickerCtrl = ctrls[0],
                        ngModelCtrl = ctrls[1];

                    if (ngModelCtrl) {
                        datepickerCtrl.init(ngModelCtrl);
                    }
                }
            };
        })
        .directive('daypicker', ['dateFilter', function (dateFilter) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/datepicker/day.html',
                require: '^datepicker',
                link: function (scope, element, attrs, ctrl) {
                    scope.showWeeks = ctrl.showWeeks;

                    ctrl.step = {
                        months: 1
                    };
                    ctrl.element = element;

                    var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                    function getDaysInMonth(year, month) {
                        return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
                    }

                    function getDates(startDate, n) {
                        var dates = new Array(n),
                            current = new Date(startDate),
                            i = 0;
                        current.setHours(12); // Prevent repeated dates because of timezone bug
                        while (i < n) {
                            dates[i++] = new Date(current);
                            current.setDate(current.getDate() + 1);
                        }
                        return dates;
                    }

                    ctrl._refreshView = function(){
                        var year = ctrl.activeDate.getFullYear(),
                            month = ctrl.activeDate.getMonth(),
                            firstDayOfMonth = new Date(year, month, 1),
                            difference = ctrl.startingDay - firstDayOfMonth.getDay(),
                            numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
                            firstDate = new Date(firstDayOfMonth);

                        if (numDisplayedFromPreviousMonth > 0) {
                            firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                        }

                        // 42 is the number of days on a six-month calendar
                        var days = getDates(firstDate, 42);
                        for (var i = 0; i < 42; i++) {
                            days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
                                secondary: days[i].getMonth() !== month,
                                uid: scope.uniqueId + '-' + i
                            });
                        }

                        scope.labels = new Array(7);
                        for (var j = 0; j < 7; j++) {
                            scope.labels[j] = {
                                abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
                                full: dateFilter(days[j].date, 'EEEE')
                            };
                        }

                        scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
                        scope.rows = ctrl.split(days, 7);

                        if (scope.showWeeks) {
                            scope.weekNumbers = [];
                            var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date),
                                numWeeks = scope.rows.length;
                            while (scope.weekNumbers.push(weekNumber++) < numWeeks) {}
                        }
                    };

                    ctrl.compare = function (date1, date2) {
                        return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
                    };

                    function getISO8601WeekNumber(date) {
                        var checkDate = new Date(date);
                        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
                        var time = checkDate.getTime();
                        checkDate.setMonth(0); // Compare with Jan 1
                        checkDate.setDate(1);
                        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
                    }

                    ctrl.handleKeyDown = function (key, evt) {
                        var date = ctrl.activeDate.getDate();

                        if (key === 'left') {
                            date = date - 1; // up
                        } else if (key === 'up') {
                            date = date - 7; // down
                        } else if (key === 'right') {
                            date = date + 1; // down
                        } else if (key === 'down') {
                            date = date + 7;
                        } else if (key === 'pageup' || key === 'pagedown') {
                            var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
                            ctrl.activeDate.setMonth(month, 1);
                            date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
                        } else if (key === 'home') {
                            date = 1;
                        } else if (key === 'end') {
                            date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
                        }
                        ctrl.activeDate.setDate(date);
                    };

                    ctrl.refreshView();
                }
            };
    }])
        .directive('monthpicker', ['dateFilter', function (dateFilter) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/datepicker/month.html',
                require: '^datepicker',
                link: function (scope, element, attrs, ctrl) {
                    ctrl.step = {
                        years: 1
                    };
                    ctrl.element = element;

                    ctrl._refreshView = function(){
                        var months = new Array(12),
                            year = ctrl.activeDate.getFullYear();

                        for (var i = 0; i < 12; i++) {
                            months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
                                uid: scope.uniqueId + '-' + i
                            });
                        }

                        scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
                        scope.rows = ctrl.split(months, 3);
                    };

                    ctrl.compare = function (date1, date2) {
                        return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
                    };

                    ctrl.handleKeyDown = function (key, evt) {
                        var date = ctrl.activeDate.getMonth();

                        if (key === 'left') {
                            date = date - 1; // up
                        } else if (key === 'up') {
                            date = date - 3; // down
                        } else if (key === 'right') {
                            date = date + 1; // down
                        } else if (key === 'down') {
                            date = date + 3;
                        } else if (key === 'pageup' || key === 'pagedown') {
                            var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
                            ctrl.activeDate.setFullYear(year);
                        } else if (key === 'home') {
                            date = 0;
                        } else if (key === 'end') {
                            date = 11;
                        }
                        ctrl.activeDate.setMonth(date);
                    };

                    ctrl.refreshView();
                }
            };
    }])
        .directive('yearpicker', ['dateFilter', function (dateFilter) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/datepicker/year.html',
                require: '^datepicker',
                link: function (scope, element, attrs, ctrl) {
                    var range = ctrl.yearRange;

                    ctrl.step = {
                        years: range
                    };
                    ctrl.element = element;

                    function getStartingYear(year) {
                        return parseInt((year - 1) / range, 10) * range + 1;
                    }

                    ctrl._refreshView = function(){
                        var years = new Array(range);

                        for (var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++) {
                            years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
                                uid: scope.uniqueId + '-' + i
                            });
                        }

                        scope.title = [years[0].label, years[range - 1].label].join(' - ');
                        scope.rows = ctrl.split(years, 5);
                    };

                    ctrl.compare = function (date1, date2) {
                        return date1.getFullYear() - date2.getFullYear();
                    };

                    ctrl.handleKeyDown = function (key, evt) {
                        var date = ctrl.activeDate.getFullYear();

                        if (key === 'left') {
                            date = date - 1; // up
                        } else if (key === 'up') {
                            date = date - 5; // down
                        } else if (key === 'right') {
                            date = date + 1; // down
                        } else if (key === 'down') {
                            date = date + 5;
                        } else if (key === 'pageup' || key === 'pagedown') {
                            date += (key === 'pageup' ? -1 : 1) * ctrl.step.years;
                        } else if (key === 'home') {
                            date = getStartingYear(ctrl.activeDate.getFullYear());
                        } else if (key === 'end') {
                            date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1;
                        }
                        ctrl.activeDate.setFullYear(date);
                    };

                    ctrl.refreshView();
                }
            };
    }])
        .constant('datepickerPopupConfig', {
            datepickerPopup: 'yyyy-MM-dd',
            currentText: 'Today',
            clearText: 'Clear',
            closeText: 'Done',
            closeOnDateSelection: true,
            appendToBody: false,
            showButtonBar: true
        })
        .directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
    function ($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
                return {
                    restrict: 'EA',
                    require: 'ngModel',
                    scope: {
                        isOpen: '=?',
                        currentText: '@',
                        clearText: '@',
                        closeText: '@',
                        dateDisabled: '&'
                    },
                    link: function (scope, element, attrs, ngModel) {
                        var dateFormat,
                            closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
                            appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

                        scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

                        scope.getText = function (key) {
                            return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
                        };

                        attrs.$observe('datepickerPopup', function (value) {
                            dateFormat = value || datepickerPopupConfig.datepickerPopup;
                            ngModel.$render();
                        });

                        // popup element used to display calendar
                        var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
                        popupEl.attr({
                            'ng-model': 'date',
                            'ng-change': 'dateSelection()'
                        });

                        function cameltoDash(string) {
                            return string.replace(/([A-Z])/g, function ($1) {
                                return '-' + $1.toLowerCase();
                            });
                        }

                        // datepicker element
                        var datepickerEl = angular.element(popupEl.children()[0]);
                        if (attrs.datepickerOptions) {
                            angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function (value, option) {
                                datepickerEl.attr(cameltoDash(option), value);
                            });
                        }

                        scope.watchData = {};
                        angular.forEach(['minDate', 'maxDate', 'datepickerMode'], function (key) {
                            if (attrs[key]) {
                                var getAttribute = $parse(attrs[key]);
                                scope.$parent.$watch(getAttribute, function (value) {
                                    scope.watchData[key] = value;
                                });
                                datepickerEl.attr(cameltoDash(key), 'watchData.' + key);

                                // Propagate changes from datepicker to outside
                                if (key === 'datepickerMode') {
                                    var setAttribute = getAttribute.assign;
                                    scope.$watch('watchData.' + key, function (value, oldvalue) {
                                        if (value !== oldvalue) {
                                            setAttribute(scope.$parent, value);
                                        }
                                    });
                                }
                            }
                        });
                        if (attrs.dateDisabled) {
                            datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
                        }

                        function parseDate(viewValue) {
                            if (!viewValue) {
                                ngModel.$setValidity('date', true);
                                return null;
                            } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                                ngModel.$setValidity('date', true);
                                return viewValue;
                            } else if (angular.isString(viewValue)) {
                                var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
                                if (isNaN(date)) {
                                    ngModel.$setValidity('date', false);
                                    return undefined;
                                } else {
                                    ngModel.$setValidity('date', true);
                                    return date;
                                }
                            } else {
                                ngModel.$setValidity('date', false);
                                return undefined;
                            }
                        }
                        ngModel.$parsers.unshift(parseDate);

                        // Inner change
                        scope.dateSelection = function (dt) {
                            if (angular.isDefined(dt)) {
                                scope.date = dt;
                            }
                            ngModel.$setViewValue(scope.date);
                            ngModel.$render();

                            if (closeOnDateSelection) {
                                scope.isOpen = false;
                                element[0].focus();
                            }
                        };

                        element.bind('input change keyup', function(){
                            scope.$apply(function(){
                                scope.date = ngModel.$modelValue;
                            });
                        });

                        // Outter change
                        ngModel.$render = function(){
                            var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
                            element.val(date);
                            scope.date = parseDate(ngModel.$modelValue);
                        };

                        var documentClickBind = function (event) {
                            if (scope.isOpen && event.target !== element[0]) {
                                scope.$apply(function(){
                                    scope.isOpen = false;
                                });
                            }
                        };

                        var keydown = function (evt, noApply) {
                            scope.keydown(evt);
                        };
                        element.bind('keydown', keydown);

                        scope.keydown = function (evt) {
                            if (evt.which === 27) {
                                evt.preventDefault();
                                evt.stopPropagation();
                                scope.close();
                            } else if (evt.which === 40 && !scope.isOpen) {
                                scope.isOpen = true;
                            }
                        };

                        scope.$watch('isOpen', function (value) {
                            if (value) {
                                scope.$broadcast('datepicker.focus');
                                scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                                scope.position.top = scope.position.top + element.prop('offsetHeight');

                                $document.bind('click', documentClickBind);
                            } else {
                                $document.unbind('click', documentClickBind);
                            }
                        });

                        scope.select = function (date) {
                            if (date === 'today') {
                                var today = new Date();
                                if (angular.isDate(ngModel.$modelValue)) {
                                    date = new Date(ngModel.$modelValue);
                                    date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
                                } else {
                                    date = new Date(today.setHours(0, 0, 0, 0));
                                }
                            }
                            scope.dateSelection(date);
                        };

                        scope.close = function(){
                            scope.isOpen = false;
                            element[0].focus();
                        };

                        var $popup = $compile(popupEl)(scope);
                        // Prevent jQuery cache memory leak (template is now redundant after linking)
                        popupEl.remove();

                        if (appendToBody) {
                            $document.find('body').append($popup);
                        } else {
                            element.after($popup);
                        }

                        scope.$on('$destroy', function(){
                            $popup.remove();
                            element.unbind('keydown', keydown);
                            $document.unbind('click', documentClickBind);
                        });
                    }
                };
    }])
        .directive('datepickerPopupWrap', function(){
            return {
                restrict: 'EA',
                replace: true,
                transclude: true,
                templateUrl: 'template/datepicker/popup.html',
                link: function (scope, element, attrs) {
                    element.bind('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    });
                }
            };
        });
    angular.module('ui.bootstrap.dateparser', [])
        .service('dateParser', ['$locale', 'orderByFilter', function ($locale, orderByFilter) {

            this.parsers = {};

            var formatCodeToRegex = {
                'yyyy': {
                    regex: '\\d{4}',
                    apply: function (value) {
                        this.year = +value;
                    }
                },
                'yy': {
                    regex: '\\d{2}',
                    apply: function (value) {
                        this.year = +value + 2000;
                    }
                },
                'y': {
                    regex: '\\d{1,4}',
                    apply: function (value) {
                        this.year = +value;
                    }
                },
                'MMMM': {
                    regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
                    apply: function (value) {
                        this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value);
                    }
                },
                'MMM': {
                    regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
                    apply: function (value) {
                        this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value);
                    }
                },
                'MM': {
                    regex: '0[1-9]|1[0-2]',
                    apply: function (value) {
                        this.month = value - 1;
                    }
                },
                'M': {
                    regex: '[1-9]|1[0-2]',
                    apply: function (value) {
                        this.month = value - 1;
                    }
                },
                'dd': {
                    regex: '[0-2][0-9]{1}|3[0-1]{1}',
                    apply: function (value) {
                        this.date = +value;
                    }
                },
                'd': {
                    regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
                    apply: function (value) {
                        this.date = +value;
                    }
                },
                'EEEE': {
                    regex: $locale.DATETIME_FORMATS.DAY.join('|')
                },
                'EEE': {
                    regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
                }
            };

            function createParser(format) {
                var map = [],
                    regex = format.split('');

                angular.forEach(formatCodeToRegex, function (data, code) {
                    var index = format.indexOf(code);

                    if (index > -1) {
                        format = format.split('');

                        regex[index] = '(' + data.regex + ')';
                        format[index] = '$'; // Custom symbol to define consumed part of format
                        for (var i = index + 1, n = index + code.length; i < n; i++) {
                            regex[i] = '';
                            format[i] = '$';
                        }
                        format = format.join('');

                        map.push({
                            index: index,
                            apply: data.apply
                        });
                    }
                });

                return {
                    regex: new RegExp('^' + regex.join('') + '$'),
                    map: orderByFilter(map, 'index')
                };
            }

            this.parse = function (input, format) {
                if (!angular.isString(input) || !format) {
                    return input;
                }

                format = $locale.DATETIME_FORMATS[format] || format;

                if (!this.parsers[format]) {
                    this.parsers[format] = createParser(format);
                }

                var parser = this.parsers[format],
                    regex = parser.regex,
                    map = parser.map,
                    results = input.match(regex);

                if (results && results.length) {
                    var fields = {
                            year: 1900,
                            month: 0,
                            date: 1,
                            hours: 0
                        },
                        dt;

                    for (var i = 1, n = results.length; i < n; i++) {
                        var mapper = map[i - 1];
                        if (mapper.apply) {
                            mapper.apply.call(fields, results[i]);
                        }
                    }

                    if (isValid(fields.year, fields.month, fields.date)) {
                        dt = new Date(fields.year, fields.month, fields.date, fields.hours);
                    }

                    return dt;
                }
            };

            // Check if date is valid for specific month (and year for February).
            // Month: 0 = Jan, 1 = Feb, etc
            function isValid(year, month, date) {
                if (month === 1 && date > 28) {
                    return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
                }

                if (month === 3 || month === 5 || month === 8 || month === 10) {
                    return date < 31;
                }

                return true;
            }
    }]);
    angular.module('ui.bootstrap.position', [])
        /**
         * A set of utility methods that can be use to retrieve position of DOM elements.
         * It is meant to be used where we need to absolute-position DOM elements in
         * relation to other, existing elements (this is the case for tooltips, popovers,
         * typeahead suggestions etc.).
         */
        .factory('$position', ['$document', '$window', function ($document, $window) {

            function getStyle(el, cssprop) {
                if (el.currentStyle) { //IE
                    return el.currentStyle[cssprop];
                } else if ($window.getComputedStyle) {
                    return $window.getComputedStyle(el)[cssprop];
                }
                // finally try and get inline style
                return el.style[cssprop];
            }

            /**
             * Checks if a given element is statically positioned
             * @param element - raw DOM element
             */
            function isStaticPositioned(element) {
                return (getStyle(element, 'position') || 'static') === 'static';
            }

            /**
             * returns the closest, non-statically positioned parentOffset of a given element
             * @param element
             */
            var parentOffsetEl = function (element) {
                var docDomEl = $document[0];
                var offsetParent = element.offsetParent || docDomEl;
                while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docDomEl;
            };

            return {
                /**
                 * Provides read-only equivalent of jQuery's position function:
                 * http://api.jquery.com/position/
                 */
                position: function (element) {
                    var elBCR = this.offset(element);
                    var offsetParentBCR = {
                        top: 0,
                        left: 0
                    };
                    var offsetParentEl = parentOffsetEl(element[0]);
                    if (offsetParentEl != $document[0]) {
                        offsetParentBCR = this.offset(angular.element(offsetParentEl));
                        offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                        offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
                    }

                    var boundingClientRect = element[0].getBoundingClientRect();
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: elBCR.top - offsetParentBCR.top,
                        left: elBCR.left - offsetParentBCR.left
                    };
                },

                /**
                 * Provides read-only equivalent of jQuery's offset function:
                 * http://api.jquery.com/offset/
                 */
                offset: function (element) {
                    var boundingClientRect = element[0].getBoundingClientRect();
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                        left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
                    };
                },

                /**
                 * Provides coordinates for the targetEl in relation to hostEl
                 */
                positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

                    var positionStrParts = positionStr.split('-');
                    var pos0 = positionStrParts[0],
                        pos1 = positionStrParts[1] || 'center';

                    var hostElPos,
                        targetElWidth,
                        targetElHeight,
                        targetElPos;

                    hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

                    targetElWidth = targetEl.prop('offsetWidth');
                    targetElHeight = targetEl.prop('offsetHeight');

                    var shiftWidth = {
                        center: function(){
                            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
                        },
                        left: function(){
                            return hostElPos.left;
                        },
                        right: function(){
                            return hostElPos.left + hostElPos.width;
                        }
                    };

                    var shiftHeight = {
                        center: function(){
                            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
                        },
                        top: function(){
                            return hostElPos.top;
                        },
                        bottom: function(){
                            return hostElPos.top + hostElPos.height;
                        }
                    };

                    switch (pos0) {
                    case 'right':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: shiftWidth[pos0]()
                        };
                        break;
                    case 'left':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: hostElPos.left - targetElWidth
                        };
                        break;
                    case 'bottom':
                        targetElPos = {
                            top: shiftHeight[pos0](),
                            left: shiftWidth[pos1]()
                        };
                        break;
                    default:
                        targetElPos = {
                            top: hostElPos.top - targetElHeight,
                            left: shiftWidth[pos1]()
                        };
                        break;
                    }

                    return targetElPos;
                }
            };
      }]);
    angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/datepicker.html",
            "<div ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
            "  <daypicker ng-switch-when=\"day\" tabindex=\"0\"></daypicker>\n" +
            "  <monthpicker ng-switch-when=\"month\" tabindex=\"0\"></monthpicker>\n" +
            "  <yearpicker ng-switch-when=\"year\" tabindex=\"0\"></yearpicker>\n" +
            "</div>");
    }]);
    angular.module("template/datepicker/day.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/day.html",
            "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
            "      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "    <tr>\n" +
            "      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n" +
            "      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
            "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
            "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
    }]);
    angular.module("template/datepicker/month.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/month.html",
            "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
            "      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
            "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
    }]);
    angular.module("template/datepicker/popup.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/popup.html",
            "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\">\n" +
            "	<li ng-transclude></li>\n" +
            "	<li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
            "		<span class=\"btn-group pull-left\">\n" +
            "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"select('today')\">{{ getText('current') }}</button>\n" +
            "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"select(null)\">{{ getText('clear') }}</button>\n" +
            "		</span>\n" +
            "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"close()\">{{ getText('close') }}</button>\n" +
            "	</li>\n" +
            "</ul>\n" +
            "");
    }]);
    angular.module("template/datepicker/year.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/datepicker/year.html",
            "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
            "      <th colspan=\"3\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
            "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
    }]);
})();
/**
 * @license Autofields v2.1.6
 * (c) 2014 Justin Maier http://justmaier.github.io/angular-autoFields-bootstrap
 * License: MIT
 */
(function(){
    angular.module('autofields.core', [])
        .provider('$autofields', function(){
            var autofields = {};

            // Helper Methods
            var helper = {
                CamelToTitle: function (str) {
                    return str
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, function (str) { return str.toUpperCase(); });
                },
                CamelToDash: function (str) {
                    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                },
                LabelText: function(field) {
                    return field.label || helper.CamelToTitle(field.property);
                }
            };

            // Directive-wide Handler Default Settings
            autofields.settings = {
                classes: {
                    container: [],
                    input: [],
                    label: []
                },
                attributes: {
                    container: {
                        'class': '$type'
                    },
                    input: {
                        id: '$property_clean',
                        name: '$property_clean',
                        type: '$type',
                        ngModel: '$data.$property',
                        placeholder: '$placeholder'
                    },
                    label: {}
                },
                container: '<div class="autofields" ng-form name="$form"></div>',
                scope: {}
            };

            // Field Building Helpers
            // Add Attributes to Element
            var setAttributes = autofields.setAttributes = function(directive, field, el, attrs){
                angular.forEach(attrs, function(value, attr){
                    if(value && typeof value == 'string'){
                        value = value
                            .replace(/\$form/g, directive.formStr)
                            .replace(/\$schema/g, directive.schemaStr)
                            .replace(/\$type/g, field.type || 'text')
                            .replace(/\$property_clean/g, field.property.replace(/\[|\]|\./g, ''))
                            .replace(/\$property/g, field.property)
                            .replace(/\$data/g, directive.dataStr)
                            .replace(/\$placeholder/g, field.placeholder != null ? field.placeholder : helper.LabelText(field));
                    }
                    el.attr(helper.CamelToDash(attr), value);
                });
            };
            // Standard Container for field
            var getFieldContainer = function(directive, field, attrs){
                var fieldContainer = angular.element('<div/>');
                attrs = angular.extend({}, autofields.settings.attributes.container, attrs);
                setAttributes(directive, field, fieldContainer, attrs);
                fieldContainer.addClass(autofields.settings.classes.container.join(' '));

                return fieldContainer;
            };
            // Standard Label for field
            var getLabel = function(directive, field, attrs){
                var label = angular.element('<label/>');
                attrs = angular.extend({}, autofields.settings.attributes.label, attrs);
                setAttributes(directive, field, label, attrs);
                label.addClass(autofields.settings.classes.label.join(' '));
                label.html(helper.LabelText(field));

                return label;
            }
            // Standard Input for field
            var getInput = function(directive, field, html, attrs){
                var input = angular.element(html);
                attrs = angular.extend({}, autofields.settings.attributes.input, attrs, field.attr);
                setAttributes(directive, field, input, attrs);
                input.addClass(autofields.settings.classes.input.join(' '));

                return input;
            }
            // Standard Field
            autofields.field = function(directive, field, html, attrs){
                var fieldElements = {
                    fieldContainer: getFieldContainer(directive, field),
                    label: field.label != '' ? getLabel(directive, field) : null,
                    input: getInput(directive, field, html, attrs)
                };
                fieldElements.fieldContainer.append(fieldElements.label).append(fieldElements.input);

                // Run Mutators
                var mutatorsRun = [];
                angular.forEach(mutators, function(mutator, key){
                    fieldElements = mutator(directive, field, fieldElements, mutatorsRun);
                    mutatorsRun.push(key);
                });

                return fieldElements;
            }

            // Update scope with items attached in settings
            autofields.updateScope = function(scope){
                angular.forEach(autofields.settings.scope, function(value, property){
                    if(typeof value == 'function'){
                        scope[property] = function(){
                            var args = Array.prototype.slice.call(arguments, 0);
                            args.unshift(scope);
                            value.apply(this, args);
                        }
                    }else{
                        scope[property] = value;
                    }
                })
            }

            // Handler Container
            var handlers = {};

            // Hook for handlers
            autofields.registerHandler = function(types, fn){
                types = Array.isArray(types) ? types : [types];
                angular.forEach(types, function(type){
                    handlers[type] = fn;
                });
            }

            // Mutator Container
            var mutators = {};

            // Hook for mutators
            autofields.registerMutator = function(key, fn, options){
                if(!mutators[key] || options.override){
                    mutators[key] = function(directive, field, fieldElements, mutatorsRun){
                        if(options && typeof options.require == 'string' && mutatorsRun.indexOf(options.require) == -1){
                            fieldElements = mutators[options.require];
                        }
                        if(mutatorsRun.indexOf(key) == -1) return fn(directive, field, fieldElements);
                    }
                }
            }

            // Field Builder
            autofields.createField = function(directive, field, index){
                var handler = field.type == null ? handlers.text : handlers[field.type];
                if(handler == null){
                    console.warn(field.type+' not supported - field ignored');
                    return;
                }
                return handler(directive, field, index);
            };

            autofields.$get = function(){
                return {
                    settings: autofields.settings,
                    createField: autofields.createField,
                    updateScope: autofields.updateScope
                };
            };

            return autofields;
        })
        .directive('autoFields', ['$autofields','$compile', function($autofields, $compile){
            return {
                restrict: 'E',
                priority: 1,
                replace: true,
                compile: function(){
                    return function ($scope, $element, $attr) {
                        // Scope Hooks
                        var directive = {
                            schemaStr: $attr.fields || $attr.autoFields,
                            optionsStr: $attr.options,
                            dataStr: $attr.data,
                            formStr: $attr.form || 'autofields',
                            classes: $attr['class'],
                            container: null,
                            formScope: null
                        };

                        //Helper Functions
                        var helper = {
                            extendDeep: function(dst) {
                                angular.forEach(arguments, function(obj) {
                                    if (obj !== dst) {
                                        angular.forEach(obj, function(value, key) {
                                            if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                                                helper.extendDeep(dst[key], value);
                                            } else {
                                                dst[key] = value;
                                            }
                                        });
                                    }
                                });
                                return dst;
                            }
                        };

                        // Import Directive-wide Handler Default Settings Import
                        directive.options = angular.copy($autofields.settings);

                        // Build fields from schema using handlers
                        var build = function(schema){
                            schema = schema || $scope.$eval(directive.schemaStr);

                            // Create HTML
                            directive.container.html('');
                            angular.forEach(schema, function(field, index){
                                var fieldEl = $autofields.createField(directive, field, index);
                                directive.container.append(fieldEl);
                            });

                            // Create Scope
                            if(directive.formScope != null) directive.formScope.$destroy();
                            directive.formScope = $scope.$new();
                            directive.formScope.data = $scope[directive.dataStr];
                            directive.formScope.fields = schema;
                            $autofields.updateScope(directive.formScope);

                            // Compile Element with Scope
                            $compile(directive.container)(directive.formScope);
                        };

                        // Init and Watch
                        $scope.$watch(directive.optionsStr, function (newOptions, oldOptions) {
                            helper.extendDeep(directive.options, newOptions);
                            if(newOptions !== oldOptions) build();
                        }, true);
                        $scope.$watch(directive.schemaStr, function (schema) {
                            build(schema);
                        }, true);
                        $scope.$watch(directive.formStr, function (form) {
                            directive.container.attr('name',directive.formStr);
                        });
                        $scope.$watch(function(){return $attr['class'];}, function (form) {
                            directive.classes = $attr['class'];
                            directive.container.attr('class', directive.classes);
                        });

                        directive.container = angular.element(directive.options.container);
                        directive.container.attr('name',directive.formStr);
                        directive.container.attr('class',directive.classes);
                        $element.replaceWith(directive.container);
                    }
                }
            }
        }]);
})();
(function(){
    angular.module('autofields.standard',['autofields.core'])
        .config(['$autofieldsProvider', function($autofieldsProvider){
            // Text Field Handler
            $autofieldsProvider.settings.fixUrl = true;
            $autofieldsProvider.registerHandler(['text','email','url','date','number','password'], function(directive, field, index){
                var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');

                var fixUrl = (field.fixUrl ? field.fixUrl : directive.options.fixUrl);
                if(field.type == 'url' && fixUrl) fieldElements.input.attr('fix-url','');

                return fieldElements.fieldContainer;
            });

            // Select Field Handler
            $autofieldsProvider.settings.defaultOption = 'Select One';
            $autofieldsProvider.registerHandler('select', function(directive, field, index){
                var defaultOption = (field.defaultOption ? field.defaultOption : directive.options.defaultOption);

                var inputHtml = '<select><option value="">'+defaultOption+'</option></select>';
                var inputAttrs = {
                    ngOptions: field.list
                };

                var fieldElements = $autofieldsProvider.field(directive, field, inputHtml, inputAttrs);

                return fieldElements.fieldContainer;
            });

            //Textarea Field Handler
            $autofieldsProvider.settings.textareaRows = 3;
            $autofieldsProvider.registerHandler('textarea', function(directive, field, index){
                var rows = field.rows ? field.rows : directive.options.textareaRows;
                var fieldElements = $autofieldsProvider.field(directive, field, '<textarea/>', {rows: rows});

                return fieldElements.fieldContainer;
            });

            //Checkbox Field Handler
            $autofieldsProvider.registerHandler('checkbox', function(directive, field, index){
                var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');

                if(fieldElements.label) fieldElements.label.prepend(fieldElements.input);

                return fieldElements.fieldContainer;
            });

            // Register Hide/Show Support
            $autofieldsProvider.settings.displayAttributes = ($autofieldsProvider.settings.displayAttributes || []).concat(['ng-if', 'ng-show', 'ng-hide']);
            $autofieldsProvider.registerMutator('displayAttributes',function(directive, field, fieldElements){
                if(!field.attr) return fieldElements;

                // Check for presence of each display attribute
                angular.forEach($autofieldsProvider.settings.displayAttributes, function(attr){
                    var value = fieldElements.input.attr(attr);

                    // Stop if field doesn't have attribute
                    if(!value) return;

                    // Move attribute to parent
                    fieldElements.fieldContainer.attr(attr, value);
                    fieldElements.input.removeAttr(attr);
                });

                return fieldElements;
            });
        }])
        .directive('fixUrl', [function(){
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attr, ngModel) {
                    var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.\-\?\=\&]*)$/i;

                    //Render formatters on blur...
                    var render = function(){
                        var viewValue = ngModel.$modelValue;
                        if (viewValue == null) return;
                        angular.forEach(ngModel.$formatters, function (formatter) {
                            viewValue = formatter(viewValue);
                        })
                        ngModel.$viewValue = viewValue;
                        ngModel.$render();
                    };
                    element.bind('blur', render);

                    var formatUrl = function (value) {
                        var test = urlRegex.test(value);
                        if (test) {
                            var matches = value.match(urlRegex);
                            var reformatted = (matches[1] != null && matches[1] != '') ? matches[1] : 'http://';
                            reformatted += matches[2] + '.' + matches[3];
                            if (typeof matches[4] != "undefined") reformatted += matches[4]
                            value = reformatted;
                        }
                        return value;
                    }
                    ngModel.$formatters.push(formatUrl);
                    ngModel.$parsers.unshift(formatUrl);
                }
            };
        }]);
})();
(function(){
    angular.module('autofields.validation', ['autofields.core'])
        .config(['$autofieldsProvider', function($autofieldsProvider){
            var helper = {
                CamelToTitle: function (str) {
                    return str
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, function (str) { return str.toUpperCase(); });
                }
            };

            // Add Validation Settings
            $autofieldsProvider.settings.validation = {
                enabled: true,
                showMessages: true,
                defaultMsgs: {
                    required: 'This field is required',
                    minlength: 'This is under minimum length',
                    maxlength: 'This exceeds maximum length',
                    min: 'This is under the minumum value',
                    max: 'This exceeds the maximum value',
                    email: 'This is not a valid email address',
                    valid: ''
                },
                invalid: '$form.$property_clean.$invalid && $form.$property_clean.$dirty',
                valid: '$form.$property_clean.$valid'
            };

            // Add Validation Attributes
            $autofieldsProvider.settings.attributes.container.ngClass = "{'invalid':"+$autofieldsProvider.settings.validation.invalid+", 'valid':"+$autofieldsProvider.settings.validation.valid+"}";

            // Add Validation Mutator
            $autofieldsProvider.registerMutator('validation', function(directive, field, fieldElements){
                //Check to see if validation should be added
                fieldElements.validation = directive.options.validation.enabled && field.validate !== false;
                if(!fieldElements.validation){
                    //If not enabled, remove validation hooks
                    fieldElements.fieldContainer.removeAttr('ng-class');
                    return fieldElements;
                }

                // Get Error Messages
                fieldElements.msgs = [];
                if(!directive.options.validation.showMessages) return fieldElements;
                angular.forEach(angular.extend({}, directive.options.validation.defaultMsgs, field.msgs), function(message, error){
                    if(
                        (field.msgs && field.msgs[error] != null) ||
                        (field.type == error) ||
                        (field.attr &&
                            (field.attr[error] != null ||
                            field.attr['ng'+helper.CamelToTitle(error)] != null)
                        )
                    ){
                        fieldElements.msgs.push('('+directive.formStr+'.'+field.property+'.$error.'+error+'? \''+message+'\' : \'\')');
                    }
                });
                // Get Valid Message
                fieldElements.validMsg = (field.msgs && field.msgs.valid)? field.msgs.valid : directive.options.validation.defaultMsgs.valid;

                // Add validation attributes
                if(fieldElements.msgs.length){
                    // Add message display with ng-show/ng-hide
                    // using a mutator that requires 'validation'
                }

                return fieldElements;
            });
        }]);
})();
(function(){
    angular.module('autofields',['autofields.standard','autofields.validation']);
    angular.module('autoFields',['autofields']); // Deprecated module name
})();
/**
 * @license Autofields v2.1.6
 * (c) 2014 Justin Maier http://justmaier.github.io/angular-autoFields-bootstrap
 * License: MIT
 */
(function(){
    angular.module('autofields.bootstrap', ['autofields.standard','ui.bootstrap'])
        .config(['$autofieldsProvider', function($autofieldsProvider){
            // Add Bootstrap classes
            $autofieldsProvider.settings.classes.container.push('form-group');
            $autofieldsProvider.settings.classes.input.push('form-control');
            $autofieldsProvider.settings.classes.label.push('control-label');

            // Override Checkbox Field Handler
            $autofieldsProvider.registerHandler('checkbox', function(directive, field, index){
                var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');

                if(fieldElements.label) fieldElements.label.prepend(fieldElements.input);
                fieldElements.input.removeClass('form-control');

                return fieldElements.fieldContainer;
            });

            // Date Handler with Bootstrap Popover
            $autofieldsProvider.settings.dateSettings = {
                showWeeks:false,
                datepickerPopup: 'MMMM dd, yyyy'
            };
            $autofieldsProvider.settings.scope.datepickerOptions = {
                showWeeks:false
            };
            $autofieldsProvider.settings.scope.openCalendar = function($scope, property, e){
                e.preventDefault();
                e.stopPropagation();

                $scope[property] = !$scope[property];
            };
            $autofieldsProvider.registerHandler('date', function(directive, field, index){
                var showWeeks = field.showWeeks ? field.showWeeks : directive.options.dateSettings.showWeeks;
                var datepickerPopup = field.datepickerPopup ? field.datepickerPopup : directive.options.dateSettings.datepickerPopup;

                var inputAttrs = {
                    type:'text',
                    title:'Click on calendar button to change',
                    showWeeks: showWeeks,
                    datepickerPopup: datepickerPopup,
                    datepickerOptions: 'datepickerOptions',
                    isOpen: '$property_cleanOpen'
                };

                if (!(field.attr && field.attr.disabled == true)) {
                    field.$addons = [{
                        button: true,
                        icon: 'fa fa-fw fa-calendar',
                        attr: {
                            ngClick: 'openCalendar("$property_cleanOpen",$event)',
                            title: 'Change date'
                        }
                    }];
                }

                var fieldElements = $autofieldsProvider.field(directive, field, '<input disabled/>', inputAttrs);

                return fieldElements.fieldContainer;
            });

            // Static Field Handler
            $autofieldsProvider.registerHandler('static', function(directive, field, index){
                var showWeeks = field.showWeeks ? field.showWeeks : directive.options.dateSettings.showWeeks;
                var datepickerPopup = field.datepickerPopup ? field.datepickerPopup : directive.options.dateSettings.datepickerPopup;

                var fieldElements = $autofieldsProvider.field(directive, field, '<p/>');

                //Remove Classes & Attributes
                var input = angular.element('<p/>');
                input.attr('ng-bind', fieldElements.input.attr('ng-model'));
                input.addClass('form-control-static');
                fieldElements.input.replaceWith(input);

                return fieldElements.fieldContainer;
            });

            // Multiple Per Row Handler
            $autofieldsProvider.settings.classes.row = $autofieldsProvider.settings.classes.row || [];
            $autofieldsProvider.settings.classes.row.push('row');
            $autofieldsProvider.settings.classes.col = $autofieldsProvider.settings.classes.col || [];
            $autofieldsProvider.settings.classes.col.push('col-sm-$size');
            $autofieldsProvider.settings.classes.colOffset = $autofieldsProvider.settings.classes.colOffset || [];
            $autofieldsProvider.settings.classes.colOffset.push('col-sm-offset-$size');
            $autofieldsProvider.registerHandler('multiple', function(directive, field, index){
                var row = angular.element('<div/>');
                row.addClass(directive.options.classes.row.join(' '));

                angular.forEach(field.fields, function(cell, cellIndex){
                    var cellContainer = angular.element('<div/>')
                    var cellSize = cell.type != 'multiple' ? cell.columns || field.columns : field.columns;
                    cellContainer.addClass(directive.options.classes.col.join(' ').replace(/\$size/g,cellSize));

                    cellContainer.append($autofieldsProvider.createField(directive, cell, cellIndex));

                    row.append(cellContainer);
                })

                return row;
            });

            // Register Help Block Support
            $autofieldsProvider.settings.classes.helpBlock = $autofieldsProvider.settings.classes.helpBlock || [];
            $autofieldsProvider.settings.classes.helpBlock.push('help-block');
            $autofieldsProvider.registerMutator('helpBlock', function(directive, field, fieldElements){
                if(!field.help) return fieldElements;

                fieldElements.helpBlock = angular.element('<p/>');
                fieldElements.helpBlock.addClass(directive.options.classes.helpBlock.join(' '))
                fieldElements.helpBlock.html(field.help);
                fieldElements.fieldContainer.append(fieldElements.helpBlock);

                return fieldElements;
            });

            // Register Addon Support
            $autofieldsProvider.settings.classes.inputGroup = ['input-group'];
            $autofieldsProvider.settings.classes.inputGroupAddon = ['input-group-addon'];
            $autofieldsProvider.settings.classes.inputGroupAddonButton = ['input-group-btn'];
            $autofieldsProvider.settings.classes.button = ['btn','btn-default'];
            $autofieldsProvider.registerMutator('addons', function(directive, field, fieldElements){
                if(!(field.$addons || field.addons)) return fieldElements;

                fieldElements.inputGroup = angular.element('<div/>');
                fieldElements.inputGroup.addClass($autofieldsProvider.settings.classes.inputGroup.join(' '));

                var toAppend = [];
                angular.forEach(field.$addons || field.addons, function(addon){
                    var inputGroupAddon = angular.element('<span/>'),
                        button = null;
                    inputGroupAddon.addClass($autofieldsProvider.settings.classes.inputGroupAddon.join(' '));

                    if(addon.button){
                        inputGroupAddon.attr('class',$autofieldsProvider.settings.classes.inputGroupAddonButton.join(' '));
                        button = angular.element('<button type="button"/>');
                        button.addClass($autofieldsProvider.settings.classes.button.join(' '));
                        inputGroupAddon.append(button);
                    }
                    if(addon.icon != null){
                        var icon = angular.element('<i/>');
                        icon.addClass(addon.icon);
                        (button||inputGroupAddon).append(icon);
                    }
                    if(addon.content != null) (button||inputGroupAddon).html(addon.content);
                    if(addon.attr) $autofieldsProvider.setAttributes(directive, field, (button||inputGroupAddon), addon.attr);

                    if(addon.before) fieldElements.inputGroup.append(inputGroupAddon);
                    else toAppend.push(inputGroupAddon);
                })

                fieldElements.inputGroup.append(fieldElements.input);
                angular.forEach(toAppend, function(el){fieldElements.inputGroup.append(el)});

                fieldElements.fieldContainer.append(fieldElements.inputGroup);
                return fieldElements;
            })

            // Register Horizontal Form Support
            $autofieldsProvider.settings.layout = {
                type: 'basic',
                labelSize: 2,
                inputSize: 10
            };
            $autofieldsProvider.registerMutator('horizontalForm', function(directive, field, fieldElements){
                if(!(directive.options.layout && directive.options.layout.type == 'horizontal')){
                    directive.container.removeClass('form-horizontal');
                    return fieldElements;
                }

                // Classes & sizing
                var col = $autofieldsProvider.settings.classes.col[0];
                var colOffset = $autofieldsProvider.settings.classes.colOffset[0];
                var labelSize = field.labelSize ? field.labelSize : directive.options.layout.labelSize;
                var inputSize = field.inputSize ? field.inputSize : directive.options.layout.inputSize;

                //Add class to container
                directive.container.addClass('form-horizontal');

                // Add input container & sizing class
                var inputContainer = angular.element('<div/>');
                inputContainer.addClass(col.replace(/\$size/gi, inputSize));


                // Add label sizing class
                if(fieldElements.label && field.type != 'checkbox'){
                    fieldElements.label.addClass(col.replace(/\$size/gi, labelSize));
                    fieldElements.label.after(inputContainer);
                }else{
                    fieldElements.fieldContainer.prepend(inputContainer);
                    inputContainer.addClass(colOffset.replace(/\$size/g,labelSize));
                }

                // Add input container sizing class
                if(field.type == 'checkbox'){
                    fieldElements.fieldContainer.removeClass('checkbox');
                    var checkboxContainer = angular.element('<div/>');
                    checkboxContainer.addClass('checkbox');
                    checkboxContainer.append(fieldElements.label);
                    inputContainer.append(checkboxContainer);
                }else{
                    inputContainer.append(fieldElements.inputGroup || fieldElements.input);
                }


                // Move Help Block
                if(field.help){
                    inputContainer.append(fieldElements.helpBlock);
                }

                return fieldElements;
            }, {require:'helpBlock'});
        }]);
})();
(function(){
    angular.module('autofields.bootstrap.validation',['autofields.validation'])
        .config(['$tooltipProvider', function($tooltipProvider){
            $tooltipProvider.setTriggers({'keyup focus':'blur'});
            $tooltipProvider.options({
                placement:'top',
                animation:false
            });
        }])
        .config(['$autofieldsProvider', function($autofieldsProvider){
            // Add Validation Attributes
            $autofieldsProvider.settings.attributes.container.ngClass = "{'has-error':"+$autofieldsProvider.settings.validation.invalid+", 'has-success':"+$autofieldsProvider.settings.validation.valid+"}";
            $autofieldsProvider.settings.attributes.input.popover = "{{("+$autofieldsProvider.settings.validation.valid+") ? '$validMsg' : ($errorMsgs)}}";

            // Dont show popovers on these types
            // this is to avoid multiple scope errors with UI Bootstrap
            $autofieldsProvider.settings.noPopover = ['date'];

            // Validation Mutator
            $autofieldsProvider.registerMutator('bootstrap-validation', function(directive, field, fieldElements){
                //Check to see if validation should be added
                if(!fieldElements.validation || $autofieldsProvider.settings.noPopover.indexOf(field.type) != -1){
                    //If not enabled, remove validation hooks
                    fieldElements.input.removeAttr('popover');
                    return fieldElements;
                }

                // Add validation attributes
                if(fieldElements.msgs.length){
                    var popoverAttr = fieldElements.input.attr('popover')
                                        .replace(/\$validMsg/gi, fieldElements.validMsg)
                                        .replace(/\$errorMsgs/gi, fieldElements.msgs.join('+'));
                    fieldElements.input.attr({
                        'popover-trigger':'keyup focus',
                        'popover':popoverAttr
                    });
                }else{
                    fieldElements.input.removeAttr('popover');
                }

                return fieldElements;
            }, {require:'validation', override:true});
        }]);
})();
(function(){
    angular.module('autofields',['autofields.bootstrap','autofields.bootstrap.validation']);
})();