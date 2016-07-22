'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {

    var showAction = false;
    $scope.instance = {};
    $scope.action = false;

    $scope.options = {	templateUrl: 'views/drawer.html',
                        sideTemplateUrl: 'views/drawerside.html',
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
                        sideClass: 'sideClass',

                        controller: function($scope) {

                        }};
   
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
});
