angular.module('grValidation.provider').factory('$grValidation.rules', ['$injector', function ($injector) {
    return {
        "email": {
            type: 'string',
            rule: function (value) {
                var regexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,3})+$/;
                return regexp.test(value);
            }
        },
        "equalTo": {
            type: 'string',
            rule: function(value, rule, fields) {
                return value === fields[rule].value;
            },
            parse: function(message, rule){
                var $filter = $injector.get('$filter');
                rule = new String(rule);
                if (rule.length > 0) {
                    var m;
                    m = message.split('|%|');
                    return m[0] + $filter('translate')(rule) + m[1];
                }else{
                    return message;
                }
            }
        },
        "maxlength": {
            type: 'integer',
            rule: function (value, delimiter) {
                return value.length <= delimiter;
            },
            parse: function (message, rule) {
                rule = new String(rule);
                if (rule.length > 0) {
                    var m;
                    m = message.split('|%|');
                    return m[0] + rule + m[1];
                }else{
                    return message;
                }
            }
        },
        "minlength": {
            type: 'integer',
            rule: function (value, delimiter) {
                return value.length >= delimiter
            },
            parse: function (message, rule) {
                rule = new String(rule);
                if (rule.length > 0) {
                    var m;
                    m = message.split('|%|');
                    return m[0] + rule + m[1];
                }else{
                    return message;
                }
            }
        }
    };
}]);
