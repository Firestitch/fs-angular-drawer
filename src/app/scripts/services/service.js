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


        function guid() {
            return 'xxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }


        function create(options) {

            var $scope = $rootScope.$new();
            $scope.instance = {};
            $scope.options = options;

            var id = options.id ? options.id : 'fs-drawer-container-' + guid();
            var container = angular.element(document.querySelector('#' + options.id));

            if(container.length) {
                container.remove();
            }

            container = angular.element('<fs-drawer-container>')
                                .attr('id',id);

            container.append(angular.element('<fs-drawer>')
                                    .attr('fs-instance','instance')
                                    .attr('fs-options','options'));

            angular.element(document.querySelector('body')).append(container);

            $compile(container.contents())($scope);

            return $scope.instance;
        }
    });

})();