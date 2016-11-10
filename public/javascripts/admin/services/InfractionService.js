/*
|--------------------------------------------------------------------------
| Name                   : CarBrandService
| Built in Dependencies  : $http
| Custom Dependencies    :  $localStorage, LocalService, AccessLevels
| Description            : use to  view  Reports
| Author                 : vishesh Tanwar
| Created                : 9 sept 2016
| ModifyBy               : ---
|--------------------------------------------------------------------------
*/
angular.module('corsaAdminApp').factory('InfractionService', function($q,$http, $LocalService, AccessLevels, $localStorage,$SessionService) {
     return {

          list : function(cb) {
               var userInfo = $http.get('/infraction/admin/list');
               userInfo.success(function(response) {
                    cb(response);
               });
          },
          sendnInfractionEmail : function(obj,cb){
               var msg = $http.post('infraction/admin/email',{'message':obj.message,'email':obj.to ,'userId':obj.userId,'name':obj.nam});
               msg.success(function(response) {
                    cb(response);
               });
          }

          

     }
});
