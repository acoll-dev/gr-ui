'use strict';
(function(){
    angular.module('gr.ui.modal', ['gr.ui.modal.provider', 'gr.ui.modal.factory', 'gr.ui.modal.directive', 'gr.ui.modal.template', 'gr.ui.translate']);
}());
(function(){
    angular.module('gr.ui.modal.provider', [])
        .provider('$grModal', function(){
            var setup,
                $injector,
                $modal,
                $templateCache,
                grModal,
                id = 0;
            grModal = {
                'element': {},
                'template': {
                    'base': '',
                    'model': {
                        'window': '',
                        'backdrop': '',
                        'alert': ''
                    }
                },
                'new': function(config){
                    if(angular.isObject(config)){
                        if(!config.name){
                            return;
                        }
                        if(!config.size){
                            return;
                        }
                        if(!config.model && !config.text){
                            return;
                        }
                        var element = {
                            'id': id,
                            'name': config.name,
                            'title': config.title || undefined,
                            'size': config.size,
                            'model': config.model,
                            'text': config.text,
                            'element': '',
                            'zIndex': config.zIndex,
                            'backdrop': config.backdrop !== undefined ? config.backdrop : true,
                            'buttons': config.buttons || false,
                            'events': {
                                onOpen: config.onOpen || false,
                                onClose: config.onClose || false
                            }
                        };
                        grModal.element[element.name] = element;
                        var ModalInstanceCtrl = ['$scope', '$modalInstance',
                            function($scope, $modalInstance){
                                if(typeof config.define === 'object'){
                                    angular.forEach(config.define, function(d, i){
                                        $scope[i] = d;
                                    });
                                }
                                $scope.modal = $modalInstance;
                        }];
                        id++;
                        return {
                            'open': function(){
                                var options = {
                                    'title': element.title,
                                    'name': element.name,
                                    'backdrop': element.backdrop,
                                    'zIndex': element.zIndex,
                                    'controller': ModalInstanceCtrl,
                                    'size': element.size,
                                    'buttons': element.buttons,
                                    'events': {
                                        onOpen: element.events.onOpen || grModal.events.onOpen,
                                        onClose: element.events.onClose || grModal.events.onClose
                                    }
                                };
                                if(element.text){
                                    options.template = $templateCache.get('grModal/alert.html');
                                    if(angular.isUndefined(config.define)){
                                        config.define = {
                                            alert: {
                                                text: element.text
                                            }
                                        };
                                    }else{
                                        config.define.alert = {
                                            text: element.text
                                        }
                                    }
                                }else if(element.model){
                                    options.templateUrl= (element.model.indexOf('http://') > -1 || element.model.indexOf('https://') > -1) ? element.model : grModal.template.base + element.model;
                                }
                                var grModalInstance = $modal.open(options);
                                return grModalInstance;
                            }
                        }
                    } else {
                        return;
                    }
                },
                'set': function(name, el){
                    grModal.element[name].element = el;
                },
                'alert': function(message, size){
                    var alert = grModal.new({
                        'name': 'alert',
                        'size': size || 'sm',
                        'text': message || '',
                        'buttons': [{
                            'type': 'default',
                            'label': 'Close',
                            'onClick': function(scope, element, controller){
                                controller.close();
                            }
                        }],
                        'backdrop': 'static'
                    });
                    alert.open();
                },
				'confirm': function(message, confirm, cancel, size){
					var alert = grModal.new({
						'name': 'confirm',
						'size': size || 'sm',
						'text': message || '',
						'buttons': [{
							'type': 'primary',
							'label': 'Confirm',
							'onClick': function(scope, element, controller){
								if(confirm && angular.isFunction(confirm)){
									confirm();
								}
								controller.close();
							}
                    	}, {
							'type': 'default',
							'label': 'Cancel',
							'onClick': function(scope, element, controller){
								if(cancel && angular.isFunction(cancel)){
									cancel();
								}
								controller.close();
								
							}
                    	}],
						'backdrop': 'static'
					});
					alert.open();
				},
                'events': {
                    'onOpen': function(){},
                    'onClose': function(){}
                }
            };
            setup = function(injector){
                $injector = injector;
                $modal = $injector.get('$grModal.ui');
                $templateCache = $injector.get('$templateCache');
            };
            this.$get = ['$injector', function(injector){
                    setup(injector);
                    return {
                        'new': grModal.new,
                        'alert': grModal.alert,
						'confirm': grModal.confirm,
                        'template': {
                            'get': function(name){
                                if(angular.isString(name)){
                                    return grModal.template.base + grModal.element[name].model;
                                }
                            }
                        }
                    };
            }];
        })
        .provider('$grModal.ui', function(){
            var $modalProvider = {
                options: {
                    backdrop: true, //can be also false or 'static'
                    keyboard: true
                },
                $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$grModalStack',
                    function($injector, $rootScope, $q, $http, $templateCache, $controller, $grModalStack){
                        var $modal = {};

                        function getTemplatePromise(options){
                            return options.template ? $q.when(options.template) :
                                $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl, {
                                    cache: $templateCache
                                }).then(function(result){
                                    return result.data;
                                });
                        };

                        function getResolvePromises(resolves){
                            var promisesArr = [];
                            angular.forEach(resolves, function(value){
                                if(angular.isFunction(value) || angular.isArray(value)){
                                    promisesArr.push($q.when($injector.invoke(value)));
                                }
                            });
                            return promisesArr;
                        };
                        $modal.open = function(modalOptions){

                            var modalResultDeferred = $q.defer();
                            var modalOpenedDeferred = $q.defer();

                            //prepare an instance of a modal to be injected into controllers and returned to a caller
                            var modalInstance = {
                                result: modalResultDeferred.promise,
                                opened: modalOpenedDeferred.promise,
                                close: function(result){
                                    $grModalStack.close(modalInstance, result);
                                },
                                dismiss: function(reason){
                                    $grModalStack.dismiss(modalInstance, reason);
                                }
                            };

                            //merge and clean up options
                            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                            modalOptions.resolve = modalOptions.resolve || {};

                            //verify options
                            if(!modalOptions.template && !modalOptions.templateUrl){
                                throw new Error('One of template or templateUrl options is required.');
                            }

                            var templateAndResolvePromise =
                                $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));

                            templateAndResolvePromise.then(function resolveSuccess(tplAndVars){

                                var modalScope = (modalOptions.scope || $rootScope).$new();
                                modalScope.$close = modalInstance.close;
                                modalScope.$dismiss = modalInstance.dismiss;

                                var ctrlInstance, ctrlLocals = {};
                                var resolveIter = 1;

                                //controllers
                                if(modalOptions.controller){
                                    ctrlLocals.$scope = modalScope;
                                    ctrlLocals.$modalInstance = modalInstance;
                                    angular.forEach(modalOptions.resolve, function(value, key){
                                        ctrlLocals[key] = tplAndVars[resolveIter++];
                                    });

                                    ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                                    if(modalOptions.controller){
                                        modalScope[modalOptions.controllerAs] = ctrlInstance;
                                    }
                                }

                                $grModalStack.open(modalInstance, {
                                    scope: modalScope,
                                    deferred: modalResultDeferred,
                                    content: tplAndVars[0],
                                    backdrop: modalOptions.backdrop,
                                    keyboard: modalOptions.keyboard,
                                    backdropClass: modalOptions.backdropClass,
                                    windowClass: modalOptions.windowClass,
                                    windowTemplateUrl: modalOptions.windowTemplateUrl,
                                    size: modalOptions.size,
                                    zIndex: modalOptions.zIndex,
                                    title: modalOptions.title,
                                    name: modalOptions.name,
                                    buttons: modalOptions.buttons,
                                    events: modalOptions.events
                                });

                            }, function resolveError(reason){
                                modalResultDeferred.reject(reason);
                            });

                            templateAndResolvePromise.then(function(){
                                modalOpenedDeferred.resolve(true);
                            }, function(){
                                modalOpenedDeferred.reject(false);
                            });

                            modalInstance.element = $grModalStack.getTop();

                            return modalInstance;
                        };
                        return $modal;
                }]
            };
            return $modalProvider;
        });
}());
(function(){
    angular.module('gr.ui.modal.factory', [])
        .factory('$$grStackedMap', function(){
            return {
                createNew: function(){
                    var stack = [];

                    return {
                        add: function(key, value){
                            stack.push({
                                key: key,
                                value: value
                            });
                        },
                        get: function(key){
                            for (var i = 0; i < stack.length; i++){
                                if(key == stack[i].key){
                                    return stack[i];
                                }
                            }
                        },
                        keys: function(){
                            var keys = [];
                            for (var i = 0; i < stack.length; i++){
                                keys.push(stack[i].key);
                            }
                            return keys;
                        },
                        top: function(){
                            return stack[stack.length - 1];
                        },
                        remove: function(key){
                            var idx = -1;
                            for (var i = 0; i < stack.length; i++){
                                if(key == stack[i].key){
                                    idx = i;
                                    break;
                                }
                            }
                            return stack.splice(idx, 1)[0];
                        },
                        removeTop: function(){
                            return stack.splice(stack.length - 1, 1)[0];
                        },
                        length: function(){
                            return stack.length;
                        }
                    };
                }
            };
        })
        .factory('$grModalStack', ['$grTransition.ui', '$timeout', '$document', '$compile', '$rootScope', '$$grStackedMap', function($transition, $timeout, $document, $compile, $rootScope, $$grStackedMap){
                var OPENED_MODAL_CLASS = 'modal-open';
                var backdropDomEl, backdropScope;
                var openedWindows = $$grStackedMap.createNew();
                var $grModalStack = {};
                function backdropIndex(){
                    var topBackdropIndex = -1;
                    var opened = openedWindows.keys();
                    for (var i = 0; i < opened.length; i++){
                        if(openedWindows.get(opened[i]).value.backdrop){
                            topBackdropIndex = i;
                        }
                    }
                    return topBackdropIndex;
                }
                $rootScope.$watch(backdropIndex, function(newBackdropIndex){
                    if(backdropScope){
                        backdropScope.index = newBackdropIndex;
                    }
                });
                function removeModalWindow(modalInstance){
                    var body = $document.find('body').eq(0);
                    var grModalWindow = openedWindows.get(modalInstance).value;
                    openedWindows.remove(modalInstance);
                    removeAfterAnimate(grModalWindow.modalDomEl, grModalWindow.modalScope, 300, function(){
                        grModalWindow.modalScope.$destroy();
                        body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
                        checkRemoveBackdrop();
                    });
                }
                function checkRemoveBackdrop(){
                    if(backdropDomEl && backdropIndex() == -1){
                        var backdropScopeRef = backdropScope;
                        removeAfterAnimate(backdropDomEl, backdropScope, 150, function(){
                            backdropScopeRef.$destroy();
                            backdropScopeRef = null;
                        });
                        backdropDomEl = undefined;
                        backdropScope = undefined;
                    }
                }
                function removeAfterAnimate(domEl, scope, emulateTime, done){
                    scope.animate = false;
                    var transitionEndEventName = $transition.transitionEndEventName;
                    if(transitionEndEventName){
                        var timeout = $timeout(afterAnimating, emulateTime);
                        domEl.bind(transitionEndEventName, function(){
                            $timeout.cancel(timeout);
                            afterAnimating();
                            scope.$apply();
                        });
                    } else {
                        $timeout(afterAnimating);
                    }
                    function afterAnimating(){
                        if(afterAnimating.done){
                            return;
                        }
                        afterAnimating.done = true;

                        domEl.remove();
                        if(done){
                            done();
                        }
                    }
                }
                $document.bind('keydown', function(evt){
                    if(openedWindows.length()){
                        var modal;
                        if(evt.which === 27){
                            modal = openedWindows.top();
                            if(modal && modal.value.keyboard){
                                evt.preventDefault();
                                $rootScope.$apply(function(){
                                    $grModalStack.dismiss(modal.key, 'escape key press');
                                });
                            }
                        }else if(evt.which === 13){
                            modal = angular.element(openedWindows.top().value.modalDomEl);
                            var enterBind = modal.find('[gr-enter-bind]');
                            if(enterBind.length > 0){
                                enterBind.click();
                            }
                        }
                    }
                });
                $grModalStack.open = function(modalInstance, modal){
                    openedWindows.add(modalInstance, {
                        deferred: modal.deferred,
                        modalScope: modal.scope,
                        backdrop: modal.backdrop,
                        keyboard: modal.keyboard,
                        buttons: modal.buttons,
                        events: modal.events
                    });
                    var body = $document.find('body').eq(0),
                        currBackdropIndex = backdropIndex();
                    if(currBackdropIndex >= 0 && !backdropDomEl){
                        backdropScope = $rootScope.$new(true);
                        backdropScope.index = currBackdropIndex;
                        backdropScope.zIndex = parseInt(modal.zIndex);
                        var angularBackgroundDomEl = angular.element('<div gr-modal-backdrop></div>');
                        angularBackgroundDomEl.attr('backdrop-class', modal.backdropClass);
                        backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
                        body.append(backdropDomEl);
                    }
                    var angularDomEl = angular.element('<div gr-modal-window></div>');
                    angularDomEl.attr({
                        'template-url': modal.windowTemplateUrl,
                        'window-class': modal.windowClass,
                        'size': modal.size,
                        'data-title': modal.title,
                        'id': 'gr-modal-' + (modal.name ? modal.name : (openedWindows.length() - 1)),
                        'index': openedWindows.length() - 1,
                        'z-index': modal.zIndex,
                        'animate': 'animate'
                    }).html(modal.content);
                    var modalDomEl = $compile(angularDomEl)(modal.scope);
                    openedWindows.top().value.modalDomEl = modalDomEl;
                    modalInstance.element = angular.element(modalDomEl);
                    body.append(modalDomEl);
                    body.addClass(OPENED_MODAL_CLASS);
                };
                $grModalStack.close = function(modalInstance, result){
                    var grModalWindow = openedWindows.get(modalInstance);
                    if(grModalWindow){
                        grModalWindow.value.deferred.resolve(result);
                        removeModalWindow(modalInstance);
                    }
                };
                $grModalStack.dismiss = function(modalInstance, reason){
                    var grModalWindow = openedWindows.get(modalInstance);
                    if(grModalWindow){
                        grModalWindow.value.deferred.reject(reason);
                        removeModalWindow(modalInstance);
                    }
                };
                $grModalStack.dismissAll = function(reason){
                    var topModal = this.getTop();
                    while (topModal){
                        this.dismiss(topModal.key, reason);
                        topModal = this.getTop();
                    }
                };
                $grModalStack.getTop = function(){
                    return openedWindows.top();
                };
                return $grModalStack;
        }])
        .factory('$grTransition.ui', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope){
                var $transition = function(element, trigger, options){
                    options = options || {};
                    var deferred = $q.defer();
                    var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

                    var transitionEndHandler = function(event){
                        $rootScope.$apply(function(){
                            element.unbind(endEventName, transitionEndHandler);
                            deferred.resolve(element);
                        });
                    };

                    if(endEventName){
                        element.bind(endEventName, transitionEndHandler);
                    }
                    $timeout(function(){
                        if(angular.isString(trigger)){
                            element.addClass(trigger);
                        } else if(angular.isFunction(trigger)){
                            trigger(element);
                        } else if(angular.isObject(trigger)){
                            element.css(trigger);
                        }
                        if(!endEventName){
                            deferred.resolve(element);
                        }
                    });
                    deferred.promise.cancel = function(){
                        if(endEventName){
                            element.unbind(endEventName, transitionEndHandler);
                        }
                        deferred.reject('Transition cancelled');
                    };

                    return deferred.promise;
                };
                var transElement = document.createElement('trans');
                var transitionEndEventNames = {
                    'WebkitTransition': 'webkitTransitionEnd',
                    'MozTransition': 'transitionend',
                    'OTransition': 'oTransitionEnd',
                    'transition': 'transitionend'
                };
                var animationEndEventNames = {
                    'WebkitTransition': 'webkitAnimationEnd',
                    'MozTransition': 'animationend',
                    'OTransition': 'oAnimationEnd',
                    'transition': 'animationend'
                };

                function findEndEventName(endEventNames){
                    for (var name in endEventNames){
                        if(transElement.style[name] !== undefined){
                            return endEventNames[name];
                        }
                    }
                }
                $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
                $transition.animationEndEventName = findEndEventName(animationEndEventNames);
                return $transition;
        }]);
}());
(function(){
    angular.module('gr.ui.modal.directive', [])
        .directive('grModalBackdrop', ['$grModal', '$templateCache', '$timeout', function(MODAL, $templateCache, $timeout){
                return {
                    restrict: 'EA',
                    replace: true,
                    template: $templateCache.get('grModal/backdrop.html'),
                    link: function(scope, element, attrs){
                        scope.backdropClass = attrs.backdropClass || '';

                        scope.animate = false;

                        //trigger CSS transitions
                        $timeout(function(){
                            scope.animate = true;
                        });
                    }
                };
          }])
        .directive('grModalWindow', ['$grModalStack', '$templateCache', '$grModal', '$http', '$timeout', '$compile', function($grModalStack, $templateCache, MODAL, $http, $timeout, $compile){
                return {
                    restrict: 'EA',
                    scope: {
                        index: '@',
                        animate: '='
                    },
                    replace: true,
                    transclude: true,
                    template: $templateCache.get('grModal/window.html'),
                    link: function(scope, element, attrs, ctrl){
                        element.addClass(attrs.windowClass || '');

                        scope.size = attrs.size;
                        scope.zIndex = attrs.zIndex;
                        scope.title = attrs.title;
                        
                        var modal = $grModalStack.getTop(),
                            opened = true;

                        scope.buttons = modal.value.buttons;
                        scope.exec = function(fn){
                            fn(scope.$parent, element, modal.key);
                        };

                        modal.key.result.then(function(){
                            modal.value.events.onClose(element);
                        }, function(){
                            modal.value.events.onClose(element);
                        })

                        modal.key.opened.then(function(){
                            modal.value.events.onOpen(element);
                        }, function(){
                            modal.value.events.onOpen(element);
                        });

                        $timeout(function(){
                            // trigger CSS transitions
                            scope.animate = true;
                            // focus a freshly-opened modal
                            element[0].focus();
                        });

                        scope.close = function(evt){
                            if(!evt || evt === true){
                                $grModalStack.close(modal.key);
                            } else if(modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)){
                                evt.preventDefault();
                                evt.stopPropagation();
                                $grModalStack.dismiss(modal.key, 'backdrop click');
                            }
                        }
                    }
                };
        }])
        .directive('grModalButton', ['$compile', '$timeout', '$templateCache', function($compile, $timeout, $templateCache){
            return{
                    restrict: 'EA',
                    replace: true,
                    transclude: true,
                    link: function(scope, element, attrs, ctrl, $transclude){
                        $transclude(scope, function(clone){
                            var buttonTemplate = $templateCache.get('grModal/button.html');
                            scope.$watch('buttons', function(scopeButtons){
                                angular.forEach(scopeButtons, function(btn, id){
                                    var attrs = {
                                        'title': btn.label,
                                        'ng-click': 'exec(buttons[' + id + '].onClick)'
                                    };
                                    if(angular.isObject(btn.attr)){
                                        angular.forEach(btn.attr, function(value, key){
                                            if(angular.isString(value)){
                                                attrs[key] = value;
                                            }
                                        });
                                    }
                                    var buttonContent = btn.labelIcon ? '<span class="hidden-xs hidden-sm"><i class="' + btn.labelIcon + '"></i> ' + btn.label + '</span><span class="visible-xs visible-sm"><i class="' + btn.labelIcon + '"></i></span>' : btn.label,
                                        button = angular.element(buttonTemplate).addClass('btn-' + btn.type).attr(attrs).html(buttonContent);
                                    $compile(button)(scope);
                                    element.append(button);
                                });
                            });
                        });
                    }
            }
        }])
        .directive('grModalTransclude', function(){
            return {
                link: function($scope, $element, $attrs, controller, $transclude){
                    $transclude($scope.$parent, function(clone){
                        $element.empty();
                        $element.append(clone);
                    });
                }
            };
        })
        .directive('autofocus', ['$timeout', function($timeout){
            return {
                restrict: 'A',
                link: function($scope, $element){
                    $timeout(function(){
                        $element.focus();
                    }, 100);
                }
            }
        }]);
}());
(function(){
    angular.module('gr.ui.modal.template', [])
        .run(['$templateCache', function($templaceCache){
            $templaceCache.put('grModal/window.html',
               '<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': (zIndex && zIndex > 0 ? ((zIndex*1) + 10) : (100050 + index*10)), display: \'block\'}" ng-click="close($event)">' +
                    '<div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\', \'modal-responsive\': size == \'responsive\'}">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header" ng-if="title">' +
                                '<button type="button" class="close" ng-click="close()" title="{{\'Close\' | grTranslate}}"><span aria-hidden="true">&times;</span><span class="sr-only">{{\'Close\' | grTranslate}}</span>' +
                                '</button>' +
                                '<h4 class="modal-title">{{title | grTranslate}}</h4>' +
                            '</div>' +
                            '<div class="modal-body" gr-modal-transclude></div>' +
                            '<div class="modal-footer">' +
                                '<gr-modal-button></gr-modal-button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>');
            $templaceCache.put('grModal/backdrop.html', '<div class="modal-backdrop fade {{ backdropClass }}" ng-class="{in: animate}" ng-style="{\'z-index\': (zIndex && zIndex > 0 ? zIndex : (100040 + (index && 1 || 0) + index*10))}" ></div>');
            $templaceCache.put('grModal/alert.html', '<p>{{alert.text | grTranslate}}</p>');
            $templaceCache.put('grModal/button.html', '<button type="button" class="btn"></button>');
        }]);
}());