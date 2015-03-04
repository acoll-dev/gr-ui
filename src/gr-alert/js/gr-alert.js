'use strict';
(function(){
    angular.module('gr.ui.alert', [])
        .factory('$grAlert', ['$compile', '$timeout', '$window', function($compile, $timeout, $window){
            var id = 1,
                defaults = {
                    index: 10000,
                    timeout: 8000
                },
                grAlert = {
                    alert: {},
                    realign: function(){
                        var pos = 10,
                            margin = 10;
                        angular.forEach(grAlert.alert, function(alert){
                            if(alert.message.visible){
                                alert.element.css('top', pos);
                                pos += alert.element.height() + margin;
                            }
                        });
                    },
                    new: function(wrapper){
                        if(angular.isUndefined(wrapper)){
                            wrapper = angular.element('body');
                        }
                        var instance = {
                                id: 'gr-alert-' + id,
                                element: {},
                                parent: wrapper,
                                scope: {},
                                setTimeout: function(){
                                    if(instance.timeout > 0){
                                        instance.timeoutFn = $timeout(function(){
                                            instance.hide();
                                        }, instance.timeout);
                                    }
                                },
                                message: {
                                    type: '',
                                    content: [],
                                    visible: false,
                                    check: function(){
                                        return instance.message.content.length > 0;
                                    }
                                },
                                show: function(type, obj, timeout){
                                    if(angular.isString(type) && angular.isArray(obj)){
                                        instance.message.content = [];
                                        instance.hide();
                                        $timeout.cancel(instance.timeoutFn);
                                        instance.message.type = type;
                                        instance.message.content = obj;
                                        instance.message.visible = true;
                                        instance.timeout = angular.isDefined(timeout) ? timeout : defaults.timeout;
                                        instance.setTimeout();
                                        $timeout(function(){
                                            instance.scope.$apply();
                                        });
                                    }
                                },
                                hide: function(){
                                    $timeout.cancel(instance.timeoutFn);
                                    instance.message.visible = false;
                                    $timeout(function(){
                                        instance.scope.$apply();
                                    });
                                },
                                destroy: function(){
                                    $timeout.cancel(instance.timeoutFn);
                                    instance.message.visible = false;
                                    $timeout(function(){
                                        instance.element.remove();
                                        $compile(instance.element)(wrapper.scope());
                                        delete grAlert.alert[instance.id];
                                    }, 300);
                                    delete grAlert.alert[instance.id];
                                    $timeout(function(){
                                        instance.scope.$apply();
                                    });
                                }
                            },
                            alertEl = angular.element('<gr-alert id="' + instance.id + '" style="z-index: ' + (defaults.index + (id * 10)) + '"></gr-alert>'),
                            setupInstance = function(){
                                $compile(alertEl)(wrapper.scope());
                                wrapper.append(alertEl);
                                instance.element = alertEl;
                                instance.scope = alertEl.scope();
                                instance.scope.message = instance.message;
                                instance.scope.hide = instance.hide,
                                instance.scope.show = instance.show,
                                instance.scope.destroy = instance.destroy;
                                grAlert.alert[instance.id] = instance;
                                instance.scope.$watch(function(){
                                    return instance.message.visible;
                                }, function(v){
                                    if(v){
                                        instance.element.stop(true,false).fadeTo('fast', 1, function(){
                                            grAlert.realign();
                                        });
                                    }else{
                                        instance.element.stop(true,false).fadeTo('fast', 0, function(){
                                            instance.element.hide();
                                            grAlert.realign();
                                        });
                                    }
                                });
                                instance.element.on({
                                    mouseenter: function(){
                                        $timeout.cancel(instance.timeoutFn);
                                    },
                                    mouseleave: function(){
                                        instance.setTimeout();
                                    }
                                });
                                angular.element($window).on('resize', grAlert.realign);
                                id++;
                            };
                        setupInstance();
                        return grAlert.alert[instance.id];
                    }
                };
            return {
                new: grAlert.new
            }
        }])
        .directive('grAlert', ['$templateCache', '$timeout', function ($templateCache, $timeout){
                return {
                    restrict: 'E',
                    scope: true,
                    template: $templateCache.get('gr-alert/alert.html'),
                    replace: true
                };
            }])
        .run(['$templateCache', function($templateCache){
            $templateCache.put('gr-alert/alert.html',
                '<div class="gr-alert" ng-show="message.check()">' +
                    '<div class="alert" ng-class="message.type ? (message.type === \'loading\' ? \'alert-info\' : (\'alert-\' + message.type)) : \'\'">' +
                        '<button type="button" class="close" ng-click="hide()">' +
                            '<span aria-hidden="true"><i class="fa fa-fw fa-times"></i></span>' +
                            '<span class="sr-only">Close</span>' +
                        '</button>' +
                        '<div class="gr-alert-icon">' +
                            '<i class="fa fa-fw fa-times-circle" ng-if="message.type === \'danger\'"></i>' +
                            '<i class="fa fa-fw fa-exclamation-circle" ng-if="message.type === \'warning\'"></i>' +
                            '<i class="fa fa-fw fa-info-circle" ng-if="message.type === \'info\'"></i>' +
                            '<i class="fa fa-fw fa-check-circle" ng-if="message.type === \'success\'"></i>' +
                            '<i class="fa fa-fw fa-refresh fa-spin" ng-if="message.type === \'loading\'"></i>' +
                        '</div>' +
                        '<ul>' +
                            '<li ng-repeat="msg in message.content track by $index">' +
                                '{{msg}}' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                '</div>');
        }]);
}());
