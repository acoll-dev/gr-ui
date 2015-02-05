'use strict';
(function(){
    angular.module('gr.ui.autoheight', [])
        .directive('grAutoheight', ['$window', '$document', '$timeout',
            function ($window, $document, $timeout) {
                return {
                    link: function ($scope, $element, $attrs) {
                        var siblingsMaxHeigth, sizes = false, viewPort, setHeight, clearHeight, ignore = false;
                        viewPort = function() {
                            var e = $window, a = 'inner';
                            if (!('innerWidth' in $window )) {
                                a = 'client';
                                e = $document.documentElement || $document.body;
                            }
                            return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
                        };
                        setHeight = function(){
                            var _sbl = $element.parent().children('[gr-auto-height]'), _nth = 0, _nthAux = 0, maxHeight = 0, tmpChilds = [], foundCurrent = false, bsSize = '', width = viewPort().width;
                            if(sizes){
                                if(width < 768){
                                    _nth = sizes[0];
                                    bsSize = 'xs';
                                }else if(width >= 768 && width < 992){
                                    _nth = sizes[1];
                                    bsSize = 'sm';
                                }else if(width >= 992 && width < 1200){
                                    _nth = sizes[2];
                                    bsSize = 'md';
                                }else if(width >= 1200){
                                    _nth = sizes[3];
                                    bsSize = 'lg';
                                }
                                if(ignore && (ignore.indexOf(bsSize) > -1)){
                                    angular.element(elm).innerHeight('');
                                    return false;
                                }
                                angular.forEach(_sbl, function(elm, id){
                                    if(_nth === 0){
                                        tmpChilds.push(elm);
                                    }else {
                                        if(angular.isUndefined(tmpChilds[_nthAux])){
                                            tmpChilds[_nthAux] = [];
                                        }
                                        tmpChilds[_nthAux].push(elm);
                                        if((id + 1) % _nth === 0 && id > 1 && elm !== _sbl.last()[0]){
                                            _nthAux ++;
                                            tmpChilds[_nthAux] = [];
                                        }
                                    }
                                });
                                angular.forEach(tmpChilds, function(c, cId){
                                    if(!foundCurrent){
                                        var hasCurrent = false;
                                        angular.forEach(c, function(cc){
                                            if(cc === $element[0]){
                                                hasCurrent = true;
                                            }
                                        });
                                        if(hasCurrent){
                                            tmpChilds = tmpChilds[cId];
                                            foundCurrent = true;
                                        }
                                    }
                                });
                                angular.forEach(tmpChilds, function(elm){
                                    clearHeight(angular.element(elm));
                                });
                                angular.forEach(tmpChilds, function(elm){
                                    maxHeight = elm.offsetHeight > maxHeight ? elm.offsetHeight : maxHeight;
                                });
                                angular.forEach(tmpChilds, function(elm){
                                    angular.element(elm).innerHeight(maxHeight);
                                });
                            }else{
                                if(width < 768){
                                    bsSize = 'xs';
                                }else if(width >= 768 && width < 992){
                                    bsSize = 'sm';
                                }else if(width >= 992 && width < 1200){
                                    bsSize = 'md';
                                }else if(width >= 1200){
                                    bsSize = 'lg';
                                }
                                if(ignore && (ignore.indexOf(bsSize) > -1)){
                                    $element.innerHeight('');
                                    return false;
                                }
                                if($element.attr('gr-auto-height-ajust')){
                                    $element.innerHeight($element.parent().innerHeight() + parseFloat($element.attr('gr-auto-height-ajust')));
                                }else{
                                    $element.innerHeight($element.parent().innerHeight());
                                }
                                $timeout(function(){ //compatibility for element parents with directive gr-auto-height
                                    clearHeight();
                                    if($element.attr('gr-auto-height-ajust')){
                                        $element.innerHeight($element.parent().innerHeight() + parseFloat($element.attr('gr-auto-height-ajust')));
                                    }else{
                                        $element.innerHeight($element.parent().innerHeight());
                                    }
                                });
                            }
                        };
                        clearHeight = function($elm){
                            if(!$elm){
                                $element.height('');
                            }else{
                                $elm.height('');
                            }
                        };
                        angular.element($window).bind('resize', function(){
                            clearHeight();
                            setHeight();
                        });
                        $attrs.$observe('grAutoHeightIgnore', function(v){
                            if(angular.isDefined(v) && v !== ''){
                                if(v.indexOf(',') > -1){
                                    v = v.split(',');
                                    angular.forEach(v, function(_v){
                                        _v = _v.trim();
                                    });
                                }else{
                                    v = [v];
                                }
                                ignore = v;
                            }else{
                                ignore = false;
                            }
                        });
                        $attrs.$observe('grAutoHeight', function(v){
                            if(angular.isDefined(v) && v !== ''){
                                if(v.match(/,/g).length === 3){
                                    var c = 0;
                                    sizes = v.split(',');
                                    angular.forEach(sizes, function(){
                                        c++;
                                    });
                                    if(c !== 4){
                                        sizes = false;
                                    }
                                }else{
                                    sizes = false;
                                }
                            }else{
                                sizes = false;
                            }
                            $timeout(setHeight);
                        });
                        $timeout(setHeight);
                        $timeout(setHeight, 1000);
                    }
                };
            }]);
})();
