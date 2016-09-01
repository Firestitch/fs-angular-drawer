
(function () {
    'use strict';

    /**
      * @ngdoc directive
      * @name fs.directives:fs-drawer
      * @restrict E
      * @param {object} fs-options Options to configure the drawer.
      * @param {object} fs-instance Instance reference variable.
      */

    angular.module('fs-angular-drawer',['fs-angular-store','angularResizable'])
    .directive('fsDrawer', function(fsStore, $http, $compile, $q, $interval, $controller) {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/drawer.html',
            scope: {
                options: '=fsOptions',
                instance: '=fsInstance'
            },
            controller: function($scope) {

                $scope.openDrawer = function() {

                    if($scope.options.open) {

                        var args = [$scope];
                        angular.forEach(arguments,function(argument) {
                            args.push(argument);
                        });

                        $scope.options.open.apply(this,args);
                    }

                    if($scope.open) {
                        $scope.open.apply($scope,arguments);
                    }

                    open();
                }

                $scope.closeDrawer =function() {
                    $q(function(resolve,reject) {

                        var result = null;
                        if($scope.options.close) {
                            result = $scope.options.close($scope);
                        }

                        if(result && angular.isFunction(result.then)) {
                            result.then(resolve,reject);
                        } else
                            resolve();

                    })
                    .then(function() {
                        close();
                    });
                }

                function closeSide() {
                    angular.element($scope.element).removeClass('fs-drawer-side-open');
                    angular.element(document.querySelector('.pane-side')).css('display','none');
                }

                function openSide() {
                    angular.element($scope.element).addClass('fs-drawer-side-open');
                    angular.element(document.querySelector('.pane-side')).css('display','block');
                }

                function refresh() {
                    var data = angular.copy($scope.options.actions);
                    $scope.options.actions = data;
                }

                function open() {
                    angular.element(document.querySelector('html')).addClass('fs-pane-side-active');
                    $scope.drawerStyle.right = 0;
                }

                function close() {
                    angular.element(document.querySelector('html')).removeClass('fs-pane-side-active');
                    $scope.drawerStyle.right = '-5000px';
                }

                angular.extend($scope.instance,
                                {   open: $scope.openDrawer,
                                    close: $scope.closeDrawer,
                                    closeSide: closeSide,
                                    openSide: openSide,
                                    refresh: refresh });

                angular.extend($scope,$scope.options.scope);

                if($scope.options.controller) {

                    if(typeof $scope.options.controller === 'string') {
                        $controller($scope.options.controller,{ $scope : $scope });
                    }

                    if(typeof $scope.options.controller === 'function') {
                        $scope.options.controller($scope);
                    }
                }
            },

            link: function($scope, element, attrs) {

                var mousedown = false;

                if(!$scope.options) {
                    throw 'fs-drawer options not set';
                }

                $scope.sideClass = {};
                $scope.mainClass = {};
                $scope.element = element;


                var interval = $interval(function() {
                    var main = element[0].querySelector('#fs-pane-main');

                    if(!mousedown && main.offsetWidth>window.innerWidth) {
                        angular.element(main).css('width',window.innerWidth + 'px');
                    }

                },300);

                $scope.$watch('options.sideClass',function(value) {
                    $scope.sideClass[$scope.options.sideClass] = !!value;
                });

                $scope.$watch('options.mainClass',function(value) {
                    $scope.mainClass[$scope.options.mainClass] = !!value;
                });

                $http.get($scope.options.templateUrl).success(function (data) {
                    var el = angular.element(element[0].querySelector('.pane-main .fs-drawer-wrap')).html(data);
                    $compile(el.contents())($scope);
                });

                if($scope.options.sideTemplateUrl) {
                    $http.get($scope.options.sideTemplateUrl).success(function (data) {
                        var el = angular.element(element[0].querySelector('.pane-side .fs-drawer-wrap')).html(data);
                        $compile(el.contents())($scope);
                    });
                }

                $scope.drawerStyle = {};
                $scope.sideDrawerStyle = {};

                var eventMousedown = function() { mousedown = true; };
                var eventMouseup = function() { mousedown = false; };

                window.addEventListener('mousedown',eventMousedown, true);
                window.addEventListener('mouseup',eventMouseup, true);

                $scope.$on('$destroy',function() {
                    window.removeEventListener('mousedown',eventMousedown);
                    window.removeEventListener('mouseup',eventMouseup);
                    $interval.cancel(interval);
                });

                $scope.actionClick = function(action, $event) {
                    action.click($scope, $event);
                }

                $scope.actionShow = function(action) {
                    if(action.show) {
                        return action.show($scope);
                    }

                    return true;
                }

                var drawerPersist = fsStore.get('drawer-persist',{});

                if(!drawerPersist[$scope.options.name]) {
                    drawerPersist[$scope.options.name] = {};
                }

                var persist = drawerPersist[$scope.options.name];

                $scope.drawerStyle.width = persist.mainWidth + 'px';
                $scope.sideDrawerStyle.width = persist.sideWidth + 'px';

                $scope.$on("angular-resizable.resizeEnd", function (event, args) {

                    if(args.id=='fs-pane-main') {
                        persist.mainWidth = args.width;
                        $scope.drawerStyle.width = args.width + 'px';
                    }

                    if(args.id=='fs-pane-side') {
                        persist.sideWidth = args.width;
                        $scope.sideDrawerStyle.width = args.width + 'px';
                    }
                });

                if($scope.options.load) {
                    $scope.options.load($scope);
                }
            }
        };
    })

})();