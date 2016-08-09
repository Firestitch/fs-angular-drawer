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
		 * @param {array} options.actions An array of objects that are used to for the drawer's side toolbar
         *            <ul>
         *               <li><label>tooltip</label>Label tooltip</li>
         *               <li><label>click</label>The function fired when the action is clicked. $scope is passed as the first parameter</li>
         *               <li><label>show</label>A function that is used to test the visibility of the action</li>
         *          </ul>
		 * @example
		 * <pre>
$scope.instance = {};

$scope.options = {	templateUrl: 'views/drawer.html',
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

			var container = angular.element(document.querySelector('#fs-drawer-container'));

			if(container.length) {
				container.remove();
			}

			var container = angular.element('<div id="fs-drawer-container"><fs-drawer fs-options="options" fs-instance="instance"></fs-drawer></div>');
			angular.element(document.querySelector('body')).append(container);

			$compile(container.contents())($scope);

			return $scope.instance;
		}
	});

})();