/**--------------------------------------------------------------------------
Name                   : vehicleManageController
Description            : use to view  the vehicle item
--------------------------------------------------------------------------*/

angular.module('corsaAdminApp').controller('vehicleManageController',['$LocalService','$scope', '$rootScope', '$state', '$AuthService', '$SessionService','$AccountService','$stateParams','EmailService','VechileService','vehicleManageService','NgTableParams','$window',function($LocalService, $scope, $rootScope, $state, $AuthService, $SessionService, $AccountService,$stateParams,EmailService,VechileService,vehicleManageService,NgTableParams,$window) {

     var serviceApi = {

     getAllVehicle :function(){
            vehicleManageService.vehicleList(function (response) {
                 if(response.resStatus == "error") {
                      serverMsg = {resStatus : response.resStatus, msg: response.msg};
                      $scope.serverMsg = serverMsg;
                 } else if(response.resStatus == "success") {
                      if(response.result != undefined || response.result.length > 0){
                          $scope.carList = response.result;
                          // console.log( $scope.carList );
                         $scope.usersTable = new NgTableParams({ count:10}, {dataset: $scope.carList});
                         // console.log( $scope.usersTable );
                      }
                      else{
                            $scope.message ="No Record Found";
                      }


                 }

              });
       },
 }

     /**  List  All User */
     if($state.current.name == 'dashboard.vehicle') {
          serviceApi.getAllVehicle();

     }
     $scope.confirmBox = function(vehicleId,email,stus) {
          var deleteUser = $window.confirm('Are you sure You want to Change Status?');
          //console.log(deleteUser);return;
          var vehicleId = vehicleId;
          var stus = stus;
          var email = email;
          if(deleteUser)
          $scope.updatedVehicleStatus(vehicleId,email,stus);

     }
     //update vehicle status
     $scope.updatedVehicleStatus=function(vehicleId,email,status){
               vehicleManageService.status(vehicleId,email,status,function(response){
                serverMsg={resStatus:response.resStatus,msg: response.msg};
                    if(response.resStatus == "error"){
                         $scope.serverMsg = serverMsg;
                    }else if(response.resStatus ="success"){
                         $scope.sts = response.result;
               $state.transitionTo($state.current, { message : serverMsg}, {reload: true, inherit: false, notify: true});
                    }
               });
        }
   if($stateParams.message) {
        $scope.serverMsg = $stateParams.message;
   }

}]);
