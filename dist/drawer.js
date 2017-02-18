
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
    angular.module('fs-angular-drawer', ['fs-angular-store', 'angularResizable'])
        .directive('fsDrawer', function(fsStore, $http, $compile, $q, $controller, $templateCache, $window) {
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
                            $scope.drawerStyle.right = 0;
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

                    function selectAction(action, value) {
                    	value = value===undefined ? true : value;
                        angular.forEach($scope.options.actions, function(item) {
                            item.selected = item == action && value;
                        });
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
                        destroy: destroy
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

                    $scope.actionShow = function(action) {
                        if (action.show) {
                            return action.show($scope);
                        }

                        return true;
                    }

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

(function () {
    'use strict';


    /**
     * @ngdoc service
     * @name fs.fsDrawer
    */

    angular.module('fs-angular-drawer')
    .service('fsDrawer', function($rootScope, $compile, $timeout) {
        var _instances = [];
        var service = {
            create: create,
            instances: instances,
            destroy: destroy,
            close: close
        };

        return service;

        /**
         * @ngdoc method
         * @name create
         * @methodOf fs.fsDrawer
         * @description Creates the drawer instance
         * @param {array} options Used to configure the drawer
         * @param {object} options.templateUrl The path to the main drawer template
         * @param {object} options.templateSideUrl The path to the side drawer template
         * @param {string|function} options.controller The controller for the drawer
         * @param {object} options.scope An object used to pass variables into the drawer controller
         * @param {array} options.resolve When resolved the object will be injected into the controller
         * @param {string} options.mainClass Used in the main drawer pane
         * @param {string} options.sideClass Used in the side drawer pane
         * @param {string} options.id Used to specify the drawer container id
         * @param {string} options.openOnCreate Right after the drawer is created it will open automatically
         * @param {array} options.actions An array of objects that are used to for the drawer's side toolbar
         *            <ul>
         *               <li><label>tooltip</label>Label tooltip</li>
         *               <li><label>click</label>The function fired when the action is clicked. $scope is passed as the first parameter</li>
         *               <li><label>show</label>A function that is used to test the visibility of the action</li>
         *          </ul>
         * @example
         * <pre>
$scope.instance = {};

$scope.options = {  templateUrl: 'views/drawer.html',
                    sideTemplateUrl: 'views/drawerside.html',
                    controller: 'DrawerCtrl',
                    scope: {
                        variable: $scope.variable
                    },
                    actions: [
                        {
                            icon: 'toc',
                            tooltip: 'Properties',
                            show: function($scope) {
                                return showAction;
                            },
                            click: function($scope, event) {
                                this.class = 'action-class';
                            }
                        }
                    ],
                    mainClass: 'mainClass',
                    sideClass: 'sideClass' };

$scope.instance = fsDrawer.create($scope.options);

$scope.open = function() {
    $scope.instance.open();
}
         * </pre>
         */

        function create(options) {

            var id = options.id ? options.id : 'fs-drawer-container';
            var container = angular.element(document.querySelector('#' + id));

            if(container.length) {
                var instance = container.data('instance');
                if(instance) {
                    instance.destroy();
                }

                container.remove();
            }

            var $scope = $rootScope.$new();
            $scope.instance = {};
            $scope.options = options;


            container = angular.element('<fs-drawer-container>')
                                .attr('id',id)
                                .data('instance',$scope.instance);

            container.append(angular.element('<fs-drawer>')
                                    .attr('fs-instance','instance')
                                    .attr('fs-options','options'));

            angular.element(document.querySelector('body')).append(container);

            $compile(container.contents())($scope);

            _instances.push($scope.instance);

            return $scope.instance;
        }

        /**
         * @ngdoc method
         * @name instances
         * @methodOf fs.fsDrawer
         * @description Gets all the active drawer instances
         */
        function instances() {
            return _instances;
        }

        /**
         * @ngdoc method
         * @name destroy
         * @methodOf fs.fsDrawer
         * @description Destroys all the active drawer instances
         */
        function destroy() {
            angular.forEach(_instances,function(instance) {
                instance.destroy();
            });
        }

        /**
         * @ngdoc method
         * @name close
         * @methodOf fs.fsDrawer
         * @description Closes all the active drawer instances
         */
        function close() {
            angular.forEach(_instances,function(instance) {
                instance.close();
            });
        }
    });

})();
angular.module('fs-angular-drawer').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/drawer.html',
    "<div resizable r-directions=\"['left']\" class=\"drawer\" id=\"fs-pane-main\" ng-style=\"drawerStyle\">\r" +
    "\n" +
    "    <div layout=\"row\" layout-fill>\r" +
    "\n" +
    "        <div class=\"drawer-actions\">\r" +
    "\n" +
    "            <a href ng-click=\"closeDrawer()\" class=\"drawer-action\">\r" +
    "\n" +
    "                <md-icon>close\r" +
    "\n" +
    "                <md-tooltip md-direction=\"{{tooltipDirection}}\">Close</md-tooltip>\r" +
    "\n" +
    "                </md-icon>\r" +
    "\n" +
    "            </a>\r" +
    "\n" +
    "            <a href ng-click=\"actionClick(action)\" class=\"drawer-action {{action.class}}\" ng-repeat=\"action in options.actions\" ng-show=\"actionShow(action, $event)\" ng-class=\"{ selected: action.selected }\">\r" +
    "\n" +
    "                <md-icon>{{action.icon}}\r" +
    "\n" +
    "                    <md-tooltip md-direction=\"{{tooltipDirection}}\">{{action.tooltip}}</md-tooltip>\r" +
    "\n" +
    "                </md-icon>\r" +
    "\n" +
    "            </a>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div resizable r-directions=\"['right']\" r-flex=\"true\" ng-style=\"sideDrawerStyle\" id=\"fs-pane-side\" class=\"pane-side {{options.sideClass}}\">\r" +
    "\n" +
    "            <div class=\"fs-drawer-wrap\"></div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"flex pane-main {{options.mainClass}}\">\r" +
    "\n" +
    "            <div class=\"fs-drawer-wrap\"></div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );

}]);
