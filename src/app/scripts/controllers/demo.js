'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, fsDrawer) {

    var showAction = false;
    $scope.instance = {};
    $scope.action = false;

    $scope.options = {	templateUrl: 'views/drawer.html',
                        sideTemplateUrl: 'views/drawerside.html',
                        controller: 'DrawerCtrl',
                        scope: {
                            variable: $scope.variable
                        },
                        actions: [
                            {
                                icon: 'share',
                                tooltip: 'Related',
                                click: function($scope) {
                                }
                            },
                            {
                                icon: 'toc',
                                tooltip: 'Properties',
                                show: function($scope) {
                                    return showAction;
                                },
                                click: function($scope, event) {
                                    this.class = 'action-class';
                                }
                            },
                            {
                                icon: 'delete',
                                tooltip: 'Remove',
                                click: function($scope) {

                                }
                            },
                        ],
                        mainClass: 'mainClass',
                        sideClass: 'sideClass' };

    $scope.instance = fsDrawer.create($scope.options);

    $scope.toogleAction = function() {
        showAction = !showAction;
    }

    $scope.refresh = function() {
        $scope.instance.refresh();
    }

    $scope.open = function() {
        $scope.instance.open();
    }

    $scope.openSide = function() {
        $scope.instance.openSide();
    }

    $scope.toggleSide = function() {
        $scope.instance.toggleSide();
    }

    $scope.close = function() {
        $scope.instance.close();
    }

    $scope.closeSide = function() {
        $scope.instance.closeSide();
    }
})
.controller('DrawerCtrl',function($scope) {

    $scope.content = 'Content from the DrawerCtrl';
});
