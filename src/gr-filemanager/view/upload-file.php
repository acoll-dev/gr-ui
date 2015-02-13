<div class="row ger-upload" nv-file-drop uploader="uploader">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" ng-if="uploader.queue.length === 0">
        <div class="ger-upload-drag-zone well text-muted text-center"><h3>{{'Drop files here' | grTranslate}}</h3></div>
    </div>

    <input type="file" id="ger-upload-file-select" nv-file-select="" uploader="uploader" ng-show="false" multiple />

    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <div ng-if="uploader.queue.length > 0">
            <h4>{{'Total progress' | grTranslate}} <span class="pull-right text-muted">{{ uploader.queue.length }} {{uploader.queue.length !== 1 ? 'files' : 'file'}}</span></h4>
            <div class="progress" style="">
                <div class="progress-bar progress-bar-success" role="progressbar" ng-style="{ 'width': uploader.progress + '%' }"></div>
            </div>
        </div>
        <div class="list-group ger-upload-list" ng-if="uploader.queue.length > 0">
            <div class="list-group-item ger-upload-list-item" ng-repeat="item in uploader.queue">
                <div class="ger-upload-list-item-block ger-upload-list-item-thumb" ng-if="uploader.isHTML5 && uploader.getType(item.file.name) === 'image'">
                    <!-- Image preview -->
                    <!--auto height-->
                    <!--<div ng-thumb="{ file: item.file, width: 100 }"></div>-->
                    <!--auto width-->
                    <div ng-thumb="{ file: item._file, height: 100 }"></div>
                    <!--fixed width and height -->
                    <!--<div ng-thumb="{ file: item.file, width: 100, height: 100 }"></div>-->
                </div>
                <div class="ger-upload-list-item-block">
                    <div class="gr-upload-file-info" nowrap>
                        <strong>{{ item.file.name }}</strong>
                        <span ng-show="uploader.isHTML5" class="pull-right text-muted" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</span>
                    </div>
                    <div class="progress" ng-show="uploader.isHTML5">
                        <div class="progress-bar" role="progressbar" ng-style="{ 'width': item.progress + '%' }"></div>
                    </div>
                    <div class="ger-table-actions">
                        <span class="gr-upload-file-status" ng-class="{'text-success': item.isSuccess, 'text-warning': item.isCancel, 'text-danger': item.isError}">
                            <span ng-show="item.isSuccess"><i class="glyphicon glyphicon-ok"></i></span>
                            <span ng-show="item.isCancel"><i class="glyphicon glyphicon-ban-circle"></i></span>
                            <span ng-show="item.isError"><i class="glyphicon glyphicon-remove"></i></span>
                        </span>
                        <button type="button" class="btn btn-success" ng-click="item.upload()" ng-disabled="item.isReady || item.isUploading || item.isSuccess">
                            <span class="hidden-xs hidden-sm">
                                <i class="glyphicon glyphicon-upload"></i> {{'Upload' | grTranslate}}
                            </span>
                            <span class="visible-xs visible-sm">
                                <i class="glyphicon glyphicon-upload"></i>
                            </span>
                        </button>
                        <button type="button" class="btn btn-warning" ng-click="item.cancel()" ng-disabled="!item.isUploading">
                            <span class="hidden-xs hidden-sm">
                                <i class="glyphicon glyphicon-ban-circle"></i> {{'Cancel' | grTranslate}}
                            </span>
                            <span class="visible-xs visible-sm">
                                <i class="glyphicon glyphicon-ban-circle"></i>
                            </span>
                        </button>
                        <button type="button" class="btn btn-danger" ng-click="item.remove()">
                            <span class="hidden-xs hidden-sm">
                                <i class="glyphicon glyphicon-trash"></i> {{'Remove' | grTranslate}}
                            </span>
                            <span class="visible-xs visible-sm">
                                <i class="glyphicon glyphicon-trash"></i>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
