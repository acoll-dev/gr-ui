'use strict';
(function(){
    angular.module('gr.ui.translate', []);
})();
(function(){
    angular.module('gr.ui.translate')
        .filter('grTranslate', ['$injector', function($injector){
            return function(value){
                if(angular.isString(value)){
                    if($injector.has('$translate')){
                        var $filter = $injector('$filter');
                        value = $filter('translate')(value);
                    }
                }
                return value;
            }
        }]);
})();