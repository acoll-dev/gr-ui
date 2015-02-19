'use strict';
(function(){
    angular.module('gr.ui.table.config')
        .factory('$grTable.config', ['$grRestful', '$grModal', '$grAlert', '$timeout', function ($grRestful, $grModal, $grAlert, $timeout) {
            return {
                'edit': function($scope){
                    return {
                        fn: ['$grModal', function($grModal, grTable, id, templatePath, label){
                            var modal = $grModal.new({
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
                        fn: ['$grModal', '$grAlert', function($grModal, $grAlert, grTable, id, label, module){
                            var modal = $grModal.new({
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
                                            $grRestful.delete({
                                                module: (module ? module : GRIFFO.module),
                                                id: id
                                            }).then(function(data){
                                                var alert = $grAlert.new();
                                                if(data.response){
                                                    controller.close();
                                                    alert.show('success', [data.message]);
                                                    scope.grTableImport.grTable.reloadData();
                                                }else{
                                                    controller.close();
                                                    alert.show('danger', [data.message]);
                                                }
                                            }, function(e){
                                                var grAlert = $grAlert.new();
                                                alert.show('success', [e]);
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
