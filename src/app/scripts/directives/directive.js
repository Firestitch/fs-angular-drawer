

(function () {
    'use strict';

    /**
      * @ngdoc directive
      * @name fs.directives:fs-drawer
      * @restrict E
      * @param {object} fs-options Options to configure the drawer.
      * @param {object} fs-instance Instance reference variable.
      */

    /**
      * @ngdoc service
      * @name fs.services:fsDrawerInstance
      */
    angular.module('fs-angular-drawer',['fs-angular-store','angularResizable'])
    .directive('fsDrawer', function(fsStore, $http, $compile, $q, $interval, $controller, $window) {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/drawer.html',
            scope: {
                options: '=fsOptions',
                instance: '=fsInstance'
            },
            controller: function($scope) {

            	$scope.tooltipDirection = 'left';

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

                /**
                 * @ngdoc method
                 * @name closeSide
                 * @methodOf fs.services:fsDrawerInstance
                 * @description Closes the side drawer
                 */
                function closeSide() {
                    angular.element($scope.elDrawer).removeClass('fs-drawer-side-open');
                }

                /**
                 * @ngdoc method
                 * @name openSide
                 * @methodOf fs.services:fsDrawerInstance
                 * @description Opens the side drawer
                 */
                function openSide() {
                    angular.element($scope.elDrawer).addClass('fs-drawer-side-open');
                }

                function refresh() {
                    var data = angular.copy($scope.options.actions);
                    $scope.options.actions = data;
                }

                /**
                 * @ngdoc method
                 * @name open
                 * @methodOf fs.services:fsDrawerInstance
                 * @description Opens the main drawer
                 */
                function open() {

                    var container = angular.element($scope.elDrawer).parent();

                    if(container.parent().length) {

                      angular.element(document.querySelector('body')).append(container);

                      angular.element($scope.elDrawer).addClass('fs-drawer-open');
                      angular.element(document.querySelector('html')).addClass('fs-pane-side-active');
                      $scope.drawerStyle.right = 0;
                    }

                    var drawerWidth = parseInt(angular.element($scope.elDrawer).children('.drawer').css('width'));
	                if(drawerWidth >= $window.innerWidth - 100)
	                	$scope.tooltipDirection = 'right';
	                else
	                	$scope.tooltipDirection = 'left';

                }

                /**
                 * @ngdoc method
                 * @name close
                 * @methodOf fs.services:fsDrawerInstance
                 * @description Closes the side drawer
                 */
                function close() {
                    angular.element(document.querySelector('html')).removeClass('fs-pane-side-active');
                    $scope.drawerStyle.right = '-5000px';
                }

                /**
                 * @ngdoc method
                 * @name isOpen
                 * @methodOf fs.services:fsDrawerInstance
                 * @description Tests if the main drawer is open
                 */
                function isOpen() {
                    return angular.element($scope.elDrawer).hasClass('fs-drawer-open');
                }

                /**
                 * @ngdoc method
                 * @name isSideOpen
                 * @methodOf fs.services:fsDrawerInstance
                 * @description Tests if the side drawer is open
                 */
                function isSideOpen() {
                    return angular.element($scope.elDrawer).hasClass('fs-drawer-side-open');
                }

                /**
                 * @ngdoc method
                 * @name toggleSide
                 * @methodOf fs.services:fsDrawerInstance
                 * @description Toggle the main drawer open/close
                 */
                function toggleSide() {
                    isSideOpen() ? closeSide() : openSide();
                }

                angular.extend($scope.instance,
                                {   open: $scope.openDrawer,
                                    close: $scope.closeDrawer,
                                    closeSide: closeSide,
                                    openSide: openSide,
                                    isSideOpen: isSideOpen,
                                    isOpen: isOpen,
                                    refresh: refresh,
                                    toggleSide: toggleSide });

                angular.extend($scope,$scope.options.scope);

                if($scope.options.controller) {

                    var data = { '$scope': $scope };
                    var promises = [];
                    if($scope.options.resolve) {
                      angular.forEach($scope.options.resolve,function(resolve,name) {

                        data[name] = resolve();
                        if(data[name] && angular.isFunction(data[name].then)) {
                          promises.push(data[name]);
                          data[name].then(function(result) {
                             data[name] = result;
                          })
                        }
                      });
                    }

                    $q.all(promises)
                    .then(function() {
                      if(typeof $scope.options.controller === 'string') {
                          $controller($scope.options.controller,data);
                      }

                      if(typeof $scope.options.controller === 'function') {
                        $scope.options.controller($scope);
                      }
                    });
                }
            },

            link: function($scope, element, attrs) {

                var mousedown = false;

                if(!$scope.options) {
                    throw 'fs-drawer options not set';
                }

                $scope.sideClass = {};
                $scope.mainClass = {};
                $scope.elDrawer = element;

                var interval = $interval(function() {
                    var main = element[0].querySelector('.drawer');

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

                        if(args.width >= $window.innerWidth - 100)
                        	$scope.tooltipDirection = 'right';
                        else
                        	$scope.tooltipDirection = 'left';
                    }

                    if(args.id=='fs-pane-side') {
                        persist.sideWidth = args.width;
                        $scope.sideDrawerStyle.width = args.width + 'px';
                    }

                });

                if($scope.options.load) {
                    $scope.options.load($scope);
                }

                if($scope.options.openOnCreate) {
                    $scope.instance.open();
                }
            }
        };
    })

})();