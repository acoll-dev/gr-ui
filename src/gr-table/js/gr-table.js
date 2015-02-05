'use strict';
(function(){
    angular.module('gr-table', ['ngTable', 'ngTableExport', 'grRestful', 'grModal'])
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
