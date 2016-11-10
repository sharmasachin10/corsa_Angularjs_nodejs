/**--------------------------------------------------------------------------
Name                   : BookingController
Description            : use to view  the vehicle item
--------------------------------------------------------------------------*/

angular.module('corsaAdminApp').controller('BookingController',['$LocalService','$scope', '$rootScope', '$state', '$AuthService', '$SessionService','$AccountService','$stateParams','EmailService','VechileService','vehicleManageService','NgTableParams','$window','VechileService',function($LocalService, $scope, $rootScope, $state, $AuthService, $SessionService, $AccountService,$stateParams,EmailService,VechileService,vehicleManageService,NgTableParams,$window,VechileService) {

     var serviceApi = {

     getBookingVehicle :function(){
            VechileService.listBooking(function (response) {
                 if(response.resStatus == "error") {
                      serverMsg = {resStatus : response.resStatus, msg: response.msg};
                      $scope.serverMsg = serverMsg;
                 } else if(response.resStatus == "success") {
                      if(response.result != undefined || response.result.length > 0){
                          $scope.carList = response.result;
                          // console.log( $scope.carList );
                         $scope.bookingTable = new NgTableParams({ count:25}, {dataset: $scope.carList});
                         // console.log( $scope.usersTable );
                      }
                      else{
                            $scope.message ="No Record Found";
                      }


                 }

              });
       },
       getUserInfo :function(name,path,photo,des,email){
            $scope.name=name;
            $scope.path=path;
            $scope.photo=photo;
            $scope.des=des;
            $scope.email=email;

       }
 }

     /**  List  All vehicle */
     if($state.current.name == 'dashboard.Booking') {
          serviceApi.getBookingVehicle();

     }

     $scope.getBookedUser = function(name,path,photo,des,email){
                    serviceApi.getUserInfo(name,path,photo,des,email);
     }





}]);
