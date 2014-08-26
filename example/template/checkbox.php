<div class="form-group has-feedback" ng-class="state ? 'has-' + state : ''">
    <div class="input-group">
        <div class="checkbox">
            <label>
                <input type="checkbox" />
                {{field.label}}
            </label>
        </div>
        <span class="input-group-btn form-control-icon">
            <span class="fa fa-fw fa-times form-control-feedback form-control-feedback-error"></span>
            <span class="fa fa-fw fa-check form-control-feedback form-control-feedback-success"></span>
        </span>
    </div>
</div>
