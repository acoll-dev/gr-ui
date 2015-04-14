'use strict';
(function(){
    angular.module('gr.ui.autoheight', []).directive('grAutoheight', ['$rootScope', '$window', '$document', '$timeout', function ($rootScope, $window, $document, $timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var settings = {
                        bsCols: {
                            xs: 1,
                            sm: 1,
                            md: 1,
                            lg: 1
                        },
                        ajust: 0,
                        height: 0,
                        ignore: []
                    },
                    viewPort = function(el){
                        var w = el || $window,
                            d = $window.document,
                            viewPort = {
                                width: 0,
                                height: 0
                            },
                            setBs = function(){
                                if(viewPort.width < 768){
                                    viewPort.bs = 'xs';
                                }
                                if(viewPort.width >= 768){
                                    viewPort.bs = 'sm';
                                }
                                if(viewPort.width >= 990){
                                    viewPort.bs = 'md';
                                }
                                if(viewPort.width >= 1200){
                                    viewPort.bs = 'lg';
                                };
                            };
                        if (w.innerWidth != null){
                            viewPort.width = w.innerWidth;
                            viewPort.height = w.innerHeight;
                            setBs();
                        }else if (document.compatMode == "CSS1Compat"){
                            viewPort.width =  d.documentElement.clientWidth;
                            viewPort.height = d.documentElement.clientHeight;
                            setBs();
                            return viewPort;
                        }else{
                            viewPort.width = d.body.clientWidth;
                            viewPort.height = d.body.clientHeight;
                            setBs();
                        }
                        return viewPort;
                    },
                    maxHeight = function(elements){
                        var max = 0;
                        angular.forEach(elements, function(el){
                            if(el.outerHeight() > max){
                                max = el.outerHeight();
                            }
                        });
                        return max;
                    },
                    ajust = function(){
                        var cols = settings.bsCols[viewPort().bs];
                        if(cols === 0){
                            $element[0].style.height = null;
                            $element.outerHeight($element.parent().innerHeight() + settings.ajust);
                        }else if(cols === 1){
                            $element[0].style.height = null;
                        }else{
                            var siblings = $element.parent().children(),
                                map = [],
                                elSiblings = [];
                            for(var aux = 0, pos = 0; aux < siblings.length; aux++){
                                if(!map[pos]){
                                    map[pos] = [];
                                }
                                if(map[pos].length === cols){
                                    pos++;
                                    map[pos] = [];
                                }
                                map[pos].push(aux);
                            }
                            angular.forEach(map, function(subMap, id){
                                var found = false;
                                angular.forEach(subMap, function(item){
                                    if(item === $element.index()){
                                        found = true;
                                    }
                                });
                                if(!found){
                                    delete map[id];
                                }
                            });
                            angular.forEach(map, function(subMap){ map = subMap; });
                            angular.forEach(siblings, function(el, id){
                                var elm = angular.element(el);
                                if(map.indexOf(id) > -1 && elm.attr('gr-autoheight')){
                                    elSiblings.push(elm);
                                }
                            });
                            angular.forEach(elSiblings, function(el){
                                el[0].style.height = null;
                            });
                            if(settings.ignore.indexOf(viewPort().bs) === -1){
                                $timeout(function(){
                                    var max = maxHeight(elSiblings);
                                    angular.forEach(elSiblings, function(el){
                                        var elm = angular.element(el);
                                        elm.outerHeight(max);
                                    });
                                    $element.outerHeight(max + settings.ajust);
                                });
                            }
                        }
                    }
                angular.element($window).on('resize', function(){
                    $timeout(ajust);
                });
                $timeout(ajust);
                $timeout(ajust, 100);
                $scope.grAutoheightAjust = function(){
                    $rootScope.$broadcast('gr-autoheight-ajust');
                }
                $scope.$on('gr-autoheight-ajust', ajust);
                $attrs.$observe('ignore', function(ignore){
                    if(ignore){
                        settings.ignore = ignore.split(',');
                    }
                });
                $attrs.$observe('ajust', function(ajust){
                    if(ajust){
                        settings.ajust = parseFloat(ajust);
                    }
                });
                $attrs.$observe('grAutoheight', function(args){
                    if(args){
                        while(args.indexOf('\'') > -1){ args = args.replace('\'',''); }
                        while(args.indexOf('"') > -1){ args = args.replace('"',''); }
                        args = angular.fromJson(args.replace('xs', '"xs"').replace('sm', '"sm"').replace('md', '"md"').replace('lg', '"lg"'));
                        angular.extend(settings.bsCols, args);
                    }else{
                        settings.bsCols = {
                            xs:0,
                            sm:0,
                            md:0,
                            lg:0
                        };
                    }
                });
            }
        };
    }]);
}());