'use strict';

var app = angular.module('griffo', ['grValidation', 'pascalprecht.translate']);

app.controller('grCtrl', ['$scope',
    function ($scope) {
        //console.debug($scope);
}]);

app.config(['$grValidationProvider', '$translateProvider',
    function (VALIDATOR, TRANSLATOR) {
        VALIDATOR.config({
            template: {
                path: 'template',
                extension: '.php'
            },
            messages: 'files/messages.json',
            masks: 'files/masks.json',
            translator: {
                enable: true,
                module: 'pascalprecht.translate'
            }
        });
        TRANSLATOR.translations('pt_BR', {
            'Send': 'Enviar'
        });
        TRANSLATOR.preferredLanguage('pt_BR');
}]);
