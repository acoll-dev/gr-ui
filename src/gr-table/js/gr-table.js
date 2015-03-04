'use strict';
(function(){
    angular.module('gr.ui.table', ['gr.ui.table.config', 'ngTable', 'ngTableExport', 'gr.ui.alert'])
        .directive('grTable', ['ngTableParams', '$grAlert', '$q', '$compile', '$parse', '$injector', '$filter', '$http', '$window', '$timeout', function(ngTableParams, $grAlert, $q, $compile, $parse, $injector, $filter, $http, $window, $timeout){
            var init = function init($scope, $element, $attrs){
                var alert = $grAlert.new(),
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
                                var grFormData = $scope.grTable.dataSet,
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
                                var data = $scope.grTable.dataSet;
                                if(data){
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
                $scope.grTable = new ngTableParams(grTable.defaults, grTable.settings);
                $scope.grTable.defaults = grTable.defaults;
                $scope.grTable.reloadData = function(src){
                    if((!src || src === '') && dataSource !== ''){
                        getData(dataSource, true);
                    }else if(src && src !== ''){
                        getData(src, true);
                    }
                };
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
                $scope.$watch($attrs.list, function(list){ if(list){ $scope.dataSet = list; } }, true)
                $attrs.$observe('remote', function(remote){
                    if(remote){
                        $scope.dataSet = $parse(remote)($scope);
                    }
                });
                $attrs.$observe('grDataSource', function(remote){ if(remote){ $scope.dataSet = $parse(remote)($scope); } });
                $scope.$watch('dataSet', function(data){
                    if(data){
                        if(angular.isString(data)){
                            dataSource = data;
                            getData(dataSource);
                        }else if(angular.isObject(data) || angular.isArray(data)){
                            $scope.grTable.dataSet = data;
                            $scope.grTable.reload();
                        }
                    };
                }, true);
                setFunctions($scope, $element, $attrs);
                $scope.$parent[$attrs.name || 'grTable'] = $scope.grTable;
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
                scope: true,
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
        }]);
}());
(function(){
    angular.module('gr.ui.table.config', ['gr.ui.modal','gr.ui.alert']);
}());