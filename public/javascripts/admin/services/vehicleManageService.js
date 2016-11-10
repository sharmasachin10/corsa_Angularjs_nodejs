/*
|--------------------------------------------------------------------------
| Name                   : vehicleService
| Built in Dependencies  : $http
| Custom Dependencies    :  $localStorage, LocalService, AccessLevels
| Description            : use to view and edit profile
| Author                 : Mangal Singh
| Created                : 1 sep 2016
| ModifyBy               : vishesh 30 sept 2016
|--------------------------------------------------------------------------
*/
angular.module('corsaAdminApp').factory('vehicleManageService', function($q,$http, $LocalService, AccessLevels, $localStorage,$SessionService) {
     return {
          vehicleList:function(cb){
               var car=$http.get('/vehicles/admin/vehicleList');
               car.success(function(response) {
                    cb(response);
               });
          },

          status:function(vehicleId,email,status,cb){
               var statusCar=$http.get('/vehicles/admin/status?vehicleId='+vehicleId +'&email=' +email +'&status=' +status);
               statusCar.success(function(response) {
                    cb(response);
               });
          },






     }
});
