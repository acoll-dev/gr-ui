angular.module('grValidation.provider').factory('$grValidation.fields', ['$injector', function ($injector) {
    return {
        "text": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "email": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "password": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "search": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "tel": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "url": {
            template: 'text',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "color": {
            template: 'color',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "url": {
            template: 'url',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "date": {
            template: 'date',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "datetime": {
            template: 'datetime',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "datetime-local": {
            template: 'datetime-local',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "time": {
            template: 'time',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "month": {
            template: 'month',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "week": {
            template: 'week',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "number": {
            template: 'number',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "range": {
            template: 'range',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "checkbox": {
            template: 'checkbox',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'checked': field.startValue ? true : false,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "radio": {
            template: 'radio',
            type: 'input',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'type': field.type,
                    'gr-validator': field.validate,
                    'checked': field.startValue ? true : false,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "textarea": {
            template: 'textarea',
            type: 'textarea',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'gr-validator': field.validate,
                    'gr-mask-pattern': '{{field.mask}}',
                    'placeholder': form.labelType === 'placeholder' ? field.label : '',
                    'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
        "select": {
            template: 'select',
            type: 'select',
            set: {
                attrs: function(form, field){
                return {
                    'name': field.name,
                    'gr-validator': field.validate,
                    'gr-value': field.startValue,
                    'ng-model': field.$modelName(field.name)
                }
            },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.type,
                        'label': field.label,
                        'icon': field.icon,
                        'mask': field.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.startValue;
                }
            }
        },
    };
}]);