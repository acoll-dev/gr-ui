<label>Para onde deseja mover?</label>
<select name="target" ng-model="target" class="form-control">
    <option value="" disabled selected>Selecione um destino...</option>
    <option value="{{item.path}}" ng-repeat="item in items">{{item.label}}</option>
</select>
