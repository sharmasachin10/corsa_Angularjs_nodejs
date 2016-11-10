/**--------------------------------------------------------------------------
Name                   : MessageController
Description            : use to view  and send message to the user item
--------------------------------------------------------------------------*/

module.exports = function($stateParams,$timeout, $scope,$state, $AuthService, $SessionService, $localStorage,$AccountService, $auth,VehicleService, FlashService) {

     /** Initiating userId from session */
     var uId = $SessionService.user()._id;
     var sessionUser = $SessionService.user();
     $scope.allMsg = $scope.allMsg || [];

     $scope.toId = '' ;
     var socket = io();
     socket.emit('init',  { userId : sessionUser._id });

     /** socket event for getting chat messages **/
     socket.on('ChatMsg', function(obj){
          $scope.allMsg = $scope.allMsg || [];
          $scope.allMsg.push(obj);
          $scope.$apply();

     });

     //angular.element( "#messages" ).scrollTop( 304 );
     //theDiv.scrollTop = theDiv.scrollHeight





     /**  Function to get Messages */
     var getuserMessage = function(toId){
          var fromId = $SessionService.user()._id;
          $AccountService.listUserMessage(toId,fromId, function (response) {
               if(response.resStatus == "error") {
                    $scope.serverMsg = {resStatus : response.resStatus, msg: response.msg};
               } else if(response.resStatus == "success") {
                    $scope.allMsg = response.result;
                    if($localStorage.toId) {
                         delete $localStorage.toId;
                    }
                    if($localStorage.msg) {
                         $scope.serverMsg = {resStatus : "success", msg: $localStorage.msg};
                         delete $localStorage.msg;
                    }
               }
          })
     };

     /**  Function to get Messages */
     var getUsers = function(){
          var userId = $SessionService.user()._id;
          $AccountService.listUsers(userId, function (response) {
               if(response.resStatus == "error") {
                    $scope.serverMsg = {resStatus : response.resStatus, msg: response.msg};
               } else if(response.resStatus == "success") {
                    $scope.users = response.result;
               }
          })
     }();

     $scope.replyMsg = function(msg) {

          var obj = obj || {};
          obj.message = msg;
          obj.to = $scope.toId ;
          obj.from = $SessionService.user()._id;
          VehicleService.addMsg (obj, function (response) {
               if(response.resStatus == "error") {
                    $scope.serverMsg = {resStatus : response.resStatus, msg: response.msg};
               } else if(response.resStatus == "success") {


                    $scope.allMsg.push(response.result);

               }
          });

     };

     // $scope.clearSearch = function () {
     //      $scope.msg = "";
     //     };

     $scope.getUserData = function(toId){
          $scope.toId = toId;
          getuserMessage(toId);
     }

     /**  Display of Flash Messages if exist */
     if($stateParams.message != null) {
          FlashService.show();
          $scope.serverMsg = $stateParams.message;
          FlashService.hide();
     }

     if ($localStorage.toId){
          $scope.toId = $localStorage.toId;
          if( $state.current.name == 'user.message') {
               getuserMessage($localStorage.toId);
          }
     }

}
