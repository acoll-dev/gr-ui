'use strict';
(function(){
    angular.module('gr.ui.translate', ['gr.ui.translate.filter'])
        .provider('$grTranslate', function(){
            var $injector,
                $translator = function(value){
                    var _return;
                    if(angular.isString(value)){
                        if($injector.has('$translate')){
                            _return = $injector.get('$translate').instant(value);
                        }else{
                            _return = value;
                        }
                    }else{
                        _return = '';
                    }
                    return _return;
                };
            this.$get = ['$injector', function(injector){
                $injector = injector;
                return $translator;
            }];
        });
}());
(function(){
    angular.module('gr.ui.translate.filter', [])
        .filter('grTranslate', ['$grTranslate', function($grTranslate){
            return function(value){
                if(angular.isString(value)){
                    var newValue, vars;
                    if(value.indexOf('[[') > -1){
                        newValue = value.split('[[')[0];
                        vars = value.split('[[')[1].split(']]')[0].split(',');
                        console.debug(vars);
                    };
                    value = $grTranslate(value);
                }
                return value;
            }
        }]);
}());