'use strict';
(function(){
    angular.module('gr-ui', ['gr.ui.alert', 'gr.ui.autofields', 'gr.ui.autoheight', 'gr.ui.carousel', 'gr.ui.html', 'gr.ui.table']);
})();

/*
 *
 * GR-ALERT
 *
 */

(function(){
    angular.module('gr.ui.alert', [])
        .factory('$grAlert', ['$compile', '$timeout', '$window', function($compile, $timeout, $window){
            var id = 1,
                defaults = {
                    index: 10000,
                    timeout: 8000
                },
                grAlert = {
                    alert: {},
                    realign: function(){
                        var pos = 10,
                            margin = 10;
                        angular.forEach(grAlert.alert, function(alert){
                            if(alert.message.visible){
                                alert.element.css('top', pos);
                                pos += alert.element.height() + margin;
                            }
                        });
                    },
                    new: function(wrapper){
                        if(angular.isUndefined(wrapper)){
                            wrapper = angular.element('body');
                        }
                        var instance = {
                                id: 'gr-alert-' + id,
                                element: {},
                                parent: wrapper,
                                scope: {},
                                setTimeout: function(){
                                    if(instance.timeout > 0){
                                        instance.timeoutFn = $timeout(function(){
                                            instance.hide();
                                        }, instance.timeout);
                                    }
                                },
                                message: {
                                    type: '',
                                    content: [],
                                    visible: false,
                                    check: function(){
                                        return instance.message.content.length > 0;
                                    }
                                },
                                isShown: false,
                                update: function(type, obj, timeout){
                                    if(angular.isArray(obj)){
                                        $timeout.cancel(instance.timeoutFn);
                                        instance.message.content = obj;
                                        instance.timeout = angular.isDefined(timeout) ? timeout : defaults.timeout;
                                        instance.setTimeout();
                                        $timeout(function(){
                                            instance.scope.$apply();
                                        });
                                    }
                                },
                                show: function(type, obj, timeout){
                                    if(angular.isString(type) && angular.isArray(obj) && !instance.isShown){
                                        instance.hide();
                                        $timeout.cancel(instance.timeoutFn);
                                        instance.message.type = type;
                                        instance.message.content = obj;
                                        instance.message.visible = true;
                                        instance.timeout = angular.isDefined(timeout) ? timeout : defaults.timeout;
                                        instance.setTimeout();
                                        instance.isShown = true;
                                        $timeout(function(){
                                            instance.scope.$apply();
                                        });
                                    }
                                },
                                hide: function(){
                                    instance.isShown = false;
                                    $timeout.cancel(instance.timeoutFn);
                                    instance.message.visible = false;
                                    $timeout(function(){
                                        instance.scope.$apply();
                                    });
                                },
                                destroy: function(){
                                    instance.isShown = false;
                                    $timeout.cancel(instance.timeoutFn);
                                    instance.message.visible = false;
                                    $timeout(function(){
                                        instance.element.remove();
                                        $compile(instance.element)(wrapper.scope());
                                        delete grAlert.alert[instance.id];
                                    }, 300);
                                    delete grAlert.alert[instance.id];
                                    $timeout(function(){
                                        instance.scope.$apply();
                                    });
                                }
                            },
                            alertEl = angular.element('<gr-alert id="' + instance.id + '" style="z-index: ' + (defaults.index + (id * 10)) + '"></gr-alert>'),
                            setupInstance = function(){
                                $compile(alertEl)(wrapper.scope());
                                wrapper.append(alertEl);
                                instance.element = alertEl;
                                instance.scope = alertEl.scope();
                                instance.scope.message = instance.message;
                                instance.scope.hide = instance.hide,
                                instance.scope.show = instance.show,
                                instance.scope.destroy = instance.destroy;
                                grAlert.alert[instance.id] = instance;
                                instance.scope.$watch(function(){
                                    return instance.message.visible;
                                }, function(v){
                                    if(v){
                                        instance.element.stop(true,false).fadeTo('fast', 1, function(){
                                            grAlert.realign();
                                        });
                                    }else{
                                        instance.element.stop(true,false).fadeTo('fast', 0, function(){
                                            instance.element.hide();
                                            grAlert.realign();
                                        });
                                    }
                                });
                                instance.element.on({
                                    mouseenter: function(){
                                        $timeout.cancel(instance.timeoutFn);
                                    },
                                    mouseleave: function(){
                                        instance.setTimeout();
                                    }
                                });
                                angular.element($window).on('resize', grAlert.realign);
                                id++;
                            };
                        setupInstance();
                        return grAlert.alert[instance.id];
                    }
                };
            return {
                new: grAlert.new
            }
        }])
        .directive('grAlert', ['$templateCache', '$timeout',
            function ($templateCache, $timeout) {
                return {
                    restrict: 'E',
                    scope: true,
                    template: $templateCache.get('gr-alert/alert.html'),
                    replace: true
                };
            }])
        .run(['$templateCache', function($templateCache){
            $templateCache.put('gr-alert/alert.html',
                '<div class="gr-alert" ng-show="message.check()">' +
                    '<div class="alert" ng-class="message.type ? (message.type === \'loading\' ? \'alert-info\' : (\'alert-\' + message.type)) : \'\'">' +
                        '<button type="button" class="close" ng-click="hide()">' +
                            '<span aria-hidden="true"><i class="fa fa-fw fa-times"></i></span>' +
                            '<span class="sr-only">Close</span>' +
                        '</button>' +
                        '<div class="gr-alert-icon">' +
                            '<i class="fa fa-fw fa-times-circle" ng-if="message.type === \'danger\'"></i>' +
                            '<i class="fa fa-fw fa-exclamation-circle" ng-if="message.type === \'warning\'"></i>' +
                            '<i class="fa fa-fw fa-info-circle" ng-if="message.type === \'info\'"></i>' +
                            '<i class="fa fa-fw fa-check-circle" ng-if="message.type === \'success\'"></i>' +
                            '<i class="fa fa-fw fa-refresh" ng-if="message.type === \'loading\'"></i>' +
                        '</div>' +
                        '<ul>' +
                            '<li ng-repeat="msg in message.content track by $index">' +
                                '{{msg}}' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                '</div>');
        }]);
})();

/*
 *
 * GR-AUTOFIELDS
 *
 */

(function(){
    angular.module('gr.ui.autofields', ['autofields', 'gr.ui.alert', 'ui.bootstrap'])
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
    angular.module("ui.bootstrap",["ui.bootstrap.tpls","ui.bootstrap.dateparser","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.tooltip","ui.bootstrap.bindHtml"]),angular.module("ui.bootstrap.tpls",["template/datepicker/datepicker.html","template/datepicker/day.html","template/datepicker/month.html","template/datepicker/popup.html","template/datepicker/year.html","template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html"]),angular.module("ui.bootstrap.dateparser",[]).service("dateParser",["$locale","orderByFilter",function(e,t){function n(e){var n=[],a=e.split("");return angular.forEach(i,function(t,i){var o=e.indexOf(i);if(o>-1){e=e.split(""),a[o]="("+t.regex+")",e[o]="$";for(var r=o+1,l=o+i.length;l>r;r++)a[r]="",e[r]="$";e=e.join(""),n.push({index:o,apply:t.apply})}}),{regex:new RegExp("^"+a.join("")+"$"),map:t(n,"index")}}function a(e,t,n){return 1===t&&n>28?29===n&&(e%4===0&&e%100!==0||e%400===0):3===t||5===t||8===t||10===t?31>n:!0}this.parsers={};var i={yyyy:{regex:"\\d{4}",apply:function(e){this.year=+e}},yy:{regex:"\\d{2}",apply:function(e){this.year=+e+2e3}},y:{regex:"\\d{1,4}",apply:function(e){this.year=+e}},MMMM:{regex:e.DATETIME_FORMATS.MONTH.join("|"),apply:function(t){this.month=e.DATETIME_FORMATS.MONTH.indexOf(t)}},MMM:{regex:e.DATETIME_FORMATS.SHORTMONTH.join("|"),apply:function(t){this.month=e.DATETIME_FORMATS.SHORTMONTH.indexOf(t)}},MM:{regex:"0[1-9]|1[0-2]",apply:function(e){this.month=e-1}},M:{regex:"[1-9]|1[0-2]",apply:function(e){this.month=e-1}},dd:{regex:"[0-2][0-9]{1}|3[0-1]{1}",apply:function(e){this.date=+e}},d:{regex:"[1-2]?[0-9]{1}|3[0-1]{1}",apply:function(e){this.date=+e}},EEEE:{regex:e.DATETIME_FORMATS.DAY.join("|")},EEE:{regex:e.DATETIME_FORMATS.SHORTDAY.join("|")}};this.parse=function(t,i){if(!angular.isString(t)||!i)return t;i=e.DATETIME_FORMATS[i]||i,this.parsers[i]||(this.parsers[i]=n(i));var o=this.parsers[i],r=o.regex,l=o.map,c=t.match(r);if(c&&c.length){for(var p,s={year:1900,month:0,date:1,hours:0},u=1,d=c.length;d>u;u++){var f=l[u-1];f.apply&&f.apply.call(s,c[u])}return a(s.year,s.month,s.date)&&(p=new Date(s.year,s.month,s.date,s.hours)),p}}}]),angular.module("ui.bootstrap.position",[]).factory("$position",["$document","$window",function(e,t){function n(e,n){return e.currentStyle?e.currentStyle[n]:t.getComputedStyle?t.getComputedStyle(e)[n]:e.style[n]}function a(e){return"static"===(n(e,"position")||"static")}var i=function(t){for(var n=e[0],i=t.offsetParent||n;i&&i!==n&&a(i);)i=i.offsetParent;return i||n};return{position:function(t){var n=this.offset(t),a={top:0,left:0},o=i(t[0]);o!=e[0]&&(a=this.offset(angular.element(o)),a.top+=o.clientTop-o.scrollTop,a.left+=o.clientLeft-o.scrollLeft);var r=t[0].getBoundingClientRect();return{width:r.width||t.prop("offsetWidth"),height:r.height||t.prop("offsetHeight"),top:n.top-a.top,left:n.left-a.left}},offset:function(n){var a=n[0].getBoundingClientRect();return{width:a.width||n.prop("offsetWidth"),height:a.height||n.prop("offsetHeight"),top:a.top+(t.pageYOffset||e[0].documentElement.scrollTop),left:a.left+(t.pageXOffset||e[0].documentElement.scrollLeft)}},positionElements:function(e,t,n,a){var i,o,r,l,c=n.split("-"),p=c[0],s=c[1]||"center";i=a?this.offset(e):this.position(e),o=t.prop("offsetWidth"),r=t.prop("offsetHeight");var u={center:function(){return i.left+i.width/2-o/2},left:function(){return i.left},right:function(){return i.left+i.width}},d={center:function(){return i.top+i.height/2-r/2},top:function(){return i.top},bottom:function(){return i.top+i.height}};switch(p){case"right":l={top:d[s](),left:u[p]()};break;case"left":l={top:d[s](),left:i.left-o};break;case"bottom":l={top:d[p](),left:u[s]()};break;default:l={top:i.top-r,left:u[s]()}}return l}}}]),angular.module("ui.bootstrap.datepicker",["ui.bootstrap.dateparser","ui.bootstrap.position"]).constant("datepickerConfig",{formatDay:"dd",formatMonth:"MMMM",formatYear:"yyyy",formatDayHeader:"EEE",formatDayTitle:"MMMM yyyy",formatMonthTitle:"yyyy",datepickerMode:"day",minMode:"day",maxMode:"year",showWeeks:!0,startingDay:0,yearRange:20,minDate:null,maxDate:null}).controller("DatepickerController",["$scope","$attrs","$parse","$interpolate","$timeout","$log","dateFilter","datepickerConfig",function(e,t,n,a,i,o,r,l){var c=this,p={$setViewValue:angular.noop};this.modes=["day","month","year"],angular.forEach(["formatDay","formatMonth","formatYear","formatDayHeader","formatDayTitle","formatMonthTitle","minMode","maxMode","showWeeks","startingDay","yearRange"],function(n,i){c[n]=angular.isDefined(t[n])?8>i?a(t[n])(e.$parent):e.$parent.$eval(t[n]):l[n]}),angular.forEach(["minDate","maxDate"],function(a){t[a]?e.$parent.$watch(n(t[a]),function(e){c[a]=e?new Date(e):null,c.refreshView()}):c[a]=l[a]?new Date(l[a]):null}),e.datepickerMode=e.datepickerMode||l.datepickerMode,e.uniqueId="datepicker-"+e.$id+"-"+Math.floor(1e4*Math.random()),this.activeDate=angular.isDefined(t.initDate)?e.$parent.$eval(t.initDate):new Date,e.isActive=function(t){return 0===c.compare(t.date,c.activeDate)?(e.activeDateId=t.uid,!0):!1},this.init=function(e){p=e,p.$render=function(){c.render()}},this.render=function(){if(p.$modelValue){var e=new Date(p.$modelValue),t=!isNaN(e);t?this.activeDate=e:o.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'),p.$setValidity("date",t)}this.refreshView()},this.refreshView=function(){if(this.element){this._refreshView();var e=p.$modelValue?new Date(p.$modelValue):null;p.$setValidity("date-disabled",!e||this.element&&!this.isDisabled(e))}},this.createDateObject=function(e,t){var n=p.$modelValue?new Date(p.$modelValue):null;return{date:e,label:r(e,t),selected:n&&0===this.compare(e,n),disabled:this.isDisabled(e),current:0===this.compare(e,new Date)}},this.isDisabled=function(n){return this.minDate&&this.compare(n,this.minDate)<0||this.maxDate&&this.compare(n,this.maxDate)>0||t.dateDisabled&&e.dateDisabled({date:n,mode:e.datepickerMode})},this.split=function(e,t){for(var n=[];e.length>0;)n.push(e.splice(0,t));return n},e.select=function(t){if(e.datepickerMode===c.minMode){var n=p.$modelValue?new Date(p.$modelValue):new Date(0,0,0,0,0,0,0);n.setFullYear(t.getFullYear(),t.getMonth(),t.getDate()),p.$setViewValue(n),p.$render()}else c.activeDate=t,e.datepickerMode=c.modes[c.modes.indexOf(e.datepickerMode)-1]},e.move=function(e){var t=c.activeDate.getFullYear()+e*(c.step.years||0),n=c.activeDate.getMonth()+e*(c.step.months||0);c.activeDate.setFullYear(t,n,1),c.refreshView()},e.toggleMode=function(t){t=t||1,e.datepickerMode===c.maxMode&&1===t||e.datepickerMode===c.minMode&&-1===t||(e.datepickerMode=c.modes[c.modes.indexOf(e.datepickerMode)+t])},e.keys={13:"enter",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down"};var s=function(){i(function(){c.element[0].focus()},0,!1)};e.$on("datepicker.focus",s),e.keydown=function(t){var n=e.keys[t.which];if(n&&!t.shiftKey&&!t.altKey)if(t.preventDefault(),t.stopPropagation(),"enter"===n||"space"===n){if(c.isDisabled(c.activeDate))return;e.select(c.activeDate),s()}else!t.ctrlKey||"up"!==n&&"down"!==n?(c.handleKeyDown(n,t),c.refreshView()):(e.toggleMode("up"===n?1:-1),s())}}]).directive("datepicker",function(){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/datepicker.html",scope:{datepickerMode:"=?",dateDisabled:"&"},require:["datepicker","?^ngModel"],controller:"DatepickerController",link:function(e,t,n,a){var i=a[0],o=a[1];o&&i.init(o)}}}).directive("daypicker",["dateFilter",function(e){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/day.html",require:"^datepicker",link:function(t,n,a,i){function o(e,t){return 1!==t||e%4!==0||e%100===0&&e%400!==0?c[t]:29}function r(e,t){var n=new Array(t),a=new Date(e),i=0;for(a.setHours(12);t>i;)n[i++]=new Date(a),a.setDate(a.getDate()+1);return n}function l(e){var t=new Date(e);t.setDate(t.getDate()+4-(t.getDay()||7));var n=t.getTime();return t.setMonth(0),t.setDate(1),Math.floor(Math.round((n-t)/864e5)/7)+1}t.showWeeks=i.showWeeks,i.step={months:1},i.element=n;var c=[31,28,31,30,31,30,31,31,30,31,30,31];i._refreshView=function(){var n=i.activeDate.getFullYear(),a=i.activeDate.getMonth(),o=new Date(n,a,1),c=i.startingDay-o.getDay(),p=c>0?7-c:-c,s=new Date(o);p>0&&s.setDate(-p+1);for(var u=r(s,42),d=0;42>d;d++)u[d]=angular.extend(i.createDateObject(u[d],i.formatDay),{secondary:u[d].getMonth()!==a,uid:t.uniqueId+"-"+d});t.labels=new Array(7);for(var f=0;7>f;f++)t.labels[f]={abbr:e(u[f].date,i.formatDayHeader),full:e(u[f].date,"EEEE")};if(t.title=e(i.activeDate,i.formatDayTitle),t.rows=i.split(u,7),t.showWeeks){t.weekNumbers=[];for(var h=l(t.rows[0][0].date),m=t.rows.length;t.weekNumbers.push(h++)<m;);}},i.compare=function(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate())-new Date(t.getFullYear(),t.getMonth(),t.getDate())},i.handleKeyDown=function(e){var t=i.activeDate.getDate();if("left"===e)t-=1;else if("up"===e)t-=7;else if("right"===e)t+=1;else if("down"===e)t+=7;else if("pageup"===e||"pagedown"===e){var n=i.activeDate.getMonth()+("pageup"===e?-1:1);i.activeDate.setMonth(n,1),t=Math.min(o(i.activeDate.getFullYear(),i.activeDate.getMonth()),t)}else"home"===e?t=1:"end"===e&&(t=o(i.activeDate.getFullYear(),i.activeDate.getMonth()));i.activeDate.setDate(t)},i.refreshView()}}}]).directive("monthpicker",["dateFilter",function(e){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/month.html",require:"^datepicker",link:function(t,n,a,i){i.step={years:1},i.element=n,i._refreshView=function(){for(var n=new Array(12),a=i.activeDate.getFullYear(),o=0;12>o;o++)n[o]=angular.extend(i.createDateObject(new Date(a,o,1),i.formatMonth),{uid:t.uniqueId+"-"+o});t.title=e(i.activeDate,i.formatMonthTitle),t.rows=i.split(n,3)},i.compare=function(e,t){return new Date(e.getFullYear(),e.getMonth())-new Date(t.getFullYear(),t.getMonth())},i.handleKeyDown=function(e){var t=i.activeDate.getMonth();if("left"===e)t-=1;else if("up"===e)t-=3;else if("right"===e)t+=1;else if("down"===e)t+=3;else if("pageup"===e||"pagedown"===e){var n=i.activeDate.getFullYear()+("pageup"===e?-1:1);i.activeDate.setFullYear(n)}else"home"===e?t=0:"end"===e&&(t=11);i.activeDate.setMonth(t)},i.refreshView()}}}]).directive("yearpicker",["dateFilter",function(){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/year.html",require:"^datepicker",link:function(e,t,n,a){function i(e){return parseInt((e-1)/o,10)*o+1}var o=a.yearRange;a.step={years:o},a.element=t,a._refreshView=function(){for(var t=new Array(o),n=0,r=i(a.activeDate.getFullYear());o>n;n++)t[n]=angular.extend(a.createDateObject(new Date(r+n,0,1),a.formatYear),{uid:e.uniqueId+"-"+n});e.title=[t[0].label,t[o-1].label].join(" - "),e.rows=a.split(t,5)},a.compare=function(e,t){return e.getFullYear()-t.getFullYear()},a.handleKeyDown=function(e){var t=a.activeDate.getFullYear();"left"===e?t-=1:"up"===e?t-=5:"right"===e?t+=1:"down"===e?t+=5:"pageup"===e||"pagedown"===e?t+=("pageup"===e?-1:1)*a.step.years:"home"===e?t=i(a.activeDate.getFullYear()):"end"===e&&(t=i(a.activeDate.getFullYear())+o-1),a.activeDate.setFullYear(t)},a.refreshView()}}}]).constant("datepickerPopupConfig",{datepickerPopup:"yyyy-MM-dd",currentText:"Today",clearText:"Clear",closeText:"Done",closeOnDateSelection:!0,appendToBody:!1,showButtonBar:!0}).directive("datepickerPopup",["$compile","$parse","$document","$position","dateFilter","dateParser","datepickerPopupConfig",function(e,t,n,a,i,o,r){return{restrict:"EA",require:"ngModel",scope:{isOpen:"=?",currentText:"@",clearText:"@",closeText:"@",dateDisabled:"&"},link:function(l,c,p,s){function u(e){return e.replace(/([A-Z])/g,function(e){return"-"+e.toLowerCase()})}function d(e){if(e){if(angular.isDate(e)&&!isNaN(e))return s.$setValidity("date",!0),e;if(angular.isString(e)){var t=o.parse(e,f)||new Date(e);return isNaN(t)?void s.$setValidity("date",!1):(s.$setValidity("date",!0),t)}return void s.$setValidity("date",!1)}return s.$setValidity("date",!0),null}var f,h=angular.isDefined(p.closeOnDateSelection)?l.$parent.$eval(p.closeOnDateSelection):r.closeOnDateSelection,m=angular.isDefined(p.datepickerAppendToBody)?l.$parent.$eval(p.datepickerAppendToBody):r.appendToBody;l.showButtonBar=angular.isDefined(p.showButtonBar)?l.$parent.$eval(p.showButtonBar):r.showButtonBar,l.getText=function(e){return l[e+"Text"]||r[e+"Text"]},p.$observe("datepickerPopup",function(e){f=e||r.datepickerPopup,s.$render()});var g=angular.element("<div datepicker-popup-wrap><div datepicker></div></div>");g.attr({"ng-model":"date","ng-change":"dateSelection()"});var y=angular.element(g.children()[0]);p.datepickerOptions&&angular.forEach(l.$parent.$eval(p.datepickerOptions),function(e,t){y.attr(u(t),e)}),l.watchData={},angular.forEach(["minDate","maxDate","datepickerMode"],function(e){if(p[e]){var n=t(p[e]);if(l.$parent.$watch(n,function(t){l.watchData[e]=t}),y.attr(u(e),"watchData."+e),"datepickerMode"===e){var a=n.assign;l.$watch("watchData."+e,function(e,t){e!==t&&a(l.$parent,e)})}}}),p.dateDisabled&&y.attr("date-disabled","dateDisabled({ date: date, mode: mode })"),s.$parsers.unshift(d),l.dateSelection=function(e){angular.isDefined(e)&&(l.date=e),s.$setViewValue(l.date),s.$render(),h&&(l.isOpen=!1,c[0].focus())},c.bind("input change keyup",function(){l.$apply(function(){l.date=s.$modelValue})}),s.$render=function(){var e=s.$viewValue?i(s.$viewValue,f):"";c.val(e),l.date=d(s.$modelValue)};var v=function(e){l.isOpen&&e.target!==c[0]&&l.$apply(function(){l.isOpen=!1})},b=function(e){l.keydown(e)};c.bind("keydown",b),l.keydown=function(e){27===e.which?(e.preventDefault(),e.stopPropagation(),l.close()):40!==e.which||l.isOpen||(l.isOpen=!0)},l.$watch("isOpen",function(e){e?(l.$broadcast("datepicker.focus"),l.position=m?a.offset(c):a.position(c),l.position.top=l.position.top+c.prop("offsetHeight"),n.bind("click",v)):n.unbind("click",v)}),l.select=function(e){if("today"===e){var t=new Date;angular.isDate(s.$modelValue)?(e=new Date(s.$modelValue),e.setFullYear(t.getFullYear(),t.getMonth(),t.getDate())):e=new Date(t.setHours(0,0,0,0))}l.dateSelection(e)},l.close=function(){l.isOpen=!1,c[0].focus()};var D=e(g)(l);g.remove(),m?n.find("body").append(D):c.after(D),l.$on("$destroy",function(){D.remove(),c.unbind("keydown",b),n.unbind("click",v)})}}}]).directive("datepickerPopupWrap",function(){return{restrict:"EA",replace:!0,transclude:!0,templateUrl:"template/datepicker/popup.html",link:function(e,t){t.bind("click",function(e){e.preventDefault(),e.stopPropagation()})}}}),angular.module("ui.bootstrap.tooltip",["ui.bootstrap.position","ui.bootstrap.bindHtml"]).provider("$tooltip",function(){function e(e){var t=/[A-Z]/g,n="-";return e.replace(t,function(e,t){return(t?n:"")+e.toLowerCase()})}var t={placement:"top",animation:!0,popupDelay:0},n={mouseenter:"mouseleave",click:"click",focus:"blur"},a={};this.options=function(e){angular.extend(a,e)},this.setTriggers=function(e){angular.extend(n,e)},this.$get=["$window","$compile","$timeout","$document","$position","$interpolate",function(i,o,r,l,c,p){return function(i,s,u){function d(e){var t=e||f.trigger||u,a=n[t]||t;return{show:t,hide:a}}var f=angular.extend({},t,a),h=e(i),m=p.startSymbol(),g=p.endSymbol(),y="<div "+h+'-popup title="'+m+"title"+g+'" content="'+m+"content"+g+'" placement="'+m+"placement"+g+'" animation="animation" is-open="isOpen"></div>';return{restrict:"EA",compile:function(){var e=o(y);return function(t,n,a){function o(){V.isOpen?u():p()}function p(){(!E||t.$eval(a[s+"Enable"]))&&(v(),V.popupDelay?x||(x=r(h,V.popupDelay,!1),x.then(function(e){e()})):h()())}function u(){t.$apply(function(){m()})}function h(){return x=null,M&&(r.cancel(M),M=null),V.content?(g(),k.css({top:0,left:0,display:"block"}),T?l.find("body").append(k):n.after(k),A(),V.isOpen=!0,V.$digest(),A):angular.noop}function m(){V.isOpen=!1,r.cancel(x),x=null,V.animation?M||(M=r(y,500)):y()}function g(){k&&y(),$=V.$new(),k=e($,angular.noop)}function y(){M=null,k&&(k.remove(),k=null),$&&($.$destroy(),$=null)}function v(){b(),D()}function b(){var e=a[s+"Placement"];V.placement=angular.isDefined(e)?e:f.placement}function D(){var e=a[s+"PopupDelay"],t=parseInt(e,10);V.popupDelay=isNaN(t)?f.popupDelay:t}function w(){var e=a[s+"Trigger"];F(),O=d(e),O.show===O.hide?n.bind(O.show,o):(n.bind(O.show,p),n.bind(O.hide,u))}var k,$,M,x,T=angular.isDefined(f.appendToBody)?f.appendToBody:!1,O=d(void 0),E=angular.isDefined(a[s+"Enable"]),V=t.$new(!0),A=function(){var e=c.positionElements(n,k,V.placement,T);e.top+="px",e.left+="px",k.css(e)};V.isOpen=!1,a.$observe(i,function(e){V.content=e,!e&&V.isOpen&&m()}),a.$observe(s+"Title",function(e){V.title=e});var F=function(){n.unbind(O.show,p),n.unbind(O.hide,u)};w();var Y=t.$eval(a[s+"Animation"]);V.animation=angular.isDefined(Y)?!!Y:f.animation;var S=t.$eval(a[s+"AppendToBody"]);T=angular.isDefined(S)?S:T,T&&t.$on("$locationChangeSuccess",function(){V.isOpen&&m()}),t.$on("$destroy",function(){r.cancel(M),r.cancel(x),F(),y(),V=null})}}}}}]}).directive("tooltipPopup",function(){return{restrict:"EA",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-popup.html"}}).directive("tooltip",["$tooltip",function(e){return e("tooltip","tooltip","mouseenter")}]).directive("tooltipHtmlUnsafePopup",function(){return{restrict:"EA",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-html-unsafe-popup.html"}}).directive("tooltipHtmlUnsafe",["$tooltip",function(e){return e("tooltipHtmlUnsafe","tooltip","mouseenter")}]),angular.module("ui.bootstrap.bindHtml",[]).directive("bindHtmlUnsafe",function(){return function(e,t,n){t.addClass("ng-binding").data("$binding",n.bindHtmlUnsafe),e.$watch(n.bindHtmlUnsafe,function(e){t.html(e||"")})}}),angular.module("template/datepicker/datepicker.html",[]).run(["$templateCache",function(e){e.put("template/datepicker/datepicker.html",'<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <daypicker ng-switch-when="day" tabindex="0"></daypicker>\n  <monthpicker ng-switch-when="month" tabindex="0"></monthpicker>\n  <yearpicker ng-switch-when="year" tabindex="0"></yearpicker>\n</div>')}]),angular.module("template/datepicker/day.html",[]).run(["$templateCache",function(e){e.put("template/datepicker/day.html",'<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')}]),angular.module("template/datepicker/month.html",[]).run(["$templateCache",function(e){e.put("template/datepicker/month.html",'<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')}]),angular.module("template/datepicker/popup.html",[]).run(["$templateCache",function(e){e.put("template/datepicker/popup.html",'<ul class="dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n	<li ng-transclude></li>\n	<li ng-if="showButtonBar" style="padding:10px 9px 2px">\n		<span class="btn-group pull-left">\n			<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>\n			<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>\n		</span>\n		<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>\n	</li>\n</ul>\n')}]),angular.module("template/datepicker/year.html",[]).run(["$templateCache",function(e){e.put("template/datepicker/year.html",'<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')}]),angular.module("template/tooltip/tooltip-html-unsafe-popup.html",[]).run(["$templateCache",function(e){e.put("template/tooltip/tooltip-html-unsafe-popup.html",'<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n')}]),angular.module("template/tooltip/tooltip-popup.html",[]).run(["$templateCache",function(e){e.put("template/tooltip/tooltip-popup.html",'<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n')}]);
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

/*
 *
 * GR-AUTOHEIGHT
 *
 */

(function(){
    angular.module('gr.ui.autoheight', [])
        .directive('grAutoheight', ['$window', '$document', '$timeout',
            function ($window, $document, $timeout) {
                return {
                    link: function ($scope, $element, $attrs) {
                        var siblingsMaxHeigth, sizes = false, viewPort, setHeight, clearHeight, ignore = false;
                        viewPort = function() {
                            var e = $window, a = 'inner';
                            if (!('innerWidth' in $window )) {
                                a = 'client';
                                e = $document.documentElement || $document.body;
                            }
                            return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
                        };
                        setHeight = function(){
                            var _sbl = $element.parent().children('[gr-auto-height]'), _nth = 0, _nthAux = 0, maxHeight = 0, tmpChilds = [], foundCurrent = false, bsSize = '', width = viewPort().width;
                            if(sizes){
                                if(width < 768){
                                    _nth = sizes[0];
                                    bsSize = 'xs';
                                }else if(width >= 768 && width < 992){
                                    _nth = sizes[1];
                                    bsSize = 'sm';
                                }else if(width >= 992 && width < 1200){
                                    _nth = sizes[2];
                                    bsSize = 'md';
                                }else if(width >= 1200){
                                    _nth = sizes[3];
                                    bsSize = 'lg';
                                }
                                if(ignore && (ignore.indexOf(bsSize) > -1)){
                                    angular.element(elm).innerHeight('');
                                    return false;
                                }
                                angular.forEach(_sbl, function(elm, id){
                                    if(_nth === 0){
                                        tmpChilds.push(elm);
                                    }else {
                                        if(angular.isUndefined(tmpChilds[_nthAux])){
                                            tmpChilds[_nthAux] = [];
                                        }
                                        tmpChilds[_nthAux].push(elm);
                                        if((id + 1) % _nth === 0 && id > 1 && elm !== _sbl.last()[0]){
                                            _nthAux ++;
                                            tmpChilds[_nthAux] = [];
                                        }
                                    }
                                });
                                angular.forEach(tmpChilds, function(c, cId){
                                    if(!foundCurrent){
                                        var hasCurrent = false;
                                        angular.forEach(c, function(cc){
                                            if(cc === $element[0]){
                                                hasCurrent = true;
                                            }
                                        });
                                        if(hasCurrent){
                                            tmpChilds = tmpChilds[cId];
                                            foundCurrent = true;
                                        }
                                    }
                                });
                                angular.forEach(tmpChilds, function(elm){
                                    clearHeight(angular.element(elm));
                                });
                                angular.forEach(tmpChilds, function(elm){
                                    maxHeight = elm.offsetHeight > maxHeight ? elm.offsetHeight : maxHeight;
                                });
                                angular.forEach(tmpChilds, function(elm){
                                    angular.element(elm).innerHeight(maxHeight);
                                });
                            }else{
                                if(width < 768){
                                    bsSize = 'xs';
                                }else if(width >= 768 && width < 992){
                                    bsSize = 'sm';
                                }else if(width >= 992 && width < 1200){
                                    bsSize = 'md';
                                }else if(width >= 1200){
                                    bsSize = 'lg';
                                }
                                if(ignore && (ignore.indexOf(bsSize) > -1)){
                                    $element.innerHeight('');
                                    return false;
                                }
                                if($element.attr('gr-auto-height-ajust')){
                                    $element.innerHeight($element.parent().innerHeight() + parseFloat($element.attr('gr-auto-height-ajust')));
                                }else{
                                    $element.innerHeight($element.parent().innerHeight());
                                }
                                $timeout(function(){ //compatibility for element parents with directive gr-auto-height
                                    clearHeight();
                                    if($element.attr('gr-auto-height-ajust')){
                                        $element.innerHeight($element.parent().innerHeight() + parseFloat($element.attr('gr-auto-height-ajust')));
                                    }else{
                                        $element.innerHeight($element.parent().innerHeight());
                                    }
                                });
                            }
                        };
                        clearHeight = function($elm){
                            if(!$elm){
                                $element.height('');
                            }else{
                                $elm.height('');
                            }
                        };
                        angular.element($window).bind('resize', function(){
                            clearHeight();
                            setHeight();
                        });
                        $attrs.$observe('grAutoHeightIgnore', function(v){
                            if(angular.isDefined(v) && v !== ''){
                                if(v.indexOf(',') > -1){
                                    v = v.split(',');
                                    angular.forEach(v, function(_v){
                                        _v = _v.trim();
                                    });
                                }else{
                                    v = [v];
                                }
                                ignore = v;
                            }else{
                                ignore = false;
                            }
                        });
                        $attrs.$observe('grAutoHeight', function(v){
                            if(angular.isDefined(v) && v !== ''){
                                if(v.match(/,/g).length === 3){
                                    var c = 0;
                                    sizes = v.split(',');
                                    angular.forEach(sizes, function(){
                                        c++;
                                    });
                                    if(c !== 4){
                                        sizes = false;
                                    }
                                }else{
                                    sizes = false;
                                }
                            }else{
                                sizes = false;
                            }
                            $timeout(setHeight);
                        });
                        $timeout(setHeight);
                        $timeout(setHeight, 1000);
                    }
                };
            }]);
})();

/*
 *
 * GR-CAROUSEL
 *
 */

(function(){
    angular.module('gr.ui.carousel', [])
        .directive('grCarousel', ['$templateCache', '$compile', '$window', '$timeout', function($templateCache, $compile, $window, $timeout){
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                scope: true,
                template: function(){ return $templateCache.get('gr-carousel/carousel.html'); },
                link: function($scope, $element, $attrs, $ctrl, $transclude){
                    $transclude($scope, function($clone){
                        angular.forEach($clone, function(el){
                            var $el = angular.element(el);
                            if($el.hasClass('gr-carousel-indicator')){
                                $el.appendTo($element);
                            };
                        });
                    });
                    var carousel = {
                            id: $attrs.id || 'carousel',
                            current: 0,
                            running: true,
                            hover: false,
                            interval: 4000,
                            scope: $scope,
                            attrs: $attrs,
                            scroller: [],
                            items: [],
                            itemWidth: 0,
                            visible: 0,
                            indicators: [],
                            bsCols: [],
                            animate: function(pos, done, easing){
                                carousel.scroller.stop(true, false).animate({
                                    left: pos
                                }, {
                                    duration: 'slow',
                                    easing: easing || 'easeOutQuint',
                                    done: function(){
                                        if(done && angular.isFunction(done)){
                                            done();
                                        }
                                    }
                                });
                            },
                            ajust: function(){
                                if(carousel.items.length > 0){
                                    var width = relativeWidth(carousel);
                                    $element.find('img').on('dragstart', function(e){ e.preventDefault() });
                                    carousel.items.outerWidth(width);
                                    carousel.scroller.width(width * carousel.items.length);
                                    carousel.itemWidth = width;
                                    carousel.reset();
                                }
                            },
                            isVisible: function(index, test){
                                index = (index !== 0 && index !== '0')? parseInt(index) : 0;
                                if(test){
                                    console.debug(index);
                                }
                                if(index >= 0){
                                    return index >= carousel.current && index < (carousel.current + carousel.visible);
                                }else{
                                    var visible = [],
                                        start = carousel.current,
                                        end = (carousel.current + carousel.visible);
                                    for(var x = start; x < end; x++){
                                        visible.push(x);
                                    };
                                    return visible;
                                }
                            },
                            drag: {
                                dragging: false,
                                start: function($event){
                                    carousel.drag.dragging = true;
                                    var coords = {
                                            x: ($event.clientX || $event.originalEvent.touches[0].clientX) - $element.offset().left,
                                            y: ($event.clientY || $event.originalEvent.touches[0].clientY) - $element.offset().top
                                        };
                                    drgW = carousel.scroller.outerWidth();
                                    posX = parseFloat(carousel.scroller.css('left')) + drgW - coords.x;
                                    sCoords = angular.copy(coords);
                                },
                                move: function($event){
                                    if(carousel.drag.dragging === true){
                                        var coords = {
                                                x: ($event.clientX || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientX : false)) - $element.offset().left,
                                                y: ($event.clientY || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientY : false)) - $element.offset().top
                                            },
                                            limit = {
                                                x: {
                                                    left: $element.offset().left,
                                                    right: $element.offset().left + $element.width()
                                                },
                                                y: {
                                                    top: $element.offset().top,
                                                    bottom: $element.offset().top + $element.height()
                                                }
                                            },
                                            left = coords.x + posX - drgW,
                                            elWidth = $element.innerWidth();
                                        if(!coords.x || !coords.y){ return false; }
                                        if((left + $element.offset().left) > limit.x.left){
                                            left = (((coords.x - sCoords.x)*(elWidth))/drgW);
                                        }
                                        if((left + $element.offset().left + drgW) < limit.x.right){
                                            left = (((coords.x - sCoords.x)*(elWidth))/drgW) - drgW + elWidth;
                                        }
                                        carousel.scroller.stop(true, true).animate({
                                            left: left
                                        }, {
                                            duration: 'slow',
                                            easing: 'easeOutQuint'
                                        });
                                    }
                                },
                                end: function(){
                                    carousel.drag.dragging = false;
                                    var left = parseFloat(carousel.scroller.css('left')),
                                        elWidth = $element.innerWidth(),
                                        index = 0,
                                        map = [],
                                        aux = 0;
                                    if(left > 0){
                                        left = 0;
                                    }else if(left < ((drgW - elWidth) * -1)){
                                        left = (drgW - elWidth) * -1;
                                    }
                                    angular.forEach(carousel.items, function(){
                                        map.push(aux + (carousel.itemWidth/2));
                                        aux += carousel.itemWidth;
                                    });
                                    angular.forEach(map, function(pos, id){
                                        if((left * -1) >= pos){
                                            index = id + 1;
                                        }
                                    });
                                    carousel.stop();
                                    carousel.go(index);
                                }
                            },
                            timeout: {
                                running: false,
                                timer: ''
                            },
                            checkRun: function(){
                                return (carousel.items.length > carousel.visible) && carousel.running && !carousel.hover && !carousel.drag.dragging;
                            },
                            invokeRun: function(){
                                $timeout.cancel(carousel.timeout.timer);
                                carousel.timeout.timer = $timeout(function(){ carousel.run(); }, carousel.interval);
                            },
                            run: function(){
                                if(carousel.checkRun()){
                                    if((carousel.current + carousel.visible) < carousel.items.length){
                                        carousel.current = carousel.current + 1;
                                    }else{
                                        carousel.current = 0;
                                    }
                                    carousel.animate((carousel.itemWidth * carousel.current) * -1, function(){
                                        carousel.invokeRun();
                                    });
                                }else{ carousel.invokeRun(); }
                            },
                            play: function(){
                                carousel.running = true;
                                carousel.invokeRun();
                                $timeout(function(){ $scope.$apply(); });
                            },
                            stop: function(){
                                if(carousel.visible >= carousel.items.length){
                                    return false;
                                }
                                carousel.running = false;
                                $timeout.cancel(carousel.timeout.timer);
                                $timeout(function(){ $scope.$apply(); });
                            },
                            allow: {
                                prev: function(){                                                  
                                    return (carousel.visible < carousel.items.length) && (carousel.current > 0);
                                },
                                next: function(){
                                    return (carousel.visible < carousel.items.length) && ((carousel.current + carousel.visible) < carousel.items.length);
                                },
                                go: function(index){
                                    if(!/^[0-9]+$/.test(index)){ return false; }
                                    index = parseInt(index);
                                    return (carousel.items.length >= carousel.visible) && ((index + carousel.visible) < carousel.items.length + 1);
                                }
                            },
                            prev: function(){
                                if(!carousel.allow.prev()){ return false; }
                                carousel.stop();
                                if(carousel.current > 0){
                                    carousel.current--;
                                }else{
                                    carousel.current = carousel.items.length - carousel.visible;
                                }
                                carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                $timeout(function(){ $scope.$apply(); });
                                carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 3));
                            },
                            next: function(){
                                if(!carousel.allow.next()){ return false; }
                                carousel.stop();
                                if((carousel.current + carousel.visible) < carousel.items.length){
                                    carousel.current++;
                                }else{
                                    carousel.current = 0;
                                }
                                carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                $timeout(function(){ $scope.$apply(); });
                                carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 3));
                            },
                            go: function(index){
                                console.debug(index);
                                if(!carousel.allow.go(index)){ return false; }
                                carousel.stop();
                                index = parseInt(index);
                                if(index >= 0){
                                    if((index + carousel.visible) > carousel.items.length){
                                        index = carousel.items.length - carousel.visible;
                                        if(index < 0){
                                             index = 0;
                                        }
                                    }
                                    carousel.current = index;
                                    carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                    $timeout(function(){ $scope.$apply(); });
                                }
                                carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 3));
                            },
                            reset: function(){
                                carousel.current = 0;
                                carousel.stop();
                                carousel.animate(0, carousel.play);
                                $timeout(function(){ $scope.$apply(); });
                            }
                        },
                        drgW, posX, sCoords,
                        $public = {
                            maxIndex: function(){ return carousel.items.length - carousel.visible; },
                            isRunning: carousel.checkRun,
                            isVisible: carousel.isVisible,
                            isCurrent: function(index){ return index ? carousel.current === parseInt(index) : false; },
                            interval: function(){ return carousel.interval; },
                            bsCols: function(){ return carousel.bsCols; },
                            allow: carousel.allow,
                            current: function(){ return carousel.current; },
                            indicators: carousel.indicators,
                            play: carousel.play,
                            stop: carousel.stop,
                            next: carousel.next,
                            prev: carousel.prev,
                            go: carousel.go,
                            reset: carousel.reset,
                            ajust: carousel.ajust,
                            drag: carousel.drag
                        },
                        viewPort = function(el) {
                            var w = el || $window,
                                d = w.document,
                                _return = {};
                            if (w.innerWidth != null){
                                _return = {
                                    width: w.innerWidth,
                                    height: w.innerHeight
                                };
                            };
                            if (document.compatMode == "CSS1Compat"){
                                _return = {
                                    width: d.documentElement.clientWidth,
                                    height: d.documentElement.clientHeight
                                };
                            };
                            _return = {
                                width: d.body.clientWidth,
                                height: d.body.clientHeight
                            };
                            return _return;
                        },
                        relativeWidth = function(carousel){
                            var wWidth = viewPort().width,
                                width = $element.innerWidth(),
                                padding = parseFloat(carousel.scroller.css('padding-left')) + parseFloat(carousel.scroller.css('padding-right')),
                                bs;
                            if(wWidth >= 1200){
                                bs = carousel.bsCols.lg || 1;
                            }
                            if(wWidth < 1200){
                                bs = carousel.bsCols.md || 1;
                            }
                            if(wWidth < 991){
                                bs = carousel.bsCols.sm || 1;
                            }
                            if(wWidth < 768){
                                bs = carousel.bsCols.xs || 1;
                            }
                            carousel.visible = bs;
                            return Math.round((width/bs)-(padding/bs));
                        },
                        init = function(){
                            carousel.scroller = $element.children('.gr-carousel-inner');
                            angular.element($window).on({ resize: function(){ carousel.ajust(); } });
                            $scope.$parent[carousel.id] = $public;
                            $scope.carousel = $public;
                            carousel.ajust();
                            $element.on({
                                mousedown: carousel.drag.start,
                                mousemove: carousel.drag.move,
                                touchstart: carousel.drag.start,
                                touchmove: carousel.drag.move,
                                mouseenter: function(){ carousel.hover = true; $scope.$apply(); },
                                mouseleave: function(){ carousel.hover = false; $scope.$apply(); }
                            });
                            angular.element($window).on({
                                mousemove: function($event){ if(carousel.drag.dragging){ carousel.drag.move($event) } },
                                mouseup: function($event){ if(carousel.drag.dragging){ carousel.drag.end($event) } },
                                touchmove: function($event){ if(carousel.drag.dragging){ carousel.drag.move($event) } },
                                touchend: function($event){ if(carousel.drag.dragging){ carousel.drag.end($event) } }
                            });
                            carousel.scroller.find('.gr-carousel-indicator').remove();
                        };
                    $scope.$watchCollection(function(){
                        if(carousel.scroller.length > 0){
                            return carousel.scroller.children('.gr-carousel-item');
                        }else{
                            return [];
                        }
                    }, function(items){
                        if(items && items.length > 0){
                            carousel.items = items;
                            angular.forEach(carousel.items, function(item, id){ carousel.indicators.push(id); });
                            carousel.ajust();
                        }
                    });
                    $scope.$watchCollection(function(){
                        return carousel.hover;
                    }, function(hover){
                        if(hover){
                            $timeout.cancel(carousel.timeout.timer);
                        }else{
                            carousel.invokeRun();
                        }
                    });
                    $scope.$watchCollection(function(){
                        return carousel.drag.dragging;
                    }, function(dragging){
                        if(dragging){
                            $timeout.cancel(carousel.timeout.timer);
                        }else{
                            carousel.invokeRun();
                        }
                    });
                    $attrs.$observe('bs', function(args){
                        carousel.bsCols = $scope.$eval(args);
                        carousel.ajust();
                        carousel.reset();
                    });
                    $attrs.$observe('autoplay', function(autoplay){
                        if(autoplay > 0){
                            carousel.interval = autoplay;
                            carousel.running = true;
                            carousel.invokeRun();
                        }else{
                            carousel.interval = 0;
                            $timeout(function(){
                                carousel.running = false;
                                carousel.reset();
                            });
                        }
                    });
                    init();
                }
            }
        }])
        .directive('grCarouselItem', ['$templateCache', function($templateCache){
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                template: function(){
                    return $templateCache.get('gr-carousel/carousel-item.html');
                },
                link: function($scope, $element, $attrs, $ctrl, $transclude){
                    $transclude($scope, function(){});
                }
            }
        }])
        .directive('grCarouselIndicators', ['$templateCache', '$timeout', function($templateCache, $timeout){
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    carousel: '=for'
                },
                template: function(){
                    return $templateCache.get('gr-carousel/carousel-indicators.html');
                }
            }
        }])
        .run(['$templateCache', function($templateCache){
            $templateCache.put('gr-carousel/carousel.html',
                                '<div class="gr-carousel">' +
                                    '<div class="gr-carousel-inner" ng-transclude></div>' +
                                '</div>');
            $templateCache.put('gr-carousel/carousel-item.html', '<div class="gr-carousel-item" ng-transclude></div>');
            $templateCache.put('gr-carousel/carousel-indicators.html',
                                '<ul class="gr-carousel-indicator">' +
                                    '<li class="gr-carousel-indicator-item" ng-class="{\'active\': carousel.isVisible($index)}" ng-repeat="item in carousel.indicators" ng-click="carousel.go($index)"></li>' +
                                '</ul>');
        }]);
})();
/*! jQuery UI - v1.11.2 - 2015-01-23
* http://jqueryui.com
* Includes: effect.js
* Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */
(function(){
    (function(e){"function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)})(function(e){var t="ui-effects-",i=e;e.effects={effect:{}},function(e,t){function i(e,t,i){var s=d[t.type]||{};return null==e?i||!t.def?null:t.def:(e=s.floor?~~e:parseFloat(e),isNaN(e)?t.def:s.mod?(e+s.mod)%s.mod:0>e?0:e>s.max?s.max:e)}function s(i){var s=l(),n=s._rgba=[];return i=i.toLowerCase(),f(h,function(e,a){var o,r=a.re.exec(i),h=r&&a.parse(r),l=a.space||"rgba";return h?(o=s[l](h),s[u[l].cache]=o[u[l].cache],n=s._rgba=o._rgba,!1):t}),n.length?("0,0,0,0"===n.join()&&e.extend(n,a.transparent),s):a[i]}function n(e,t,i){return i=(i+1)%1,1>6*i?e+6*(t-e)*i:1>2*i?t:2>3*i?e+6*(t-e)*(2/3-i):e}var a,o="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",r=/^([\-+])=\s*(\d+\.?\d*)/,h=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[e[1],e[2],e[3],e[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[2.55*e[1],2.55*e[2],2.55*e[3],e[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(e){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(e){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(e){return[e[1],e[2]/100,e[3]/100,e[4]]}}],l=e.Color=function(t,i,s,n){return new e.Color.fn.parse(t,i,s,n)},u={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},d={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},c=l.support={},p=e("<p>")[0],f=e.each;p.style.cssText="background-color:rgba(1,1,1,.5)",c.rgba=p.style.backgroundColor.indexOf("rgba")>-1,f(u,function(e,t){t.cache="_"+e,t.props.alpha={idx:3,type:"percent",def:1}}),l.fn=e.extend(l.prototype,{parse:function(n,o,r,h){if(n===t)return this._rgba=[null,null,null,null],this;(n.jquery||n.nodeType)&&(n=e(n).css(o),o=t);var d=this,c=e.type(n),p=this._rgba=[];return o!==t&&(n=[n,o,r,h],c="array"),"string"===c?this.parse(s(n)||a._default):"array"===c?(f(u.rgba.props,function(e,t){p[t.idx]=i(n[t.idx],t)}),this):"object"===c?(n instanceof l?f(u,function(e,t){n[t.cache]&&(d[t.cache]=n[t.cache].slice())}):f(u,function(t,s){var a=s.cache;f(s.props,function(e,t){if(!d[a]&&s.to){if("alpha"===e||null==n[e])return;d[a]=s.to(d._rgba)}d[a][t.idx]=i(n[e],t,!0)}),d[a]&&0>e.inArray(null,d[a].slice(0,3))&&(d[a][3]=1,s.from&&(d._rgba=s.from(d[a])))}),this):t},is:function(e){var i=l(e),s=!0,n=this;return f(u,function(e,a){var o,r=i[a.cache];return r&&(o=n[a.cache]||a.to&&a.to(n._rgba)||[],f(a.props,function(e,i){return null!=r[i.idx]?s=r[i.idx]===o[i.idx]:t})),s}),s},_space:function(){var e=[],t=this;return f(u,function(i,s){t[s.cache]&&e.push(i)}),e.pop()},transition:function(e,t){var s=l(e),n=s._space(),a=u[n],o=0===this.alpha()?l("transparent"):this,r=o[a.cache]||a.to(o._rgba),h=r.slice();return s=s[a.cache],f(a.props,function(e,n){var a=n.idx,o=r[a],l=s[a],u=d[n.type]||{};null!==l&&(null===o?h[a]=l:(u.mod&&(l-o>u.mod/2?o+=u.mod:o-l>u.mod/2&&(o-=u.mod)),h[a]=i((l-o)*t+o,n)))}),this[n](h)},blend:function(t){if(1===this._rgba[3])return this;var i=this._rgba.slice(),s=i.pop(),n=l(t)._rgba;return l(e.map(i,function(e,t){return(1-s)*n[t]+s*e}))},toRgbaString:function(){var t="rgba(",i=e.map(this._rgba,function(e,t){return null==e?t>2?1:0:e});return 1===i[3]&&(i.pop(),t="rgb("),t+i.join()+")"},toHslaString:function(){var t="hsla(",i=e.map(this.hsla(),function(e,t){return null==e&&(e=t>2?1:0),t&&3>t&&(e=Math.round(100*e)+"%"),e});return 1===i[3]&&(i.pop(),t="hsl("),t+i.join()+")"},toHexString:function(t){var i=this._rgba.slice(),s=i.pop();return t&&i.push(~~(255*s)),"#"+e.map(i,function(e){return e=(e||0).toString(16),1===e.length?"0"+e:e}).join("")},toString:function(){return 0===this._rgba[3]?"transparent":this.toRgbaString()}}),l.fn.parse.prototype=l.fn,u.hsla.to=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t,i,s=e[0]/255,n=e[1]/255,a=e[2]/255,o=e[3],r=Math.max(s,n,a),h=Math.min(s,n,a),l=r-h,u=r+h,d=.5*u;return t=h===r?0:s===r?60*(n-a)/l+360:n===r?60*(a-s)/l+120:60*(s-n)/l+240,i=0===l?0:.5>=d?l/u:l/(2-u),[Math.round(t)%360,i,d,null==o?1:o]},u.hsla.from=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t=e[0]/360,i=e[1],s=e[2],a=e[3],o=.5>=s?s*(1+i):s+i-s*i,r=2*s-o;return[Math.round(255*n(r,o,t+1/3)),Math.round(255*n(r,o,t)),Math.round(255*n(r,o,t-1/3)),a]},f(u,function(s,n){var a=n.props,o=n.cache,h=n.to,u=n.from;l.fn[s]=function(s){if(h&&!this[o]&&(this[o]=h(this._rgba)),s===t)return this[o].slice();var n,r=e.type(s),d="array"===r||"object"===r?s:arguments,c=this[o].slice();return f(a,function(e,t){var s=d["object"===r?e:t.idx];null==s&&(s=c[t.idx]),c[t.idx]=i(s,t)}),u?(n=l(u(c)),n[o]=c,n):l(c)},f(a,function(t,i){l.fn[t]||(l.fn[t]=function(n){var a,o=e.type(n),h="alpha"===t?this._hsla?"hsla":"rgba":s,l=this[h](),u=l[i.idx];return"undefined"===o?u:("function"===o&&(n=n.call(this,u),o=e.type(n)),null==n&&i.empty?this:("string"===o&&(a=r.exec(n),a&&(n=u+parseFloat(a[2])*("+"===a[1]?1:-1))),l[i.idx]=n,this[h](l)))})})}),l.hook=function(t){var i=t.split(" ");f(i,function(t,i){e.cssHooks[i]={set:function(t,n){var a,o,r="";if("transparent"!==n&&("string"!==e.type(n)||(a=s(n)))){if(n=l(a||n),!c.rgba&&1!==n._rgba[3]){for(o="backgroundColor"===i?t.parentNode:t;(""===r||"transparent"===r)&&o&&o.style;)try{r=e.css(o,"backgroundColor"),o=o.parentNode}catch(h){}n=n.blend(r&&"transparent"!==r?r:"_default")}n=n.toRgbaString()}try{t.style[i]=n}catch(h){}}},e.fx.step[i]=function(t){t.colorInit||(t.start=l(t.elem,i),t.end=l(t.end),t.colorInit=!0),e.cssHooks[i].set(t.elem,t.start.transition(t.end,t.pos))}})},l.hook(o),e.cssHooks.borderColor={expand:function(e){var t={};return f(["Top","Right","Bottom","Left"],function(i,s){t["border"+s+"Color"]=e}),t}},a=e.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}}(i),function(){function t(t){var i,s,n=t.ownerDocument.defaultView?t.ownerDocument.defaultView.getComputedStyle(t,null):t.currentStyle,a={};if(n&&n.length&&n[0]&&n[n[0]])for(s=n.length;s--;)i=n[s],"string"==typeof n[i]&&(a[e.camelCase(i)]=n[i]);else for(i in n)"string"==typeof n[i]&&(a[i]=n[i]);return a}function s(t,i){var s,n,o={};for(s in i)n=i[s],t[s]!==n&&(a[s]||(e.fx.step[s]||!isNaN(parseFloat(n)))&&(o[s]=n));return o}var n=["add","remove","toggle"],a={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};e.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(t,s){e.fx.step[s]=function(e){("none"!==e.end&&!e.setAttr||1===e.pos&&!e.setAttr)&&(i.style(e.elem,s,e.end),e.setAttr=!0)}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e.effects.animateClass=function(i,a,o,r){var h=e.speed(a,o,r);return this.queue(function(){var a,o=e(this),r=o.attr("class")||"",l=h.children?o.find("*").addBack():o;l=l.map(function(){var i=e(this);return{el:i,start:t(this)}}),a=function(){e.each(n,function(e,t){i[t]&&o[t+"Class"](i[t])})},a(),l=l.map(function(){return this.end=t(this.el[0]),this.diff=s(this.start,this.end),this}),o.attr("class",r),l=l.map(function(){var t=this,i=e.Deferred(),s=e.extend({},h,{queue:!1,complete:function(){i.resolve(t)}});return this.el.animate(this.diff,s),i.promise()}),e.when.apply(e,l.get()).done(function(){a(),e.each(arguments,function(){var t=this.el;e.each(this.diff,function(e){t.css(e,"")})}),h.complete.call(o[0])})})},e.fn.extend({addClass:function(t){return function(i,s,n,a){return s?e.effects.animateClass.call(this,{add:i},s,n,a):t.apply(this,arguments)}}(e.fn.addClass),removeClass:function(t){return function(i,s,n,a){return arguments.length>1?e.effects.animateClass.call(this,{remove:i},s,n,a):t.apply(this,arguments)}}(e.fn.removeClass),toggleClass:function(t){return function(i,s,n,a,o){return"boolean"==typeof s||void 0===s?n?e.effects.animateClass.call(this,s?{add:i}:{remove:i},n,a,o):t.apply(this,arguments):e.effects.animateClass.call(this,{toggle:i},s,n,a)}}(e.fn.toggleClass),switchClass:function(t,i,s,n,a){return e.effects.animateClass.call(this,{add:i,remove:t},s,n,a)}})}(),function(){function i(t,i,s,n){return e.isPlainObject(t)&&(i=t,t=t.effect),t={effect:t},null==i&&(i={}),e.isFunction(i)&&(n=i,s=null,i={}),("number"==typeof i||e.fx.speeds[i])&&(n=s,s=i,i={}),e.isFunction(s)&&(n=s,s=null),i&&e.extend(t,i),s=s||i.duration,t.duration=e.fx.off?0:"number"==typeof s?s:s in e.fx.speeds?e.fx.speeds[s]:e.fx.speeds._default,t.complete=n||i.complete,t}function s(t){return!t||"number"==typeof t||e.fx.speeds[t]?!0:"string"!=typeof t||e.effects.effect[t]?e.isFunction(t)?!0:"object"!=typeof t||t.effect?!1:!0:!0}e.extend(e.effects,{version:"1.11.2",save:function(e,i){for(var s=0;i.length>s;s++)null!==i[s]&&e.data(t+i[s],e[0].style[i[s]])},restore:function(e,i){var s,n;for(n=0;i.length>n;n++)null!==i[n]&&(s=e.data(t+i[n]),void 0===s&&(s=""),e.css(i[n],s))},setMode:function(e,t){return"toggle"===t&&(t=e.is(":hidden")?"show":"hide"),t},getBaseline:function(e,t){var i,s;switch(e[0]){case"top":i=0;break;case"middle":i=.5;break;case"bottom":i=1;break;default:i=e[0]/t.height}switch(e[1]){case"left":s=0;break;case"center":s=.5;break;case"right":s=1;break;default:s=e[1]/t.width}return{x:s,y:i}},createWrapper:function(t){if(t.parent().is(".ui-effects-wrapper"))return t.parent();var i={width:t.outerWidth(!0),height:t.outerHeight(!0),"float":t.css("float")},s=e("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),n={width:t.width(),height:t.height()},a=document.activeElement;try{a.id}catch(o){a=document.body}return t.wrap(s),(t[0]===a||e.contains(t[0],a))&&e(a).focus(),s=t.parent(),"static"===t.css("position")?(s.css({position:"relative"}),t.css({position:"relative"})):(e.extend(i,{position:t.css("position"),zIndex:t.css("z-index")}),e.each(["top","left","bottom","right"],function(e,s){i[s]=t.css(s),isNaN(parseInt(i[s],10))&&(i[s]="auto")}),t.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})),t.css(n),s.css(i).show()},removeWrapper:function(t){var i=document.activeElement;return t.parent().is(".ui-effects-wrapper")&&(t.parent().replaceWith(t),(t[0]===i||e.contains(t[0],i))&&e(i).focus()),t},setTransition:function(t,i,s,n){return n=n||{},e.each(i,function(e,i){var a=t.cssUnit(i);a[0]>0&&(n[i]=a[0]*s+a[1])}),n}}),e.fn.extend({effect:function(){function t(t){function i(){e.isFunction(a)&&a.call(n[0]),e.isFunction(t)&&t()}var n=e(this),a=s.complete,r=s.mode;(n.is(":hidden")?"hide"===r:"show"===r)?(n[r](),i()):o.call(n[0],s,i)}var s=i.apply(this,arguments),n=s.mode,a=s.queue,o=e.effects.effect[s.effect];return e.fx.off||!o?n?this[n](s.duration,s.complete):this.each(function(){s.complete&&s.complete.call(this)}):a===!1?this.each(t):this.queue(a||"fx",t)},show:function(e){return function(t){if(s(t))return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="show",this.effect.call(this,n)}}(e.fn.show),hide:function(e){return function(t){if(s(t))return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="hide",this.effect.call(this,n)}}(e.fn.hide),toggle:function(e){return function(t){if(s(t)||"boolean"==typeof t)return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="toggle",this.effect.call(this,n)}}(e.fn.toggle),cssUnit:function(t){var i=this.css(t),s=[];return e.each(["em","px","%","pt"],function(e,t){i.indexOf(t)>0&&(s=[parseFloat(i),t])}),s}})}(),function(){var t={};e.each(["Quad","Cubic","Quart","Quint","Expo"],function(e,i){t[i]=function(t){return Math.pow(t,e+2)}}),e.extend(t,{Sine:function(e){return 1-Math.cos(e*Math.PI/2)},Circ:function(e){return 1-Math.sqrt(1-e*e)},Elastic:function(e){return 0===e||1===e?e:-Math.pow(2,8*(e-1))*Math.sin((80*(e-1)-7.5)*Math.PI/15)},Back:function(e){return e*e*(3*e-2)},Bounce:function(e){for(var t,i=4;((t=Math.pow(2,--i))-1)/11>e;);return 1/Math.pow(4,3-i)-7.5625*Math.pow((3*t-2)/22-e,2)}}),e.each(t,function(t,i){e.easing["easeIn"+t]=i,e.easing["easeOut"+t]=function(e){return 1-i(1-e)},e.easing["easeInOut"+t]=function(e){return.5>e?i(2*e)/2:1-i(-2*e+2)/2}})}(),e.effects});
})();

/*
 *
 * GR-HTML
 *
 */
 
(function(){
    angular.module('gr.ui.html', [])
        .directive('grHtml', ['$compile', function($compile){
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs){
                    $attrs.$observe('grHtml', function(html){
                        if(html !== ''){
                            $element.removeAttr('gr-html');
                            html = $scope.$eval(html);
                            $element.html(html);
                        }
                    });
                }
            }
        }]);
})();

/*
 *
 * GR-TABLE
 *
 */
 
(function(){
    angular.module('gr.ui.table', ['ngTable', 'ngTableExport', 'grModal'])
        .value('grTableDefaults', {
            tag: {
                'gr-col': 'grCol'
            },
            attr: {
                'gr-csv-name': 'csvName',
                'gr-data-source': 'dataSource',
                'gr-export-csv': 'csv',
                'gr-filter': 'filter',
                'gr-group': 'group',
                'gr-label': 'label',
                'gr-name': 'name',
                'gr-no-translate': 'noTranslate',
                'gr-show-filter': 'filter',
                'gr-sortable': 'sortable',
                'gr-class': 'ng-class'
            }
        })
        .directive('grTable', ['$injector',
            function ($injector) {
                var grTableDefaults = $injector.get('grTableDefaults'),
                    $templateCache = $injector.get('$templateCache'),
                    $http = $injector.get('$http'),
                    $compile = $injector.get('$compile'),
                    $filter = $injector.get('$filter'),
                    $timeout = $injector.get('$timeout'),
                    $window = $injector.get('$window'),
                    ngTableParams = $injector.get('ngTableParams'),
                    grTableConfig = $injector.get('$grTable.config'),
                    REST = $injector.get('$grRestful'),
                    MODAL = $injector.get('$grModal'),
                    grTable = [],
                    grGroupBy = {
                        _firstLetter: function (item) {
                            return $filter('translate')('First letter') + ' "' + item.name[0] + '"';
                        }
                    },
                    grTableController = ['$scope', '$element',
                        function ($scope, $element) {
                            var defaultSorting = {};
                            defaultSorting["id" + GRIFFO.module] = 'asc';
                            var getData = function(){
                                    return $scope.grTable.dataSet || false;
                                },
                                ngTable = {
                                    data: [],
                                    defaults: {
                                        page: 1,
                                        count: 10,
                                        //filter: { text: '', select: '', textarea: '', radio: '' },
                                        sorting: defaultSorting
                                    },
                                    settings: {
                                        $scope: $scope,
                                        orderBy: '',
                                        //total: 0,
                                        counts: [5, 10, 25, 50, 100],
                                        getFilterData: function ($defer, params) {
                                            var grFormData = getData(),
                                                arr = [],
                                                data = [];
                                            angular.forEach(grFormData, function (item, id) {
                                                angular.forEach(item, function (_item, _id) {
                                                    if (!arr[_id]) {
                                                        arr[_id] = [];
                                                        arr.length++;
                                                    }
                                                    if (!data[_id]) {
                                                        data[_id] = [];
                                                        data.length++;
                                                    }
                                                    if (inArray(_item, arr[_id]) === -1) {
                                                        arr[_id].push(_item);
                                                        data[_id].push({
                                                            'id': _item,
                                                            'title': _item
                                                        });
                                                        if (data[_id][0].title !== '-') {
                                                            data[_id].unshift({
                                                                id: '',
                                                                title: '-'
                                                            });
                                                        }
                                                    }
                                                });
                                            });
                                            $defer.resolve(data);
                                            return $defer;
                                        },
                                        getData: function ($defer, params) {
                                            var data = getData();
                                            if (data) {
                                                var filteredData = $filter('filter')(data, params.filter()),
                                                    orderedData = params.filter() ? (params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData) : data,
                                                    newData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                                $scope.grTable.data = newData;
												$scope.grTable.allData = data;
                                                params.total(data.length);
                                                $defer.resolve(newData);
                                                $timeout(function(){
                                                    angular.element($window).trigger('resize');
                                                });
                                            }
                                        }
                                    }
                                },
                                inArray = Array.prototype.indexOf ? function (val, arr) {
                                    return arr.indexOf(val);
                                } : function (val, arr) {
                                    var i = arr.length;
                                    while (i--) {
                                        if (arr[i] === val) {
                                            return i;
                                        }
                                    }
                                    return -1;
                                };
                            $scope.grTable = new ngTableParams(ngTable.defaults, ngTable.settings);
                            $scope.grTable.reloadData = function(){
                                grDataSource($scope, $element);
                            }
                            $scope.$watch('grTable.dataSet', function (v) {
                                $scope.grTable.reload();
                            });
                    }],
                    grDataSource = function ($scope, $element) {
                        if(!grTable.attrs.dataSource){
                            REST.all({
                                module: GRIFFO.module,
                                action: 'get'
                            }).then(function (d) {
                                var response = d.response;
                                $scope.grTable.dataSet = response;
                            }, function (e) {
                                var title = angular.element(angular.element(e.data)[0]).text(),
                                    content = angular.element(angular.element(e.data)[3]).text();
                                MODAL.alert(title + ' - ' + content, 'md');
                            });
                        }else{
                            $http.get($scope.$eval(grTable.attrs.dataSource)).success(function(r){
                                if(r.response){
                                    var response = r.response;
                                    $scope.grTable.dataSet = response;
                                }else{
                                    console.debug(r);
                                }
                            }).error(function(e){
                                var title = angular.element(angular.element(e.data)[0]).text(),
                                    content = angular.element(angular.element(e.data)[3]).text();
                                MODAL.alert(title + ' - ' + content, 'md');
                            });
                        }
                    },
                    grTableLink = function ($scope, $element, $attrs) {
                        $element.addClass('col-xs-12 col-sm-12 col-md-12 col-lg-12 gr-table').removeAttr('ng-transclude');

                        if($element.children('gr-row').length > 0){
                            var grTr = {
                                attrs: {}
                            }
                            angular.forEach($element.children('gr-row')[0].attributes, function (attr) {
                                if (grTableDefaults.attr.hasOwnProperty(attr.name)) {
                                    grTr.attrs[grTableDefaults.attr[attr.name]] = attr.value;
                                    grTr.attrs.length++;
                                } else {
                                    grTr.attrs[attr.name] = attr.value;
                                    grTr.attrs.length++;
                                }
                            });

                            $element.html($element.children('gr-row').html());

                            $compile($element)($scope);

                            grTable = generateElementArray($element);

                            grTable.grRow = grTr;
                        }else{
                            grTable = generateElementArray($element);
                        }

                        grTableRender($element);

                        $compile($element)($scope);

                        if (grTable.attrs.group) {
                            if (grGroupBy.hasOwnProperty(grTable.attrs.group)) {
                                $scope.grTable.settings().groupBy = grGroupBy[grTable.attrs.group];
                            } else {
                                $scope.grTable.settings().groupBy = grTable.attrs.group;
                            }
                        }

                        if (grTable.attrs.hasOwnProperty('csvName') && grTable.attrs.csvName !== '') {
                            $scope.csv.name = grTable.attrs.csvName;
                        }

                        grDataSource($scope, $element);

                        angular.forEach(grTableConfig, function (fn, id) {
                            $scope.grTable[id] = function(){
                                var args = [].slice.apply(arguments);
                                args.unshift($scope.grTable);
                                fn.apply(null, args);
                            }
                        });
                    },
                    grTableRender = function ($element) {
                        var template = $templateCache.get('grTable/table.html'),
                            table = grTableCompile('table', template);

                        if (grTable.children.length > 0) {
                            var tbody = grTableCompile('tbody', template),
                                tr = grTableCompile('tr', template),
                                td = grTableCompile('td', template);

                            tr.append(td);
                            tbody.append(tr).append(angular.element('<tr ng-if="$data.length === 0"><td colspan="{{$columns.length}}" class="ng-table-no-results">{{\'No data found...\' | translate}}</td></tr>'));
                            table.html(tbody);
                        }
                        $element.html('').append(table);
                        return $element;
                    },
                    grTableCompile = function (element, template) {
                        var compile = {
                                table: function(){
                                    var filter = '',
                                        csv = '';
                                    html = template.table.element;
                                    if (grTable.attrs.hasOwnProperty('filter') && grTable.attrs.filter) {
                                        if (grTable.attrs.filter === 'true' || grTable.attrs.filter === 'false') {
                                            filter = template.table.filter.replace('%filter%', grTable.attrs.filter);
                                        }
                                    }
                                    html = html.replace('%filter%', filter);
                                    if (grTable.attrs.hasOwnProperty('csv') && grTable.attrs.csv) {
                                        if (grTable.attrs.csv === 'true' || grTable.attrs.csv === 'false') {
                                            csv = template.table.csv.replace('%csv%', 'csv');
                                        }
                                    }
                                    html = html.replace('%csv%', csv);
                                    return angular.element(html);
                                },
                                tbody: function(){
                                    html = template.tbody.element;
                                    if (grTable.attrs.hasOwnProperty('group') && grTable.attrs.group) {
                                        if (grTable.attrs.group) {
                                            html = template.tbody.element_group;
                                        }
                                    }
                                    return angular.element(html);
                                },
                                tr: function(){
                                    html = template.tr.element;
                                    if (grTable.attrs.hasOwnProperty('group') && grTable.attrs.group) {
                                        if (grTable.attrs.group) {
                                            html = template.tr.element_group;
                                        }
                                    }
                                    if(grTable.grRow && angular.isDefined(grTable.grRow.attrs)){
                                        var attrs = '';
                                        angular.forEach(grTable.grRow.attrs, function(a, id){
                                            if(id === 'class'){
                                                a = a.replace('ng-scope','');
                                            }
                                            if(a !== '' && angular.isDefined(a)){
                                                attrs += id + '="' + a + '" ';
                                            }
                                        });
                                        html = html.replace('%attrs%', attrs);
                                    }else{
                                        html = html.replace('%attrs%', '');
                                    }
                                    return angular.element(html);
                                },
                                td: function(){
                                    angular.forEach(grTable.children, function (element, id) {
                                        if (element.attrs.hasOwnProperty('name') && element.attrs.name) {
                                            var td = template.td.element_start.replace('%label%', element.attrs.label || ''),
                                                filter = '',
                                                sortable = '',
                                                other = '';
                                            angular.forEach(element.attrs, function (attr, id) {
                                                if (id === 'filter' && attr) {
                                                    filter = template.td.filter.replace('%filter%', attr).replace('%name%', element.attrs.name || '').replace('%label%', element.attrs.label || '');
                                                } else if (id === 'sortable' && attr === '') {
                                                    sortable = template.td.sortable.replace('%name%', element.attrs.name || '');
                                                } else if (typeof attr === 'string' && id !== 'noTranslate') {
                                                    other += ' ' + id + '="' + attr + '"';
                                                }
                                            });
                                            td = td.replace('%filter%', filter).replace('%sortable%', sortable).replace('%other%', other);
                                            if (element.content.length > 0) {
                                                td += element.content;
                                            } else {
                                                if (element.attrs.hasOwnProperty('noTranslate')) {
                                                    td += template.td.content_no_translate.replace('%name%', element.attrs.name);
                                                } else {
                                                    td += template.td.content.replace('%name%', element.attrs.name);
                                                }
                                            };
                                            td += template.td.element_end;
                                            html += td;
                                        } else {
                                            var td = template.td.element_start.replace('%label%', element.attrs.label || ''),
                                                other = '';
                                            angular.forEach(element.attrs, function (attr, id) {
                                                if (typeof attr === 'string' && id !== 'noTranslate') {
                                                    other += ' ' + id + '="' + attr + '"';
                                                }
                                            });
                                            td = td.replace('%other%', other);
                                            if (element.content.length > 0) {
                                                td += element.content;
                                            }
                                            td += template.td.element_end;
                                            html += td;
                                        }
                                    });
                                    return angular.element(html);
                                }
                            },
                            html = '';
                        if (typeof compile[element] === 'function') {
                            return compile[element]() || template;
                        }
                        return;
                    },
                    generateElementArray = function ($element) {
                        var childs = $element.children();
                        grTable['attrs'] = [];
                        grTable['children'] = [];
                        grTable.length += 2;

                        angular.forEach($element[0].attributes, function (attr) {
                            if (grTableDefaults.attr.hasOwnProperty(attr.name)) {
                                grTable.attrs[grTableDefaults.attr[attr.name]] = attr.value;
                                grTable.attrs.length++;
                            }
                        });

                        angular.forEach(childs, function (c, id) {
                            var tmp = angular.element(c),
                                child = {
                                    element: tmp,
                                    tag: tmp[0].localName,
                                    attrs: {},
                                    name: ''
                                };
                            angular.forEach(child.element[0].attributes, function (attr) {
                                if (grTableDefaults.attr.hasOwnProperty(attr.name)) {
                                    child.attrs[grTableDefaults.attr[attr.name]] = attr.value;
                                    child.attrs.length++;
                                } else {
                                    child.attrs[attr.name] = attr.value;
                                    child.attrs.length++;
                                }
                            });
                            child.name = child.attrs.name;
                            if (child.name) {
                                if (!grTable.children[child.name]) {
                                    grTable.children.push({
                                        'name': child.name,
                                        'attrs': child.attrs,
                                        'content': child.element.html()
                                    });
                                }
                            } else {
                                grTable.children.push({
                                    'attrs': child.attrs,
                                    'content': child.element.html()
                                });
                            }
                        });

                        return grTable;
                    };
                return {
                    restrict: 'E',
                    transclude: true,
                    scope: false,
                    template: '<div ng-transclude></div>',
                    replace: true,
                    controller: grTableController,
                    link: grTableLink
                }
        }])
        .directive('grTableExportCsv', function(){
            return {
                restrict: 'E',
                transclude: true,
                scope: false,
                template: '<a class="gr-table-export-csv" ng-mousedown="csv.generate()" ng-href="{{ csv.link() }}" download="{{csv.name ? csv.name + \'.csv\' : \'tabela.csv\'}}" ng-transclude></a>',
                replace: true
            }
        })
        .directive('grTableClearSorting', function(){
                return {
                    restrict: 'E',
                    transclude: true,
                    scope: false,
                    template: '<button class="gr-table-clear-sorting" ng-click="grTable.sorting({\'id' + GRIFFO.module + '\': \'asc\'})" ng-transclude></button>',
                    replace: true
                }
        })
        .directive('grTableClearFilter', function(){
            return {
                restrict: 'E',
                transclude: true,
                scope: false,
                template: '<button class="gr-table-clear-filter" ng-click="grTable.filter({})" ng-transclude></button>',
                replace: true
            }
        })
        .directive('grTableCount', function(){
            return {
                restrict: 'E',
                transclude: true,
                scope: false,
                template: '<div class="btn-group gr-table-count"><button ng-repeat="count in grTable.settings().counts" type="button" ng-class="{\'active\':grTable.count()==count}" ng-click="grTable.count(count)" class="btn btn-default"><span ng-bind="count"></span></button></div>',
                replace: true
            }
        })
        .directive('grTablePager', function(){
            return {
                restrict: 'E',
                transclude: true,
                scope: false,
                template: '<div class="gr-table-pager" ng-table-pagination="grTable" template-url="\'ng-table/pager-nav.html\'"></div>',
                replace: true
            }
        })
        .run(['$templateCache',
            function ($templateCache) {
                var table = {
                    default: {
                        table: {
                            element: '<table ng-table="grTable" %csv% %filter% class="table table-bordered table-striped table-hover table-no-pager ng-table-responsive ng-table-resizable-columns"></table>',
                            filter: 'show-filter="%filter%"',
                            csv: 'export-csv="csv"'
                        },
                        tbody: {
                            element: '<tbody></tbody>',
                            element_group: '<tbody ng-repeat="group in $groups"><tr class="ng-table-group"><td colspan="{{$columns.length}}"><a href="" ng-click="group.$hideRows = !group.$hideRows"><span class="fa fa-fw" ng-class="{ \'fa-angle-right\': group.$hideRows, \'fa-angle-down\': !group.$hideRows }"></span><strong>{{ group.value }}</strong></a></td></tr></tbody>'
                        },
                        tr: {
                            element: '<tr ng-repeat="data in $data" %attrs%></tr>',
                            element_group: '<tr ng-hide="group.$hideRows" ng-repeat="data in group.data" %attrs%>'
                        },
                        td: {
                            element_start: '<td data-title="\'%label%\' | translate" %filter% %sortable% %other%>',
                            element_end: '</td>',
                            content: '{{data.%name% | translate}}',
                            content_no_translate: '{{data.%name%}}',
                            filter: 'filter="{ \'%name%\': \'%filter%\' }" filter-placeholder="%label%"',
                            sortable: 'sortable="\'%name%\'"'
                        }
                    }
                };
                $templateCache.put('grTable/table.html', table.default);
        }]);
})();
/*! ngTable v0.4.3 by Vitalii Savchuk(esvit666@gmail.com) - https://github.com/esvit/ng-table - New BSD License */
(function(){
    !function(a,b){"use strict";return"function"==typeof define&&define.amd?void define(["angular"],function(a){return b(a)}):b(a)}(angular||null,function(a){"use strict";var b=a.module("ngTable",[]);b.value("ngTableDefaults",{params:{},settings:{}}),b.factory("ngTableParams",["$q","$log","ngTableDefaults",function(b,c,d){var e=function(a){return!isNaN(parseFloat(a))&&isFinite(a)},f=function(f,g){var h=this,i=function(){k.debugMode&&c.debug&&c.debug.apply(this,arguments)};this.data=[],this.parameters=function(b,c){if(c=c||!1,a.isDefined(b)){for(var d in b){var f=b[d];if(c&&d.indexOf("[")>=0){for(var g=d.split(/\[(.*)\]/).reverse(),h="",k=0,l=g.length;l>k;k++){var m=g[k];if(""!==m){var n=f;f={},f[h=m]=e(n)?parseFloat(n):n}}"sorting"===h&&(j[h]={}),j[h]=a.extend(j[h]||{},f[h])}else j[d]=e(b[d])?parseFloat(b[d]):b[d]}return i("ngTable: set parameters",j),this}return j},this.settings=function(b){return a.isDefined(b)?(a.isArray(b.data)&&(b.total=b.data.length),k=a.extend(k,b),i("ngTable: set settings",k),this):k},this.page=function(b){return a.isDefined(b)?this.parameters({page:b}):j.page},this.total=function(b){return a.isDefined(b)?this.settings({total:b}):k.total},this.count=function(b){return a.isDefined(b)?this.parameters({count:b,page:1}):j.count},this.filter=function(b){return a.isDefined(b)?this.parameters({filter:b,page:1}):j.filter},this.sorting=function(b){if(2==arguments.length){var c={};return c[b]=arguments[1],this.parameters({sorting:c}),this}return a.isDefined(b)?this.parameters({sorting:b}):j.sorting},this.isSortBy=function(b,c){return a.isDefined(j.sorting[b])&&a.equals(j.sorting[b],c)},this.orderBy=function(){var a=[];for(var b in j.sorting)a.push(("asc"===j.sorting[b]?"+":"-")+b);return a},this.getData=function(b,c){return b.resolve(a.isArray(this.data)&&a.isObject(c)?this.data.slice((c.page()-1)*c.count(),c.page()*c.count()):[]),b.promise},this.getGroups=function(c,d){var e=b.defer();return e.promise.then(function(b){var e={};a.forEach(b,function(b){var c=a.isFunction(d)?d(b):b[d];e[c]=e[c]||{data:[]},e[c].value=c,e[c].data.push(b)});var f=[];for(var g in e)f.push(e[g]);i("ngTable: refresh groups",f),c.resolve(f)}),this.getData(e,h)},this.generatePagesArray=function(a,b,c){var d,e,f,g,h,i;if(d=11,i=[],h=Math.ceil(b/c),h>1){i.push({type:"prev",number:Math.max(1,a-1),active:a>1}),i.push({type:"first",number:1,active:a>1,current:1===a}),f=Math.round((d-5)/2),g=Math.max(2,a-f),e=Math.min(h-1,a+2*f-(a-g)),g=Math.max(2,g-(2*f-(e-g)));for(var j=g;e>=j;)i.push(j===g&&2!==j||j===e&&j!==h-1?{type:"more",active:!1}:{type:"page",number:j,active:a!==j,current:a===j}),j++;i.push({type:"last",number:h,active:a!==h,current:a===h}),i.push({type:"next",number:Math.min(h,a+1),active:h>a})}return i},this.url=function(b){b=b||!1;var c=b?[]:{};for(var d in j)if(j.hasOwnProperty(d)){var e=j[d],f=encodeURIComponent(d);if("object"==typeof e){for(var g in e)if(!a.isUndefined(e[g])&&""!==e[g]){var h=f+"["+encodeURIComponent(g)+"]";b?c.push(h+"="+e[g]):c[h]=e[g]}}else a.isFunction(e)||a.isUndefined(e)||""===e||(b?c.push(f+"="+encodeURIComponent(e)):c[f]=encodeURIComponent(e))}return c},this.reload=function(){var a=b.defer(),c=this,d=null;if(k.$scope)return k.$loading=!0,d=k.groupBy?k.getGroups(a,k.groupBy,this):k.getData(a,this),i("ngTable: reload data"),d||(d=a.promise),d.then(function(a){return k.$loading=!1,i("ngTable: current scope",k.$scope),k.groupBy?(c.data=a,k.$scope&&(k.$scope.$groups=a)):(c.data=a,k.$scope&&(k.$scope.$data=a)),k.$scope&&(k.$scope.pages=c.generatePagesArray(c.page(),c.total(),c.count())),k.$scope.$emit("ngTableAfterReloadData"),a})},this.reloadPages=function(){var a=this;k.$scope.pages=a.generatePagesArray(a.page(),a.total(),a.count())};var j=this.$params={page:1,count:1,filter:{},sorting:{},group:{},groupBy:null};a.extend(j,d.params);var k={$scope:null,$loading:!1,data:null,total:0,defaultSort:"desc",filterDelay:750,counts:[10,25,50,100],getGroups:this.getGroups,getData:this.getData};return a.extend(k,d.settings),this.settings(g),this.parameters(f,!0),this};return f}]);var c=["$scope","ngTableParams","$timeout",function(b,c,d){function e(){b.params.$params.page=1}var f=!0;b.$loading=!1,b.hasOwnProperty("params")||(b.params=new c,b.params.isNullInstance=!0),b.params.settings().$scope=b;var g=function(){var a=0;return function(b,c){d.cancel(a),a=d(b,c)}}();b.$watch("params.$params",function(c,d){if(c!==d){if(b.params.settings().$scope=b,a.equals(c.filter,d.filter))b.params.reload();else{var h=f?a.noop:e;g(function(){h(),b.params.reload()},b.params.settings().filterDelay)}b.params.isNullInstance||(f=!1)}},!0),b.sortBy=function(a,c){var d=b.parse(a.sortable);if(d){var e=b.params.settings().defaultSort,f="asc"===e?"desc":"asc",g=b.params.sorting()&&b.params.sorting()[d]&&b.params.sorting()[d]===e,h=c.ctrlKey||c.metaKey?b.params.sorting():{};h[d]=g?f:e,b.params.parameters({sorting:h})}}}];return b.directive("ngTable",["$compile","$q","$parse",function(b,d,e){return{restrict:"A",priority:1001,scope:!0,controller:c,compile:function(c){var d=[],f=0,g=null,h=c.find("thead");return a.forEach(a.element(c.find("tr")),function(b){b=a.element(b),b.hasClass("ng-table-group")||g||(g=b)}),g?(a.forEach(g.find("td"),function(b){var c=a.element(b);if(!c.attr("ignore-cell")||"true"!==c.attr("ignore-cell")){var g=function(a,b){return function(f){return e(c.attr("x-data-"+a)||c.attr("data-"+a)||c.attr(a))(f,{$columns:d})||b}},h=g("title"," "),i=g("header",!1),j=g("filter",!1)(),k=!1,l=!1;j&&j.$$name&&(l=j.$$name,delete j.$$name),j&&j.templateURL&&(k=j.templateURL,delete j.templateURL),c.attr("data-title-text",h()),d.push({id:f++,title:h,sortable:g("sortable",!1),"class":c.attr("x-data-header-class")||c.attr("data-header-class")||c.attr("header-class"),filter:j,filterTemplateURL:k,filterName:l,headerTemplateURL:i,filterData:c.attr("filter-data")?c.attr("filter-data"):null,show:c.attr("ng-show")?function(a){return e(c.attr("ng-show"))(a)}:function(){return!0}})}}),function(c,f,g){if(c.$loading=!1,c.$columns=d,c.$filterRow={},c.$watch(g.ngTable,function(b){a.isUndefined(b)||(c.paramsModel=e(g.ngTable),c.params=b)},!0),c.parse=function(b){return a.isDefined(b)?b(c):""},g.showFilter&&c.$parent.$watch(g.showFilter,function(a){c.show_filter=a}),g.disableFilter&&c.$parent.$watch(g.disableFilter,function(a){c.$filterRow.disabled=a}),a.forEach(d,function(b){var d;if(b.filterData)return d=e(b.filterData)(c,{$column:b}),a.isObject(d)&&a.isObject(d.promise)?(delete b.filterData,d.promise.then(function(c){a.isArray(c)||a.isFunction(c)||a.isObject(c)?a.isArray(c)&&c.unshift({title:"-",id:""}):c=[],b.data=c})):b.data=d}),!f.hasClass("ng-table")){c.templates={header:g.templateHeader?g.templateHeader:"ng-table/header.html",pagination:g.templatePagination?g.templatePagination:"ng-table/pager.html"};var i=h.length>0?h:a.element(document.createElement("thead")).attr("ng-include","templates.header"),j=a.element(document.createElement("div")).attr({"ng-table-pagination":"params","template-url":"templates.pagination"});f.find("thead").remove(),f.addClass("ng-table").prepend(i).after(j),b(i)(c),b(j)(c)}}):void 0}}}]),b.directive("ngTablePagination",["$compile",function(b){return{restrict:"A",scope:{params:"=ngTablePagination",templateUrl:"="},replace:!1,link:function(c,d){c.params.settings().$scope.$on("ngTableAfterReloadData",function(){c.pages=c.params.generatePagesArray(c.params.page(),c.params.total(),c.params.count())},!0),c.$watch("templateUrl",function(e){if(!a.isUndefined(e)){var f=a.element(document.createElement("div"));f.attr({"ng-include":"templateUrl"}),d.append(f),b(f)(c)}})}}}]),a.module("ngTable").run(["$templateCache",function(a){a.put("ng-table/filters/select-multiple.html",'<select ng-options="data.id as data.title for data in column.data" ng-disabled="$filterRow.disabled" multiple ng-multiple="true" ng-model="params.filter()[name]" ng-show="filter==\'select-multiple\'" class="filter filter-select-multiple form-control" name="{{column.filterName}}"> </select>'),a.put("ng-table/filters/select.html",'<select ng-options="data.id as data.title for data in column.data" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control" name="{{column.filterName}}"> </select>'),a.put("ng-table/filters/text.html",'<input type="text" name="{{column.filterName}}" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-if="filter==\'text\'" class="input-filter form-control"/>'),a.put("ng-table/header.html",'<tr> <th ng-repeat="column in $columns" ng-class="{ \'sortable\': parse(column.sortable), \'sort-asc\': params.sorting()[parse(column.sortable)]==\'asc\', \'sort-desc\': params.sorting()[parse(column.sortable)]==\'desc\' }" ng-click="sortBy(column, $event)" ng-show="column.show(this)" ng-init="template=column.headerTemplateURL(this)" class="header {{column.class}}"> <div ng-if="!template" ng-show="!template" ng-bind="parse(column.title)"></div> <div ng-if="template" ng-show="template" ng-include="template"></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th ng-repeat="column in $columns" ng-show="column.show(this)" class="filter"> <div ng-repeat="(name, filter) in column.filter"> <div ng-if="column.filterTemplateURL" ng-show="column.filterTemplateURL"> <div ng-include="column.filterTemplateURL"></div> </div> <div ng-if="!column.filterTemplateURL" ng-show="!column.filterTemplateURL"> <div ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </div> </th> </tr> '),a.put("ng-table/pager.html",'<div class="ng-cloak ng-table-pager"> <div ng-if="params.settings().counts.length" class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default"> <span ng-bind="count"></span> </button> </div> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div> ')}]),b});
})();
/*! ngTableExport v0.1.0 by Vitalii Savchuk(esvit666@gmail.com) - https://github.com/esvit/ng-table-export - New BSD License */
(function(){
    angular.module("ngTableExport",[]).config(["$compileProvider",function(a){a.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/)}]).directive("exportCsv",["$parse",function(a){return{restrict:"A",scope:!1,link:function(b,c,d){var e="",f={stringify:function(a){return'"'+a.replace(/^\s\s*/,"").replace(/\s*\s$/,"").replace(/"/g,'""')+'"'},generate:function(){e="";var a=c.find("tr");angular.forEach(a,function(a,b){var c=angular.element(a),d=c.find("th"),g="";c.hasClass("ng-table-filters")||(0==d.length&&(d=c.find("td")),1!=b&&(angular.forEach(d,function(a){g+=f.stringify(angular.element(a).text())+";"}),g=g.slice(0,g.length-1)),e+=g+"\n")})},link:function(){return"data:text/csv;charset=UTF-8,"+encodeURIComponent(e)}};a(d.exportCsv).assign(b.$parent,f)}}}]);
})();