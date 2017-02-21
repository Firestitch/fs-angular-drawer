'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, fsDrawer,$q) {

    $scope.showAction = false;
    $scope.action = false;

    $scope.instance = fsDrawer
                    .create({   templateUrl: 'views/drawer.html',
                                sideTemplateUrl: 'views/drawerside.html',
                                controller: 'DrawerCtrl',
                                id: 'first-drawer',
                                openOnCreate: false,
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
                                        name: 'related',
                                        icon: 'share',
                                        tooltip: 'Related',
                                        click: function() {
                                            $scope.instance.toggleSide();
                                            this.select($scope.instance.isSideOpen());
                                        }
                                    },
                                    {
                                        name: 'properties',
                                        icon: 'toc',
                                        tooltip: 'Properties',
                                        show: false,
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

         $scope.thridInstance = fsDrawer
                                .create({   templateUrl: 'views/demo.html',
                                            openOnCreate: false });

    setTimeout(function() {
        $scope.secondInstance = fsDrawer
                            .create({   templateUrl: 'views/drawersecond.html',
                                        openOnCreate: false });


    },4000);

    $scope.toggleAction = function() {
        $scope.instance.toggleAction('properties');
    }

    $scope.showAction = function() {
        $scope.instance.showAction('properties');
    }

    $scope.hideAction = function() {
        $scope.instance.hideAction('properties');
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

    $scope.getInstances = function() {
        $scope.instances = fsDrawer.instances();
        debugger;
    }

    $scope.destroy = function() {
        fsDrawer.destroy();
    }

    $scope.closeAll = function() {
        fsDrawer.close();
    }
})
.controller('DrawerCtrl',function($scope,test,promise) {
    $scope.content = 'Content from the DrawerCtrl ' + promise;
});
