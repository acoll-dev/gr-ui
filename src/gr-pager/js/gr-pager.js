'use strict';
(function(){
    angular.module('gr.ui.pager', []).directive('grPager', ['$rootScope', '$templateCache', '$compile', '$window', '$location', '$timeout', function($rootScope, $templateCache, $compile, $window, $location, $timeout){
        return {
            restrict: 'AE',
            template: '<div class="pagination-wrapper" ng-show="src.length > perPage"></div>',
            scope: {
                src: '=',
                dest: '=',
                perPage: '='
            },
            replace: true,
            link: function($scope, $element, $attrs){
                $scope.$watch('src', filterPages);
                $scope.$watch('perPage', filterPages);
                $scope.boundary = function(){
                    return $rootScope.GRIFFO.viewPort.width > 768 ? true : false;
                }
                $scope.$watch('current', function(cur){
                    if(cur && ($scope.src.length > parseInt($scope.perPage))){
                        $location.path(cur);
                    }
                    filterPages();
                });
                function filterPages(){
                    if($scope.src.length > 0 && parseInt($scope.perPage) > 0){
                        $timeout(function(){
                            var begin = (($scope.current - 1) * parseInt($scope.perPage)),
                                end = begin + parseInt($scope.perPage);
                            $scope.dest = $scope.src.slice(begin, end);
                            angular.element($window).trigger('resize');
                            $rootScope.$apply();
                        });
                    }
                };
                $timeout(function(){
                    var pager = angular.element($templateCache.get('gr-pager/pager.html'));
                    $compile(pager)($scope);
                    $timeout(function(){
                        $scope.current = parseInt($location.path().replace('/','')) || 1;
                        if($scope.current === 1){
                            $location.path(1);
                        }
                    });
                    $element.append(pager);
                });
            }
        }
    }]).run(['$templateCache', function($templateCache){
        $templateCache.put('gr-pager/pager.html', [
            '<div class="pagination-inner">',
                '<pagination total-items="src.length" num-pages="total" items-per-page="perPage || 6" max-size="3" ng-model="current" boundary-links="boundary()" rotate="false" first-text="<<" last-text=">>" next-text=">" previous-text="<"></pagination>',
            '</div>'
        ].join(''));
    }]);
}());