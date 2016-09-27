'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, fsDrawer,$q) {

    var showAction = false;
    $scope.action = false;

    $scope.instance = fsDrawer
                    .create({   templateUrl: 'views/drawer.html',
                                sideTemplateUrl: 'views/drawerside.html',
                                controller: 'DrawerCtrl',
                                resolve: {
                                    test: function() {
                                        return "TEST!";
                                    },
                                    promise: function() {

                                        return $q(function(resolve) {
                                            resolve("promise");
                                        });
                                    }
                                },
                                scope: {
                                    variable: $scope.variable
                                },
                                actions: [
                                    {
                                        icon: 'share',
                                        tooltip: 'Related',
                                        click: function() {
                                            $scope.instance.toggleSide();
                                        }
                                    },
                                    {
                                        icon: 'toc',
                                        tooltip: 'Properties',
                                        show: function($scope) {
                                            return showAction;
                                        },
                                        click: function() {
                                            this.class = 'action-class';
                                             $scope.instance.openSide();
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
                                sideClass: 'sideClass' });

     $scope.secondInstance = fsDrawer
                            .create({   templateUrl: 'views/drawersecond.html',
                                        });

    $scope.toggleAction = function() {
        showAction = !showAction;
    }

    $scope.refresh = function() {
        $scope.instance.refresh();
    }

    $scope.open = function() {
        $scope.instance.open();
    }

    $scope.openSecond = function() {
        $scope.secondInstance.open();
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
.controller('DrawerCtrl',function($scope,test,promise) {
    $scope.content = 'Content from the DrawerCtrl ' + promise;
});
