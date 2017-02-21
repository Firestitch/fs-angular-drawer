(function() {
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
    angular.module('fs-angular-drawer', ['fs-angular-store', 'fs-angular-array', 'angularResizable'])
        .directive('fsDrawer', function(fsStore, $http, $compile, $q, $controller, $templateCache, $window, fsArray) {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/drawer.html',
                scope: {
                    options: '=fsOptions',
                    instance: '=fsInstance'
                },
                controller: function($scope, $rootScope) {

                    var scope = $scope;
                    $scope.tooltipDirection = 'left';

                    $scope.calculateTooltip = function(width) {
                        width = width ? width : parseInt(angular.element($scope.elDrawer).children('.drawer').css('width'));
                        $scope.tooltipDirection = width >= $window.innerWidth - 100 ? 'right' : 'left';
                    }

                    $scope.openDrawer = function() {

                        if ($scope.options.open) {

                            var args = [scope];
                            angular.forEach(arguments, function(argument) {
                                args.push(argument);
                            });

                            $scope.options.open.apply(this, args);
                        }

                        if ($scope.open) {
                            $scope.open.apply($scope, arguments);
                        }

                        open();
                    }

                    $scope.closeDrawer = function() {
                        $q(function(resolve, reject) {

                                var result = null;
                                if ($scope.options.close) {
                                    result = $scope.options.close(scope);
                                }

                                if (result && angular.isFunction(result.then)) {
                                    result.then(resolve, reject);
                                } else
                                    resolve();

                            })
                            .then(function() {
                                close();
                            });
                    }


                    $scope.actionClick = function(action, $event) {
                        action.click($scope, $event);
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

                        if (container.parent().length) {

                            angular.element(document.querySelector('body')).append(container);

                            angular.element($scope.elDrawer).addClass('fs-drawer-open');
                            angular.element(document.querySelector('html')).addClass('fs-pane-side-active');
                        }

                        $scope.calculateTooltip();
                        $scope.resize();
                    }

                    /**
                     * @ngdoc method
                     * @name close
                     * @methodOf fs.services:fsDrawerInstance
                     * @description Closes the side drawer
                     */
                    function close() {
                        angular.element(document.querySelector('html')).removeClass('fs-pane-side-active');
                        angular.element($scope.elDrawer).removeClass('fs-drawer-open');
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

                    function selectAction(action, value) {
                    	value = value===undefined ? true : value;
                        angular.forEach($scope.options.actions, function(item) {
                            item.selected = item == action && value;
                        });
                    }

                    function visibilityAction(name, value) {
                    	var action = fsArray.filter($scope.options.actions,{ name: name })[0];
                    	if(action) {
                    		if(value===undefined) {
                    			action.show = !action.show;
                    		} else {
                    			action.show = value;
                    		}
                    	}
                    }

                    function showAction(name) {
                    	visibilityAction(name,true);
                    }

                    function hideAction(name) {
                    	visibilityAction(name,false);
                    }

                    function toggleAction(name) {
                    	visibilityAction(name,undefined);
                    }

                    function destroy() {
                    	$scope.$destroy();
                    	$scope.elDrawer.remove();
                    }

                    angular.extend($scope.instance, {
                        open: $scope.openDrawer,
                        close: $scope.closeDrawer,
                        closeSide: closeSide,
                        openSide: openSide,
                        isSideOpen: isSideOpen,
                        isOpen: isOpen,
                        refresh: refresh,
                        toggleSide: toggleSide,
                        destroy: destroy,
                        toggleAction: toggleAction,
                        hideAction: hideAction,
                        showAction: showAction,
                        visibilityAction: visibilityAction
                    });

                    angular.extend(scope, $scope.options.scope);

                    $scope.options.instance = $scope.instance;

                    var data = { '$scope': scope },
                        promises = [],
                        self = this;
                    if ($scope.options.resolve) {
                        angular.forEach($scope.options.resolve, function(resolve, name) {

                            data[name] = resolve();
                            if (data[name] && angular.isFunction(data[name].then)) {
                                promises.push(data[name]);
                                data[name].then(function(result) {
                                    data[name] = result;
                                })
                            }
                        });
                    }

                    $scope.promise = $q.all(promises)
                        .then(function() {
                            if (typeof $scope.options.controller === 'string') {
                                $controller($scope.options.controller, data);
                            }

                            if (typeof $scope.options.controller === 'function') {
                                $scope.options.controller($scope);
                            }

                            return scope;
                        });

                    $scope.options.actions = $scope.options.actions || [];
                    angular.forEach($scope.options.actions, function(action) {
                        action.select = angular.bind(null, selectAction, action);

                        if(action.show===undefined) {
                        	action.show = true;
                        }
                    });

                },

                link: function($scope, element, attrs) {

                    $scope.promise.then(function(scope) {

                        $http.get($scope.options.templateUrl, {
                            cache: $templateCache
                        }).then(function(data) {
                            var el = angular.element(element[0].querySelector('.pane-main .fs-drawer-wrap')).html(data.data);
                            $compile(el.contents())(scope);
                        });

                        if ($scope.options.sideTemplateUrl) {
                            $http.get($scope.options.sideTemplateUrl, {
                                cache: $templateCache
                            }).then(function(data) {
                                var el = angular.element(element[0].querySelector('.pane-side .fs-drawer-wrap')).html(data.data);
                                $compile(el.contents())(scope);
                            });
                        }
                    });

                    if (!$scope.options) {
                        throw 'fs-drawer options not set';
                    }

                    $scope.elDrawer = element;

                    var drawer = element[0].querySelector('.drawer');

                    $scope.drawerStyle = {};
                    $scope.sideDrawerStyle = {};

                    $scope.resize = function() {
                    	setTimeout(function() {
							if (drawer.offsetWidth > window.innerWidth) {
	                            angular.element(drawer).css('width', window.innerWidth + 'px');
	                        }
	                    });
                    }

                    var drawerPersist = fsStore.get('drawer-persist', {});

                    if (!drawerPersist[$scope.options.name]) {
                        drawerPersist[$scope.options.name] = {};
                    }

                    var persist = drawerPersist[$scope.options.name];

                    $scope.drawerStyle.width = persist.mainWidth + 'px';
                    $scope.sideDrawerStyle.width = persist.sideWidth + 'px';

                    $scope.$on("angular-resizable.resizeEnd", function(event, args) {

                        if (args.id == 'fs-pane-main') {
                            persist.mainWidth = args.width;
                            $scope.drawerStyle.width = args.width + 'px';
                            $scope.calculateTooltip(args.width);
                            $scope.resize();
                        }

                        if (args.id == 'fs-pane-side') {
                            persist.sideWidth = args.width;
                            $scope.sideDrawerStyle.width = args.width + 'px';
                        }

                    });

                    if ($scope.options.load) {
                        $scope.options.load($scope);
                    }

                    if ($scope.options.openOnCreate || $scope.options.openOnCreate===undefined) {
                        $scope.instance.open();
                    }

                    window.addEventListener('resize', $scope.resize, true);

                    $scope.$on('$destroy', function() {
                        window.removeEventListener('resize', $scope.resize);
                    });

                }
            };
        })

})();
