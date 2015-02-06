'use strict';
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