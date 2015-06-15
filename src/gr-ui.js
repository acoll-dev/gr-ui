'use strict';

(function(window){
    window.griffoUI = {
        version: '0.1.0'
    };
}(window));

(function(){
    angular.module('gr.ui', ['gr.ui.alert', 'gr.ui.autofields', 'gr.ui.autoheight', 'gr.ui.carousel', 'gr.ui.modal', 'gr.ui.pager', 'gr.ui.table', 'gr.ui.translate']);
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
    angular.module('gr.ui.autofields.core', ['autofields', 'gr.ui.alert', 'ngMask'])
        .directive('grAutofields', ['$compile', '$parse', '$timeout', '$grAlert', function($compile, $parse, $timeout, $grAlert){
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs){
                    if(!$attrs.name && !$attrs.grAutofields){ return false; };
                    var $getter = $parse($attrs.grAutofields),
                        $setter = $getter.assign,
                        grAutofields = $getter($scope),
                        init = function(){
                            var $input = angular.element('<auto:fields/>'),
                                $alert = $grAlert.new(),
                                $errors = [],
                                defaultOptions = {
                                    defaultOption: 'Selecione...',
                                    validation: {
                                        showMessages: false
                                    }
                                },
                                modalScope = $element.parents('.modal').eq(0).scope(),
                                defaults;
                            if(!grAutofields.options){ grAutofields.options = defaultOptions; }else{ angular.extend(grAutofields.options, defaultOptions); }
                            defaults = angular.copy(grAutofields);
                            if(grAutofields.schema){
                                $input.attr('fields', $attrs.grAutofields + '.schema');
                            }
                            if(grAutofields.data){
                                $input.attr('data', $attrs.grAutofields + '.data');
                            }
                            if(grAutofields.options){
                                $input.attr('options', $attrs.grAutofields + '.options');
                            }
                            $element.addClass('gr-autofields').removeAttr('gr-autofields').attr({
                                'novalidate': true,
                                'ng-submit': $attrs.name + '.submit()'
                            }).prepend($input);
                            $scope.$watch(function(){
                                return grAutofields.schema;
                            }, setErrors, true);
                            $scope.$watch(function(){
                                if($scope[$attrs.name].autofields){
                                    return $scope[$attrs.name].autofields.$error;
                                }else{
                                    return [];
                                }
                            }, checkError, true);
                            $scope.$watch(function(){ return modalScope ? true : false; }, function(hasModal){
                                if(hasModal){
                                    $alert.destroy();
                                    $alert = $grAlert.new(modalScope.modal.element);
                                }
                            }, true);
                            function setErrors(schema){
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
                            }
                            function getError($error){
                                var _errors = [];
                                angular.forEach($error, function(errors, errorId){
                                    angular.forEach(errors, function(field){
                                        if(grAutofields.errors && grAutofields.errors[field.$name]){
                                            _errors.push(grAutofields.errors[field.$name][errorId]);
                                        }
                                    });
                                });
                                return _errors;
                            };
                            function checkError($error){
                                var errors;
                                if($error){ errors = getError($error); }else{ errors = $errors; }
                                if(errors !== $errors){ $errors = errors; }
                                if($errors.length > 0 && $scope[$attrs.name].$submitted){
                                    $alert.show('danger', $errors);
                                }else{
                                    $alert.hide();
                                }
                            };
                            function submit(){
                                var field;
                                angular.forEach(getError($scope[$attrs.name].autofields.$error), function(value, id){
                                    if(!field){
                                        field = id;
                                    }
                                });
                                $timeout(function(){
                                    if(!$scope[$attrs.name].$submitted){
                                        $scope[$attrs.name].$setSubmitted(true);
                                        $scope.$apply();
                                    }
                                    if(!grAutofields.options.validation.enabled){
                                        grAutofields.options.validation.enabled = true
                                    };
                                    if($scope[$attrs.name].autofields.$invalid){
                                        checkError($scope[$attrs.name].autofields.$error);
                                    } else {
                                        grAutofields.submit(grAutofields.data);
                                    }
                                });
                            };
                            function reset(){
                                $timeout(function(){
                                    grAutofields = angular.copy(defaults);
                                    setErrors(grAutofields.schema);
                                    $scope[$attrs.name].$setPristine();
                                    $scope[$attrs.name].$submitted = false;
                                    $scope.$apply();
                                    $alert.hide();
                                });
                            };
                            function updateDefaults(){
                                defaults = angular.copy(grAutofields);
                            };
                            function hasChange(){
                                return !angular.equals(defaults.data, grAutofields.data);
                            };
                            if($element.find('[type="submit"]').length === 0){
                                $element.append('<button type="submit" class="hidden"/>');
                            }
                            $compile($element)($scope);
                            $timeout(function(){
                                $scope[$attrs.name].submit = submit;
                                $scope[$attrs.name].reset = reset;
                                $scope[$attrs.name].updateDefaults = updateDefaults;
                                $scope[$attrs.name].hasChange = hasChange;
                            });
                        };
                    $scope.$watch(function(){
                        return grAutofields;
                    }, function(newValue){
                        if(newValue){
                            $timeout(function(){
                                $setter($scope, newValue);
                                $scope.$apply();
                            });
                        }
                    }, true);
                    init();
                }
            }
        }]);
    angular.module('gr.ui.autofields.bootstrap', ['autofields.standard','ui.bootstrap'])
        .config(['$autofieldsProvider', '$localeProvider', function($autofieldsProvider, $localeProvider){
            // Add Bootstrap classes
            $autofieldsProvider.settings.classes.container.push('form-group');
            $autofieldsProvider.settings.classes.input.push('form-control');
            $autofieldsProvider.settings.classes.label.push('control-label');
            // Override Checkbox Field Handler
            $autofieldsProvider.registerHandler('checkbox', function(directive, field, index){
                var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');

                if(fieldElements.label) fieldElements.label.prepend(fieldElements.input);
                fieldElements.input.removeClass('form-control');
                fieldElements.label.addClass('form-control');

                return fieldElements.fieldContainer;
            });
            // Date Handler with Bootstrap Popover
            $autofieldsProvider.settings.dateSettings = {
                showWeeks: false,
                datepickerPopup: 'longDate'
            };
            $autofieldsProvider.settings.scope.datepickerOptions = {
                showWeeks: false
            };
            $autofieldsProvider.settings.scope.openCalendar = function($scope, property, e){
                e.preventDefault();
                e.stopPropagation();
                $scope[property] = !$scope[property];
            };
            $autofieldsProvider.registerHandler('date', function(directive, field, index){
                var showWeeks = field.showWeeks ? field.showWeeks : directive.options.dateSettings.showWeeks,
                    datepickerPopup = field.datepickerPopup ? field.datepickerPopup : directive.options.dateSettings.datepickerPopup,
                    inputAttrs = {
                    type:'text',
                    ngAttrTitle:'{{\'Click on calendar button to change\' | grTranslate}}',
                    showWeeks: showWeeks,
                    datepickerPopup: datepickerPopup,
                    datepickerOptions: 'datepickerOptions',
                    isOpen: '$property_cleanOpen',
                    currentText: '{{\'Today\' | grTranslate}}',
                    clearText: '{{\'Clear\' | grTranslate}}',
                    closeText: '{{\'Close\' | grTranslate}}'
                };
                if(!(field.attr && field.attr.disabled == true)){
                    field.$addons = [{
                        button: true,
                        icon: 'fa fa-fw fa-calendar',
                        attr: {
                            ngClick: 'openCalendar("$property_cleanOpen",$event)',
                            title: 'Change date'
                        }
                    }];
                }
                var fieldElements = $autofieldsProvider.field(directive, field, '<input disabled/>', inputAttrs);
                return fieldElements.fieldContainer;
            });
            // Money Handler
            $autofieldsProvider.registerHandler('money', function(directive, field, index){
                var currency_sym = $localeProvider.$get().NUMBER_FORMATS.CURRENCY_SYM;
                field.type = 'text';
                if(!field.attr){ field.attr = []; }
                if(!field.addons){ field.addons = []; }
                field.attr.maskMoney = true;
                field.addons.push({
                    before: true,
                    content: currency_sym
                });
                var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');
                return fieldElements.fieldContainer;
            });
            // Phone Handler
            $autofieldsProvider.registerHandler('phone', function(directive, field, index){
                field.type = 'text';
                if(!field.attr){ field.attr = []; }
                if(!field.addons){ field.addons = []; }
                field.attr.mask = '99 ?9? 9999 9999';
                field.attr.restrict = 'reject';
                field.attr.maskValidate = field.attr.maskValidate ? field.attr.maskValidate : true;
                field.placeholder = field.placeholder ? field.placeholder : ' ';
                field.addons.push({
                    before: true,
                    icon: 'fa fa-fw fa-phone'
                });
                var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');
                return fieldElements.fieldContainer;
            });
            // Static Field Handler
            $autofieldsProvider.registerHandler('static', function(directive, field, index){
                var showWeeks = field.showWeeks ? field.showWeeks : directive.options.dateSettings.showWeeks;
                var datepickerPopup = field.datepickerPopup ? field.datepickerPopup : directive.options.dateSettings.datepickerPopup;

                var fieldElements = $autofieldsProvider.field(directive, field, '<p/>');

                //Remove Classes & Attributes
                var input = angular.element('<p/>');
                input.attr('ng-bind', fieldElements.input.attr('ng-model'));
                input.addClass('form-control-static');
                fieldElements.input.replaceWith(input);

                return fieldElements.fieldContainer;
            });
            // Multiple Per Row Handler
            $autofieldsProvider.settings.classes.row = $autofieldsProvider.settings.classes.row || [];
            $autofieldsProvider.settings.classes.row.push('row');
            $autofieldsProvider.settings.classes.col = $autofieldsProvider.settings.classes.col || [];
            $autofieldsProvider.settings.classes.col.push('col-sm-$size');
            $autofieldsProvider.settings.classes.colOffset = $autofieldsProvider.settings.classes.colOffset || [];
            $autofieldsProvider.settings.classes.colOffset.push('col-sm-offset-$size');
            $autofieldsProvider.registerHandler('multiple', function(directive, field, index){
                var row = angular.element('<div/>');
                row.addClass(directive.options.classes.row.join(' '));

                angular.forEach(field.fields, function(cell, cellIndex){
                    var cellContainer = angular.element('<div/>')
                    var cellSize = cell.type != 'multiple' ? cell.columns || field.columns : field.columns;
                    cellContainer.addClass(directive.options.classes.col.join(' ').replace(/\$size/g,cellSize));

                    cellContainer.append($autofieldsProvider.createField(directive, cell, cellIndex));

                    row.append(cellContainer);
                })

                return row;
            });
            // Number Handler
            $autofieldsProvider.registerHandler('number', function(directive, field, index){
                if(!field.attr){ field.attr = []; }
                field.attr.mask = '9';
                field.attr.restrict = 'reject';
                field.attr.repeat = field.attr.max ? field.attr.max.length : 255;
                field.attr['mask-validate'] = false;
                var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');
                return fieldElements.fieldContainer;
            });
            $autofieldsProvider.registerMutator('number', function(directive, field, fieldElements){
                if(!field.number) return fieldElements;
                if(!field.attr){ field.attr = []; }
                field.attr.mask = '9';
                field.attr.restrict = 'reject';
                field.attr.repeat = field.attr.max ? field.attr.max.length : 255;
                field.attr['mask-validate'] = false;
                return fieldElements;
            });
            // Register Help Block Support
            $autofieldsProvider.settings.classes.helpBlock = $autofieldsProvider.settings.classes.helpBlock || [];
            $autofieldsProvider.settings.classes.helpBlock.push('help-block');
            $autofieldsProvider.registerMutator('helpBlock', function(directive, field, fieldElements){
                if(!field.help) return fieldElements;

                fieldElements.helpBlock = angular.element('<p/>');
                fieldElements.helpBlock.addClass(directive.options.classes.helpBlock.join(' '))
                fieldElements.helpBlock.html(field.help);
                fieldElements.fieldContainer.append(fieldElements.helpBlock);

                return fieldElements;
            });
            // Register Addon Support
            $autofieldsProvider.settings.classes.inputGroup = ['input-group'];
            $autofieldsProvider.settings.classes.inputGroupAddon = ['input-group-addon'];
            $autofieldsProvider.settings.classes.inputGroupAddonButton = ['input-group-btn'];
            $autofieldsProvider.settings.classes.button = ['btn','btn-default'];
            $autofieldsProvider.registerMutator('addons', function(directive, field, fieldElements){
                if(!(field.$addons || field.addons)) return fieldElements;

                fieldElements.inputGroup = angular.element('<div/>');
                fieldElements.inputGroup.addClass($autofieldsProvider.settings.classes.inputGroup.join(' '));

                var toAppend = [];
                angular.forEach(field.$addons || field.addons, function(addon){
                    var inputGroupAddon = angular.element('<span/>'),
                        button = null;
                    inputGroupAddon.addClass($autofieldsProvider.settings.classes.inputGroupAddon.join(' '));

                    if(addon.button){
                        inputGroupAddon.attr('class',$autofieldsProvider.settings.classes.inputGroupAddonButton.join(' '));
                        button = angular.element('<button type="button"/>');
                        button.addClass($autofieldsProvider.settings.classes.button.join(' '));
                        inputGroupAddon.append(button);
                    }
                    if(addon.icon != null){
                        var icon = angular.element('<i/>');
                        icon.addClass(addon.icon);
                        (button||inputGroupAddon).append(icon);
                    }
                    if(addon.content != null) (button||inputGroupAddon).html(addon.content);
                    if(addon.attr) $autofieldsProvider.setAttributes(directive, field, (button||inputGroupAddon), addon.attr);

                    if(addon.before) fieldElements.inputGroup.append(inputGroupAddon);
                    else toAppend.push(inputGroupAddon);
                })

                fieldElements.inputGroup.append(fieldElements.input);
                angular.forEach(toAppend, function(el){fieldElements.inputGroup.append(el)});

                fieldElements.fieldContainer.append(fieldElements.inputGroup);
                return fieldElements;
            })
            // Register Horizontal Form Support
            $autofieldsProvider.settings.layout = {
                type: 'basic',
                labelSize: 2,
                inputSize: 10
            };
            $autofieldsProvider.registerMutator('horizontalForm', function(directive, field, fieldElements){
                if(!(directive.options.layout && directive.options.layout.type == 'horizontal')){
                    directive.container.removeClass('form-horizontal');
                    return fieldElements;
                }
                // Classes & sizing
                var col = $autofieldsProvider.settings.classes.col[0];
                var colOffset = $autofieldsProvider.settings.classes.colOffset[0];
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
    angular.module('gr.ui.autofields.bootstrap.validation',['autofields.validation'])
        .config(['$tooltipProvider', function($tooltipProvider){
            $tooltipProvider.setTriggers({'keyup focus':'blur'});
            $tooltipProvider.options({
                placement:'top',
                animation:false
            });
        }])
        .config(['$autofieldsProvider', function($autofieldsProvider){
            // Add Validation Attributes
            $autofieldsProvider.settings.attributes.container.ngClass = '{\'has-error\':$form.$property_clean.$invalid && $options.validation.enabled, \'has-success\':$form.$property_clean.$valid && $options.validation.enabled, \'required\': $required}';
            $autofieldsProvider.settings.attributes.input.popover = '{{("+$autofieldsProvider.settings.validation.valid+") ? \'$validMsg\' : ($errorMsgs)}}';
            // Dont show popovers on these types
            // this is to avoid multiple scope errors with UI Bootstrap
            $autofieldsProvider.settings.noPopover = ['date'];
            // Validation Mutator
            $autofieldsProvider.registerMutator('bootstrap-validation', function(directive, field, fieldElements){
                //Check to see if validation should be added
                if(!fieldElements.validation || $autofieldsProvider.settings.noPopover.indexOf(field.type) != -1){
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
    angular.module('gr.ui.autofields.directives', [])
        .directive('maskMoney', ['$timeout', '$locale', function($timeout, $locale) {
            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    mmOptions: '=?',
                    prefix: '=',
                    suffix: '=',
                    affixesStay: '=',
                    thousands: '=',
                    decimal: '=',
                    precisoin: '=',
                    allowZero: '=',
                    allowNegative: '='
                },
                link: function(scope, el, attr, ctrl) {

                    scope.$watch(checkOptions, init, true);

                    scope.$watch(attr.ngModel, eventHandler, true);
                    //el.on('keyup', eventHandler); //change to $watch or $observe

                    function checkOptions() {
                        return scope.mmOptions;
                    }

                    function checkModel() {
                        return scope.model;
                    }



                    //this parser will unformat the string for the model behid the scenes
                    function parser() {
                        return $(el).maskMoney('unmasked')[0]
                    }
                    ctrl.$parsers.push(parser);

                    ctrl.$formatters.push(function(value){
                      $timeout(function(){
                        init();
                      });
                      return parseFloat(value).toFixed(2);
                    });

                    function eventHandler() {
                        $timeout(function() {
                            scope.$apply(function() {
                                ctrl.$setViewValue($(el).val());
                            });
                        })
                    }

                    function init(options) {
                        $timeout(function() {
                            var elOptions = {
                                prefix: scope.prefix || '',
                                suffix: scope.suffix,
                                affixesStay: scope.affixesStay,
                                thousands: scope.thousands || $locale.NUMBER_FORMATS.GROUP_SEP,
                                decimal: scope.decimal || $locale.NUMBER_FORMATS.DECIMAL_SEP,
                                precision: scope.precision,
                                allowZero: scope.allowZero,
                                allowNegative: scope.allowNegative
                            }

                            if (!scope.mmOptions) {
                                scope.mmOptions = {};
                            }

                            angular.forEach(elOptions, function(elOption, id){
                                if (elOption) {
                                    scope.mmOptions[id] = elOption;
                                }
                            })

                            $(el).maskMoney(scope.mmOptions);
                            $(el).maskMoney('mask');
                            eventHandler()

                        }, 0);

                        $timeout(function() {
                            scope.$apply(function() {
                                ctrl.$setViewValue($(el).val());
                            });
                        })

                    }
                }
            }
        }]);
    angular.module('gr.ui.autofields',['gr.ui.autofields.core', 'gr.ui.autofields.bootstrap', 'gr.ui.autofields.bootstrap.validation', 'gr.ui.autofields.directives']);
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
                    var defaults = {
                            current: 0,
                            running: false,
                            autoplay: false,
                            hover: false,
                            interval: 4000,
                            bsCols: {xs:1, sm:1, md:1, lg:1}
                        },
                        carousel = {
                            id: $attrs.id || 'carousel',
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
                                    if($element.find('img:visible').length > 0){ $timeout(function(){ $element.height(carousel.scroller.height()); },100); }else{ $element[0].style.height = null; }
                                    carousel.reset();
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
                                                x: ($event.clientX || $event.originalEvent.touches[0].clientX) - $element.offset().left,
                                                y: ($event.clientY || $event.originalEvent.touches[0].clientY) - $element.offset().top
                                            };
                                        drgW = carousel.scroller.outerWidth();
                                        posX = parseFloat(carousel.scroller.css('left')) + drgW - coords.x;
                                        sCoords = angular.copy(coords);
                                    }
                                },
                                move: function($event){
                                    if(carousel.drag.dragging === true && carousel.drag.enable === true){
                                        var coords = {
                                                x: ($event.clientX || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientX : false)) - $element.offset().left,
                                                y: ($event.clientY || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientY : false)) - $element.offset().top
                                            },
                                            limit = {
                                                x: {
                                                    left: $element.offset().left,
                                                    right: $element.offset().left + $element.width()
                                                },
                                                y: {
                                                    top: $element.offset().top,
                                                    bottom: $element.offset().top + $element.height()
                                                }
                                            },
                                            left = coords.x + posX - drgW,
                                            elWidth = $element.innerWidth();
                                        if(!coords.x || !coords.y){ return false; }
                                        if((left + $element.offset().left) > limit.x.left){
                                            left = (((coords.x - sCoords.x)*(elWidth))/drgW);
                                        }
                                        if((left + $element.offset().left + drgW) < limit.x.right){
                                            left = (((coords.x - sCoords.x)*(elWidth))/drgW) - drgW + elWidth;
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
            $templateCache.put('gr-carousel/carousel.html',
                                '<div class="gr-carousel">' +
                                    '<div class="gr-carousel-inner" ng-transclude></div>' +
                                '</div>');
            $templateCache.put('gr-carousel/carousel-item.html', '<div class="gr-carousel-item" ng-transclude></div>');
            $templateCache.put('gr-carousel/carousel-indicators.html',
                                '<ul class="gr-carousel-indicator">' +
                                    '<li class="gr-carousel-indicator-item" ng-class="{\'active\': carousel.isVisible($index)}" ng-repeat="item in carousel.indicators" ng-click="carousel.go($index)"></li>' +
                                '</ul>');
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
                                        options.templateUrl= (element.model.indexOf('http://') > -1 || element.model.indexOf('https://') > -1) ? element.model : grModal.template.base + element.model;
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
                    '<div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\', \'modal-responsive\': size == \'responsive\'}">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header" ng-if="title">' +
                                '<button type="button" class="close" ng-click="close()" title="{{\'Close\' | grTranslate}}"><span aria-hidden="true">&times;</span><span class="sr-only">{{\'Close\' | grTranslate}}</span>' +
                                '</button>' +
                                '<h4 class="modal-title">{{title | grTranslate}}</h4>' +
                            '</div>' +
                            '<div class="modal-body" gr-modal-transclude ng-show="contentReady"></div>' +
                            '<div class="modal-body" ng-if="!contentReady">' +
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
            '<div class="pagination-inner">',
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
                    inArray = Array.prototype.indexOf ?
                                function(val, arr){
                                    return arr.indexOf(val);
                                } : function(val, arr){
                                    var i = arr.length;
                                    while (i--){
                                        if(arr[i] === val){
                                            return i;
                                        }
                                    }
                                    return -1;
                                };
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
                    if((!src || src === '') && dataSource !== ''){
                        getData(dataSource, true);
                    }else if(src && src !== ''){
                        getData(src, true);
                    }
                };
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
                $attrs.$observe('remote', function(remote){
                    if(remote){
                        $scope.dataSet = $parse(remote)($scope);
                    }
                });
                $attrs.$observe('grDataSource', function(remote){
                    if(remote){
                        $scope.$watch(function(){
                            return $parse(remote)($scope);
                        }, function(data){
                            $scope.dataSet = data;
                        }, true);
                    }
                });
                $attrs.$observe('shareParent', function(share){
                    if(share){
                        $scope.$parent[$name] = $scope[$name];
                    }
                });
                $scope.$watch($attrs.list, function(list){
                    if(list){
                        $scope.dataSet = list;
                    }
                }, true);
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
                }, true);
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
                terminal: true,
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
                template: '<div class="btn-group gr-table-count" ng-show="!(grTable.allData.length <= grTable.settings().counts[0])"><button ng-repeat="count in grTable.settings().counts" type="button" ng-class="{\'active\':grTable.count()==count}" ng-click="grTable.count(count)" class="btn btn-default"><span ng-bind="count"></span></button></div>',
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
    angular.module('gr.ui.translate', ['gr.ui.translate.filter'])
        .provider('$grTranslate', function(){
            var $injector,
                $translator = function(value){
                    var _return;
                    if(angular.isString(value)){
                        if($injector.has('$translate')){
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
    angular.module('gr.ui.translate.filter', [])
        .filter('grTranslate', ['$grTranslate', function($grTranslate){
            return function(value){
                if(angular.isString(value)){
                    var newValue, vars;
                    value = $grTranslate(value);
                }
                return value;
            }
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
    (function(){
        /**
         * @license Autofields v2.1.6
         * (c) 2014 Justin Maier http://justmaier.github.io/angular-autoFields-bootstrap
         * License: MIT
         */
        angular.module('autofields.core', [])
            .provider('$autofields', function(){
                var autofields = {};

                // Helper Methods
                var helper = {
                    CamelToTitle: function(str){
                        return str
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, function(str){ return str.toUpperCase(); });
                    },
                    CamelToDash: function(str){
                        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                    },
                    LabelText: function(field){
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
                    fieldContainer.addClass(autofields.settings.classes.container.join(' '));

                    return fieldContainer;
                };
                // Standard Label for field
                var getLabel = function(directive, field, attrs){
                    var label = angular.element('<label/>');
                    attrs = angular.extend({}, autofields.settings.attributes.label, attrs);
                    setAttributes(directive, field, label, attrs);
                    label.addClass(autofields.settings.classes.label.join(' '));
                    label.html(helper.LabelText(field));

                    return label;
                }
                // Standard Input for field
                var getInput = function(directive, field, html, attrs){
                    var input = angular.element(html);
                    attrs = angular.extend({}, autofields.settings.attributes.input, attrs, field.attr);
                    setAttributes(directive, field, input, attrs);
                    input.addClass(autofields.settings.classes.input.join(' '));

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
            })
            .directive('autoFields', ['$autofields','$compile', function($autofields, $compile){
                return {
                    restrict: 'E',
                    priority: 1,
                    replace: true,
                    compile: function(){
                        return function($scope, $element, $attr){
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
                                extendDeep: function(dst){
                                    angular.forEach(arguments, function(obj){
                                        if(obj !== dst){
                                            angular.forEach(obj, function(value, key){
                                                if(dst[key] && dst[key].constructor && dst[key].constructor === Object){
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
                            directive.options = angular.copy($autofields.settings);

                            // Build fields from schema using handlers
                            var build = function(schema){
                                schema = schema || $scope.$eval(directive.schemaStr);

                                // Create HTML
                                directive.container.html('');
                                angular.forEach(schema, function(field, index){
                                    var fieldEl = $autofields.createField(directive, field, index);
                                    directive.container.append(fieldEl);
                                });

                                // Create Scope
                                if(directive.formScope != null) directive.formScope.$destroy();
                                directive.formScope = $scope.$new();
                                directive.formScope.data = $scope[directive.dataStr];
                                directive.formScope.fields = schema;
                                $autofields.updateScope(directive.formScope);

                                // Compile Element with Scope
                                $compile(directive.container)(directive.formScope);
                            };

                            // Init and Watch
                            $scope.$watch(directive.optionsStr, function(newOptions, oldOptions){
                                helper.extendDeep(directive.options, newOptions);
                                if(newOptions !== oldOptions) build();
                            }, true);
                            $scope.$watch(directive.schemaStr, function(schema){
                                build(schema);
                            }, true);
                            $scope.$watch(directive.formStr, function(form){
                                directive.container.attr('name',directive.formStr);
                            });
                            $scope.$watch(function(){return $attr['class'];}, function(form){
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
        angular.module('autofields.standard',['autofields.core'])
            .config(['$autofieldsProvider', function($autofieldsProvider){
                // Text Field Handler
                $autofieldsProvider.settings.fixUrl = true;
                $autofieldsProvider.registerHandler(['text','email','url','date','number','password'], function(directive, field, index){
                    var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');

                    var fixUrl = (field.fixUrl ? field.fixUrl : directive.options.fixUrl);
                    if(field.type == 'url' && fixUrl) fieldElements.input.attr('fix-url','');

                    return fieldElements.fieldContainer;
                });

                // Select Field Handler
                $autofieldsProvider.settings.defaultOption = 'Select One';
                $autofieldsProvider.registerHandler('select', function(directive, field, index){
                    var defaultOption = (field.defaultOption ? field.defaultOption : directive.options.defaultOption);

                    var inputHtml = '<select><option value="">'+defaultOption+'</option></select>';
                    var inputAttrs = {
                        ngOptions: field.list
                    };

                    var fieldElements = $autofieldsProvider.field(directive, field, inputHtml, inputAttrs);

                    return fieldElements.fieldContainer;
                });

                //Textarea Field Handler
                $autofieldsProvider.settings.textareaRows = 3;
                $autofieldsProvider.registerHandler('textarea', function(directive, field, index){
                    var rows = field.rows ? field.rows : directive.options.textareaRows;
                    var fieldElements = $autofieldsProvider.field(directive, field, '<textarea/>', {rows: rows});

                    return fieldElements.fieldContainer;
                });

                //Checkbox Field Handler
                $autofieldsProvider.registerHandler('checkbox', function(directive, field, index){
                    var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');

                    if(fieldElements.label) fieldElements.label.prepend(fieldElements.input);

                    return fieldElements.fieldContainer;
                });

                // Register Hide/Show Support
                $autofieldsProvider.settings.displayAttributes = ($autofieldsProvider.settings.displayAttributes || []).concat(['ng-if', 'ng-show', 'ng-hide']);
                $autofieldsProvider.registerMutator('displayAttributes',function(directive, field, fieldElements){
                    if(!field.attr) return fieldElements;

                    // Check for presence of each display attribute
                    angular.forEach($autofieldsProvider.settings.displayAttributes, function(attr){
                        var value = fieldElements.input.attr(attr);

                        // Stop if field doesn't have attribute
                        if(!value) return;

                        // Move attribute to parent
                        fieldElements.fieldContainer.attr(attr, value);
                        fieldElements.input.removeAttr(attr);
                    });

                    return fieldElements;
                });
            }])
            .directive('fixUrl', [function(){
                return {
                    restrict: 'A',
                    require: 'ngModel',
                    link: function(scope, element, attr, ngModel){
                        var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.\-\?\=\&]*)$/i;

                        //Render formatters on blur...
                        var render = function(){
                            var viewValue = ngModel.$modelValue;
                            if(viewValue == null) return;
                            angular.forEach(ngModel.$formatters, function(formatter){
                                viewValue = formatter(viewValue);
                            })
                            ngModel.$viewValue = viewValue;
                            ngModel.$render();
                        };
                        element.bind('blur', render);

                        var formatUrl = function(value){
                            var test = urlRegex.test(value);
                            if(test){
                                var matches = value.match(urlRegex);
                                var reformatted = (matches[1] != null && matches[1] != '') ? matches[1] : 'http://';
                                reformatted += matches[2] + '.' + matches[3];
                                if(typeof matches[4] != "undefined") reformatted += matches[4]
                                value = reformatted;
                            }
                            return value;
                        }
                        ngModel.$formatters.push(formatUrl);
                        ngModel.$parsers.unshift(formatUrl);
                    }
                };
            }]);
        angular.module('autofields.validation', ['autofields.core'])
            .config(['$autofieldsProvider', function($autofieldsProvider){
                var helper = {
                    CamelToTitle: function(str){
                        return str
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, function(str){ return str.toUpperCase(); });
                    }
                };

                // Add Validation Settings
                $autofieldsProvider.settings.validation = {
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
                $autofieldsProvider.settings.attributes.container.ngClass = "{'invalid':"+$autofieldsProvider.settings.validation.invalid+", 'valid':"+$autofieldsProvider.settings.validation.valid+"}";

                // Add Validation Mutator
                $autofieldsProvider.registerMutator('validation', function(directive, field, fieldElements){
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
                            fieldElements.msgs.push('('+directive.formStr+'.'+field.property+'.$error.'+error+'? \''+message+'\' : \'\')');
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
        angular.module('autofields',['autofields.standard','autofields.validation']);
        angular.module('autoFields',['autofields']); // Deprecated module name
    }());
    (function ($){
        if (!$.browser) {
            $.browser = {};
            $.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
            $.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
            $.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
            $.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
        }

        var methods = {
            destroy : function () {
//                console.log('destroy');
                $(this).unbind(".maskMoney");

                if ($.browser.msie) {
                    this.onpaste = null;
                }
                return this;
            },

            mask : function (value) {
                return this.each(function () {
//                    console.log('mask');
                    var $this = $(this),
                        decimalSize;
                    if (typeof value === "number") {
                        $this.trigger("mask");
                        decimalSize = $($this.val().split(/\D/)).last()[0].length;
                        value = value.toFixed(decimalSize);
                        $this.val(value);
                    }
                    return $this.trigger("mask");
                });
            },

            unmasked : function () {
                return this.map(function () {
//                    console.log('unmasked');
                    var value = ($(this).val() || "0"),
                        isNegative = value.indexOf("-") !== -1,
                        decimalPart;
                    // get the last position of the array that is a number(coercion makes "" to be evaluated as false)
                    $(value.split(/\D/).reverse()).each(function (index, element) {
                        if(element) {
                            decimalPart = element;
                            return false;
                       }
                    });
                    value = value.replace(/\D/g, "");
                    value = value.replace(new RegExp(decimalPart + "$"), "." + decimalPart);
                    if (isNegative) {
                        value = "-" + value;
                    }
                    return parseFloat(value);
                });
            },

            init : function (settings) {
                settings = $.extend({
                    prefix: "",
                    suffix: "",
                    affixesStay: true,
                    thousands: ",",
                    decimal: ".",
                    precision: 2,
                    allowZero: false,
                    allowNegative: false
                }, settings);

                return this.each(function () {
//                    console.log('init');
                    var $input = $(this),
                        onFocusValue;

                    // data-* api
                    settings = $.extend(settings, $input.data());

                    function getInputSelection() {
                        var el = $input.get(0),
                            start = 0,
                            end = 0,
                            normalizedValue,
                            range,
                            textInputRange,
                            len,
                            endRange;

                        if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
                            start = el.selectionStart;
                            end = el.selectionEnd;
                        } else {
                            range = document.selection.createRange();

                            if (range && range.parentElement() === el) {
                                len = el.value.length;
                                normalizedValue = el.value.replace(/\r\n/g, "\n");

                                // Create a working TextRange that lives only in the input
                                textInputRange = el.createTextRange();
                                textInputRange.moveToBookmark(range.getBookmark());

                                // Check if the start and end of the selection are at the very end
                                // of the input, since moveStart/moveEnd doesn't return what we want
                                // in those cases
                                endRange = el.createTextRange();
                                endRange.collapse(false);

                                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                                    start = end = len;
                                } else {
                                    start = -textInputRange.moveStart("character", -len);
                                    start += normalizedValue.slice(0, start).split("\n").length - 1;

                                    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                                        end = len;
                                    } else {
                                        end = -textInputRange.moveEnd("character", -len);
                                        end += normalizedValue.slice(0, end).split("\n").length - 1;
                                    }
                                }
                            }
                        }

                        return {
                            start: start,
                            end: end
                        };
                    } // getInputSelection

                    function canInputMoreNumbers() {
                        var haventReachedMaxLength = !($input.val().length >= $input.attr("maxlength") && $input.attr("maxlength") >= 0),
                            selection = getInputSelection(),
                            start = selection.start,
                            end = selection.end,
                            haveNumberSelected = (selection.start !== selection.end && $input.val().substring(start, end).match(/\d/)) ? true : false,
                            startWithZero = ($input.val().substring(0, 1) === "0");
                        return haventReachedMaxLength || haveNumberSelected || startWithZero;
                    }

                    function setCursorPosition(pos) {
                        $input.each(function (index, elem) {
                            if (elem.setSelectionRange) {
                                elem.focus();
                                elem.setSelectionRange(pos, pos);
                            } else if (elem.createTextRange) {
                                var range = elem.createTextRange();
                                range.collapse(true);
                                range.moveEnd("character", pos);
                                range.moveStart("character", pos);
                                range.select();
                            }
                        });
                    }

                    function setSymbol(value) {
                        var operator = "";
                        if (value.indexOf("-") > -1) {
                            value = value.replace("-", "");
                            operator = "-";
                        }
                        return operator + settings.prefix + value + settings.suffix;
                    }

                    function maskValue(value) {
//                        console.log('maskValue');
                        var negative = (value.indexOf("-") > -1 && settings.allowNegative) ? "-" : "",
                            onlyNumbers = value.replace(/[^0-9]/g, ""),
                            integerPart = onlyNumbers.slice(0, onlyNumbers.length - settings.precision),
                            newValue,
                            decimalPart,
                            leadingZeros;

                        // remove initial zeros
                        integerPart = integerPart.replace(/^0*/g, "");
                        // put settings.thousands every 3 chars
                        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousands);
                        if (integerPart === "") {
                            integerPart = "0";
                        }
                        newValue = negative + integerPart;

                        if (settings.precision > 0) {
                            decimalPart = onlyNumbers.slice(onlyNumbers.length - settings.precision);
                            leadingZeros = new Array((settings.precision + 1) - decimalPart.length).join(0);
                            newValue += settings.decimal + leadingZeros + decimalPart;
                        }
                        return setSymbol(newValue);
                    }

                    function maskAndPosition(startPos) {
                        var originalLen = $input.val().length,
                            newLen;
                        $input.val(maskValue($input.val()));
                        newLen = $input.val().length;
                        startPos = startPos - (originalLen - newLen);
                        setCursorPosition(startPos);
                    }

                    function mask() {
                        var value = $input.val();
                        $input.val(maskValue(value));
                    }

                    function changeSign() {
                        var inputValue = $input.val();
                        if (settings.allowNegative) {
                            if (inputValue !== "" && inputValue.charAt(0) === "-") {
                                return inputValue.replace("-", "");
                            } else {
                                return "-" + inputValue;
                            }
                        } else {
                            return inputValue;
                        }
                    }

                    function preventDefault(e) {
                        if (e.preventDefault) { //standard browsers
                            e.preventDefault();
                        } else { // old internet explorer
                            e.returnValue = false;
                        }
                    }

                    function keypressEvent(e) {
                        e = e || window.event;
                        var key = e.which || e.charCode || e.keyCode,
                            keyPressedChar,
                            selection,
                            startPos,
                            endPos,
                            value;
                        //added to handle an IE "special" event
                        if (key === undefined) {
                            return false;
                        }

                        // any key except the numbers 0-9
                        if (key < 48 || key > 57) {
                            // -(minus) key
                            if (key === 45) {
                                $input.val(changeSign());
                                return false;
                            // +(plus) key
                            } else if (key === 43) {
                                $input.val($input.val().replace("-", ""));
                                return false;
                            // enter key or tab key
                            } else if (key === 13 || key === 9) {
                                return true;
                            } else if ($.browser.mozilla && (key === 37 || key === 39) && e.charCode === 0) {
                                // needed for left arrow key or right arrow key with firefox
                                // the charCode part is to avoid allowing "%"(e.charCode 0, e.keyCode 37)
                                return true;
                            } else { // any other key with keycode less than 48 and greater than 57
                                preventDefault(e);
                                return true;
                            }
                        } else if (!canInputMoreNumbers()) {
                            return false;
                        } else {
                            preventDefault(e);

                            keyPressedChar = String.fromCharCode(key);
                            selection = getInputSelection();
                            startPos = selection.start;
                            endPos = selection.end;
                            value = $input.val();
                            $input.val(value.substring(0, startPos) + keyPressedChar + value.substring(endPos, value.length));
                            maskAndPosition(startPos + 1);
                            return false;
                        }
                    }

                    function keydownEvent(e) {
                        e = e || window.event;
                        var key = e.which || e.charCode || e.keyCode,
                            selection,
                            startPos,
                            endPos,
                            value,
                            lastNumber;
                        //needed to handle an IE "special" event
                        if (key === undefined) {
                            return false;
                        }

                        selection = getInputSelection();
                        startPos = selection.start;
                        endPos = selection.end;

                        if (key === 8 || key === 46 || key === 63272) { // backspace or delete key (with special case for safari)
                            preventDefault(e);

                            value = $input.val();
                            // not a selection
                            if (startPos === endPos) {
                                // backspace
                                if (key === 8) {
                                    if (settings.suffix === "") {
                                        startPos -= 1;
                                    } else {
                                        // needed to find the position of the last number to be erased
                                        lastNumber = value.split("").reverse().join("").search(/\d/);
                                        startPos = value.length - lastNumber - 1;
                                        endPos = startPos + 1;
                                    }
                                //delete
                                } else {
                                    endPos += 1;
                                }
                            }

                            $input.val(value.substring(0, startPos) + value.substring(endPos, value.length));

                            maskAndPosition(startPos);
                            return false;
                        } else if (key === 9) { // tab key
                            return true;
                        } else { // any other key
                            return true;
                        }
                    }

                    function focusEvent() {
                        onFocusValue = $input.val();
                        mask();
                        var input = $input.get(0),
                            textRange;
                        if (input.createTextRange) {
                            textRange = input.createTextRange();
                            textRange.collapse(false); // set the cursor at the end of the input
                            textRange.select();
                        }
                    }

                    function cutPasteEvent() {
                        setTimeout(function() {
                            mask();
                        }, 0);
                    }

                    function getDefaultMask() {
                        var n = parseFloat("0") / Math.pow(10, settings.precision);
                        return (n.toFixed(settings.precision)).replace(new RegExp("\\.", "g"), settings.decimal);
                    }

                    function blurEvent(e) {
                        if ($.browser.msie) {
                            keypressEvent(e);
                        }

                        if ($input.val() === "" || $input.val() === setSymbol(getDefaultMask())) {
                            if (!settings.allowZero) {
                                $input.val("");
                            } else if (!settings.affixesStay) {
                                $input.val(getDefaultMask());
                            } else {
                                $input.val(setSymbol(getDefaultMask()));
                            }
                        } else {
                            if (!settings.affixesStay) {
                                var newValue = $input.val().replace(settings.prefix, "").replace(settings.suffix, "");
                                $input.val(newValue);
                            }
                        }
                        if ($input.val() !== onFocusValue) {
                            $input.change();
                        }
                    }

                    function clickEvent() {
                        var input = $input.get(0),
                            length;
                        if (input.setSelectionRange) {
                            length = $input.val().length;
                            input.setSelectionRange(length, length);
                        } else {
                            $input.val($input.val());
                        }
                    }

                    $input.unbind(".maskMoney");
                    $input.bind("keypress.maskMoney", keypressEvent);
                    $input.bind("keydown.maskMoney", keydownEvent);
                    $input.bind("blur.maskMoney", blurEvent);
                    $input.bind("focus.maskMoney", focusEvent);
                    $input.bind("click.maskMoney", clickEvent);
                    $input.bind("cut.maskMoney", cutPasteEvent);
                    $input.bind("paste.maskMoney", cutPasteEvent);
                    $input.bind("mask.maskMoney", mask);
                });
            }
        };

        $.fn.maskMoney = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === "object" || ! method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error("Method " +  method + " does not exist on jQuery.maskMoney");
            }
        };
    })(window.jQuery || window.Zepto);
    (function(){
      'use strict';
      angular.module('ngMask', []);
      angular.module('ngMask')
        .directive('mask', ['$log', '$timeout', 'MaskService', function($log, $timeout, MaskService) {
          return {
            restrict: 'A',
            require: 'ngModel',
            compile: function($element, $attrs) {
             if (!$attrs.mask || !$attrs.ngModel) {
                $log.info('Mask and ng-model attributes are required!');
                return;
              }

              var maskService = MaskService.create();
              var timeout;
              var promise;

              function setSelectionRange(selectionStart){
                if (typeof selectionStart !== 'number') {
                  return;
                }

                // using $timeout:
                // it should run after the DOM has been manipulated by Angular
                // and after the browser renders (which may cause flicker in some cases)
                $timeout.cancel(timeout);
                timeout = $timeout(function(){
                  var selectionEnd = selectionStart + 1;
                  var input = $element[0];

                  if (input.setSelectionRange) {
                    input.focus();
                    input.setSelectionRange(selectionStart, selectionEnd);
                  } else if (input.createTextRange) {
                    var range = input.createTextRange();

                    range.collapse(true);
                    range.moveEnd('character', selectionEnd);
                    range.moveStart('character', selectionStart);
                    range.select();
                  }
                });
              }

              return {
                pre: function($scope, $element, $attrs, controller) {
                  promise = maskService.generateRegex({
                    mask: $attrs.mask,
                    // repeat mask expression n times
                    repeat: ($attrs.repeat || $attrs.maskRepeat),
                    // clean model value - without divisors
                    clean: (($attrs.clean || $attrs.maskClean) === 'true'),
                    // limit length based on mask length
                    limit: (($attrs.limit || $attrs.maskLimit || 'true') === 'true'),
                    // how to act with a wrong value
                    restrict: ($attrs.restrict || $attrs.maskRestrict || 'select'), //select, reject, accept
                    // set validity mask
                    validate: (($attrs.validate || $attrs.maskValidate || 'true') === 'true'),
                    // default model value
                    model: $attrs.ngModel,
                    // default input value
                    value: $attrs.ngValue
                  });
                },
                post: function($scope, $element, $attrs, controller) {
                  promise.then(function() {
                    // get initial options
                    var timeout;
                    var options = maskService.getOptions();

                    function parseViewValue(value) {
                      // set default value equal 0
                      value = (typeof value === 'number' ? String(value) : value) || '';

                      // get view value object
                      var viewValue = maskService.getViewValue(value);

                      // get mask without question marks
                      var maskWithoutOptionals = options['maskWithoutOptionals'] || '';

                      // get view values capped
                      // used on view
                      var viewValueWithDivisors = viewValue.withDivisors(true);
                      // used on model
                      var viewValueWithoutDivisors = viewValue.withoutDivisors(true);

                      try {
                        // get current regex
                        var regex = maskService.getRegex(viewValueWithDivisors.length - 1);
                        var fullRegex = maskService.getRegex(maskWithoutOptionals.length - 1);

                        // current position is valid
                        var validCurrentPosition = regex.test(viewValueWithDivisors) || fullRegex.test(viewValueWithDivisors);

                        // difference means for select option
                        var diffValueAndViewValueLengthIsOne = (value.length - viewValueWithDivisors.length) === 1;
                        var diffMaskAndViewValueIsGreaterThanZero = (maskWithoutOptionals.length - viewValueWithDivisors.length) > 0;

                        if (options.restrict !== 'accept') {
                          if (options.restrict === 'select' && (!validCurrentPosition || diffValueAndViewValueLengthIsOne)) {
                            var lastCharInputed = value[(value.length-1)];
                            var lastCharGenerated = viewValueWithDivisors[(viewValueWithDivisors.length-1)];

                            if ((lastCharInputed !== lastCharGenerated) && diffMaskAndViewValueIsGreaterThanZero) {
                              viewValueWithDivisors = viewValueWithDivisors + lastCharInputed;
                            }

                            var wrongPosition = maskService.getFirstWrongPosition(viewValueWithDivisors);
                            if (angular.isDefined(wrongPosition)) {
                              setSelectionRange(wrongPosition);
                            }
                          } else if (options.restrict === 'reject' && !validCurrentPosition) {
                            viewValue = maskService.removeWrongPositions(viewValueWithDivisors);
                            viewValueWithDivisors = viewValue.withDivisors(true);
                            viewValueWithoutDivisors = viewValue.withoutDivisors(true);

                            // setSelectionRange(viewValueWithDivisors.length);
                          }
                        }

                        if (!options.limit) {
                          viewValueWithDivisors = viewValue.withDivisors(false);
                          viewValueWithoutDivisors = viewValue.withoutDivisors(false);
                        }

                        // Set validity
                        if (options.validate && controller.$dirty) {
                          if (fullRegex.test(viewValueWithDivisors) || controller.$isEmpty(controller.$modelValue)) {
                            controller.$setValidity('mask', true);
                          } else {
                            controller.$setValidity('mask', false);
                          }
                        }

                        // Update view and model values
                        if(value !== viewValueWithDivisors){
                          controller.$setViewValue(angular.copy(viewValueWithDivisors), 'input');
                          controller.$render();
                        }
                      } catch (e) {
                        $log.error('[mask - parseViewValue]');
                        throw e;
                      }

                      // Update model, can be different of view value
                      if (options.clean) {
                        return viewValueWithoutDivisors;
                      } else {
                        return viewValueWithDivisors;
                      }
                    }

                    controller.$parsers.push(parseViewValue);

                    $element.on('click input paste keyup', function() {
                      timeout = $timeout(function() {
                        // Manual debounce to prevent multiple execution
                        $timeout.cancel(timeout);

                        parseViewValue($element.val());
                        $scope.$apply();
                      }, 100);
                    });

                    // Register the watch to observe remote loading or promised data
                    // Deregister calling returned function
                    var watcher = $scope.$watch($attrs.ngModel, function (newValue, oldValue) {
                      if (angular.isDefined(newValue)) {
                        parseViewValue(newValue);
                        watcher();
                      }
                    });

                    // $evalAsync from a directive
                    // it should run after the DOM has been manipulated by Angular
                    // but before the browser renders
                    if(options.value) {
                      $scope.$evalAsync(function($scope) {
                        controller.$setViewValue(angular.copy(options.value), 'input');
                        controller.$render();
                      });
                    }
                  });
                }
              }
            }
          }
        }]);
      angular.module('ngMask')
        .factory('MaskService', ['$q', 'OptionalService', 'UtilService', function($q, OptionalService, UtilService) {
          function create() {
            var options;
            var maskWithoutOptionals;
            var maskWithoutOptionalsLength = 0;
            var maskWithoutOptionalsAndDivisorsLength = 0;
            var optionalIndexes = [];
            var optionalDivisors = {};
            var optionalDivisorsCombinations = [];
            var divisors = [];
            var divisorElements = {};
            var regex = [];
            var patterns = {
              '9': /[0-9]/,
              '8': /[0-8]/,
              '7': /[0-7]/,
              '6': /[0-6]/,
              '5': /[0-5]/,
              '4': /[0-4]/,
              '3': /[0-3]/,
              '2': /[0-2]/,
              '1': /[0-1]/,
              '0': /[0]/,
              '*': /./,
              'w': /\w/,
              'W': /\W/,
              'd': /\d/,
              'D': /\D/,
              's': /\s/,
              'S': /\S/,
              'b': /\b/,
              'A': /[A-Z]/,
              'a': /[a-z]/,
              'Z': /[A-ZÇÀÁÂÃÈÉÊẼÌÍÎĨÒÓÔÕÙÚÛŨ]/,
              'z': /[a-zçáàãâéèêẽíìĩîóòôõúùũüû]/,
              '@': /[a-zA-Z]/,
              '#': /[a-zA-ZçáàãâéèêẽíìĩîóòôõúùũüûÇÀÁÂÃÈÉÊẼÌÍÎĨÒÓÔÕÙÚÛŨ]/,
              '%': /[0-9a-zA-ZçáàãâéèêẽíìĩîóòôõúùũüûÇÀÁÂÃÈÉÊẼÌÍÎĨÒÓÔÕÙÚÛŨ]/
            };

            // REGEX

            function generateIntermetiateElementRegex(i, forceOptional) {
              var charRegex;
              try {
                var element = maskWithoutOptionals[i];
                var elementRegex = patterns[element];
                var hasOptional = isOptional(i);

                if (elementRegex) {
                  charRegex = '(' + elementRegex.source + ')';
                } else { // is a divisor
                  if (!isDivisor(i)) {
                    divisors.push(i);
                    divisorElements[i] = element;
                  }

                  charRegex = '(' + '\\' + element + ')';
                }
              } catch (e) {
                throw e;
              }

              if (hasOptional || forceOptional) {
                charRegex += '?';
              }

              return new RegExp(charRegex);
            }

            function generateIntermetiateRegex(i, forceOptional) {


              var elementRegex
              var elementOptionalRegex;
              try {
                var intermetiateElementRegex = generateIntermetiateElementRegex(i, forceOptional);
                elementRegex = intermetiateElementRegex;

                var hasOptional = isOptional(i);
                var currentRegex = intermetiateElementRegex.source;

                if (hasOptional && ((i+1) < maskWithoutOptionalsLength)) {
                  var intermetiateRegex = generateIntermetiateRegex((i+1), true).elementOptionalRegex();
                  currentRegex += intermetiateRegex.source;
                }

                elementOptionalRegex = new RegExp(currentRegex);
              } catch (e) {
                throw e;
              }
              return {
                elementRegex: function() {
                  return elementRegex;
                },
                elementOptionalRegex: function() {
                  // from element regex, gets the flow of regex until first not optional
                  return elementOptionalRegex;
                }
              };
            }

            function generateRegex(opts) {
              var deferred = $q.defer();
              options = opts;

              try {
                var mask = opts['mask'];
                var repeat = opts['repeat'];

                if (repeat) {
                  mask = Array((parseInt(repeat)+1)).join(mask);
                }

                optionalIndexes = OptionalService.getOptionals(mask).fromMaskWithoutOptionals();
                options['maskWithoutOptionals'] = maskWithoutOptionals = OptionalService.removeOptionals(mask);
                maskWithoutOptionalsLength = maskWithoutOptionals.length;

                var cumulativeRegex;
                for (var i=0; i<maskWithoutOptionalsLength; i++) {
                  var charRegex = generateIntermetiateRegex(i);
                  var elementRegex = charRegex.elementRegex();
                  var elementOptionalRegex = charRegex.elementOptionalRegex();

                  var newRegex = cumulativeRegex ? cumulativeRegex.source + elementOptionalRegex.source : elementOptionalRegex.source;
                  newRegex = new RegExp(newRegex);
                  cumulativeRegex = cumulativeRegex ? cumulativeRegex.source + elementRegex.source : elementRegex.source;
                  cumulativeRegex = new RegExp(cumulativeRegex);

                  regex.push(newRegex);
                }

                generateOptionalDivisors();
                maskWithoutOptionalsAndDivisorsLength = removeDivisors(maskWithoutOptionals).length;

                deferred.resolve({
                  options: options,
                  divisors: divisors,
                  divisorElements: divisorElements,
                  optionalIndexes: optionalIndexes,
                  optionalDivisors: optionalDivisors,
                  optionalDivisorsCombinations: optionalDivisorsCombinations
                });
              } catch (e) {
                deferred.reject(e);
                throw e;
              }

              return deferred.promise;
            }

            function getRegex(index) {
              var currentRegex;

              try {
                currentRegex = regex[index] ? regex[index].source : '';
              } catch (e) {
                throw e;
              }

              return (new RegExp('^' + currentRegex + '$'));
            }

            // DIVISOR

            function isOptional(currentPos) {
              return UtilService.inArray(currentPos, optionalIndexes);
            }

            function isDivisor(currentPos) {
              return UtilService.inArray(currentPos, divisors);
            }

            function generateOptionalDivisors() {
              function sortNumber(a,b) {
                  return a - b;
              }

              var sortedDivisors = divisors.sort(sortNumber);
              var sortedOptionals = optionalIndexes.sort(sortNumber);
              for (var i = 0; i<sortedDivisors.length; i++) {
                var divisor = sortedDivisors[i];
                for (var j = 1; j<=sortedOptionals.length; j++) {
                  var optional = sortedOptionals[(j-1)];
                  if (optional >= divisor) {
                    break;
                  }

                  if (optionalDivisors[divisor]) {
                    optionalDivisors[divisor] = optionalDivisors[divisor].concat(divisor-j);
                  } else {
                    optionalDivisors[divisor] = [(divisor-j)];
                  }

                  // get the original divisor for alternative divisor
                  divisorElements[(divisor-j)] = divisorElements[divisor];
                }
              }
            }

            function removeDivisors(value) {
              try {
                if (divisors.length > 0 && value) {
                  var keys = Object.keys(divisorElements);
                  var elments = [];

                  for (var i = keys.length - 1; i >= 0; i--) {
                    var divisor = divisorElements[keys[i]];
                    if (divisor) {
                      elments.push(divisor);
                    }
                  }

                  elments = UtilService.uniqueArray(elments);

                  // remove if it is not pattern
                  var regex = new RegExp(('[' + '\\' + elments.join('\\') + ']'), 'g');
                  return value.replace(regex, '');
                } else {
                  return value;
                }
              } catch (e) {
                throw e;
              }
            }

            function insertDivisors(array, combination) {
              function insert(array, output) {
                var out = output;
                for (var i=0; i<array.length; i++) {
                  var divisor = array[i];
                  if (divisor < out.length) {
                    out.splice(divisor, 0, divisorElements[divisor]);
                  }
                }
                return out;
              }

              var output = array;
              var divs = divisors.filter(function(it) {
                var optionalDivisorsKeys = Object.keys(optionalDivisors).map(function(it){
                  return parseInt(it);
                });

                return !UtilService.inArray(it, combination) && !UtilService.inArray(it, optionalDivisorsKeys);
              });

              if (!angular.isArray(array) || !angular.isArray(combination)) {
                return output;
              }

              // insert not optional divisors
              output = insert(divs, output);

              // insert optional divisors
              output = insert(combination, output);

              return output;
            }

            function tryDivisorConfiguration(value) {
              var output = value.split('');
              var defaultDivisors = true;

              // has optional?
              if (optionalIndexes.length > 0) {
                var lazyArguments = [];
                var optionalDivisorsKeys = Object.keys(optionalDivisors);

                // get all optional divisors as array of arrays [[], [], []...]
                for (var i=0; i<optionalDivisorsKeys.length; i++) {
                  var val = optionalDivisors[optionalDivisorsKeys[i]];
                  lazyArguments.push(val);
                }

                // generate all possible configurations
                if (optionalDivisorsCombinations.length === 0) {
                  UtilService.lazyProduct(lazyArguments, function() {
                    // convert arguments to array
                    optionalDivisorsCombinations.push(Array.prototype.slice.call(arguments));
                  });
                }

                for (var i = optionalDivisorsCombinations.length - 1; i >= 0; i--) {
                  var outputClone = angular.copy(output);
                  outputClone = insertDivisors(outputClone, optionalDivisorsCombinations[i]);

                  // try validation
                  var viewValueWithDivisors = outputClone.join('');
                  var regex = getRegex(maskWithoutOptionals.length - 1);

                  if (regex.test(viewValueWithDivisors)) {
                    defaultDivisors = false;
                    output = outputClone;
                    break;
                  }
                }
              }

              if (defaultDivisors) {
                output = insertDivisors(output, divisors);
              }

              return output.join('');
            }

            // MASK

            function getOptions() {
              return options;
            }

            function getViewValue(value) {
              try {
                var outputWithoutDivisors = removeDivisors(value);
                var output = tryDivisorConfiguration(outputWithoutDivisors);

                return {
                  withDivisors: function(capped) {
                    if (capped) {
                      return output.substr(0, maskWithoutOptionalsLength);
                    } else {
                      return output;
                    }
                  },
                  withoutDivisors: function(capped) {
                    if (capped) {
                      return outputWithoutDivisors.substr(0, maskWithoutOptionalsAndDivisorsLength);
                    } else {
                      return outputWithoutDivisors;
                    }
                  }
                };
              } catch (e) {
                throw e;
              }
            }

            // SELECTOR

            function getWrongPositions(viewValueWithDivisors, onlyFirst) {
              var pos = [];

              if (!viewValueWithDivisors) {
                return 0;
              }

              for (var i=0; i<viewValueWithDivisors.length; i++){
                var pattern = getRegex(i);
                var value = viewValueWithDivisors.substr(0, (i+1));

                if(pattern && !pattern.test(value)){
                  pos.push(i);

                  if (onlyFirst) {
                    break;
                  }
                }
              }

              return pos;
            }

            function getFirstWrongPosition(viewValueWithDivisors) {
              return getWrongPositions(viewValueWithDivisors, true)[0];
            }

            function removeWrongPositions(viewValueWithDivisors) {
              var wrongPositions = getWrongPositions(viewValueWithDivisors, false);
              var newViewValue = viewValueWithDivisors;

              for (var i in wrongPositions) {
                var wrongPosition = wrongPositions[i];
                var viewValueArray = viewValueWithDivisors.split('');
                viewValueArray.splice(wrongPosition, 1);
                newViewValue = viewValueArray.join('');
              }

              return getViewValue(newViewValue);
            }

            return {
              getViewValue: getViewValue,
              generateRegex: generateRegex,
              getRegex: getRegex,
              getOptions: getOptions,
              removeDivisors: removeDivisors,
              getFirstWrongPosition: getFirstWrongPosition,
              removeWrongPositions: removeWrongPositions
            }
          }

          return {
            create: create
          }
        }]);
      angular.module('ngMask')
        .factory('OptionalService', [function() {
          function getOptionalsIndexes(mask) {
            var indexes = [];

            try {
              var regexp = /\?/g;
              var match = [];

              while ((match = regexp.exec(mask)) != null) {
                // Save the optional char
                indexes.push((match.index - 1));
              }
            } catch (e) {
              throw e;
            }

            return {
              fromMask: function() {
                return indexes;
              },
              fromMaskWithoutOptionals: function() {
                return getOptionalsRelativeMaskWithoutOptionals(indexes);
              }
            };
          }

          function getOptionalsRelativeMaskWithoutOptionals(optionals) {
            var indexes = [];
            for (var i=0; i<optionals.length; i++) {
              indexes.push(optionals[i]-i);
            }
            return indexes;
          }

          function removeOptionals(mask) {
            var newMask;

            try {
              newMask = mask.replace(/\?/g, '');
            } catch (e) {
              throw e;
            }

            return newMask;
          }

          return {
            removeOptionals: removeOptionals,
            getOptionals: getOptionalsIndexes
          }
        }]);
      angular.module('ngMask')
        .factory('UtilService', [function() {

          // sets: an array of arrays
          // f: your callback function
          // context: [optional] the `this` to use for your callback
          // http://phrogz.net/lazy-cartesian-product
          function lazyProduct(sets, f, context){
            if (!context){
              context=this;
            }

            var p = [];
            var max = sets.length-1;
            var lens = [];

            for (var i=sets.length;i--;) {
              lens[i] = sets[i].length;
            }

            function dive(d){
              var a = sets[d];
              var len = lens[d];

              if (d === max) {
                for (var i=0;i<len;++i) {
                  p[d] = a[i];
                  f.apply(context, p);
                }
              } else {
                for (var i=0;i<len;++i) {
                  p[d]=a[i];
                  dive(d+1);
                }
              }

              p.pop();
            }

            dive(0);
          }

          function inArray(i, array) {
            var output;

            try {
              output = array.indexOf(i) > -1;
            } catch (e) {
              throw e;
            }

            return output;
          }

          function uniqueArray(array) {
            var u = {};
            var a = [];

            for (var i = 0, l = array.length; i < l; ++i) {
              if(u.hasOwnProperty(array[i])) {
                continue;
              }

              a.push(array[i]);
              u[array[i]] = 1;
            }

            return a;
          }

          return {
            lazyProduct: lazyProduct,
            inArray: inArray,
            uniqueArray: uniqueArray
          }
        }]);
    })();
}());

/*! jQuery UI - v1.11.2 - 2015-01-23
* http://jqueryui.com
* Includes: effect.js
* Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

(function(){
    (function(e){
        "function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)})(function(e){var t="ui-effects-",i=e;e.effects={effect:{}},function(e,t){function i(e,t,i){var s=d[t.type]||{};return null==e?i||!t.def?null:t.def:(e=s.floor?~~e:parseFloat(e),isNaN(e)?t.def:s.mod?(e+s.mod)%s.mod:0>e?0:e>s.max?s.max:e)}function s(i){var s=l(),n=s._rgba=[];return i=i.toLowerCase(),f(h,function(e,a){var o,r=a.re.exec(i),h=r&&a.parse(r),l=a.space||"rgba";return h?(o=s[l](h),s[u[l].cache]=o[u[l].cache],n=s._rgba=o._rgba,!1):t}),n.length?("0,0,0,0"===n.join()&&e.extend(n,a.transparent),s):a[i]}function n(e,t,i){return i=(i+1)%1,1>6*i?e+6*(t-e)*i:1>2*i?t:2>3*i?e+6*(t-e)*(2/3-i):e}var a,o="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",r=/^([\-+])=\s*(\d+\.?\d*)/,h=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[e[1],e[2],e[3],e[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[2.55*e[1],2.55*e[2],2.55*e[3],e[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(e){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(e){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(e){return[e[1],e[2]/100,e[3]/100,e[4]]}}],l=e.Color=function(t,i,s,n){return new e.Color.fn.parse(t,i,s,n)},u={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},d={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},c=l.support={},p=e("<p>")[0],f=e.each;p.style.cssText="background-color:rgba(1,1,1,.5)",c.rgba=p.style.backgroundColor.indexOf("rgba")>-1,f(u,function(e,t){t.cache="_"+e,t.props.alpha={idx:3,type:"percent",def:1}}),l.fn=e.extend(l.prototype,{parse:function(n,o,r,h){if(n===t)return this._rgba=[null,null,null,null],this;(n.jquery||n.nodeType)&&(n=e(n).css(o),o=t);var d=this,c=e.type(n),p=this._rgba=[];return o!==t&&(n=[n,o,r,h],c="array"),"string"===c?this.parse(s(n)||a._default):"array"===c?(f(u.rgba.props,function(e,t){p[t.idx]=i(n[t.idx],t)}),this):"object"===c?(n instanceof l?f(u,function(e,t){n[t.cache]&&(d[t.cache]=n[t.cache].slice())}):f(u,function(t,s){var a=s.cache;f(s.props,function(e,t){if(!d[a]&&s.to){if("alpha"===e||null==n[e])return;d[a]=s.to(d._rgba)}d[a][t.idx]=i(n[e],t,!0)}),d[a]&&0>e.inArray(null,d[a].slice(0,3))&&(d[a][3]=1,s.from&&(d._rgba=s.from(d[a])))}),this):t},is:function(e){var i=l(e),s=!0,n=this;return f(u,function(e,a){var o,r=i[a.cache];return r&&(o=n[a.cache]||a.to&&a.to(n._rgba)||[],f(a.props,function(e,i){return null!=r[i.idx]?s=r[i.idx]===o[i.idx]:t})),s}),s},_space:function(){var e=[],t=this;return f(u,function(i,s){t[s.cache]&&e.push(i)}),e.pop()},transition:function(e,t){var s=l(e),n=s._space(),a=u[n],o=0===this.alpha()?l("transparent"):this,r=o[a.cache]||a.to(o._rgba),h=r.slice();return s=s[a.cache],f(a.props,function(e,n){var a=n.idx,o=r[a],l=s[a],u=d[n.type]||{};null!==l&&(null===o?h[a]=l:(u.mod&&(l-o>u.mod/2?o+=u.mod:o-l>u.mod/2&&(o-=u.mod)),h[a]=i((l-o)*t+o,n)))}),this[n](h)},blend:function(t){if(1===this._rgba[3])return this;var i=this._rgba.slice(),s=i.pop(),n=l(t)._rgba;return l(e.map(i,function(e,t){return(1-s)*n[t]+s*e}))},toRgbaString:function(){var t="rgba(",i=e.map(this._rgba,function(e,t){return null==e?t>2?1:0:e});return 1===i[3]&&(i.pop(),t="rgb("),t+i.join()+")"},toHslaString:function(){var t="hsla(",i=e.map(this.hsla(),function(e,t){return null==e&&(e=t>2?1:0),t&&3>t&&(e=Math.round(100*e)+"%"),e});return 1===i[3]&&(i.pop(),t="hsl("),t+i.join()+")"},toHexString:function(t){var i=this._rgba.slice(),s=i.pop();return t&&i.push(~~(255*s)),"#"+e.map(i,function(e){return e=(e||0).toString(16),1===e.length?"0"+e:e}).join("")},toString:function(){return 0===this._rgba[3]?"transparent":this.toRgbaString()}}),l.fn.parse.prototype=l.fn,u.hsla.to=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t,i,s=e[0]/255,n=e[1]/255,a=e[2]/255,o=e[3],r=Math.max(s,n,a),h=Math.min(s,n,a),l=r-h,u=r+h,d=.5*u;return t=h===r?0:s===r?60*(n-a)/l+360:n===r?60*(a-s)/l+120:60*(s-n)/l+240,i=0===l?0:.5>=d?l/u:l/(2-u),[Math.round(t)%360,i,d,null==o?1:o]},u.hsla.from=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t=e[0]/360,i=e[1],s=e[2],a=e[3],o=.5>=s?s*(1+i):s+i-s*i,r=2*s-o;return[Math.round(255*n(r,o,t+1/3)),Math.round(255*n(r,o,t)),Math.round(255*n(r,o,t-1/3)),a]},f(u,function(s,n){var a=n.props,o=n.cache,h=n.to,u=n.from;l.fn[s]=function(s){if(h&&!this[o]&&(this[o]=h(this._rgba)),s===t)return this[o].slice();var n,r=e.type(s),d="array"===r||"object"===r?s:arguments,c=this[o].slice();return f(a,function(e,t){var s=d["object"===r?e:t.idx];null==s&&(s=c[t.idx]),c[t.idx]=i(s,t)}),u?(n=l(u(c)),n[o]=c,n):l(c)},f(a,function(t,i){l.fn[t]||(l.fn[t]=function(n){var a,o=e.type(n),h="alpha"===t?this._hsla?"hsla":"rgba":s,l=this[h](),u=l[i.idx];return"undefined"===o?u:("function"===o&&(n=n.call(this,u),o=e.type(n)),null==n&&i.empty?this:("string"===o&&(a=r.exec(n),a&&(n=u+parseFloat(a[2])*("+"===a[1]?1:-1))),l[i.idx]=n,this[h](l)))})})}),l.hook=function(t){var i=t.split(" ");f(i,function(t,i){e.cssHooks[i]={set:function(t,n){var a,o,r="";if("transparent"!==n&&("string"!==e.type(n)||(a=s(n)))){if(n=l(a||n),!c.rgba&&1!==n._rgba[3]){for(o="backgroundColor"===i?t.parentNode:t;(""===r||"transparent"===r)&&o&&o.style;)try{r=e.css(o,"backgroundColor"),o=o.parentNode}catch(h){}n=n.blend(r&&"transparent"!==r?r:"_default")}n=n.toRgbaString()}try{t.style[i]=n}catch(h){}}},e.fx.step[i]=function(t){t.colorInit||(t.start=l(t.elem,i),t.end=l(t.end),t.colorInit=!0),e.cssHooks[i].set(t.elem,t.start.transition(t.end,t.pos))}})},l.hook(o),e.cssHooks.borderColor={expand:function(e){var t={};return f(["Top","Right","Bottom","Left"],function(i,s){t["border"+s+"Color"]=e}),t}},a=e.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}}(i),function(){function t(t){var i,s,n=t.ownerDocument.defaultView?t.ownerDocument.defaultView.getComputedStyle(t,null):t.currentStyle,a={};if(n&&n.length&&n[0]&&n[n[0]])for(s=n.length;s--;)i=n[s],"string"==typeof n[i]&&(a[e.camelCase(i)]=n[i]);else for(i in n)"string"==typeof n[i]&&(a[i]=n[i]);return a}function s(t,i){var s,n,o={};for(s in i)n=i[s],t[s]!==n&&(a[s]||(e.fx.step[s]||!isNaN(parseFloat(n)))&&(o[s]=n));return o}var n=["add","remove","toggle"],a={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};e.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(t,s){e.fx.step[s]=function(e){("none"!==e.end&&!e.setAttr||1===e.pos&&!e.setAttr)&&(i.style(e.elem,s,e.end),e.setAttr=!0)}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e.effects.animateClass=function(i,a,o,r){var h=e.speed(a,o,r);return this.queue(function(){var a,o=e(this),r=o.attr("class")||"",l=h.children?o.find("*").addBack():o;l=l.map(function(){var i=e(this);return{el:i,start:t(this)}}),a=function(){e.each(n,function(e,t){i[t]&&o[t+"Class"](i[t])})},a(),l=l.map(function(){return this.end=t(this.el[0]),this.diff=s(this.start,this.end),this}),o.attr("class",r),l=l.map(function(){var t=this,i=e.Deferred(),s=e.extend({},h,{queue:!1,complete:function(){i.resolve(t)}});return this.el.animate(this.diff,s),i.promise()}),e.when.apply(e,l.get()).done(function(){a(),e.each(arguments,function(){var t=this.el;e.each(this.diff,function(e){t.css(e,"")})}),h.complete.call(o[0])})})},e.fn.extend({addClass:function(t){return function(i,s,n,a){return s?e.effects.animateClass.call(this,{add:i},s,n,a):t.apply(this,arguments)}}(e.fn.addClass),removeClass:function(t){return function(i,s,n,a){return arguments.length>1?e.effects.animateClass.call(this,{remove:i},s,n,a):t.apply(this,arguments)}}(e.fn.removeClass),toggleClass:function(t){return function(i,s,n,a,o){return"boolean"==typeof s||void 0===s?n?e.effects.animateClass.call(this,s?{add:i}:{remove:i},n,a,o):t.apply(this,arguments):e.effects.animateClass.call(this,{toggle:i},s,n,a)}}(e.fn.toggleClass),switchClass:function(t,i,s,n,a){return e.effects.animateClass.call(this,{add:i,remove:t},s,n,a)}})}(),function(){function i(t,i,s,n){return e.isPlainObject(t)&&(i=t,t=t.effect),t={effect:t},null==i&&(i={}),e.isFunction(i)&&(n=i,s=null,i={}),("number"==typeof i||e.fx.speeds[i])&&(n=s,s=i,i={}),e.isFunction(s)&&(n=s,s=null),i&&e.extend(t,i),s=s||i.duration,t.duration=e.fx.off?0:"number"==typeof s?s:s in e.fx.speeds?e.fx.speeds[s]:e.fx.speeds._default,t.complete=n||i.complete,t}function s(t){return!t||"number"==typeof t||e.fx.speeds[t]?!0:"string"!=typeof t||e.effects.effect[t]?e.isFunction(t)?!0:"object"!=typeof t||t.effect?!1:!0:!0}e.extend(e.effects,{version:"1.11.2",save:function(e,i){for(var s=0;i.length>s;s++)null!==i[s]&&e.data(t+i[s],e[0].style[i[s]])},restore:function(e,i){var s,n;for(n=0;i.length>n;n++)null!==i[n]&&(s=e.data(t+i[n]),void 0===s&&(s=""),e.css(i[n],s))},setMode:function(e,t){return"toggle"===t&&(t=e.is(":hidden")?"show":"hide"),t},getBaseline:function(e,t){var i,s;switch(e[0]){case"top":i=0;break;case"middle":i=.5;break;case"bottom":i=1;break;default:i=e[0]/t.height}switch(e[1]){case"left":s=0;break;case"center":s=.5;break;case"right":s=1;break;default:s=e[1]/t.width}return{x:s,y:i}},createWrapper:function(t){if(t.parent().is(".ui-effects-wrapper"))return t.parent();var i={width:t.outerWidth(!0),height:t.outerHeight(!0),"float":t.css("float")},s=e("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),n={width:t.width(),height:t.height()},a=document.activeElement;try{a.id}catch(o){a=document.body}return t.wrap(s),(t[0]===a||e.contains(t[0],a))&&e(a).focus(),s=t.parent(),"static"===t.css("position")?(s.css({position:"relative"}),t.css({position:"relative"})):(e.extend(i,{position:t.css("position"),zIndex:t.css("z-index")}),e.each(["top","left","bottom","right"],function(e,s){i[s]=t.css(s),isNaN(parseInt(i[s],10))&&(i[s]="auto")}),t.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})),t.css(n),s.css(i).show()},removeWrapper:function(t){var i=document.activeElement;return t.parent().is(".ui-effects-wrapper")&&(t.parent().replaceWith(t),(t[0]===i||e.contains(t[0],i))&&e(i).focus()),t},setTransition:function(t,i,s,n){return n=n||{},e.each(i,function(e,i){var a=t.cssUnit(i);a[0]>0&&(n[i]=a[0]*s+a[1])}),n}}),e.fn.extend({effect:function(){function t(t){function i(){e.isFunction(a)&&a.call(n[0]),e.isFunction(t)&&t()}var n=e(this),a=s.complete,r=s.mode;(n.is(":hidden")?"hide"===r:"show"===r)?(n[r](),i()):o.call(n[0],s,i)}var s=i.apply(this,arguments),n=s.mode,a=s.queue,o=e.effects.effect[s.effect];return e.fx.off||!o?n?this[n](s.duration,s.complete):this.each(function(){s.complete&&s.complete.call(this)}):a===!1?this.each(t):this.queue(a||"fx",t)},show:function(e){return function(t){if(s(t))return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="show",this.effect.call(this,n)}}(e.fn.show),hide:function(e){return function(t){if(s(t))return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="hide",this.effect.call(this,n)}}(e.fn.hide),toggle:function(e){return function(t){if(s(t)||"boolean"==typeof t)return e.apply(this,arguments);var n=i.apply(this,arguments);return n.mode="toggle",this.effect.call(this,n)}}(e.fn.toggle),cssUnit:function(t){var i=this.css(t),s=[];return e.each(["em","px","%","pt"],function(e,t){i.indexOf(t)>0&&(s=[parseFloat(i),t])}),s}})}(),function(){var t={};e.each(["Quad","Cubic","Quart","Quint","Expo"],function(e,i){t[i]=function(t){return Math.pow(t,e+2)}}),e.extend(t,{Sine:function(e){return 1-Math.cos(e*Math.PI/2)},Circ:function(e){return 1-Math.sqrt(1-e*e)},Elastic:function(e){return 0===e||1===e?e:-Math.pow(2,8*(e-1))*Math.sin((80*(e-1)-7.5)*Math.PI/15)},Back:function(e){return e*e*(3*e-2)},Bounce:function(e){for(var t,i=4;((t=Math.pow(2,--i))-1)/11>e;);return 1/Math.pow(4,3-i)-7.5625*Math.pow((3*t-2)/22-e,2)}}),e.each(t,function(t,i){e.easing["easeIn"+t]=i,e.easing["easeOut"+t]=function(e){return 1-i(1-e)},e.easing["easeInOut"+t]=function(e){return.5>e?i(2*e)/2:1-i(-2*e+2)/2}})}(),e.effects});
}());