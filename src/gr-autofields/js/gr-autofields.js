'use strict';
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
                field.attr['mask-validate'] = false;
                field.placeholder = '';
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

/** gr-autofields dependencies **/

(function(){
    /**
     * @license Autofields v2.1.6
     * (c) 2014 Justin Maier http://justmaier.github.io/angular-autoFields-bootstrap
     * License: MIT
     */
    (function(){
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
    }());
    (function(){
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
    }());
    (function(){
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
    }());
    (function(){
        angular.module('autofields',['autofields.standard','autofields.validation']);
        angular.module('autoFields',['autofields']); // Deprecated module name
    }());
    (function ($) {
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
        angular.module("ngMask",[]);
        angular.module("ngMask").directive("mask",["$log","$timeout","MaskService",function(a,b,c){return{restrict:"A",require:"ngModel",compile:function(d,e){function f(a){"number"==typeof a&&(b.cancel(g),g=b(function(){var b=a+1,c=d[0];if(c.setSelectionRange)c.focus(),c.setSelectionRange(a,b);else if(c.createTextRange){var e=c.createTextRange();e.collapse(!0),e.moveEnd("character",b),e.moveStart("character",a),e.select()}}))}if(!e.mask||!e.ngModel)return void a.info("Mask and ng-model attributes are required!");var g,h,i=c.create();return{pre:function(a,b,c){h=i.generateRegex({mask:c.mask,repeat:c.repeat||c.maskRepeat,clean:"true"===(c.clean||c.maskClean),limit:"true"===(c.limit||c.maskLimit||"true"),restrict:c.restrict||c.maskRestrict||"select",validate:"true"===(c.validate||c.maskValidate||"true"),model:c.ngModel,value:c.ngValue})},post:function(c,d,e,g){h.then(function(){function h(b){b=b||"";var c=i.getViewValue(b),d=k.maskWithoutOptionals||"",e=c.withDivisors(!0),h=c.withoutDivisors(!0);try{var j=i.getRegex(e.length-1),l=i.getRegex(d.length-1),m=j.test(e)||l.test(e),n=b.length-e.length===1,o=d.length-e.length>0;if("accept"!==k.restrict)if("select"!==k.restrict||m&&!n)"reject"!==k.restrict||m||(c=i.removeWrongPositions(e),e=c.withDivisors(!0),h=c.withoutDivisors(!0));else{var p=b[b.length-1],q=e[e.length-1];p!==q&&o&&(e+=p);var r=i.getFirstWrongPosition(e);angular.isDefined(r)&&f(r)}k.limit||(e=c.withDivisors(!1),h=c.withoutDivisors(!1)),k.validate&&g.$dirty&&(l.test(e)||g.$isEmpty(g.$modelValue)?g.$setValidity("mask",!0):g.$setValidity("mask",!1)),b!==e&&(g.$setViewValue(angular.copy(e),"input"),g.$render())}catch(s){throw a.error("[mask - parseViewValue]"),s}return k.clean?h:e}var j,k=i.getOptions();g.$parsers.push(h),d.on("click input paste keyup",function(){j=b(function(){b.cancel(j),h(d.val()),c.$apply()},100)});var l=c.$watch(e.ngModel,function(a){angular.isDefined(a)&&(h(a),l())});k.value&&c.$evalAsync(function(){g.$setViewValue(angular.copy(k.value),"input"),g.$render()})})}}}}}]);
        angular.module("ngMask").factory("MaskService",["$q","OptionalService","UtilService",function(a,b,c){function d(){function d(a,b){var c;try{var d=t[a],e=C[d],f=h(a);e?c="("+e.source+")":(i(a)||(z.push(a),A[a]=d),c="(\\"+d+")")}catch(g){throw g}return(f||b)&&(c+="?"),new RegExp(c)}function e(a,b){var c,f;try{var g=d(a,b);c=g;var i=h(a),j=g.source;if(i&&u>a+1){var k=e(a+1,!0).elementOptionalRegex();j+=k.source}f=new RegExp(j)}catch(l){throw l}return{elementRegex:function(){return c},elementOptionalRegex:function(){return f}}}function f(c){var d=a.defer();s=c;try{var f=c.mask,g=c.repeat;g&&(f=Array(parseInt(g)+1).join(f)),w=b.getOptionals(f).fromMaskWithoutOptionals(),s.maskWithoutOptionals=t=b.removeOptionals(f),u=t.length;for(var h,i=0;u>i;i++){var l=e(i),m=l.elementRegex(),n=l.elementOptionalRegex(),o=h?h.source+n.source:n.source;o=new RegExp(o),h=h?h.source+m.source:m.source,h=new RegExp(h),B.push(o)}j(),v=k(t).length,d.resolve({options:s,divisors:z,divisorElements:A,optionalIndexes:w,optionalDivisors:x,optionalDivisorsCombinations:y})}catch(p){throw d.reject(p),p}return d.promise}function g(a){var b;try{b=B[a]?B[a].source:""}catch(c){throw c}return new RegExp("^"+b+"$")}function h(a){return c.inArray(a,w)}function i(a){return c.inArray(a,z)}function j(){function a(a,b){return a-b}for(var b=z.sort(a),c=w.sort(a),d=0;d<b.length;d++)for(var e=b[d],f=1;f<=c.length;f++){var g=c[f-1];if(g>=e)break;x[e]=x[e]?x[e].concat(e-f):[e-f],A[e-f]=A[e]}}function k(a){try{if(z.length>0&&a){for(var b=Object.keys(A),d=[],e=b.length-1;e>=0;e--){var f=A[b[e]];f&&d.push(f)}d=c.uniqueArray(d);var g=new RegExp("[\\"+d.join("\\")+"]","g");return a.replace(g,"")}return a}catch(h){throw h}}function l(a,b){function d(a,b){for(var c=b,d=0;d<a.length;d++){var e=a[d];e<c.length&&c.splice(e,0,A[e])}return c}var e=a,f=z.filter(function(a){var d=Object.keys(x).map(function(a){return parseInt(a)});return!c.inArray(a,b)&&!c.inArray(a,d)});return angular.isArray(a)&&angular.isArray(b)?(e=d(f,e),e=d(b,e)):e}function m(a){var b=a.split(""),d=!0;if(w.length>0){for(var e=[],f=Object.keys(x),h=0;h<f.length;h++){var i=x[f[h]];e.push(i)}0===y.length&&c.lazyProduct(e,function(){y.push(Array.prototype.slice.call(arguments))});for(var h=y.length-1;h>=0;h--){var j=angular.copy(b);j=l(j,y[h]);var k=j.join(""),m=g(t.length-1);if(m.test(k)){d=!1,b=j;break}}}return d&&(b=l(b,z)),b.join("")}function n(){return s}function o(a){try{var b=k(a),c=m(b);return{withDivisors:function(a){return a?c.substr(0,u):c},withoutDivisors:function(a){return a?b.substr(0,v):b}}}catch(d){throw d}}function p(a,b){var c=[];if(!a)return 0;for(var d=0;d<a.length;d++){var e=g(d),f=a.substr(0,d+1);if(e&&!e.test(f)&&(c.push(d),b))break}return c}function q(a){return p(a,!0)[0]}function r(a){var b=p(a,!1),c=a;for(var d in b){var e=b[d],f=a.split("");f.splice(e,1),c=f.join("")}return o(c)}var s,t,u=0,v=0,w=[],x={},y=[],z=[],A={},B=[],C={9:/[0-9]/,8:/[0-8]/,7:/[0-7]/,6:/[0-6]/,5:/[0-5]/,4:/[0-4]/,3:/[0-3]/,2:/[0-2]/,1:/[0-1]/,0:/[0]/,"*":/./,w:/\w/,W:/\W/,d:/\d/,D:/\D/,s:/\s/,S:/\S/,b:/\b/,A:/[A-Z]/,a:/[a-z]/,Z:/[A-ZÇÀÁÂÃÈÉÊẼÌÍÎĨÒÓÔÕÙÚÛŨ]/,z:/[a-zçáàãâéèêẽíìĩîóòôõúùũüû]/,"@":/[a-zA-Z]/,"#":/[a-zA-ZçáàãâéèêẽíìĩîóòôõúùũüûÇÀÁÂÃÈÉÊẼÌÍÎĨÒÓÔÕÙÚÛŨ]/,"%":/[0-9a-zA-ZçáàãâéèêẽíìĩîóòôõúùũüûÇÀÁÂÃÈÉÊẼÌÍÎĨÒÓÔÕÙÚÛŨ]/};return{getViewValue:o,generateRegex:f,getRegex:g,getOptions:n,removeDivisors:k,getFirstWrongPosition:q,removeWrongPositions:r}}return{create:d}}]);
        angular.module("ngMask").factory("OptionalService",[function(){function a(a){var c=[];try{for(var d=/\?/g,e=[];null!=(e=d.exec(a));)c.push(e.index-1)}catch(f){throw f}return{fromMask:function(){return c},fromMaskWithoutOptionals:function(){return b(c)}}}function b(a){for(var b=[],c=0;c<a.length;c++)b.push(a[c]-c);return b}function c(a){var b;try{b=a.replace(/\?/g,"")}catch(c){throw c}return b}return{removeOptionals:c,getOptionals:a}}]);
        angular.module("ngMask").factory("UtilService",[function(){function a(a,b,c){function d(h){var i=a[h],j=g[h];if(h===f)for(var k=0;j>k;++k)e[h]=i[k],b.apply(c,e);else for(var k=0;j>k;++k)e[h]=i[k],d(h+1);e.pop()}c||(c=this);for(var e=[],f=a.length-1,g=[],h=a.length;h--;)g[h]=a[h].length;d(0)}function b(a,b){var c;try{c=b.indexOf(a)>-1}catch(d){throw d}return c}function c(a){for(var b={},c=[],d=0,e=a.length;e>d;++d)b.hasOwnProperty(a[d])||(c.push(a[d]),b[a[d]]=1);return c}return{lazyProduct:a,inArray:b,uniqueArray:c}}])
        }());
}());