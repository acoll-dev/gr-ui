<div class="form-group has-feedback" ng-class="state ? 'has-' + state : ''">
    <label>{{field.label}}</label>
    <div class="input-group">
        <div class="gr-form-list">
            <div ng-transclude></div>
            <div ng-include="'radio_renderer.html'"></div>
        </div>
        <span class="input-group-btn form-control-icon">
            <span class="fa fa-fw fa-times form-control-feedback form-control-feedback-error"></span>
            <span class="fa fa-fw fa-check form-control-feedback form-control-feedback-success"></span>
        </span>
    </div>
    <script type="text/ng-template" id="radio_renderer.html">
        <div class="radio gr-form-list-item" ng-repeat="radio in field.radios">
            <label>
                <input type="radio" />
                {{radio.label}}
            </label>
        </div>
    </script>
</div>
