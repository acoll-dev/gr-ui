'use strict';
(function(){
    angular.module('gr.ui.autofields.core', ['autofields', 'gr.ui.alert', 'textAngular'])
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
                            $element.prepend($input).removeAttr('gr-autofields').attr({
                                'novalidate': true,
                                'ng-submit': $attrs.name + '.submit()'
                            });
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
}());
(function(){
    angular.module('gr.ui.autofields.bootstrap', ['autofields.standard','ui.bootstrap'])
        .config(['$autofieldsProvider', function($autofieldsProvider){
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
}());
(function(){
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
    angular.module('gr.ui.autofields',['gr.ui.autofields.core', 'gr.ui.autofields.bootstrap','gr.ui.autofields.bootstrap.validation']);
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
                    CamelToTitle: function (str){
                        return str
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, function (str){ return str.toUpperCase(); });
                    },
                    CamelToDash: function (str){
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
                        return function ($scope, $element, $attr){
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
                                        if (obj !== dst){
                                            angular.forEach(obj, function(value, key){
                                                if (dst[key] && dst[key].constructor && dst[key].constructor === Object){
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
                            $scope.$watch(directive.optionsStr, function (newOptions, oldOptions){
                                helper.extendDeep(directive.options, newOptions);
                                if(newOptions !== oldOptions) build();
                            }, true);
                            $scope.$watch(directive.schemaStr, function (schema){
                                build(schema);
                            }, true);
                            $scope.$watch(directive.formStr, function (form){
                                directive.container.attr('name',directive.formStr);
                            });
                            $scope.$watch(function(){return $attr['class'];}, function (form){
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
                    link: function (scope, element, attr, ngModel){
                        var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.\-\?\=\&]*)$/i;

                        //Render formatters on blur...
                        var render = function(){
                            var viewValue = ngModel.$modelValue;
                            if (viewValue == null) return;
                            angular.forEach(ngModel.$formatters, function (formatter){
                                viewValue = formatter(viewValue);
                            })
                            ngModel.$viewValue = viewValue;
                            ngModel.$render();
                        };
                        element.bind('blur', render);

                        var formatUrl = function (value){
                            var test = urlRegex.test(value);
                            if (test){
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
            }]);
    }());
    (function(){
        angular.module('autofields.validation', ['autofields.core'])
            .config(['$autofieldsProvider', function($autofieldsProvider){
                var helper = {
                    CamelToTitle: function (str){
                        return str
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, function (str){ return str.toUpperCase(); });
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
}());