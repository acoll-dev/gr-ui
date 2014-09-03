angular.module('grValidation.provider').factory('$grValidation.mask.patterns', function () {
    return {
        '#': /\d/,
        'A': /[a-zA-Z]/,
        'a': /[a-z]/,
        '*': /[a-zA-Z0-9]/
    };
});
