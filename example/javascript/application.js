'use strict';

var app = angular.module('griffo', ['grValidation', 'pascalprecht.translate']);

//app.controller('grCtrl', ['$scope', function ($scope) {}]);

app.config(['$grValidationProvider', '$translateProvider',
    function (VALIDATOR, TRANSLATOR) {
        VALIDATOR.config({
            config: {
                'form': function($scope){               // Form submit handler (form = form's "gr-name")
                    return{
                        inject: ['grRestful'],
                        submit: [function (REST, $timeout, data, controller) {
                            alert('Form Submited');
                        }]
                    }
                }
            },
            files: {
                templates: {
                    location: 'template',               // Templates location folder (Default: '')
                    extension: '.php'                   // Template files extension (Default: '.html')
                },
                messages: 'files/messages.json',        // Form fields error messages file (Required)
                masks: 'files/masks.json'               // Form text field masks file (Required for masks uses)
            },
            translator: {
                enable: true,                           // Translator is enable/false (Default: false)
                module: 'pascalprecht.translate'        // Translator module (Required if enable)
            }
        });
        TRANSLATOR.translations('pt_BR', {
            Send: 'Enviar',
            Reset: 'Limpar'
        });
        TRANSLATOR.preferredLanguage('pt_BR');
}]);
