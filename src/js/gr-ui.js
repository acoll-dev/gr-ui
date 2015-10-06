'use strict';

(function(window){
    window.griffoUI = {
        version: '0.2.2'
    };
}(window));

(function(){
    angular.module('gr.ui', ['gr.ui.alert', 'gr.ui.autofields', 'gr.ui.autoheight', 'gr.ui.autoscale', 'gr.ui.affix', 'gr.ui.carousel', 'gr.ui.modal', 'gr.ui.pager', 'gr.ui.table', 'gr.ui.translate']);
}());

/*
 *
 * GR-ALERT
 *
 */

 (function(){
     angular.module('gr.ui.alert', [])
         .provider('$grAlert', function(){
             var id = 1,
                 $handlers = [],
                 $injector,
                 $compile,
                 $timeout,
                 $window,
                 defaults = {
                     index: 1000000,
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
                                     if(angular.isString(type)){
                                         instance.message.content = [];
                                         instance.hide();
                                         $timeout.cancel(instance.timeoutFn);
                                         instance.message.type = type;
                                         if(angular.isArray(obj)){
                                             instance.message.content = obj;
                                         }else if(angular.isString(obj)){
                                             instance.message.content = [obj];
                                         }
                                         if($handlers.length > 0){
                                             angular.forEach($handlers, function(fn){
                                                 instance.message.content = $injector.invoke(fn, null, {$object: instance.message.content});
                                             });
                                         }
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
             this.registerHandler = function(fn){
                 if(fn){
                     $handlers.push(fn);
                 }
             }
             this.$get = ['$injector', '$compile', '$timeout', '$window', function(injector, compile, timeout, window){
                 $injector = injector;
                 $compile = compile;
                 $timeout = timeout;
                 $window = window;
                 return {
                     new: grAlert.new
                 }
             }];
         })
         .directive('grAlert', ['$templateCache', '$timeout', function($templateCache, $timeout){
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

/*
 *
 * GR-AUTOFIELDS
 *
 */

(function(){
    angular.module('gr.ui.autofields.core', ['gr.ui.alert', 'ui.utils.masks'])

    angular.module('gr.ui.autofields.services', [])
        .provider('$grAutofields', function(){
            var autofields = {};

            // Helper Methods
            var helper = {
                CamelToTitle: function (str) {
                    return str
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, function (str) { return str.toUpperCase(); });
                },
                CamelToDash: function (str) {
                    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                },
                LabelText: function(field) {
                    return field.label || helper.CamelToTitle(field.property);
                }
            };

            // Directive-wide Handler Default Settings
            autofields.settings = {
                classes: {
                    container: [],
                    input: [],
                    label: []
                },
                attributes: {
                    container: {
                        'class': '$type'
                    },
                    input: {
                        id: '$property_clean',
                        name: '$property_clean',
                        type: '$type',
                        ngModel: '$data.$property',
                        placeholder: '$placeholder'
                    },
                    label: {}
                },
                container: '<div class="autofields" ng-form name="$form"></div>',
                scope: {}
            };

            // Field Building Helpers
            // Add Attributes to Element
            var setAttributes = autofields.setAttributes = function(directive, field, el, attrs){
                angular.forEach(attrs, function(value, attr){
                    if(value && typeof value == 'string'){
                        value = value
                            .replace(/\$form/g, directive.formStr)
                            .replace(/\$schema/g, directive.schemaStr)
                            .replace(/\$type/g, field.type || 'text')
                            .replace(/\$property_clean/g, field.property.replace(/\[|\]|\./g, ''))
                            .replace(/\$property/g, field.property)
                            .replace(/\$data/g, directive.dataStr)
                            .replace(/\$options/g, directive.optionsStr)
                            .replace(/\$required/g, field.attr ? (field.attr.required ? true : false) : false)
                            .replace(/\$placeholder/g, field.placeholder != null ? field.placeholder : helper.LabelText(field));
                    }
                    el.attr(helper.CamelToDash(attr), value);
                });
            };
            // Standard Container for field
            var getFieldContainer = function(directive, field, attrs){
                var fieldContainer = angular.element('<div/>');
                attrs = angular.extend({}, autofields.settings.attributes.container, attrs);
                setAttributes(directive, field, fieldContainer, attrs);
                fieldContainer.addClass((directive.options||autofields.settings).classes.container.join(' '));

                return fieldContainer;
            };
            // Standard Label for field
            var getLabel = function(directive, field, attrs){
                var label = angular.element('<label/>');
                attrs = angular.extend({}, autofields.settings.attributes.label, attrs);
                setAttributes(directive, field, label, attrs);
                label.addClass((directive.options||autofields.settings).classes.label.join(' '));
                label.html(helper.LabelText(field));

                return label;
            }
            // Standard Input for field
            var getInput = function(directive, field, html, attrs){
                var input = angular.element(html);
                attrs = angular.extend({}, autofields.settings.attributes.input, attrs, field.attr);
                setAttributes(directive, field, input, attrs);
                input.addClass((directive.options||autofields.settings).classes.input.join(' '));

                return input;
            }
            // Standard Field
            autofields.field = function(directive, field, html, attrs){
                var fieldElements = {
                        fieldContainer: getFieldContainer(directive, field),
                        label: field.label != '' ? getLabel(directive, field) : null,
                        input: getInput(directive, field, html, attrs)
                    };
                fieldElements.fieldContainer.append(fieldElements.label).append(fieldElements.input);

                // Run Mutators
                var mutatorsRun = [];
                angular.forEach(mutators, function(mutator, key){
                    fieldElements = mutator(directive, field, fieldElements, mutatorsRun);
                    mutatorsRun.push(key);
                });

                return fieldElements;
            }

            // Update scope with items attached in settings
            autofields.updateScope = function(scope){
                angular.forEach(autofields.settings.scope, function(value, property){
                    if(typeof value == 'function'){
                        scope[property] = function(){
                            var args = Array.prototype.slice.call(arguments, 0);
                            args.unshift(scope);
                            value.apply(this, args);
                        }
                    }else{
                        scope[property] = value;
                    }
                })
            }

            // Handler Container
            var handlers = {};

            // Hook for handlers
            autofields.registerHandler = function(types, fn){
                types = Array.isArray(types) ? types : [types];
                angular.forEach(types, function(type){
                    handlers[type] = fn;
                });
            }

            // Mutator Container
            var mutators = {};

            // Hook for mutators
            autofields.registerMutator = function(key, fn, options){
                if(!mutators[key] || options.override){
                    mutators[key] = function(directive, field, fieldElements, mutatorsRun){
                        if(options && typeof options.require == 'string' && mutatorsRun.indexOf(options.require) == -1){
                            fieldElements = mutators[options.require];
                        }
                        if(mutatorsRun.indexOf(key) == -1) return fn(directive, field, fieldElements);
                    }
                }
            }

            // Field Builder
            autofields.createField = function(directive, field, index){
                var handler = field.type == null ? handlers.text : handlers[field.type];
                if(handler == null){
                    console.warn(field.type+' not supported - field ignored');
                    return;
                }
                return handler(directive, field, index);
            };

            autofields.$get = function(){
                return {
                    settings: autofields.settings,
                    createField: autofields.createField,
                    updateScope: autofields.updateScope
                };
            };

            return autofields;
        });

    angular.module('gr.ui.autofields.directives', [])
        .directive('fixUrl', [function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attr, ngModel) {
                    var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.\-\?\=\&]*)$/i;

                    //Render formatters on blur...
                    var render = function () {
                        var viewValue = ngModel.$modelValue;
                        if (viewValue == null) return;
                        angular.forEach(ngModel.$formatters, function (formatter) {
                            viewValue = formatter(viewValue);
                        })
                        ngModel.$viewValue = viewValue;
                        ngModel.$render();
                    };
                    element.bind('blur', render);

                    var formatUrl = function (value) {
                        var test = urlRegex.test(value);
                        if (test) {
                            var matches = value.match(urlRegex);
                            var reformatted = (matches[1] != null && matches[1] != '') ? matches[1] : 'http://';
                            reformatted += matches[2] + '.' + matches[3];
                            if (typeof matches[4] != "undefined") reformatted += matches[4]
                            value = reformatted;
                        }
                        return value;
                    }
                    ngModel.$formatters.push(formatUrl);
                    ngModel.$parsers.unshift(formatUrl);
                }
            };
        }])
        .directive('grDisabled', [function(){
            return {
                restrict: 'A',
                link: function($scope, $element, $attr){
                    var parent = $element.parents('.form-group').eq(0);
                    $scope.$watch($attr.grDisabled, function(disabled){
                        if(disabled){
                            $attr.$set('disabled', true);
                            if(parent.length > 0){
                                parent.addClass('is-disabled');
                            }
                        }else{
                            $attr.$set('disabled', false);
                            $element.focus();
                            if(parent.length > 0){
                                parent.removeClass('is-disabled');
                            }
                        }
                    });
                }
            }
        }])
        .directive('grAutofields', ['$compile', '$parse', '$injector', '$timeout', '$grAlert', function($compile, $parse, $injector, $timeout, $grAlert){
            return {
                restrict: 'A',
                compile: function($element, $attrs){
                    var grSettings = $attrs.settings || $attrs.grAutofields,
                        initialized = false,
                        $getter = $parse(grSettings),
                        $setter = $getter.assign;
                    if(!$attrs.name && !grSettings) return false;
                    $element.html('');
                    return {
                        pre: function($scope, _element, _attrs){
                            function init(){
                                var grAutofields = $getter($scope),
                                    _defaults = angular.copy(grAutofields),

                                    elId = 'gr-autofields-form' + Math.ceil(Math.random()*100),

                                    $alert = $grAlert.new(),
                                    $errors = [],

                                    modalScope = $element.parents('.modal').eq(0).scope(),

                                    defaultOptions = {
                                        defaultOption: 'Selecione...',
                                        validation: {
                                            enabled: true,
                                            showMessages: false
                                        }
                                    },

                                    setErrors = function(schema){
                                        var errors = {};
                                        function multipleRecursive(schema){
                                            var aux = {};
                                            angular.forEach(schema, function(item){
                                                if(item.type === 'multiple'){
                                                    angular.forEach(multipleRecursive(item.fields), function(subitem){
                                                        if(subitem.msgs){
                                                            aux[subitem.property] = subitem;
                                                        }
                                                    });
                                                }else if(item.msgs){
                                                    aux[item.property] = item;
                                                }
                                            });
                                            return aux;
                                        }
                                        angular.forEach(multipleRecursive(schema), function(item, id){
                                            errors[id] = item.msgs;
                                        });
                                        grAutofields.errors = errors;
                                        checkError();
                                    },

                                    getError = function($error){
                                        var _errors = [],
                                            oErrors = [],
                                            elements = [];
                                        angular.forEach($error, function(errors, errorId){
                                            angular.forEach(errors, function(field){
                                                if(grAutofields.errors && grAutofields.errors[field.$name]){
                                                    _errors.push(grAutofields.errors[field.$name][errorId]);
                                                }
                                            });
                                        });
                                        angular.forEach(grAutofields.errors, function(errorType, elId){
                                            elements.push(elId);
                                            angular.forEach(errorType, function(error){
                                                angular.forEach(_errors,function(e){
                                                    if(e === error){
                                                        oErrors.push(e);
                                                    }
                                                });
                                            });
                                        });
                                        return {
                                            errors: oErrors,
                                            elements: elements
                                        }
                                    },

                                    checkError = function($error){
                                        var errors,
                                            _errors;
                                        if($error){
                                            _errors = getError($error);
                                            errors = _errors.errors;
                                        }else{
                                            errors = $errors;
                                        }
                                        if(errors !== $errors){ $errors = errors; }

                                        if($errors.length > 0 && $scope[$attrs.name] && $scope[$attrs.name].autofields && $scope[$attrs.name].autofields.$submitted){
                                            $alert.show('danger', $errors);
                                            if(_errors){
                                                var types = ['text', 'date', 'email', 'number', 'tel', 'search', 'password', 'textarea', 'checkbox'],
                                                    selectorInvalid = ['select.ng-invalid:visible', '.ta-root:not(.focussed)'],
                                                    selectorFocussed = ['select:focus', '.ta-root.focussed'];
                                                angular.forEach(types, function(t){
                                                    selectorInvalid.push('[type=' + t + '].ng-invalid:visible');
                                                    selectorFocussed.push('[type=' + t + ']:focus');
                                                });
                                                var invalidFields = angular.element('[name=' + $attrs.name + '].' + elId).find(selectorInvalid.join(',')),
                                                    focussedFields = angular.element('[name=' + $attrs.name + '].' + elId).find(selectorFocussed.join(','));
                                                if(invalidFields.size() > 0 && focussedFields.size() == 0){
                                                    if(invalidFields.eq(0).hasClass('ta-root')){
                                                        invalidFields.eq(0).find('.ta-bind').eq(0).trigger('focus');
                                                    }else{
                                                        invalidFields.eq(0).focus();
                                                    }
                                                }
                                            }
                                        }else{
                                            $alert.hide();
                                        }
                                    },

                                    updateDefaults = function(){
                                        _defaults = angular.copy(grAutofields);
                                    },

                                    hasChange = function(){
                                        return !angular.equals(defaults.data, grAutofields.data);
                                    },

                                    submit = function(){
                                        $timeout(function(){
                                            if(!$scope[$attrs.name].autofields.$submitted){
                                                $scope[$attrs.name].autofields.$setSubmitted(true);
                                                $scope.$apply();
                                            }
                                            if($scope[$attrs.name].autofields.$invalid){
                                                checkError($scope[$attrs.name].autofields.$error);
                                            } else {
                                                grAutofields.submit(grAutofields.data);
                                            }
                                        });
                                    },

                                    reset = function(){
                                        $timeout(makeAutofields);
                                    },

                                    makeAutofields = function(stop){

                                        // Reset the element;

                                        $element.html('');

                                        delete $scope[$attrs.name];

                                        $setter($scope, angular.copy(_defaults));

                                        grAutofields = $getter($scope);

                                        if(!grAutofields.options){
                                            grAutofields.options = defaultOptions;
                                        }else{
                                            angular.extend(grAutofields.options, defaultOptions);
                                        }

                                        setErrors(grAutofields.schema);

                                        $scope.$apply();

                                        // Create new element;

                                        var $input = angular.element('<auto:fields/>');

                                        if(grAutofields.schema){
                                            $input.attr('fields', grSettings + '.schema');
                                        }

                                        if(grAutofields.data){
                                            $input.attr('data', grSettings + '.data');
                                        }

                                        if(grAutofields.options){
                                            $input.attr('options', grSettings + '.options');
                                        }

                                        $element.addClass('gr-autofields').removeAttr('gr-autofields').attr({
                                            'novalidate': true,
                                            'ng-submit': $attrs.name + '.submit()'
                                        }).append($input);

                                        if($element.find('[type="submit"]').length === 0){
                                            $element.append('<button type="submit" class="hidden"/>');
                                        }

                                        try{
                                            angular.forEach(grAutofields.schema, function(el){
                                                if(el.type === 'html'){
                                                    $injector.get('textAngularManager').unregisterEditor(el.property);
                                                }
                                            });
                                        }catch(e){}

                                        $compile($element)($scope);

                                        $scope.$apply(function(){
                                            $scope[$attrs.name].submit = submit;
                                            $scope[$attrs.name].reset = reset;
                                            $scope[$attrs.name].updateDefaults = updateDefaults;
                                            $scope[$attrs.name].hasChange = hasChange;
                                        });

                                        $element.find('input, select, textarea').on({
                                            focus: function(){
                                                angular.element(this).parents('.form-group').eq(0).addClass('has-focus');
                                            },
                                            blur: function(){
                                                angular.element(this).parents('.form-group').eq(0).removeClass('has-focus');
                                            }
                                        });

                                    };

                                $scope.$watch(function(){ return modalScope ? true : false; }, function(hasModal){
                                    if(hasModal){
                                        $alert.destroy();
                                        $alert = $grAlert.new(modalScope.modal.element);
                                    }
                                }, true);

                                // $scope.$watch(grSettings + '.data', function(schema){
                                //     console.debug(schema);
                                // }, true);

                                $scope.$watch(grSettings + '.schema', function(schema){
                                    if(schema){
                                        setErrors(schema);
                                    }
                                }, true);

                                $scope.$watch(function(){
                                    if($scope[$attrs.name] && $scope[$attrs.name].autofields){
                                        return $scope[$attrs.name].autofields.$error;
                                    }else{
                                        return [];
                                    }
                                }, checkError, true);

                                $element.addClass(elId);

                                $timeout(makeAutofields);
                            };
                            $scope.$watch(grSettings, function(settings){
                                if(settings && settings.schema && !initialized){
                                    initialized = true;
                                    init();
                                }
                            });
                        }
                    }
                }
            }
        }])
        .directive('autoFields', ['$grAutofields','$compile', function($grAutofields, $compile){
            return {
                restrict: 'E',
                priority: 1,
                replace: true,
                compile: function(){
                    return function ($scope, $element, $attr) {
                        // Scope Hooks
                        var directive = {
                            schemaStr: $attr.fields || $attr.autoFields,
                            optionsStr: $attr.options,
                            dataStr: $attr.data,
                            formStr: $attr.form || 'autofields',
                            classes: $attr['class'],
                            container: null,
                            formScope: null
                        };

                        //Helper Functions
                        var helper = {
                            extendDeep: function(dst) {
                                angular.forEach(arguments, function(obj) {
                                    if (obj !== dst) {
                                        angular.forEach(obj, function(value, key) {
                                            if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                                                helper.extendDeep(dst[key], value);
                                            } else {
                                                dst[key] = value;
                                            }
                                        });
                                    }
                                });
                                return dst;
                            }
                        };

                        // Import Directive-wide Handler Default Settings Import
                        directive.options = angular.copy($grAutofields.settings);

                        // Build fields from schema using handlers
                        var build = function(schema){
                            schema = schema || $scope[directive.schemaStr];

                            // Create HTML
                            directive.container.html('');
                            angular.forEach(schema, function(field, index){
                                var fieldEl = $grAutofields.createField(directive, field, index);
                                directive.container.append(fieldEl);
                            });

                            // Create Scope
                            if(directive.formScope != null) directive.formScope.$destroy();
                            directive.formScope = $scope.$new();
                            directive.formScope.data = $scope[directive.dataStr];
                            directive.formScope.fields = schema;
                            $grAutofields.updateScope(directive.formScope);

                            // Compile Element with Scope
                            $compile(directive.container)(directive.formScope);
                        };

                        // Init and Watch
                        $scope.$watch(directive.optionsStr, function (newOptions, oldOptions) {
                            helper.extendDeep(directive.options, newOptions);
                            if(newOptions !== oldOptions) build();
                        }, true);
                        $scope.$watch(directive.schemaStr, function (schema) {
                            build(schema);
                        }, true);
                        $scope.$watch(directive.formStr, function (form) {
                            directive.container.attr('name',directive.formStr);
                        });
                        $scope.$watch(function(){return $attr['class'];}, function (form) {
                            directive.classes = $attr['class'];
                            directive.container.attr('class', directive.classes);
                        });

                        directive.container = angular.element(directive.options.container);
                        directive.container.attr('name',directive.formStr);
                        directive.container.attr('class',directive.classes);
                        $element.replaceWith(directive.container);
                    }
                }
            }
        }]);

    angular.module('gr.ui.autofields.filters', [])
        .filter('phone', function(){
            return function (tel) {
                if (!tel) { return ''; }

                var value = tel.toString().trim().replace(/^\+/, '');

                if (value.match(/[^0-9]/)) {
                    return tel;
                }

                var country, city, number;

                switch (value.length) {
                    case 10:
                        country = 1;
                        city = value.slice(0, 2);
                        number = value.slice(2);
                        number = number.slice(0, 4) + '-' + number.slice(4);
                        break;

                    case 11:
                        country = 1;
                        city = value.slice(0, 2);
                        number = value.slice(2);
                        number = number.slice(0, 5) + '-' + number.slice(5);
                        break;

                    default:
                        return tel;
                }

                if (country == 1) {
                    country = "";
                }

                return (country + " (" + city + ") " + number).trim();
            };
        });

    angular.module('gr.ui.autofields.standard',['gr.ui.autofields.core'])
        .config(['$grAutofieldsProvider', '$localeProvider', function($grAutofieldsProvider, $localeProvider){
            // Text Field Handler
            $grAutofieldsProvider.settings.fixUrl = true;
            $grAutofieldsProvider.registerHandler(['text','email','url','date','number','password'], function(directive, field, index){
                var fieldElements = $grAutofieldsProvider.field(directive, field, '<input/>');

                var fixUrl = (field.fixUrl ? field.fixUrl : directive.options.fixUrl);
                if(field.type == 'url' && fixUrl) fieldElements.input.attr('fix-url','');

                return fieldElements.fieldContainer;
            });

            // Select Field Handler
            $grAutofieldsProvider.settings.defaultOption = 'Select One';
            $grAutofieldsProvider.registerHandler('select', function(directive, field, index){
                var defaultOption = (field.defaultOption ? field.defaultOption : directive.options.defaultOption);

                var inputHtml = '<select><option value="">'+defaultOption+'</option></select>';
                var inputAttrs = {
                    ngOptions: field.list
                };

                var fieldElements = $grAutofieldsProvider.field(directive, field, inputHtml, inputAttrs);

                return fieldElements.fieldContainer;
            });

            //Textarea Field Handler
            $grAutofieldsProvider.settings.textareaRows = 3;
            $grAutofieldsProvider.registerHandler('textarea', function(directive, field, index){
                var rows = field.rows ? field.rows : directive.options.textareaRows;
                var fieldElements = $grAutofieldsProvider.field(directive, field, '<textarea/>', {rows: rows});

                return fieldElements.fieldContainer;
            });

            //Checkbox Field Handler
            $grAutofieldsProvider.registerHandler('checkbox', function(directive, field, index){
                var fieldElements = $grAutofieldsProvider.field(directive, field, '<input/>');

                if(fieldElements.label) fieldElements.label.prepend(fieldElements.input);

                return fieldElements.fieldContainer;
            });

            // Money Handler
            $grAutofieldsProvider.registerHandler('money', function(directive, field, index){
                var currency_sym = $localeProvider.$get().NUMBER_FORMATS.CURRENCY_SYM;
                field.type = 'text';
                if(!field.attr){ field.attr = []; }
                if(!field.addons){ field.addons = []; }
                field.attr.uiNumberMask = 2;
                field.addons.push({
                    before: true,
                    content: currency_sym
                });
                var fieldElements = $grAutofieldsProvider.field(directive, field, '<input/>');
                return fieldElements.fieldContainer;
            });

            // Phone Handler
            $grAutofieldsProvider.registerHandler('phone', function(directive, field, index){
                field.type = 'text';
                if(!field.attr){ field.attr = {}; }
                if(!field.addons){ field.addons = []; }
                field.attr.uiBrPhoneNumber = true;
                field.placeholder = field.placeholder ? field.placeholder : '(xx) xxxx-xxxx';
                field.addons.push({
                    before: true,
                    icon: 'fa fa-fw fa-phone'
                });
                var fieldElements = $grAutofieldsProvider.field(directive, field, '<input/>');
                return fieldElements.fieldContainer;
            });
            $grAutofieldsProvider.registerHandler('mobilephone', function(directive, field, index){
                field.type = 'text';
                if(!field.attr){ field.attr = {}; }
                if(!field.addons){ field.addons = []; }
                field.attr.uiBrPhoneNumber = true;
                field.placeholder = field.placeholder ? field.placeholder : '(xx) xxxxx-xxxx';
                field.addons.push({
                    before: true,
                    icon: 'fa fa-fw fa-phone'
                });
                var fieldElements = $grAutofieldsProvider.field(directive, field, '<input/>');
                return fieldElements.fieldContainer;
            });

            // Register Hide/Show Support
            $grAutofieldsProvider.settings.displayAttributes = ($grAutofieldsProvider.settings.displayAttributes || []).concat(['ng-if', 'ng-show', 'ng-hide']);
            $grAutofieldsProvider.registerMutator('displayAttributes',function(directive, field, fieldElements){
                if(!field.attr) return fieldElements;

                // Check for presence of each display attribute
                angular.forEach($grAutofieldsProvider.settings.displayAttributes, function(attr){
                    var value = fieldElements.input.attr(attr);

                    // Stop if field doesn't have attribute
                    if(!value) return;

                    // Move attribute to parent
                    fieldElements.fieldContainer.attr(attr, value);
                    fieldElements.input.removeAttr(attr);
                });

                return fieldElements;
            });
        }]);

    angular.module('gr.ui.autofields.bootstrap', ['gr.ui.autofields.standard', 'ui.bootstrap', 'gr.ui.translate'])
        .config(['$grAutofieldsProvider', '$localeProvider', '$grTranslateProvider', function($grAutofieldsProvider, $localeProvider, $grTranslateProvider){
            // Add Bootstrap classes
    		$grAutofieldsProvider.settings.classes.container.push('form-group');
    		$grAutofieldsProvider.settings.classes.input.push('form-control');
    		$grAutofieldsProvider.settings.classes.label.push('control-label');

            // Override Checkbox Field Handler
    		$grAutofieldsProvider.registerHandler('checkbox', function(directive, field, index){
    			var fieldElements = $grAutofieldsProvider.field(directive, field, '<input/>');

    			if(fieldElements.label){
                    fieldElements.label.prepend(fieldElements.input).addClass('form-control');
                };
    			fieldElements.input.removeClass('form-control');
                angular.element('<i class="fa fa-fw fa-lg fa-check-circle success-icon"></i>').insertBefore(fieldElements.input);
                angular.element('<i class="fa fa-fw fa-lg fa-times-circle error-icon"></i>').insertBefore(fieldElements.input);

    			return fieldElements.fieldContainer;
    		});
            /*
            // Date Handler with Bootstrap Popover
    		$grAutofieldsProvider.settings.dateSettings = {
    			showWeeks:false,
    			datepickerPopup: 'MMMM dd, yyyy'
    		};
    		$grAutofieldsProvider.settings.scope.datepickerOptions = {
    			showWeeks:false
    		};
    		$grAutofieldsProvider.settings.scope.openCalendar = function($scope, property, e){
    			e.preventDefault();
    			e.stopPropagation();

    			$scope[property] = !$scope[property];
    		};
            $grAutofieldsProvider.registerHandler('date', function(directive, field, index){
    			var showWeeks = field.showWeeks ? field.showWeeks : directive.options.dateSettings.showWeeks;
    			var datepickerPopup = field.datepickerPopup ? field.datepickerPopup : directive.options.dateSettings.datepickerPopup;

    			var inputAttrs = {
    				type:'text',
    				showWeeks: showWeeks,
    				datepickerPopup: datepickerPopup,
    				datepickerOptions: 'datepickerOptions',
    				isOpen: '$property_cleanOpen'
    			};

    			if (!(field.attr && field.attr.disabled == true)) {
    				field.$addons = [{
    					button: true,
    					icon: 'glyphicon glyphicon-calendar',
    					attr: { ngClick: 'openCalendar("$property_cleanOpen",$event)' }
    				}];
    			}

    			var fieldElements = $grAutofieldsProvider.field(directive, field, '<input/>', inputAttrs);

    			return fieldElements.fieldContainer;
    		});
            */
            //Label Mutator
            $grAutofieldsProvider.registerMutator('label', function(directive, field, fieldElements){
                if(field.label){
                    if(field.type !== 'checkbox' && field.type !== 'radio'){
                        fieldElements.label.html(field.label);
                        fieldElements.label.attr('gr-translate', '');
                    }else{
                        fieldElements.label.html('<span gr-translate>' + field.label + '</span>');
                    }
                    if(!field.placeholder){
                        fieldElements.input.attr('placeholder','');
                    }
                }
                if(!field.addons && field.type !== 'checkbox' && field.type !== 'html' && field.type !== 'filemanager'){
                    fieldElements.input.wrap('<div class="input-wrapper"></div>');
                    fieldElements.label.insertBefore(fieldElements.input);
                    angular.element('<i class="fa fa-fw fa-lg fa-check-circle success-icon"></i>').insertBefore(fieldElements.input);
                    angular.element('<i class="fa fa-fw fa-lg fa-times-circle error-icon"></i>').insertBefore(fieldElements.input);
                    fieldElements.label = angular.element('');
                }

                return fieldElements;
            });

            // Static Field Handler
    		$grAutofieldsProvider.registerHandler('static', function(directive, field, index){
    			// var showWeeks = field.showWeeks ? field.showWeeks : directive.options.dateSettings.showWeeks;
    			// var datepickerPopup = field.datepickerPopup ? field.datepickerPopup : directive.options.dateSettings.datepickerPopup;

    			var fieldElements = $grAutofieldsProvider.field(directive, field, '<p/>');

    			//Remove Classes & Attributes
    			var input = angular.element('<p/>');
    			input.attr('ng-bind', fieldElements.input.attr('ng-model'));
    			input.addClass('form-control-static');
    			fieldElements.input.replaceWith(input);

    			return fieldElements.fieldContainer;
    		});

            // Multiple Per Row Handler
    		$grAutofieldsProvider.settings.classes.row = $grAutofieldsProvider.settings.classes.row || [];
    		$grAutofieldsProvider.settings.classes.row.push('row');
    		$grAutofieldsProvider.settings.classes.col = $grAutofieldsProvider.settings.classes.col || [];
    		$grAutofieldsProvider.settings.classes.col.push('col-sm-$size');
    		$grAutofieldsProvider.settings.classes.colOffset = $grAutofieldsProvider.settings.classes.colOffset || [];
    		$grAutofieldsProvider.settings.classes.colOffset.push('col-sm-offset-$size');
    		$grAutofieldsProvider.registerHandler('multiple', function(directive, field, index){
    			var row = angular.element('<div/>');
    			row.addClass(directive.options.classes.row.join(' '));

    			angular.forEach(field.fields, function(cell, cellIndex){
    				var cellContainer = angular.element('<div/>')
    				var cellSize = cell.type != 'multiple' ? cell.columns || field.columns : field.columns;
    				cellContainer.addClass(directive.options.classes.col.join(' ').replace(/\$size/g,cellSize));

    				cellContainer.append($grAutofieldsProvider.createField(directive, cell, cellIndex));

    				row.append(cellContainer);
    			})

    			return row;
    		});

            // Button Handler
            $grAutofieldsProvider.registerHandler('button', function(directive, field, index){
                var button = angular.element('<button type="button" style="margin-top: 25px;"/>'),
                    label = field.label ? '{{\'' + field.label + '\' | grTranslate}}' : '',
                    wrapper = angular.element('<div/>');
                button.attr(field.attr).attr('ng-attr-title', label).html(label);
                button.before(angular.element('<label>&nbsp;</label>'));
                if(field.addons){
                    var buttonGroup = angular.element('<div class="input-group"/>'),
                        addon = angular.element('<span class="input-group-addon"/>');
                    button.removeAttr('style').addClass('form-control');
                    buttonGroup.append(button).attr({
                        style: 'width: 1%; margin-top: 25px;'
                    });
                    if(field.addons.content){
                        addon.html(field.addons.content);
                    }else if(field.addons.icon){
                        addon.html('<i class="' + field.addons.icon + '" />');
                    }
                    if(field.addons.before){
                        buttonGroup.prepend(addon);
                    }else{
                        buttonGroup.append(addon);
                    }
                    wrapper.append(buttonGroup);
                }else{
                    wrapper.append(button);
                }
                if(angular.isObject(field.columns)){
                    angular.forEach(field.columns, function(col, id){
                        wrapper.addClass('col-' + id + '-' + col);
                    });
                }else{
                    wrapper.addClass('col-sm-' + field.columns);
                }
                return wrapper;
            });

            // Columns Handler
            $grAutofieldsProvider.registerMutator('columns', function(directive, field, fieldElements){
                if(field.type !== 'multiple' && field.columns){
                    if(angular.isObject(field.columns)){
                        if(field.columns.xs){
                            fieldElements.fieldContainer.removeClass('col-xs-12');
                        }
                        angular.forEach(field.columns, function(col, id){
                            fieldElements.fieldContainer.addClass('col-' + id + '-' + col);
                        });
                    }else{
                        fieldElements.fieldContainer.addClass('col-sm-' + field.columns);
                    }
                }
                return fieldElements;
            });

            // Number Mutator
            $grAutofieldsProvider.registerMutator('number', function(directive, field, fieldElements){
                if(!field.number) return fieldElements;
                if(!field.attr){ field.attr = []; }
                field.attr.mask = '9';
                field.attr.restrict = 'reject';
                field.attr.repeat = field.attr.max ? field.attr.max.length : 255;
                field.attr.maskValidate = false;
                return fieldElements;
            });

            // Register Help Block Support
    		$grAutofieldsProvider.settings.classes.helpBlock = $grAutofieldsProvider.settings.classes.helpBlock || [];
    		$grAutofieldsProvider.settings.classes.helpBlock.push('help-block');
    		$grAutofieldsProvider.registerMutator('helpBlock', function(directive, field, fieldElements){
    			if(!field.help) return fieldElements;

    			fieldElements.helpBlock = angular.element('<p/>');
    			fieldElements.helpBlock.addClass(directive.options.classes.helpBlock.join(' '))
    			fieldElements.helpBlock.html(field.help);
    			fieldElements.fieldContainer.append(fieldElements.helpBlock);

    			return fieldElements;
    		});

            // Register Addon Support
    		$grAutofieldsProvider.settings.classes.inputGroup = ['input-container'];
    		$grAutofieldsProvider.settings.classes.inputGroupAddon = ['input-item','input-item-addon'];
    		$grAutofieldsProvider.settings.classes.inputGroupAddonButton = ['input-item','input-item-btn'];
    		$grAutofieldsProvider.settings.classes.button = ['btn','btn-default'];
    		$grAutofieldsProvider.registerMutator('addons', function(directive, field, fieldElements){
    			if(!(field.$addons || field.addons)) return fieldElements;

    			fieldElements.inputGroup = angular.element('<div/>');
    			fieldElements.inputGroup.addClass($grAutofieldsProvider.settings.classes.inputGroup.join(' '));

    			var toAppend = [];
    			angular.forEach(field.$addons || field.addons, function(addon){
    				var inputGroupAddon = angular.element('<div/>'),
    					button = null;
    				inputGroupAddon.addClass($grAutofieldsProvider.settings.classes.inputGroupAddon.join(' '));

    				if(addon.button){
    					inputGroupAddon.attr('class',$grAutofieldsProvider.settings.classes.inputGroupAddonButton.join(' '));
    					button = angular.element('<button type="button"/>');
    					button.addClass($grAutofieldsProvider.settings.classes.button.join(' '));
    					inputGroupAddon.append(button);
    				}
    				if(addon.icon != null){
    					var icon = angular.element('<i/>');
    					icon.addClass(addon.icon);
    					(button||inputGroupAddon).append(icon);
    				}
    				if(addon.content != null) (button||inputGroupAddon).html(addon.content);
    				if(addon.attr) $grAutofieldsProvider.setAttributes(directive, field, (button||inputGroupAddon), addon.attr);

    				if(addon.before) fieldElements.inputGroup.append(inputGroupAddon);
    				else toAppend.push(inputGroupAddon);
    			});

                if(field.type === 'filemanager'){
                    fieldElements.label = angular.element('');
                }

    			fieldElements.inputGroup.append(angular.element('<div class="input-wrapper input-item"></div>').append(fieldElements.label).append(fieldElements.input));
    			angular.forEach(toAppend, function(el){fieldElements.inputGroup.append(el)});
                fieldElements.label = angular.element('');

                if(field.type !== 'filemanager'){
                    fieldElements.inputGroup.children('.input-wrapper').prepend('<i class="fa fa-fw fa-lg fa-check-circle success-icon"></i>').prepend('<i class="fa fa-fw fa-lg fa-times-circle error-icon"></i>');
                }

                fieldElements.fieldContainer.append(fieldElements.inputGroup);
    			return fieldElements;
    		})

            // Register Horizontal Form Support
    		$grAutofieldsProvider.settings.layout = {
    			type: 'basic',
    			labelSize: 2,
    			inputSize: 10
    		};
    		$grAutofieldsProvider.registerMutator('horizontalForm', function(directive, field, fieldElements){
    			if(!(directive.options.layout && directive.options.layout.type == 'horizontal')){
    				directive.container.removeClass('form-horizontal');
    				return fieldElements;
    			}

    			// Classes & sizing
    			var col = $grAutofieldsProvider.settings.classes.col[0];
    			var colOffset = $grAutofieldsProvider.settings.classes.colOffset[0];
    			var labelSize = field.labelSize ? field.labelSize : directive.options.layout.labelSize;
    			var inputSize = field.inputSize ? field.inputSize : directive.options.layout.inputSize;

    			//Add class to container
    			directive.container.addClass('form-horizontal');

    			// Add input container & sizing class
    			var inputContainer = angular.element('<div/>');
    			inputContainer.addClass(col.replace(/\$size/gi, inputSize));


    			// Add label sizing class
    			if(fieldElements.label && field.type != 'checkbox'){
    				fieldElements.label.addClass(col.replace(/\$size/gi, labelSize));
    				fieldElements.label.after(inputContainer);
    			}else{
    				fieldElements.fieldContainer.prepend(inputContainer);
    				inputContainer.addClass(colOffset.replace(/\$size/g,labelSize));
    			}

    			// Add input container sizing class
    			if(field.type == 'checkbox'){
    				fieldElements.fieldContainer.removeClass('checkbox');
    				var checkboxContainer = angular.element('<div/>');
    				checkboxContainer.addClass('checkbox');
    				checkboxContainer.append(fieldElements.label);
    				inputContainer.append(checkboxContainer);
    			}else{
    				inputContainer.append(fieldElements.inputGroup || fieldElements.input);
    			}


    			// Move Help Block
    			if(field.help){
    				inputContainer.append(fieldElements.helpBlock);
    			}

    			return fieldElements;
    		}, {require:'helpBlock'});
        }]);

    angular.module('gr.ui.autofields.validation', ['gr.ui.autofields.core'])
        .config(['$grAutofieldsProvider', function($grAutofieldsProvider){
            var helper = {
                CamelToTitle: function (str) {
                    return str
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, function (str) { return str.toUpperCase(); });
                }
            };

            // Add Validation Settings
            $grAutofieldsProvider.settings.validation = {
                enabled: true,
                showMessages: true,
                defaultMsgs: {
                    required: 'This field is required',
                    minlength: 'This is under minimum length',
                    maxlength: 'This exceeds maximum length',
                    min: 'This is under the minumum value',
                    max: 'This exceeds the maximum value',
                    email: 'This is not a valid email address',
                    valid: ''
                },
                invalid: '$form.$property_clean.$invalid && $form.$property_clean.$dirty',
                valid: '$form.$property_clean.$valid'
            };

            // Add Validation Attributes
            $grAutofieldsProvider.settings.attributes.container.ngClass = "{'invalid':"+$grAutofieldsProvider.settings.validation.invalid+", 'valid':"+$grAutofieldsProvider.settings.validation.valid+"}";

            // Add Validation Mutator
            $grAutofieldsProvider.registerMutator('validation', function(directive, field, fieldElements){
                //Check to see if validation should be added
                fieldElements.validation = directive.options.validation.enabled && field.validate !== false;
                if(!fieldElements.validation){
                    //If not enabled, remove validation hooks
                    fieldElements.fieldContainer.removeAttr('ng-class');
                    return fieldElements;
                }

                // Get Error Messages
                fieldElements.msgs = [];
                if(!directive.options.validation.showMessages) return fieldElements;
                angular.forEach(angular.extend({}, directive.options.validation.defaultMsgs, field.msgs), function(message, error){
                    if(
                        (field.msgs && field.msgs[error] != null) ||
                        (field.type == error) ||
                        (field.attr &&
                            (field.attr[error] != null ||
                            field.attr['ng'+helper.CamelToTitle(error)] != null)
                        )
                    ){
                        var $property_clean  = field.property.replace(/\[|\]|\./g, '');
                            fieldElements.msgs.push('('+directive.formStr+'.'+$property_clean+'.$error.'+error+'? \''+message+'\' : \'\')');
                    }
                });
                // Get Valid Message
                fieldElements.validMsg = (field.msgs && field.msgs.valid)? field.msgs.valid : directive.options.validation.defaultMsgs.valid;

                // Add validation attributes
                if(fieldElements.msgs.length){
                    // Add message display with ng-show/ng-hide
                    // using a mutator that requires 'validation'
                }

                return fieldElements;
            });
        }]);

    angular.module('gr.ui.autofields.bootstrap.validation',['gr.ui.autofields.validation'])
        .config(['$tooltipProvider', function($tooltipProvider){
            $tooltipProvider.setTriggers({'keyup focus':'blur'});
            $tooltipProvider.options({
                placement:'top',
                animation:false
            });
        }])
        .config(['$grAutofieldsProvider', function($grAutofieldsProvider){
            // Add Validation Attributes
            $grAutofieldsProvider.settings.attributes.container.ngClass = '{\'has-error\':$form.$property_clean.$invalid && $form.$submitted, \'has-success\':$form.$property_clean.$valid && $form.$submitted, \'required\': $required, \'has-value\': ($form.$property_clean.$modelValue !== \'\' && $form.$property_clean.$modelValue !== undefined && $form.$property_clean.$modelValue !== null)}';
            $grAutofieldsProvider.settings.attributes.input.popover = '{{("+$grAutofieldsProvider.settings.validation.valid+") ? \'$validMsg\' : ($errorMsgs)}}';

            // Dont show popovers on these types
    		// this is to avoid multiple scope errors with UI Bootstrap
    		$grAutofieldsProvider.settings.noPopover = ['date'];

            // Validation Mutator
    		$grAutofieldsProvider.registerMutator('bootstrap-validation', function(directive, field, fieldElements){
    			//Check to see if validation should be added
    			if(!fieldElements.validation || $grAutofieldsProvider.settings.noPopover.indexOf(field.type) != -1){
    				//If not enabled, remove validation hooks
    				fieldElements.input.removeAttr('popover');
    				return fieldElements;
    			}

    			// Add validation attributes
    			if(fieldElements.msgs.length){
    				var popoverAttr = fieldElements.input.attr('popover')
    									.replace(/\$validMsg/gi, fieldElements.validMsg)
    									.replace(/\$errorMsgs/gi, fieldElements.msgs.join('+'));
    				fieldElements.input.attr({
    					'popover-trigger':'keyup focus',
    					'popover':popoverAttr
    				});
    			}else{
    				fieldElements.input.removeAttr('popover');
    			}

    			return fieldElements;
    		}, {require:'validation', override:true});
        }]);

    angular.module('gr.ui.autofields',['gr.ui.autofields.core', 'gr.ui.autofields.services', 'gr.ui.autofields.directives', 'gr.ui.autofields.filters', 'gr.ui.autofields.standard', 'gr.ui.autofields.bootstrap', 'gr.ui.autofields.bootstrap.validation']);
}());

/*
 *
 * GR-AUTOHEIGHT
 *
 */

(function(){
    angular.module('gr.ui.autoheight', []).directive('grAutoheight', ['$rootScope', '$window', '$document', '$timeout', function ($rootScope, $window, $document, $timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var settings = {
                        bsCols: {
                            xs: 1,
                            sm: 1,
                            md: 1,
                            lg: 1
                        },
                        ajust: 0,
                        height: 0,
                        ignore: []
                    },
                    viewPort = function(el){
                        var w = el || $window,
                            d = $window.document,
                            viewPort = {
                                width: 0,
                                height: 0
                            },
                            setBs = function(){
                                if(viewPort.width < 768){
                                    viewPort.bs = 'xs';
                                }
                                if(viewPort.width >= 768){
                                    viewPort.bs = 'sm';
                                }
                                if(viewPort.width >= 990){
                                    viewPort.bs = 'md';
                                }
                                if(viewPort.width >= 1200){
                                    viewPort.bs = 'lg';
                                };
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
                        return viewPort;
                    },
                    maxHeight = function(elements){
                        var max = 0;
                        angular.forEach(elements, function(el){
                            if(el.outerHeight() > max){
                                max = el.outerHeight();
                            }
                        });
                        return max;
                    },
                    ajust = function(){
                        var cols = settings.bsCols[viewPort().bs];
                        if(cols === 0){
                            $element[0].style.height = null;
                            $element.outerHeight($element.parent().innerHeight() + settings.ajust);
                        }else if(cols === 1){
                            $element[0].style.height = null;
                        }else{
                            var siblings = $element.parent().children(),
                                map = [],
                                elSiblings = [];
                            for(var aux = 0, pos = 0; aux < siblings.length; aux++){
                                if(!map[pos]){
                                    map[pos] = [];
                                }
                                if(map[pos].length === cols){
                                    pos++;
                                    map[pos] = [];
                                }
                                map[pos].push(aux);
                            }
                            angular.forEach(map, function(subMap, id){
                                var found = false;
                                angular.forEach(subMap, function(item){
                                    if(item === $element.index()){
                                        found = true;
                                    }
                                });
                                if(!found){
                                    delete map[id];
                                }
                            });
                            angular.forEach(map, function(subMap){ map = subMap; });
                            angular.forEach(siblings, function(el, id){
                                var elm = angular.element(el);
                                if(map.indexOf(id) > -1 && elm.attr('gr-autoheight')){
                                    elSiblings.push(elm);
                                }
                            });
                            angular.forEach(elSiblings, function(el){
                                el[0].style.height = null;
                            });
                            if(settings.ignore.indexOf(viewPort().bs) === -1){
                                $timeout(function(){
                                    var max = maxHeight(elSiblings);
                                    angular.forEach(elSiblings, function(el){
                                        var elm = angular.element(el);
                                        elm.outerHeight(max);
                                    });
                                    $element.outerHeight(max + settings.ajust);
                                });
                            }
                        }
                    }
                angular.element($window).on('resize', function(){
                    $timeout(ajust);
                });
                $timeout(ajust);
                $timeout(ajust, 100);
                $scope.grAutoheightAjust = function(){
                    $rootScope.$broadcast('gr-autoheight-ajust');
                }
                $scope.$on('gr-autoheight-ajust', ajust);
                $attrs.$observe('ignore', function(ignore){
                    if(ignore){
                        settings.ignore = ignore.split(',');
                    }
                });
                $attrs.$observe('ajust', function(ajust){
                    if(ajust){
                        settings.ajust = parseFloat(ajust);
                    }
                });
                $attrs.$observe('grAutoheight', function(args){
                    if(args){
                        while(args.indexOf('\'') > -1){ args = args.replace('\'',''); }
                        while(args.indexOf('"') > -1){ args = args.replace('"',''); }
                        args = angular.fromJson(args.replace('xs', '"xs"').replace('sm', '"sm"').replace('md', '"md"').replace('lg', '"lg"'));
                        angular.extend(settings.bsCols, args);
                    }else{
                        settings.bsCols = {
                            xs:0,
                            sm:0,
                            md:0,
                            lg:0
                        };
                    }
                });
            }
        };
    }]);
}());

/*
 *
 * GR-AUTOSCALE
 *
 */

(function(){
    angular.module('gr.ui.autoscale', []).directive('grAutoscale', ['$rootScope','$timeout', function($rootScope, $timeout){
        return {
            restrict: 'A',
            scope: {
                scale: '=grAutoscale',
                watch: '=grAutoscaleIf'
            },
            link: function($scope, $element, $attrs){
                var scale,
                    width = 0;
                $scope.$watch('scale', function(s){
                    if(s){
                        scale = s.split(':');
                    }
                });
                function applyScale(a){
                    if(scale && scale[0] && scale[1]){
                        $timeout(function(){
                            $element.css('height', ((width*scale[1])/scale[0]) + 'px');
                        });
                    }
                }

                $scope.$watch('watch', applyScale);

                $scope.$watch(function(){
                    return $element.width();
                }, function(w){
                    width = w;
                    applyScale();
                });
            }
        }
    }]);
}());

/*
 *
 * GR-AFFIX
 *
 */

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

/*
 *
 * GR-CAROUSEL
 *
 */

(function(){
    angular.module('gr.ui.carousel', [])
        .directive('grCarousel', ['$templateCache', '$compile', '$window', '$timeout', function($templateCache, $compile, $window, $timeout){
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                template: function(){ return $templateCache.get('gr-carousel/carousel.html'); },
                link: function($scope, $element, $attrs, $ctrl, $transclude){
                    $transclude($scope, function($clone){
                        angular.forEach($clone, function(el){
                            var $el = angular.element(el);
                            if($el.hasClass('gr-carousel-indicator')){
                                $el.appendTo($element);
                            };
                        });
                    });
                    var ready = false,
                        defaults = {
                            current: 0,
                            running: false,
                            autoplay: false,
                            hover: false,
                            interval: 4000,
                            bsCols: {xs:1, sm:1, md:1, lg:1}
                        },
                        carousel = {
                            id: $attrs.id || 'carousel',
                            ready: function(_ready){
                                if(_ready !== undefined && _ready !== null){
                                    ready = _ready;
                                }else{
                                    return ready;
                                }
                            },
                            current: defaults.current,
                            running: defaults.running,
                            hover: defaults.hover,
                            autoplay: defaults.autoplay,
                            interval: defaults.interval,
                            scope: $scope,
                            attrs: $attrs,
                            scroller: [],
                            items: [],
                            itemWidth: 0,
                            visible: 0,
                            indicators: [],
                            bsCols: defaults.bsCols,
                            animate: function(pos, done, easing){
                                carousel.scroller.stop(true, false).animate({
                                    left: pos
                                }, {
                                    duration: 'slow',
                                    easing: easing || 'easeOutQuint',
                                    done: function(){
                                        if(done && angular.isFunction(done)){
                                            done();
                                        }
                                    }
                                });
                            },
                            ajust: function(){
                                if(carousel.items.length > 0){
                                    carousel.drag.enable = carousel.items.length > carousel.visible;
                                    var width = relativeWidth(carousel);
                                    $element.find('img').on('dragstart', function(e){ e.preventDefault() });
                                    carousel.items.outerWidth(width);
                                    carousel.scroller.width(width * carousel.items.length);
                                    carousel.itemWidth = width;
                                    // if($element.find('img:visible').length > 0){ $timeout(function(){ $element.height(carousel.scroller.height()); },100); }else{ $element[0].style.height = null; }
                                    // $timeout(function(){ $element.height(carousel.scroller.height()); });
                                    carousel.reset();
                                    $timeout(function(){
                                        carousel.ready(true);
                                    });
                                }
                            },
                            isVisible: function(index){
                                index = (index !== 0 && index !== '0')? parseInt(index) : 0;
                                if(index >= 0){
                                    return index >= carousel.current && index < (carousel.current + carousel.visible);
                                }else{
                                    var visible = [],
                                        start = carousel.current,
                                        end = (carousel.current + carousel.visible);
                                    for(var x = start; x < end; x++){
                                        visible.push(x);
                                    };
                                    return visible;
                                }
                            },
                            drag: {
                                enable: true,
                                dragging: false,
                                start: function($event){
                                    if(carousel.drag.enable === true){
                                        carousel.drag.dragging = true;
                                        var coords = {
                                                x: ($event.clientX || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientX : false)) - $element.offset().left,
                                                y: ($event.clientY || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientY : false)) - $element.offset().top
                                            };
                                        drgW = carousel.scroller.outerWidth();
                                        posX = parseFloat(carousel.scroller.css('left')) + drgW - coords.x;
                                        sCoords = angular.copy(coords);
                                    }
                                },
                                move: function($event){
                                    if(carousel.drag.dragging === true && carousel.drag.enable === true){
                                        var coords = { // Get cursor position while move
                                                x: ($event.clientX || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientX : false)) - $element.offset().left,
                                                y: ($event.clientY || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientY : false)) - $element.offset().top
                                            },
                                            limit = { // Get de carousel-wrapper offsets
                                                x: {
                                                    left: $element.offset().left,
                                                    right: $element.offset().left + $element.width()
                                                },
                                                y: {
                                                    top: $element.offset().top,
                                                    bottom: $element.offset().top + $element.height()
                                                }
                                            },
                                            left = coords.x + posX - drgW, // Get de screller move position relative to cursor move
                                            elWidth = $element.innerWidth() // Get de carousel-wrapper inner width
                                        if(!coords.x || !coords.y){ return false; }
                                        // Elastic effect out of left or right
                                        if((left + $element.offset().left) > limit.x.left || (left + $element.offset().left + drgW) < limit.x.right){
                                            left -= ((coords.x - sCoords.x)*0.75);
                                        }
                                        carousel.scroller.stop(true, true).animate({
                                            left: left
                                        }, {
                                            duration: 'slow',
                                            easing: 'easeOutQuint'
                                        });
                                    }
                                },
                                end: function(){
                                    if(carousel.drag.enable === true){
                                        carousel.drag.dragging = false;
                                        var left = parseFloat(carousel.scroller.css('left')),
                                            elWidth = $element.innerWidth(),
                                            index = 0,
                                            map = [],
                                            aux = 0;
                                        if(left > 0){
                                            left = 0;
                                        }else if(left < ((drgW - elWidth) * -1)){
                                            left = (drgW - elWidth) * -1;
                                        }
                                        angular.forEach(carousel.items, function(){
                                            map.push(aux + (carousel.itemWidth/2));
                                            aux += carousel.itemWidth;
                                        });
                                        angular.forEach(map, function(pos, id){
                                            if((left * -1) >= pos){
                                                index = id + 1;
                                            }
                                        });
                                        carousel.stop();
                                        carousel.go(index);
                                    }
                                }
                            },
                            timeout: {
                                running: false,
                                timer: ''
                            },
                            checkRun: function(){
                                return (carousel.items.length > carousel.visible) && carousel.running && !carousel.hover && !carousel.drag.dragging && carousel.autoplay;
                            },
                            invokeRun: function(){
                                $timeout.cancel(carousel.timeout.timer);
                                carousel.timeout.timer = $timeout(function(){ carousel.run(); }, carousel.interval);
                            },
                            run: function(){
                                if(carousel.checkRun()){
                                    if((carousel.current + carousel.visible) < carousel.items.length){
                                        carousel.current = carousel.current + 1;
                                    }else{
                                        carousel.current = 0;
                                    }
                                    carousel.animate((carousel.itemWidth * carousel.current) * -1, function(){
                                        carousel.invokeRun();
                                    });
                                }else{ carousel.invokeRun(); }
                            },
                            play: function(){
                                carousel.running = true;
                                carousel.invokeRun();
                                $timeout(function(){ $scope.$apply(); });
                            },
                            stop: function(){
                                if(carousel.visible >= carousel.items.length){
                                    return false;
                                }
                                carousel.running = false;
                                $timeout.cancel(carousel.timeout.timer);
                                $timeout(function(){ $scope.$apply(); });
                            },
                            allow: {
                                play: function(){
                                    return (carousel.items.length > carousel.visible) && !carousel.running && !carousel.hover && !carousel.drag.dragging && carousel.autoplay && carousel.interval > 0;
                                },
                                stop: function(){
                                    return (carousel.items.length > carousel.visible) && carousel.running && !carousel.hover && !carousel.drag.dragging && carousel.autoplay && carousel.interval > 0;
                                },
                                prev: function(){
                                    return (carousel.visible < carousel.items.length) && (carousel.current > 0);
                                },
                                next: function(){
                                    return (carousel.visible < carousel.items.length) && ((carousel.current + carousel.visible) < carousel.items.length);
                                },
                                go: function(index){
                                    if(!/^[0-9]+$/.test(index)){ return false; }
                                    index = parseInt(index);
                                    return (carousel.items.length >= carousel.visible) && ((index + carousel.visible) < carousel.items.length + 1);
                                }
                            },
                            prev: function(){
                                if(!carousel.allow.prev()){ return false; }
                                carousel.stop();
                                if(carousel.current > 0){
                                    carousel.current--;
                                }else{
                                    carousel.current = carousel.items.length - carousel.visible;
                                }
                                carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                $timeout(function(){ $scope.$apply(); });
                                if(carousel.allow.play()){
                                    carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 4));
                                }
                            },
                            next: function(){
                                if(!carousel.allow.next()){ return false; }
                                carousel.stop();
                                if((carousel.current + carousel.visible) < carousel.items.length){
                                    carousel.current++;
                                }else{
                                    carousel.current = 0;
                                }
                                carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                $timeout(function(){ $scope.$apply(); });
                                if(carousel.allow.play()){
                                    carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 4));
                                }
                            },
                            go: function(index){
                                if(!carousel.allow.go(index)){ return false; }
                                carousel.stop();
                                index = parseInt(index);
                                if(index >= 0){
                                    if((index + carousel.visible) > carousel.items.length){
                                        index = carousel.items.length - carousel.visible;
                                        if(index < 0){
                                             index = 0;
                                        }
                                    }
                                    carousel.current = index;
                                    carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                    $timeout(function(){ $scope.$apply(); });
                                }
                                if(carousel.allow.play()){
                                    carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 4));
                                }
                            },
                            reset: function(){
                                carousel.current = 0;
                                carousel.stop();
                                carousel.animate(0, function(){
                                    if(carousel.allow.play()){
                                        carousel.play();
                                    }
                                });
                                $timeout(function(){ $scope.$apply(); });
                            }
                        },
                        drgW, posX, sCoords,
                        $public = {
                            ready: carousel.ready,
                            maxIndex: function(){ return carousel.items.length - carousel.visible; },
                            isRunning: carousel.checkRun,
                            isVisible: carousel.isVisible,
                            isCurrent: function(index){ return index ? carousel.current === parseInt(index) : false; },
                            autoplay: function(){ return carousel.autoplay; },
                            interval: function(){ return carousel.interval; },
                            bsCols: function(){ return carousel.bsCols; },
                            allow: carousel.allow,
                            current: function(){ return carousel.current; },
                            indicators: carousel.indicators,
                            play: carousel.play,
                            stop: carousel.stop,
                            next: carousel.next,
                            prev: carousel.prev,
                            go: carousel.go,
                            reset: carousel.reset,
                            ajust: carousel.ajust,
                            drag: carousel.drag
                        },
                        viewPort = function(el){
                            var w = el || $window,
                                d = w.document,
                                _return = {};
                            if(w.innerWidth != null){
                                _return = {
                                    width: w.innerWidth,
                                    height: w.innerHeight
                                };
                            };
                            if(document.compatMode == "CSS1Compat"){
                                _return = {
                                    width: d.documentElement.clientWidth,
                                    height: d.documentElement.clientHeight
                                };
                            };
                            _return = {
                                width: d.body.clientWidth,
                                height: d.body.clientHeight
                            };
                            return _return;
                        },
                        relativeWidth = function(carousel){
                            var wWidth = viewPort().width,
                                width = $element.innerWidth(),
                                padding = parseFloat(carousel.scroller.css('padding-left')) + parseFloat(carousel.scroller.css('padding-right')),
                                bs;
                            if(wWidth >= 1200){
                                bs = carousel.bsCols.lg || defaults.bsCols.lg;
                            }
                            if(wWidth < 1200){
                                bs = carousel.bsCols.md || defaults.bsCols.md;
                            }
                            if(wWidth < 991){
                                bs = carousel.bsCols.sm || defaults.bsCols.sm;
                            }
                            if(wWidth < 768){
                                bs = carousel.bsCols.xs || defaults.bsCols.xs;
                            }
                            carousel.visible = bs;
                            return Math.round((width/bs)-(padding/bs));
                        },
                        init = function(){
                            carousel.scroller = $element.children('.gr-carousel-inner');
                            $scope.$parent[carousel.id] = $public;
                            $scope.carousel = $public;
                            carousel.ajust();
                            $element.on({
                                mousedown: function($event){ if($event.button === 0){ carousel.drag.start($event); } },
                                mousemove: function($event){ if($event.button === 0){ carousel.drag.move($event); } },
                                touchstart: carousel.drag.start,
                                touchmove: carousel.drag.move,
                                mouseenter: function(){ carousel.hover = true; $scope.$apply(); },
                                mouseleave: function(){ carousel.hover = false; $scope.$apply(); }
                            });
                            angular.element($window).on({
                                mousemove: function($event){ if(carousel.drag.dragging && $event.button === 0){ carousel.drag.move($event) } },
                                mouseup: function($event){ if(carousel.drag.dragging && $event.button === 0){ carousel.drag.end($event) } },
                                touchmove: function($event){ if(carousel.drag.dragging){ carousel.drag.move($event) } },
                                touchend: function($event){ if(carousel.drag.dragging){ carousel.drag.end($event) } },
                                resize: function(){ carousel.ajust(); }
                            });
                            carousel.scroller.find('.gr-carousel-indicator').remove();
                        };
                    $scope.$watchCollection(function(){
                        if(carousel.scroller.length > 0){
                            return carousel.scroller.children('.gr-carousel-item');
                        }else{
                            return [];
                        }
                    }, function(items){
                        if(items && items.length > 0){
                            carousel.items = items;
                            angular.forEach(carousel.items, function(item, id){ carousel.indicators.push(id); });
                            carousel.ajust();
                        }
                    });
                    $scope.$watchCollection(function(){
                        return carousel.hover;
                    }, function(hover){
                        if(hover){
                            $timeout.cancel(carousel.timeout.timer);
                        }else{
                            carousel.invokeRun();
                        }
                    });
                    $scope.$watchCollection(function(){
                        return carousel.drag.dragging;
                    }, function(dragging){
                        if(dragging){
                            $timeout.cancel(carousel.timeout.timer);
                        }else{
                            carousel.invokeRun();
                        }
                    });
                    $attrs.$observe('bs', function(args){
                        if(args){
                            while(args.indexOf('\'') > -1){ args = args.replace('\'',''); }
                            while(args.indexOf('"') > -1){ args = args.replace('"',''); }
                            args = angular.fromJson(args.replace('xs', '"xs"').replace('sm', '"sm"').replace('md', '"md"').replace('lg', '"lg"'));
                            carousel.bsCols = args;
                        }
                        carousel.ajust();
                        carousel.reset();
                    });
                    $attrs.$observe('autoplay', function(autoplay){
                        carousel.autoplay = (autoplay !== false && autoplay !== 'false');
                        if(autoplay > 0){
                            carousel.interval = autoplay;
                            carousel.play();
                        }else if(autoplay === undefined || autoplay === null || autoplay === '' || autoplay === true || autoplay === 'true'){
                            carousel.interval = defaults.interval;
                            carousel.play();
                        }else{
                            carousel.interval = 0;
                            carousel.stop();
                        }
                    });
                    init();
                }
            }
        }])
        .directive('grCarouselItem', ['$templateCache', function($templateCache){
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                template: function(){
                    return $templateCache.get('gr-carousel/carousel-item.html');
                },
                link: function($scope, $element, $attrs, $ctrl, $transclude){
                    $transclude($scope, function(){});
                }
            }
        }])
        .directive('grCarouselIndicators', ['$templateCache', '$timeout', function($templateCache, $timeout){
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    carousel: '=for'
                },
                template: function(){
                    return $templateCache.get('gr-carousel/carousel-indicators.html');
                }
            }
        }])
        .run(['$templateCache', function($templateCache){
            $templateCache.put('gr-carousel/carousel.html', [
                '<div class="gr-carousel">',
                    '<div class="gr-carousel-inner" ng-show="carousel.ready()" ng-transclude></div>',
                '</div>'
            ].join(''));
            $templateCache.put('gr-carousel/carousel-item.html', '<div class="gr-carousel-item" ng-transclude></div>');
            $templateCache.put('gr-carousel/carousel-indicators.html', [
                '<ul class="gr-carousel-indicator">',
                    '<li class="gr-carousel-indicator-item" ng-class="{\'active\': carousel.isVisible($index)}" ng-repeat="item in carousel.indicators" ng-click="carousel.go($index)"></li>',
                '</ul>'
            ].join(''));
        }]);
}());

/*
 *
 * GR-MODAL
 *
 */

(function(){
    angular.module('gr.ui.modal', ['gr.ui.modal.provider', 'gr.ui.modal.factory', 'gr.ui.modal.directive', 'gr.ui.modal.template', 'gr.ui.translate']);
    angular.module('gr.ui.modal.provider', [])
        .provider('$grModal', function(){
            var $injector,
                $grStackedMap,
                $modal,
                $q,
                $templateCache,
                id = 0,
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
                    'button': {
                        'confirm': 'Confirm',
                        'cancel': 'Cancel',
                        'close': 'Close'
                    },
                    'new': function(config){
                        if(angular.isObject(config)){
                            if(!config.name){
                                return;
                            }
                            if(!config.size){
                                return;
                            }
                            if(!config.model && !config.text && !config.template){
                                return;
                            }
                            var element = {
                                'id': id,
                                'name': config.name,
                                'title': config.title || undefined,
                                'size': config.size,
                                'model': config.model,
                                'template': config.template,
                                'text': config.text,
                                'element': '',
                                'zIndex': config.zIndex,
                                'backdrop': config.backdrop !== undefined ? config.backdrop : true,
                                'buttons': config.buttons || false,
                                'events': {
                                    onOpen: config.onOpen || false,
                                    onClose: config.onClose || false
                                }
                            },
                            grModalInstance;
                            grModal.element[element.name] = element;
                            var modalClose = function(fn){
                                if(fn && angular.isObject(fn) && element.backdrop && config.beforeClose){
                                    if((fn.target !== fn.currentTarget)){ return false; }
                                    if(element.backdrop === 'static' && (fn.target === fn.currentTarget)){ return false; }
                                }
                                fn = ((!fn || (fn && !angular.isFunction(fn))) && config.beforeClose) ? config.beforeClose : fn;
                                if(!fn){
                                    grModalInstance.forceClose(fn);
                                }else{
                                    var promise = $q(function(resolve, reject){
                                        fn(resolve, reject);
                                    });
                                    promise.then(function(){
                                         grModalInstance.forceClose();
                                    });
                                }
                            };
                            var ModalInstanceCtrl = ['$scope', '$modalInstance', '$timeout', function($scope, $modalInstance, $timeout){
                                if(config.define && angular.isObject(config.define)){
                                    angular.forEach(config.define, function(d, i){
                                        $scope[i] = d;
                                    });
                                }
                                if(config.beforeClose){
                                    $scope.close = modalClose;
                                }
                                $scope.contentReady = false;
                                if(!config.preload){
                                    $scope.contentReady = true;
                                }
                                $scope.modal = $modalInstance;
                                $scope.modal.ready = function(){
                                    $timeout(function(){
                                        $scope.contentReady = true;
                                        $scope.$apply();
                                    });
                                }
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
                                        options.templateUrl = (element.model.indexOf('http://') > -1 || element.model.indexOf('https://') > -1) ? element.model : grModal.template.base + element.model;
                                    }else if(element.template){
                                        options.template = element.template;
                                    }
                                    grModalInstance = $modal.open(options);
                                    grModalInstance.close = modalClose;
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
                                'label': grModal.button.close,
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
                                'buttons': [
                                    {
                                        'type': 'primary',
                                        'label': grModal.button.confirm,
                                        'onClick': function(scope, element, controller){
                                            if(confirm && angular.isFunction(confirm)){
                                                confirm();
                                            }
                                            controller.close();
                                        }
                                    }, {
                                        'type': 'default',
                                        'label': grModal.button.cancel,
                                        'onClick': function(scope, element, controller){
                                            if(cancel && angular.isFunction(cancel)){
                                                cancel();
                                            }
                                            controller.close();
                                        }
                                    }
                                ],
                            'backdrop': 'static'
                            });
                        alert.open();
                    },
                    'events': {
                        'onOpen': function(){},
                        'onClose': function(){}
                    }
                },
                setup = function(injector){
                    $injector = injector;
                    $grStackedMap = $injector.get('$$grStackedMap');
                    $modal = $injector.get('$grModal.ui');
                    $templateCache = $injector.get('$templateCache');
                    $q = $injector.get('$q');
                };
            this.setButtons = function(fn){
                if(fn && angular.isFunction(fn)){
                    grModal.button = fn(grModal.button);
                }
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
                                forceClose: function(result){
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
                        get: function(key, test){
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

                        scope.$watch('$parent.contentReady', function(ready){
                            $timeout(function(){
                                scope.contentReady = ready;
                                scope.$apply();
                            });
                        }, true);

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
                        if(scope.$parent.close){
                            scope.close = scope.$parent.close;
                        }else{
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
                                        'ng-click': 'exec(buttons[' + id + '].onClick)',
                                        'ng-attr-title': '{{\'' + btn.label + '\' | grTranslate}}'
                                    };
                                    if(angular.isObject(btn.attr)){
                                        angular.forEach(btn.attr, function(value, key){
                                            if(angular.isString(value)){
                                                attrs[key] = value;
                                            }
                                        });
                                    }
                                    var buttonContent = btn.labelIcon ? '<span class="hidden-xs hidden-sm"><i class="' + btn.labelIcon + '"></i> {{\'' + btn.label + '\' | grTranslate}}</span><span class="visible-xs visible-sm"><i class="' + btn.labelIcon + '"></i></span>' : '{{\'' + btn.label + '\' | grTranslate}}',
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
    angular.module('gr.ui.modal.template', [])
        .run(['$templateCache', function($templaceCache){
            $templaceCache.put('grModal/window.html',
               '<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': (zIndex && zIndex > 0 ? ((zIndex*1) + 10) : (100050 + index*10)), display: \'block\'}" ng-click="close($event)">' +
                    '<div class="modal-dialog" ng-class="{\'modal-xs\': size == \'xs\', \'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\', \'modal-responsive\': size == \'responsive\'}">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header" ng-if="title">' +
                                '<button type="button" class="close" ng-click="close()" title="{{\'Close\' | grTranslate}}"><span aria-hidden="true">&times;</span><span class="sr-only">{{\'Close\' | grTranslate}}</span>' +
                                '</button>' +
                                '<h4 class="modal-title">{{title | grTranslate}}</h4>' +
                            '</div>' +
                            '<div class="modal-body" gr-modal-transclude ng-show="contentReady"></div>' +
                            '<div class="modal-body" ng-show="!contentReady">' +
                                '<div style="display: table; margin: 50px auto; opacity: .2;">' +
                                    '<i class="fa fa-fw fa-refresh fa-spin fa-4x"></i>' +
                                '</div>' +
                            '</div>' +
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

/*
 *
 * GR-PAGER
 *
 */

(function(){
    angular.module('gr.ui.pager', []).directive('grPager', ['$rootScope', '$templateCache', '$compile', '$window', '$location', '$timeout', function($rootScope, $templateCache, $compile, $window, $location, $timeout){
        return {
            restrict: 'AE',
            template: '<div class="pagination-wrapper"></div>',
            scope: {
                src: '=',
                dest: '=',
                perPage: '='
            },
            replace: true,
            link: function($scope, $element, $attrs){
                $scope.$watch('src', filterPages);
                $scope.$watch('perPage', filterPages);
                $scope.$watch('current', filterPages);
                $scope.$watch(function(){
                    return $location.path().replace('/','');
                }, function(path){
                    if(path){
                        $scope.current = path;
                    }
                });
                $scope.boundary = function(){
                    return $rootScope.GRIFFO.viewPort.bs !== 'xs' ? true : false;
                };
                function filterPages(){
                    if($scope.src.length > 0 && parseInt($scope.perPage) > 0 && $scope.current > 0){
                        $timeout(function(){
                            var begin = (($scope.current - 1) * parseInt($scope.perPage)),
                                end = begin + parseInt($scope.perPage);
                            $scope.dest = $scope.src.slice(begin, end);
                            angular.element($window).trigger('resize');
                            $rootScope.$apply();
                        });
                        $location.path($scope.current);
                    }
                };
                $timeout(function(){
                    var pager = angular.element($templateCache.get('gr-pager/pager.html'));
                    $compile(pager)($scope);
                    $timeout(function(){
                        $scope.current = parseInt($location.path().replace('/','')) || 1;
                    });
                    $element.append(pager);
                });
            }
        }
    }]).run(['$templateCache', function($templateCache){
        $templateCache.put('gr-pager/pager.html', [
            '<div class="pagination-inner" ng-show="src.length > perPage">',
                '<pagination total-items="src.length" num-pages="total" items-per-page="perPage || 6" max-size="3" ng-model="current" boundary-links="boundary()" rotate="false" first-text="<<" last-text=">>" next-text=">" previous-text="<"></pagination>',
            '</div>'
        ].join(''));
    }]);
}());

/*
 *
 * GR-TABLE
 *
 */

 (function(){
     angular.module('gr.ui.table', ['gr.ui.table.config', 'ngTable', 'ngTableExport', 'gr.ui.alert'])
         .provider('$grTable', function(){
             var fns = {},
                 messages = {
                     'ALERT.LOADING.TABLE.DATA': 'Loading table data...',
                     'ALERT.RELOADING.TABLE.DATA': 'Reloading table data...',
                     'ALERT.SUCCESS.LOAD.TABLE.DATA': 'Table data, is loaded successfully!',
                     'ALERT.ERROR.LOAD.TABLE.DATA': 'A errors is occurred on load table data, please try reload the page!',
                     'NOTFOUND.DATA': 'No data found...'
                 };
             this.registerFunctions = function(f){
                 if(f && angular.isObject(f)){
                     fns = f;
                 }
             };
             this.setMessages = function(fn){
                 messages = fn(messages);
             }
             this.$get = ['$grTranslate', function($grTranslate){
                 return {
                     translate: function(msg){
                         var r = '';
                         if(msg && angular.isString(msg)){
                             if(messages[msg]){
                                 r = $grTranslate(messages[msg]);
                             }
                         }
                         return r;
                     },
                     functions: function(){
                         return fns;
                     }
                 };
             }];
         })
         .directive('grTable', ['ngTableParams', '$grTable', '$grAlert', '$q', '$compile', '$parse', '$injector', '$filter', '$http', '$window', '$timeout', function(ngTableParams, $grTable, $grAlert, $q, $compile, $parse, $injector, $filter, $http, $window, $timeout){
             var init = function init($scope, $element, $attrs){
                 var $name = $attrs.name || 'grTable',
                     alert = $grAlert.new(),
                     defaultSorting = {},
                     dataSource = '',
                     getData = function(src, reload){
                         if(!reload){
                             alert.show('loading', $grTable.translate('ALERT.LOADING.TABLE.DATA'), 0);
                         }else{
                             alert.show('loading', $grTable.translate('ALERT.RELOADING.TABLE.DATA'), 0);
                         }
                         if(angular.isString(src)){
                             $http.get(src).then(function(r){
                                 if(r.status === 200 && r.data.response){
                                     $scope.grTable.dataSet = r.data.response;
                                     $scope.grTable.reload();
                                     if(!reload){
                                         alert.hide();
                                     }else{
                                         alert.show('success', $grTable.translate('ALERT.SUCCESS.LOAD.TABLE.DATA'), 2000);
                                     }
                                 }else{
                                     console.debug(r);
                                     alert.show('danger', $grTable.translate('ALERT.ERROR.LOAD.TABLE.DATA'));
                                 }
                             }, function(e){
                                 var title = angular.element(angular.element(e.data)[0]).text(),
                                     content = angular.element(angular.element(e.data)[3]).text();
                                 alert.show(e.status, title + ' - ' + content, 'md');
                             });
                         }else if(angular.isObject(src)){
                             var injector = angular.injector(['gr.restful']);
                             if(injector.has('$grRestful')){
                                 injector.get('$grRestful').find(src).then(function(r){
                                     if(r.response){
                                         $scope.grTable.dataSet = r.response;
                                         $scope.grTable.reload();
                                         if(!reload){
                                             alert.hide();
                                         }else{
                                             alert.show('success', $grTable.translate('ALERT.SUCCESS.LOAD.TABLE.DATA'), 2000);
                                         }
                                     }else{
                                         console.debug(r);
                                         alert.show('danger', $grTable.translate('ALERT.ERROR.LOAD.TABLE.DATA'));
                                     }
                                 });
                             }else{
                                 console.debug('$grRestful not found');
                                 alert.show('danger', $grTable.translate('ALERT.ERROR.LOAD.TABLE.DATA'));
                             }
                         }else{
                             alert.show('danger', $grTable.translate('ALERT.ERROR.LOAD.TABLE.DATA'));
                         }
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
                             filterDelay: 0,
                             getFilterData: function($defer, params){
                                 var grFormData = $scope[$name].dataSet,
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
                                 var data = $scope[$name].dataSet;
                                 if(data){
                                     var filteredData = $filter('filter')(data, params.filter());
                                     var orderedData = params.filter() ? (params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData) : data,
                                         newData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                     $scope[$name].data = newData;
                                     $scope[$name].allData = data;
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
                     inArray = Array.prototype.indexOf ? function(val, arr){ return arr.indexOf(val); } : function(val, arr){ var i = arr.length; while (i--){ if(arr[i] === val){ return i; } } return -1; };
                 if($scope.$parent.modal && $scope.$parent.modal.element){
                     alert.destroy();
                     alert = $grAlert.new($scope.$parent.modal.element);
                 }
                 if($attrs.counts){
                     var counts = $parse($attrs.counts)($scope);
                     if(counts){
                         grTable.settings.counts = counts;
                     }
                 };
                 $scope[$name] = new ngTableParams(grTable.defaults, grTable.settings);
                 $scope[$name].defaults = grTable.defaults;
                 $scope[$name].reloadData = function(src){
                     if(!src || src === '' && $attrs.remote){
                         getData($scope.$eval($attrs.remote), true);
                     }else if(src && src !== ''){
                         getData(src, true);
                     }
                 };
                 $scope.$parent[$name] = $scope[$name];
                 $scope.$watch($attrs.remote, function(remote){
                     if(remote){
                         getData(remote);
                     }
                 });
                 $scope.$watch($attrs.list, function(list){
                     if(list){
                         $scope.dataSet = list;
                     }
                 });
                 $attrs.$observe('reload', function(fn){
                     if(fn){
                         $scope[$name].reloadData = function(){
                             $timeout(function(){
                                 $scope.$apply(fn);
                             });
                         };
                     }
                 });
                 $attrs.$observe('exportCsv', function(name){
                     $scope[$name].csv = angular.copy(name);
                 });
                 $attrs.$observe('sortby', function(sort){
                     if(sort){
                         var sortArr = $parse(sort)($scope);
                         if(angular.isObject(sortArr)){
                             $scope[$name].sorting(sortArr);
                         }
                     }
                 });
                 $attrs.$observe('filterby', function(filter){
                     if(filter){
                         var filterArr = $parse(filter)($scope);
                         if(angular.isObject(filterArr)){
                             $scope[$name].filter(filterArr);
                         }
                     }
                 });
                 $attrs.$observe('shareParent', function(share){
                     if(share){
                         $scope.$parent[$name] = $scope[$name];
                     }
                 });
                 $scope.$watch('dataSet', function(data){
                     if(data){
                         if(angular.isString(data)){
                             dataSource = data;
                             getData(dataSource);
                         }else if(angular.isObject(data) || angular.isArray(data)){
                             $scope[$name].dataSet = data;
                             $scope[$name].reload();
                         }
                     };
                 });
             },
             setFunctions= function($scope, $element, $attrs){
                 var $name = $attrs.name || 'grTable',
                     fns = $grTable.functions();
                 $scope[$name].fn = {};
                 angular.forEach(fns, function(fn, key){
                     $scope[$name].fn[key] = function(){
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
                 scope: true,
                 link: function($scope, $element, $attrs){
                     $element.removeAttr('gr-table');
                     $element.wrap('<div class="gr-table-wrapper table-responsive" />');
                     $element.addClass('gr-table table table-bordered table-striped');
                     $element.find('tbody').append('<tr ng-if="$data.length <= 0"><td colspan="{{$columns.length || columns.length}}">' + $grTable.translate('NOTFOUND.DATA') + '</td></tr>');
                     var repeater = $element.find('[gr-repeat]');
                     if(repeater && repeater.length > 0){
                         angular.forEach(repeater, function(el){
                             var elm = angular.element(el),
                                 rAttr = elm.attr('gr-repeat');
                             elm.removeAttr('gr-repeat').attr('ng-repeat', rAttr);
                         });
                     }
                     if($element.find('[filter]').length > 0){
                         $attrs.$set('show-filter', true);
                     }
                     if($element.find('tfoot').length <= 0){
                         $element.append('<tfoot><tr><td colspan="{{$columns.length || columns.length}}"/></tr></tfoot>');
                     }
                     if($attrs.dynamic){
                         $attrs.$set('ngTableDynamic', ($attrs.name || 'grTable') + ' with ' + $attrs.dynamic);
                         var has = false;
                         angular.forEach($parse($attrs.dynamic)($scope), function(d){
                             if(d.filter){
                                 has = true;
                             }
                         });
                         if(has){
                             $attrs.$set('show-filter', true);
                         }
                     }
                     init($scope, $element, $attrs);
                     setFunctions($scope, $element, $attrs);
                     $attrs.$set('ngTable', ($attrs.name || 'grTable'));
                     $compile($element)($scope);
                 }
             }
         }])
         .directive('grTableClearSorting', function(){
             return {
                 restrict: 'E',
                 transclude: true,
                 scope: {
                     for: '='
                 },
                 template: '<button class="gr-table-clear-sorting" ng-click="grTable.sorting(grTable.defaults.sorting)" ng-transclude></button>',
                 replace: true,
                 compile: function($element){
                     return function($scope, $element, $attrs){
                         $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                         $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                     }
                 }
             }
         })
         .directive('grTableClearFilter', function(){
             return {
                 restrict: 'E',
                 transclude: true,
                 scope: {
                     for: '='
                 },
                 template: '<button class="gr-table-clear-filter" ng-click="grTable.filter({})" ng-transclude></button>',
                 replace: true,
                 compile: function($element){
                     return function($scope, $element, $attrs){
                         $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                         $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                     }
                 }
             }
         })
         .directive('grTableCount', function(){
             return {
                 restrict: 'E',
                 scope: {
                     for: '='
                 },
                 template: '<div class="btn-group gr-table-count" ng-if="grTable.allData.length > 0 && !(grTable.allData.length <= grTable.settings().counts[0])"><button ng-repeat="count in grTable.settings().counts" type="button" ng-class="{\'active\':grTable.count()==count}" ng-click="grTable.count(count)" class="btn btn-default"><span ng-bind="count"></span></button></div>',
                 replace: true,
                 compile: function($element){
                     return function($scope, $element, $attrs){
                         $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                         $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                     }
                 }
             }
         })
         .directive('grTablePager', ['$compile', '$templateCache', function($compile, $templateCache){
             return{
                 restrict: 'E',
                 scope: {
                     params: '=?for'
                 },
                 replace: true,
                 link: function($scope, $element){
                     $scope.$watch('params', function(p){
                         if(p){
                             init();
                         }
                     });
                     $scope.$watch('$parent.grTable', function(grTable){
                         if(grTable){
                             $scope.params = grTable;
                         }
                     });
                     function init(){
                         $scope.params.settings().$scope.$on('ngTableAfterReloadData',function(){
                            $scope.pages = $scope.params.generatePagesArray($scope.params.page(),$scope.params.total(),$scope.params.count())
                         }, true);
                         var f = angular.element(document.createElement("div"));
                         f.append($templateCache.get('gr-table/pager.html'));
                         $element.append(f);
                         $compile(f)($scope);
                     };
                 }
             }
         }])
         .directive('grTableExportCsv', ['$parse', function(){
                 return {
                     restrict: 'E',
                     scope: {
                         for: '='
                     },
                     transclude: true,
                     template: '<a class="gr-table-export-csv" ng-mousedown="grTable.csv.generate()" ng-href="{{grTable.csv.link()}}" download="{{grTable.csv.name + \'.csv\'}}" ng-show="grTable.csv && grTable.csv.name" ng-disabled="grTable.data.length <= 0" ng-transclude></a>',
                     replace: true,
                     link: function($scope, $element, $attrs){
                         var init = function init(name){
                             var data = '';
                             $scope.grTable.csv = {
                                 name: name !== '' ? name : undefined,
                                 stringify: function(str){
                                     return '"' +
                                         str.replace(/^\s\s*/, '').replace(/\s*\s$/, '')
                                         .replace(/"/g, '""') +
                                         '"';
                                 },
                                 generate: function(){
                                     var element = angular.element('table.gr-table.ng-table[export-csv="' + name + '"]'),
                                         rows = element.find('tr').not('tfoot tr');
                                     data = '';
                                     angular.forEach(rows, function(row, i){
                                         var tr = angular.element(row),
                                             tds = tr.find('th'),
                                             rowData = '';
                                         if(tr.hasClass('ng-table-filters')){ return; }
                                         if(tds.length == 0){ tds = tr.find('td'); }
                                         if(i != 1){
                                             angular.forEach(tds, function(td, i){
                                                 rowData += $scope.grTable.csv.stringify(angular.element(td).text()) + ';';
                                             });
                                             rowData = rowData.slice(0, rowData.length - 1);
                                         }
                                         data += rowData + "\n";
                                     });
                                 },
                                 link: function(){
                                     return 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
                                 }
                             };
                         };
                         $scope.$watch('grTable.csv', function(csv){ if(csv && csv !== '' && !angular.isObject(csv)){ init(csv); } }, true);
                         $scope.$watch('$parent.grTable', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                         $scope.$watch('for', function(grTable){ if(grTable){ $scope.grTable = grTable; } }, true);
                     }
                 };
         }])
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
         }])
         .run(['$templateCache', function ($templateCache) {
             $templateCache.put('gr-table/pager.html', '<div class="ng-cloak ng-table-pager" ng-if="params.data.length"> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div> ');
             $templateCache.put('ng-table/pager.html', '');
         }]);
     angular.module('gr.ui.table.config', ['gr.ui.modal','gr.ui.alert']);
 }());

/*
 *
 * GR-TRANSLATE
 *
 */

(function(){
    angular.module('gr.ui.translate', ['gr.ui.translate.filter', 'gr.ui.translate.directive']).provider('$grTranslate', function(){
            var $injector = angular.injector(),
                translate = function(value){
                    var _return = '';
                    if(angular.isString(value)){
                        try{
                            if(value.indexOf('[[') > -1){
                                var newValue = value.split('[[')[0],
                                    vars = value.split('[[')[1].split(']]')[0].split(','),
                                    translatedValue = $injector.get('$translate').instant(newValue);
                                angular.forEach(vars, function(v, id){
                                    while(translatedValue.indexOf('[[$' + (id + 1) + ']]') > -1){
                                        translatedValue = translatedValue.replace('[[$' + (id + 1) + ']]', v);
                                    }
                                });
                                _return = translatedValue;
                            }else{
                                _return = $injector.get('$translate').instant(value);
                            }
                        }catch(e){
                            _return = '';
                        }
                    }else{
                        _return = '';
                    }
                    return _return;
                };
            this.translate = translate;
            this.$get = ['$injector', function $grTranslate(_injector){
                $injector = _injector;
                return translate;
            }];
        });
    angular.module('gr.ui.translate.directive', []).directive('grTranslate', ['$grTranslate', '$timeout', function($grTranslate, $timeout){
        return {
            restrict: 'AE',
            scope: {
                grTranslate: '='
            },
            link: function($scope, $element, $attrs){
                $scope.translatedValue = '&nbsp;';
                function setTranslate(newValue){
                    var tempWatcher = $scope.$watch(function(){
                            return $grTranslate(newValue);
                        }, function(translatedValue){
                            if(translatedValue){
                                if(translatedValue !== newValue){
                                    $scope.translatedValue = translatedValue;
                                    tempWatcher();
                                }else{
                                    $timeout(function(){
                                        if(translatedValue == newValue){
                                            $scope.translatedValue = translatedValue;
                                            tempWatcher();
                                        }
                                    }, 1000);
                                }
                            }
                        });
                }
                $scope.$watch(function(){
                    return $element.text();
                }, function(newValue){
                    if(newValue && newValue !== '&nbsp;'){
                        setTranslate(newValue);
                    }
                });
                $scope.$watch('grTranslate', function(newValue){
                    if(newValue){
                        setTranslate(newValue);
                    }
                });
                $scope.$watch('translatedValue', function(newValue){
                    if(newValue){
                        $element.html(newValue);
                    }
                });
            }
        }
    }]);
    angular.module('gr.ui.translate.filter', []).filter('grTranslate', ['$grTranslate', function($grTranslate){
        function translator(value){ return $grTranslate(value) || ''; }
        translator.$stateful = true;
        return translator;
    }]);
}());

/*
 *
 * DEPENDENCIES
 *
 */

/** gr-table dependencies **/

(function(){
    (function(){
        /*! ngTable v0.5.3 by Vitalii Savchuk(esvit666@gmail.com) - https://github.com/esvit/ng-table - New BSD License */
        !function(a,b){"use strict";return"function"==typeof define&&define.amd?void define(["angular"],function(a){return b(a)}):b(a)}(angular||null,function(a){"use strict";var b=a.module("ngTable",[]);return b.value("ngTableDefaults",{params:{},settings:{}}),b.factory("NgTableParams",["$q","$log","ngTableDefaults",function(b,c,d){var e=function(a){return!isNaN(parseFloat(a))&&isFinite(a)},f=function(f,g){var h=this,i=function(){k.debugMode&&c.debug&&c.debug.apply(this,arguments)};this.data=[],this.parameters=function(b,c){if(c=c||!1,a.isDefined(b)){for(var d in b){var f=b[d];if(c&&d.indexOf("[")>=0){for(var g=d.split(/\[(.*)\]/).reverse(),h="",k=0,l=g.length;l>k;k++){var m=g[k];if(""!==m){var n=f;f={},f[h=m]=e(n)?parseFloat(n):n}}"sorting"===h&&(j[h]={}),j[h]=a.extend(j[h]||{},f[h])}else j[d]=e(b[d])?parseFloat(b[d]):b[d]}return i("ngTable: set parameters",j),this}return j},this.settings=function(b){return a.isDefined(b)?(a.isArray(b.data)&&(b.total=b.data.length),k=a.extend(k,b),i("ngTable: set settings",k),this):k},this.page=function(b){return a.isDefined(b)?this.parameters({page:b}):j.page},this.total=function(b){return a.isDefined(b)?this.settings({total:b}):k.total},this.count=function(b){return a.isDefined(b)?this.parameters({count:b,page:1}):j.count},this.filter=function(b){return a.isDefined(b)?this.parameters({filter:b,page:1}):j.filter},this.sorting=function(b){if(2==arguments.length){var c={};return c[b]=arguments[1],this.parameters({sorting:c}),this}return a.isDefined(b)?this.parameters({sorting:b}):j.sorting},this.isSortBy=function(b,c){return a.isDefined(j.sorting[b])&&a.equals(j.sorting[b],c)},this.orderBy=function(){var a=[];for(var b in j.sorting)a.push(("asc"===j.sorting[b]?"+":"-")+b);return a},this.getData=function(b,c){return b.resolve(a.isArray(this.data)&&a.isObject(c)?this.data.slice((c.page()-1)*c.count(),c.page()*c.count()):[]),b.promise},this.getGroups=function(c,d){var e=b.defer();return e.promise.then(function(b){var e={};a.forEach(b,function(b){var c=a.isFunction(d)?d(b):b[d];e[c]=e[c]||{data:[]},e[c].value=c,e[c].data.push(b)});var f=[];for(var g in e)f.push(e[g]);i("ngTable: refresh groups",f),c.resolve(f)}),this.getData(e,h)},this.generatePagesArray=function(a,b,c){var d,e,f,g,h,i;if(d=11,i=[],h=Math.ceil(b/c),h>1){i.push({type:"prev",number:Math.max(1,a-1),active:a>1}),i.push({type:"first",number:1,active:a>1,current:1===a}),f=Math.round((d-5)/2),g=Math.max(2,a-f),e=Math.min(h-1,a+2*f-(a-g)),g=Math.max(2,g-(2*f-(e-g)));for(var j=g;e>=j;)i.push(j===g&&2!==j||j===e&&j!==h-1?{type:"more",active:!1}:{type:"page",number:j,active:a!==j,current:a===j}),j++;i.push({type:"last",number:h,active:a!==h,current:a===h}),i.push({type:"next",number:Math.min(h,a+1),active:h>a})}return i},this.url=function(b){b=b||!1;var c=b?[]:{};for(var d in j)if(j.hasOwnProperty(d)){var e=j[d],f=encodeURIComponent(d);if("object"==typeof e){for(var g in e)if(!a.isUndefined(e[g])&&""!==e[g]){var h=f+"["+encodeURIComponent(g)+"]";b?c.push(h+"="+e[g]):c[h]=e[g]}}else a.isFunction(e)||a.isUndefined(e)||""===e||(b?c.push(f+"="+encodeURIComponent(e)):c[f]=encodeURIComponent(e))}return c},this.reload=function(){var a=b.defer(),c=this,d=null;if(k.$scope)return k.$loading=!0,d=k.groupBy?k.getGroups(a,k.groupBy,this):k.getData(a,this),i("ngTable: reload data"),d||(d=a.promise),d.then(function(a){return k.$loading=!1,i("ngTable: current scope",k.$scope),k.groupBy?(c.data=a,k.$scope&&(k.$scope.$groups=a)):(c.data=a,k.$scope&&(k.$scope.$data=a)),k.$scope&&(k.$scope.pages=c.generatePagesArray(c.page(),c.total(),c.count())),k.$scope.$emit("ngTableAfterReloadData"),a})},this.reloadPages=function(){var a=this;k.$scope.pages=a.generatePagesArray(a.page(),a.total(),a.count())};var j=this.$params={page:1,count:1,filter:{},sorting:{},group:{},groupBy:null};a.extend(j,d.params);var k={$scope:null,$loading:!1,data:null,total:0,defaultSort:"desc",filterDelay:750,counts:[10,25,50,100],sortingIndicator:"span",getGroups:this.getGroups,getData:this.getData};return a.extend(k,d.settings),this.settings(g),this.parameters(f,!0),this};return f}]),b.factory("ngTableParams",["NgTableParams",function(a){return a}]),b.controller("ngTableController",["$scope","NgTableParams","$timeout","$parse","$compile","$attrs","$element","ngTableColumn",function(b,c,d,e,f,g,h,i){function j(){b.params.$params.page=1}var k=!0;b.$filterRow={},b.$loading=!1,b.hasOwnProperty("params")||(b.params=new c,b.params.isNullInstance=!0),b.params.settings().$scope=b;var l=function(){var a=0;return function(b,c){d.cancel(a),a=d(b,c)}}();b.$watch("params.$params",function(c,d){if(c!==d){if(b.params.settings().$scope=b,a.equals(c.filter,d.filter))b.params.reload();else{var e=k?a.noop:j;l(function(){e(),b.params.reload()},b.params.settings().filterDelay)}b.params.isNullInstance||(k=!1)}},!0),this.compileDirectiveTemplates=function(){if(!h.hasClass("ng-table")){b.templates={header:g.templateHeader?g.templateHeader:"ng-table/header.html",pagination:g.templatePagination?g.templatePagination:"ng-table/pager.html"},h.addClass("ng-table");var c=null;0===h.find("> thead").length&&(c=a.element(document.createElement("thead")).attr("ng-include","templates.header"),h.prepend(c));var d=a.element(document.createElement("div")).attr({"ng-table-pagination":"params","template-url":"templates.pagination"});h.after(d),c&&f(c)(b),f(d)(b)}},this.loadFilterData=function(c){a.forEach(c,function(c){var d;return d=c.filterData(b,{$column:c}),d?a.isObject(d)&&a.isObject(d.promise)?(delete c.filterData,d.promise.then(function(b){a.isArray(b)||a.isFunction(b)||a.isObject(b)?a.isArray(b)&&b.unshift({title:"-",id:""}):b=[],c.data=b})):c.data=d:void delete c.filterData})},this.buildColumns=function(a){return a.map(function(a){return i.buildColumn(a,b)})},this.setupBindingsToInternalScope=function(c){var d=e(c);b.$watch(d,function(c){a.isUndefined(c)||(b.paramsModel=d,b.params=c)},!1),g.showFilter&&b.$parent.$watch(g.showFilter,function(a){b.show_filter=a}),g.disableFilter&&b.$parent.$watch(g.disableFilter,function(a){b.$filterRow.disabled=a})},b.sortBy=function(a,c){var d=a.sortable&&a.sortable();if(d){var e=b.params.settings().defaultSort,f="asc"===e?"desc":"asc",g=b.params.sorting()&&b.params.sorting()[d]&&b.params.sorting()[d]===e,h=c.ctrlKey||c.metaKey?b.params.sorting():{};h[d]=g?f:e,b.params.parameters({sorting:h})}}}]),b.factory("ngTableColumn",[function(){function b(b,d){var e=Object.create(b);for(var f in c)void 0===e[f]&&(e[f]=c[f]),a.isFunction(e[f])||!function(a){e[a]=function(){return b[a]}}(f),function(a){var c=e[a];e[a]=function(){return 0===arguments.length?c.call(b,d):c.apply(b,arguments)}}(f);return e}var c={"class":function(){return""},filter:function(){return!1},filterData:a.noop,headerTemplateURL:function(){return!1},headerTitle:function(){return" "},sortable:function(){return!1},show:function(){return!0},title:function(){return" "},titleAlt:function(){return""}};return{buildColumn:b}}]),b.directive("ngTable",["$q","$parse",function(b,c){return{restrict:"A",priority:1001,scope:!0,controller:"ngTableController",compile:function(b){var d=[],e=0,f=null;return a.forEach(a.element(b.find("tr")),function(b){b=a.element(b),b.hasClass("ng-table-group")||f||(f=b)}),f?(a.forEach(f.find("td"),function(b){var f=a.element(b);if(!f.attr("ignore-cell")||"true"!==f.attr("ignore-cell")){var g=function(a){return f.attr("x-data-"+a)||f.attr("data-"+a)||f.attr(a)},h=function(b){var e=g(b);return e?function(b,f){return c(e)(b,a.extend(f||{},{$columns:d}))}:void 0},i=g("title-alt")||g("title");i&&f.attr("data-title-text","{{"+i+"}}"),d.push({id:e++,title:h("title"),titleAlt:h("title-alt"),headerTitle:h("header-title"),sortable:h("sortable"),"class":h("header-class"),filter:h("filter"),headerTemplateURL:h("header"),filterData:h("filter-data"),show:f.attr("ng-show")?function(a){return c(f.attr("ng-show"))(a)}:void 0})}}),function(a,b,c,e){a.$columns=d=e.buildColumns(d),e.setupBindingsToInternalScope(c.ngTable),e.loadFilterData(d),e.compileDirectiveTemplates()}):void 0}}}]),b.directive("ngTableDynamic",["$parse",function(b){function c(a){if(!a||a.indexOf(" with ")>-1){var b=a.split(/\s+with\s+/);return{tableParams:b[0],columns:b[1]}}throw new Error("Parse error (expected example: ng-table-dynamic='tableParams with cols')")}return{restrict:"A",priority:1001,scope:!0,controller:"ngTableController",compile:function(d){var e;return a.forEach(a.element(d.find("tr")),function(b){b=a.element(b),b.hasClass("ng-table-group")||e||(e=b)}),e?(a.forEach(e.find("td"),function(b){var c=a.element(b),d=function(a){return c.attr("x-data-"+a)||c.attr("data-"+a)||c.attr(a)},e=d("title");e||c.attr("data-title-text","{{$columns[$index].titleAlt(this) || $columns[$index].title(this)}}");var f=c.attr("ng-show");f||c.attr("ng-show","$columns[$index].show(this)")}),function(a,d,e,f){var g=c(e.ngTableDynamic),h=b(g.columns)(a)||[];a.$columns=f.buildColumns(h),f.setupBindingsToInternalScope(g.tableParams),f.loadFilterData(a.$columns),f.compileDirectiveTemplates()}):void 0}}}]),b.directive("ngTablePagination",["$compile",function(b){return{restrict:"A",scope:{params:"=ngTablePagination",templateUrl:"="},replace:!1,link:function(c,d){c.params.settings().$scope.$on("ngTableAfterReloadData",function(){c.pages=c.params.generatePagesArray(c.params.page(),c.params.total(),c.params.count())},!0),c.$watch("templateUrl",function(e){if(!a.isUndefined(e)){var f=a.element(document.createElement("div"));f.attr({"ng-include":"templateUrl"}),d.append(f),b(f)(c)}})}}}]),a.module("ngTable").run(["$templateCache",function(a){a.put("ng-table/filters/select-multiple.html",'<select ng-options="data.id as data.title for data in $column.data" ng-disabled="$filterRow.disabled" multiple ng-multiple="true" ng-model="params.filter()[name]" ng-show="filter==\'select-multiple\'" class="filter filter-select-multiple form-control" name="{{name}}"> </select>'),a.put("ng-table/filters/select.html",'<select ng-options="data.id as data.title for data in $column.data" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control" name="{{name}}"> </select>'),a.put("ng-table/filters/text.html",'<input type="text" name="{{name}}" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-if="filter==\'text\'" class="input-filter form-control"/>'),a.put("ng-table/header.html",'<tr> <th title="{{$column.headerTitle(this)}}" ng-repeat="$column in $columns" ng-class="{ \'sortable\': $column.sortable(this), \'sort-asc\': params.sorting()[$column.sortable(this)]==\'asc\', \'sort-desc\': params.sorting()[$column.sortable(this)]==\'desc\' }" ng-click="sortBy($column, $event)" ng-show="$column.show(this)" ng-init="template=$column.headerTemplateURL(this)" class="header {{$column.class(this)}}"> <div ng-if="!template" ng-show="!template" class="ng-table-header" ng-class="{\'sort-indicator\': params.settings().sortingIndicator==\'div\'}"> <span ng-bind="$column.title(this)" ng-class="{\'sort-indicator\': params.settings().sortingIndicator==\'span\'}"></span> </div> <div ng-if="template" ng-show="template" ng-include="template"></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th data-title-text="{{$column.titleAlt(this) || $column.title(this)}}" ng-repeat="$column in $columns" ng-show="$column.show(this)" class="filter"> <div ng-repeat="(name, filter) in $column.filter(this)"> <div ng-if="filter.indexOf(\'/\') !==-1" ng-include="filter"></div> <div ng-if="filter.indexOf(\'/\')===-1" ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </th> </tr> '),a.put("ng-table/pager.html",'<div class="ng-cloak ng-table-pager" ng-if="params.data.length"> <div ng-if="params.settings().counts.length" class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default"> <span ng-bind="count"></span> </button> </div> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div> ')}]),b});
    }());
    (function(){
        /*! ngTableExport v0.1.0 by Vitalii Savchuk(esvit666@gmail.com) - https://github.com/esvit/ng-table-export - New BSD License */
        angular.module("ngTableExport",[]).config(["$compileProvider",function(a){a.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/)}]).directive("exportCsv",["$parse",function(a){return{restrict:"A",scope:!1,link:function(b,c,d){var e="",f={stringify:function(a){return'"'+a.replace(/^\s\s*/,"").replace(/\s*\s$/,"").replace(/"/g,'""')+'"'},generate:function(){e="";var a=c.find("tr");angular.forEach(a,function(a,b){var c=angular.element(a),d=c.find("th"),g="";c.hasClass("ng-table-filters")||(0==d.length&&(d=c.find("td")),1!=b&&(angular.forEach(d,function(a){g+=f.stringify(angular.element(a).text())+";"}),g=g.slice(0,g.length-1)),e+=g+"\n")})},link:function(){return"data:text/csv;charset=UTF-8,"+encodeURIComponent(e)}};a(d.exportCsv).assign(b.$parent,f)}}}]);
    }());
}());

/** gr-autofields dependencies **/

(function(){

    /**
     * angular-input-masks
     * Personalized input masks for AngularJS
     * @version v2.1.0
     * @link http://github.com/assisrafael/angular-input-masks
     * @license MIT
     */

     // https://github.com/assisrafael/angular-input-masks

    (function(){
        var require=function e(t,n,r){function i(a,o){if(!n[a]){if(!t[a]){var u="function"==typeof require&&require;if(!o&&u)return u(a,!0);if(s)return s(a,!0);var l=new Error("Cannot find module '"+a+"'");throw l.code="MODULE_NOT_FOUND",l}var c=n[a]={exports:{}};t[a][0].call(c.exports,function(e){var n=t[a][1][e];return i(n?n:e)},c,c.exports,e,t,n,r)}return n[a].exports}for(var s="function"==typeof require&&require,a=0;a<r.length;a++)i(r[a]);return i}({1:[function(e,t,n){!function(e,r){"function"==typeof define&&define.amd?define([],r):"object"==typeof n?t.exports=r():e.BrV=r()}(this,function(){function e(e,t){var n=t.algorithmSteps,r=a.handleStr[n[0]](e),i=a.sum[n[1]](r,t.pesos),s=a.rest[n[2]](i),o=parseInt(r[t.dvpos]),u=a.expectedDV[n[3]](s,r);return o===u}function t(t,n){if(n.match&&!n.match.test(t))return!1;for(var r=0;r<n.dvs.length;r++)if(!e(t,n.dvs[r]))return!1;return!0}var n={};n.validate=function(e){var t=[6,5,4,3,2,9,8,7,6,5,4,3,2];e=e.replace(/[^\d]/g,"");var n=/^(0{14}|1{14}|2{14}|3{14}|4{14}|5{14}|6{14}|7{14}|8{14}|9{14})$/;if(!e||14!==e.length||n.test(e))return!1;e=e.split("");for(var r=0,i=0;12>r;r++)i+=e[r]*t[r+1];if(i=11-i%11,i=i>=10?0:i,parseInt(e[12])!==i)return!1;for(r=0,i=0;12>=r;r++)i+=e[r]*t[r];return i=11-i%11,i=i>=10?0:i,parseInt(e[13])!==i?!1:!0};var r={};r.validate=function(e){function t(t){for(var n=0,r=t-9,i=0;9>i;i++)n+=parseInt(e.charAt(i+r))*(i+1);return n%11%10===parseInt(e.charAt(t))}e=e.replace(/[^\d]+/g,"");var n=/^(0{11}|1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/;return!e||11!==e.length||n.test(e)?!1:t(9)&&t(10)};var i=function(e){return this instanceof i?(this.rules=s[e]||[],this.rule,i.prototype._defineRule=function(e){this.rule=void 0;for(var t=0;t<this.rules.length&&void 0===this.rule;t++){var n=e.replace(/[^\d]/g,""),r=this.rules[t];n.length!==r.chars||r.match&&!r.match.test(e)||(this.rule=r)}return!!this.rule},void(i.prototype.validate=function(e){return e&&this._defineRule(e)?this.rule.validate(e):!1})):new i(e)},s={},a={handleStr:{onlyNumbers:function(e){return e.replace(/[^\d]/g,"").split("")},mgSpec:function(e){var t=e.replace(/[^\d]/g,"");return t=t.substr(0,3)+"0"+t.substr(3,t.length),t.split("")}},sum:{normalSum:function(e,t){for(var n=e,r=0,i=0;i<t.length;i++)r+=parseInt(n[i])*t[i];return r},individualSum:function(e,t){for(var n=e,r=0,i=0;i<t.length;i++){var s=parseInt(n[i])*t[i];r+=s%10+parseInt(s/10)}return r},apSpec:function(e,t){var n=this.normalSum(e,t),r=e.join("");return r>="030000010"&&"030170009">=r?n+5:r>="030170010"&&"030190229">=r?n+9:n}},rest:{mod11:function(e){return e%11},mod10:function(e){return e%10},mod9:function(e){return e%9}},expectedDV:{minusRestOf11:function(e){return 2>e?0:11-e},minusRestOf11v2:function(e){return 2>e?11-e-10:11-e},minusRestOf10:function(e){return 1>e?0:10-e},mod10:function(e){return e%10},goSpec:function(e,t){var n=t.join("");return 1===e?n>="101031050"&&"101199979">=n?1:0:0===e?0:11-e},apSpec:function(e,t){var n=t.join("");return 0===e?n>="030170010"&&"030190229">=n?1:0:1===e?0:11-e},voidFn:function(e){return e}}};return s.PE=[{chars:9,dvs:[{dvpos:7,pesos:[8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]},{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}},{chars:14,pesos:[[1,2,3,4,5,9,8,7,6,5,4,3,2]],dvs:[{dvpos:13,pesos:[5,4,3,2,1,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11v2"]}],validate:function(e){return t(e,this)}}],s.RS=[{chars:10,dvs:[{dvpos:9,pesos:[2,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.AC=[{chars:13,match:/^01/,dvs:[{dvpos:11,pesos:[4,3,2,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]},{dvpos:12,pesos:[5,4,3,2,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.MG=[{chars:13,dvs:[{dvpos:12,pesos:[1,2,1,2,1,2,1,2,1,2,1,2],algorithmSteps:["mgSpec","individualSum","mod10","minusRestOf10"]},{dvpos:12,pesos:[3,2,11,10,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.SP=[{chars:12,match:/^[0-9]/,dvs:[{dvpos:8,pesos:[1,3,4,5,6,7,8,10],algorithmSteps:["onlyNumbers","normalSum","mod11","mod10"]},{dvpos:11,pesos:[3,2,10,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","mod10"]}],validate:function(e){return t(e,this)}},{chars:12,match:/^P/i,dvs:[{dvpos:8,pesos:[1,3,4,5,6,7,8,10],algorithmSteps:["onlyNumbers","normalSum","mod11","mod10"]}],validate:function(e){return t(e,this)}}],s.DF=[{chars:13,dvs:[{dvpos:11,pesos:[4,3,2,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]},{dvpos:12,pesos:[5,4,3,2,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.ES=[{chars:9,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.BA=[{chars:8,match:/^[0123458]/,dvs:[{dvpos:7,pesos:[7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod10","minusRestOf10"]},{dvpos:6,pesos:[8,7,6,5,4,3,0,2],algorithmSteps:["onlyNumbers","normalSum","mod10","minusRestOf10"]}],validate:function(e){return t(e,this)}},{chars:8,match:/^[679]/,dvs:[{dvpos:7,pesos:[7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]},{dvpos:6,pesos:[8,7,6,5,4,3,0,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}},{chars:9,match:/^[0-9][0123458]/,dvs:[{dvpos:8,pesos:[8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod10","minusRestOf10"]},{dvpos:7,pesos:[9,8,7,6,5,4,3,0,2],algorithmSteps:["onlyNumbers","normalSum","mod10","minusRestOf10"]}],validate:function(e){return t(e,this)}},{chars:9,match:/^[0-9][679]/,dvs:[{dvpos:8,pesos:[8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]},{dvpos:7,pesos:[9,8,7,6,5,4,3,0,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.AM=[{chars:9,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.RN=[{chars:9,match:/^20/,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}},{chars:10,match:/^20/,dvs:[{dvpos:8,pesos:[10,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.RO=[{chars:14,dvs:[{dvpos:13,pesos:[6,5,4,3,2,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.PR=[{chars:10,dvs:[{dvpos:8,pesos:[3,2,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]},{dvpos:9,pesos:[4,3,2,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.SC=[{chars:9,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.RJ=[{chars:8,dvs:[{dvpos:7,pesos:[2,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.PA=[{chars:9,match:/^15/,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.SE=[{chars:9,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.PB=[{chars:9,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.CE=[{chars:9,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.PI=[{chars:9,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.MA=[{chars:9,match:/^12/,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.MT=[{chars:11,dvs:[{dvpos:10,pesos:[3,2,9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.MS=[{chars:9,match:/^28/,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.TO=[{chars:11,match:/^[0-9]{2}((0[123])|(99))/,dvs:[{dvpos:10,pesos:[9,8,0,0,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.AL=[{chars:9,match:/^24[03578]/,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","minusRestOf11"]}],validate:function(e){return t(e,this)}}],s.RR=[{chars:9,match:/^24/,dvs:[{dvpos:8,pesos:[1,2,3,4,5,6,7,8],algorithmSteps:["onlyNumbers","normalSum","mod9","voidFn"]}],validate:function(e){return t(e,this)}}],s.GO=[{chars:9,match:/^1[015]/,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","normalSum","mod11","goSpec"]}],validate:function(e){return t(e,this)}}],s.AP=[{chars:9,match:/^03/,dvs:[{dvpos:8,pesos:[9,8,7,6,5,4,3,2],algorithmSteps:["onlyNumbers","apSpec","mod11","apSpec"]}],validate:function(e){return t(e,this)}}],{ie:i,cpf:r,cnpj:n}})},{}],2:[function(e,t,n){!function(e,r){"object"==typeof n&&"undefined"!=typeof t?t.exports=r():"function"==typeof define&&define.amd?define(r):e.moment=r()}(this,function(){"use strict";function n(){return xn.apply(null,arguments)}function r(e){xn=e}function i(e){return"[object Array]"===Object.prototype.toString.call(e)}function s(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function a(e,t){var n,r=[];for(n=0;n<e.length;++n)r.push(t(e[n],n));return r}function o(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function u(e,t){for(var n in t)o(t,n)&&(e[n]=t[n]);return o(t,"toString")&&(e.toString=t.toString),o(t,"valueOf")&&(e.valueOf=t.valueOf),e}function l(e,t,n,r){return Oe(e,t,n,r,!0).utc()}function c(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function f(e){return null==e._pf&&(e._pf=c()),e._pf}function d(e){if(null==e._isValid){var t=f(e);e._isValid=!isNaN(e._d.getTime())&&t.overflow<0&&!t.empty&&!t.invalidMonth&&!t.nullInput&&!t.invalidFormat&&!t.userInvalidated,e._strict&&(e._isValid=e._isValid&&0===t.charsLeftOver&&0===t.unusedTokens.length&&void 0===t.bigHour)}return e._isValid}function m(e){var t=l(0/0);return null!=e?u(f(t),e):f(t).userInvalidated=!0,t}function h(e,t){var n,r,i;if("undefined"!=typeof t._isAMomentObject&&(e._isAMomentObject=t._isAMomentObject),"undefined"!=typeof t._i&&(e._i=t._i),"undefined"!=typeof t._f&&(e._f=t._f),"undefined"!=typeof t._l&&(e._l=t._l),"undefined"!=typeof t._strict&&(e._strict=t._strict),"undefined"!=typeof t._tzm&&(e._tzm=t._tzm),"undefined"!=typeof t._isUTC&&(e._isUTC=t._isUTC),"undefined"!=typeof t._offset&&(e._offset=t._offset),"undefined"!=typeof t._pf&&(e._pf=f(t)),"undefined"!=typeof t._locale&&(e._locale=t._locale),Fn.length>0)for(n in Fn)r=Fn[n],i=t[r],"undefined"!=typeof i&&(e[r]=i);return e}function p(e){h(this,e),this._d=new Date(+e._d),Un===!1&&(Un=!0,n.updateOffset(this),Un=!1)}function v(e){return e instanceof p||null!=e&&null!=e._isAMomentObject}function y(e){var t=+e,n=0;return 0!==t&&isFinite(t)&&(n=t>=0?Math.floor(t):Math.ceil(t)),n}function g(e,t,n){var r,i=Math.min(e.length,t.length),s=Math.abs(e.length-t.length),a=0;for(r=0;i>r;r++)(n&&e[r]!==t[r]||!n&&y(e[r])!==y(t[r]))&&a++;return a+s}function _(){}function M(e){return e?e.toLowerCase().replace("_","-"):e}function k(e){for(var t,n,r,i,s=0;s<e.length;){for(i=M(e[s]).split("-"),t=i.length,n=M(e[s+1]),n=n?n.split("-"):null;t>0;){if(r=S(i.slice(0,t).join("-")))return r;if(n&&n.length>=t&&g(i,n,!0)>=t-1)break;t--}s++}return null}function S(n){var r=null;if(!An[n]&&"undefined"!=typeof t&&t&&t.exports)try{r=Rn._abbr,e("./locale/"+n),w(r)}catch(i){}return An[n]}function w(e,t){var n;return e&&(n="undefined"==typeof t?b(e):D(e,t),n&&(Rn=n)),Rn._abbr}function D(e,t){return null!==t?(t.abbr=e,An[e]||(An[e]=new _),An[e].set(t),w(e),An[e]):(delete An[e],null)}function b(e){var t;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return Rn;if(!i(e)){if(t=S(e))return t;e=[e]}return k(e)}function Y(e,t){var n=e.toLowerCase();En[n]=En[n+"s"]=En[t]=e}function O(e){return"string"==typeof e?En[e]||En[e.toLowerCase()]:void 0}function $(e){var t,n,r={};for(n in e)o(e,n)&&(t=O(n),t&&(r[t]=e[n]));return r}function N(e,t){return function(r){return null!=r?(P(this,e,r),n.updateOffset(this,t),this):T(this,e)}}function T(e,t){return e._d["get"+(e._isUTC?"UTC":"")+t]()}function P(e,t,n){return e._d["set"+(e._isUTC?"UTC":"")+t](n)}function x(e,t){var n;if("object"==typeof e)for(n in e)this.set(n,e[n]);else if(e=O(e),"function"==typeof this[e])return this[e](t);return this}function R(e,t,n){for(var r=""+Math.abs(e),i=e>=0;r.length<t;)r="0"+r;return(i?n?"+":"":"-")+r}function F(e,t,n,r){var i=r;"string"==typeof r&&(i=function(){return this[r]()}),e&&(In[e]=i),t&&(In[t[0]]=function(){return R(i.apply(this,arguments),t[1],t[2])}),n&&(In[n]=function(){return this.localeData().ordinal(i.apply(this,arguments),e)})}function U(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function A(e){var t,n,r=e.match(Cn);for(t=0,n=r.length;n>t;t++)r[t]=In[r[t]]?In[r[t]]:U(r[t]);return function(i){var s="";for(t=0;n>t;t++)s+=r[t]instanceof Function?r[t].call(i,e):r[t];return s}}function E(e,t){return e.isValid()?(t=C(t,e.localeData()),Gn[t]||(Gn[t]=A(t)),Gn[t](e)):e.localeData().invalidDate()}function C(e,t){function n(e){return t.longDateFormat(e)||e}var r=5;for(Vn.lastIndex=0;r>=0&&Vn.test(e);)e=e.replace(Vn,n),Vn.lastIndex=0,r-=1;return e}function V(e,t,n){nr[e]="function"==typeof t?t:function(e){return e&&n?n:t}}function G(e,t){return o(nr,e)?nr[e](t._strict,t._locale):new RegExp(I(e))}function I(e){return e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(e,t,n,r,i){return t||n||r||i}).replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function L(e,t){var n,r=t;for("string"==typeof e&&(e=[e]),"number"==typeof t&&(r=function(e,n){n[t]=y(e)}),n=0;n<e.length;n++)rr[e[n]]=r}function W(e,t){L(e,function(e,n,r,i){r._w=r._w||{},t(e,r._w,r,i)})}function j(e,t,n){null!=t&&o(rr,e)&&rr[e](t,n._a,n,e)}function H(e,t){return new Date(Date.UTC(e,t+1,0)).getUTCDate()}function B(e){return this._months[e.month()]}function Z(e){return this._monthsShort[e.month()]}function z(e,t,n){var r,i,s;for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),r=0;12>r;r++){if(i=l([2e3,r]),n&&!this._longMonthsParse[r]&&(this._longMonthsParse[r]=new RegExp("^"+this.months(i,"").replace(".","")+"$","i"),this._shortMonthsParse[r]=new RegExp("^"+this.monthsShort(i,"").replace(".","")+"$","i")),n||this._monthsParse[r]||(s="^"+this.months(i,"")+"|^"+this.monthsShort(i,""),this._monthsParse[r]=new RegExp(s.replace(".",""),"i")),n&&"MMMM"===t&&this._longMonthsParse[r].test(e))return r;if(n&&"MMM"===t&&this._shortMonthsParse[r].test(e))return r;if(!n&&this._monthsParse[r].test(e))return r}}function q(e,t){var n;return"string"==typeof t&&(t=e.localeData().monthsParse(t),"number"!=typeof t)?e:(n=Math.min(e.date(),H(e.year(),t)),e._d["set"+(e._isUTC?"UTC":"")+"Month"](t,n),e)}function J(e){return null!=e?(q(this,e),n.updateOffset(this,!0),this):T(this,"Month")}function Q(){return H(this.year(),this.month())}function X(e){var t,n=e._a;return n&&-2===f(e).overflow&&(t=n[sr]<0||n[sr]>11?sr:n[ar]<1||n[ar]>H(n[ir],n[sr])?ar:n[or]<0||n[or]>24||24===n[or]&&(0!==n[ur]||0!==n[lr]||0!==n[cr])?or:n[ur]<0||n[ur]>59?ur:n[lr]<0||n[lr]>59?lr:n[cr]<0||n[cr]>999?cr:-1,f(e)._overflowDayOfYear&&(ir>t||t>ar)&&(t=ar),f(e).overflow=t),e}function K(e){n.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function ee(e,t){var n=!0,r=e+"\n"+(new Error).stack;return u(function(){return n&&(K(r),n=!1),t.apply(this,arguments)},t)}function te(e,t){mr[e]||(K(t),mr[e]=!0)}function ne(e){var t,n,r=e._i,i=hr.exec(r);if(i){for(f(e).iso=!0,t=0,n=pr.length;n>t;t++)if(pr[t][1].exec(r)){e._f=pr[t][0]+(i[6]||" ");break}for(t=0,n=vr.length;n>t;t++)if(vr[t][1].exec(r)){e._f+=vr[t][0];break}r.match(Kn)&&(e._f+="Z"),ke(e)}else e._isValid=!1}function re(e){var t=yr.exec(e._i);return null!==t?void(e._d=new Date(+t[1])):(ne(e),void(e._isValid===!1&&(delete e._isValid,n.createFromInputFallback(e))))}function ie(e,t,n,r,i,s,a){var o=new Date(e,t,n,r,i,s,a);return 1970>e&&o.setFullYear(e),o}function se(e){var t=new Date(Date.UTC.apply(null,arguments));return 1970>e&&t.setUTCFullYear(e),t}function ae(e){return oe(e)?366:365}function oe(e){return e%4===0&&e%100!==0||e%400===0}function ue(){return oe(this.year())}function le(e,t,n){var r,i=n-t,s=n-e.day();return s>i&&(s-=7),i-7>s&&(s+=7),r=$e(e).add(s,"d"),{week:Math.ceil(r.dayOfYear()/7),year:r.year()}}function ce(e){return le(e,this._week.dow,this._week.doy).week}function fe(){return this._week.dow}function de(){return this._week.doy}function me(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")}function he(e){var t=le(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")}function pe(e,t,n,r,i){var s,a,o=se(e,0,1).getUTCDay();return o=0===o?7:o,n=null!=n?n:i,s=i-o+(o>r?7:0)-(i>o?7:0),a=7*(t-1)+(n-i)+s+1,{year:a>0?e:e-1,dayOfYear:a>0?a:ae(e-1)+a}}function ve(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")}function ye(e,t,n){return null!=e?e:null!=t?t:n}function ge(e){var t=new Date;return e._useUTC?[t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate()]:[t.getFullYear(),t.getMonth(),t.getDate()]}function _e(e){var t,n,r,i,s=[];if(!e._d){for(r=ge(e),e._w&&null==e._a[ar]&&null==e._a[sr]&&Me(e),e._dayOfYear&&(i=ye(e._a[ir],r[ir]),e._dayOfYear>ae(i)&&(f(e)._overflowDayOfYear=!0),n=se(i,0,e._dayOfYear),e._a[sr]=n.getUTCMonth(),e._a[ar]=n.getUTCDate()),t=0;3>t&&null==e._a[t];++t)e._a[t]=s[t]=r[t];for(;7>t;t++)e._a[t]=s[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[or]&&0===e._a[ur]&&0===e._a[lr]&&0===e._a[cr]&&(e._nextDay=!0,e._a[or]=0),e._d=(e._useUTC?se:ie).apply(null,s),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[or]=24)}}function Me(e){var t,n,r,i,s,a,o;t=e._w,null!=t.GG||null!=t.W||null!=t.E?(s=1,a=4,n=ye(t.GG,e._a[ir],le($e(),1,4).year),r=ye(t.W,1),i=ye(t.E,1)):(s=e._locale._week.dow,a=e._locale._week.doy,n=ye(t.gg,e._a[ir],le($e(),s,a).year),r=ye(t.w,1),null!=t.d?(i=t.d,s>i&&++r):i=null!=t.e?t.e+s:s),o=pe(n,r,i,a,s),e._a[ir]=o.year,e._dayOfYear=o.dayOfYear}function ke(e){if(e._f===n.ISO_8601)return void ne(e);e._a=[],f(e).empty=!0;var t,r,i,s,a,o=""+e._i,u=o.length,l=0;for(i=C(e._f,e._locale).match(Cn)||[],t=0;t<i.length;t++)s=i[t],r=(o.match(G(s,e))||[])[0],r&&(a=o.substr(0,o.indexOf(r)),a.length>0&&f(e).unusedInput.push(a),o=o.slice(o.indexOf(r)+r.length),l+=r.length),In[s]?(r?f(e).empty=!1:f(e).unusedTokens.push(s),j(s,r,e)):e._strict&&!r&&f(e).unusedTokens.push(s);f(e).charsLeftOver=u-l,o.length>0&&f(e).unusedInput.push(o),f(e).bigHour===!0&&e._a[or]<=12&&e._a[or]>0&&(f(e).bigHour=void 0),e._a[or]=Se(e._locale,e._a[or],e._meridiem),_e(e),X(e)}function Se(e,t,n){var r;return null==n?t:null!=e.meridiemHour?e.meridiemHour(t,n):null!=e.isPM?(r=e.isPM(n),r&&12>t&&(t+=12),r||12!==t||(t=0),t):t}function we(e){var t,n,r,i,s;if(0===e._f.length)return f(e).invalidFormat=!0,void(e._d=new Date(0/0));for(i=0;i<e._f.length;i++)s=0,t=h({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._f=e._f[i],ke(t),d(t)&&(s+=f(t).charsLeftOver,s+=10*f(t).unusedTokens.length,f(t).score=s,(null==r||r>s)&&(r=s,n=t));u(e,n||t)}function De(e){if(!e._d){var t=$(e._i);e._a=[t.year,t.month,t.day||t.date,t.hour,t.minute,t.second,t.millisecond],_e(e)}}function be(e){var t,n=e._i,r=e._f;return e._locale=e._locale||b(e._l),null===n||void 0===r&&""===n?m({nullInput:!0}):("string"==typeof n&&(e._i=n=e._locale.preparse(n)),v(n)?new p(X(n)):(i(r)?we(e):r?ke(e):s(n)?e._d=n:Ye(e),t=new p(X(e)),t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t))}function Ye(e){var t=e._i;void 0===t?e._d=new Date:s(t)?e._d=new Date(+t):"string"==typeof t?re(e):i(t)?(e._a=a(t.slice(0),function(e){return parseInt(e,10)}),_e(e)):"object"==typeof t?De(e):"number"==typeof t?e._d=new Date(t):n.createFromInputFallback(e)}function Oe(e,t,n,r,i){var s={};return"boolean"==typeof n&&(r=n,n=void 0),s._isAMomentObject=!0,s._useUTC=s._isUTC=i,s._l=n,s._i=e,s._f=t,s._strict=r,be(s)}function $e(e,t,n,r){return Oe(e,t,n,r,!1)}function Ne(e,t){var n,r;if(1===t.length&&i(t[0])&&(t=t[0]),!t.length)return $e();for(n=t[0],r=1;r<t.length;++r)t[r][e](n)&&(n=t[r]);return n}function Te(){var e=[].slice.call(arguments,0);return Ne("isBefore",e)}function Pe(){var e=[].slice.call(arguments,0);return Ne("isAfter",e)}function xe(e){var t=$(e),n=t.year||0,r=t.quarter||0,i=t.month||0,s=t.week||0,a=t.day||0,o=t.hour||0,u=t.minute||0,l=t.second||0,c=t.millisecond||0;this._milliseconds=+c+1e3*l+6e4*u+36e5*o,this._days=+a+7*s,this._months=+i+3*r+12*n,this._data={},this._locale=b(),this._bubble()}function Re(e){return e instanceof xe}function Fe(e,t){F(e,0,0,function(){var e=this.utcOffset(),n="+";return 0>e&&(e=-e,n="-"),n+R(~~(e/60),2)+t+R(~~e%60,2)})}function Ue(e){var t=(e||"").match(Kn)||[],n=t[t.length-1]||[],r=(n+"").match(Sr)||["-",0,0],i=+(60*r[1])+y(r[2]);return"+"===r[0]?i:-i}function Ae(e,t){var r,i;return t._isUTC?(r=t.clone(),i=(v(e)||s(e)?+e:+$e(e))-+r,r._d.setTime(+r._d+i),n.updateOffset(r,!1),r):$e(e).local()}function Ee(e){return 15*-Math.round(e._d.getTimezoneOffset()/15)}function Ce(e,t){var r,i=this._offset||0;return null!=e?("string"==typeof e&&(e=Ue(e)),Math.abs(e)<16&&(e=60*e),!this._isUTC&&t&&(r=Ee(this)),this._offset=e,this._isUTC=!0,null!=r&&this.add(r,"m"),i!==e&&(!t||this._changeInProgress?et(this,qe(e-i,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,n.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?i:Ee(this)}function Ve(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}function Ge(e){return this.utcOffset(0,e)}function Ie(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract(Ee(this),"m")),this}function Le(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(Ue(this._i)),this}function We(e){return e=e?$e(e).utcOffset():0,(this.utcOffset()-e)%60===0}function je(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function He(){if(this._a){var e=this._isUTC?l(this._a):$e(this._a);return this.isValid()&&g(this._a,e.toArray())>0}return!1}function Be(){return!this._isUTC}function Ze(){return this._isUTC}function ze(){return this._isUTC&&0===this._offset}function qe(e,t){var n,r,i,s=e,a=null;return Re(e)?s={ms:e._milliseconds,d:e._days,M:e._months}:"number"==typeof e?(s={},t?s[t]=e:s.milliseconds=e):(a=wr.exec(e))?(n="-"===a[1]?-1:1,s={y:0,d:y(a[ar])*n,h:y(a[or])*n,m:y(a[ur])*n,s:y(a[lr])*n,ms:y(a[cr])*n}):(a=Dr.exec(e))?(n="-"===a[1]?-1:1,s={y:Je(a[2],n),M:Je(a[3],n),d:Je(a[4],n),h:Je(a[5],n),m:Je(a[6],n),s:Je(a[7],n),w:Je(a[8],n)}):null==s?s={}:"object"==typeof s&&("from"in s||"to"in s)&&(i=Xe($e(s.from),$e(s.to)),s={},s.ms=i.milliseconds,s.M=i.months),r=new xe(s),Re(e)&&o(e,"_locale")&&(r._locale=e._locale),r}function Je(e,t){var n=e&&parseFloat(e.replace(",","."));return(isNaN(n)?0:n)*t}function Qe(e,t){var n={milliseconds:0,months:0};return n.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(n.months,"M").isAfter(t)&&--n.months,n.milliseconds=+t-+e.clone().add(n.months,"M"),n}function Xe(e,t){var n;return t=Ae(t,e),e.isBefore(t)?n=Qe(e,t):(n=Qe(t,e),n.milliseconds=-n.milliseconds,n.months=-n.months),n}function Ke(e,t){return function(n,r){var i,s;return null===r||isNaN(+r)||(te(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period)."),s=n,n=r,r=s),n="string"==typeof n?+n:n,i=qe(n,r),et(this,i,e),this}}function et(e,t,r,i){var s=t._milliseconds,a=t._days,o=t._months;i=null==i?!0:i,s&&e._d.setTime(+e._d+s*r),a&&P(e,"Date",T(e,"Date")+a*r),o&&q(e,T(e,"Month")+o*r),i&&n.updateOffset(e,a||o)}function tt(e){var t=e||$e(),n=Ae(t,this).startOf("day"),r=this.diff(n,"days",!0),i=-6>r?"sameElse":-1>r?"lastWeek":0>r?"lastDay":1>r?"sameDay":2>r?"nextDay":7>r?"nextWeek":"sameElse";return this.format(this.localeData().calendar(i,this,$e(t)))}function nt(){return new p(this)}function rt(e,t){var n;return t=O("undefined"!=typeof t?t:"millisecond"),"millisecond"===t?(e=v(e)?e:$e(e),+this>+e):(n=v(e)?+e:+$e(e),n<+this.clone().startOf(t))}function it(e,t){var n;return t=O("undefined"!=typeof t?t:"millisecond"),"millisecond"===t?(e=v(e)?e:$e(e),+e>+this):(n=v(e)?+e:+$e(e),+this.clone().endOf(t)<n)}function st(e,t,n){return this.isAfter(e,n)&&this.isBefore(t,n)}function at(e,t){var n;return t=O(t||"millisecond"),"millisecond"===t?(e=v(e)?e:$e(e),+this===+e):(n=+$e(e),+this.clone().startOf(t)<=n&&n<=+this.clone().endOf(t))}function ot(e){return 0>e?Math.ceil(e):Math.floor(e)}function ut(e,t,n){var r,i,s=Ae(e,this),a=6e4*(s.utcOffset()-this.utcOffset());return t=O(t),"year"===t||"month"===t||"quarter"===t?(i=lt(this,s),"quarter"===t?i/=3:"year"===t&&(i/=12)):(r=this-s,i="second"===t?r/1e3:"minute"===t?r/6e4:"hour"===t?r/36e5:"day"===t?(r-a)/864e5:"week"===t?(r-a)/6048e5:r),n?i:ot(i)}function lt(e,t){var n,r,i=12*(t.year()-e.year())+(t.month()-e.month()),s=e.clone().add(i,"months");return 0>t-s?(n=e.clone().add(i-1,"months"),r=(t-s)/(s-n)):(n=e.clone().add(i+1,"months"),r=(t-s)/(n-s)),-(i+r)}function ct(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function ft(){var e=this.clone().utc();return 0<e.year()&&e.year()<=9999?"function"==typeof Date.prototype.toISOString?this.toDate().toISOString():E(e,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):E(e,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function dt(e){var t=E(this,e||n.defaultFormat);return this.localeData().postformat(t)}function mt(e,t){return this.isValid()?qe({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function ht(e){return this.from($e(),e)}function pt(e,t){return this.isValid()?qe({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function vt(e){return this.to($e(),e)}function yt(e){var t;return void 0===e?this._locale._abbr:(t=b(e),null!=t&&(this._locale=t),this)}function gt(){return this._locale}function _t(e){switch(e=O(e)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===e&&this.weekday(0),"isoWeek"===e&&this.isoWeekday(1),"quarter"===e&&this.month(3*Math.floor(this.month()/3)),this}function Mt(e){return e=O(e),void 0===e||"millisecond"===e?this:this.startOf(e).add(1,"isoWeek"===e?"week":e).subtract(1,"ms")}function kt(){return+this._d-6e4*(this._offset||0)}function St(){return Math.floor(+this/1e3)}function wt(){return this._offset?new Date(+this):this._d}function Dt(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]}function bt(){return d(this)}function Yt(){return u({},f(this))}function Ot(){return f(this).overflow}function $t(e,t){F(0,[e,e.length],0,t)}function Nt(e,t,n){return le($e([e,11,31+t-n]),t,n).week}function Tt(e){var t=le(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==e?t:this.add(e-t,"y")}function Pt(e){var t=le(this,1,4).year;return null==e?t:this.add(e-t,"y")}function xt(){return Nt(this.year(),1,4)}function Rt(){var e=this.localeData()._week;return Nt(this.year(),e.dow,e.doy)}function Ft(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)}function Ut(e,t){if("string"==typeof e)if(isNaN(e)){if(e=t.weekdaysParse(e),"number"!=typeof e)return null}else e=parseInt(e,10);return e}function At(e){return this._weekdays[e.day()]}function Et(e){return this._weekdaysShort[e.day()]}function Ct(e){return this._weekdaysMin[e.day()]}function Vt(e){var t,n,r;for(this._weekdaysParse||(this._weekdaysParse=[]),t=0;7>t;t++)if(this._weekdaysParse[t]||(n=$e([2e3,1]).day(t),r="^"+this.weekdays(n,"")+"|^"+this.weekdaysShort(n,"")+"|^"+this.weekdaysMin(n,""),this._weekdaysParse[t]=new RegExp(r.replace(".",""),"i")),this._weekdaysParse[t].test(e))return t}function Gt(e){var t=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=e?(e=Ut(e,this.localeData()),this.add(e-t,"d")):t}function It(e){var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")}function Lt(e){return null==e?this.day()||7:this.day(this.day()%7?e:e-7)}function Wt(e,t){F(e,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)})}function jt(e,t){return t._meridiemParse}function Ht(e){return"p"===(e+"").toLowerCase().charAt(0)}function Bt(e,t,n){return e>11?n?"pm":"PM":n?"am":"AM"}function Zt(e){F(0,[e,3],0,"millisecond")}function zt(){return this._isUTC?"UTC":""}function qt(){return this._isUTC?"Coordinated Universal Time":""}function Jt(e){return $e(1e3*e)}function Qt(){return $e.apply(null,arguments).parseZone()}function Xt(e,t,n){var r=this._calendar[e];return"function"==typeof r?r.call(t,n):r}function Kt(e){var t=this._longDateFormat[e];return!t&&this._longDateFormat[e.toUpperCase()]&&(t=this._longDateFormat[e.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(e){return e.slice(1)}),this._longDateFormat[e]=t),t}function en(){return this._invalidDate}function tn(e){return this._ordinal.replace("%d",e)}function nn(e){return e}function rn(e,t,n,r){var i=this._relativeTime[n];return"function"==typeof i?i(e,t,n,r):i.replace(/%d/i,e)}function sn(e,t){var n=this._relativeTime[e>0?"future":"past"];return"function"==typeof n?n(t):n.replace(/%s/i,t)}function an(e){var t,n;for(n in e)t=e[n],"function"==typeof t?this[n]=t:this["_"+n]=t;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function on(e,t,n,r){var i=b(),s=l().set(r,t);return i[n](s,e)}function un(e,t,n,r,i){if("number"==typeof e&&(t=e,e=void 0),e=e||"",null!=t)return on(e,t,n,i);var s,a=[];for(s=0;r>s;s++)a[s]=on(e,s,n,i);return a}function ln(e,t){return un(e,t,"months",12,"month")}function cn(e,t){return un(e,t,"monthsShort",12,"month")}function fn(e,t){return un(e,t,"weekdays",7,"day")}function dn(e,t){return un(e,t,"weekdaysShort",7,"day")}function mn(e,t){return un(e,t,"weekdaysMin",7,"day")}function hn(){var e=this._data;return this._milliseconds=Br(this._milliseconds),this._days=Br(this._days),this._months=Br(this._months),e.milliseconds=Br(e.milliseconds),e.seconds=Br(e.seconds),e.minutes=Br(e.minutes),e.hours=Br(e.hours),e.months=Br(e.months),e.years=Br(e.years),this}function pn(e,t,n,r){var i=qe(t,n);return e._milliseconds+=r*i._milliseconds,e._days+=r*i._days,e._months+=r*i._months,e._bubble()}function vn(e,t){return pn(this,e,t,1)}function yn(e,t){return pn(this,e,t,-1)}function gn(){var e,t,n,r=this._milliseconds,i=this._days,s=this._months,a=this._data,o=0;return a.milliseconds=r%1e3,e=ot(r/1e3),a.seconds=e%60,t=ot(e/60),a.minutes=t%60,n=ot(t/60),a.hours=n%24,i+=ot(n/24),o=ot(_n(i)),i-=ot(Mn(o)),s+=ot(i/30),i%=30,o+=ot(s/12),s%=12,a.days=i,a.months=s,
        a.years=o,this}function _n(e){return 400*e/146097}function Mn(e){return 146097*e/400}function kn(e){var t,n,r=this._milliseconds;if(e=O(e),"month"===e||"year"===e)return t=this._days+r/864e5,n=this._months+12*_n(t),"month"===e?n:n/12;switch(t=this._days+Math.round(Mn(this._months/12)),e){case"week":return t/7+r/6048e5;case"day":return t+r/864e5;case"hour":return 24*t+r/36e5;case"minute":return 1440*t+r/6e4;case"second":return 86400*t+r/1e3;case"millisecond":return Math.floor(864e5*t)+r;default:throw new Error("Unknown unit "+e)}}function Sn(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*y(this._months/12)}function wn(e){return function(){return this.as(e)}}function Dn(e){return e=O(e),this[e+"s"]()}function bn(e){return function(){return this._data[e]}}function Yn(){return ot(this.days()/7)}function On(e,t,n,r,i){return i.relativeTime(t||1,!!n,e,r)}function $n(e,t,n){var r=qe(e).abs(),i=ui(r.as("s")),s=ui(r.as("m")),a=ui(r.as("h")),o=ui(r.as("d")),u=ui(r.as("M")),l=ui(r.as("y")),c=i<li.s&&["s",i]||1===s&&["m"]||s<li.m&&["mm",s]||1===a&&["h"]||a<li.h&&["hh",a]||1===o&&["d"]||o<li.d&&["dd",o]||1===u&&["M"]||u<li.M&&["MM",u]||1===l&&["y"]||["yy",l];return c[2]=t,c[3]=+e>0,c[4]=n,On.apply(null,c)}function Nn(e,t){return void 0===li[e]?!1:void 0===t?li[e]:(li[e]=t,!0)}function Tn(e){var t=this.localeData(),n=$n(this,!e,t);return e&&(n=t.pastFuture(+this,n)),t.postformat(n)}function Pn(){var e=ci(this.years()),t=ci(this.months()),n=ci(this.days()),r=ci(this.hours()),i=ci(this.minutes()),s=ci(this.seconds()+this.milliseconds()/1e3),a=this.asSeconds();return a?(0>a?"-":"")+"P"+(e?e+"Y":"")+(t?t+"M":"")+(n?n+"D":"")+(r||i||s?"T":"")+(r?r+"H":"")+(i?i+"M":"")+(s?s+"S":""):"P0D"}var xn,Rn,Fn=n.momentProperties=[],Un=!1,An={},En={},Cn=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,Vn=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Gn={},In={},Ln=/\d/,Wn=/\d\d/,jn=/\d{3}/,Hn=/\d{4}/,Bn=/[+-]?\d{6}/,Zn=/\d\d?/,zn=/\d{1,3}/,qn=/\d{1,4}/,Jn=/[+-]?\d{1,6}/,Qn=/\d+/,Xn=/[+-]?\d+/,Kn=/Z|[+-]\d\d:?\d\d/gi,er=/[+-]?\d+(\.\d{1,3})?/,tr=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,nr={},rr={},ir=0,sr=1,ar=2,or=3,ur=4,lr=5,cr=6;F("M",["MM",2],"Mo",function(){return this.month()+1}),F("MMM",0,0,function(e){return this.localeData().monthsShort(this,e)}),F("MMMM",0,0,function(e){return this.localeData().months(this,e)}),Y("month","M"),V("M",Zn),V("MM",Zn,Wn),V("MMM",tr),V("MMMM",tr),L(["M","MM"],function(e,t){t[sr]=y(e)-1}),L(["MMM","MMMM"],function(e,t,n,r){var i=n._locale.monthsParse(e,r,n._strict);null!=i?t[sr]=i:f(n).invalidMonth=e});var fr="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),dr="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),mr={};n.suppressDeprecationWarnings=!1;var hr=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,pr=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],vr=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],yr=/^\/?Date\((\-?\d+)/i;n.createFromInputFallback=ee("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))}),F(0,["YY",2],0,function(){return this.year()%100}),F(0,["YYYY",4],0,"year"),F(0,["YYYYY",5],0,"year"),F(0,["YYYYYY",6,!0],0,"year"),Y("year","y"),V("Y",Xn),V("YY",Zn,Wn),V("YYYY",qn,Hn),V("YYYYY",Jn,Bn),V("YYYYYY",Jn,Bn),L(["YYYY","YYYYY","YYYYYY"],ir),L("YY",function(e,t){t[ir]=n.parseTwoDigitYear(e)}),n.parseTwoDigitYear=function(e){return y(e)+(y(e)>68?1900:2e3)};var gr=N("FullYear",!1);F("w",["ww",2],"wo","week"),F("W",["WW",2],"Wo","isoWeek"),Y("week","w"),Y("isoWeek","W"),V("w",Zn),V("ww",Zn,Wn),V("W",Zn),V("WW",Zn,Wn),W(["w","ww","W","WW"],function(e,t,n,r){t[r.substr(0,1)]=y(e)});var _r={dow:0,doy:6};F("DDD",["DDDD",3],"DDDo","dayOfYear"),Y("dayOfYear","DDD"),V("DDD",zn),V("DDDD",jn),L(["DDD","DDDD"],function(e,t,n){n._dayOfYear=y(e)}),n.ISO_8601=function(){};var Mr=ee("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(){var e=$e.apply(null,arguments);return this>e?this:e}),kr=ee("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(){var e=$e.apply(null,arguments);return e>this?this:e});Fe("Z",":"),Fe("ZZ",""),V("Z",Kn),V("ZZ",Kn),L(["Z","ZZ"],function(e,t,n){n._useUTC=!0,n._tzm=Ue(e)});var Sr=/([\+\-]|\d\d)/gi;n.updateOffset=function(){};var wr=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Dr=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;qe.fn=xe.prototype;var br=Ke(1,"add"),Yr=Ke(-1,"subtract");n.defaultFormat="YYYY-MM-DDTHH:mm:ssZ";var Or=ee("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(e){return void 0===e?this.localeData():this.locale(e)});F(0,["gg",2],0,function(){return this.weekYear()%100}),F(0,["GG",2],0,function(){return this.isoWeekYear()%100}),$t("gggg","weekYear"),$t("ggggg","weekYear"),$t("GGGG","isoWeekYear"),$t("GGGGG","isoWeekYear"),Y("weekYear","gg"),Y("isoWeekYear","GG"),V("G",Xn),V("g",Xn),V("GG",Zn,Wn),V("gg",Zn,Wn),V("GGGG",qn,Hn),V("gggg",qn,Hn),V("GGGGG",Jn,Bn),V("ggggg",Jn,Bn),W(["gggg","ggggg","GGGG","GGGGG"],function(e,t,n,r){t[r.substr(0,2)]=y(e)}),W(["gg","GG"],function(e,t,r,i){t[i]=n.parseTwoDigitYear(e)}),F("Q",0,0,"quarter"),Y("quarter","Q"),V("Q",Ln),L("Q",function(e,t){t[sr]=3*(y(e)-1)}),F("D",["DD",2],"Do","date"),Y("date","D"),V("D",Zn),V("DD",Zn,Wn),V("Do",function(e,t){return e?t._ordinalParse:t._ordinalParseLenient}),L(["D","DD"],ar),L("Do",function(e,t){t[ar]=y(e.match(Zn)[0],10)});var $r=N("Date",!0);F("d",0,"do","day"),F("dd",0,0,function(e){return this.localeData().weekdaysMin(this,e)}),F("ddd",0,0,function(e){return this.localeData().weekdaysShort(this,e)}),F("dddd",0,0,function(e){return this.localeData().weekdays(this,e)}),F("e",0,0,"weekday"),F("E",0,0,"isoWeekday"),Y("day","d"),Y("weekday","e"),Y("isoWeekday","E"),V("d",Zn),V("e",Zn),V("E",Zn),V("dd",tr),V("ddd",tr),V("dddd",tr),W(["dd","ddd","dddd"],function(e,t,n){var r=n._locale.weekdaysParse(e);null!=r?t.d=r:f(n).invalidWeekday=e}),W(["d","e","E"],function(e,t,n,r){t[r]=y(e)});var Nr="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Tr="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),Pr="Su_Mo_Tu_We_Th_Fr_Sa".split("_");F("H",["HH",2],0,"hour"),F("h",["hh",2],0,function(){return this.hours()%12||12}),Wt("a",!0),Wt("A",!1),Y("hour","h"),V("a",jt),V("A",jt),V("H",Zn),V("h",Zn),V("HH",Zn,Wn),V("hh",Zn,Wn),L(["H","HH"],or),L(["a","A"],function(e,t,n){n._isPm=n._locale.isPM(e),n._meridiem=e}),L(["h","hh"],function(e,t,n){t[or]=y(e),f(n).bigHour=!0});var xr=/[ap]\.?m?\.?/i,Rr=N("Hours",!0);F("m",["mm",2],0,"minute"),Y("minute","m"),V("m",Zn),V("mm",Zn,Wn),L(["m","mm"],ur);var Fr=N("Minutes",!1);F("s",["ss",2],0,"second"),Y("second","s"),V("s",Zn),V("ss",Zn,Wn),L(["s","ss"],lr);var Ur=N("Seconds",!1);F("S",0,0,function(){return~~(this.millisecond()/100)}),F(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),Zt("SSS"),Zt("SSSS"),Y("millisecond","ms"),V("S",zn,Ln),V("SS",zn,Wn),V("SSS",zn,jn),V("SSSS",Qn),L(["S","SS","SSS","SSSS"],function(e,t){t[cr]=y(1e3*("0."+e))});var Ar=N("Milliseconds",!1);F("z",0,0,"zoneAbbr"),F("zz",0,0,"zoneName");var Er=p.prototype;Er.add=br,Er.calendar=tt,Er.clone=nt,Er.diff=ut,Er.endOf=Mt,Er.format=dt,Er.from=mt,Er.fromNow=ht,Er.to=pt,Er.toNow=vt,Er.get=x,Er.invalidAt=Ot,Er.isAfter=rt,Er.isBefore=it,Er.isBetween=st,Er.isSame=at,Er.isValid=bt,Er.lang=Or,Er.locale=yt,Er.localeData=gt,Er.max=kr,Er.min=Mr,Er.parsingFlags=Yt,Er.set=x,Er.startOf=_t,Er.subtract=Yr,Er.toArray=Dt,Er.toDate=wt,Er.toISOString=ft,Er.toJSON=ft,Er.toString=ct,Er.unix=St,Er.valueOf=kt,Er.year=gr,Er.isLeapYear=ue,Er.weekYear=Tt,Er.isoWeekYear=Pt,Er.quarter=Er.quarters=Ft,Er.month=J,Er.daysInMonth=Q,Er.week=Er.weeks=me,Er.isoWeek=Er.isoWeeks=he,Er.weeksInYear=Rt,Er.isoWeeksInYear=xt,Er.date=$r,Er.day=Er.days=Gt,Er.weekday=It,Er.isoWeekday=Lt,Er.dayOfYear=ve,Er.hour=Er.hours=Rr,Er.minute=Er.minutes=Fr,Er.second=Er.seconds=Ur,Er.millisecond=Er.milliseconds=Ar,Er.utcOffset=Ce,Er.utc=Ge,Er.local=Ie,Er.parseZone=Le,Er.hasAlignedHourOffset=We,Er.isDST=je,Er.isDSTShifted=He,Er.isLocal=Be,Er.isUtcOffset=Ze,Er.isUtc=ze,Er.isUTC=ze,Er.zoneAbbr=zt,Er.zoneName=qt,Er.dates=ee("dates accessor is deprecated. Use date instead.",$r),Er.months=ee("months accessor is deprecated. Use month instead",J),Er.years=ee("years accessor is deprecated. Use year instead",gr),Er.zone=ee("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",Ve);var Cr=Er,Vr={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},Gr={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY LT",LLLL:"dddd, MMMM D, YYYY LT"},Ir="Invalid date",Lr="%d",Wr=/\d{1,2}/,jr={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Hr=_.prototype;Hr._calendar=Vr,Hr.calendar=Xt,Hr._longDateFormat=Gr,Hr.longDateFormat=Kt,Hr._invalidDate=Ir,Hr.invalidDate=en,Hr._ordinal=Lr,Hr.ordinal=tn,Hr._ordinalParse=Wr,Hr.preparse=nn,Hr.postformat=nn,Hr._relativeTime=jr,Hr.relativeTime=rn,Hr.pastFuture=sn,Hr.set=an,Hr.months=B,Hr._months=fr,Hr.monthsShort=Z,Hr._monthsShort=dr,Hr.monthsParse=z,Hr.week=ce,Hr._week=_r,Hr.firstDayOfYear=de,Hr.firstDayOfWeek=fe,Hr.weekdays=At,Hr._weekdays=Nr,Hr.weekdaysMin=Ct,Hr._weekdaysMin=Pr,Hr.weekdaysShort=Et,Hr._weekdaysShort=Tr,Hr.weekdaysParse=Vt,Hr.isPM=Ht,Hr._meridiemParse=xr,Hr.meridiem=Bt,w("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10,n=1===y(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th";return e+n}}),n.lang=ee("moment.lang is deprecated. Use moment.locale instead.",w),n.langData=ee("moment.langData is deprecated. Use moment.localeData instead.",b);var Br=Math.abs,Zr=wn("ms"),zr=wn("s"),qr=wn("m"),Jr=wn("h"),Qr=wn("d"),Xr=wn("w"),Kr=wn("M"),ei=wn("y"),ti=bn("milliseconds"),ni=bn("seconds"),ri=bn("minutes"),ii=bn("hours"),si=bn("days"),ai=bn("months"),oi=bn("years"),ui=Math.round,li={s:45,m:45,h:22,d:26,M:11},ci=Math.abs,fi=xe.prototype;fi.abs=hn,fi.add=vn,fi.subtract=yn,fi.as=kn,fi.asMilliseconds=Zr,fi.asSeconds=zr,fi.asMinutes=qr,fi.asHours=Jr,fi.asDays=Qr,fi.asWeeks=Xr,fi.asMonths=Kr,fi.asYears=ei,fi.valueOf=Sn,fi._bubble=gn,fi.get=Dn,fi.milliseconds=ti,fi.seconds=ni,fi.minutes=ri,fi.hours=ii,fi.days=si,fi.weeks=Yn,fi.months=ai,fi.years=oi,fi.humanize=Tn,fi.toISOString=Pn,fi.toString=Pn,fi.toJSON=Pn,fi.locale=yt,fi.localeData=gt,fi.toIsoString=ee("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Pn),fi.lang=Or,F("X",0,0,"unix"),F("x",0,0,"valueOf"),V("x",Xn),V("X",er),L("X",function(e,t,n){n._d=new Date(1e3*parseFloat(e,10))}),L("x",function(e,t,n){n._d=new Date(y(e))}),n.version="2.10.3",r($e),n.fn=Cr,n.min=Te,n.max=Pe,n.utc=l,n.unix=Jt,n.months=ln,n.isDate=s,n.locale=w,n.invalid=m,n.duration=qe,n.isMoment=v,n.weekdays=fn,n.parseZone=Qt,n.localeData=b,n.isDuration=Re,n.monthsShort=cn,n.weekdaysMin=mn,n.defineLocale=D,n.weekdaysShort=dn,n.normalizeUnits=O,n.relativeTimeThreshold=Nn;var di=n;return di})},{}],3:[function(e,t,n){!function(e,r){"function"==typeof define&&define.amd?define([],r):"object"==typeof n?t.exports=r():e.StringMask=r()}(this,function(){function e(e,t){for(var n=0,r=t-1,i={escape:!0};r>=0&&i&&i.escape;)i=a[e.charAt(r)],n+=i&&i.escape?1:0,r--;return n>0&&n%2===1}function t(e,t){var n=e.replace(/[^0]/g,"").length,r=t.replace(/[^\d]/g,"").length;return r-n}function n(e,t,n,r){return r&&"function"==typeof r.transform&&(t=r.transform(t)),n.reverse?t+e:e+t}function r(e,t,n){var i=e.charAt(t),s=a[i];return""===i?!1:s&&!s.escape?!0:r(e,t+n,n)}function i(e,t,n){var r=e.split("");return r.splice(n>=0?n:0,0,t),r.join("")}function s(e,t){this.options=t||{},this.options={reverse:this.options.reverse||!1,usedefaults:this.options.usedefaults||this.options.reverse},this.pattern=e}var a={0:{pattern:/\d/,_default:"0"},9:{pattern:/\d/,optional:!0},"#":{pattern:/\d/,optional:!0,recursive:!0},S:{pattern:/[a-zA-Z]/},U:{pattern:/[a-zA-Z]/,transform:function(e){return e.toLocaleUpperCase()}},L:{pattern:/[a-zA-Z]/,transform:function(e){return e.toLocaleLowerCase()}},$:{escape:!0}};return s.prototype.process=function(s){function o(e){if(!p&&r(u,y,v.inc))return!0;if(p||(p=h.length>0),p){var t=h.shift();if(h.push(t),e.reverse&&f>=0)return y++,u=i(u,t,y),!0;if(!e.reverse&&f<s.length)return u=i(u,t,y),!0}return y<u.length&&y>=0}if(!s)return"";s+="";for(var u=this.pattern,l=!0,c="",f=this.options.reverse?s.length-1:0,d=t(u,s),m=!1,h=[],p=!1,v={start:this.options.reverse?u.length-1:0,end:this.options.reverse?-1:u.length,inc:this.options.reverse?-1:1},y=v.start;o(this.options);y+=v.inc){var g=u.charAt(y),_=s.charAt(f),M=a[g];if(!p||_){if(this.options.reverse&&e(u,y)){c=n(c,g,this.options,M),y+=v.inc;continue}if(!this.options.reverse&&m){c=n(c,g,this.options,M),m=!1;continue}if(!this.options.reverse&&M&&M.escape){m=!0;continue}}if(!p&&M&&M.recursive)h.push(g);else{if(p&&!_){M&&M.recursive||(c=n(c,g,this.options,M));continue}if(h.length>0&&M&&!M.recursive){l=!1;continue}if(!p&&h.length>0&&!_)continue}if(M)if(M.optional){if(M.pattern.test(_)&&d)c=n(c,_,this.options,M),f+=v.inc,d--;else if(h.length>0&&_){l=!1;break}}else if(M.pattern.test(_))c=n(c,_,this.options,M),f+=v.inc;else{if(_||!M._default||!this.options.usedefaults){l=!1;break}c=n(c,M._default,this.options,M)}else c=n(c,g,this.options,M),!p&&h.length&&h.push(g)}return{result:c,valid:l}},s.prototype.apply=function(e){return this.process(e).result},s.prototype.validate=function(e){return this.process(e).valid},s.process=function(e,t,n){return new s(t,n).process(e)},s.apply=function(e,t,n){return new s(t,n).apply(e)},s.validate=function(e,t,n){return new s(t,n).validate(e)},s})},{}],4:[function(e,t,n){t.exports=angular.module("ui.utils.masks",[e("./global/global-masks"),e("./br/br-masks"),e("./us/us-masks")]).name},{"./br/br-masks":6,"./global/global-masks":15,"./us/us-masks":23}],5:[function(e,t,n){var r=e("string-mask"),i=e("mask-factory"),s=new r("00000.00000 00000.000000 00000.000000 0 00000000000000");t.exports=i({clearValue:function(e){return e.replace(/[^0-9]/g,"").slice(0,47)},format:function(e){return 0===e.length?e:s.apply(e).replace(/[^0-9]$/,"")},validations:{brBoletoBancario:function(e){return 47===e.length}}})},{"mask-factory":"mask-factory","string-mask":3}],6:[function(e,t,n){var r=angular.module("ui.utils.masks.br",[e("../helpers")]).directive("uiBrBoletoBancarioMask",e("./boleto-bancario/boleto-bancario")).directive("uiBrCepMask",e("./cep/cep")).directive("uiBrCnpjMask",e("./cnpj/cnpj")).directive("uiBrCpfMask",e("./cpf/cpf")).directive("uiBrCpfcnpjMask",e("./cpf-cnpj/cpf-cnpj")).directive("uiBrIeMask",e("./inscricao-estadual/ie")).directive("uiNfeAccessKeyMask",e("./nfe/nfe")).directive("uiBrPhoneNumber",e("./phone/br-phone"));t.exports=r.name},{"../helpers":21,"./boleto-bancario/boleto-bancario":5,"./cep/cep":7,"./cnpj/cnpj":8,"./cpf-cnpj/cpf-cnpj":9,"./cpf/cpf":10,"./inscricao-estadual/ie":11,"./nfe/nfe":12,"./phone/br-phone":13}],7:[function(e,t,n){var r=e("string-mask"),i=e("mask-factory"),s=new r("00000-000");t.exports=i({clearValue:function(e){return e.replace(/[^0-9]/g,"").slice(0,8)},format:function(e){return(s.apply(e)||"").replace(/[^0-9]$/,"")},validations:{cep:function(e){return 8===e.length}}})},{"mask-factory":"mask-factory","string-mask":3}],8:[function(e,t,n){var r=e("string-mask"),i=e("br-validations"),s=e("mask-factory"),a=new r("00.000.000/0000-00");t.exports=s({clearValue:function(e){return e.replace(/[^\d]/g,"").slice(0,14)},format:function(e){return(a.apply(e)||"").trim().replace(/[^0-9]$/,"")},validations:{cnpj:function(e){return i.cnpj.validate(e)}}})},{"br-validations":1,"mask-factory":"mask-factory","string-mask":3}],9:[function(e,t,n){var r=e("string-mask"),i=e("br-validations"),s=e("mask-factory"),a=new r("00.000.000/0000-00"),o=new r("000.000.000-00");t.exports=s({clearValue:function(e){return e.replace(/[^\d]/g,"").slice(0,14)},format:function(e){var t;return t=e.length>11?a.apply(e):o.apply(e)||"",t.trim().replace(/[^0-9]$/,"")},validations:{cpf:function(e){return e.length>11||i.cpf.validate(e)},cnpj:function(e){return e.length<=11||i.cnpj.validate(e)}}})},{"br-validations":1,"mask-factory":"mask-factory","string-mask":3}],10:[function(e,t,n){var r=e("string-mask"),i=e("br-validations"),s=e("mask-factory"),a=new r("000.000.000-00");t.exports=s({clearValue:function(e){return e.replace(/[^\d]/g,"").slice(0,11)},format:function(e){return(a.apply(e)||"").trim().replace(/[^0-9]$/,"")},validations:{cpf:function(e){return i.cpf.validate(e)}}})},{"br-validations":1,"mask-factory":"mask-factory","string-mask":3}],11:[function(e,t,n){function r(e){function t(e){return e?e.replace(/[^0-9]/g,""):e}function n(e,n){if(!e||!a[e])return void 0;if("SP"===e&&/^P/i.test(n))return a.SP[1].mask;for(var r=a[e],i=0;r[i].chars&&r[i].chars<t(n).length&&i<r.length-1;)i++;return r[i].mask}function r(e,r){var i=n(r,e);if(!i)return e;var s=i.process(t(e)),a=s.result||"";return a=a.trim().replace(/[^0-9]$/,""),"SP"===r&&/^p/i.test(e)?"P"+a:a}var a={AC:[{mask:new i("00.000.000/000-00")}],AL:[{mask:new i("000000000")}],AM:[{mask:new i("00.000.000-0")}],AP:[{mask:new i("000000000")}],BA:[{chars:8,mask:new i("000000-00")},{mask:new i("0000000-00")}],CE:[{mask:new i("00000000-0")}],DF:[{mask:new i("00000000000-00")}],ES:[{mask:new i("00000000-0")}],GO:[{mask:new i("00.000.000-0")}],MA:[{mask:new i("000000000")}],MG:[{mask:new i("000.000.000/0000")}],MS:[{mask:new i("000000000")}],MT:[{mask:new i("0000000000-0")}],PA:[{mask:new i("00-000000-0")}],PB:[{mask:new i("00000000-0")}],PE:[{chars:9,mask:new i("0000000-00")},{mask:new i("00.0.000.0000000-0")}],PI:[{mask:new i("000000000")}],PR:[{mask:new i("000.00000-00")}],RJ:[{mask:new i("00.000.00-0")}],RN:[{chars:9,mask:new i("00.000.000-0")},{mask:new i("00.0.000.000-0")}],RO:[{mask:new i("0000000000000-0")}],RR:[{mask:new i("00000000-0")}],RS:[{mask:new i("000/0000000")}],SC:[{mask:new i("000.000.000")}],SE:[{mask:new i("00000000-0")}],SP:[{mask:new i("000.000.000.000")},{mask:new i("-00000000.0/000")}],TO:[{mask:new i("00000000000")}]};return{restrict:"A",require:"ngModel",link:function(n,i,a,o){function u(e){return o.$isEmpty(e)?e:r(e,c)}function l(e){if(o.$isEmpty(e))return e;var n=r(e,c),i=t(n);return o.$viewValue!==n&&(o.$setViewValue(n),o.$render()),c&&"SP"===c.toUpperCase()&&/^p/i.test(e)?"P"+i:i}var c=(e(a.uiBrIeMask)(n)||"").toUpperCase();o.$formatters.push(u),o.$parsers.push(l),o.$validators.ie=function(e){return o.$isEmpty(e)||s.ie(c).validate(e)},n.$watch(a.uiBrIeMask,function(e){c=(e||"").toUpperCase(),l(o.$viewValue),o.$validate()})}}}var i=e("string-mask"),s=e("br-validations");r.$inject=["$parse"],t.exports=r},{"br-validations":1,"string-mask":3}],12:[function(e,t,n){var r=e("string-mask"),i=e("mask-factory"),s=new r("0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000");t.exports=i({clearValue:function(e){return e.replace(/[^0-9]/g,"").slice(0,44)},format:function(e){return(s.apply(e)||"").replace(/[^0-9]$/,"")},validations:{nfeAccessKey:function(e){return 44===e.length}}})},{"mask-factory":"mask-factory","string-mask":3}],13:[function(e,t,n){var r=e("string-mask"),i=e("mask-factory"),s=new r("(00) 0000-0000"),a=new r("(00) 00000-0000");t.exports=i({clearValue:function(e){return e.toString().replace(/[^0-9]/g,"").slice(0,11)},format:function(e){var t;return t=e.length<11?s.apply(e)||"":a.apply(e),t.trim().replace(/[^0-9]$/,"")},getModelValue:function(e,t){var n=this.clearValue(e);return"number"===t?parseInt(n):n},validations:{brPhoneNumber:function(e){var t=e&&e.toString().length;return 10===t||11===t}}})},{"mask-factory":"mask-factory","string-mask":3}],14:[function(e,t,n){function r(e){var t={"pt-br":"DD/MM/YYYY"},n=t[e.id]||"YYYY-MM-DD";return{restrict:"A",require:"ngModel",link:function(e,t,r,a){function o(e){if(a.$isEmpty(e))return e;var t=e;"object"==typeof e&&(t=i(e).format(n)),t=t.replace(/[^0-9]/g,"");var r=u.apply(t)||"";return r.trim().replace(/[^0-9]$/,"")}var u=new s(n.replace(/[YMD]/g,"0"));a.$formatters.push(o),a.$parsers.push(function(e){if(a.$isEmpty(e))return e;var t=o(e);return a.$viewValue!==t&&(a.$setViewValue(t),a.$render()),i(t,n).toDate()}),a.$validators.date=function(e,t){return a.$isEmpty(e)?!0:i(t,n).isValid()&&t.length===n.length}}}}var i=e("moment"),s=e("string-mask");r.$inject=["$locale"],t.exports=r},{moment:2,"string-mask":3}],15:[function(e,t,n){var r=angular.module("ui.utils.masks.global",[e("../helpers")]).directive("uiDateMask",e("./date/date")).directive("uiMoneyMask",e("./money/money")).directive("uiNumberMask",e("./number/number")).directive("uiPercentageMask",e("./percentage/percentage")).directive("uiScientificNotationMask",e("./scientific-notation/scientific-notation")).directive("uiTimeMask",e("./time/time"));t.exports=r.name},{"../helpers":21,"./date/date":14,"./money/money":16,"./number/number":17,"./percentage/percentage":18,"./scientific-notation/scientific-notation":19,"./time/time":20}],16:[function(e,t,n){function r(e,t,n){return{restrict:"A",require:"ngModel",link:function(r,a,o,u){function l(e){var t=e>0?d+new Array(e+1).join("0"):"",n=h+" #"+m+"##0"+t;return new i(n,{reverse:!0})}function c(e){if(u.$isEmpty(e))return e;var t=angular.isDefined(o.uiNegativeNumber)&&0>e?"-":"",r=n.prepareNumberToFormatter(e,p);return t+v.apply(r)}function f(e){if(u.$isEmpty(e))return e;var t=e.replace(/[^\d]+/g,"");t=t.replace(/^[0]+([1-9])/,"$1");var n=v.apply(t);if(angular.isDefined(o.uiNegativeNumber)){var r="-"===e[0],i="-"===e.slice(-1);i^r&&t&&(t*=-1,n="-"+n)}return e!==n&&(u.$setViewValue(n),u.$render()),n?parseInt(n.replace(/[^\d\-]+/g,""))/Math.pow(10,p):null}var d=e.NUMBER_FORMATS.DECIMAL_SEP,m=e.NUMBER_FORMATS.GROUP_SEP,h=e.NUMBER_FORMATS.CURRENCY_SYM,p=t(o.uiMoneyMask)(r);angular.isDefined(o.uiHideGroupSep)&&(m=""),isNaN(p)&&(p=2);var v=l(p);if(u.$formatters.push(c),u.$parsers.push(f),o.uiMoneyMask&&r.$watch(o.uiMoneyMask,function(e){p=isNaN(e)?2:e,v=l(p),f(u.$viewValue)}),o.min){var y;u.$validators.min=function(e){return s.minNumber(u,e,y)},r.$watch(o.min,function(e){y=e,u.$validate()})}if(o.max){var g;u.$validators.max=function(e){return s.maxNumber(u,e,g)},r.$watch(o.max,function(e){g=e,u.$validate()})}}}}var i=e("string-mask"),s=e("validators");r.$inject=["$locale","$parse","PreFormatters"],t.exports=r},{"string-mask":3,validators:"validators"}],17:[function(e,t,n){function r(e,t,n,r){return{restrict:"A",require:"ngModel",link:function(s,a,o,u){function l(e){if(u.$isEmpty(e))return e;var t=n.clearDelimitersAndLeadingZeros(e)||"0",r=h.apply(t),i=parseFloat(p.apply(t));if(angular.isDefined(o.uiNegativeNumber)){var s="-"===e[0],a="-"===e.slice(-1);a^s&&i&&(i*=-1,r="-"+r)}return u.$viewValue!==r&&(u.$setViewValue(r),u.$render()),i}function c(e){if(u.$isEmpty(e))return e;var t=angular.isDefined(o.uiNegativeNumber)&&0>e?"-":"",r=n.prepareNumberToFormatter(e,m);return t+h.apply(r)}var f=e.NUMBER_FORMATS.DECIMAL_SEP,d=e.NUMBER_FORMATS.GROUP_SEP,m=t(o.uiNumberMask)(s);angular.isDefined(o.uiHideGroupSep)&&(d=""),isNaN(m)&&(m=2);var h=r.viewMask(m,f,d),p=r.modelMask(m);if(u.$formatters.push(c),u.$parsers.push(l),o.uiNumberMask&&s.$watch(o.uiNumberMask,function(e){m=isNaN(e)?2:e,h=r.viewMask(m,f,d),p=r.modelMask(m),l(u.$viewValue)}),o.min){var v;u.$validators.min=function(e){return i.minNumber(u,e,v)},s.$watch(o.min,function(e){v=e,u.$validate()})}if(o.max){var y;u.$validators.max=function(e){return i.maxNumber(u,e,y)},s.$watch(o.max,function(e){y=e,u.$validate()})}}}}var i=e("validators");r.$inject=["$locale","$parse","PreFormatters","NumberMasks"],t.exports=r},{validators:"validators"}],18:[function(e,t,n){function r(e,t,n,r){function s(e,t,r){return n.clearDelimitersAndLeadingZeros((parseFloat(e)*r).toFixed(t))}return{restrict:"A",require:"ngModel",link:function(t,a,o,u){function l(e){if(u.$isEmpty(e))return e;var t=s(e,m,h.multiplier);return v.apply(t)+" %"}function c(e){if(u.$isEmpty(e))return e;var t=n.clearDelimitersAndLeadingZeros(e)||"0";e.length>1&&-1===e.indexOf("%")&&(t=t.slice(0,t.length-1));var r=v.apply(t)+" %",i=parseFloat(y.apply(t));return u.$viewValue!==r&&(u.$setViewValue(r),u.$render()),i}var f=e.NUMBER_FORMATS.DECIMAL_SEP,d=e.NUMBER_FORMATS.GROUP_SEP,m=parseInt(o.uiPercentageMask),h={multiplier:100,decimalMask:2};angular.isDefined(o.uiHideGroupSep)&&(d=""),angular.isDefined(o.uiPercentageValue)&&(h.multiplier=1,h.decimalMask=0),isNaN(m)&&(m=2);var p=m+h.decimalMask,v=r.viewMask(m,f,d),y=r.modelMask(p);if(u.$formatters.push(l),u.$parsers.push(c),o.uiPercentageMask&&t.$watch(o.uiPercentageMask,function(e){m=isNaN(e)?2:e,angular.isDefined(o.uiPercentageValue)&&(h.multiplier=1,h.decimalMask=0),p=m+h.decimalMask,v=r.viewMask(m,f,d),y=r.modelMask(p),c(u.$viewValue)}),o.min){var g;u.$validators.min=function(e){return i.minNumber(u,e,g)},t.$watch(o.min,function(e){g=e,u.$validate()})}if(o.max){var _;u.$validators.max=function(e){return i.maxNumber(u,e,_)},t.$watch(o.max,function(e){_=e,u.$validate()})}}}}var i=e("validators");r.$inject=["$locale","$parse","PreFormatters","NumberMasks"],t.exports=r},{validators:"validators"}],19:[function(e,t,n){function r(e,t){function n(e){var t="0";if(e>0){t+=r;for(var n=0;e>n;n++)t+="0"}return new i(t,{reverse:!0})}var r=e.NUMBER_FORMATS.DECIMAL_SEP,s=2;return{restrict:"A",require:"ngModel",link:function(e,i,a,o){function u(e){var t=e.toString(),n=t.match(/(-?[0-9]*)[\.]?([0-9]*)?[Ee]?([\+-]?[0-9]*)?/);return{integerPartOfSignificand:n[1],decimalPartOfSignificand:n[2],exponent:0|n[3]}}function l(e){if(o.$isEmpty(e))return e;"string"==typeof e?e=e.replace(r,"."):"number"==typeof e&&(e=e.toExponential(f));var t,n,i=u(e),s=i.integerPartOfSignificand||0,a=s.toString();angular.isDefined(i.decimalPartOfSignificand)&&(a+=i.decimalPartOfSignificand);var l=(s>=1||-1>=s)&&(angular.isDefined(i.decimalPartOfSignificand)&&i.decimalPartOfSignificand.length>f||0===f&&a.length>=2);return l&&(n=a.slice(f+1,a.length),a=a.slice(0,f+1)),t=d.apply(a),0!==i.exponent&&(n=i.exponent),angular.isDefined(n)&&(t+="e"+n),t}function c(e){if(o.$isEmpty(e))return e;var t=l(e),n=parseFloat(t.replace(r,"."));return o.$viewValue!==t&&(o.$setViewValue(t),o.$render()),n}var f=t(a.uiScientificNotationMask)(e);isNaN(f)&&(f=s);var d=n(f);o.$formatters.push(l),o.$parsers.push(c),o.$validators.max=function(e){return o.$isEmpty(e)||e<Number.MAX_VALUE}}}}var i=e("string-mask");r.$inject=["$locale","$parse"],t.exports=r},{"string-mask":3}],20:[function(e,t,n){var r=e("string-mask");t.exports=function(){return{restrict:"A",require:"ngModel",link:function(e,t,n,i){function s(e){if(i.$isEmpty(e))return e;var t=e.replace(/[^0-9]/g,"").slice(0,u)||"";return(l.apply(t)||"").replace(/[^0-9]$/,"")}var a="00:00:00";angular.isDefined(n.uiTimeMask)&&"short"===n.uiTimeMask&&(a="00:00");var o=a.length,u=a.replace(":","").length,l=new r(a);i.$formatters.push(s),i.$parsers.push(function(e){if(i.$isEmpty(e))return e;var t=s(e),n=t;return i.$viewValue!==t&&(i.$setViewValue(t),i.$render()),n}),i.$validators.time=function(e){if(i.$isEmpty(e))return!0;var t=e.toString().split(/:/).filter(function(e){return!!e}),n=parseInt(t[0]),r=parseInt(t[1]),s=parseInt(t[2]||0);return e.toString().length===o&&24>n&&60>r&&60>s}}}}},{"string-mask":3}],21:[function(e,t,n){var r=e("string-mask"),i=angular.module("ui.utils.masks.helpers",[]);t.exports=i.name,i.factory("PreFormatters",[function(){function e(e){var t=e.replace(/^-/,"").replace(/^0*/,"");return t=t.replace(/[^0-9]/g,"")}function t(t,n){return e(parseFloat(t).toFixed(n))}return{clearDelimitersAndLeadingZeros:e,prepareNumberToFormatter:t}}]).factory("NumberValidators",[function(){return{maxNumber:function(e,t,n){var r=parseFloat(n),i=e.$isEmpty(t)||isNaN(r)||r>=t;return e.$setValidity("max",i),t},minNumber:function(e,t,n){var r=parseFloat(n),i=e.$isEmpty(t)||isNaN(r)||t>=r;return e.$setValidity("min",i),t}}}]).factory("NumberMasks",[function(){return{viewMask:function(e,t,n){var i="#"+n+"##0";if(e>0){i+=t;for(var s=0;e>s;s++)i+="0"}return new r(i,{reverse:!0})},modelMask:function(e){var t="###0";if(e>0){t+=".";for(var n=0;e>n;n++)t+="0"}return new r(t,{reverse:!0})}}}])},{"string-mask":3}],22:[function(e,t,n){var r=e("string-mask"),i=e("mask-factory"),s=new r("(000) 000-0000"),a=new r("+00-00-000-000000");t.exports=i({clearValue:function(e){return e.toString().replace(/[^0-9]/g,"")},format:function(e){var t;return t=e.length<11?s.apply(e)||"":a.apply(e),t.trim().replace(/[^0-9]$/,"")},validations:{usPhoneNumber:function(e){return e.length>9}}})},{"mask-factory":"mask-factory","string-mask":3}],23:[function(e,t,n){var r=angular.module("ui.utils.masks.us",[e("../helpers")]).directive("uiUsPhoneNumber",e("./phone/us-phone"));t.exports=r.name},{"../helpers":21,"./phone/us-phone":22}],"mask-factory":[function(e,t,n){t.exports=function(e){return function(){return{restrict:"A",require:"ngModel",link:function(t,n,r,i){i.$formatters.push(function(t){if(i.$isEmpty(t))return t;var n=e.clearValue(t);return e.format(n)}),i.$parsers.push(function(t){if(i.$isEmpty(t))return t;var n=e.clearValue(t),r=e.format(n);if(i.$viewValue!==r&&(i.$setViewValue(r),i.$render()),angular.isUndefined(e.getModelValue))return n;var s=typeof i.$modelValue;return e.getModelValue(r,s)}),angular.forEach(e.validations,function(e,t){i.$validators[t]=function(t,n){return i.$isEmpty(t)||e(t,n)}})}}}}},{}],validators:[function(e,t,n){t.exports={maxNumber:function(e,t,n){var r=parseFloat(n,10);return e.$isEmpty(t)||isNaN(r)||r>=t},minNumber:function(e,t,n){var r=parseFloat(n,10);return e.$isEmpty(t)||isNaN(r)||t>=r}}},{}]},{},[4]);
    }());
}());

/*! jQuery UI - v1.11.2 - 2015-01-23
* http://jqueryui.com
* Includes: effect.js
* Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

(function(){
    (function(e){
        "function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)})(function(e){var t="ui-effects-",i=e;e.effects={effect:{}},function(e,t){function i(e,t,i){var s=d[t.type]||{};return null==e?i||!t.def?null:t.def:(e=s.floor?~~e:parseFloat(e),isNaN(e)?t.def:s.mod?(e+s.mod)%s.mod:0>e?0:e>s.max?s.max:e)}function s(i){var s=l(),n=s._rgba=[];return i=i.toLowerCase(),f(h,function(e,a){var o,r=a.re.exec(i),h=r&&a.parse(r),l=a.space||"rgba";return h?(o=s[l](h),s[u[l].cache]=o[u[l].cache],n=s._rgba=o._rgba,!1):t}),n.length?("0,0,0,0"===n.join()&&e.extend(n,a.transparent),s):a[i]}function n(e,t,i){return i=(i+1)%1,1>6*i?e+6*(t-e)*i:1>2*i?t:2>3*i?e+6*(t-e)*(2/3-i):e}var a,o="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",r=/^([\-+])=\s*(\d+\.?\d*)/,h=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[e[1],e[2],e[3],e[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[2.55*e[1],2.55*e[2],2.55*e[3],e[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(e){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(e){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(e){return[e[1],e[2]/100,e[3]/100,e[4]]}}],l=e.Color=function(t,i,s,n){return new e.Color.fn.parse(t,i,s,n)},u={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},d={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},c=l.support={},p=e("<p>")[0],f=e.each;p.style.cssText="background-color:rgba(1,1,1,.5)",c.rgba=p.style.backgroundColor.indexOf("rgba")>-1,f(u,function(e,t){t.cache="_"+e,t.props.alpha={idx:3,type:"percent",def:1}}),l.fn=e.extend(l.prototype,{parse:function(n,o,r,h){if(n===t)return this._rgba=[null,null,null,null],this;(n.jquery||n.nodeType)&&(n=e(n).css(o),o=t);var d=this,c=e.type(n),p=this._rgba=[];return o!==t&&(n=[n,o,r,h],c="array"),"string"===c?this.parse(s(n)||a._default):"array"===c?(f(u.rgba.props,function(e,t){p[t.idx]=i(n[t.idx],t)}),this):"object"===c?(n instanceof l?f(u,function(e,t){n[t.cache]&&(d[t.cache]=n[t.cache].slice())}):f(u,function(t,s){var a=s.cache;f(s.props,function(e,t){if(!d[a]&&s.to){if("alpha"===e||null==n[e])return;d[a]=s.to(d._rgba)}d[a][t.idx]=i(n[e],t,!0)}),d[a]&&0>e.inArray(null,d[a].slice(0,3))&&(d[a][3]=1,s.from&&(d._rgba=s.from(d[a])))}),this):t},is:function(e){var i=l(e),s=!0,n=this;return f(u,function(e,a){var o,r=i[a.cache];return r&&(o=n[a.cache]||a.to&&a.to(n._rgba)||[],f(a.props,function(e,i){return null!=r[i.idx]?s=r[i.idx]===o[i.idx]:t})),s}),s},_space:function(){var e=[],t=this;return f(u,function(i,s){t[s.cache]&&e.push(i)}),e.pop()},transition:function(e,t){var s=l(e),n=s._space(),a=u[n],o=0===this.alpha()?l("transparent"):this,r=o[a.cache]||a.to(o._rgba),h=r.slice();return s=s[a.cache],f(a.props,function(e,n){var a=n.idx,o=r[a],l=s[a],u=d[n.type]||{};null!==l&&(null===o?h[a]=l:(u.mod&&(l-o>u.mod/2?o+=u.mod:o-l>u.mod/2&&(o-=u.mod)),h[a]=i((l-o)*t+o,n)))}),this[n](h)},blend:function(t){if(1===this._rgba[3])return this;var i=this._rgba.slice(),s=i.pop(),n=l(t)._rgba;return l(e.map(i,function(e,t){return(1-s)*n[t]+s*e}))},toRgbaString:function(){var t="rgba(",i=e.map(this._rgba,function(e,t){return null==e?t>2?1:0:e});return 1===i[3]&&(i.pop(),t="rgb("),t+i.join()+")"},toHslaString:function(){var t="hsla(",i=e.map(this.hsla(),function(e,t){return null==e&&(e=t>2?1:0),t&&3>t&&(e=Math.round(100*e)+"%"),e});return 1===i[3]&&(i.pop(),t="hsl("),t+i.join()+")"},toHexString:function(t){var i=this._rgba.slice(),s=i.pop();return t&&i.push(~~(255*s)),"#"+e.map(i,function(e){return e=(e||0).toString(16),1===e.length?"0"+e:e}).join("")},toString:function(){return 0===this._rgba[3]?"transparent":this.toRgbaString()}}),l.fn.parse.prototype=l.fn,u.hsla.to=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t,i,s=e[0]/255,n=e[1]/255,a=e[2]/255,o=e[3],r=Math.max(s,n,a),h=Math.min(s,n,a),l=r-h,u=r+h,d=.5*u;return t=h===r?0:s===r?60*(n-a)/l+360:n===r?60*(a-s)/l+120:60*(s-n)/l+240,i=0===l?0:.5>=d?l/u:l/(2-u),[Math.round(t)%360,i,d,null==o?1:o]},u.hsla.from=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t=e[0]/360,i=e[1],s=e[2],a=e[3],o=.5>=s?s*(1+i):s+i-s*i,r=2*s-o;return[Math.round(255*n(r,o,t+1/3)),Math.round(255*n(r,o,t)),Math.round(255*n(r,o,t-1/3)),a]},f(u,function(s,n){var a=n.props,o=n.cache,h=n.to,u=n.from;l.fn[s]=function(s){if(h&&!this[o]&&(this[o]=h(this._rgba)),s===t)return this[o].slice();var n,r=e.type(s),d="array"===r||"object"===r?s:arguments,c=this[o].slice();return f(a,function(e,t){var s=d["object"===r?e:t.idx];null==s&&(s=c[t.idx]),c[t.idx]=i(s,t)}),u?(n=l(u(c)),n[o]=c,n):l(c)},f(a,function(t,i){l.fn[t]||(l.fn[t]=function(n){var a,o=e.type(n),h="alpha"===t?this._hsla?"hsla":"rgba":s,l=this[h](),u=l[i.idx];return"undefined"===o?u:("function"===o&&(n=n.call(this,u),o=e.type(n)),null==n&&i.empty?this:("string"===o&&(a=r.exec(n),a&&(n=u+parseFloat(a[2])*("+"===a[1]?1:-1))),l[i.idx]=n,this[h](l)))})})}),l.hook=function(t){var i=t.split(" ");f(i,function(t,i){e.cssHooks[i]={set:function(t,n){var a,o,r="";if("transparent"!==n&&("string"!==e.type(n)||(a=s(n)))){if(n=l(a||n),!c.rgba&&1!==n._rgba[3]){for(o="backgroundColor"===i?t.parentNode:t;(""===r||"transparent"===r)&&o&&o.style;)try{r=e.css(o,"backgroundColor"),o=o.parentNode}catch(h){}n=n.blend(r&&"transparent"!==r?r:"_default")}n=n.toRgbaString()}try{t.style[i]=n}catch(h){}}},e.fx.step[i]=function(t){t.colorInit||(t.start=l(t.elem,i),t.end=l(t.end),t.colorInit=!0),e.cssHooks[i].set(t.elem,t.start.transition(t.end,t.pos))}})},l.hook(o),e.cssHooks.borderColor={expand:function(e){var t={};return f(["Top","Right","Bottom","Left"],function(i,s){t["border"+s+"Color"]=e}),t}},a=e.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}}(i),function(){function t(t){var i,s,n=t.ownerDocument.defaultView?t.ownerDocument.defaultView.getComputedStyle(t,null):t.currentStyle,a={};if(n&&n.length&&n[0]&&n[n[0]])for(s=n.length;s--;)i=n[s],"string"==typeof n[i]&&(a[e.camelCase(i)]=n[i]);else for(i in n)"string"==typeof n[i]&&(a[i]=n[i]);return a}function s(t,i){var s,n,o={};for(s in i)n=i[s],t[s]!==n&&(a[s]||(e.fx.step[s]||!isNaN(parseFloat(n)))&&(o[s]=n));return o}var n=["add","remove","toggle"],a={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};e.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(t,s){e.fx.step[s]=function(e){("none"!==e.end&&!e.setAttr||1===e.pos&&!e.setAttr)&&(i.style(e.elem,s,e.end),e.setAttr=!0)}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e.effects.animateClass=function(i,a,o,r){var h=e.speed(a,o,r);return this.queue(function(){var a,o=e(this),r=o.attr("class")||"",l=h.children?o.find("*").addBack():o;l=l.map(function(){var i=e(this);return{el:i,start:t(this)}}),a=function(){e.each(n,function(e,t){i[t]&&o[t+"Class"](i[t])})},a(),l=l.map(function(){return this.end=t(this.el[0]),this.diff=s(this.start,this.end),this}),o.attr("class",r),l=l.map(function(){var t=this,i=e.Deferred(),s=e.extend({},h,{queue:!1,complete:function(){i.resolve(t)}});return this.el.animate(this.diff,s),i.promise()}),e.when.apply(e,l.get()).done(function(){a(),e.each(arguments,function(){var t=this.el;e.each(this.diff,function(e){t.css(e,"")})}),h.complete.call(o[0])})})},e.fn.extend({addClass:function(t){return function(i,s,n,a){return s?e.effects.animateClass.call(this,{add:i},s,n,a):t.apply(this,arguments)}}(e.fn.addClass),removeClass:function(t){return function(i,s,n,a){return arguments.length>1?e.effects.animateClass.call(this,{remove:i},s,n,a):t.apply(this,arguments)}}(e.fn.removeClass),toggleClass:function(t){return function(i,s,n,a,o){return"boolean"==typeof s||void 0===s?n?e.effects.animateClass.call(this,s?{add:i}:{remove:i},n,a,o):t.apply(this,arguments):e.effects.animateClass.call(this,{toggle:i},s,n,a)}}(e.fn.toggleClass),switchClass:function(t,i,s,n,a){return e.effects.animateClass.call(this,{add:i,remove:t},s,n,a)}})}(),function(){function i(t,i,s,n){return e.isPlainObject(t)&&(i=t,t=t.effect),t={effect:t},null==i&&(i={}),e.isFunction(i)&&(n=i,s=null,i={}),("number"==typeof i||e.fx.speeds[i])&&(n=s,s=i,i={}),e.isFunction(s)&&(n=s,s=null),i&&e.extend(t,i),s=s||i.duration,t.duration=e.fx.off?0:"number"==typeof s?s:s in e.fx.speeds?e.fx.speeds[s]:e.fx.speeds._default,t.complete=n||i.complete,t}function s(t){return!t||"number"==typeof t||e.fx.speeds[t]?!0:"string"!=typeof t||e.effects.effect[t]?e.isFunction(t)?!0:"object"!=typeof t||t.effect?!1:!0:!0}e.extend(e.effects,{version:"1.11.2",save:function(e,i){for(var s=0;i.length>s;s++)null!==i[s]&&e.data(t+i[s],e[0].style[i[s]])},restore:function(e,i){var s,n;for(n=0;i.length>n;n++)null!==i[n]&&(s=e.data(t+i[n]),void 0===s&&(s=""),e.css(i[n],s))},setMode:function(e,t){return"toggle"===t&&(t=e.is(":hidden")?"show":"hide"),t},getBaseline:function(e,t){var i,s;switch(e[0]){case"top":i=0;break;case"middle":i=.5;break;case"bottom":i=1;break;default:i=e[0]/t.height}switch(e[1]){case"left":s=0;break;case"center":s=.5;break;case"right":s=1;break;default:s=e[1]/t.width}return{x:s,y:i}},createWrapper:function(t){if(t.parent().is(".ui-effects-wrapper"))return t.parent();var i={width:t.outerWidth(!0),height:t.outerHeight(!0),"float":t.css("float")},s=e("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),n={width:t.width(),height:t.height()},a=document.activeElement;try{a.id}catch(o){a=document.body}return t.wrap(s),(t[0]===a||e.contains(t[0],a))&&e(a).focus(),s=t.parent(),"static"===t.css("position")?(s.css({position:"relative"}),t.css({position:"relative"})):(e.extend(i,{position:t.css("position"),zIndex:t.css("z-index")}),e.each(["top","left","bottom","right"],function(e,s){i[s]=t.css(s),isNaN(parseInt(i[s],10))&&(i[s]="auto")}),t.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})),t.css(n),s.css(i).show()},removeWrapper:function(t){var i=document.activeElement;return t.parent().is(".ui-effects-wrapper")&&(t.parent().replaceWith(t),(t[0]===i||e.contains(t[0],i))&&e(i).focus()),t},setTransition:function(t,i,s,n){return n=n||{},e.each(i,function(e,i){var a=t.cssUnit(i);a[0]>0&&(n[i]=a[0]*s+a[1])}),n}}),e.fn.extend({effect:function(){function t(t){function i(){e.isFunction(a)&&a.call(n[0]),e.isFunction(t)&&t()}var n=e(this),a=s.complete,r=s.mode;(n.is(":hidden")?"hide"===r:"show"===r)?(n[r](),i()):o.call(n[0],s,i)}var s=i.apply(this,arguments),n=s.mode,a=s.queue,o=e.effects.effect[s.effect];return e.fx.off||!o?n?this[n](s.duration,s.complete):this.each(function(){s.complete&&s.complete.call(this)}):a===!1?this.each(t):this.queue(a||"fx",t)},show:function(e){return function(t){if(s(t))return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="show",this.effect.call(this,n)}}(e.fn.show),hide:function(e){return function(t){if(s(t))return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="hide",this.effect.call(this,n)}}(e.fn.hide),toggle:function(e){return function(t){if(s(t)||"boolean"==typeof t)return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="toggle",this.effect.call(this,n)}}(e.fn.toggle),cssUnit:function(t){var i=this.css(t),s=[];return e.each(["em","px","%","pt"],function(e,t){i.indexOf(t)>0&&(s=[parseFloat(i),t])}),s}})}(),function(){var t={};e.each(["Quad","Cubic","Quart","Quint","Expo"],function(e,i){t[i]=function(t){return Math.pow(t,e+2)}}),e.extend(t,{Sine:function(e){return 1-Math.cos(e*Math.PI/2)},Circ:function(e){return 1-Math.sqrt(1-e*e)},Elastic:function(e){return 0===e||1===e?e:-Math.pow(2,8*(e-1))*Math.sin((80*(e-1)-7.5)*Math.PI/15)},Back:function(e){return e*e*(3*e-2)},Bounce:function(e){for(var t,i=4;((t=Math.pow(2,--i))-1)/11>e;);return 1/Math.pow(4,3-i)-7.5625*Math.pow((3*t-2)/22-e,2)}}),e.each(t,function(t,i){e.easing["easeIn"+t]=i,e.easing["easeOut"+t]=function(e){return 1-i(1-e)},e.easing["easeInOut"+t]=function(e){return.5>e?i(2*e)/2:1-i(-2*e+2)/2}})}(),e.effects});
}());
