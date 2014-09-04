angular.module('grValidation.provider').factory('$grValidation.fields', ['$injector', '$timeout', '$compile', function ($injector, $timeout, $compile) {
    var allFields = {
        "checkbox": {
            template: 'checkbox',
            type: 'input',
            set: {
                data: function(data, field){
                    if(typeof data === 'string'){
                        field.value = (data === 'true' || data === true || data === '1' || data === 1) ? true : false;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                        $compile(
                            field.input.attr({
                                'ng-checked': field.value
                            })
                        )(field.scope);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.checked = (data === 'true' || data === true || data === '1' || data === 1) ? true : false;
                    }
                },
                attrs: function(form, field){
                    field.default.value = field.default.checked;
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
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
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
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
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'multiple': field.default.multiple,
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                    var display = field.element.find('.view-file-name');
                    if(!field.default.multiple){
                        html += '<div class="view-file-label">{{field.file.name || __("'+clean_text+'")}}</div><div class="view-file-size">{{field.file.size ? field.file.size + "KB" : ""}}</div>';
                    }else{
                        html += '<ul class="view-file-list" ng-if="field.file[0]">';
                            html += '<li ng-repeat="file in field.file">';
                                html += '<div class="view-file-label">';
                                    html += '{{file.name || __("'+clean_text+'")}}';
                                html += '</div>';
                                html += '<div class="view-file-size">';
                                    html += '{{file.size ? file.size + "KB" : ""}}';
                                html += '</div>';
                            html += '</li>';
                        html += '</ul>';
                        html += '<div class="view-file-label" ng-if="!field.file[0]">{{__("'+clean_text+'")}}</div>';
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

                    // Buscar documentação em https://github.com/millerbarros/angular-file-upload

                    var onFileSelect = function($files) {
                        //$files: an array of files selected, each file has name, size, and type.
                        for (var i = 0; i < $files.length; i++) {
                            var file = $files[i];
                            $scope.upload = $upload.upload({
                                url: 'server/upload/url', //upload.php script, node.js route, or servlet url
                                //method: 'POST' or 'PUT',
                                //headers: {'header-key': 'header-value'},
                                //withCredentials: true,
                                data: {myObj: $scope.myModelObj},
                                file: file, // or list of files ($files) for html5 only
                                //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                                // customize file formData name ('Content-Disposition'), server side file variable name.
                                //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
                                // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
                                //formDataAppender: function(formData, key, val){}
                            }).progress(function(evt) {
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            }).success(function(data, status, headers, config) {
                                // file is uploaded successfully
                                console.log(data);
                            });
                            //.error(...)
                            //.then(success, error, progress);
                            // access or attach event listeners to the underlying XMLHttpRequest.
                            //.xhr(function(xhr){xhr.upload.addEventListener(...)})
                        }
                        /* alternative way of uploading, send the file binary with the file's content-type.
                        Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
                        It could also be used to monitor the progress of a normal http post/put request with large data*/
                        // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
                    };
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
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
                        'value': field.value,
                        'file': {},
                        'onFileSelect': onFileSelect,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                    if(typeof data !== 'object'){
                        angular.forEach(field.innerElements, function(element, id){
                            if(field.innerElements[id]['gr-value'] === data){
                                field.innerElements[id]['gr-checked'] = true;
                            }else{
                                field.innerElements[id]['gr-checked'] = false;
                            };
                        });
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
                        field.value = data;
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'object'){
                        field.default.innerElements = [];
                        var value = '';
                        angular.forEach(data, function(d){
                            var checked = (d.checked === 'true' || d.checked === true || d.checked === '1' || d.checked === 1) ? true : false;
                            field.default.innerElements.push({
                                'gr-label': d.label,
                                'gr-value': d.value,
                                'gr-checked': checked
                            });
                            if(checked){
                                value = d.value;
                            }
                        });
                        field.default.value = value;
                    }else if(typeof data === 'string'){
                        angular.forEach(field.innerElements, function(element, id){
                            if(field.innerElements[id]['gr-value'] === data){
                                field.innerElements[id]['gr-checked'] = true;
                            }else{
                                field.innerElements[id]['gr-checked'] = false;
                            };
                        });
                        field.default.value = data;
                    }
                    field.innerElements = field.default.innerElements;
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
                                        html += 'type="' + field.attrs.type + '" ';
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
                        'label': field.attrs.label
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                var elements = field.default.innerElements;
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                    console.debug(data);
                    if(typeof data !== 'object'){
                        angular.forEach(field.innerElements, function(element, id){
                            if(field.innerElements[id]['gr-value'] === data){
                                field.innerElements[id]['gr-selected'] = true;
                            }else{
                                field.innerElements[id]['gr-selected'] = false;
                            };
                        });
                        var elements = field.innerElements,
                            hasSelected = false,
                            value = '';
                        angular.forEach(field.input.children('option'), function(input, id){
                            input = angular.element(input);
                            if(id > 0){
                                var selected = elements[id-1].hasOwnProperty('gr-selected') ? (elements[id-1]['gr-selected'] === true ? true : false) : false;
                                if(selected){
                                    input.attr('selected', true);
                                    hasSelected = true;
                                    value = input.val();
                                }else{
                                    input.attr('selected', false);
                                }
                            }
                        });
                        if(!hasSelected){
                            field.input.children('option').eq(0).attr('selected', true);
                            value = '';
                        }
                        field.value = value;
                    }
                },
                defaultData: function(data, field){
                    var value = '';
                    if(typeof data === 'object'){
                        field.default.innerElements = [];
                        angular.forEach(data, function(d){
                            var selected = (d.selected === 'true' || d.selected === true || d.selected === '1' || d.selected === 1) ? true : false,
                                disabled = (d.disabled === 'true' || d.disabled === true || d.disabled === '1' || d.disabled === 1) ? true : false;
                            field.default.innerElements.push({
                                'gr-label': d.label,
                                'gr-value': d.value,
                                'gr-selected': selected,
                                'gr-disabled': disabled
                            });
                            if(selected){
                                value = d.value;
                            }
                        });
                    }else if(typeof data === 'string'){
                        angular.forEach(field.default.innerElements, function(element, id){
                            if(field.default.innerElements[id]['gr-value'] === data){
                                field.default.innerElements[id]['gr-selected'] = true;
                                value = data;
                            }else{
                                field.default.innerElements[id]['gr-selected'] = false;
                            };
                        });
                    }else{
                        angular.forEach(field.default.innerElements, function(element, id){
                            if(field.default.innerElements[id]['gr-selected'] === true){
                                value = field.default.innerElements[id]['gr-value'];
                            }else{
                                field.default.innerElements[id]['gr-selected'] = false;
                            };
                        });
                    }
                    field.default.value = value;
                    field.innerElements = field.default.innerElements;
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
                    var html = '<option value="" ng-selected="' + (!hasSelected ? true : false) + '" disabled>' + field.attrs.label + '</option>';
                    field.input = input;
                    $compile(
                        field.input.prepend(html).attr({
                            'name': field.name,
                            'gr-validator': field.validate,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    var options = [],
                        elements,
                        hasSelected = false,
                        selectedValue = '';
                    elements = field.innerElements;
                    angular.forEach(elements, function(option){
                        var selected = option.hasOwnProperty('gr-selected') ? (option['gr-selected'] === true ? true : false) : false;
                        if(selected){
                            hasSelected = true;
                            selectedValue = option['gr-value'];
                        }
                        options.push({
                            label: option['gr-label']
                        });
                    });
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
                        'options': options,
                        'hasSelected': hasSelected,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.default.value;
                }
            },
            reset: function(form, field){
                var elements = field.default.innerElements,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                        field.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
                        'showLabel': (form.labelType === 'inline')
                    };
                    field.scope[field.name] = field.value;
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
                        field.value = data;
                        field.model.$setViewValue(field.value);
                        field.input.val(field.value);
                    }
                },
                defaultData: function(data, field){
                    if(typeof data === 'string'){
                        field.default.value = data;
                    }
                },
                attrs: function(form, field){
                    $compile(
                        field.input.attr({
                            'name': field.name,
                            'type': field.attrs.type,
                            'gr-validator': field.validate,
                            'gr-mask-pattern': '{{field.attrs.mask}}',
                            'placeholder': form.labelType === 'placeholder' ? field.attrs.label : '',
                            'maxlength': field.rules['maxlength'] ? field.rules['maxlength'] : '',
                            'gr-value': field.default.value,
                            'ng-model': field.$modelName(field.name)
                        })
                    )(field.scope);
                },
                scope: function(form, field){
                    field.scope['field'] = {
                        'type': field.attrs.type,
                        'label': field.attrs.label,
                        'icon': field.attrs.icon,
                        'mask': field.attrs.mask,
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
    return allFields;
}]);
