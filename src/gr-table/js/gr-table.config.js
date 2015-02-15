'use strict';
(function(){
    angular.module('gr.ui.table.config')
        .factory('$grTable.config', ['$grRestful', '$grModal', '$grAlert', '$timeout', function (REST, MODAL, ALERT, $timeout) {
            return {
                'edit': function($scope){
                    return {
                        fn: ['$grModal', function(MODAL, grTable, id, templatePath, label){
                            var modal = MODAL.new({
                                    name: 'edit',
                                    title: 'Edit ' + (label ? label : GRIFFO.module),
                                    size: 'lg',
                                    model: GRIFFO.baseUrl + GRIFFO.modulePath + templatePath,
                                    define: {
                                        grTableImport:{
                                            id: id,
                                            grTable: grTable
                                        }
                                    },
                                    buttons: [{
                                        type: 'success',
                                        label: 'Save',
                                        onClick: function(scope, element, controller){
                                            scope.form.submit();
                                        }
                                    },
                                    {
                                        type: 'default',
                                        label: 'Reset',
                                        onClick: function(scope, element, controller){
                                            scope.form.reset();
                                        }
                                    },
                                    {
                                        type: 'danger',
                                        label: 'Close',
                                        onClick: function(scope, element, controller){
                                            controller.close();
                                        }
                                    }]
                                });
                            modal.open();
                        }]
                    }
                },
                'delete': function($scope){
                    return {
                        fn: ['$grModal', function(MODAL, grTable, id, label, module){
                            var modal = MODAL.new({
                                    name: 'delete',
                                    title: 'Delete' + (label ? ' ' + label : ''),
                                    size: 'sm',
                                    text: label ? 'Essa ação não poderá ser desfeita, tem certeza que deseja exclur ' + label + '?' : 'Essa ação não poderá ser desfeita, tem certeza que deseja excluir?',
                                    define: {
                                        grTableImport:{
                                            id: id,
                                            grTable: grTable
                                        }
                                    },
                                    buttons: [{
                                        type: 'danger',
                                        label: 'Confirm',
                                        onClick: function(scope, element, controller){
                                            REST.delete({
                                                module: (module ? module : GRIFFO.module),
                                                id: id
                                            }).then(function(data){
                                                var grAlert = ALERT.new();
                                                if(data.response){
                                                    controller.close();
                                                    grAlert.show('success', [data.message]);
                                                    scope.grTableImport.grTable.reloadData();
                                                }else{
                                                    controller.close();
                                                    grAlert.show('danger', [data.message]);
                                                }
                                            }, function(e){
                                                var grAlert = ALERT.new();
                                                grAlert.show('success', [e]);
                                            });
                                        }
                                    },{
                                        type: 'default',
                                        label: 'Cancel',
                                        onClick: function(scope, element, controller){
                                            controller.close();
                                        }
                                    }]
                                });
                            modal.open();
                        }]
                     }
                }
            }
        }]);
})();
