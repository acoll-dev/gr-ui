'use strict';
(function(){
    angular.module('mainApp').controller('mainCtrl', ['$scope', '$filter', '$timeout', '$location', '$anchorScroll', function($scope, $filter, $timeout, $location, $anchorScroll){
        $scope.goTo = function(id){
            $location.path('/');
            $location.hash(id);
            $scope.hash = id;
            $timeout(function(){
                $anchorScroll();
            }, 200);
        };
        $scope.hash = '';
        $scope.form1 = {
            data: {
                username: '',
                email: 'test@test.com',
                gender: null,
                genderCheck: null,
                bio: '',
                website: '',
                number: 1,
                birthdate: new Date(),
                password: '',
                confirmPassword: '',
                rememberMe: false
            },
            schema: [
                {
                    property: 'username',
                    type: 'text',
                    attr: {
                        ngMinlength: 4,
                        required: true
                    },
                    msgs: {
                        required: '[Username] Campo obrigatório',
                        minlength: '[Username] Needs to have at least 4 characters'
                    }
                },{
                    property: 'email',
                    type: 'email',
                    attr: {
                        required: true,
                        ngMinlength: 4
                    },
                    msgs: {
                        required: '[Email] Campo obrigatório',
                        email:'[Email] Email address needs to be valid',
                        valid: '[Email] Nice email address!'
                    }
                },{
                    property: 'website',
                    type: 'url',
                    msgs: {
                        url: '[Website] You need a valid url'
                    }
                },{
                    property: 'number',
                    label:'Number between 1-10',
                    type: 'number',
                    attr: {
                        min:1,
                        max: 10
                    },
                    msgs: {
                        min: '[Number] You need a number no less than 1',
                        max: '[Number] You need a number no greater than 10'
                    },
                    validate:false
                },{
                    property: 'birthdate',
                    type: 'date',
                    attr: {
                        required: true
                    },
                    msgs: {
                        required: '[Birthdate] Campo obrigatório'
                    }
                },{
                    property: 'gender',
                    type: 'select',
                    list: 'key as value for (key,value) in form1.genders',
                    attr: {
                        required: true
                    },
                    msgs: {
                        required: '[Gender] Campo obrigatório'
                    }
                },{
                    property: 'genderCheck',
                    label:'Are you really?',
                    type: 'select',
                    list: 'key as value for (key,value) in form1.genderCheck',
                    attr: {
                        required: true,
                        ngShow:'$data.gender != null'
                    },
                    msgs: {
                        required: '[Gender Check] Campo obrigatório'
                    }
                },{
                    property: 'bio',
                    type: 'textarea',
                    rows: 5,
                    placeholder: 'A bit about yourself...',
                    attr:{
                        required:true
                    },
                    msgs: {
                        required: '[Bio] Campo obrigatório'
                    }
                },{
                    property: 'html',
                    type: 'html',
                    placeholder: 'A bit about yourself...',
                    attr:{
                        required:true
                    },
                    msgs: {
                        required: '[HTML] Campo obrigatório'
                    }
                },{
                    type:'multiple',
                    fields: [
                        {
                            property: 'password',
                            type: 'password',
                            attr: {
                                required: true,
                                ngMinlength: 6
                            },
                            msgs: {
                                required: '[Password] Campo obrigatório',
                                minlength: '[Username] Needs to have at least 6 characters'
                            }
                        },{
                            property: 'confirmPassword',
                            label: 'Confirm Password',
                            type: 'password',
                            attr: {
                                confirmPassword: 'form1.data.password',
                                required: true,
                                ngMinlength:6
                            },
                            msgs: {
                                match: 'Your passwords need to match',
                                required: '[Re-password] Campo obrigatório',
                                minlength: '[Username] Needs to have at least 6 characters'
                            }
                        }
                    ],
                    columns: 6
                },{
                    property: 'rememberMe',
                    label: 'Stay signed in',
                    type: 'checkbox'
                }
            ],
            options: {
                validation: {
                    enabled: false,
                    showMessages: false
                },
                layout: {
                    type: 'basic',
                    labelSize: 3,
                    inputSize: 9
                }
            },
            genders: {
                0: 'Male',
                1: 'Female'
            },
            genderCheck: {
                0: 'No',
                1: 'Yes'
            },
            submit: function(data){
                if($scope.form1.$invalid) return;
                $log.debug(data);
            }
        };
        if($location.hash()){ $scope.goTo($location.hash()); }else{ $scope.goTo('gr-autofields'); };
    }]).run(['$anchorScroll', function($anchorScroll) { $anchorScroll.yOffset = 110; }]);
})();