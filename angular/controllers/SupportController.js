

module.exports = function($LocalService, $scope, $rootScope, $state, $AuthService, $SessionService, $location, $localStorage,$AccountService, $timeout, $filter, SocketService) {

     /** Initialize messages  **/
     $scope.messages = $scope.messages || [];

     /** Initiate Admin Id  **/
     $scope.adminId = '57fea37594ef64d760275813';

     /** Checking the existence of sessionUser **/
     $scope.sessionUser = Object.keys($SessionService.user()).length ? $SessionService.user() : "";

     /** socket event for registering User on socket **/
// +     var registerUser = function () {
// +          socket.emit('init',  { userId : $scope.sessionUser._id });
// +     }

     /** function for showing chat box **/
     var showChatBox = function () {
          angular.element('#qnimate').addClass('popup-box-on');
     }

     /** function for hiding chat box **/
     var hideChatBox = function () {
          angular.element('#qnimate').removeClass('popup-box-on');
     }

     /** function for getting first letter of a string **/
     var getFirstLetter = function (userName) {
          return userName.charAt(userName).toUpperCase();
     }

     /** function for hitting Api for getting past messages **/
     var getChatMsg = function () {
          $AccountService.listMessage($scope.sessionUser._id, $scope.adminId,  function (response) {
               if(response.status == 200) {
                    $scope.messages = response.data.result;
               }
          });
     }

     /** function for posting chat message **/
     var postMsg = function (fromId, toId, msg) {
          var obj = {};
          obj.from = fromId;
          obj.to = toId;
          obj.message = msg;
          SocketService.emit('user sendMessage', obj);
          var clone = "<div class='onchatis'><div class='user-icon'><h4>"+ $scope.sessionUser.fullname + "</h4></div><div class='message-new'><h5>"+obj.message+"</h5></div></div>";
           angular.element('.popusagesd').append(clone);
           $scope.msg = "";
          return false;
     }

     /** Event for showing Chat box **/
     $scope.showChat = function () {
          showChatBox();
     }

     /** Event for hiding Chat box **/
     $scope.hideChat = function () {
          hideChatBox();
     }

     /** Event for posting chat message **/
     $scope.chat = function () {
          postMsg($scope.sessionUser._id, $scope.adminId, $scope.msg);
     }

     /** Event for registering new anonymous Chat User**/
     $scope.registerChatUser = function (obj) {
          $AccountService.registerChat(obj, function (response) {
               if(response.status == 200) {
                    registerUser();
                    $scope.sessionUser = response.data.result;
                    postMsg($scope.sessionUser._id, $scope.adminId, obj.msg);
               }
          });
     }

     SocketService.on('user getMessage', function(obj){
          console.log("========" + obj); 
          $scope.messages.push(obj);
     });

     /** Regis **/
     // if($scope.sessionUser) {
     //      registerUser();
     // }

     //listenMessages();
}
