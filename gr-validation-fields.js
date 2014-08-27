angular.module('grValidation.provider').factory('$grValidation.fields', ['$injector', '$timeout', '$compile', function ($injector, $timeout, $compile) {
    return {
        "checkbox": {
            template: 'checkbox',
            type: 'input',
            set: {
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.checked = (data === 'true' || data === true || data === '1' || data === 1) ? true : false;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'object'){
                        field.innerElements = [];
                        angular.forEach(data, function(d){
                            field.innerElements.push({
                                'gr-label': d.label,
                                'gr-value': d.value,
                                'gr-checked': (d.checked === 'true' || d.checked === true || d.checked === '1' || d.checked === 1) ? true : false
                            });
                        });
                    }else{
                        angular.forEach(field.innerElements, function(element, id){
                            if(field.innerElements[id]['gr-value'] === data){
                                field.innerElements[id]['gr-checked'] = true;
                            }else{
                                field.innerElements[id]['gr-checked'] = false;
                            };
                        });
                    }
                },
                attrs: function(form, field){
                    $timeout(function(){
                        var radios = [],
                            list = field.element.find('.gr-form-list'),
                            hasChecked = false,
                            checkedValue = '',
                            elements = field.innerElements;
                        angular.forEach(elements, function(f, id){
                            var checked = f.hasOwnProperty('gr-checked') ? (f['gr-checked'] === true ? true : false) : false;
                            if(checked){
                                hasChecked = true;
                                checkedValue = f['gr-value'];
                            }
                            var html = '';
                            html += '<div class="radio gr-form-list-item">';
                                html += '<label>';
                                    html += '<input ';
                                        html += 'type="' + field.type + '" ';
                                        html += 'name="' + field.name + '" ';
                                        html += 'gr-validator="' + field.validate + '" ';
                                        html += 'ng-model="' + field.$modelName(field.name) + '" ';
                                        html += 'checked="' + checked + '" ';
                                        html += 'value="' + elements[id]['gr-value'] + '" ';
                                    html += '/>';
                                    html += f['gr-label'];
                                html += '</label>';
                            html += '</div>';
                            $compile(list.append(angular.element(html)))(field.scope);
                        });
                        field.input = list.find('input[type="radio"]');
                        if(hasChecked){
                            field.default.checked = true;
                            field.default.value = checkedValue;
                        }
                    }, 100);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'label': field.label
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                var elements = field.innerElements;
                angular.forEach(field.input, function(input, id){
                    input = angular.element(input);
                    var checked = elements[id].hasOwnProperty('gr-checked') ? (elements[id]['gr-checked'] === true ? true : false) : false;
                    if(checked){
                        input.attr('checked', true);
                    }else{
                        input.attr('checked', false);
                    }
                });
                $compile(field.input)(field.scope);
            }
        },
        "range": {
            template: 'range',
            type: 'input',
            set: {
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'object'){
                        field.innerElements = [];
                        angular.forEach(data, function(d){
                            field.innerElements.push({
                                'gr-label': d.label,
                                'gr-value': d.value,
                                'gr-selected': (d.selected === 'true' || d.selected === true || d.selected === '1' || d.selected === 1) ? true : false,
                                'gr-disabled': (d.disabled === 'true' || d.disabled === true || d.disabled === '1' || d.disabled === 1) ? true : false
                            });
                        });
                    }else{
                        angular.forEach(field.innerElements, function(element, id){
                            if(field.innerElements[id]['gr-value'] === data){
                                field.innerElements[id]['gr-selected'] = true;
                            }else{
                                field.innerElements[id]['gr-selected'] = false;
                            };
                        });
                    }
                },
                attrs: function(form, field){
                    var input = field.element.find('select'),
                        elements = field.innerElements,
                        hasSelected = false;
                    angular.forEach(elements, function(option, id){
                        var selected = option.hasOwnProperty('gr-selected') ? (option['gr-selected'] === true ? true : false) : false;
                        if(selected){
                            hasSelected = true;
                        }
                        var html = '';
                        html += '<option ';
                            html += 'value="' + option['gr-value'] + '" ';
                            html += 'ng-selected="' + selected + '" ';
                            html += (option.hasOwnProperty('gr-disabled') ? (option['gr-disabled'] === true ? 'disabled' : '') : '') + '>';
                            html += option['gr-label'];
                        html += '</option>';
                        $compile(input.append(angular.element(html)))(field.scope);
                    });
                    var html = '<option value="" ng-selected="' + (!hasSelected ? true : false) + '" disabled>' + field.label + '</option>';
                    $compile(
                        field.input.prepend(html).attr({
                            'name': field.name,
                            'gr-validator': field.validate,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                    field.input = input;
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
                    hasSelected = false;
                angular.forEach(field.input.children('option'), function(input, id){
                    input = angular.element(input);
                    if(id > 0){
                        var selected = elements[id-1].hasOwnProperty('gr-selected') ? (elements[id-1]['gr-selected'] === true ? true : false) : false;
                        if(selected){
                            input.attr('selected', true);
                            hasSelected = true;
                        }else{
                            input.attr('selected', false);
                        }
                    }
                });
                if(!hasSelected){
                    field.input.children('option').eq(0).attr('selected', true);
                }
                $compile(field.input)(field.scope);
            }
        },
        "tel": {
            template: 'text',
            type: 'input',
            set: {
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                field.input.val(field.default.value);
            }
        },
        "text": {
            template: 'text',
            type: 'input',
            set: {
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                field.input.val(field.default.value);
            }
        },
        "time": {
            template: 'time',
            type: 'input',
            set: {
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
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
