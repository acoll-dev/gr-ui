'use strict';
(function(){
    angular.module('gr.ui.affix', []).directive('grAffix', ['$rootScope','$window', function ($rootScope, $window) {
        function viewPort(){
            var w = $window,
                d = $window.document,
                viewPort = {
                    width: 0,
                    height: 0
                },
                setBs = function(){
                    if(viewPort.width < 768){ viewPort.bs = 'xs'; }
                    if(viewPort.width >= 768){ viewPort.bs = 'sm'; }
                    if(viewPort.width >= 990){ viewPort.bs = 'md'; }
                    if(viewPort.width >= 1200){ viewPort.bs = 'lg'; };
                };
            if (w.innerWidth != null){
                viewPort.width = w.innerWidth;
                viewPort.height = w.innerHeight;
                setBs();
            }else if (document.compatMode == "CSS1Compat"){
                viewPort.width =  d.documentElement.clientWidth;
                viewPort.height = d.documentElement.clientHeight;
                setBs();
                return viewPort;
            }else{
                viewPort.width = d.body.clientWidth;
                viewPort.height = d.body.clientHeight;
                setBs();
            }
            viewPort.offset = {};
            viewPort.offset.top = $window.pageYOffset - $window.document.documentElement.clientTop;
            viewPort.offset.left = $window.pageXOffset - $window.document.documentElement.clientLeft;
            return viewPort;
        };
        return {
            restrict: 'A',
            scope: {
                offsetTop: '='
            },
            link: function postLink($scope, $element, $attrs) {
                var offsetTop = {};
                function bindOffset(){
                    if(viewPort().offset.top >= offsetTop[viewPort().bs]){
                        $scope.$apply(function(){ $rootScope.affixed = true; });
                        $element.addClass('gr-affixed').prevAll(':visible').eq(0).css('margin-bottom', $element.outerHeight());
                    }else{
                        $scope.$apply(function(){ $rootScope.affixed = false; });
                        $element.removeClass('gr-affixed').prevAll(':visible').eq(0).css('margin-bottom', '');
                    }
                }
                $rootScope.affixed = false;
                angular.element($window).bind('scroll', bindOffset);
                angular.element($window).bind('resize', bindOffset);
                $scope.$watch('offsetTop', function(o){ if(o){ offsetTop = o; } });
                $rootScope.scrollTop = function(){ angular.element('body', 'html').animate({'scrollTop': 0}, 300); };
            }
        };
    }]);
}());