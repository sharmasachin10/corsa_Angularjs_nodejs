angular.module('corsaAdminApp').factory('flashService', function($q,$timeout,$rootScope) {
          return {
               hide : function() {
                    $timeout(function(){
                         $rootScope.statusMsg = false;
                    }, 5000);
               },
               show : function () {
                    $rootScope.statusMsg = true;
               }
          }
     });
