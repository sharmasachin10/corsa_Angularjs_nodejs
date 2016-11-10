angular.module('corsaAdminApp').controller('infractionController',['$LocalService','$scope', '$rootScope', '$state', '$AuthService', '$SessionService', '$location', '$localStorage','$AccountService','CountService','CarBrandService','$stateParams','addBrandService','InfractionService','VechileService', 'NgTableParams','flashService',function($LocalService, $scope, $rootScope, $state, $AuthService, $SessionService, $location, $localStorage,$AccountService,CountService,CarBrandService,$stateParams,addBrandService,InfractionService,VechileService,NgTableParams,flashService) {


 var bId= (  $stateParams.vehicleId ) ? $stateParams.vehicleId : "";




 var serviceReportApi ={

     listInfraction :  function () {
         InfractionService.list(function (response) {
               var serverMsg;
               if(response.resStatus == "error") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
                    $scope.serverMsg = serverMsg;
               } else if(response.resStatus == "success") {
                    $scope.allReport = response.result;
                    $scope.usersTable = new NgTableParams({count:25}, {dataset: $scope.allReport});
                    //console.log($scope.allReport);
               }
         });
    },
     getCarInfo : function (carId) {
          VechileService.viewCar(carId, function (response) {
               if(response.resStatus == "error") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
                    $scope.serverMsg = serverMsg;
               } else if(response.resStatus == "success") {
                    $scope.vehicleDetail = response.result;

               }
          });
    },
    sendEmail : function (email,id,name) {

           $scope.email = email;
           $scope.userId = id;
           $scope.nam = name;
         }
     };


if($state.current.name == 'dashboard.infraction') {
     serviceReportApi.listInfraction();

}
if(bId){
     serviceReportApi.getCarInfo(bId);
}

$scope.sendMail = function(mail,id,name){
     serviceReportApi.sendEmail(mail,id,name);
}

$scope.sendMailToUser=function(msg,email,userId,name){
     obj= { };
     obj.to= email;
     obj.userId= $scope.userId;
     obj.message = msg;
     obj.nam = $scope.nam;
     InfractionService.sendnInfractionEmail(obj,function(response){
          serverMsg={resStatus:response.resStatus,msg: response.msg};
          if(response.resStatus == "error"){
               $scope.serverMsg = serverMsg;
          }else if(response.resStatus ="success"){
               $scope.serverMsg = serverMsg;
               $scope.message = '';

$state.transitionTo($state.current, { refId :userId,  message : serverMsg}, {reload: true, inherit: false, notify: true});

          }
     });
}


if($stateParams.message) {
$scope.serverMsg = $stateParams.message;
}




}]);
