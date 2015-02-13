'use strict';
(function(){
    angular.module('gr.ui.filemanager', ['angularFileUpload', 'gr.ui.modal', 'gr.ui.alert', 'gr.ui.translate']);
})();

/* Example: <gr-file-manager-button gr-name="file" gr-label="Select file" gr-filter="image" gr-required gr-multiple></gr-file-manager-button> */

(function(){
    angular.module('gr.ui.filemanager')
        .directive('fileManager', [/*'$grRestful', */'$grModal', '$grAlert', '$grFileManager', 'FileUploader', '$filter', '$injector', '$timeout', '$window', '$http', function (/*REST, */MODAL, ALERT, MANAGER, FileUploader, $filter, $injector, $timeout, $window, $http){
                var window = angular.element($window),
                    initManager = function ($scope, $element){
                        var $cookies = $injector.has('$cookies') ? $injector.get('$cookies') : false;
                        $scope.grManager.settings = angular.copy(MANAGER.defaultSettings);
                        if (MANAGER.settings) { $.extend($scope.grManager.settings, MANAGER.settings); }
                        $scope.grManager.filterType = $scope.grManager.settings.filter;
                        var grFilters = {
                                byType: function (value) {
                                    var items = angular.copy($scope.grManager.allItems);
                                    filteredItems = [];
                                    if (value !== 'all') {
                                        angular.forEach(items, function (item) {
                                            if (item.extension && item.fileType) {
                                                if (item.fileType === value) {
                                                    filteredItems.push(item);
                                                }
                                            } else {
                                                filteredItems.push(item);
                                            }
                                        });
                                    } else {
                                        filteredItems = items;
                                    }
                                    return filteredItems;
                                },
                                byName: function (value) {
                                    var items = angular.copy($scope.grManager.items);
                                    filteredItems = [];
                                    if (value && value !== '') {
                                        angular.forEach(items, function (item) {
                                            if (item.basename) {
                                                if (item.basename.toLowerCase().search(value.toLowerCase()) > -1) {
                                                    filteredItems.push(item);
                                                }
                                            }
                                        });
                                    } else {
                                        filteredItems = items;
                                    }
                                    return filteredItems;
                                }
                            },
                            grOrders = {
                                name: function(){
                                    var items = $scope.grManager.items;
                                    return items.sort(basenameSort);
                                },
                                type: function(reorder){
                                    var items = $scope.grManager.items,
                                        orderedItems = [],
                                        tempDirs = [],
                                        tempFiles = [];
                                    angular.forEach(items, function (item) {
                                        if (item.type === 'dir') {
                                            tempDirs.push(item);
                                        } else {
                                            tempFiles.push(item);
                                        }
                                    });

                                    if(!reorder){
                                        tempDirs.sort(basenameSort);
                                        tempFiles.sort(basenameSort);
                                    }

                                    angular.forEach(tempDirs, function (item) {
                                        orderedItems.push(item);
                                    });
                                    angular.forEach(tempFiles, function (item) {
                                        orderedItems.push(item);
                                    });

                                    return orderedItems;
                                },
                                size: function(){
                                    var items = $scope.grManager.items;
                                    return items.sort(sizeSort);
                                }
                            };
                        $scope.grManager.filter = {
                            byType: {
                                all: {
                                    enable: true,
                                    label: 'Mostar tudo',
                                    extType: 'all',
                                    iconClass: 'fa fa-fw fa-asterisk'
                                },
                                dir: {
                                    enable: true,
                                    label: 'Apenas pastas',
                                    extType: 'dir',
                                    iconClass: 'fa fa-fw fa-folder'
                                },
                                image: {
                                    enable: true,
                                    label: 'Apenas imagens',
                                    extType: 'image',
                                    iconClass: 'fa fa-fw fa-camera'
                                },
                                video: {
                                    enable: true,
                                    label: 'Apenas videos',
                                    extType: 'video',
                                    iconClass: 'fa fa-fw fa-video-camera'
                                },
                                text: {
                                    enable: true,
                                    label: 'Apenas textos',
                                    extType: 'text',
                                    iconClass: 'fa fa-fw fa-file-text-o'
                                },
                                pdf: {
                                    enable: true,
                                    label: 'Apenas PDF',
                                    extType: 'pdf',
                                    iconClass: 'fa fa-fw fa-file-pdf-o'
                                }
                            }
                        };
                        $scope.grManager.order = {
                            type: {
                                label: 'Ordenar por tipo',
                                value: 'type'
                            },
                            name: {
                                label: 'Ordenar por nome',
                                value: 'name'
                            },
                            size: {
                                label: 'Ordenar por tamanho',
                                value: 'size'
                            }
                        };
                        $scope.grManager.addFolder = function(){
                            var modal = MODAL.new({
                                name: 'gr-file-manager-add-folder',
                                title: 'Create folder',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/add-folder.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                buttons: [{
                                    type: 'success',
                                    label: 'Create',
                                    attr: {
                                        'gr-enter-bind': ''
                                    },
                                    onClick: function(scope, element, controller){
                                        if(angular.isDefined(scope.path) && scope.path !== ''){
                                            createFolder(scope.path);
                                            controller.close();
                                        }
                                    }
                                },{
                                    type: 'danger',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.renameFolder = function(path){
                            path = path ? path : $scope.grManager.dir.current.path;
                            var modal = MODAL.new({
                                name: 'gr-file-manager-rename-folder',
                                title: 'Rename folder',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/rename-folder.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    curFolder: path
                                },
                                buttons: [{
                                    type: 'success',
                                    label: 'Save',
                                    attr: {
                                        'gr-enter-bind': ''
                                    },
                                    onClick: function(scope, element, controller){
                                        if(angular.isDefined(scope.newName) && scope.newName !== ''){
                                            renameFolder(path, scope.newName);
                                            controller.close();
                                        }
                                    }
                                },{
                                    type: 'danger',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.deleteFolder = function(path){
                            path = path ? path : $scope.grManager.dir.current.path;
                            var modal = MODAL.new({
                                name: 'gr-file-manager-delete-folder',
                                title: 'Delete folder',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/delete-folder.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    curFolder: path
                                },
                                buttons: [{
                                    type: 'danger',
                                    label: 'Delete',
                                    onClick: function(scope, element, controller){
                                        deleteFolder(path);
                                        controller.close();
                                    }
                                },{
                                    type: 'default',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.renameFile = function(path){
                            var modal = MODAL.new({
                                name: 'gr-file-manager-rename-file',
                                title: 'Rename file',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/rename-file.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    curFile: path
                                },
                                buttons: [{
                                    type: 'success',
                                    label: 'Save',
                                    attr: {
                                        'gr-enter-bind': ''
                                    },
                                    onClick: function(scope, element, controller){
                                        if(angular.isDefined(scope.newName) && scope.newName !== ''){
                                            renameFile(path, scope.newName);
                                            controller.close();
                                        }
                                    }
                                },{
                                    type: 'default',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.deleteFile = function(path){
                            var modal = MODAL.new({
                                name: 'gr-file-manager-delete-file',
                                title: 'Delete file',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/delete-file.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    curFile: path
                                },
                                buttons: [{
                                    type: 'danger',
                                    label: 'Delete',
                                    onClick: function(scope, element, controller){
                                        deleteFile(path);
                                        controller.close();
                                    }
                                },{
                                    type: 'default',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.deleteFiles = function(){
                            var modal = MODAL.new({
                                name: 'gr-file-manager-delete-files',
                                title: 'Delete files',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/delete-files.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    files: $scope.grManager.selection
                                },
                                buttons: [{
                                    type: 'danger',
                                    label: 'Delete',
                                    onClick: function(scope, element, controller){
                                        deleteFiles();
                                        controller.close();
                                    }
                                },{
                                    type: 'default',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.itemInfo = function(item){
                            var modal = MODAL.new({
                                name: 'gr-file-manager-item-info',
                                title: 'Informações',
                                size: 'md',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/item-info.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    item: item
                                },
                                buttons: [{
                                    type: 'primary',
                                    label: 'Ok',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }]
                            });
                            modal.open();
                        };
                        $scope.grManager.toggleSelection = function(path){
                            if(path !== 'all'){
                                angular.forEach($scope.grManager.items, function(item){
                                    if(item.path === path){
                                        item.selected = item.selected ? false : true;
                                        if(item.selected){
                                            if($scope.grManager.selection.indexOf(item) === -1){
                                                if(!$scope.grManager.settings.multiple){
                                                    $scope.grManager.selection = [];
                                                    MANAGER.selection.remove('all');
                                                }
                                                $scope.grManager.selection.push(item);
                                                MANAGER.selection.set(item);
                                            }
                                        }else{
                                            var index = $scope.grManager.selection.indexOf(item);
                                            if(index > -1){
                                                $scope.grManager.selection.splice(index, 1);
                                                MANAGER.selection.remove(item);
                                            }
                                        }
                                    }else if(!$scope.grManager.settings.multiple){
                                        item.selected = false;
                                    }
                                });
                                if($scope.grManager.selection.length < $scope.grManager.filesLength){
                                    $scope.grManager.allSelected = false;
                                }else{
                                    $scope.grManager.allSelected = true;
                                }
                            }else{
                                if($scope.grManager.selection.length < $scope.grManager.filesLength){
                                    $scope.grManager.allSelected = false;
                                }
                                angular.forEach($scope.grManager.items, function(item){
                                    if(item.type !== 'dir'){
                                        item.selected = $scope.grManager.allSelected ? false : true;
                                        if(item.selected){
                                            if($scope.grManager.selection.indexOf(item) === -1){
                                                $scope.grManager.selection.push(item);
                                                MANAGER.selection.set(item);
                                            }
                                        }else{
                                            var index = $scope.grManager.selection.indexOf(item);
                                            if(index > -1){
                                                $scope.grManager.selection.splice(index, 1);
                                                MANAGER.selection.remove(item);
                                            }
                                        }
                                    }
                                });
                                $scope.grManager.allSelected = $scope.grManager.allSelected ? false : true;
                                if(!$scope.grManager.allSelected){
                                    $scope.grManager.selection = [];
                                    MANAGER.selection.remove('all');

                                }
                            }
                        }
                        $scope.grManager.uploadFile = function(){
                            var modal = MODAL.new({
                                name: 'gr-file-manager-upload-file',
                                title: 'Upload files',
                                size: 'responsive',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/upload-file.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    uploader: $scope.grManager.uploader
                                },
                                buttons: [{
                                    type: 'primary',
                                    label: 'Selecionar arquivo(s)',
                                    labelIcon: 'fa fa-fw fa-plus',
                                    onClick: function(scope, element, controller){
                                        $timeout(function(){
                                            element.find('#ger-upload-file-select').click();
                                        });
                                    }
                                },{
                                    type: 'success',
                                    label: 'Upload all',
                                    labelIcon: 'glyphicon glyphicon-upload',
                                    attr: {
                                        'ng-disabled': '!$parent.uploader.getNotUploadedItems().length'
                                    },
                                    onClick: function(scope, element, controller){
                                        scope.uploader.uploadAll();
                                    }
                                },{
                                    type: 'danger',
                                    label: 'Cancel all',
                                    labelIcon: 'glyphicon glyphicon-ban-circle',
                                    attr: {
                                        'ng-disabled': '!$parent.uploader.isUploading'
                                    },
                                    onClick: function(scope, element, controller){
                                        scope.uploader.cancelAll();
                                    }
                                },{
                                    type: 'danger',
                                    label: 'Remove all',
                                    labelIcon: 'glyphicon glyphicon-trash',
                                    attr: {
                                        'ng-disabled': '!$parent.uploader.queue.length'
                                    },
                                    onClick: function(scope, element, controller){
                                        scope.uploader.clearQueue();
                                    }
                                },{
                                    type: 'danger',
                                    label: 'Close',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            var modalOpended = modal.open();
                            $timeout(function(){
                                $scope.grManager.uploader.modal = modalOpended.element;
                            },100);
                        };
                        $scope.grManager.download = function(file){
                            if(!file){
                                var zip = new JSZip(), countSelection = 0;
                                angular.forEach($scope.grManager.selection, function(file){
                                    var xhr = new XMLHttpRequest();
                                    xhr.open('GET', GRIFFO.baseUrl + GRIFFO.uploadPath + file.path, true);
                                    xhr.responseType = 'arraybuffer';
                                    xhr.onload = function(e) {
                                        if (this.status == 200) {
                                            zip.file(file.basename, this.response);
                                            countSelection ++;
                                            if(countSelection === $scope.grManager.selection.length){
                                                zip = zip.generate({type:"blob"});
                                                saveAs(zip, $scope.grManager.dir.current.basename + '.zip');
                                            }
                                        }
                                    };
                                    xhr.send();
                                });
                            }else{
                                var xhr = new XMLHttpRequest();
                                xhr.open('GET', GRIFFO.baseUrl + GRIFFO.uploadPath + file.path, true);
                                xhr.responseType = 'blob';
                                xhr.onload = function(e) {
                                    if (this.status == 200) {
                                        saveAs(this.response, file.basename);
                                    }
                                };
                                xhr.send();
                            }
                        };
                        $scope.grManager.moveFiles = function(){
                            var items = [];
                            angular.forEach($scope.grManager.breadcrumb.breads, function(item){
                                items.push({
                                    label: item.label !== '/' ? '/ ' + item.path.split('/').join(' / ') : item.label,
                                    path: item.path || '/'
                                });
                            });
                            angular.forEach($scope.grManager.items, function(item){
                                if(item.type === 'dir'){
                                    items.push({
                                        label: '/ ' + item.path.split('/').join(' / '),
                                        path: item.path
                                    });
                                }
                            });
                            var modal = MODAL.new({
                                name: 'gr-file-manager-move-files',
                                title: 'Move files',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/move.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    items: items
                                },
                                buttons: [{
                                    type: 'danger',
                                    label: 'Move',
                                    attr: {
                                        'ng-disabled': '!$parent.target'
                                    },
                                    onClick: function(scope, element, controller){
                                        moveFiles(scope.target !== '/' ? scope.target : '');
                                        controller.close();
                                    }
                                },{
                                    type: 'default',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.moveFolder = function(folder){
                            var items = [];
                            angular.forEach($scope.grManager.breadcrumb.breads, function(item){
                                items.push({
                                    label: item.label !== '/' ? '/ ' + item.path.split('/').join(' / ') : item.label,
                                    path: item.path || '/'
                                });
                            });
                            angular.forEach($scope.grManager.items, function(item){
                                if(item.type === 'dir' && item !== folder){
                                    items.push({
                                        label: '/ ' + item.path.split('/').join(' / '),
                                        path: item.path
                                    });
                                }
                            });
                            var modal = MODAL.new({
                                name: 'gr-file-manager-move-folder',
                                title: 'Move folder',
                                size: 'sm',
                                model: GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/view/move.php',
                                zIndex: MANAGER.settings.zIndex ? MANAGER.settings.zIndex + 20 : false,
                                define: {
                                    items: items
                                },
                                buttons: [{
                                    type: 'danger',
                                    label: 'Move',
                                    attr: {
                                        'ng-disabled': '!$parent.target'
                                    },
                                    onClick: function(scope, element, controller){
                                        moveFolder(folder, scope.target !== '/' ? scope.target : '');
                                        controller.close();
                                    }
                                },{
                                    type: 'default',
                                    label: 'Cancel',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }],
                                onClose: modalOnClose
                            });
                            modal.open();
                        };
                        $scope.grManager.reload = loadItems;
                        $scope.$watch('grManager.filterType', function (v) {
                            $scope.grManager.filterName = '';
                            defineItems();
                        }, true);
                        $scope.$watch('grManager.orderBy', function (v) {
                            defineItems();
                        }, true);
                        $scope.$watch('grManager.filterName', function (v) {
                            defineItems();
                        }, true);
                        $scope.$watch('grManager.dir.current', function (v) {
                            if (angular.isDefined(v) && angular.isDefined(v.path)) {
                                var tempBread = (/[^\/]([^\/]+)([\/]{1}[^\/]+)*/g).test(v.path) ? v.path.split('/') : [v.path],
                                    breadcrumb = [],
                                    prevDir = [];

                                if (tempBread[0] !== '/') {
                                    tempBread.unshift('/');
                                }
                                angular.forEach(tempBread, function (bread, id) {
                                    bread = bread.trim();
                                    if (id < tempBread.length - 1 && id > 0) {
                                        prevDir.push(bread);
                                    }
                                    breadcrumb.push({
                                        label: bread,
                                        path: joinBread(tempBread, id),
                                        current: (id === tempBread.length - 1)
                                    });
                                });
                                $scope.grManager.breadcrumb.breads = breadcrumb;
                                $scope.grManager.dir.prev = $scope.grManager.dir.current !== '' ? prevDir.join('/') : false;
                            }
                        }, true);
                        function loadItems(path) {
                            resetVars();
                            $scope.grManager.isLoading = true;
                            if($cookies){
                                $cookies['grFileManagerFolder_UserId' + GRIFFO.user.id] = (path && path !== '/') ? path : '';
                            }
                            REST.fileManager({
                                action: 'list_contents',
                                post: {
                                    path: (path && path !== '/') ? path : ''
                                }
                            }).then(function (r) {
                                if(r.response){
                                    var response = [],
                                        currentDir = r.response.path;
                                    currentDir.dirname = currentDir.dirname.replace('\\', '/');
                                    currentDir.path = currentDir.path.replace('\\', '/');
                                    angular.forEach(r.response.contents, function (item) {
                                        if (item.extension) {
                                            item.fileType = getExtType(item.extension);
                                        }
                                        item.dirname = item.dirname.replace('\\', '/');
                                        item.path = item.path.replace('\\', '/');
                                        response.push(item);
                                    });
                                    $scope.grManager.dir.current = currentDir;
                                    $scope.grManager.items = response;
                                    $scope.grManager.allItems = response;
                                    $scope.grManager.isLoading = false;
                                    $scope.grManager.filterName = '';
                                    defineItems();
                                    setChangeEvents();
                                }else{
                                    loadItems();
                                }
                            }, function (e) {
                                console.debug(e);
                                $scope.grManager.isLoading = false;
                                setChangeEvents();
                            });
                        }
                        function defineItems() {
                            filterItems('byType', $scope.grManager.filterType);
                            filterItems('byName', $scope.grManager.filterName);
                            orderItems($scope.grManager.orderBy);
                            angular.forEach($scope.grManager.items, function(item){
                                if(item.type !== 'dir'){
                                    $scope.grManager.filesLength ++;
                                }
                            });
                            setChangeEvents();
                        }
                        function setChangeEvents(){
                            $timeout(function(){ angular.element('.imgLiquidFill').imgLiquid(); });
                            window.trigger('resize2');
                            if(angular.isDefined($scope.grManager.uploader)){
                                $scope.grManager.uploader.formData[0].path = $scope.grManager.dir.current.path;
                            }
                        }
                        function orderItems(orderBy) {
                            $scope.grManager.items = grOrders[orderBy]();
                            if(orderBy !== 'type'){
                                $scope.grManager.items = grOrders.type(true);
                            }
                        }
                        function filterItems(filter, value) {
                            filteredItems = grFilters[filter](value);
                            $scope.grManager.items = filteredItems;
                        }
                        function createFolder(path) {
                            path = ($scope.grManager.dir.current.path !== '/') ? $scope.grManager.dir.current.path + '/' + path : path;
                            REST.fileManager({
                                action: 'add_folder',
                                post: {
                                    'path': path
                                }
                            }).then(function (r) {
                                if(r.response){
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao renomear a pasta, entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function renameFolder(path, name) {
                            var curPath = path.split('/');
                            if(curPath.length > 1){
                                curPath.pop();
                                curPath = curPath.join('/');
                                curPath += '/';
                            }else{
                                curPath = '';
                            }
                            REST.fileManager({
                                action: 'rename_folder',
                                post: {
                                    'name': path,
                                    'new-name': curPath + name
                                }
                            }).then(function (r) {
                                if(r.response){
                                    if(path === $scope.grManager.dir.current){
                                        $scope.grManager.dir.current = r.response.path;
                                    }
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao renomear a pasta, entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function deleteFolder(path){
                            REST.fileManager({
                                action: 'delete_folder',
                                post: {
                                    'folder': path
                                }
                            }).then(function (r) {
                                if(r.response){
                                    if(path === $scope.grManager.dir.current.path){
                                        $scope.grManager.dir.current.path = $scope.grManager.dir.prev;
                                    }
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao excluir a pasta, entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function renameFile(path, name) {
                            var ext = path.indexOf('.') > -1 ? '.' + path.split('.').pop() : '',
                                curPath = path.split('/');
                            if(curPath.length > 1){
                                curPath.pop();
                                curPath = curPath.join('/');
                                curPath += '/';
                            }else{
                                curPath = '';
                            }
                            REST.fileManager({
                                action: 'rename_file',
                                post: {
                                    'name': path,
                                    'new-name': curPath + name + ext
                                }
                            }).then(function (r) {
                                if(r.response){
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao renomear o arquivo, entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function deleteFile(path){
                            REST.fileManager({
                                action: 'delete_file',
                                post: {
                                    'file': path
                                }
                            }).then(function (r) {
                                if(r.response){
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao excluir o arquivo, entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function deleteFiles(){
                            var files = [];
                            angular.forEach($scope.grManager.selection, function(file){
                                files.push(file.path);
                            });
                            REST.fileManager({
                                action: 'delete_files',
                                post: {
                                    'files': files
                                }
                            }).then(function (r) {
                                if(r.response){
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao excluir os arquivos, entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function moveFiles(target){
                            var files = [];
                            angular.forEach($scope.grManager.selection, function(file){
                                files.push({
                                    basename: file.basename,
                                    dirname: file.dirname
                                });
                            });
                            REST.fileManager({
                                action: 'move_files',
                                post: {
                                    'files': files,
                                    'path': target
                                }
                            }).then(function (r) {
                                if(r.response){
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao mover o(s) arquivo(s), entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function moveFolder(folder, target){
                            REST.fileManager({
                                action: 'move_folder',
                                post: {
                                    'folder': {
                                        'basename': folder.basename,
                                        'dirname': folder.dirname
                                    },
                                    'path': target
                                }
                            }).then(function (r) {
                                if(r.response){
                                    $scope.grManager.reload($scope.grManager.dir.current.path);
                                }else{
                                    grAlert.show('danger', ['Ocorreu um erro ao mover a pasta, entre em contato com o administrador do sistema!']);
                                }
                            }, function (e) {
                                console.debug(e);
                                setChangeEvents();
                            });
                        }
                        function initUploader(){
                            var uploader = $scope.grManager.uploader = new FileUploader({
                                url: GRIFFO.baseUrl + GRIFFO.restPath + 'gallery/upload_file',
                                formData: [{
                                    path: '',
                                    token: GRIFFO.user.token
                                }]
                            });

                            uploader.getType = getExtType;

                            // FILTERS

                            uploader.filters.push({
                                name: 'sizeFilter',
                                fn: function(item, options) {
                                    if(item.size > 2097152){
                                        return false;
                                    }else{
                                        return true;
                                    }
                                }
                            },{
                                name: 'imageFilter',
                                fn: function(item /*{File|FileLikeObject}*/, options) {
                                    if($scope.grManager.settings.filter === 'image'){
                                        return getExtType(item.name, true) === 'image';
                                    }else{
                                        return true;
                                    }
                                }
                            },{
                                name: 'musicFilter',
                                fn: function(item, options) {
                                    if($scope.grManager.settings.filter === 'music'){
                                        return getExtType(item.name, true) === 'music';
                                    }else{
                                        return true;
                                    }
                                }
                            },{
                                name: 'videoFilter',
                                fn: function(item, options) {
                                    if($scope.grManager.settings.filter === 'video'){
                                        return getExtType(item.name, true) === 'video';
                                    }else{
                                        return true;
                                    }
                                }
                            },{
                                name: 'textFilter',
                                fn: function(item, options) {
                                    if($scope.grManager.settings.filter === 'text'){
                                        return getExtType(item.name, true) === 'text';
                                    }else{
                                        return true;
                                    }
                                }
                            },{
                                name: 'pdfFilter',
                                fn: function(item, options) {
                                    if($scope.grManager.settings.filter === 'pdf'){
                                        return getExtType(item.name, true) === 'pdf';
                                    }else{
                                        return true;
                                    }
                                }
                            },{
                                name: 'allFiles',
                                fn: function(item, options) {
                                    return getExtType(item.name, true) !== 'undefined';
                                }
                            });

                            // CALLBACKS

                            uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
                                //console.info('onWhenAddingFileFailed', item, filter, options);
                                    var uploaderModal = ALERT.new(uploader.modal);
                                if(filter.name === 'sizeFilter'){
                                    var text = 'The file size cannot be larger than |%1|, so \"|%2|\" is not added to upload queue.';
                                    //if($injector.has('$translate')){ text = $filter('translate')(text); }
                                    text = text.replace('|%1|', '2MB').replace('|%2|',item.name);
                                    uploaderModal.show('danger', [text]);
                                }else{
                                    var text = 'The file format \"|%1|\" is not allowed, so \"|%2|\" is not added to upload queue.';
                                    //if($injector.has('$translate')){ text = $filter('translate')(text); }
                                    var ext = item.name.split('.');
                                        ext = ext[ext.length-1].toUpperCase();
                                        text = text.replace('|%1|', ext).replace('|%2|',item.name);
                                    uploaderModal.show('danger', [text]);
                                }
                            };
    //                        uploader.onAfterAddingFile = function(fileItem) {
    //                            console.info('onAfterAddingFile', fileItem);
    //                        };
    //                        uploader.onAfterAddingAll = function(addedFileItems) {
    //                            console.info('onAfterAddingAll', addedFileItems);
    //                        };
    //                        uploader.onBeforeUploadItem = function(item) {
    //                            console.info('onBeforeUploadItem', item);
    //                        };
    //                        uploader.onProgressItem = function(fileItem, progress) {
    //                            console.info('onProgressItem', fileItem, progress);
    //                        };
    //                        uploader.onProgressAll = function(progress) {
    //                            console.info('onProgressAll', progress);
    //                        };
    //                        uploader.onSuccessItem = function(fileItem, response, status, headers) {
    //                            console.info('onSuccessItem', fileItem, response, status, headers);
    //                        };
    //                        uploader.onErrorItem = function(fileItem, response, status, headers) {
    //                            console.info('onErrorItem', fileItem, response, status, headers);
    //                        };
    //                        uploader.onCancelItem = function(fileItem, response, status, headers) {
    //                            console.info('onCancelItem', fileItem, response, status, headers);
    //                        };
    //                        uploader.onCompleteItem = function(fileItem, response, status, headers) {
    //                            console.info('onCompleteItem', fileItem, response, status, headers);
    //                        };
                            uploader.onCompleteAll = function() {
                                $scope.grManager.reload($scope.grManager.dir.current.path);
    //                            console.info('onCompleteAll');
                            };
    //
    //                        console.info('uploader', uploader);
                        }
                        function resetVars(){
                            $scope.grManager.items = [];
                            $scope.grManager.allItems = [];
                            $scope.grManager.dir = {
                                current: '',
                                prev: ''
                            };
                            $scope.grManager.selection = [];
                            MANAGER.selection.remove('all');
                            $scope.grManager.allSelected = false;
                            $scope.grManager.filesLength = 0;
                            $scope.grManager.breadcrumb = {};
                        }
                        function joinBread(breads, pos){
                            var tmp = [];
                            angular.forEach(breads, function (bread, id) {
                                if (id <= pos && id > 0) {
                                    tmp.push(bread);
                                }
                            });
                            return tmp.join('/');
                        }
                        function basenameSort(a, b){
                            var a = a.basename.toUpperCase();
                            var b = b.basename.toUpperCase();
                            return (a < b) ? -1 : (a > b) ? 1 : 0;
                        }
                        function sizeSort(a, b){
                            var a = a.size;
                            var b = b.size;
                            return (a < b) ? -1 : (a > b) ? 1 : 0;
                        }
                        function getExtType(ext, split){
                            if(split){
                                ext = ext.split('.');
                                ext = ext[ext.length - 1];
                            }
                            ext = ext.toLowerCase();
                            var type = '';
                            if ((/(gif|jpg|jpeg|tiff|png|bmp)$/i).test(ext)) {
                                return 'image';
                            } else if ((/(mp3|wma|wav)$/i).test(ext)) {
                                return 'music';
                            } else if ((/(flv|avi|wmv|rm|rmvb|mp4|m4p|m4v|mpg|mp2|mpeg|mpe|mpv|m2v|mov|mkv)$/i).test(ext)) {
                                return 'video';
                            } else if ((/(txt|doc|docx)$/i).test(ext)) {
                                return 'text';
                            } else if ((/(pdf)$/i).test(ext)) {
                                return 'pdf';
                            } else {
                                return 'undefined';
                            }
                        }
                        function modalOnClose(element){
                            $scope.grManager.uploader.clearQueue();
                        }
                        var grAlert = ALERT.new($element.parents('.modal').eq(0));
                        loadItems($cookies['grFileManagerFolder_UserId' + GRIFFO.user.id] || '');
                        initUploader();
                    };
                return {
                    restrict: 'A',
                    link: function ($scope, $element) {
                        $scope.GRIFFO = GRIFFO;
                        $scope.grManager = {
                            items: [],
                            orderBy: 'type',
                            filterType: 'all',
                            filterName: '',
                            isLoading: false
                        };
                        initManager($scope, $element);
                    }
                };
        }])
        .factory('$grFileManager', ['$grModal', '$injector', '$templateCache', '$compile', '$timeout', function(MODAL, $injector, $templateCache, $compile, $timeout){
            var selection = [],
                getSelection = {},
                grFileManager = {
                    settings: {},
                    defaultSettings: {
                        id: 0,
                        filter: 'all',
                        multiple: false,
                        callback: true,
                        path:''
                    },
                    open: function(options){
                        options = options || {};
                        if(!options.path){ options.path = GRIFFO.baseUrl + GRIFFO.librariesPath + 'angular/components/gr-file-manager/'; }
                        angular.extend(grFileManager.settings, grFileManager.defaultSettings, options);
                        var modal = MODAL.new({
                                name: 'global-file-manager',
                                title: 'File manager',
                                size: 'responsive',
                                model: options.path + 'gr-file-manager.php',
                                define: {
                                    grModalId: options.id
                                },
                                zIndex: (options.zIndex && parseInt(options.zIndex) > 0) ? parseInt(options.zIndex) : false,
                                buttons: [{
                                    type: 'primary',
                                    label: 'Get selection',
                                    labelIcon: 'fa fa-fw fa-arrow-circle-o-down',
                                    attr: {
                                        'teste': '{{grManager}}',
                                        'ng-show': '$parent.grManager.settings.callback',
                                        'ng-disabled': '$parent.grManager.selection.length === 0'
                                    },
                                    onClick: function(scope, element, controller){
                                        grFileManager.selection.get(scope.grModalId, true);
                                        controller.close();
                                    }
                                },{
                                    type: 'danger',
                                    label: 'Close',
                                    onClick: function(scope, element, controller){
                                        controller.close();
                                    }
                                }]
                            });
                            modal.open();
                    },
                    selection: {
                        set: function(item){
                            if(selection.indexOf(item) === -1){
                                selection.push(item);
                            }
                        },
                        remove: function(item){
                            if(angular.isObject(item)){
                                if(selection.indexOf(item) > -1){
                                    var index = selection.indexOf(item);
                                    selection.splice(index, 1);
                                }
                            }else if(item === 'all'){
                                selection = [];
                            }
                        },
                        get: function(id, stringfy, divisor){
                            var files;
                            if(stringfy){
                                files ='';
                                angular.forEach(selection, function(item, id){
                                    files += item.path;
                                    if(selection[id+1]){
                                        files += divisor || ';'
                                    }
                                });
                            }else{
                                files = selection;
                            }
                            getSelection[id](files);
                            //return selection;
                        }
                    },
                    onGetSelection: function(fn, id){
                        getSelection[id] = fn;
                    }
                };
            return grFileManager;
        }])
        .directive('ngThumb', ['$window', function($window) {
            var helper = {
                support: !!($window.FileReader && $window.CanvasRenderingContext2D),
                isFile: function(item) {
                    return angular.isObject(item) && item instanceof $window.File;
                },
                isImage: function(file) {
                    var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            };
            return {
                restrict: 'A',
                template: '<canvas/>',
                link: function(scope, element, attributes){
                    if (!helper.support) return;
                    var params = scope.$eval(attributes.ngThumb);
                    if (!helper.isFile(params.file)) return;
                    if (!helper.isImage(params.file)) return;
                    var canvas = element.find('canvas');
                    var reader = new FileReader();
                    reader.onload = onLoadFile;
                    reader.readAsDataURL(params.file);
                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    }
                    function onLoadImage() {
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    }
                }
            };
        }])
        .directive('grFileManagerButton', ['$templateCache', '$timeout', '$compile', '$injector', '$grFileManager', function($templateCache, $timeout, $compile, $injector, MANAGER){
            var id = 0,
                tId = 0;
            return {
                restrict: 'EA',
                template: function(){
                    var thisId = angular.copy(tId),
                        tmpl = $templateCache.get('grFileManager/button.html');
                    while(tmpl.indexOf('%id%') > -1){
                        tmpl = tmpl.replace('%id%', thisId);
                    }
                    tId++;
                    return tmpl;
                },
                replace: true,
                require: '?^form',
                link: function($scope, $element, $attrs, $ctrl){
                    var thisId = angular.copy(id),
                        options = {
                            id: thisId,
                            filter: $attrs.grFilter,
                            multiple: $attrs.hasOwnProperty('grMultiple') ? true : false,
                            callback: $attrs.grCallback ? ($attrs.grCallback === 'true' ? true : false) : undefined
                        };
                    if(!$scope.grManager){
                        $scope.grManager = [];
                    }
                    $scope.grManager[thisId] = {
                        button: {
                            type: $attrs.grType || 'default',
                            label: $attrs.grLabel || '',
                            labelIcon: $attrs.grLabelIcon || ''
                        },
                        filter: options.filter,
                        model: '',
                        name: $attrs.grName,
                        multiple: options.multiple,
                        required: angular.isDefined($attrs.grRequired) ? true : false,
                        open: function(){
                            MANAGER.open(options);
                            $scope.grManager[thisId].filter = MANAGER.settings.filter;
                        },
                        remove: function(file){
                            if(file !== 'all'){
                                var newModel = angular.copy($scope.grManager[thisId].model);
                                if(newModel.indexOf(';' + file) > -1){
                                    newModel = newModel.replace(';' + file, '');
                                }else if(newModel.indexOf(file + ';') > -1){
                                    newModel = newModel.replace(file + ';', '');
                                }else{
                                    newModel = newModel.replace(file, '');
                                }
                                $scope.grManager[thisId].model = newModel;
                            }else{
                                $scope.grManager[thisId].model = '';
                            }
                        }
                    };
                    MANAGER.onGetSelection(function(selection, arr){
                        if(options.multiple){
                            var arr = selection.split(';');
                            if(arr.length > 0){
                                angular.forEach(arr, function(item){
                                    if($scope.grManager[thisId].model.indexOf(item) === -1){
                                        $scope.grManager[thisId].model += ($scope.grManager[thisId].model ? ';' : '') + item;
                                    }
                                });
                            }
                        }else{
                            $scope.grManager[thisId].model = selection;
                        }
                        $timeout(function(){ angular.element('.imgLiquidFill').imgLiquid(); });
                    }, id);
                    if(angular.isDefined($attrs.grForm) && ($attrs.grForm === true || $attrs.grForm === 'true')){
                        var VALIDATOR = $injector.get('$grValidation'),
                            form = VALIDATOR.get($ctrl.$name);
                        if(form.grForm){
                            $scope.grManager[thisId].grController = $ctrl.$name;
                            $scope.grManager[thisId].grRequired = $attrs.hasOwnProperty('grRequired') ? 'required:true' : '';
                        }
                        if(options.callback || angular.isUndefined(options.callback)){
                            var input = (form.grForm ? $templateCache.get('grFileManager/grInput.html') : $templateCache.get('grFileManager/input.html')),
                                display = $templateCache.get('grFileManager/display.html');
                            while(input.indexOf('%id%') > -1){ input = input.replace('%id%', id); }
                            while(display.indexOf('%id%') > -1){ display = display.replace('%id%', id); }
                            input = angular.element(input);
                            display = angular.element(display);
                            $compile(input)($scope);
                            $compile(display)($scope);
                            $element.append(display);
                            $element.append(input);
                            $scope.$watch(function(){
                                return input.attr('class');
                            }, function(_class){
                                var classes = _class.split(' '),
                                    state = '';
                                angular.forEach(classes, function(c){
                                    if(c.indexOf('has-') > -1 && c !== 'has-feedback'){
                                        state = c.split('has-')[1];
                                    }
                                });
                                $scope.grManager[thisId].state = state;
                            });
                            $timeout(function(){ angular.element('.imgLiquidFill').imgLiquid(); });
                        }
                    }else{
                        if(options.callback || angular.isUndefined(options.callback)){
                            var input = $templateCache.get('grFileManager/input.html'),
                                display = $templateCache.get('grFileManager/display.html');
                            while(input.indexOf('%id%') > -1){ input = input.replace('%id%', id); }
                            while(display.indexOf('%id%') > -1){ display = display.replace('%id%', id); }
                            input = angular.element(input);
                            display = angular.element(display);
                            $compile(input)($scope);
                            $compile(display)($scope);
                            $element.append(display);
                            $element.append(input);
                            $timeout(function(){ angular.element('.imgLiquidFill').imgLiquid(); });
                        }
                    }
                    id++;
                }
            }
        }])
        .filter('cutFilename', function () {
            return function (value, wordwise, max, tail) {
                if (!value) return '';
                max = parseInt(max, 10);
                if (!max) return value;
                if (value.length <= max) return value;
                value = value.substr(0, max);
                if (wordwise) {
                    var lastspace = value.lastIndexOf(' ');
                    if (lastspace != -1) {
                        value = value.substr(0, lastspace);
                    }
                }
                return value + (tail || '…');
            };
        })
        .filter('timestamp', function(){
            return function (timestamp) {
                var d = new Date(),
                    formatedDate = new Date(timestamp*1000 + d.getTimezoneOffset() * 60000);
                return formatedDate;
            }
        })
        .run(['$templateCache', function($templateCache){
            $templateCache.put('grFileManager/button.html',
                '<div class="has-feedback" ng-class="grManager[%id%].state ? \'has-\' + grManager[%id%].state : \'\'">' +
                    '<div class="btn-group" ng-class="{\'input-group-required\': grManager[%id%].required}">' +
                        '<button type="button" class="ger-file-button" ng-class="\'btn btn-\' + grManager[%id%].button.type" ng-click="grManager[%id%].open()">' +
                            '<span class="visible-md visible-lg" ng-if="grManager[%id%].button.labelIcon">' +
                                '<i class="{{grManager[%id%].button.labelIcon}}"></i> ' +
                                '{{grManager[%id%].button.label | grTranslate}}' +
                            '</span>' +
                            '<span class="visible-xs visible-sm" ng-if="grManager[%id%].button.labelIcon">' +
                                '<i class="{{grManager[%id%].button.labelIcon}}"></i>' +
                            '</span>' +
                            '<span ng-if="!grManager[%id%].button.labelIcon">' +
                                '{{grManager[%id%].button.label | grTranslate}}' +
                            '</span>' +
                        '</button>' +
                        '<span class="input-group-addon" ng-if="grManager[%id%].state">' +
                            '<i class="fa fa-fw" ng-class="{\'fa-times\': (grManager[%id%].state === \'error\'), \'fa-check\': (grManager[%id%].state === \'success\')}"></i>' +
                        '</span>' +
                    '</div>' +
                '</div>');
            $templateCache.put('grFileManager/input.html', '<input type="text" name="{{grManager[%id%].name}}" ng-model="grManager[%id%].model" class="hidden" ng-readonly="true" />');
            $templateCache.put('grFileManager/grInput.html', '<gr-input gr-type="cleartext" gr-name="{{grManager[%id%].name}}" gr-label="{{grManager[%id%].button.label}}" gr-model="grManager[%id%].model" class="hidden" gr-controller="{{grManager[%id%].grController}}" gr-validate="{{grManager[%id%].grRequired}}" ng-readonly="true"></gr-input>');
            $templateCache.put('grFileManager/display.html',
                '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" ng-if="grManager[%id%].model">' +
                    '<div class="well ger-file-button-display" ng-class="{\'well-table\': !grManager[%id%].multiple}">' +
                        '<div class="ger-file-button-display-header" ng-if="grManager[%id%].multiple">' +
                            '<button type="button" class="btn btn-warning" ng-click="grManager[%id%].remove(\'all\')">{{\'Remove all\' | grTranslate}}</button>' +
                        '</div>' +
                        '<div class="table-responsive">' +
                            '<div class="table-responsive-inner">' +
                                '<div class="col-xs-6 col-sm-3 col-md-2 col-lg-1" ng-if="grManager[%id%].filter === \'image\'" ng-repeat="file in grManager[%id%].model.split(\';\')">' +
                                    '<div class="thumbnail">' +
                                        '<div class="imgLiquidFill imgLiquid">' +
                                            '<img ng-src="{{GRIFFO.baseUrl + GRIFFO.uploadPath + file}}"/>' +
                                        '</div>' +
                                        '<a class="text-danger remove fa fa-fw fa-times" ng-click="grManager[%id%].remove(file)"></a>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<ul ng-if="grManager[%id%].filter !== \'image\'">' +
                            '<li ng-repeat="file in grManager[%id%].model.split(\';\')"><a ng-click="grManager[%id%].remove(file)" class="fa fa-fw fa-times text-danger"></a><i class="fa fa-fw fa-file"></i> {{file}}</li>' +
                        '</ul>' +
                    '</div>' +
                '</div>');
        }]);
})();

var imgLiquid=imgLiquid||{VER:"0.9.944"};imgLiquid.bgs_Available=!1,imgLiquid.bgs_CheckRunned=!1,imgLiquid.injectCss=".imgLiquid img {visibility:hidden}",function(i){function t(){if(!imgLiquid.bgs_CheckRunned){imgLiquid.bgs_CheckRunned=!0;var t=i('<span style="background-size:cover" />');i("body").append(t),!function(){var i=t[0];if(i&&window.getComputedStyle){var e=window.getComputedStyle(i,null);e&&e.backgroundSize&&(imgLiquid.bgs_Available="cover"===e.backgroundSize)}}(),t.remove()}}i.fn.extend({imgLiquid:function(e){this.defaults={fill:!0,verticalAlign:"center",horizontalAlign:"center",useBackgroundSize:!0,useDataHtmlAttr:!0,responsive:!0,delay:0,fadeInTime:0,removeBoxBackground:!0,hardPixels:!0,responsiveCheckTime:500,timecheckvisibility:500,onStart:null,onFinish:null,onItemStart:null,onItemFinish:null,onItemError:null},t();var a=this;return this.options=e,this.settings=i.extend({},this.defaults,this.options),this.settings.onStart&&this.settings.onStart(),this.each(function(t){function e(){-1===u.css("background-image").indexOf(encodeURI(c.attr("src")))&&u.css({"background-image":'url("'+encodeURI(c.attr("src"))+'")'}),u.css({"background-size":g.fill?"cover":"contain","background-position":(g.horizontalAlign+" "+g.verticalAlign).toLowerCase(),"background-repeat":"no-repeat"}),i("a:first",u).css({display:"block",width:"100%",height:"100%"}),i("img",u).css({display:"none"}),g.onItemFinish&&g.onItemFinish(t,u,c),u.addClass("imgLiquid_bgSize"),u.addClass("imgLiquid_ready"),l()}function d(){function e(){c.data("imgLiquid_error")||c.data("imgLiquid_loaded")||c.data("imgLiquid_oldProcessed")||(u.is(":visible")&&c[0].complete&&c[0].width>0&&c[0].height>0?(c.data("imgLiquid_loaded",!0),setTimeout(r,t*g.delay)):setTimeout(e,g.timecheckvisibility))}if(c.data("oldSrc")&&c.data("oldSrc")!==c.attr("src")){var a=c.clone().removeAttr("style");return a.data("imgLiquid_settings",c.data("imgLiquid_settings")),c.parent().prepend(a),c.remove(),c=a,c[0].width=0,setTimeout(d,10),void 0}return c.data("imgLiquid_oldProcessed")?(r(),void 0):(c.data("imgLiquid_oldProcessed",!1),c.data("oldSrc",c.attr("src")),i("img:not(:first)",u).css("display","none"),u.css({overflow:"hidden"}),c.fadeTo(0,0).removeAttr("width").removeAttr("height").css({visibility:"visible","max-width":"none","max-height":"none",width:"auto",height:"auto",display:"block"}),c.on("error",n),c[0].onerror=n,e(),o(),void 0)}function o(){(g.responsive||c.data("imgLiquid_oldProcessed"))&&c.data("imgLiquid_settings")&&(g=c.data("imgLiquid_settings"),u.actualSize=u.get(0).offsetWidth+u.get(0).offsetHeight/1e4,u.sizeOld&&u.actualSize!==u.sizeOld&&r(),u.sizeOld=u.actualSize,setTimeout(o,g.responsiveCheckTime))}function n(){c.data("imgLiquid_error",!0),u.addClass("imgLiquid_error"),g.onItemError&&g.onItemError(t,u,c),l()}function s(){var i={};if(a.settings.useDataHtmlAttr){var t=u.attr("data-imgLiquid-fill"),e=u.attr("data-imgLiquid-horizontalAlign"),d=u.attr("data-imgLiquid-verticalAlign");("true"===t||"false"===t)&&(i.fill=Boolean("true"===t)),void 0===e||"left"!==e&&"center"!==e&&"right"!==e&&-1===e.indexOf("%")||(i.horizontalAlign=e),void 0===d||"top"!==d&&"bottom"!==d&&"center"!==d&&-1===d.indexOf("%")||(i.verticalAlign=d)}return imgLiquid.isIE&&a.settings.ieFadeInDisabled&&(i.fadeInTime=0),i}function r(){var i,e,a,d,o,n,s,r,m=0,h=0,f=u.width(),v=u.height();void 0===c.data("owidth")&&c.data("owidth",c[0].width),void 0===c.data("oheight")&&c.data("oheight",c[0].height),g.fill===f/v>=c.data("owidth")/c.data("oheight")?(i="100%",e="auto",a=Math.floor(f),d=Math.floor(f*(c.data("oheight")/c.data("owidth")))):(i="auto",e="100%",a=Math.floor(v*(c.data("owidth")/c.data("oheight"))),d=Math.floor(v)),o=g.horizontalAlign.toLowerCase(),s=f-a,"left"===o&&(h=0),"center"===o&&(h=.5*s),"right"===o&&(h=s),-1!==o.indexOf("%")&&(o=parseInt(o.replace("%",""),10),o>0&&(h=.01*s*o)),n=g.verticalAlign.toLowerCase(),r=v-d,"left"===n&&(m=0),"center"===n&&(m=.5*r),"bottom"===n&&(m=r),-1!==n.indexOf("%")&&(n=parseInt(n.replace("%",""),10),n>0&&(m=.01*r*n)),g.hardPixels&&(i=a,e=d),c.css({width:i,height:e,"margin-left":Math.floor(h),"margin-top":Math.floor(m)}),c.data("imgLiquid_oldProcessed")||(c.fadeTo(g.fadeInTime,1),c.data("imgLiquid_oldProcessed",!0),g.removeBoxBackground&&u.css("background-image","none"),u.addClass("imgLiquid_nobgSize"),u.addClass("imgLiquid_ready")),g.onItemFinish&&g.onItemFinish(t,u,c),l()}function l(){t===a.length-1&&a.settings.onFinish&&a.settings.onFinish()}var g=a.settings,u=i(this),c=i("img:first",u);return c.length?(c.data("imgLiquid_settings")?(u.removeClass("imgLiquid_error").removeClass("imgLiquid_ready"),g=i.extend({},c.data("imgLiquid_settings"),a.options)):g=i.extend({},a.settings,s()),c.data("imgLiquid_settings",g),g.onItemStart&&g.onItemStart(t,u,c),imgLiquid.bgs_Available&&g.useBackgroundSize?e():d(),void 0):(n(),void 0)})}})}(jQuery),!function(){var i=imgLiquid.injectCss,t=document.getElementsByTagName("head")[0],e=document.createElement("style");e.type="text/css",e.styleSheet?e.styleSheet.cssText=i:e.appendChild(document.createTextNode(i)),t.appendChild(e)}();
!function(a,b){return"function"==typeof define&&define.amd?void define("angular-file-upload",["angular"],function(a){return b(a)}):b(a)}("undefined"==typeof angular?null:angular,function(a){var b=a.module("angularFileUpload",['ng']);return b.value("fileUploaderOptions",{url:"/",alias:"file",headers:{},queue:[],progress:0,autoUpload:!1,removeAfterUpload:!1,method:"POST",filters:[],formData:[],queueLimit:Number.MAX_VALUE,withCredentials:!1}).factory("FileUploader",["fileUploaderOptions","$rootScope","$http","$window","$compile",function(b,c,d,e,f){function g(c){var d=a.copy(b);a.extend(this,d,c,{isUploading:!1,_nextIndex:0,_failFilterIndex:-1,_directives:{select:[],drop:[],over:[]}}),this.filters.unshift({name:"queueLimit",fn:this._queueLimitFilter}),this.filters.unshift({name:"folder",fn:this._folderFilter})}function h(b){var c=a.isElement(b),d=c?b.value:b,e=a.isString(d)?"FakePath":"Object",f="_createFrom"+e;this[f](d)}function i(b,c,d){var e=a.isElement(c),f=e?a.element(c):null,h=e?null:c;a.extend(this,{url:b.url,alias:b.alias,headers:a.copy(b.headers),formData:a.copy(b.formData),removeAfterUpload:b.removeAfterUpload,withCredentials:b.withCredentials,method:b.method},d,{uploader:b,file:new g.FileLikeObject(c),isReady:!1,isUploading:!1,isUploaded:!1,isSuccess:!1,isCancel:!1,isError:!1,progress:0,index:null,_file:h,_input:f}),f&&this._replaceNode(f)}function j(b){a.extend(this,b),this.uploader._directives[this.prop].push(this),this._saveLinks(),this.bind()}function k(){k.super_.apply(this,arguments),this.uploader.isHTML5||this.element.removeAttr("multiple"),this.element.prop("value",null)}function l(){l.super_.apply(this,arguments)}function m(){m.super_.apply(this,arguments)}return g.prototype.isHTML5=!(!e.File||!e.FormData),g.prototype.addToQueue=function(b,c,d){var e=this.isArrayLikeObject(b)?b:[b],f=this._getFilters(d),h=this.queue.length,i=[];a.forEach(e,function(a){var b=new g.FileLikeObject(a);if(this._isValidFile(b,f,c)){var d=new g.FileItem(this,a,c);i.push(d),this.queue.push(d),this._onAfterAddingFile(d)}else{var e=this.filters[this._failFilterIndex];this._onWhenAddingFileFailed(b,e,c)}},this),this.queue.length!==h&&(this._onAfterAddingAll(i),this.progress=this._getTotalProgress()),this._render(),this.autoUpload&&this.uploadAll()},g.prototype.removeFromQueue=function(a){var b=this.getIndexOfItem(a),c=this.queue[b];c.isUploading&&c.cancel(),this.queue.splice(b,1),c._destroy(),this.progress=this._getTotalProgress()},g.prototype.clearQueue=function(){for(;this.queue.length;)this.queue[0].remove();this.progress=0},g.prototype.uploadItem=function(a){var b=this.getIndexOfItem(a),c=this.queue[b],d=this.isHTML5?"_xhrTransport":"_iframeTransport";c._prepareToUploading(),this.isUploading||(this.isUploading=!0,this[d](c))},g.prototype.cancelItem=function(a){var b=this.getIndexOfItem(a),c=this.queue[b],d=this.isHTML5?"_xhr":"_form";c&&c.isUploading&&c[d].abort()},g.prototype.uploadAll=function(){var b=this.getNotUploadedItems().filter(function(a){return!a.isUploading});b.length&&(a.forEach(b,function(a){a._prepareToUploading()}),b[0].upload())},g.prototype.cancelAll=function(){var b=this.getNotUploadedItems();a.forEach(b,function(a){a.cancel()})},g.prototype.isFile=function(a){var b=e.File;return b&&a instanceof b},g.prototype.isFileLikeObject=function(a){return a instanceof g.FileLikeObject},g.prototype.isArrayLikeObject=function(b){return a.isObject(b)&&"length"in b},g.prototype.getIndexOfItem=function(b){return a.isNumber(b)?b:this.queue.indexOf(b)},g.prototype.getNotUploadedItems=function(){return this.queue.filter(function(a){return!a.isUploaded})},g.prototype.getReadyItems=function(){return this.queue.filter(function(a){return a.isReady&&!a.isUploading}).sort(function(a,b){return a.index-b.index})},g.prototype.destroy=function(){a.forEach(this._directives,function(b){a.forEach(this._directives[b],function(a){a.destroy()},this)},this)},g.prototype.onAfterAddingAll=function(){},g.prototype.onAfterAddingFile=function(){},g.prototype.onWhenAddingFileFailed=function(){},g.prototype.onBeforeUploadItem=function(){},g.prototype.onProgressItem=function(){},g.prototype.onProgressAll=function(){},g.prototype.onSuccessItem=function(){},g.prototype.onErrorItem=function(){},g.prototype.onCancelItem=function(){},g.prototype.onCompleteItem=function(){},g.prototype.onCompleteAll=function(){},g.prototype._getTotalProgress=function(a){if(this.removeAfterUpload)return a||0;var b=this.getNotUploadedItems().length,c=b?this.queue.length-b:this.queue.length,d=100/this.queue.length,e=(a||0)*d/100;return Math.round(c*d+e)},g.prototype._getFilters=function(b){if(a.isUndefined(b))return this.filters;if(a.isArray(b))return b;var c=b.match(/[^\s,]+/g);return this.filters.filter(function(a){return-1!==c.indexOf(a.name)},this)},g.prototype._render=function(){c.$$phase||c.$apply()},g.prototype._folderFilter=function(a){return!(!a.size&&!a.type)},g.prototype._queueLimitFilter=function(){return this.queue.length<this.queueLimit},g.prototype._isValidFile=function(a,b,c){return this._failFilterIndex=-1,b.length?b.every(function(b){return this._failFilterIndex++,b.fn.call(this,a,c)},this):!0},g.prototype._isSuccessCode=function(a){return a>=200&&300>a||304===a},g.prototype._transformResponse=function(b){return a.forEach(d.defaults.transformResponse,function(a){b=a(b)}),b},g.prototype._parseHeaders=function(b){function c(a){return a.replace(/^\s+/,"").replace(/\s+$/,"")}function d(a){return a.toLowerCase()}var e,f,g,h={};return b?(a.forEach(b.split("\n"),function(a){g=a.indexOf(":"),e=d(c(a.substr(0,g))),f=c(a.substr(g+1)),e&&(h[e]=h[e]?h[e]+", "+f:f)}),h):h},g.prototype._xhrTransport=function(b){var c=b._xhr=new XMLHttpRequest,d=new FormData,e=this;e._onBeforeUploadItem(b),a.forEach(b.formData,function(b){a.forEach(b,function(a,b){d.append(b,a)})}),d.append(b.alias,b._file,b.file.name),c.upload.onprogress=function(a){var c=Math.round(a.lengthComputable?100*a.loaded/a.total:0);e._onProgressItem(b,c)},c.onload=function(){var a=e._parseHeaders(c.getAllResponseHeaders()),d=e._transformResponse(c.response),f=e._isSuccessCode(c.status)?"Success":"Error",g="_on"+f+"Item";e[g](b,d,c.status,a),e._onCompleteItem(b,d,c.status,a)},c.onerror=function(){var a=e._parseHeaders(c.getAllResponseHeaders()),d=e._transformResponse(c.response);e._onErrorItem(b,d,c.status,a),e._onCompleteItem(b,d,c.status,a)},c.onabort=function(){var a=e._parseHeaders(c.getAllResponseHeaders()),d=e._transformResponse(c.response);e._onCancelItem(b,d,c.status,a),e._onCompleteItem(b,d,c.status,a)},c.open(b.method,b.url,!0),c.withCredentials=b.withCredentials,a.forEach(b.headers,function(a,b){c.setRequestHeader(b,a)}),c.send(d),this._render()},g.prototype._iframeTransport=function(b){var c=a.element('<form style="display: none;" />'),d=a.element('<iframe name="iframeTransport'+Date.now()+'">'),e=b._input,f=this;b._form&&b._form.replaceWith(e),b._form=c,f._onBeforeUploadItem(b),e.prop("name",b.alias),a.forEach(b.formData,function(b){a.forEach(b,function(b,d){c.append(a.element('<input type="hidden" name="'+d+'" value="'+b+'" />'))})}),c.prop({action:b.url,method:"POST",target:d.prop("name"),enctype:"multipart/form-data",encoding:"multipart/form-data"}),d.bind("load",function(){try{var a=d[0].contentDocument.body.innerHTML}catch(c){}var e={response:a,status:200,dummy:!0},g=f._transformResponse(e.response),h={};f._onSuccessItem(b,g,e.status,h),f._onCompleteItem(b,g,e.status,h)}),c.abort=function(){var a,g={status:0,dummy:!0},h={};d.unbind("load").prop("src","javascript:false;"),c.replaceWith(e),f._onCancelItem(b,a,g.status,h),f._onCompleteItem(b,a,g.status,h)},e.after(c),c.append(e).append(d),c[0].submit(),this._render()},g.prototype._onWhenAddingFileFailed=function(a,b,c){this.onWhenAddingFileFailed(a,b,c)},g.prototype._onAfterAddingFile=function(a){this.onAfterAddingFile(a)},g.prototype._onAfterAddingAll=function(a){this.onAfterAddingAll(a)},g.prototype._onBeforeUploadItem=function(a){a._onBeforeUpload(),this.onBeforeUploadItem(a)},g.prototype._onProgressItem=function(a,b){var c=this._getTotalProgress(b);this.progress=c,a._onProgress(b),this.onProgressItem(a,b),this.onProgressAll(c),this._render()},g.prototype._onSuccessItem=function(a,b,c,d){a._onSuccess(b,c,d),this.onSuccessItem(a,b,c,d)},g.prototype._onErrorItem=function(a,b,c,d){a._onError(b,c,d),this.onErrorItem(a,b,c,d)},g.prototype._onCancelItem=function(a,b,c,d){a._onCancel(b,c,d),this.onCancelItem(a,b,c,d)},g.prototype._onCompleteItem=function(b,c,d,e){b._onComplete(c,d,e),this.onCompleteItem(b,c,d,e);var f=this.getReadyItems()[0];return this.isUploading=!1,a.isDefined(f)?void f.upload():(this.onCompleteAll(),this.progress=this._getTotalProgress(),void this._render())},g.isFile=g.prototype.isFile,g.isFileLikeObject=g.prototype.isFileLikeObject,g.isArrayLikeObject=g.prototype.isArrayLikeObject,g.isHTML5=g.prototype.isHTML5,g.inherit=function(a,b){a.prototype=Object.create(b.prototype),a.prototype.constructor=a,a.super_=b},g.FileLikeObject=h,g.FileItem=i,g.FileDirective=j,g.FileSelect=k,g.FileDrop=l,g.FileOver=m,h.prototype._createFromFakePath=function(a){this.lastModifiedDate=null,this.size=null,this.type="like/"+a.slice(a.lastIndexOf(".")+1).toLowerCase(),this.name=a.slice(a.lastIndexOf("/")+a.lastIndexOf("\\")+2)},h.prototype._createFromObject=function(b){this.lastModifiedDate=a.copy(b.lastModifiedDate),this.size=b.size,this.type=b.type,this.name=b.name},i.prototype.upload=function(){this.uploader.uploadItem(this)},i.prototype.cancel=function(){this.uploader.cancelItem(this)},i.prototype.remove=function(){this.uploader.removeFromQueue(this)},i.prototype.onBeforeUpload=function(){},i.prototype.onProgress=function(){},i.prototype.onSuccess=function(){},i.prototype.onError=function(){},i.prototype.onCancel=function(){},i.prototype.onComplete=function(){},i.prototype._onBeforeUpload=function(){this.isReady=!0,this.isUploading=!0,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!1,this.isError=!1,this.progress=0,this.onBeforeUpload()},i.prototype._onProgress=function(a){this.progress=a,this.onProgress(a)},i.prototype._onSuccess=function(a,b,c){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!0,this.isCancel=!1,this.isError=!1,this.progress=100,this.index=null,this.onSuccess(a,b,c)},i.prototype._onError=function(a,b,c){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!1,this.isCancel=!1,this.isError=!0,this.progress=0,this.index=null,this.onError(a,b,c)},i.prototype._onCancel=function(a,b,c){this.isReady=!1,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!0,this.isError=!1,this.progress=0,this.index=null,this.onCancel(a,b,c)},i.prototype._onComplete=function(a,b,c){this.onComplete(a,b,c),this.removeAfterUpload&&this.remove()},i.prototype._destroy=function(){this._input&&this._input.remove(),this._form&&this._form.remove(),delete this._form,delete this._input},i.prototype._prepareToUploading=function(){this.index=this.index||++this.uploader._nextIndex,this.isReady=!0},i.prototype._replaceNode=function(a){var b=f(a.clone())(a.scope());b.prop("value",null),a.css("display","none"),a.after(b)},j.prototype.events={},j.prototype.bind=function(){for(var a in this.events){var b=this.events[a];this.element.bind(a,this[b])}},j.prototype.unbind=function(){for(var a in this.events)this.element.unbind(a,this.events[a])},j.prototype.destroy=function(){var a=this.uploader._directives[this.prop].indexOf(this);this.uploader._directives[this.prop].splice(a,1),this.unbind()},j.prototype._saveLinks=function(){for(var a in this.events){var b=this.events[a];this[b]=this[b].bind(this)}},g.inherit(k,j),k.prototype.events={$destroy:"destroy",change:"onChange"},k.prototype.prop="select",k.prototype.getOptions=function(){},k.prototype.getFilters=function(){},k.prototype.isEmptyAfterSelection=function(){return!!this.element.attr("multiple")},k.prototype.onChange=function(){var a=this.uploader.isHTML5?this.element[0].files:this.element[0],b=this.getOptions(),c=this.getFilters();this.uploader.isHTML5||this.destroy(),this.uploader.addToQueue(a,b,c),this.isEmptyAfterSelection()&&this.element.prop("value",null)},g.inherit(l,j),l.prototype.events={$destroy:"destroy",drop:"onDrop",dragover:"onDragOver",dragleave:"onDragLeave"},l.prototype.prop="drop",l.prototype.getOptions=function(){},l.prototype.getFilters=function(){},l.prototype.onDrop=function(b){var c=this._getTransfer(b);if(c){var d=this.getOptions(),e=this.getFilters();this._preventAndStop(b),a.forEach(this.uploader._directives.over,this._removeOverClass,this),this.uploader.addToQueue(c.files,d,e)}},l.prototype.onDragOver=function(b){var c=this._getTransfer(b);this._haveFiles(c.types)&&(c.dropEffect="copy",this._preventAndStop(b),a.forEach(this.uploader._directives.over,this._addOverClass,this))},l.prototype.onDragLeave=function(b){b.target===this.element[0]&&(this._preventAndStop(b),a.forEach(this.uploader._directives.over,this._removeOverClass,this))},l.prototype._getTransfer=function(a){return a.dataTransfer?a.dataTransfer:a.originalEvent.dataTransfer},l.prototype._preventAndStop=function(a){a.preventDefault(),a.stopPropagation()},l.prototype._haveFiles=function(a){return a?a.indexOf?-1!==a.indexOf("Files"):a.contains?a.contains("Files"):!1:!1},l.prototype._addOverClass=function(a){a.addOverClass()},l.prototype._removeOverClass=function(a){a.removeOverClass()},g.inherit(m,j),m.prototype.events={$destroy:"destroy"},m.prototype.prop="over",m.prototype.overClass="nv-file-over",m.prototype.addOverClass=function(){this.element.addClass(this.getOverClass())},m.prototype.removeOverClass=function(){this.element.removeClass(this.getOverClass())},m.prototype.getOverClass=function(){return this.overClass},g}]).directive("nvFileSelect",["$parse","FileUploader",function(a,b){return{link:function(c,d,e){var f=c.$eval(e.uploader);if(!(f instanceof b))throw new TypeError('"Uploader" must be an instance of FileUploader');var g=new b.FileSelect({uploader:f,element:d});g.getOptions=a(e.options).bind(g,c),g.getFilters=function(){return e.filters}}}}]).directive("nvFileDrop",["$parse","FileUploader",function(a,b){return{link:function(c,d,e){var f=c.$eval(e.uploader);if(!(f instanceof b))throw new TypeError('"Uploader" must be an instance of FileUploader');if(f.isHTML5){var g=new b.FileDrop({uploader:f,element:d});g.getOptions=a(e.options).bind(g,c),g.getFilters=function(){return e.filters}}}}}]).directive("nvFileOver",["FileUploader",function(a){return{link:function(b,c,d){var e=b.$eval(d.uploader);if(!(e instanceof a))throw new TypeError('"Uploader" must be an instance of FileUploader');var f=new a.FileOver({uploader:e,element:c});f.getOverClass=function(){return d.overClass||this.overClass}}}}]),b});