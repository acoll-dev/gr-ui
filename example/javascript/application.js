'use strict';

var app = angular.module('griffo', ['grValidation', 'pascalprecht.translate']);

app.controller('grCtrl', ['$scope',
    function ($scope) {
        //console.debug($scope);
}]);

app.config(['$grValidationProvider', '$translateProvider',
    function (VALIDATOR, TRANSLATOR) {
        VALIDATOR.config({
            config: {
                form: function($scope){
                    return{
                        dependencies: ['grRestful'],
                        submit: [function (REST, $timeout, data, controller) {
                            alert('Form Submited');
                        }]
                    }
                }
            },
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
            Send: 'Enviar',
            Reset: 'Limpar'
        });
        TRANSLATOR.preferredLanguage('pt_BR');
}]);
