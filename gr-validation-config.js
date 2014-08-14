angular.module('grValidation.provider').factory('$grValidation.config', ['GRIFFO', function (GRIFFO) {
    return {
        'login': {
            dependencies: ['grRestful'],
            submit: ['$grRestful', '$timeout',
                function (REST, $timeout, data, controller) {
                    REST.auth({
                        action: 'login',
                        post: data
                    }).then(function (r) {
                        if(r.response){
                            $timeout(function(){
                                location.reload();
                            }, 1000);
                        }
                        controller.$message.show(r.status, r.message);
                    },
                    function (r) {
                        controller.$message.show('danger', 'Fatal error, contact a system administrator!');
                    });
            }]
        },
        'change-password': {
            dependencies: ['grRestful'],
            submit: ['$grRestful', '$timeout',
                function (REST, $timeout, data, controller) {
                    REST.update({
                        module: 'user',
                        action: 'change_password',
                        id: GRIFFO.user.id,
                        post: data
                    }).then(function (r) {
                        controller.$message.show(r.status, r.message);
                    },
                    function (r) {
                        controller.$message.show('danger', 'Fatal error, contact a system administrator!');
                    });
            }]
        },
        'edit-profile': {
            dependencies: ['grRestful'],
            submit: ['$grRestful', '$timeout',
                function (REST, $timeout, data, controller) {
                    REST.update({
                        module: 'user',
                        action: 'update_attributes',
                        id: GRIFFO.user.id,
                        post: data
                    }).then(function (r) {
                        controller.$message.show(r.status, r.message);
                    },
                    function (r) {
                        controller.$message.show('danger', 'Fatal error, contact a system administrator!');
                    });
            }]
        }
    };
}]);