'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {

    $scope.instance = {};

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
                                    return true;
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

                        controller: function($scope) {

                        }};

    
    $scope.open = function() {
        $scope.instance.open();
    }
    
    $scope.openSide = function() {
        $scope.instance.showSide();
    }    
});
