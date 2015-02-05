[GR-CAROUSEL USAGE]

#1 Add file gr-carousel.js and gr-carousel.css into your page
#2 Add to module dependence 'gr-ui'
#3 Use the gr-carousel features as in the example below:

<div class="example">
    <h1>Example</h1>
    
    <gr-carousel name="teste" bs="6,4,3,3" autoplay="4000">
        <gr-carousel-item class="example" ng-repeat="item in [1,2,3,4,5,6,7,8]">
            <div class="example-inner">
                <img class="img-responsive" ng-src="item}}" />
                <h2>EXAMPLE</h2>
            </div>
        </gr-carousel-item>
    </gr-carousel>
    
    <gr-carousel-indicators ref="teste"></gr-carousel-indicators>
    
    <div class="well" style="display: inline-block; width: 100%;">
        <button type="button" class="btn btn-primary pull-left" ng-click="teste.prev()">
            <i class="fa fa-fw fa-angle-left"></i>
        </button>
        <button type="button" class="btn btn-primary" ng-click="teste.play()" ng-disabled="teste.isRunning()">
            <i class="fa fa-fw fa-play"></i>
        </button>
        <button type="button" class="btn btn-primary" ng-click="teste.stop()" ng-disabled="!teste.isRunning()">
            <i class="fa fa-fw fa-stop"></i>
        </button>
        <button type="button" class="btn btn-primary pull-right" ng-click="teste.next()">
            <i class="fa fa-fw fa-angle-right"></i>
        </button>
    </div>
    <div class="well">
        <form class="form-inline" style="display: inline-block;">
            <div class="form-group">
                <input type="text" class="form-control" placeholder="Go to..." ng-model="goto">
                <button type="button" class="btn btn-primary" ng-click="teste.go(goto)" >Go!</button>
            </div>
        </form>
    </div>
</div>