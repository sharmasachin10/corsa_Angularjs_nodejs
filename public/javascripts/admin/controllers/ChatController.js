/**--------------------------------------------------------------------------
Name                   : CountController
Description            : use to Count Number of user and vehicle  and  complaints
--------------------------------------------------------------------------*/


angular.module('corsaAdminApp').controller('ChatController',['$LocalService','$scope', '$rootScope', '$state', '$AuthService', '$SessionService', '$location', '$localStorage','$AccountService','ChatService','$timeout','$anchorScroll', '$location',function($LocalService, $scope, $rootScope, $state, $AuthService, $SessionService, $location, $localStorage,$AccountService,ChatService, $timeout, $anchorScroll, $location) {

     $scope.messages = $scope.messages || [];
     $anchorScroll.yOffset = 50;
     $scope.username =($SessionService.user().fullname)?$SessionService.user().fullname : "";
     $scope.profilePic =($SessionService.user().profile.photo)?$SessionService.user().profile.photo : "";
     $localStorage.toObj = $localStorage.toObj || {};
     $scope.toObj = $localStorage.toObj;

     var socket = io();

     /**  registering User to the server **/
     socket.emit('init',  { userId : $SessionService.user()._id });

     /** getting Online Users on the server*/
     socket.on('user online', function(users){
          $scope.users = users;
          $scope.$apply();
     });

     var getChatMsg = function () {
          //console.log($SessionService.user()._id +"===="+ $localStorage.toObj._id); return;
          ChatService.listMessage($SessionService.user()._id, $localStorage.toObj._id,  function (response) {
               if(response.status == 200) {
                    $scope.messages = response.data.result;
               } else {
                    $scope.messages = [];
               }
          });
     }

     $scope.selectUser = function (obj) {
          $localStorage.toObj = obj;
          $scope.toObj = $localStorage.toObj;
          getChatMsg();
     }

     // socket.emit('list message');
     //
     // socket.on('list message', function(msgArr){
     //      $timeout(function () {
     //           $scope.messages = msgArr;
     //      }, 1000);
     // });

     angular.element('.panel-footer form').submit(function(){
          var obj = {};
          obj.from = $SessionService.user()._id;
          obj.to = $scope.toObj._id;
          obj.message = $scope.msg;
          socket.emit('user sendMessage', obj);
          var clone = "<li class='clearfix'><div class='chat-body clearfix'><div class='header'><strong class='primary-font'>"+ $SessionService.user().fullname.toUpperCase()+"</strong><small class='pull-right text-muted'><i class='fa fa-clock-o fa-fw'></i> 12 mins ago</small></div><p>"+obj.message+"</p></div></li>";
          angular.element('ul.chat').append(clone);
          $scope.msg = "";
          return false;
     });

     socket.on('user getMessage', function(obj){
          console.log("Msg Coming ========",obj);
          // var clone = "<li class='clearfix'><div class='chat-body clearfix'><div class='header'><strong class='primary-font'>"+obj.from.fullname.toUpperCase()+"</strong><small class='pull-right text-muted'><i class='fa fa-clock-o fa-fw'></i> 12 mins ago</small></div><p>"+obj.message+"</p></div></li>";
          // //var clone = angular.element("ul.chat").find("li:last").clone();
          // //clone.find('p').html(obj.message);
          // //clone.find('strong').html(obj.from.fullname);
          // angular.element('ul.chat').append(clone);
          $scope.messages.push(obj);
          $scope.$apply();
     });

     // if($localStorage.toObj && $localStorage.toObj._id) {
     //      getChatMsg();
     // }

}]);
