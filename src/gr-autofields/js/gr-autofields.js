'use strict';
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