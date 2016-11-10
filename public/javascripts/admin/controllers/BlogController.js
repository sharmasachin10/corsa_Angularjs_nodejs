/**--------------------------------------------------------------------------
Name                   : AccountController
Description            : use to view  the user item & accoununt functionality
--------------------------------------------------------------------------*/

angular.module('corsaAdminApp').controller('BlogController',['$LocalService','$scope', '$rootScope', '$state', '$AuthService', '$SessionService','$AccountService','$stateParams','EmailService','VechileService','NgTableParams','BlogService','$window','flashService',function($LocalService, $scope, $rootScope, $state, $AuthService, $SessionService, $AccountService,$stateParams,EmailService,VechileService,NgTableParams,BlogService,$window,flashService) {

     //var serverMsg;


     var blogId = (  $stateParams.blogId ) ? $stateParams.blogId : "";


     var serviceApi = {




          listBlogs : function () {
               BlogService.list(function (response) {
                    var serverMsg;
                    if(response.resStatus == "error") {
                         serverMsg = {resStatus : response.resStatus, msg: response.msg};
                         $scope.serverMsg = serverMsg;
                    } else if(response.resStatus == "success") {
                         $scope.allBlog = response.result;

                    }
               });
          },

          ViewBlog : function (blogId) {
               BlogService.view(blogId, function (response) {
                    if(response.resStatus == "error") {
                         serverMsg = {resStatus : response.resStatus, msg: response.msg};
                         $scope.serverMsg = serverMsg;
                    } else if(response.resStatus == "success") {
                         $scope.htmlcontent = response.result.description;
                         $scope.DataModel = response.result;
                    }
               });
          }


     }



     //======================================================send mail =================
     $scope.SendBlog = function(obj) {
          obj.description = $scope.htmlcontent;
          obj.userId = $SessionService.user()._id;
          //obj.userId =userId;
           // console.log(userId);
          if ($scope.myFile) {
               obj.file = $scope.myFile[0];
          }
          //console.log(obj);
          BlogService.add (obj, function (response) {
               if(response.resStatus == "error") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
                    $scope.serverMsg = serverMsg;
               } else if(response.resStatus == "success") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
                    //console.log(response);
                    $state.go('dashboard.blog', {message: serverMsg});
               }
          });
     };

     //================================delete email=========================================
     $scope.removeBlogData = function(blogId){
          BlogService.remove(blogId,function(response){
               var serverMsg={resStatus:response.resStatus,msg: response.msg};
               if(response.resStatus == "error"){
                    $scope.serverMsg = serverMsg;
               }else if(response.resStatus ="success"){
                    $scope.serverMsg = serverMsg;
                    $scope.DataModel = response.result;
                     $state.transitionTo($state.current, { refId :blogId,  message : serverMsg}, {reload: true, inherit: false, notify: true});

               }
          });
     }

     //==========================update email ========================
     $scope.updateBlog = function(obj){
          obj.description= $scope.htmlcontent;
          if ($scope.myFile) {
               obj.file = $scope.myFile[0];
          }
          BlogService.update (obj, function (response) {
               if(response.resStatus == "error") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
                    $scope.serverMsg = serverMsg;
               } else if(response.resStatus == "success") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
                    $state.go('dashboard.blog', {message: serverMsg});
               }
          });
     }

     $scope.confirmBoxBlog = function(blogId,stus) {
         var deleteUser = $window.confirm('Are you sure You want to Change Status ?');
         //console.log(deleteUser);return;
         var blogId = blogId;
         var status = stus;
         if(deleteUser)
         $scope.updatedBlogStatus(blogId,status);

    }
     /**** blog  status *****/
     $scope.updatedBlogStatus=function(blogId,status){
               BlogService.Status(blogId,status,function(response){
                    var serverMsg={resStatus:response.resStatus,msg: response.msg};
                    if(response.resStatus == "error"){

                         $scope.serverMsg = serverMsg;
                    }else if(response.resStatus ="success"){
                         $scope.serverMsg = serverMsg;
                         $scope.stus = response.result;

                         //console.log($scope.sts);
                        //$state.reload();
                        $state.transitionTo($state.current, { refId :blogId,  message : serverMsg}, {reload: true, inherit: false, notify: true});
                    }
               });

        }

        $scope.deleteBlog = function(blogId) {
            var deleteUser = $window.confirm('Are you sure You want to Delete this Blog Permanently ?');
            //console.log(deleteUser);return;
            var blogId = blogId;
           // var status = stus;
            if(deleteUser)
            $scope.removeBlogData(blogId);

       }


//=========================view blog  =====================================
     if(blogId) {
          serviceApi.ViewBlog(blogId);
     }


//=========================view blog  list=====================================
     if($state.current.name == 'dashboard.blog') {
               serviceApi.listBlogs();
          }

     //==========================status blobk ========================
     if($stateParams.message) {
     $scope.serverMsg = $stateParams.message;
     }


}]);
