'use strict';
(function(){
    angular.module('gr-carousel', [])
        .directive('grCarousel', ['$templateCache', '$compile', '$window', '$timeout', function($templateCache, $compile, $window, $timeout){
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                scope: true,
                template: function(){ return $templateCache.get('gr-carousel/carousel.html'); },
                link: function($scope, $element, $attrs, $ctrl, $transclude){
                    $transclude($scope, function($clone){
                        angular.forEach($clone, function(el){
                            var $el = angular.element(el);
                            if($el.hasClass('gr-carousel-indicator')){
                                $el.appendTo($element);
                            };
                        });
                    });
                    var carousel = {
                            id: $attrs.id || 'carousel',
                            current: 0,
                            running: true,
                            hover: false,
                            interval: 4000,
                            scope: $scope,
                            attrs: $attrs,
                            scroller: [],
                            items: [],
                            itemWidth: 0,
                            visible: 0,
                            indicators: [],
                            bsCols: [],
                            animate: function(pos, done, easing){
                                carousel.scroller.stop(true, false).animate({
                                    left: pos
                                }, {
                                    duration: 'slow',
                                    easing: easing || 'easeOutQuint',
                                    done: function(){
                                        if(done && angular.isFunction(done)){
                                            done();
                                        }
                                    }
                                });
                            },
                            ajust: function(){
                                if(carousel.items.length > 0){
                                    var width = relativeWidth(carousel);
                                    $element.find('img').on('dragstart', function(e){ e.preventDefault() });
                                    carousel.items.outerWidth(width);
                                    carousel.scroller.width(width * carousel.items.length);
                                    carousel.itemWidth = width;
                                    carousel.reset();
                                }
                            },
                            isVisible: function(index, test){
                                index = (index !== 0 && index !== '0')? parseInt(index) : 0;
                                if(test){
                                    console.debug(index);
                                }
                                if(index >= 0){
                                    return index >= carousel.current && index < (carousel.current + carousel.visible);
                                }else{
                                    var visible = [],
                                        start = carousel.current,
                                        end = (carousel.current + carousel.visible);
                                    for(var x = start; x < end; x++){
                                        visible.push(x);
                                    };
                                    return visible;
                                }
                            },
                            drag: {
                                dragging: false,
                                start: function($event){
                                    carousel.drag.dragging = true;
                                    var coords = {
                                            x: ($event.clientX || $event.originalEvent.touches[0].clientX) - $element.offset().left,
                                            y: ($event.clientY || $event.originalEvent.touches[0].clientY) - $element.offset().top
                                        };
                                    drgW = carousel.scroller.outerWidth();
                                    posX = parseFloat(carousel.scroller.css('left')) + drgW - coords.x;
                                    sCoords = angular.copy(coords);
                                },
                                move: function($event){
                                    if(carousel.drag.dragging === true){
                                        var coords = {
                                                x: ($event.clientX || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientX : false)) - $element.offset().left,
                                                y: ($event.clientY || ($event.originalEvent.touches ? $event.originalEvent.touches[0].clientY : false)) - $element.offset().top
                                            },
                                            limit = {
                                                x: {
                                                    left: $element.offset().left,
                                                    right: $element.offset().left + $element.width()
                                                },
                                                y: {
                                                    top: $element.offset().top,
                                                    bottom: $element.offset().top + $element.height()
                                                }
                                            },
                                            left = coords.x + posX - drgW,
                                            elWidth = $element.innerWidth();
                                        if(!coords.x || !coords.y){ return false; }
                                        if((left + $element.offset().left) > limit.x.left){
                                            left = (((coords.x - sCoords.x)*(elWidth))/drgW);
                                        }
                                        if((left + $element.offset().left + drgW) < limit.x.right){
                                            left = (((coords.x - sCoords.x)*(elWidth))/drgW) - drgW + elWidth;
                                        }
                                        carousel.scroller.stop(true, true).animate({
                                            left: left
                                        }, {
                                            duration: 'slow',
                                            easing: 'easeOutQuint'
                                        });
                                    }
                                },
                                end: function(){
                                    carousel.drag.dragging = false;
                                    var left = parseFloat(carousel.scroller.css('left')),
                                        elWidth = $element.innerWidth(),
                                        index = 0,
                                        map = [],
                                        aux = 0;
                                    if(left > 0){
                                        left = 0;
                                    }else if(left < ((drgW - elWidth) * -1)){
                                        left = (drgW - elWidth) * -1;
                                    }
                                    angular.forEach(carousel.items, function(){
                                        map.push(aux + (carousel.itemWidth/2));
                                        aux += carousel.itemWidth;
                                    });
                                    angular.forEach(map, function(pos, id){
                                        if((left * -1) >= pos){
                                            index = id + 1;
                                        }
                                    });
                                    carousel.stop();
                                    carousel.go(index);
                                }
                            },
                            timeout: {
                                running: false,
                                timer: ''
                            },
                            checkRun: function(){
                                return (carousel.items.length > carousel.visible) && carousel.running && !carousel.hover && !carousel.drag.dragging;
                            },
                            invokeRun: function(){
                                $timeout.cancel(carousel.timeout.timer);
                                carousel.timeout.timer = $timeout(function(){ carousel.run(); }, carousel.interval);
                            },
                            run: function(){
                                if(carousel.checkRun()){
                                    if((carousel.current + carousel.visible) < carousel.items.length){
                                        carousel.current = carousel.current + 1;
                                    }else{
                                        carousel.current = 0;
                                    }
                                    carousel.animate((carousel.itemWidth * carousel.current) * -1, function(){
                                        carousel.invokeRun();
                                    });
                                }else{ carousel.invokeRun(); }
                            },
                            play: function(){
                                carousel.running = true;
                                carousel.invokeRun();
                                $timeout(function(){ $scope.$apply(); });
                            },
                            stop: function(){
                                if(carousel.visible >= carousel.items.length){
                                    return false;
                                }
                                carousel.running = false;
                                $timeout.cancel(carousel.timeout.timer);
                                $timeout(function(){ $scope.$apply(); });
                            },
                            allow: {
                                prev: function(){                                                  
                                    return (carousel.visible < carousel.items.length) && (carousel.current > 0);
                                },
                                next: function(){
                                    return (carousel.visible < carousel.items.length) && ((carousel.current + carousel.visible) < carousel.items.length);
                                },
                                go: function(index){
                                    if(!/^[0-9]+$/.test(index)){ return false; }
                                    index = parseInt(index);
                                    return (carousel.items.length >= carousel.visible) && ((index + carousel.visible) < carousel.items.length + 1);
                                }
                            },
                            prev: function(){
                                if(!carousel.allow.prev()){ return false; }
                                carousel.stop();
                                if(carousel.current > 0){
                                    carousel.current--;
                                }else{
                                    carousel.current = carousel.items.length - carousel.visible;
                                }
                                carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                $timeout(function(){ $scope.$apply(); });
                                carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 3));
                            },
                            next: function(){
                                if(!carousel.allow.next()){ return false; }
                                carousel.stop();
                                if((carousel.current + carousel.visible) < carousel.items.length){
                                    carousel.current++;
                                }else{
                                    carousel.current = 0;
                                }
                                carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                $timeout(function(){ $scope.$apply(); });
                                carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 3));
                            },
                            go: function(index){
                                if(!carousel.allow.go(index)){ return false; }
                                carousel.stop();
                                index = parseInt(index);
                                if(index >= 0){
                                    if((index + carousel.visible) > carousel.items.length){
                                        index = carousel.items.length - carousel.visible;
                                        if(index < 0){
                                             index = 0;
                                        }
                                    }
                                    carousel.current = index;
                                    carousel.animate((carousel.itemWidth * carousel.current) * -1);
                                    $timeout(function(){ $scope.$apply(); });
                                }
                                carousel.timeout.timer = $timeout(function(){ carousel.play(); }, (carousel.interval * 3));
                            },
                            reset: function(){
                                carousel.current = 0;
                                carousel.stop();
                                carousel.animate(0, carousel.play);
                                $timeout(function(){ $scope.$apply(); });
                            }
                        },
                        drgW, posX, sCoords,
                        $public = {
                            maxIndex: function(){ return carousel.items.length - carousel.visible; },
                            isRunning: carousel.checkRun,
                            isVisible: carousel.isVisible,
                            isCurrent: function(index){ return index ? carousel.current === parseInt(index) : false; },
                            allow: carousel.allow,
                            current: function(){ return carousel.current; },
                            indicators: carousel.indicators,
                            play: carousel.play,
                            stop: carousel.stop,
                            next: carousel.next,
                            prev: carousel.prev,
                            go: carousel.go,
                            reset: carousel.reset,
                            ajust: carousel.ajust,
                            drag: carousel.drag
                        },
                        viewPort = function() {
                            return {
                                width: (angular.element($window).width() - angular.element('body').width()),
                                height: angular.element($window).height()
                            };
                        },
                        relativeWidth = function(carousel){
                            var wWidth = viewPort().width,
                                width = $element.innerWidth(),
                                padding = parseFloat(carousel.scroller.css('padding-left')) + parseFloat(carousel.scroller.css('padding-right')),
                                bs;
                            if(carousel.bsCols.length === 4){
                                if(wWidth >= 1200){
                                    bs = carousel.bsCols[3];
                                }
                                if(wWidth < 1200){
                                    bs = carousel.bsCols[2];
                                }
                                if(wWidth < 991){
                                    bs = carousel.bsCols[1];
                                }
                                if(wWidth < 768){
                                    bs = carousel.bsCols[0];
                                }
                            }else{
                                bs = 12;
                            }
                            carousel.visible = 12/bs;
                            return Math.round(((width/12)*bs) - ((padding/12)*bs));
                        },
                        init = function(){
                            carousel.scroller = $element.children('.gr-carousel-inner');
                            angular.element($window).on({ resize: function(){ carousel.ajust(); } });
                            $scope.$parent[carousel.id] = $public;
                            $scope.carousel = $public;
                            carousel.ajust();
                            $element.on({
                                mousedown: carousel.drag.start,
                                mousemove: carousel.drag.move,
                                touchstart: carousel.drag.start,
                                touchmove: carousel.drag.move,
                                mouseenter: function(){ carousel.hover = true; $scope.$apply(); },
                                mouseleave: function(){ carousel.hover = false; $scope.$apply(); }
                            });
                            angular.element($window).on({
                                mousemove: function($event){ if(carousel.drag.dragging){ carousel.drag.move($event) } },
                                mouseup: function($event){ if(carousel.drag.dragging){ carousel.drag.end($event) } },
                                touchmove: function($event){ if(carousel.drag.dragging){ carousel.drag.move($event) } },
                                touchend: function($event){ if(carousel.drag.dragging){ carousel.drag.end($event) } }
                            });
                            carousel.scroller.find('.gr-carousel-indicator').remove();
                        };
                    $scope.$watchCollection(function(){
                        if(carousel.scroller.length > 0){
                            return carousel.scroller.children('.gr-carousel-item');
                        }else{
                            return [];
                        }
                    }, function(items){
                        if(items && items.length > 0){
                            carousel.items = items;
                            angular.forEach(carousel.items, function(item, id){ carousel.indicators.push(id); });
                            carousel.ajust();
                        }
                    });
                    $scope.$watchCollection(function(){
                        return carousel.hover;
                    }, function(hover){
                        if(hover){
                            $timeout.cancel(carousel.timeout.timer);
                        }else{
                            carousel.invokeRun();
                        }
                    });
                    $scope.$watchCollection(function(){
                        return carousel.drag.dragging;
                    }, function(dragging){
                        if(dragging){
                            $timeout.cancel(carousel.timeout.timer);
                        }else{
                            carousel.invokeRun();
                        }
                    });
                    $attrs.$observe('bs', function(args){
                        if(args && args !== ''){
                            carousel.bsCols = args.split(',');
                        }else{
                            carousel.bsCols = ['12','12','12','12'];
                        }
                    });
                    $attrs.$observe('autoplay', function(autoplay){
                        if(autoplay > 0){
                            carousel.interval = autoplay;
                            carousel.running = true;
                            carousel.invokeRun();
                        }else{
                            carousel.interval = 0;
                            $timeout(function(){
                                carousel.running = false;
                                carousel.reset();
                            });
                        }
                    });
                    init();
                }
            }
        }])
        .directive('grCarouselItem', ['$templateCache', function($templateCache){
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                template: function(){
                    return $templateCache.get('gr-carousel/carousel-item.html');
                },
                link: function($scope, $element, $attrs, $ctrl, $transclude){
                    $transclude($scope, function(){});
                }
            }
        }])
        .directive('grCarouselIndicators', ['$templateCache', '$timeout', function($templateCache, $timeout){
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    carousel: '=for'
                },
                template: function(){
                    return $templateCache.get('gr-carousel/carousel-indicators.html');
                }
            }
        }])
        .run(['$templateCache', function($templateCache){
            $templateCache.put('gr-carousel/carousel.html',
                                '<div class="gr-carousel">' +
                                    '<div class="gr-carousel-inner" ng-transclude></div>' +
                                '</div>');
            $templateCache.put('gr-carousel/carousel-item.html', '<div class="gr-carousel-item" ng-transclude></div>');
            $templateCache.put('gr-carousel/carousel-indicators.html',
                                '<ul class="gr-carousel-indicator">' +
                                    '<li class="gr-carousel-indicator-item" ng-class="{\'active\': carousel.isVisible($index)}" ng-repeat="item in carousel.indicators" ng-click="carousel.go($index)"></li>' +
                                '</ul>');
        }]);
})();