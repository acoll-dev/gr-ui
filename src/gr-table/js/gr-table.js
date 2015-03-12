'use strict';

(function(){
    angular.module('gr.ui.table', ['gr.ui.table.config', 'ngTable', 'ngTableExport', 'gr.ui.alert'])
        .directive('grTable', ['ngTableParams', '$grAlert', '$q', '$compile', '$parse', '$injector', '$filter', '$http', '$window', '$timeout', function(ngTableParams, $grAlert, $q, $compile, $parse, $injector, $filter, $http, $window, $timeout){
            var init = function init($scope, $element, $attrs){
                var $name = $attrs.name || 'grTable',
                    alert = $grAlert.new(),
                    defaultSorting = {},
                    dataSource = '',
                    getData = function(src, reload){
                        if(!reload){
                            alert.show('loading', ['Loading table data...'], 0);
                        }else{
                            alert.show('loading', ['Reloading table data...'], 0);
                        }
                        $http.get(src).then(function(r){
                            if(r.status === 200 && r.data.response){
                                $scope.grTable.dataSet = r.data.response;
                                $scope.grTable.reload();
                                if(!reload){
                                    alert.hide();
                                }else{
                                    alert.show('success', ['Table data is reloaded!'], 2000);
                                }
                            }else{
                                console.debug(r);
                                alert.show('danger', ['A error occurred when reloading table data, please, try reload page!']);
                            }
                        }, function(e){
                            var title = angular.element(angular.element(e.data)[0]).text(),
                                content = angular.element(angular.element(e.data)[3]).text();
                            alert.show(e.status, title + ' - ' + content, 'md');
                        });
                    },
                    grTable = {
                        data: [],
                        dataSet: [],
                        dataSource: '',
                        defaults: {
                            page: 1,
                            count: 10,
                            sorting: $attrs.sortby ? $parse($attrs.sortby)($scope) : defaultSorting
                        },
                        settings: {
                            $scope: $scope,
                            orderBy: '',
                            counts: [5, 10, 25, 50, 100],
                            getFilterData: function($defer, params){
                                var grFormData = $scope[$name].dataSet,
                                    arr = [],
                                    data = [];
                                angular.forEach(grFormData, function(item, id){
                                    angular.forEach(item, function(_item, _id){
                                        if(!arr[_id]){
                                            arr[_id] = [];
                                            arr.length++;
                                        }
                                        if(!data[_id]){
                                            data[_id] = [];
                                            data.length++;
                                        }
                                        if(inArray(_item, arr[_id]) === -1){
                                            arr[_id].push(_item);
                                            data[_id].push({
                                                'id': _item,
                                                'title': _item
                                            });
                                            if(data[_id][0].title !== '-'){
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
                            getData: function($defer, params){
                                var data = $scope[$name].dataSet;
                                if(data){
                                    var filteredData = $filter('filter')(data, params.filter());
                                    var orderedData = params.filter() ? (params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData) : data,
                                        newData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                    $scope[$name].data = newData;
                                    $scope[$name].allData = data;
                                    var aux = false;
                                    angular.forEach(newData[0], function(el, id){
                                        if(!aux){
                                            defaultSorting[id] = 'asc';
                                            aux = true;
                                        }
                                    });
                                    params.total(data.length);
                                    $defer.resolve(newData);
                                    $timeout(function(){
                                        angular.element($window).trigger('resize');
                                    });
                                }
                            }
                        }
                    },
                    grTableConfig,
                    inArray = Array.prototype.indexOf ?
                                function(val, arr){
                                    return arr.indexOf(val);
                                } : function(val, arr){
                                    var i = arr.length;
                                    while (i--){
                                        if(arr[i] === val){
                                            return i;
                                        }
                                    }
                                    return -1;
                                };
                if($scope.$parent.modal && $scope.$parent.modal.element){
                    alert.destroy();
                    alert = $grAlert.new($scope.$parent.modal.element);
                }
                $scope[$name] = new ngTableParams(grTable.defaults, grTable.settings);
                $scope[$name].defaults = grTable.defaults;
                $scope[$name].reloadData = function(src){
                    if((!src || src === '') && dataSource !== ''){
                        getData(dataSource, true);
                    }else if(src && src !== ''){
                        getData(src, true);
                    }
                };
                $attrs.$observe('exportCsv', function(name){ $scope[$name].csv = angular.copy(name); });
                $attrs.$observe('sortby', function(sort){
                    if(sort){
                        var sortArr = $parse(sort)($scope);
                        if(angular.isObject(sortArr)){
                            $scope[$name].sorting(sortArr);
                        }
                    }
                });
                $attrs.$observe('filterby', function(filter){
                    if(filter){
                        var filterArr = $parse(filter)($scope);
                        if(angular.isObject(filterArr)){
                            $scope[$name].filter(filterArr);
                        }
                    }
                });
                $attrs.$observe('remote', function(remote){
                    if(remote){
                        $scope.dataSet = $parse(remote)($scope);
                    }
                });
                $attrs.$observe('grDataSource', function(remote){ if(remote){ $scope.dataSet = $parse(remote)($scope); } });
                $attrs.$observe('shareParent', function(share){
                    if(share){
                        $scope.$parent[$name] = $scope[$name];
                    }
                });
                $scope.$watch($attrs.list, function(list){
                    if(list){
                        $scope.dataSet = list;
                    }
                }, true);
                $scope.$watch('dataSet', function(data){
                    if(data){
                        if(angular.isString(data)){
                            dataSource = data;
                            getData(dataSource);
                        }else if(angular.isObject(data) || angular.isArray(data)){
                            $scope[$name].dataSet = data;
                            $scope[$name].reload();
                        }
                    };
                }, true);
                setFunctions($scope, $element, $attrs);
                $compile($element)($scope);
            },
            setFunctions= function($scope, $element, $attrs){
                var $name = $attrs.name || 'grTable',
                    fns = {};
                $scope[$name].fn = {};
                if($injector.has('$grTable.config')){
                    fns = $injector.get('$grTable.config');//angular.extend(angular.copy(grScriptBind.get('grTable/function')), grTableConfig);
                }
                angular.forEach(fns, function(fn, key){
                    $scope[$name].fn[key] = function(){
                        var injector, i = [], _fn = fn($scope);
                        if(_fn.inject){ injector = angular.injector(_fn.inject); }else{ injector = $injector; }
                        if(angular.isArray(_fn.fn)){
                            var f = _fn.fn.pop();
                            angular.forEach(_fn.fn, function(o, key){
                                i.push(injector.get(o));
                            });
                            angular.forEach(arguments, function(arg){ i.push(arg); });
                            f.apply(null, i);
                        }else{
                            i.push(arguments[0]);
                            _fn.fn.apply(null, i);
                        }
                    }
                });
            };
            return {
                restrict: 'A',
                scope: false,
                transclude: 'element',
                template: '<div class="gr-table-wrapper table-responsive" />',
                replace: true,
                compile: function($tElement, $tAttrs, $transclude){
                    $tElement.removeAttr('gr-table');
                    return {
                        pre: function($scope, $element, $attrs){
                            $transclude($scope, function(clone){
                                var table = angular.element('<table ng-table="' + ($attrs.name || 'grTable') + '" class="gr-table table table-bordered table-striped" />'),
                                    tbody;
                                tbody = clone.html();
                                table.append(tbody).find('tbody').append('<tr ng-if="$data.length <= 0"><td colspan="{{$columns.length}}">{{\'No data found...\' | grTranslate}}</td></tr>');
                                var repeater = table.find('[gr-repeat]');
                                if(repeater){
                                    var rAttr = repeater.attr('gr-repeat');
                                    repeater.removeAttr('gr-repeat').attr('ng-repeat', rAttr);
                                }
                                if(table.find('[filter]').length > 0){
                                    table.attr('show-filter', true);
                                }
                                if(table.find('tfoot').length <= 0){
                                    var colLength = table.find('tbody').eq(0).find('tr').eq(0).find('td').length;
                                    console.debug();
                                    table.append('<tfoot><tr><td colspan="' + colLength + '"/></tr></tfoot>');
                                }
                                $element.empty();
                                $element.html(table);
                                init($scope, table, $attrs);
                            });
                        }
                    }
                }
            }
        }])
        .directive('grTableClearSorting', function(){
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    for: '='
                },
                template: '<button class="gr-table-clear-sorting" ng-click="grTable.sorting(grTable.defaults.sorting)" ng-transclude></button>',
                replace: true,
                compile: function($element){
                    return function($scope, $element, $attrs){
                        $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                        $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                    }
                }
            }
        })
        .directive('grTableClearFilter', function(){
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    for: '='
                },
                template: '<button class="gr-table-clear-filter" ng-click="grTable.filter({})" ng-transclude></button>',
                replace: true,
                compile: function($element){
                    return function($scope, $element, $attrs){
                        $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                        $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                    }
                }
            }
        })
        .directive('grTableCount', function(){
            return {
                restrict: 'E',
                scope: {
                    for: '='
                },
                template: '<div class="btn-group gr-table-count"><button ng-repeat="count in grTable.settings().counts" type="button" ng-class="{\'active\':grTable.count()==count}" ng-click="grTable.count(count)" class="btn btn-default"><span ng-bind="count"></span></button></div>',
                replace: true,
                compile: function($element){
                    return function($scope, $element, $attrs){
                        $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                        $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                    }
                }
            }
        })
        .directive('grTablePager', ['$compile', '$timeout', function($compile, $timeout){
            return {
                restrict: 'E',
                scope: {
                    for: '='
                },
                template: '<div class="ng-cloak gr-table-pager"></div> ',
                replace: true,
                link: function($scope, $element, $attrs){
                    $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                    $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                    $scope.$watch('grTable', function(grTable){
                        if(grTable){
                            $timeout(function(){
                                $element.attr({
                                    'ng-table-pagination': 'grTable',
                                    'template-url': '\'gr-table/pager.html\''
                                });
                                $compile($element)($scope);
                            });
                        }
                    });
                }
            }
        }])
        .directive('grTableExportCsv', ['$parse', function(){
                return {
                    restrict: 'E',
                    scope: {
                        for: '='
                    },
                    transclude: true,
                    template: '<a class="gr-table-export-csv" ng-mousedown="grTable.csv.generate()" ng-href="{{grTable.csv.link()}}" download="{{grTable.csv.name + \'.csv\'}}" ng-show="grTable.csv && grTable.csv.name" ng-disabled="grTable.data.length <= 0" ng-transclude></a>',
                    replace: true,
                    link: function($scope, $element, $attrs){
                        var init = function init(name){
                            var data = '';
                            $scope.grTable.csv = {
                                name: name !== '' ? name : undefined,
                                stringify: function(str){
                                    return '"' +
                                        str.replace(/^\s\s*/, '').replace(/\s*\s$/, '')
                                        .replace(/"/g, '""') +
                                        '"';
                                },
                                generate: function(){
                                    var element = angular.element('table.gr-table.ng-table[export-csv="' + name + '"]'),
                                        rows = element.find('tr').not('tfoot tr');
                                    data = '';
                                    angular.forEach(rows, function(row, i){
                                        var tr = angular.element(row),
                                            tds = tr.find('th'),
                                            rowData = '';
                                        if(tr.hasClass('ng-table-filters')){ return; }
                                        if(tds.length == 0){ tds = tr.find('td'); }
                                        if(i != 1){
                                            angular.forEach(tds, function(td, i){
                                                rowData += $scope.grTable.csv.stringify(angular.element(td).text()) + ';';
                                            });
                                            rowData = rowData.slice(0, rowData.length - 1);
                                        }
                                        data += rowData + "\n";
                                    });
                                },
                                link: function(){
                                    return 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
                                }
                            };
                        };
                        $scope.$watch('grTable.csv', function(csv){ if(csv && csv !== '' && !angular.isObject(csv)){ init(csv); } }, true);
                        $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                        $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                    }
                };
        }])
        .directive('grChange', ['$parse', '$timeout', function($parse, $timeout){
            return {
                restrict: 'A',
                scope: false,
                require: 'ngModel',
                link: function($scope, $element, $attrs, $controller){
                    var firstTime = true;
                    $scope.$watch(function(){
                        return $controller.$viewValue;
                    }, function(newValue){
                        if(!firstTime){
                            $timeout(function(){
                                $scope.$apply($attrs.grChange);
                            });
                        }else{
                            firstTime = false;
                        }
                    });
                }
            }
        }])
        .run(['$templateCache', function ($templateCache) {
            $templateCache.put('gr-table/pager.html', '<div class="ng-cloak ng-table-pager" ng-if="params.data.length"> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div> ');
            $templateCache.put('ng-table/pager.html', '');
        }]);
}());
(function(){
    angular.module('gr.ui.table.config', ['gr.ui.modal','gr.ui.alert']);
}());

/** gr-table dependencies **/

(function(){
    (function(){
        /*! ngTable v0.5.3 by Vitalii Savchuk(esvit666@gmail.com) - https://github.com/esvit/ng-table - New BSD License */
        !function(a,b){"use strict";return"function"==typeof define&&define.amd?void define(["angular"],function(a){return b(a)}):b(a)}(angular||null,function(a){"use strict";var b=a.module("ngTable",[]);return b.value("ngTableDefaults",{params:{},settings:{}}),b.factory("NgTableParams",["$q","$log","ngTableDefaults",function(b,c,d){var e=function(a){return!isNaN(parseFloat(a))&&isFinite(a)},f=function(f,g){var h=this,i=function(){k.debugMode&&c.debug&&c.debug.apply(this,arguments)};this.data=[],this.parameters=function(b,c){if(c=c||!1,a.isDefined(b)){for(var d in b){var f=b[d];if(c&&d.indexOf("[")>=0){for(var g=d.split(/\[(.*)\]/).reverse(),h="",k=0,l=g.length;l>k;k++){var m=g[k];if(""!==m){var n=f;f={},f[h=m]=e(n)?parseFloat(n):n}}"sorting"===h&&(j[h]={}),j[h]=a.extend(j[h]||{},f[h])}else j[d]=e(b[d])?parseFloat(b[d]):b[d]}return i("ngTable: set parameters",j),this}return j},this.settings=function(b){return a.isDefined(b)?(a.isArray(b.data)&&(b.total=b.data.length),k=a.extend(k,b),i("ngTable: set settings",k),this):k},this.page=function(b){return a.isDefined(b)?this.parameters({page:b}):j.page},this.total=function(b){return a.isDefined(b)?this.settings({total:b}):k.total},this.count=function(b){return a.isDefined(b)?this.parameters({count:b,page:1}):j.count},this.filter=function(b){return a.isDefined(b)?this.parameters({filter:b,page:1}):j.filter},this.sorting=function(b){if(2==arguments.length){var c={};return c[b]=arguments[1],this.parameters({sorting:c}),this}return a.isDefined(b)?this.parameters({sorting:b}):j.sorting},this.isSortBy=function(b,c){return a.isDefined(j.sorting[b])&&a.equals(j.sorting[b],c)},this.orderBy=function(){var a=[];for(var b in j.sorting)a.push(("asc"===j.sorting[b]?"+":"-")+b);return a},this.getData=function(b,c){return b.resolve(a.isArray(this.data)&&a.isObject(c)?this.data.slice((c.page()-1)*c.count(),c.page()*c.count()):[]),b.promise},this.getGroups=function(c,d){var e=b.defer();return e.promise.then(function(b){var e={};a.forEach(b,function(b){var c=a.isFunction(d)?d(b):b[d];e[c]=e[c]||{data:[]},e[c].value=c,e[c].data.push(b)});var f=[];for(var g in e)f.push(e[g]);i("ngTable: refresh groups",f),c.resolve(f)}),this.getData(e,h)},this.generatePagesArray=function(a,b,c){var d,e,f,g,h,i;if(d=11,i=[],h=Math.ceil(b/c),h>1){i.push({type:"prev",number:Math.max(1,a-1),active:a>1}),i.push({type:"first",number:1,active:a>1,current:1===a}),f=Math.round((d-5)/2),g=Math.max(2,a-f),e=Math.min(h-1,a+2*f-(a-g)),g=Math.max(2,g-(2*f-(e-g)));for(var j=g;e>=j;)i.push(j===g&&2!==j||j===e&&j!==h-1?{type:"more",active:!1}:{type:"page",number:j,active:a!==j,current:a===j}),j++;i.push({type:"last",number:h,active:a!==h,current:a===h}),i.push({type:"next",number:Math.min(h,a+1),active:h>a})}return i},this.url=function(b){b=b||!1;var c=b?[]:{};for(var d in j)if(j.hasOwnProperty(d)){var e=j[d],f=encodeURIComponent(d);if("object"==typeof e){for(var g in e)if(!a.isUndefined(e[g])&&""!==e[g]){var h=f+"["+encodeURIComponent(g)+"]";b?c.push(h+"="+e[g]):c[h]=e[g]}}else a.isFunction(e)||a.isUndefined(e)||""===e||(b?c.push(f+"="+encodeURIComponent(e)):c[f]=encodeURIComponent(e))}return c},this.reload=function(){var a=b.defer(),c=this,d=null;if(k.$scope)return k.$loading=!0,d=k.groupBy?k.getGroups(a,k.groupBy,this):k.getData(a,this),i("ngTable: reload data"),d||(d=a.promise),d.then(function(a){return k.$loading=!1,i("ngTable: current scope",k.$scope),k.groupBy?(c.data=a,k.$scope&&(k.$scope.$groups=a)):(c.data=a,k.$scope&&(k.$scope.$data=a)),k.$scope&&(k.$scope.pages=c.generatePagesArray(c.page(),c.total(),c.count())),k.$scope.$emit("ngTableAfterReloadData"),a})},this.reloadPages=function(){var a=this;k.$scope.pages=a.generatePagesArray(a.page(),a.total(),a.count())};var j=this.$params={page:1,count:1,filter:{},sorting:{},group:{},groupBy:null};a.extend(j,d.params);var k={$scope:null,$loading:!1,data:null,total:0,defaultSort:"desc",filterDelay:750,counts:[10,25,50,100],sortingIndicator:"span",getGroups:this.getGroups,getData:this.getData};return a.extend(k,d.settings),this.settings(g),this.parameters(f,!0),this};return f}]),b.factory("ngTableParams",["NgTableParams",function(a){return a}]),b.controller("ngTableController",["$scope","NgTableParams","$timeout","$parse","$compile","$attrs","$element","ngTableColumn",function(b,c,d,e,f,g,h,i){function j(){b.params.$params.page=1}var k=!0;b.$filterRow={},b.$loading=!1,b.hasOwnProperty("params")||(b.params=new c,b.params.isNullInstance=!0),b.params.settings().$scope=b;var l=function(){var a=0;return function(b,c){d.cancel(a),a=d(b,c)}}();b.$watch("params.$params",function(c,d){if(c!==d){if(b.params.settings().$scope=b,a.equals(c.filter,d.filter))b.params.reload();else{var e=k?a.noop:j;l(function(){e(),b.params.reload()},b.params.settings().filterDelay)}b.params.isNullInstance||(k=!1)}},!0),this.compileDirectiveTemplates=function(){if(!h.hasClass("ng-table")){b.templates={header:g.templateHeader?g.templateHeader:"ng-table/header.html",pagination:g.templatePagination?g.templatePagination:"ng-table/pager.html"},h.addClass("ng-table");var c=null;0===h.find("> thead").length&&(c=a.element(document.createElement("thead")).attr("ng-include","templates.header"),h.prepend(c));var d=a.element(document.createElement("div")).attr({"ng-table-pagination":"params","template-url":"templates.pagination"});h.after(d),c&&f(c)(b),f(d)(b)}},this.loadFilterData=function(c){a.forEach(c,function(c){var d;return d=c.filterData(b,{$column:c}),d?a.isObject(d)&&a.isObject(d.promise)?(delete c.filterData,d.promise.then(function(b){a.isArray(b)||a.isFunction(b)||a.isObject(b)?a.isArray(b)&&b.unshift({title:"-",id:""}):b=[],c.data=b})):c.data=d:void delete c.filterData})},this.buildColumns=function(a){return a.map(function(a){return i.buildColumn(a,b)})},this.setupBindingsToInternalScope=function(c){var d=e(c);b.$watch(d,function(c){a.isUndefined(c)||(b.paramsModel=d,b.params=c)},!1),g.showFilter&&b.$parent.$watch(g.showFilter,function(a){b.show_filter=a}),g.disableFilter&&b.$parent.$watch(g.disableFilter,function(a){b.$filterRow.disabled=a})},b.sortBy=function(a,c){var d=a.sortable&&a.sortable();if(d){var e=b.params.settings().defaultSort,f="asc"===e?"desc":"asc",g=b.params.sorting()&&b.params.sorting()[d]&&b.params.sorting()[d]===e,h=c.ctrlKey||c.metaKey?b.params.sorting():{};h[d]=g?f:e,b.params.parameters({sorting:h})}}}]),b.factory("ngTableColumn",[function(){function b(b,d){var e=Object.create(b);for(var f in c)void 0===e[f]&&(e[f]=c[f]),a.isFunction(e[f])||!function(a){e[a]=function(){return b[a]}}(f),function(a){var c=e[a];e[a]=function(){return 0===arguments.length?c.call(b,d):c.apply(b,arguments)}}(f);return e}var c={"class":function(){return""},filter:function(){return!1},filterData:a.noop,headerTemplateURL:function(){return!1},headerTitle:function(){return" "},sortable:function(){return!1},show:function(){return!0},title:function(){return" "},titleAlt:function(){return""}};return{buildColumn:b}}]),b.directive("ngTable",["$q","$parse",function(b,c){return{restrict:"A",priority:1001,scope:!0,controller:"ngTableController",compile:function(b){var d=[],e=0,f=null;return a.forEach(a.element(b.find("tr")),function(b){b=a.element(b),b.hasClass("ng-table-group")||f||(f=b)}),f?(a.forEach(f.find("td"),function(b){var f=a.element(b);if(!f.attr("ignore-cell")||"true"!==f.attr("ignore-cell")){var g=function(a){return f.attr("x-data-"+a)||f.attr("data-"+a)||f.attr(a)},h=function(b){var e=g(b);return e?function(b,f){return c(e)(b,a.extend(f||{},{$columns:d}))}:void 0},i=g("title-alt")||g("title");i&&f.attr("data-title-text","{{"+i+"}}"),d.push({id:e++,title:h("title"),titleAlt:h("title-alt"),headerTitle:h("header-title"),sortable:h("sortable"),"class":h("header-class"),filter:h("filter"),headerTemplateURL:h("header"),filterData:h("filter-data"),show:f.attr("ng-show")?function(a){return c(f.attr("ng-show"))(a)}:void 0})}}),function(a,b,c,e){a.$columns=d=e.buildColumns(d),e.setupBindingsToInternalScope(c.ngTable),e.loadFilterData(d),e.compileDirectiveTemplates()}):void 0}}}]),b.directive("ngTableDynamic",["$parse",function(b){function c(a){if(!a||a.indexOf(" with ")>-1){var b=a.split(/\s+with\s+/);return{tableParams:b[0],columns:b[1]}}throw new Error("Parse error (expected example: ng-table-dynamic='tableParams with cols')")}return{restrict:"A",priority:1001,scope:!0,controller:"ngTableController",compile:function(d){var e;return a.forEach(a.element(d.find("tr")),function(b){b=a.element(b),b.hasClass("ng-table-group")||e||(e=b)}),e?(a.forEach(e.find("td"),function(b){var c=a.element(b),d=function(a){return c.attr("x-data-"+a)||c.attr("data-"+a)||c.attr(a)},e=d("title");e||c.attr("data-title-text","{{$columns[$index].titleAlt(this) || $columns[$index].title(this)}}");var f=c.attr("ng-show");f||c.attr("ng-show","$columns[$index].show(this)")}),function(a,d,e,f){var g=c(e.ngTableDynamic),h=b(g.columns)(a)||[];a.$columns=f.buildColumns(h),f.setupBindingsToInternalScope(g.tableParams),f.loadFilterData(a.$columns),f.compileDirectiveTemplates()}):void 0}}}]),b.directive("ngTablePagination",["$compile",function(b){return{restrict:"A",scope:{params:"=ngTablePagination",templateUrl:"="},replace:!1,link:function(c,d){c.params.settings().$scope.$on("ngTableAfterReloadData",function(){c.pages=c.params.generatePagesArray(c.params.page(),c.params.total(),c.params.count())},!0),c.$watch("templateUrl",function(e){if(!a.isUndefined(e)){var f=a.element(document.createElement("div"));f.attr({"ng-include":"templateUrl"}),d.append(f),b(f)(c)}})}}}]),a.module("ngTable").run(["$templateCache",function(a){a.put("ng-table/filters/select-multiple.html",'<select ng-options="data.id as data.title for data in $column.data" ng-disabled="$filterRow.disabled" multiple ng-multiple="true" ng-model="params.filter()[name]" ng-show="filter==\'select-multiple\'" class="filter filter-select-multiple form-control" name="{{name}}"> </select>'),a.put("ng-table/filters/select.html",'<select ng-options="data.id as data.title for data in $column.data" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control" name="{{name}}"> </select>'),a.put("ng-table/filters/text.html",'<input type="text" name="{{name}}" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-if="filter==\'text\'" class="input-filter form-control"/>'),a.put("ng-table/header.html",'<tr> <th title="{{$column.headerTitle(this)}}" ng-repeat="$column in $columns" ng-class="{ \'sortable\': $column.sortable(this), \'sort-asc\': params.sorting()[$column.sortable(this)]==\'asc\', \'sort-desc\': params.sorting()[$column.sortable(this)]==\'desc\' }" ng-click="sortBy($column, $event)" ng-show="$column.show(this)" ng-init="template=$column.headerTemplateURL(this)" class="header {{$column.class(this)}}"> <div ng-if="!template" ng-show="!template" class="ng-table-header" ng-class="{\'sort-indicator\': params.settings().sortingIndicator==\'div\'}"> <span ng-bind="$column.title(this)" ng-class="{\'sort-indicator\': params.settings().sortingIndicator==\'span\'}"></span> </div> <div ng-if="template" ng-show="template" ng-include="template"></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th data-title-text="{{$column.titleAlt(this) || $column.title(this)}}" ng-repeat="$column in $columns" ng-show="$column.show(this)" class="filter"> <div ng-repeat="(name, filter) in $column.filter(this)"> <div ng-if="filter.indexOf(\'/\') !==-1" ng-include="filter"></div> <div ng-if="filter.indexOf(\'/\')===-1" ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </th> </tr> '),a.put("ng-table/pager.html",'<div class="ng-cloak ng-table-pager" ng-if="params.data.length"> <div ng-if="params.settings().counts.length" class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default"> <span ng-bind="count"></span> </button> </div> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div> ')}]),b});
    }());
    (function(){
        /*! ngTableExport v0.1.0 by Vitalii Savchuk(esvit666@gmail.com) - https://github.com/esvit/ng-table-export - New BSD License */
        angular.module("ngTableExport",[]).config(["$compileProvider",function(a){a.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/)}]).directive("exportCsv",["$parse",function(a){return{restrict:"A",scope:!1,link:function(b,c,d){var e="",f={stringify:function(a){return'"'+a.replace(/^\s\s*/,"").replace(/\s*\s$/,"").replace(/"/g,'""')+'"'},generate:function(){e="";var a=c.find("tr");angular.forEach(a,function(a,b){var c=angular.element(a),d=c.find("th"),g="";c.hasClass("ng-table-filters")||(0==d.length&&(d=c.find("td")),1!=b&&(angular.forEach(d,function(a){g+=f.stringify(angular.element(a).text())+";"}),g=g.slice(0,g.length-1)),e+=g+"\n")})},link:function(){return"data:text/csv;charset=UTF-8,"+encodeURIComponent(e)}};a(d.exportCsv).assign(b.$parent,f)}}}]);
    }());
}());