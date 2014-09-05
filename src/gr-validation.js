angular.module('grValidation', ['grValidation.provider', 'grValidation.directive']);
angular.module('grValidation.provider', ['grScriptbind'])
    .provider('$grValidation', function () {
        var checkValid,
            formChange,
            formId = 1,
            getExternalConfig,
            inputId = 1,
            instance = {
                compile: {},
                injector: {},
                scriptbind: {},
                filter: {},
                http: {},
                scope: {},
                timeout: {},
                window: {}
            },
            setup,
            tools,
            validator,
            _this = this,
            $grValidation = {
                config : {},
                fields: {},
                masks: {},
                rules: {}
            };

        validator = {
            'config': {
                'form': [],
                'file':{
                    'mask': {},
                    'message': {},
                    'template': {},
                    '$mask': {
                        url: '',
                        config: {},
                        set: function (masks) {
                            angular.forEach(masks, function (m, id) {
                                validator.config.file.mask[id] = m;
                            });
                        }
                    },
                    '$message': {
                        url: '',
                        set: function (messages) {
                            validator.config.file.message = messages;
                        }
                    },
                    '$template': {
                        path: '',
                        extension: '',
                        set: function () {
                            angular.forEach(validator.field, function (field, id) {
                                validator.config.file.template[id] = validator.config.file.$template.path + '/' + field.template + validator.config.file.$template.extension;
                            });
                            validator.config.file.template['form'] = validator.config.file.$template.path + '/form' + validator.config.file.$template.extension;
                            validator.config.file.template['alert'] = validator.config.file.$template.path + '/alert' + validator.config.file.$template.extension;
                        },
                        get: function (tpl, field) {
                            if(!field){
                                if (!tpl) {
                                    return validator.config.file.template;
                                } else {
                                    return validator.config.file.template[tpl];
                                }
                            }else{
                                return validator.config.file.template[validator.field[tpl].template];
                            }
                        }
                    }
                },
                $form: {
                    'set': function(forms){
                        angular.forEach(forms, function(f, i){
                            validator.config.form[i] = f;
                            validator.config.form.length ++;
                        });
                    }
                }
            },
            'default': {
                method: 'onSubmit',
                labelType: 'placeholder',
                validate: true
            },
            'form': {},
            'field': {},
            'rules': {
                0: {
                    name: 'required',
                    type: 'boolean',
                    rule: function (value, delimiter, fields, field) {
                        return (value !== '' && value !== null && value !== undefined && value !== 'undefined' && value !== 'on' && value);
                    }
                }
            },
            'translator': {
                'enable': false,
                'module': ''
            },
            '$destroy': function (form) {
                if(form !== 'all'){
                    if(validator.form[form]){
                        delete validator.form[form];
                        return;
                    }else{
                        return;
                    }
                }else{
                    validator.form = {};
                }
            },
            '$field':{
                set: function(fields){
                    if(fields){
                        angular.forEach(fields, function(field, id){
                            validator.field[id] = field;
                        });
                    }else{
                        console.error("Fields configuration file not found.");
                    }
                }
            },
            '$get': function (form) {
                if (form && String(typeof form) === 'string' && form !== 'external') {
                    var form = validator.form[form];
                    if (form) {
                        return {
                            'grForm': form.grForm,
                            'id': form.id,
                            'name': form.name,
                            'reset': form.$reset,
                            'submit': form.$validate,
                            'translate': form.translate,
                            '$add': form.$add,
                            '$change': form.$change,
                            '$message': {
                                'get': form.$message.get,
                                'show': form.$message.show
                            }
                        }
                    }
                } else if (form === 'external'){
                    var forms = {};
                    angular.forEach(validator.form, function(form, id){
                        forms[id] = form.$get();
                    })
                    return forms;
                } else {
                    return;
                }
            },
            '$new': function (form) {
                if(!validator.form[form.name]){
                    form = {
                        'data': {},
                        'dependence': [],
                        'element': form.element,
                        'error': {},
                        'field': {},
                        'grForm': true,
                        'id': formId,
                        'labelType': (form.labelType !== '' && form.labelType !== undefined) ? form.labelType : validator.default['labelType'],
                        'method': (form.method !== '' && form.method !== undefined) ? form.method : validator.default['method'],
                        'model': form.model,
                        'name': form.name,
                        'scope': form.scope,
                        'translate': true,
                        'validated': false,
                        'validate': (form.validate !== '' && form.validate !== undefined) ? (form.validate !== 'false' && form.validate !== false) : validator.default['validate'],
                        'valid': false,
                        '$add': function (field) {
                            if(!form.field[field.name]){
                                if (validator.form[field.form]) {
                                    field = {
                                        'attrs': {
                                            'icon': field.attrs.icon,
                                            'label': tools.translate(form, field.attrs.label),
                                            'mask': field.attrs.mask,
                                            'type': field.attrs.type,
                                            'dataSource': field.attrs.dataSource
                                        },
                                        'changed': false,
                                        'default': {
                                            'value': field.value,
                                            'checked': field.checked,
                                            'multiple': field.multiple,
                                            'innerElements': field.innerElements
                                        },
                                        'element': field.element,
                                        'error': '',
                                        'error_messages': tools.rules.parse(form, field.name, field.validate),
                                        'form': field.form,
                                        'id': inputId,
                                        'innerElements': field.innerElements,
                                        'input': angular.element(field.element).find(validator.field[field.attrs.type].type),
                                        'model': [],
                                        'name': field.name,
                                        'rules': tools.rules.split(field.validate),
                                        'requiredBy': [],
                                        'scope': field.scope,
                                        'state': '',
                                        'validate': field.validate ? true : false,
                                        'valid': true,
                                        'value': '',
                                        '$change': function (change) {
                                            if(change){
                                                if(field.model.length === 0){
                                                    field.model = change.model;
                                                }
                                                field.value = (change.value !== undefined && change.value !== '') ? (change.submiting ? field.value : change.value) : ((field.default.value !== undefined && field.default.value !== '') ? field.default.value : '');
                                                field.model.$setViewValue(field.value);
                                            }
                                            var value = field.value,
                                                model = field.model;
                                            if (form.validate) {
                                                if (form.method === 'onSubmit' && !form.validated) {
                                                    instance.timeout(function () {
                                                        instance.window.trigger('resize');
                                                    });
                                                    return;
                                                } else if (form.method === 'onChange' && !field.changed && !form.validated) {
                                                    instance.timeout(function () {
                                                        instance.window.trigger('resize');
                                                    });
                                                    field.changed = true;
                                                    return;
                                                } else {
                                                    field.$check(value, model);
                                                }
                                            };
                                            instance.timeout(function () {
                                                instance.window.trigger('resize');
                                            });
                                        },
                                        '$check': function (value, model) {
                                            var error = 0;
                                            if(field.validate){
                                                angular.forEach(validator.rules, function (r) {
                                                    if (field.rules[r.name] && error === 0) {
                                                        if (!r.rule(value, field.rules[r.name], form.field, field)) {
                                                            form.$error.set({
                                                                id: field.id,
                                                                message: field.error_messages[r.name]
                                                            });
                                                            error++;
                                                        } else {
                                                            form.$error.unset(field.id);
                                                        }
                                                        form.$message.change('danger', 'form');
                                                        form.$change();
                                                    }
                                                });
                                                if (error === 0) {
                                                    field.$state.set('success');
                                                    field.valid = true;
                                                    model.$setValidity(field.name, true);
                                                } else {
                                                    field.$state.set('error');
                                                    field.valid = false;
                                                    model.$setValidity(field.name, false);
                                                }
                                            }else{
                                                form.$change();
                                                field.valid = true;
                                                model.$setValidity(field.name, true);
                                            }
                                        },
                                        '$config' : function () {
                                            field.$mask.set();
                                            if(field.rules.hasOwnProperty('equalTo')){
                                                validator.form[field.form].field[field.rules.equalTo].requiredBy.push(field.name);
                                            }
                                            validator.form[field.form].field[field.name] = field;
                                            inputId++;
                                        },
                                        '$data': {
                                            set: function(data){
                                                var setData = function(){
                                                    if(!data){
                                                        //if(typeof form.data[field.name] !== 'undefined') {
                                                            validator.field[field.attrs.type].set.defaultData(form.data[field.name], field);
                                                        //}
                                                        validator.field[field.attrs.type].set.attrs(form, field);
                                                        validator.field[field.attrs.type].set.scope(form, field);
                                                    }else{
                                                        validator.field[field.attrs.type].set.data(data, field);
                                                    }
                                                }
                                                if(field.attrs.dataSource){
                                                    instance.http.get(field.attrs.dataSource).then(function(r){
                                                        validator.field[field.attrs.type].set.defaultData(r.data.response, field);
                                                        setData();
                                                    },function(){
                                                        setData();
                                                    });
                                                }else{
                                                    setData();
                                                }
                                            }
                                        },
                                        '$mask': {
                                            object: {},
                                            type: '',
                                            set: function(){
                                                if(field.attrs.mask){
                                                    if(validator.config.file.mask[field.attrs.mask]){
                                                        field.$mask.type = 'string';
                                                        field.attrs.mask = validator.config.file.mask[field.attrs.mask];
                                                    }else{
                                                        field.$mask.type = 'string';
                                                        field.attrs.mask = '';
                                                    }
                                                }
                                            }
                                        },
                                        '$modelName': function(name) {
                                            var path = /[a-zA-Z0-9]+/g,
                                                noPath = /[^a-zA-Z0-9]+/g,
                                                temp = [],
                                                hasInvalid = false;
                                            if(noPath.test(name)){
                                                    angular.forEach(name.split(''), function(chr, i){
                                                        if(chr.match(path)){
                                                            if(hasInvalid){
                                                                chr = chr.toUpperCase();
                                                                hasInvalid = false;
                                                            }
                                                            temp.push(chr);
                                                        }else{
                                                            hasInvalid = true;
                                                        }
                                                    });
                                                    return temp.join('');
                                            }else{
                                                return name;
                                            }
                                        },
                                        '$reset': function () {
                                            field.$state.set('');
                                            field.model.$setViewValue(field.default.value);
                                            validator.field[field.attrs.type].reset(form, field);
                                            field.$change({
                                                value: '',
                                                model: field.model
                                            });
                                        },
                                        '$state': {
                                            set: function(state){
                                                field.state = state;
                                                field.scope.state = state;
                                            }
                                        }
                                    };
                                }else{
                                    instance.timeout(function () {
                                        validator.$add(field);
                                    });
                                }
                                field.$config();
                                if(!form.$data.hasData){
                                    field.$data.set();
                                }
                            }else{
                                console.error("Not allowed to use two input fields with the same gr-name on the same form, '" + field.name + "' is already been used in '" + form.name + "' form.");
                                field.element.remove();
                            }
                        },
                        '$change': function (change) {
                            if(change){
                                form.field[change.field].$change(change);
                                if(form.field[change.field].requiredBy.length > 0){
                                    angular.forEach(form.field[change.field].requiredBy, function(f){
                                        form.field[f].$change();
                                    });
                                }
                            }else{
                                instance.scope.$broadcast('form' + form.name + 'change');
                            }
                        },
                        '$check': function () {
                            //if (form.model.$valid === undefined) {
                            if (form.valid === undefined) {
                                return false;
                            } else {
                                //return form.model.$valid === true;
                                return form.valid === true;
                            }
                        },
                        '$config': function(){
                            form.$scope();
                            form.model.$id = String(form.id);
                            form.model.$name = form.name;

                            var scriptbind = instance.scriptbind.get(),
                                sbCount = 0;

                            angular.forEach(scriptbind, function(){
                                sbCount ++;
                            });
                            if(sbCount > 0) {
                                var script = instance.scriptbind.get('grForm/form')[0][0][form.name];
                                if(angular.isFunction(script)){
                                    validator.config.form[form.name] = instance.scriptbind.get('grForm/form')[0][0][form.name];
                                }
                            }
                            if (validator.config.form.hasOwnProperty(form.name)){
                                var config = validator.config.form[form.name](form.scope);
                                if (config.hasOwnProperty('submit')) {
                                    form.$submit.set(config.submit);
                                }
                                if (config.hasOwnProperty('data-source')){
                                    var source = config['data-source'];
                                    form.$data.hasData = true;
                                    if(typeof source === 'string'){
                                        instance.http.get(source).then(
                                            function (data) {
                                                form.data = data.data.response;
                                                angular.forEach(form.field, function(field){
                                                    field.$data.set();
                                                });
                                            },
                                            function (e) {
                                                console.error(e);
                                            });
                                    }else if(typeof source === 'object'){
                                        form.data = source;
                                    }
                                }
                                if (config.hasOwnProperty('translate')) {
                                    if (typeof config.translate === 'boolean') {
                                        form.translate = config.translate;
                                    }
                                }
                                if (config.hasOwnProperty('inject')) {
                                    form.$dependece.set(config.inject);
                                }
                            }else{
                                console.error('Not found configuration of "' + form.name + '" form, so it is not possible to send or receive data.');
                            };
                            form.element.bind({
                                'submit': function (e) {
                                    e.preventDefault();
                                    form.$validate();
                                },
                                'reset': function (e) {
                                    e.preventDefault();
                                    form.$reset();
                                }
                            }).attr('novalidate', true);
                            validator.form[form.name] = form;
                            formId++;
                        },
                        '$data': {
                            'hasData': false,
                            'set': function(data){
                                validator.data = data;
                            }
                        },
                        '$dependece': {
                            set: function (dep) {
                                if (typeof dep === 'string'){
                                    form.dependence = config.inject;
                                }else{
                                    angular.forEach(dep, function (d) {
                                        form.dependence.push(d);
                                    });
                                }
                            }
                        },
                        '$error': {
                            set: function (error) {
                                form.error[error.id] = error.message;
                                form.valid = false;
                            },
                            unset: function (id) {
                                delete form.error[id];
                                var errorLength = 0;
                                angular.forEach(form.error, function(){
                                    errorLength++;
                                });
                                if(errorLength === 0){
                                    form.valid = true;
                                }else{
                                    form.valid = false;
                                }
                            }
                        },
                        '$get': function() {
                            return {
                                'data': function(obj){
                                    if(!obj){
                                        var data = {};
                                        angular.forEach(form.field, function(field){
                                            data[field.name] = field.value;
                                        });
                                        return data;
                                    }else if(typeof obj === 'object') {
                                        angular.forEach(obj, function(value, id){
                                            if(form.field[id]){
                                                form.field[id].$data.set(value);
                                            }
                                        });
                                    }
                                },
                                'grForm': form.grForm,
                                'reset': form.$reset,
                                'submit': form.$validate,
                                'translate': form.translate
                            }
                        },
                        '$message': {
                            type: '',
                            trigger: '',
                            text: {},
                            get: function () {
                                var message = {};
                                if(String(typeof form.$message.text) == 'object'){
                                    angular.forEach(form.$message.text, function(msg, id){
                                        message[id] = msg;
                                    });
                                }else{
                                    message = form.$message.text;
                                }
                                return {
                                    type: form.$message.type,
                                    trigger: form.$message.trigger,
                                    text: message
                                };
                            },
                            change: function (type, trigger, text) {
                                form.$message.type = type;
                                form.$message.trigger = trigger;
                                if (text && trigger !== 'form') {
                                    form.$message.text = text;
                                } else {
                                    form.$message.text = form.error;
                                }
                                form.$change();
                                instance.timeout(function () {
                                    instance.window.trigger('resize');
                                });
                            },
                            show: function (type, text) {
                                form.$message.change(type, 'show', tools.translate(form,text));
                            }
                        },
                        '$status': {
                            set: function (validate) {
                                if (String(typeof validate) === 'boolean') {
                                    form.validate = validate;
                                }
                            }
                        },
                        '$scope': function(){
                            form.scope['form'] = {
                                reset: form.$reset,
                                submit: form.$validate
                            }
                            form.scope['__'] = tools.translate;
                        },
                        '$submit': {
                            fn: '',
                            set: function (fn) {
                                form.$submit.fn = fn;
                            },
                            exec: function (data) {
                                var submit = form.$submit.fn;
                                if (String(typeof submit) === 'function') {
                                    submit(data);
                                } else {
                                    var injector,
                                        i = [],
                                        count = 0,
                                        fn;
                                    angular.forEach(submit, function (o) {
                                        if (typeof o === 'string') {
                                            injector = angular.injector(form.dependence);
                                            i.push(injector.get(o));
                                            count++;
                                        } else if (typeof o === 'function' && typeof fn !== 'function') {
                                            fn = o;
                                        }
                                    });
                                    i.push(data);
                                    i.push(validator.$get(form.name));
                                    fn.apply(null, i);
                                }
                            }
                        },
                        '$reset': function() {
                            form.validated = false;
                            form.valid = true;
                            angular.forEach(form.field, function(field){
                                field.$reset();
                            });
                            form.$message.type = '';
                            form.$message.trigger = '';
                            form.$message.text = {};
                            instance.scope.$broadcast('form' + form.name + 'change');
                        },
                        '$validate': function () {
                            if (form.validate) {
                                form.validated = true;
                                angular.forEach(form.field, function (field) {
                                    instance.scope.$broadcast(field.form + field.name + 'submit');
                                });
                                if (form.$check()) {
                                    var data = form.$get().data();
                                    form.$submit.exec(data);
                                    return;
                                } else {
                                    var input;
                                    angular.forEach(form.field, function (field) {
                                        if (!field.valid && !input) {
                                            input = field.input;
                                        }
                                    });
                                    input.focus();
                                    return;
                                }
                            } else {
                                form.$submit.exec(form.element.serializeArray());
                            }
                        }
                    };
                    form.$config();
                }else{
                    console.error("Not allowed to use two forms with a same name, '" + form.name + "' is already being used in another form.");
                    form.element.remove();
                }
            },
            '$rule': {
                set: function (rules) {
                    angular.forEach(rules, function (rule, key) {
                        if (String(typeof rule.rule) !== 'function') {
                            return;
                        } else {
                            var count = 0,
                                count_rules = 0;
                            angular.forEach(validator.rules, function (r, k) {
                                if (r.name === key) {
                                    validator.rules[k] = {
                                        name: key,
                                        type: rule.type,
                                        rule: rule.rule,
                                        parse: rule.parse ? rule.parse : false
                                    };
                                    count++;
                                }
                                count_rules++;
                            });
                            if (count === 0) {
                                validator.rules[count_rules] = {
                                    name: key,
                                    type: rule.type,
                                    rule: rule.rule,
                                    parse: rule.parse ? rule.parse : false
                                };
                            }
                        }
                    });
                }
            },
            '$translator': {
                'set': function(translator){
                    validator.translator.enable = translator.enable,
                    validator.translator.module = translator.module
                }
            }
        };
        tools = {
            translate: function(form, text){
                if(typeof form === 'object' && form.grForm){
                    if(form.translate){
                        return makeTranslation(text);
                    }else{
                        return text;
                    }
                }else{
                    if(typeof form === 'string'){
                        return makeTranslation(form);
                    }else{
                        if(typeof text === 'string'){
                            return text;
                        }else{
                            return '';
                        }
                    }
                }
                function makeTranslation(str){
                    if(validator.translator.enable){
                        if(validator.translator.module === 'pascalprecht.translate'){
                            return instance.filter('translate')(str);
                        }else{
                            return str;
                        }
                    }else{
                        return str;
                    }
                    return str;
                }
            },
            mask: {
                replace: function(value){
                    var pattern = /[\/\\\.\_\-\(\)\:\%\?\!\+\=\@\&\Âª\Âº\Â¹\Â²\Â³\R\$\Â£\Â¢\ ]/g;
                    while(value.match(pattern)){
                        value = value.replace(pattern,'');
                    }
                    return value;
                },
                split: function(mask){
                    var msk = '';
                    if(mask.indexOf('|') !== -1){
                        msk = [];
                        angular.forEach(mask.split('|'), function(m, id){
                            var _m = m;
                            while (_m.indexOf(' ') !== -1) {
                                _m = _m.replace(' ', '');
                            }
                            msk[id] = {
                                mask: m.trim(),
                                length: _m.trim().length
                            };
                        });
                        msk.sort(function(a, b){
                          return a.length - b.length;
                        });
                    }else{
                        msk = mask.trim();
                    }
                    return msk;
                }
            },
            rules: {
                split: function (rules) {
                    rules = (rules !== '' && rules !== undefined && rules) ? rules : 'required:false';
                    rules = rules.split(',');
                    var _rules = {};
                    if(rules){
                        angular.forEach(rules, function (r) {
                            r = r.split(':');
                            var id = r[0].trim(),
                                value = r[1].trim(),
                                hasRule = false;
                                while (value.indexOf("'") != -1) {
                                    value = value.replace("'", "").trim();
                                }
                            angular.forEach(validator.rules, function(_r){
                                if(id === _r.name){
                                    var type = _r.type;
                                    if(type === 'integer'){
                                        value = parseInt(value) || '';
                                    }else if(type === 'float'){
                                        value = parseFloat(value) || '';
                                    }else if(type === 'boolean'){
                                        value = String(value) === 'true';
                                    }else if(type === 'string'){
                                        value = String(value) || '';
                                    }
                                    if(type === 'integer' || type === 'float'){
                                        type = 'number';
                                    }
                                    if(typeof value === type){
                                        hasRule = true;
                                    }
                                };
                            });
                            if(hasRule){
                                _rules[id] = value;
                            }
                        });
                    }
                    return _rules;
                },
                parse: function (form, name, rules) {
                    var messages = validator.config.file.message[name],
                        _messages = {};
                    rules = tools.rules.split(rules);
                    angular.forEach(rules, function (r, id) {
                        if(messages){
                            if(messages[id]){
                                var m,
                                    rule;
                                angular.forEach(validator.rules, function (_r, _id) {
                                    if (_r.name == id) {
                                        rule = _r;
                                    }
                                });
                                messages[id] = tools.translate(form, messages[id]);
                                if (rule.parse) {
                                    m = messages[id];
                                    m = rule.parse(m, r);
                                } else {
                                    m = messages[id];
                                }
                                _messages[id] = m;
                            }else{
                                console.error('No error message was defined for "' + id + '" in "' + name + '" field.');
                            }
                        }else{
                            console.error('No error message was defined for "' + name + '" field.');
                            return;
                        }
                    });
                    return _messages;
                }
            }
        };
        this.destroy = validator.$destroy;
        this.config = function (global) {
            if (global.hasOwnProperty('config') && typeof global.config === 'object') {
                validator.config.$form.set(global.config);
            };
            if(global.hasOwnProperty('files')){
                var files = global.files;

                if (files.hasOwnProperty('templates')) {
                    validator.config.file.$template.path = files.templates.location || '';
                    validator.config.file.$template.extension = files.templates.extension || '.html';
                }else{
                    validator.config.file.$template.path = '';
                    validator.config.file.$template.extension = '.html';
                }

                if (files.hasOwnProperty('messages')) {
                    validator.config.file.$message.url = files.messages;
                }else{
                    console.error('Form messages files not found!');
                }

                if (files.hasOwnProperty('masks')) {
                    validator.config.file.$mask.url = files.masks;
                }
            }else{
                validator.config.file.$template.path = '';
                validator.config.file.$template.extension = '.html';
                console.error('Form messages files not found!');
            }
            if (global.hasOwnProperty('translator') || global.translator){
                var translator = {
                    enable: global.translator.enable || false,
                    module: global.translator.enable ? global.translator.module : ''
                }
                validator.$translator.set(translator);
            }
        };
        this.showMessage = validator.config.file.$message.show;
        setup = function (injector) {
            instance.injector = injector;
            instance.scriptbind = instance.injector.get('$grScriptbind');
            instance.scope = instance.injector.get('$rootScope');
            instance.filter = instance.injector.get('$filter');
            instance.http = instance.injector.get('$http');
            instance.compile = instance.injector.get('$compile');
            instance.timeout = instance.injector.get('$timeout');
            instance.window = angular.element(instance.injector.get('$window'));

            $grValidation.fields = instance.injector.get('$grValidation.fields');
            validator.$field.set($grValidation.fields);

            $grValidation.rules = instance.injector.get('$grValidation.rules');
            validator.$rule.set($grValidation.rules);

            $grValidation.masks = instance.injector.get('$grValidation.mask.patterns');
            validator.config.file.$mask.config = $grValidation.masks;

            if(!validator.config.form || validator.config.form.length === 0){
                $grValidation.config = instance.injector.get('$grValidation.config');
                validator.config.$form.set($grValidation.config);
            }

            instance.http.get(validator.config.file.$message.url).then(
                function (messages) {
                    var msg = {};
                    angular.forEach(messages.data, function (m, id) {
                        msg[id] = {};
                        angular.forEach(m, function (_m, _id) {
                            msg[id][_id] = _m;
                            if (validator.translate) {
                                msg[id][_id] = tools.translate(_m);
                            }
                        });
                    });
                    validator.config.file.$message.set(msg);
                },
                function (e) {
                    console.error(e);
                });
            instance.http.get(validator.config.file.$mask.url).then(function (masks) {
                validator.config.file.$mask.set(masks.data);
            });

            validator.config.file.$template.set();
        };
        this.$get = ['$injector',
            function (injector) {
                setup(injector);
                return {
                    'new': validator.$new,
                    'get': validator.$get,
                    'mask': validator.config.file.$mask.config,
                    'template': validator.config.file.$template.get,
                    'destroy': validator.$destroy,
                    'translate': tools.translate
                };
        }];
    })
    .config(['$grScriptbindProvider', function($scriptBind){
        $scriptBind.addType('grForm/form', function(binds, args){
            var put = angular.isArray(args) ? (angular.isArray(args[0]) ? args.shift() : undefined) : undefined,
                inject = args;

            angular.forEach(binds, function (b) {
                var d = angular.isFunction(b[0]) ? b[0].apply(null, put) : b[0][0].apply(null, put);
                if (d.inject) {
                    var i = [],
                        injector = angular.injector(d.inject),
                        fn = d.submit.pop();
                    var injected = injector.get(d.submit);
                    i.push(injected);
                    if (angular.isArray(inject)) {
                        angular.forEach(inject, function (a) {
                            i.push(a);
                        });
                    }
                    fn.apply(null, i);
                }
            });
        });
    }]);
angular.module('grValidation.directive', ['grValidation.provider'])
    .directive('grForm', ['$grValidation',
        function (VALIDATOR) {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: false,
                templateUrl: VALIDATOR.template('form'),
                require: '?^form',
                compile: function(){
                    return{
                        pre: function(scope, element, attrs, ctrl){
                            if(attrs.grName){
                                VALIDATOR.new({
                                    name: attrs.grName,
                                    element: element,
                                    scope: scope,
                                    model: ctrl,
                                    method: attrs.hasOwnProperty('grValidateMethod') ? attrs.grValidateMethod : '',
                                    validate: attrs.hasOwnProperty('grValidate') ? attrs.grValidate : '',
                                    labelType: attrs.hasOwnProperty('grLabelType') ? attrs.grLabelType : ''
                                });
                            }else{
                                console.error('"gr-name" attribute not found.');
                                element.html('');
                            }
                        },
                        post: function(scope, element, attrs, ctrl){
                            if(attrs.grName){
                                scope.grForm = VALIDATOR.get('external');
                            }
                        }
                    }
                }
            };
        }])
    .directive('grAlert', ['$grValidation', '$timeout',
        function (VALIDATOR, $timeout) {
            return {
                restrict: 'A',
                scope: true,
                templateUrl: VALIDATOR.template('alert'),
                require: '?^form',
                link: function (scope, element, attrs, ctrl) {
                    if (!ctrl) {
                        return;
                    } else if (!ctrl.$name || !ctrl.$id) {
                        return;
                    }
                    var form = VALIDATOR.get(ctrl.$name);
                    scope.message = {
                        text: {},
                        type: '',
                        error: {
                            title: VALIDATOR.translate(form, 'Oops, something is wrong')
                        },
                        length: 0,
                        check: function () {
                            return scope.message.length > 0;
                        }
                    };
                    scope.$on('form' + ctrl.$name + 'change', function () {
                        var message = form.$message.get();
                        scope.message.length = 0;
                        scope.message.text = message.text;
                        scope.message.trigger = message.trigger;
                        scope.message.type = message.type;
                        angular.forEach(message.text, function () {
                            scope.message.length++;
                        });
                    });
                }
            };
        }])
    .directive('grInput', ['$grValidation', '$compile',
        function (VALIDATOR, $compile) {
            return {
                restrict: 'E',
                replace: true,
                scope: true,
                require: '?^form',
                transclude: true,
                templateUrl: function($element, $attrs){
                    if(!$attrs.grType){
                        $attrs.grType = 'text';
                    };
                    return VALIDATOR.template($attrs.grType, true);
                },
                compile: function(iElement, iAttrs, transclude){
                    var form,
                        innerElements;
                    return {
                        post: function(scope, element, attrs, ctrl){
                            if (!ctrl) {
                                return;
                            } else if (!ctrl.$name || !ctrl.$id) {
                                return;
                            }
                            form = VALIDATOR.get(ctrl.$name);
                            innerElements = element.find('gr-input-inner');
                            var tempElements = {};
                            if(innerElements.length > 0){
                                angular.forEach(innerElements, function(el, id){
                                    tempElements[id] = {};
                                    angular.forEach(el.attributes, function(attr){
                                        var name = attr.nodeName,
                                            value = attr.value;
                                        if(name === 'class' && value === 'ng-scope'){
                                            return;
                                        }

                                        tempElements[id][name] = (value !== 'undefined' && value !== '') ? value : true;
                                    });
                                });
                            }
                            form.$add({
                                form: ctrl.$name,
                                name: attrs.grName,
                                element: element,
                                innerElements: tempElements,
                                scope: scope,
                                validate: (attrs.grValidate !== '' && attrs.grValidate !== undefined) ? attrs.grValidate : false,
                                attrs:{
                                    type: (attrs.grType !== '' && attrs.grType !== undefined) ? attrs.grType : 'text',
                                    mask: attrs.grMask,
                                    label: attrs.grLabel,
                                    icon: (attrs.grIcon !== '' && attrs.grIcon !== undefined) ? attrs.grIcon : false,
                                    value: attrs.grValue,
                                    checked: attrs.hasOwnProperty('grChecked') ? true: false,
                                    multiple: attrs.hasOwnProperty('grMultiple') ? true: false,
                                    dataSource: attrs.hasOwnProperty('grDataSource') ? attrs.grDataSource : false
                                }
                            });
                            element.find('gr-input-inner').parent().remove();
                        }
                    }
                }
            };
        }])
    .directive('grValidator', ['$grValidation',
        function (VALIDATOR) {
            return {
                restrict: 'A',
                scope: {
                    model: '=ngModel'
                },
                priority: 1,
                require: ['?^form', 'ngModel'],
                compile: function(){
                    return {
                        post: function(scope, element, attrs, ctrl){
                            var form = ctrl[0],
                                field = ctrl[1];
                            if (!field || !form) {
                                return;
                            } else if (!field.$name || !form.$name || !form.$id) {
                                return;
                            }
                            field.$setValidity(field.$name, false);
                            field.$formatters = [];
                            field.$parsers = [];
                            if(attrs.grValidator === true || attrs.grValidator === 'true' || attrs.grValidator === false || attrs.grValidator === 'false') {
                                var _form = VALIDATOR.get(form.$name),
                                    change = function (v, submiting) {
                                        _form.$change({
                                            field: field.$name,
                                            model: field,
                                            value: v,
                                            submiting: submiting | false
                                        });
                                    };
                                scope.$watch('model', function (v) {
                                    change(v);
                                });
                                scope.$on(form.$name + field.$name + 'submit', function () {
                                    change(element.val(), true);
                                });
                            }
                        }
                    }
                }
            };
        }])
    .directive('grMaskPattern', ['$grValidation', '$parse', '$timeout',
        function (VALIDATOR, $parse, $timeout) {
            return {
                priority: 101,
                require: 'ngModel',
                restrict: 'A',
                compile: function grMaskCompilingFunction() {
                    var options = {
                        'maskDefinitions': VALIDATOR.mask,
                        'maskResources': {
                            'split': /\[\[([^(\[\[)]*)((\|\|)([^(\]\])]*)){0,1}\]\]/g,
                            'autoIncrement': /\&/g
                        }
                    };
                    return function grMaskLinkingFunction(scope, iElement, iAttrs, controller) {
                        var eventsBound = false,
                            mask,
                            currentMask = {},
                            oldMask = {},
                            // Minimum required length of the value to be considered valid
                            minRequiredLength,
                            value, valueMasked, isValid,
                            // Vars for initializing/uninitializing
                            originalPlaceholder = iAttrs.placeholder,
                            originalMaxlength = iAttrs.maxlength,
                            // Vars used exclusively in eventHandler()
                            oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength;
                        function initialize(change) {
                            if (!angular.isDefined(mask)) {
                                return uninitialize();
                            }
                            processRawMask();
                            if (!currentMask.processed) {
                                return uninitialize();
                            }
                            initializeElement(change);
                            bindEventListeners();
                            return true;
                        }
                        function initPlaceholder(placeholderAttr) {
                            if (!angular.isDefined(placeholderAttr)) {
                                return;
                            }
                            if(!originalPlaceholder){
                                currentMask.placeholder = placeholderAttr;
                            }

                            // If the mask is processed, then we need to update the value
                            if (currentMask.processed) {
                                eventHandler();
                            }
                        }
                        function formatter(fromModelValue) {
                            if (!currentMask.processed) {
                                return fromModelValue;
                            }
                            value = unmaskValue(fromModelValue || '');
                            isValid = validateValue(value);
                            controller.$setValidity('mask', isValid);
                            return isValid && value.length ? maskValue(value) : undefined;
                        }
                        function parser(fromViewValue) {
                            if (!currentMask.processed) {
                                return fromViewValue;
                            }
                            value = unmaskValue(fromViewValue || '');
                            isValid = validateValue(value);
                            // We have to set viewValue manually as the reformatting of the input
                            // value performed by eventHandler() doesn't happen until after
                            // this parser is called, which causes what the user sees in the input
                            // to be out-of-sync with what the controller's $viewValue is set to.
                            controller.$viewValue = value.length ? maskValue(value) : '';
                            controller.$setValidity('mask', isValid);
                            if (value === '' && iAttrs.required) {
                                controller.$setValidity('required', false);
                            }
                            return isValid ? value : undefined;
                        }
                        var linkOptions = {};
                        if (iAttrs.gOptions) {
                            linkOptions = scope.$eval('[' + iAttrs.gOptions + ']');
                            if (angular.isObject(linkOptions[0])) {
                                // we can't use angular.copy nor angular.extend, they lack the power to do a deep merge
                                linkOptions = (function (original, current) {
                                    for (var i in original) {
                                        if (Object.prototype.hasOwnProperty.call(original, i)) {
                                            if (!current[i]) {
                                                current[i] = angular.copy(original[i]);
                                            } else {
                                                angular.extend(current[i], original[i]);
                                            }
                                        }
                                    }
                                    return current;
                                })(options, linkOptions[0]);
                            }
                        }
                        else {
                            linkOptions = options;
                        }
                        iAttrs.$observe('grMaskPattern', function(newMask){
                            mask = newMask;
                            initialize();
                            if(iAttrs.grValue){
                                value = unmaskValue(iAttrs.grValue);
                                if(value.length < clearMask(currentMask.pattern).length){
                                    value = '';
                                    return;
                                }
                                initialize(true);
                            }
                        });
                        iAttrs.$observe('placeholder', initPlaceholder);
                        var modelViewValue = false;
                        iAttrs.$observe('modelViewValue', function (val) {
                            if (val === 'true') {
                                modelViewValue = true;
                            }
                        });
                        scope.$watch(iAttrs.ngModel, function (val) {
                            if (modelViewValue && val) {
                                var model = $parse(iAttrs.ngModel);
                                model.assign(scope, controller.$viewValue);
                            }
                        });
                        controller.$formatters.push(formatter);
                        controller.$parsers.push(parser);
                        ////////////////////////////////////////////
                        //Verifica se a mascara possui mais de um modelo, se nÃ£o ele retorna apenas a string, ou um array com as mascaras
                        function splitMask(maskAttr) {
                            var splitedMask;
                            if(typeof maskAttr === 'string'){
                                if((/[^\|]\|[^\|]/).test(maskAttr)){
                                    currentMask.multiMask = true;
                                    splitedMask = [];
                                    var split = maskAttr.split(''),
                                        splitAux = '';
                                    angular.forEach(split, function(m, i){
                                        if(i > 0){
                                            if(m === '|'&&(split[i-1] !== '|' && split[i+1] !== '|')&&(split[i-1] !== ' ' && split[i+1] !== ' ')){
                                                splitAux += ' | ';
                                            }else{
                                                splitAux += m;
                                            }
                                        }else{
                                            splitAux += m;
                                        }
                                    });
                                    split = splitAux.split(/\ \|\ /);
                                    angular.forEach(split, function(m, id){
                                        var _m = clearMask(m);
                                        if(!checkLengthExists(splitedMask, _m) && !testResource('split', m) && !testResource('autoIncrement', m)){
                                            splitedMask.push({
                                                value: m.trim(),
                                                length: _m.length
                                            });
                                        }
                                    });
                                    if(splitedMask.length > 0){
                                        splitedMask.sort(function(a, b){
                                          return a.length - b.length;
                                        });
                                    }else{
                                        splitedMask = '';
                                    }
                                }else{
                                    currentMask.multiMask = false;
                                    var _m = clearMask(maskAttr);
                                    splitedMask = [{
                                        value: maskAttr.trim(),
                                        length: _m.length
                                    }];
                                }
                            }else{
                                currentMask.multiMask = true;
                                splitedMask = [maskAttr];
                            }
                            function checkLengthExists(splitedMask, curMask){
                                var ocCount = 0;
                                if(splitedMask.length > 1){
                                    angular.forEach(splitedMask, function(m){
                                        var _m = clearMask(m.value);
                                        if(_m.length === curMask.length){
                                            ocCount++;
                                        }
                                    });
                                }
                                return ocCount > 0;
                            }
                            return splitedMask;
                        }
                        //Remove caracteres mascarados
                        function clearMask(m, notDefinitions){
                            var maskClear = '',
                                aux;
                            angular.forEach(linkOptions.maskResources, function(r, i){
                                aux = m.match(r) || false;
                                aux = aux !== 'string' ? aux[0] : aux;
                                aux = m.split(aux).join('') || false;
                                m = aux || m;
                            });
                            m = m.trim();
                            angular.forEach(m.split(''), function(_m, i){
                                var def = notDefinitions ? true : linkOptions.maskDefinitions[_m];
                                if(def){
                                    maskClear += _m;
                                }
                            });
                            return maskClear.trim();
                        }
                        //Verifica Qual a mascara atual
                        function checkCurrentMask(newVal){
                            if(!value){
                                value = '';
                            }
                            var val = value;
                            if(newVal){
                                val = newVal;
                            }
                            var length = val.length,
                                cmask,
                                cmaskId;
                            if(!checkValidLength(length)){
                                if(currentMask.pattern){
                                    cmask = currentMask.pattern;
                                }else{
                                    cmask = '';
                                }
                            }else{
                                if(typeof mask === 'object'){
                                    angular.forEach(mask, function(m, i){
                                        if(i === 0){
                                            cmask = m.value;
                                            cmaskId = i;
                                        }else{
                                            if(length > mask[i-1].length){
                                                cmask = m.value;
                                                cmaskId = i;
                                            }
                                        }
                                    });
                                }else{
                                    cmask = mask;
                                }
                                if(testResource('split', cmask)){
                                    var rule = cmask.match(linkOptions.maskResources['split'])[0],
                                        newMask = cmask.split(rule),
                                        maskLength = clearMask(cmask).length,
                                        model,
                                        tmask = [];
                                    if(length > maskLength){
                                        for(var x = 1; !model; x++){
                                            var chr = newMask[1].substring(x-1,x);
                                            if(linkOptions.maskDefinitions[chr]){
                                                model = chr;
                                            }
                                            if(!chr){
                                                return;
                                            }
                                        }
                                        if(newMask.length > 2){
                                            var tmask = [],
                                                tmaskAux = '';
                                            angular.forEach(newMask, function(m, i){
                                                if(i === 0){
                                                    tmask.push(m);
                                                }else{
                                                    tmaskAux += m;
                                                }
                                            });
                                            newMask = tmask;
                                            newMask.push(tmaskAux);
                                        }
                                        rule = rule.split('[[').join('').split(']]').join('').split('||');
                                        rule = {
                                            delimiter: parseInt(rule[0]) || false,
                                            divisor: rule[1] || false
                                        }
                                        var dAux = [];
                                        angular.forEach(rule.divisor.split(''), function(d, i){
                                            if(linkOptions.maskDefinitions[d]){
                                                dAux.push('\\' + d);
                                            }else{
                                                dAux.push(d);
                                            }
                                        });
                                        rule.divisor = dAux.join('');
                                        tmask[0] = newMask[0];
                                        if(model && rule.delimiter && rule.delimiter > 0){
                                            if(rule.divisor){
                                                for(var x = (length - maskLength); x > 0; x--){
                                                    tmask.push(model);
                                                    if(x % rule.delimiter === 0){
                                                        tmask.push(rule.divisor);
                                                    }
                                                }
                                            }else{
                                                for(var x = (length - maskLength); x > 0; x--){
                                                    if(x < rule.delimiter){
                                                        tmask.push(model);
                                                    }
                                                }
                                            }
                                        }
                                        cmask = tmask;
                                        cmask.push(newMask[1]);
                                        cmask = cmask.join('');
                                    }else{
                                        cmask = clearMask(mask[cmaskId].value, true);
                                    }
                                }
                                else if(testResource('autoIncrement', cmask)){
                                    var tmask = [],
                                        model = '',
                                        maskLength = clearMask(cmask).length;
                                    if(length > maskLength){
                                        tmask[0] = '';
                                        tmask[1] = '';
                                        tmask[2] = '';
                                        angular.forEach(cmask.split('&'), function(m, i){
                                            if(i === 0){
                                                tmask[0] += m;
                                            }else{
                                                tmask[2] += m;
                                            }
                                        });
                                        model = tmask[2].substring(0,1);
                                        for(var x = (length - maskLength); x > 0; x--){
                                            tmask[1] += model;
                                        }
                                        cmask = tmask.join('');
                                    }else{
                                        cmask = clearMask(mask[cmaskId].value, true);
                                    }
                                }
                            }
                            return cmask;
                        }
                        function checkValidLength(length) {
                            if(originalMaxlength && (parseInt(originalMaxlength) || 0) > 0){
                                return length <= originalMaxlength;
                            }else{
                                return true;
                            }
                        }
                        function testResource(resource, maskAttr){
                            var test;
                            test = linkOptions.maskResources[resource].test(maskAttr);
                            return test;
                        }
                        ////////////////////////////////////////////
                        function uninitialize() {
                            currentMask.processed = false;
                            unbindEventListeners();

                            if (angular.isDefined(originalPlaceholder)) {
                                iElement.attr('placeholder', originalPlaceholder);
                            } else {
                                iElement.removeAttr('placeholder');
                            }

                            if (angular.isDefined(originalMaxlength)) {
                                iElement.attr('maxlength', originalMaxlength);
                            } else {
                                iElement.removeAttr('maxlength');
                            }

                            iElement.val(controller.$modelValue);
                            controller.$viewValue = controller.$modelValue;
                            return false;
                        }
                        function initializeElement(change) {
                            value = oldValueUnmasked = unmaskValue(controller.$modelValue || '');
                            valueMasked = oldValue = maskValue(value);
                            isValid = validateValue(value);
                            if(!change){
                                var viewValue = isValid && value.length ? valueMasked : '';
                            }else{
                                var viewValue = valueMasked;
                            }
                            if (iAttrs.maxlength) { // Double maxlength to allow pasting new val at end of mask
                                iElement.attr('maxlength', currentMask.caretMap[currentMask.caretMap.length - 1] * 2);
                            }
                            if(originalPlaceholder === '' || originalPlaceholder === undefined){
                                iElement.attr('placeholder', currentMask.placeholder);
                            }
                            iElement.val(viewValue);
                            controller.$viewValue = viewValue;
                            // Not using $setViewValue so we don't clobber the model value and dirty the form
                            // without any kind of user interaction.
                        }
                        function bindEventListeners() {
                            if (eventsBound) {
                                return;
                            }
                            iElement.bind('blur', blurHandler);
                            iElement.bind('mousedown mouseup', mouseDownUpHandler);
                            iElement.bind('input keyup click focus', eventHandler);
                            eventsBound = true;
                        }
                        function unbindEventListeners() {
                            if (!eventsBound) {
                                return;
                            }
                            iElement.unbind('blur', blurHandler);
                            iElement.unbind('mousedown', mouseDownUpHandler);
                            iElement.unbind('mouseup', mouseDownUpHandler);
                            iElement.unbind('input', eventHandler);
                            iElement.unbind('keyup', eventHandler);
                            iElement.unbind('click', eventHandler);
                            iElement.unbind('focus', eventHandler);
                            eventsBound = false;
                        }
                        function validateValue(value) {
                            // Zero-length value validity is ngRequired's determination
                            return value.length ? value.length >= minRequiredLength : true;
                        }
                        function unmaskValue(value) {
                            var valueUnmasked = '',
                                maskPatternsCopy = currentMask.patterns.slice();
                            // Preprocess by stripping mask components from value
                            value = value.toString();
                            angular.forEach(currentMask.components, function (component) {
                                value = value.replace(component, '');
                            });
                            while(value.indexOf('_') !== -1){
                                value = value.replace('_','');
                            }
                            angular.forEach(value.split(''), function (chr) {
                                if(parseInt(maskPatternsCopy.length) > 0 && maskPatternsCopy[0].test(chr)){
                                    valueUnmasked += chr;
                                    maskPatternsCopy.shift();
                                }else if(parseInt(maskPatternsCopy.length) === 0 && !maskPatternsCopy[0]){
                                    valueUnmasked += chr;
                                }
                            });
                            return valueUnmasked;
                        }
                        function maskValue(unmaskedValue) {
                            var valueMasked = '',
                                maskCaretMapCopy = currentMask.caretMap.slice();
                            angular.forEach(currentMask.placeholder.split(''), function (chr, i) {
                                if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
                                    valueMasked += unmaskedValue.charAt(0) || '_';
                                    unmaskedValue = unmaskedValue.substr(1);
                                    maskCaretMapCopy.shift();
                                }else{
                                    valueMasked += chr;
                                }
                            });
                            return valueMasked;
                        }
                        function getPlaceholderChar(i) {
                            var placeholder = iAttrs.placeholder;

                            if(!originalPlaceholder){
                                if (typeof placeholder !== 'undefined' && placeholder[i]) {
                                    return placeholder[i];
                                } else {
                                    return '_';
                                }
                            }
                            return '_';
                        }
                        function getMaskComponents() {
                            var comp = [];
                            angular.forEach(currentMask.placeholder.replace(/[_]+/g, '_').replace(/([^_]+)([a-zA-Z0-9])([^_])/g, '$1$2_$3').split('_'), function(c){
                                if(c.length <= 1){
                                    comp.push(c);
                                }else{
                                    comp.push(c);
                                    angular.forEach(c.split(''), function(_c){
                                        if(comp.indexOf(_c) === -1){
                                            comp.push(_c);
                                        }
                                    });
                                }
                            });
                            return comp;
                        }
                        function processRawMask() {
                            angular.forEach(currentMask, function(m,i){
                                oldMask[i] = m;
                            });
                            currentMask.caretMap = [];
                            currentMask.patterns = [];
                            currentMask.placeholder = '';
                            if(typeof mask === 'string'){
                                mask = splitMask(mask);
                            }
                            defineMask(checkCurrentMask());
                            currentMask.caretMap.push(currentMask.caretMap.slice().pop() + 1);
                            currentMask.components = getMaskComponents();
                            currentMask.processed = currentMask.caretMap.length > 1 ? true : false;
                            function defineMask(maskAttr) {
                                var characterCount = 0;
                                minRequiredLength = 0;
                                var _mask = {
                                        caretMap: [],
                                        patterns: [],
                                        placeholder: '',
                                        components: [],
                                        multiMask: currentMask.multiMask,
                                        processed: false
                                    },
                                    isOptional = false,
                                    isVariable = false,
                                    splitedMask = maskAttr.split('');
                                angular.forEach(splitedMask, function (chr, i) {
                                    if (linkOptions.maskDefinitions[chr] && splitedMask[i-1] !== '\\') {
                                        _mask.caretMap.push(characterCount);
                                        _mask.placeholder += getPlaceholderChar(i);
                                        _mask.patterns.push(linkOptions.maskDefinitions[chr]);
                                        characterCount++;
                                        if (!isOptional) {
                                            minRequiredLength++;
                                        }
                                    } else if (chr === '?') {
                                        isOptional = true;
                                    }else if (chr !== '\\' || (chr === '\\' && !linkOptions.maskDefinitions[splitedMask[i+1]])) {
                                        _mask.placeholder += chr;
                                        characterCount++;
                                    }
                                });
                                _mask.pattern = maskAttr;
                                currentMask = _mask;
                            }
                        }
                        function blurHandler() {
                            oldCaretPosition = 0;
                            oldSelectionLength = 0;
                            if (!isValid || value.length === 0) {
                                valueMasked = '';
                                iElement.val('');
                                scope.$apply(function () {
                                    controller.$setViewValue('');
                                });
                            }
                        }
                        function mouseDownUpHandler(e) {
                            if (e.type === 'mousedown') {
                                iElement.bind('mouseout', mouseoutHandler);
                            } else {
                                iElement.unbind('mouseout', mouseoutHandler);
                            }
                        }
                        iElement.bind('mousedown mouseup', mouseDownUpHandler);
                        function mouseoutHandler() {
                            /*jshint validthis: true */
                            oldSelectionLength = getSelectionLength(this);
                            iElement.unbind('mouseout', mouseoutHandler);
                        }
                        function eventHandler(e) {
                            /*jshint validthis: true */
                            e = e || {};
                            // Allows more efficient minification
                            var eventWhich = e.which,
                                eventType = e.type;
                            // Prevent shift and ctrl from mucking with old values
                            if (eventWhich === 16 || eventWhich === 91) {
                                return;
                            }
                            var val = iElement.val(),
                                valOld = oldValue,
                                valMasked,
                                valUnmasked = unmaskValue(val),
                                valUnmaskedOld = oldValueUnmasked,
                                valAltered = false,
                                maskChanged = checkCurrentMask(valUnmasked) !== currentMask.pattern,
                                caretPos = getCaretPosition(this) || 0,
                                caretPosOld = oldCaretPosition || 0,
                                caretPosDelta = caretPos - caretPosOld,
                                caretPosMin = currentMask.caretMap[0],
                                caretPosMax = currentMask.caretMap[valUnmasked.length] || currentMask.caretMap.slice().shift(),
                                selectionLenOld = oldSelectionLength || 0,
                                isSelected = getSelectionLength(this) > 0,
                                wasSelected = selectionLenOld > 0,
                                // Case: Typing a character to overwrite a selection
                                isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld),
                                // Case: Delete and backspace behave identically on a selection
                                isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld),
                                isSelection = (eventWhich >= 37 && eventWhich <= 40) && e.shiftKey, // Arrow key codes

                                isKeyLeftArrow = eventWhich === 37,
                                // Necessary due to "input" event not providing a key code
                                isKeyBackspace = eventWhich === 8 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === -1)),
                                isKeyDelete = eventWhich === 46 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === 0) && !wasSelected),
                                // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
                                // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
                                // non-mask character. Also applied to click since users are (arguably) more likely to backspace
                                // a character when clicking within a filled input.
                                caretBumpBack = (isKeyLeftArrow || isKeyBackspace || eventType === 'click') && caretPos > caretPosMin;
                            oldSelectionLength = getSelectionLength(this);
                            // These events don't require any action
                            if (isSelection || (isSelected && (eventType === 'click' || eventType === 'keyup'))) {
                                return;
                            }
                            if(maskChanged){
                                if(!caretBumpBack && isValidCaretPosition(caretPos+1) && !isValidCaretPosition(caretPos-1) && caretPos > 0 && !isKeyDelete){
                                    caretPos++;
                                }
                                initialize(true);
                                oldCaretPosition = caretPos;
                                caretPos += checkCaretMaskChange(caretPos);
                                // Update values
                                valMasked = maskValue(valUnmasked);
                                if(valUnmasked.length > 0){
                                    if (maskChanged){
                                        caretPosMax = valMasked.length;
                                    }else{
                                        caretPosMax = currentMask.caretMap[valUnmasked.length];
                                    }
                                }
                                oldValue = valMasked;
                                oldValueUnmasked = valUnmasked;
                                iElement.val(valMasked);
                                // We've altered the raw value after it's been $digest'ed, we need to $apply the new value.
                                scope.$apply(function () {
                                    controller.$setViewValue(valUnmasked);
                                });
                                setCaretPosition(this, caretPos);
                                return;
                            }
                            // Value Handling
                            // ==============
                            // User attempted to delete but raw value was unaffected--correct this grievous offense
                            if ((eventType === 'input') && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
                                while (isKeyBackspace && caretPos > caretPosMin && !isValidCaretPosition(caretPos)) {
                                    caretPos--;
                                }
                                while (isKeyDelete && caretPos < caretPosMax && currentMask.caretMap.indexOf(caretPos) === -1) {
                                    caretPos++;
                                }
                                var charIndex = currentMask.caretMap.indexOf(caretPos);
                                // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
                                valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
                                valAltered = true;
                            }
                            // Update values
                            valMasked = maskValue(valUnmasked);
                            if(valUnmasked.length > 0){
                                if (maskChanged){
                                    caretPosMax = valMasked.length;
                                }else{
                                    caretPosMax = currentMask.caretMap[valUnmasked.length];
                                }
                            }
                            oldValue = valMasked;
                            oldValueUnmasked = valUnmasked;
                            iElement.val(valMasked);
                            if (valAltered) {
                                // We've altered the raw value after it's been $digest'ed, we need to $apply the new value.
                                scope.$apply(function () {
                                    controller.$setViewValue(valUnmasked);
                                });
                            }
                            // Caret Repositioning
                            // ===================
                            // Ensure that typing always places caret ahead of typed character in cases where the first char of
                            // the input is a mask char and the caret is placed at the 0 position.
                            if (isAddition && (caretPos <= caretPosMin)) {
                                caretPos = caretPosMin + 1;
                            }
                            if (caretBumpBack) {
-                               caretPos--;
                            }
                            // Make sure caret is within min and max position limits
                            caretPos = caretPos > caretPosMax ? caretPosMax : (caretPos < caretPosMin ? caretPosMin : caretPos);
                            // Scoot the caret back or forth until it's in a non-mask position and within min/max position limits
                            while (!isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
                                caretPos += caretBumpBack ? -1 : 1;
                            }
                            if ((caretBumpBack && caretPos < caretPosMax) || (isAddition && !isValidCaretPosition(caretPosOld))) {
                                caretPos++;
                            }
                            oldCaretPosition = caretPos;
                            setCaretPosition(this, caretPos);
                        }
                        function checkCaretMaskChange(pos){
                            var countCurrent = 0,
                                countOld = 0,
                                current = currentMask.pattern,
                                old = oldMask.pattern;
                            angular.forEach(current.split(''), function(m, i){
                                if( currentMask.components.indexOf(m) > -1 && i < pos){
                                    countCurrent ++;
                                }
                            });
                            angular.forEach(old.split(''), function(m, i){
                                if( oldMask.components.indexOf(m) > -1 && i < pos){
                                    countOld ++;
                                }
                            });
                            return (countCurrent - countOld);
                        }
                        function isValidCaretPosition(pos) {
                            return currentMask.caretMap.indexOf(pos) > -1;
                        }
                        function getCaretPosition(input) {
                            if (!input) return 0;
                            if (input.selectionStart !== undefined) {
                                return input.selectionStart;
                            } else if (document.selection) {
                                // Curse you IE
                                input.focus();
                                var selection = document.selection.createRange();
                                selection.moveStart('character', input.value ? -input.value.length : 0);
                                return selection.text.length;
                            }
                            return 0;
                        }
                        function setCaretPosition(input, pos) {
                            if (!input) return 0;
                            if (input.offsetWidth === 0 || input.offsetHeight === 0) {
                                return; // Input's hidden
                            }
                            if (input.setSelectionRange) {
                                input.focus();
                                input.setSelectionRange(pos, pos);
                            } else if (input.createTextRange) {
                                // Curse you IE
                                var range = input.createTextRange();
                                range.collapse(true);
                                range.moveEnd('character', pos);
                                range.moveStart('character', pos);
                                range.select();
                            }
                        }
                        function getSelectionLength(input) {
                            if (!input) return 0;
                            if (input.selectionStart !== undefined) {
                                return (input.selectionEnd - input.selectionStart);
                            }
                            if (document.selection) {
                                return (document.selection.createRange().text.length);
                            }
                            return 0;
                        }
                        if (!Array.prototype.indexOf) {
                            Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
                                if (this === null) {
                                    throw new TypeError();
                                }
                                var t = Object(this);
                                var len = t.length >>> 0;
                                if (len === 0) {
                                    return -1;
                                }
                                var n = 0;
                                if (arguments.length > 1) {
                                    n = Number(arguments[1]);
                                    if (n !== n) { // shortcut for verifying if it's NaN
                                        n = 0;
                                    } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                                    }
                                }
                                if (n >= len) {
                                    return -1;
                                }
                                var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
                                for (; k < len; k++) {
                                    if (k in t && t[k] === searchElement) {
                                        return k;
                                    }
                                }
                                return -1;
                            };
                        }
                    };
                }
            };
        }
]);
