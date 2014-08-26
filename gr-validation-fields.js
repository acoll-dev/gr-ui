angular.module('grValidation.provider').factory('$grValidation.fields', ['$injector', '$timeout', '$compile', function ($injector, $timeout, $compile) {
    return {
        "checkbox": {
            template: 'checkbox',
            type: 'input',
            set: {
                attrs: function(form, field){
                    field.default.value = field.default.checked;
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'ng-checked': field.default.checked,
                            'ng-model': field.$modelName(field.name),
                            'ng-true-value': true,
                            'ng-false-value': false
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                }
            },
            reset: function(form, field){
                $compile(
                    field.input.attr('ng-checked', field.default.checked)
                )(field.scope);
            }
        },
        "color": {
            template: 'color',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "datetime": {
            template: 'datetime',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "date": {
            template: 'date',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "email": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "file": {
            template: 'file',
            type: 'input',
            set: {
                attrs: function(form, field){
                    var clean_text = "Select a file(s)",
                        html = "";
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'multiple': field.default.multiple,
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                    var display = field.element.find('.view-file-name');
                    if(!field.default.multiple){
                        html += '<div class="view-file-label">{{field.file.name || ("'+clean_text+'" | translate)}}</div><div class="view-file-size">{{field.file.size ? field.file.size + "KB" : ""}}</div>';
                    }else{
                        html += '<ul class="view-file-list" ng-if="field.file[0]">';
                            html += '<li ng-repeat="file in field.file">';
                                html += '<div class="view-file-label">';
                                    html += '{{file.name || ("'+clean_text+'" | translate)}}';
                                html += '</div>';
                                html += '<div class="view-file-size">';
                                    html += '{{file.size ? file.size + "KB" : ""}}';
                                html += '</div>';
                            html += '</li>';
                        html += '</ul>';
                        html += '<div class="view-file-label" ng-if="!field.file[0]">{{"'+clean_text+'" | translate}}</div>';
                    }
                    $compile(
                        display.html(html)
                    )(field.scope);
                    display.on({
                        click: function(){
                            var el = display.siblings('input');
                            el.click();
                        }
                    });
                },
                scope: function(form, field){
                    field.input.bind({
                        change: function(e){
                            var files = e.target.files;
                            var file = files[0];
                            field.scope.file = file ? file.name : undefined;
                            field.scope.$apply();
                            field.scope['field'].file = files;
                        }
                    });
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'value': field.value,
                        'file': {},
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
                field.scope['field'].file = {};
            }
        },
        "month": {
            template: 'month',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "number": {
            template: 'number',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "password": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "radio": {
            template: 'radio',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $timeout(function(){
                        var input = field.element.find('input'),
                            radios = [],
                            hasChecked = false,
                            checkedValue = '',
                            elements = field.innerElements;
                        field.input = input;
                        angular.forEach(elements, function(field){
                            var checked = field.hasOwnProperty('gr-checked') ? true : false;
                            if(checked){
                                hasChecked = true;
                                checkedValue = field['gr-value'];
                            }
                            radios.push({
                                value: field['gr-value'],
                                checked: checked
                            });
                        });
                        if(hasChecked){
                            field.default.checked = true;
                            field.default.value = checkedValue;
                        }
                        angular.forEach(field.input, function(input, id){
                            input = angular.element(input);
                            $compile(
                                input.attr({
                                    'name': field.name,
                                    'type': field.type,
                                    'gr-validator': field.validate,
                                    'ng-value': radios[id].value,
                                    'ng-model': field.$modelName(field.name),
                                    'ng-checked': radios[id].checked
                                })
                            )(field.scope);
                        });
                    }, 100);
                },
                scope: function(form, field){
                    var radios = [],
                        elements = field.innerElements;
                    angular.forEach(elements, function(field){
                        radios.push({
                            label: field['gr-label']
                        });
                    });
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'radios': radios,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                var elements = field.innerElements;
                angular.forEach(field.input, function(input, id){
                    input = angular.element(input);
                    if(elements[id].hasOwnProperty('gr-checked')){
                        input.attr('ng-checked', true);
                    }else{
                        input.attr('ng-checked', false);
                    }
                });
                $compile(field.input)(field.scope);
            }
        },
        "range": {
            template: 'range',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "search": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "select": {
            template: 'select',
            type: 'select',
            set: {
                attrs: function(form, field){
                    $timeout(function(){
                        var input = field.element.find('select'),
                            options = [angular.element('<option value="">'+field.label+'</option>')],
                            elements = field.innerElements,
                            hasSelected = false;
                        field.input = input;
                        angular.forEach(elements, function(option){
                            if(option.hasOwnProperty('gr-selected')){
                                hasSelected = true;
                            }
                            options.push(angular.element('<option>'+option['gr-label']+'</option>'));
                        });
                        if(!hasSelected){
                            $compile(
                                options[0].attr({
                                    'ng-selected': true,
                                    'ng-disabled':true
                                })
                            )(field.scope);
                        }else{
                            $compile(
                                options[0].attr({
                                    'ng-selected': false,
                                    'ng-disabled':true
                                })
                            )(field.scope);
                        }
                        angular.forEach(options, function(option, id){
                            var option = angular.element(option);
                            if(id > 0){
                                $compile(
                                    option.attr({
                                        'ng-value': elements[id-1]['gr-value'],
                                        'ng-disabled': elements[id-1].hasOwnProperty('gr-disabled') ? true : false,
                                        'ng-selected': elements[id-1].hasOwnProperty('gr-selected') ? true : false
                                    })
                                )(field.scope);
                            }else{
                                $compile(option)(field.scope);
                            }
                        });
                        $compile(
                            field.input.append(options).attr({
                                'name': field.name,
                                'gr-validator': field.validate,
                                'ng-model': field.$modelName(field.name)
                            })
                        )(field.scope);
                    }, 100);
                },
                scope: function(form, field){
                    var options = [],
                        elements,
                        hasSelected = false,
                        selectedValue = '';
                    elements = field.innerElements;
                    angular.forEach(elements, function(option){
                        if(option.hasOwnProperty('gr-selected')){
                            hasSelected = true;
                            selectedValue = option['gr-value'];
                        }
                        options.push({
                            label: option['gr-label']
                        });
                    });
                    field.default.value = selectedValue;
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'options': options,
                        'hasSelected': hasSelected,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                var elements = field.innerElements,
                    options = field.input.children('option');
                if(options.length > 1){
                    angular.forEach(options, function(option, id){
                        option = angular.element(option);
                        if(id < elements.length && id > 0 && elements[id-1].hasOwnProperty('gr-selected')){
                            $compile(
                                option.attr('ng-selected', true)
                            )(field.scope);
                        }else{
                            $compile(
                                option.attr('ng-selected', false)
                            )(field.scope);
                        }
                    });
                }else{
                    $compile(
                        options.eq(0).attr('ng-selected', true)
                    )(field.scope);
                }
            }
        },
        "tel": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "textarea": {
            template: 'textarea',
            type: 'textarea',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "text": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "time": {
            template: 'time',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "url": {
            template: 'url',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        },
        "week": {
            template: 'week',
            type: 'input',
            set: {
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                field.input.val('');
            }
        }
    };
}]);
