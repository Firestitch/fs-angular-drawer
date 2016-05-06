
(function () {
    'use strict';

    angular.module('fs-angular-drawer',['fs-angular-store','angularResizable'])
    .directive('fsDrawer', function(fsStore) {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/drawer.html',
                scope: {
                    options: '=fsOptions',
                    instance: '=fsInstance'
                },
                link: function($scope, element, attrs) {

                    if(!$scope.options) {
                        throw 'fs-drawer options not set';
                    }

                    $scope.drawerStyle = {};
                    $scope.sideDrawerStyle = {};

                    angular.extend($scope,$scope.options.scope);

                    $scope.hide = function() {
                        angular.element(document.querySelector('html')).removeClass('fs-drawer-active');
                        $scope.drawerStyle.right = '-5000px';
                    }

                    $scope.show = function() {
                        angular.element(document.querySelector('html')).addClass('fs-drawer-active');
                        $scope.drawerStyle.right = 0;
                    }

                    $scope.close = function() {
                        $scope.hide();
                        
                        if($scope.options.close) {
                          $scope.options.close();
                        }
                    }

                    $scope.actionClick = function(action) {
                        action.click($scope);
                    }

                    $scope.actionShow = function(action) {
                        if(action.show) {
                            return action.show($scope);
                        }

                        return true;
                    }

                    if($scope.options.destroy) {
                        $scope.hide();
                        $scope.options.destroy();
                    }
                    
                    $scope.open = function() { 
                        
                        if($scope.options.open) {

                            var args = [$scope];
                            angular.forEach(arguments,function(argument) {
                                args.push(argument);
                            });

                            $scope.options.open.apply(this,args)
                            $scope.show();
                        } else {
                            $scope.show();
                        }
                    }

                    if($scope.options.controller) {
                        $scope.options.controller($scope);
                    }

                    var persist = fsStore.get('drawer-persist',{});

                    $scope.drawerStyle.width = persist.mainWidth + 'px';
                    $scope.sideDrawerStyle.width = persist.sideWidth + 'px';

                    $scope.$on("angular-resizable.resizeEnd", function (event, args) {
                      
                        if(args.id=='fs-drawer-main') {
                            persist.mainWidth = args.width;
                            $scope.drawerStyle.width = args.width + 'px';
                        }

                        if(args.id=='fs-drawer-side') {
                            persist.sideWidth = args.width;
                            $scope.sideDrawerStyle.width = args.width + 'px';
                        }
                    });

                    $scope.instance = { open: $scope.open };
                }
            };
        });  
})();

angular.module('fs-angular-drawer').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/drawer.html',
    "<div resizable r-directions=\"['left']\" class=\"frame\" id=\"fs-drawer-main\" ng-style=\"drawerStyle\">\r" +
    "\n" +
    "    <div layout=\"row\" layout-fill>\r" +
    "\n" +
    "        <div class=\"actions\">\r" +
    "\n" +
    "            <a href ng-click=\"close()\" class=\"action\"><md-icon>close</md-icon></a>\r" +
    "\n" +
    "            <a href ng-click=\"actionClick(action)\" class=\"action\" ng-repeat=\"action in options.actions\" ng-show=\"actionShow(action)\"><md-icon>{{action.icon}}<md-tooltip>{{action.tooltip}}</md-tooltip></md-icon></a>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <div resizable r-directions=\"['right']\" class=\"drawer\" r-flex=\"true\" ng-style=\"sideDrawerStyle\" id=\"fs-drawer-side\">\r" +
    "\n" +
    "            <div class=\"wrap\" ng-include=\"options.sideTemplateUrl\"></div>            \r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div flex class=\"editor\">\r" +
    "\n" +
    "            <div class=\"wrap\" ng-include=\"options.templateUrl\"></div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );

}]);
