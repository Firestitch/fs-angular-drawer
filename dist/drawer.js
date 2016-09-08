

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

                if($scope.options.openOnCreate) {
                    $scope.instance.open();
                }
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
    .service('fsDrawer', function($rootScope, $compile) {

        var service = {
            create: create
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

            var $scope = $rootScope.$new();
            $scope.instance = {};
            $scope.options = options;

            var id = options.id ? options.id : 'fs-drawer-container';
            var container = angular.element(document.querySelector('#' + id));

            if(container.length) {
                container.remove();
            }

            var container = angular.element('<div id="' + id + '"><fs-drawer fs-options="options" fs-instance="instance"></fs-drawer></div>');
            angular.element(document.querySelector('body')).append(container);

            $compile(container.contents())($scope);

            return $scope.instance;
        }
    });

})();
angular.module('fs-angular-drawer').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/drawer.html',
    "<div resizable r-directions=\"['left']\" class=\"drawer\" id=\"fs-pane-main\" ng-style=\"drawerStyle\">\n" +
    "    <div layout=\"row\" layout-fill>\n" +
    "        <div class=\"drawer-actions\">\n" +
    "            <a href ng-click=\"closeDrawer()\" class=\"drawer-action\">\n" +
    "                <md-icon>close\n" +
    "                <md-tooltip md-direction=\"left\">Close</md-tooltip>\n" +
    "                </md-icon>\n" +
    "            </a>\n" +
    "            <a href ng-click=\"actionClick(action)\" class=\"drawer-action {{action.class}}\" ng-repeat=\"action in options.actions\" ng-show=\"actionShow(action, $event)\">\n" +
    "                <md-icon>{{action.icon}}\n" +
    "                    <md-tooltip md-direction=\"left\">{{action.tooltip}}</md-tooltip>\n" +
    "                </md-icon>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div resizable r-directions=\"['right']\" r-flex=\"true\" ng-style=\"sideDrawerStyle\" id=\"fs-pane-side\" class=\"pane-side\" ng-class=\"sideClass\">\n" +
    "            <div class=\"fs-drawer-wrap\"></div>\n" +
    "        </div>\n" +
    "        <div flex class=\"pane-main\" ng-class=\"mainClass\">\n" +
    "            <div class=\"fs-drawer-wrap\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n"
  );

}]);
