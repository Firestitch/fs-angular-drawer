(function () {
    'use strict';

    angular.module('fs-angular-drawer',['fs-angular-store','angularResizable'])
    .directive('fsDrawer', function(fsStore, $http, $compile) {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/drawer.html',
            scope: {
                options: '=fsOptions',
                instance: '=fsInstance'
            },
            controller: function($scope) {

                angular.extend($scope,$scope.options.scope);

                if($scope.options.controller) {
                    $scope.options.controller($scope);
                }
            },

            link: function($scope, element, attrs) {

                if(!$scope.options) {
                    throw 'fs-drawer options not set';
                }

                $http.get($scope.options.templateUrl).success(function (data) {
                    var el = angular.element(element[0].querySelector('.pane-main .wrap')).html(data);
                    $compile(el.contents())($scope);
                });

                if($scope.options.sideTemplateUrl) {
                    $http.get($scope.options.sideTemplateUrl).success(function (data) {
                        var el = angular.element(element[0].querySelector('.pane-side .wrap')).html(data);
                        $compile(el.contents())($scope);
                    });
                }

                $scope.drawerStyle = {};
                $scope.sideDrawerStyle = {};                    

                function hide() {
                    angular.element(document.querySelector('html')).removeClass('fs-pane-side-active');
                    $scope.drawerStyle.right = '-5000px';
                }

                function show() {
                    angular.element(document.querySelector('html')).addClass('fs-pane-side-active');
                    $scope.drawerStyle.right = 0;
                }

                function hideSide() {
                    angular.element(document.querySelector('.pane-side')).css('display','none');
                }

                function showSide() {
                    angular.element(document.querySelector('.pane-side')).css('display','block');
                }

                $scope.closeDrawer = function() {
                    hide();
                    
                    if($scope.options.close) {
                      $scope.options.close();
                    }
                }

                $scope.actionClick = function(action, $event) {
                    action.click($scope, $event);
                }

                $scope.actionShow = function(action) {
                    if(action.show) {
                        return action.show($scope);
                    }

                    return true;
                }
                
                $scope.openDrawer = function() { 
                    
                    if($scope.options.open) {

                        var args = [$scope];
                        angular.forEach(arguments,function(argument) {
                            args.push(argument);
                        });

                        $scope.options.open.apply(this,args)
                        show();
                    } else {
                        show();
                    }
                }

                var persist = fsStore.get('drawer-persist',{});

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

                $scope.instance = { open: $scope.openDrawer, hideSide: hideSide, showSide: showSide };

                if($scope.options.load) {
                    $scope.options.load($scope);
                }
            }
        };
    })

})();