'use strict';

(function(){
    angular.module('gr.ui.table', ['gr.ui.table.config', 'ngTable', 'ngTableExport'])
        .directive('grTable', ['ngTableParams', '$grAlert', '$compile', '$parse', '$injector', '$filter', '$http', '$window', '$timeout', function(ngTableParams, ALERT, $compile, $parse, $injector, $filter, $http, $window, $timeout){
            var init = function init($scope, $element, $attrs){
                var defaultSorting = {},
                    getData = function(src) {
                        var alert = ALERT.new();
                        $http.get(src).success(function(r){
                            if(r.response){
                                var response = r.response;
                                $scope.grTable.dataSet = response;
                            }else{
                                console.debug(r);
                            }
                        }).error(function(e){
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
                            getFilterData: function ($defer, params) {
                                var grFormData = $scope.grTable.dataSet,
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
                                var data = $scope.grTable.dataSet;
                                if (data) {
                                    var filteredData = $filter('filter')(data, params.filter());
                                    var orderedData = params.filter() ? (params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData) : data,
                                        newData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                    $scope.grTable.data = newData;
                                    $scope.grTable.allData = data;
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
                                function (val, arr) {
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
                $scope.grTable = new ngTableParams(grTable.defaults, grTable.settings);
                $scope.grTable.defaults = grTable.defaults;
                $attrs.$observe('grDataSource', function(source){
                    if(source && angular.isDefined(source)){
                        var src = $parse(source)($scope);
                        if(angular.isString(src)){
                            getData(src);
                        }else if(angular.isObject(src) || angulr.isArray(src)){
                            $scope.grTable.dataSet = src;
                        }
                    }
                });
                $attrs.$observe('exportCsv', function(name){ $scope.grTable.csv = angular.copy(name); });
                $attrs.$observe('sortby', function(sort){
                    if(sort){
                        var sortArr = $parse(sort)($scope);
                        if(angular.isObject(sortArr)){
                            $scope.grTable.sorting(sortArr);
                        }
                    }
                });
                $attrs.$observe('filterby', function(filter){
                    if(filter){
                        var filterArr = $parse(filter)($scope);
                        if(angular.isObject(filterArr)){
                            $scope.grTable.filter(filterArr);
                        }
                    }
                });
                $scope.$watch('grTable.dataSet', function(){ $scope.grTable.reload(); }, true);
                setFunctions($scope, $element, $attrs);
            },
            setFunctions= function($scope, $element, $attrs){
                $scope.grTable.fn = {};
                var fns = {};
                if($injector.has('$grTable.config')){
                    fns = $injector.get('$grTable.config');//angular.extend(angular.copy(grScriptBind.get('grTable/function')), grTableConfig);
                }
                angular.forEach(fns, function(fn, key){
                    $scope.grTable.fn[key] = function(){
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
                priority: 1002,
                compile: function($element){
                    return function($scope, $element, $attrs){
                        $attrs.$set('ngTable', 'grTable');
                        $element.addClass('gr-table table table-bordered table-striped');
                        $element.removeAttr($attrs.$attr.grTable);
                        $element.append('<tr ng-if="$data.length <= 0"><td colspan="{{$columns.length}}">{{\'No data found...\' | grTranslate}}</td></tr>');
                        init($scope, $element, $attrs);
                        $compile($element)($scope);
                    }
                }
            }
        }])
        .directive('grRepeat', ['$compile', function($compile){
            return {
                priority: 1001,
                scope: false,
                compile: function($element, $attrs){
                    $element.removeAttr($attrs.$attr.grRepeat);
                    $attrs.$set('ngRepeat', $attrs.grRepeat);
                }
            }
        }])
        .directive('grTableClearSorting', function(){
                return {
                    restrict: 'E',
                    transclude: true,
                    scope: false,
                    template: '<button class="gr-table-clear-sorting" ng-click="grTable.sorting(grTable.defaults.sorting)" ng-transclude></button>',
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
        .directive('grChange', ['$parse', '$timeout', function ($parse, $timeout) {
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
        }]);
})();

(function(){
    angular.module('gr.ui.table.config', ['gr.ui.modal','gr.ui.alert']);
})();

(function(){
    angular.module('ngTable', [])
        .factory('ngTableParams', ['$q', '$log',
            function ($q, $log) {
                var isNumber = function (n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                var ngTableParams = function (baseParameters, baseSettings) {
                    var self = this,
                        log = function(){
                            if (settings.debugMode && $log.debug) {
                                $log.debug.apply(this, arguments);
                            }
                        };
                    this.data = [];
                    this.filterData = [];
                    this.parameters = function (newParameters, parseParamsFromUrl) {
                        parseParamsFromUrl = parseParamsFromUrl || false;
                        if (angular.isDefined(newParameters)) {
                            for (var key in newParameters) {
                                var value = newParameters[key];
                                if (parseParamsFromUrl && key.indexOf('[') >= 0) {
                                    var keys = key.split(/\[(.*)\]/).reverse()
                                    var lastKey = '';
                                    for (var i = 0, len = keys.length; i < len; i++) {
                                        var name = keys[i];
                                        if (name !== '') {
                                            var v = value;
                                            value = {};
                                            value[lastKey = name] = (isNumber(v) ? parseFloat(v) : v);
                                        }
                                    }
                                    if (lastKey === 'sorting') {
                                        params[lastKey] = {};
                                    }
                                    params[lastKey] = angular.extend(params[lastKey] || {}, value[lastKey]);
                                } else {
                                    params[key] = (isNumber(newParameters[key]) ? parseFloat(newParameters[key]) : newParameters[key]);
                                }
                            }
                            log('ngTable: set parameters', params);
                            return this;
                        }
                        return params;
                    };
                    this.settings = function (newSettings) {
                        if (angular.isDefined(newSettings)) {
                            if (angular.isArray(newSettings.data)) {
                                //auto-set the total from passed in data
                                newSettings.total = newSettings.data.length;
                            }
                            settings = angular.extend(settings, newSettings);
                            log('ngTable: set settings', settings);
                            return this;
                        }
                        return settings;
                    };
                    this.page = function (page) {
                        return angular.isDefined(page) ? this.parameters({
                            'page': page
                        }) : params.page;
                    };
                    this.total = function (total) {
                        return angular.isDefined(total) ? this.settings({
                            'total': total
                        }) : settings.total;
                    };
                    this.count = function (count) {
                        return angular.isDefined(count) ? this.parameters({
                            'count': count,
                            'page': 1
                        }) : params.count;
                    };
                    this.filter = function (filter) {
                        return angular.isDefined(filter) ? this.parameters({
                            'filter': filter
                        }) : params.filter;
                    };
                    this.sorting = function (sorting) {
                        if (arguments.length == 2) {
                            var sortArray = {};
                            sortArray[sorting] = arguments[1];
                            this.parameters({
                                'sorting': sortArray
                            });
                            return this;
                        }
                        return angular.isDefined(sorting) ? this.parameters({
                            'sorting': sorting
                        }) : params.sorting;
                    };
                    this.isSortBy = function (field, direction) {
                        return angular.isDefined(params.sorting[field]) && params.sorting[field] == direction;
                    };
                    this.orderBy = function(){
                        var sorting = [];
                        for (var column in params.sorting) {
                            sorting.push((params.sorting[column] === "asc" ? "+" : "-") + column);
                        }
                        return sorting;
                    };
                    this.getData = function ($defer, params) {
                        if (angular.isArray(this.data) && angular.isObject(params)) {
                            $defer.resolve(this.data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        } else {
                            $defer.resolve([]);
                        }
                    };
                    this.getFilterData = function ($defer, params) {
                        if (angular.isArray(this.filterData) && angular.isObject(params)) {
                            $defer.resolve(this.filterData);
                        } else {
                            $defer.resolve([]);
                        }
                    };
                    this.getGroups = function ($defer, column) {
                        var defer = $q.defer();
                        defer.promise.then(function (data) {
                            var groups = {};
                            angular.forEach(data, function (item) {
                                var groupName = angular.isFunction(column) ? column(item) : item[column];

                                groups[groupName] = groups[groupName] || {
                                    data: []
                                };
                                groups[groupName]['value'] = groupName;
                                groups[groupName].data.push(item);
                            });
                            var result = [];
                            for (var i in groups) {
                                result.push(groups[i]);
                            }
                            log('ngTable: refresh groups', result);
                            $defer.resolve(result);
                        });
                        this.getData(defer, self);
                    };
                    this.generatePagesArray = function (currentPage, totalItems, pageSize) {
                        var maxBlocks, maxPage, maxPivotPages, minPage, numPages, pages;
                        maxBlocks = 11;
                        pages = [];
                        numPages = Math.ceil(totalItems / pageSize);
                        if (numPages > 1) {
                            pages.push({
                                type: 'prev',
                                number: Math.max(1, currentPage - 1),
                                active: currentPage > 1
                            });
                            pages.push({
                                type: 'first',
                                number: 1,
                                active: currentPage > 1
                            });
                            maxPivotPages = Math.round((maxBlocks - 5) / 2);
                            minPage = Math.max(2, currentPage - maxPivotPages);
                            maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
                            minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
                            var i = minPage;
                            while (i <= maxPage) {
                                if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
                                    pages.push({
                                        type: 'more',
                                        active: false
                                    });
                                } else {
                                    pages.push({
                                        type: 'page',
                                        number: i,
                                        active: currentPage !== i
                                    });
                                }
                                i++;
                            }
                            pages.push({
                                type: 'last',
                                number: numPages,
                                active: currentPage !== numPages
                            });
                            pages.push({
                                type: 'next',
                                number: Math.min(numPages, currentPage + 1),
                                active: currentPage < numPages
                            });
                        }
                        return pages;
                    };
                    this.url = function (asString) {
                        asString = asString || false;
                        var pairs = (asString ? [] : {});
                        for (var key in params) {
                            if (params.hasOwnProperty(key)) {
                                var item = params[key],
                                    name = encodeURIComponent(key);
                                if (typeof item === "object") {
                                    for (var subkey in item) {
                                        if (!angular.isUndefined(item[subkey]) && item[subkey] !== "") {
                                            var pname = name + "[" + encodeURIComponent(subkey) + "]";
                                            if (asString) {
                                                pairs.push(pname + "=" + item[subkey]);
                                            } else {
                                                pairs[pname] = item[subkey];
                                            }
                                        }
                                    }
                                } else if (!angular.isFunction(item) && !angular.isUndefined(item) && item !== "") {
                                    if (asString) {
                                        pairs.push(name + "=" + encodeURIComponent(item));
                                    } else {
                                        pairs[name] = encodeURIComponent(item);
                                    }
                                }
                            }
                        }
                        return pairs;
                    };
                    this.reload = function(){
                        var $deferColumns = $q.defer();
                        var $deferData = $q.defer(),
                            self = this;
                        settings.$loading = true;
                        if (settings.groupBy) {
                            settings.getGroups($deferData, settings.groupBy, this);
                        } else {
                            settings.getData($deferData, this);
                        }
                        settings.getFilterData($deferColumns, this);
                        log('ngTable: reload data');
                        $q.all([$deferData.promise, $deferColumns.promise]).then(function (data) {
                            settings.$loading = false;
                            log('ngTable: current scope', settings.$scope);
                            if (settings.groupBy) {
                                self.data = settings.$scope.$groups = data[0];
                            } else {
                                self.data = settings.$scope.$data = data[0];
                            }
                            self.filterData = data[1];
                            settings.$scope.pages = self.generatePagesArray(self.page(), self.total(), self.count());
                            settings.$scope.$emit('ngTableAfterReloadData');
                        });
                    };
                    this.reloadPages = function(){
                        var self = this;
                        settings.$scope.pages = self.generatePagesArray(self.page(), self.total(), self.count());
                    };
                    var params = this.$params = {
                        page: 1,
                        count: 1,
                        filter: {},
                        sorting: {},
                        group: {},
                        groupBy: null
                    };
                    var settings = {
                        $scope: null,
                        $loading: false,
                        data: null,
                        total: 0,
                        defaultSort: 'desc',
                        filterDelay: 750,
                        counts: [10, 25, 50, 100],
                        getFilterData: this.getFilterData,
                        getGroups: this.getGroups,
                        getData: this.getData
                    };
                    this.settings(baseSettings);
                    this.parameters(baseParameters, true);
                    return this;
                };
                return ngTableParams;
        }])
        .directive('ngTable', ['$compile', '$q', '$parse',
            function ($compile, $q, $parse) {
                'use strict';
                return {
                    restrict: 'A',
                    priority: 1001,
                    scope: true,
                    controller: ['$scope', 'ngTableParams', '$timeout',
                        function ($scope, ngTableParams, $timeout) {

                            $scope.$loading = false;

                            if (!$scope.params) {
                                $scope.params = new ngTableParams();
                            }
                            $scope.params.settings().$scope = $scope;

                            var delayFilter = (function(){
                                var timer = 0;
                                return function (callback, ms) {
                                    $timeout.cancel(timer);
                                    timer = $timeout(callback, ms);
                                };
                            })();

                            $scope.$watch('params.$params', function (newParams, oldParams) {
                                $scope.params.settings().$scope = $scope;

                                if (!angular.equals(newParams.filter, oldParams.filter)) {
                                    delayFilter(function(){
                                        $scope.params.$params.page = 1;
                                        $scope.params.reload();
                                    }, $scope.params.settings().filterDelay);
                                } else {
                                    $scope.params.reload();
                                }
                            }, true);

                            $scope.sortBy = function (column, event) {
                                var parsedSortable = $scope.parse(column.sortable);
                                if (!parsedSortable) {
                                    return;
                                }
                                var defaultSort = $scope.params.settings().defaultSort;
                                var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
                                var sorting = $scope.params.sorting() && $scope.params.sorting()[parsedSortable] && ($scope.params.sorting()[parsedSortable] === defaultSort);
                                var sortingParams = (event.ctrlKey || event.metaKey) ? $scope.params.sorting() : {};
                                sortingParams[parsedSortable] = (sorting ? inverseSort : defaultSort);
                                $scope.params.parameters({
                                    sorting: sortingParams
                                });
                            };
                    }],
                    compile: function (element) {
                        var columns = [],
                            i = 0,
                            row = null,
                            filters = 0;

                        // custom header
                        var thead = element.find('thead');

                        // IE 8 fix :not(.ng-table-group) selector
                        angular.forEach(angular.element(element.find('tr')), function (tr) {
                            tr = angular.element(tr);
                            if (!tr.hasClass('ng-table-group') && !row) {
                                row = tr;
                            }
                        });
                        if (!row) {
                            return;
                        }
                        angular.forEach(row.find('td'), function (item) {
                            var el = angular.element(item);
                            if (el.attr('ignore-cell') && 'true' === el.attr('ignore-cell')) {
                                return;
                            }
                            var parsedAttribute = function (attr, defaultValue) {
                                return function (scope) {
                                    var _attr = (el.attr('x-data-' + attr) || el.attr('data-' + attr) || el.attr(attr));
//                                        _attr = _attr ? ('\'' + _attr + '\'') : '';
                                    return $parse(_attr)(scope, { $columns: columns }) || defaultValue;
                                };
                            };

                            var parsedTitle = parsedAttribute('title', ' '),
                                headerTemplateURL = parsedAttribute('header', false),
                                filter = parsedAttribute('filter', false)(),
                                filterPlaceholder = parsedAttribute('filter-placeholder', false)() || parsedTitle(),
                                filterTemplateURL = false,
                                filterName = false;

                            if (filter && filter.$$name) {
                                filterName = filter.$$name;
                                delete filter.$$name;
                            }
                            if (filter && filter.templateURL) {
                                filterTemplateURL = filter.templateURL;
                                delete filter.templateURL;
                            }

                            el.attr('data-title-text', parsedTitle()); // this used in responsive table
                            columns.push({
                                id: i++,
                                title: parsedTitle,
                                sortable: parsedAttribute('sortable', false),
                                'class': el.attr('x-data-header-class') || el.attr('data-header-class') || el.attr('header-class'),
                                filter: filter,
                                filterTemplateURL: filterTemplateURL,
                                filterName: filterName,
                                filterPlaceholder: filterPlaceholder,
                                headerTemplateURL: headerTemplateURL,
                                filterData: (el.attr("filter-data") ? el.attr("filter-data") : null),
                                show: (el.attr("ng-show") ? function (scope) {
                                    return $parse(el.attr("ng-show"))(scope);
                                } : function(){
                                    return true;
                                })
                            });
                            for(var aux in filter){ filters++; }
                        });
                        return function (scope, element, attrs) {
                            scope.$loading = false;
                            scope.$columns = columns;
                            if(filters > 0){
                                scope.show_filter = true;
                            }else{
                                scope.show_filter = false;
                            }
                            scope.$watch(attrs.ngTable, (function (params) {
                                if (angular.isUndefined(params)) {
                                    return;
                                }
                                scope.paramsModel = $parse(attrs.ngTable);
                                scope.params = params;
                            }), true);
                            scope.parse = function (text) {
                                return angular.isDefined(text) ? text(scope) : '';
                            };
//                            if (attrs.showFilter) {
//                                scope.$parent.$watch(attrs.showFilter, function (value) {
//                                    scope.show_filter = value;
//                                });
//                            }
                            if (!element.hasClass('ng-table')) {
                                scope.templates = {
                                    header: (attrs.templateHeader ? attrs.templateHeader : 'ng-table/header.html'),
                                    pagination: (attrs.templatePagination ? attrs.templatePagination : 'ng-table/pager.html')
                                };
                                var headerTemplate = thead.length > 0 ? thead : angular.element(document.createElement('thead')).attr('ng-include', 'templates.header');
                                var paginationRow = angular.element(document.createElement('tr'))
                                    .append(angular.element(document.createElement('td'))
                                        .attr({
                                            //'ng-table-pagination': 'params',
                                            'template-url': 'templates.pagination',
                                            'colspan': columns.length
                                        })),
                                    paginationTemplate = angular.element(document.createElement('tfoot')).append(paginationRow);

                                element.find('thead').remove();

                                element.addClass('ng-table')
                                    .prepend(headerTemplate)
                                    .append(paginationTemplate);

                                $compile(headerTemplate)(scope);
                                $compile(paginationTemplate)(scope);
                            }
                        };
                    }
                }
        }])
        .directive('ngTablePagination', ['$compile',
            function ($compile) {
                'use strict';
                return {
                    restrict: 'A',
                    scope: {
                        'params': '=ngTablePagination',
                        'templateUrl': '='
                    },
                    replace: false,
                    link: function (scope, element, attrs) {
                        scope.params.settings().$scope.$on('ngTableAfterReloadData', function(){
                            scope.pages = scope.params.generatePagesArray(scope.params.page(), scope.params.total(), scope.params.count());
                        }, true);
                        scope.$watch('templateUrl', function (templateUrl) {
                            if (angular.isUndefined(templateUrl)) {
                                return;
                            }
                            var template = angular.element(document.createElement('div'))
                            template.attr({
                                'ng-include': 'templateUrl'
                            });
                            element.append(template);
                            $compile(template)(scope);
                        });
                    }
                };
        }])
        .run(['$templateCache',
            function ($templateCache) {
                $templateCache.put('ng-table/filters/select-multiple.html', '<select ng-options="data.id as data.title for data in params.filterData[name]" multiple ng-multiple="true" ng-model="params.filter()[name]" ng-show="filter==\'select-multiple\'" class="filter filter-select-multiple form-control" name="{{column.filterName}}"> </select>');
                $templateCache.put('ng-table/filters/select.html', '<select ng-options="data.id as data.title for data in params.filterData[name]" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control" name="{{column.filterName}}"> </select>');
                $templateCache.put('ng-table/filters/text.html', '<input type="text" name="{{column.filterName}}" ng-model="params.filter()[name]" ng-if="filter==\'text\'" class="input-filter form-control" placeholder="{{column.filterPlaceholder | grTranslate}}"/>');
                $templateCache.put('ng-table/header.html', '<tr> <th ng-repeat="column in $columns" ng-class="{ \'sortable\': parse(column.sortable), \'sort-asc\': params.sorting()[parse(column.sortable)]==\'asc\', \'sort-desc\': params.sorting()[parse(column.sortable)]==\'desc\' }" ng-click="sortBy(column, $event)" ng-show="column.show(this)" ng-init="template=column.headerTemplateURL(this)" class="header {{column.class}}"> <div ng-if="!template" ng-show="!template" ng-bind="parse(column.title)"></div> <div ng-if="template" ng-show="template"><div ng-include="template"></div></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th ng-repeat="column in $columns" ng-show="column.show(this)" class="filter"> <div ng-repeat="(name, filter) in column.filter"> <div ng-if="column.filterTemplateURL" ng-show="column.filterTemplateURL"> <div ng-include="column.filterTemplateURL"></div> </div> <div ng-if="!column.filterTemplateURL" ng-show="!column.filterTemplateURL"> <div ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </div> </th> </tr>');
                $templateCache.put('ng-table/pager.html', '<div class="ng-cloak ng-table-pager"> <div ng-if="params.settings().counts.length" class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default"> <span ng-bind="count"></span> </button> </div> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href=""><i class="fa fa-fw fa-angle-left"></i></a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href=""><i class="fa fa-fw fa-angle-right"></i></a> </li> </ul> </div> ');
                $templateCache.put('ng-table/pager-nav.html', '<ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href=""><i class="fa fa-fw fa-angle-left"></i></a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href=""><i class="fa fa-fw fa-angle-right"></i></a> </li> </ul>');
        }]);
})();

(function(){
    angular.module('ngTableExport', [])
        .config(['$compileProvider', function ($compileProvider){
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
        }])
        .directive('grTableExportCsv', ['$parse', function(){
                return {
                    restrict: 'E',
                    scope: false,
                    transclude: true,
                    template: '<a class="gr-table-export-csv" ng-mousedown="grTable.csv.generate()" ng-href="{{grTable.csv.link()}}" download="{{grTable.csv.name + \'.csv\'}}" ng-show="grTable.csv && grTable.csv.name" ng-disabled="grTable.data.length <= 0" ng-transclude></a>',
                    replace: true,
                    link: function ($scope, $element, $attrs) {
                        var init = function init(name){
                            var data = '';
                            $scope.grTable.csv = {
                                name: name !== '' ? name : undefined,
                                stringify: function (str) {
                                    return '"' +
                                        str.replace(/^\s\s*/, '').replace(/\s*\s$/, '')
                                        .replace(/"/g, '""') +
                                        '"';
                                },
                                generate: function(){
                                    var element = angular.element('table.gr-table.ng-table[export-csv="' + name + '"]'),
                                        rows = element.find('tr').not('tfoot tr');
                                    data = '';
                                    angular.forEach(rows, function (row, i) {
                                        var tr = angular.element(row),
                                            tds = tr.find('th'),
                                            rowData = '';
                                        if (tr.hasClass('ng-table-filters')) { return; }
                                        if (tds.length == 0) { tds = tr.find('td'); }
                                        if (i != 1) {
                                            angular.forEach(tds, function (td, i) {
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
                    }
                };
        }]);
})();
