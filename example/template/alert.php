<div class="alert" ng-class="message.type ? 'alert-' + message.type : ''" ng-show="message.check()" ng-if="message.trigger==='form'">
    <p><i class="fa fa-fw fa-warning fa-lg"></i> {{message.error.title}}:</p>
    <hr/>
    <ul>
        <li ng-repeat="msg in message.text">
            {{msg}}
        </li>
    </ul>
</div>
<div class="alert alert-{{message.type}}" ng-show="message.check()" ng-if="message.trigger==='show'">
    <p>{{message.text}}</p>
</div>
