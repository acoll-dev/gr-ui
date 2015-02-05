'use strict';
(function(){
    angular.module('gr-autofields', ['autofields', 'grAlert'])
    .directive('grAutofields', ['$compile', '$timeout', '$grAlert', function($compile, $timeout, $grAlert){
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs){
                
                if(!$attrs.name){ return false; }
                
                var $input = angular.element('<auto:fields/>'),
                    $alert = $grAlert.new(),
                    $errors = [],
                    defaults = $attrs.grAutofields ? angular.copy($scope.$eval($attrs.grAutofields)) : false,
                    autofields = $attrs.grAutofields ? $scope.$eval($attrs.grAutofields) : false;
                
                if(!autofields){ return false; }else{ autofields.name = $attrs.grAutofields; };
                
                if(autofields.schema){ $input.attr('fields', autofields.name + '.schema'); }
                if(autofields.data){ $input.attr('data', autofields.name + '.data'); }
                if(autofields.options){ $input.attr('options', autofields.name + '.options'); }
                
                $element.prepend($input).removeAttr('gr-autofields').attr({
                    'novalidate': true,
                    'ng-submit': $attrs.name + '.submit()'
                });
                
                if($element.find('[type="submit"]').length === 0){ $element.append('<button type="submit" class="hidden" />'); }
                
                $scope.$watch(function(){
                    if($scope[$attrs.name].autofields){ return $scope[$attrs.name].autofields.$error; }else{ return {}; }
                }, checkError, true);
                
                function getError($error){
                    var _errors = {};
                    angular.forEach($error, function(errors, errorId){
                        angular.forEach(errors, function(field, id){
                            angular.forEach(autofields.schema, function(item){
                                if(item.type !== 'multiple'){
                                    if(item.property === field.$name && item.msgs && item.msgs[errorId]){
                                        _errors[item.property] = angular.copy(item.msgs[errorId]);
                                    }
                                }else{
                                    angular.forEach(item.fields, function(subitem){
                                        if(subitem.property === field.$name && subitem.msgs && subitem.msgs[errorId]){
                                            _errors[subitem.property] = angular.copy(subitem.msgs[errorId]);
                                        }
                                    });
                                }
                            });
                        });
                    });
                    return _errors;
                };
                function checkError($error){
                    var _errors = sort(getError($error));
                    if(_errors !== $errors){
                        $errors = _errors;
                    }
                    if($scope[$attrs.name].$submitted){
                        if(!$alert.isShown){
                            $alert.show('danger', $errors);
                        }else{
                            $alert.update('danger', $errors);
                        }
                    }
                };
                function sort(errors){
                    var _errors = [];
                    angular.forEach(autofields.schema, function(item){
                        if(item.type !== 'multiple'){
                            if(errors[item.property]){
                                _errors.push(angular.copy(errors[item.property]));
                            };
                        }else{
                            angular.forEach(item.fields, function(subitem){
                                if(errors[subitem.property]){
                                    _errors.push(angular.copy(errors[subitem.property]));
                                }
                            });
                        }
                    });
                    return angular.copy(_errors);
                };
                function submit(){
                    var field;
                    angular.forEach(getError($scope[$attrs.name].autofields.$error),function(value, id){
                        if(!field){
                            field = id;
                        }
                    });
                    if(!$scope[$attrs.name].$submitted){ $scope[$attrs.name].$setSubmitted(true); }
                    if(!$scope[autofields.name].options.validation.enabled){ $scope[autofields.name].options.validation.enabled = true };
                    if($scope[$attrs.name].$invalid){
                        checkError($scope[$attrs.name].autofields.$error);
                    }else{
                        $scope[autofields.name].submit(autofields.data);
                    }
                };
                function reset(){
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