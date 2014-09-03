angular.module('grValidation.provider').factory('$grValidation.config', [function () {
    return {
        'form': function($scope){
            return{
                dependencies: ['grRestful'],
                submit: [function (REST, $timeout, data, controller) {
                    alert('Form Submited');
                }]
            }
        }
    };
}]);
