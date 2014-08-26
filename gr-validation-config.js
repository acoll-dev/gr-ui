angular.module('grValidation.provider').factory('$grValidation.config', function () {
    return {
        'form': {
            dependencies: ['grRestful'],
            submit: ['$grRestful', '$timeout',
                function (REST, $timeout, data, controller) {
                    REST.auth({
                        action: 'login',
                        post: data
                    }).then(
                        function (success) {
                            if(success.response){
                                $timeout(function(){
                                    location.reload();
                                }, 1000);
                            }
                            controller.$message.show(success.status, success.message);
                        },
                        function (error) {
                            controller.$message.show('danger', 'Fatal error, contact a system administrator!');
                        }
                    );
            }]
        }
    };
});
