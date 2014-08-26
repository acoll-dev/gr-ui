'use strict';

var app = angular.module('griffo', ['grValidation', 'pascalprecht.translate']);

app.controller('grCtrl', ['$scope', function($scope){
    //console.debug($scope);
}]);

app.config(['$grValidationProvider', function(VALIDATOR){
    VALIDATOR.config({
        template: {
            path: 'template',
            extension: '.php'
        },
        messages: 'files/messages.json',
        masks: 'files/masks.json'
    });
}]);
