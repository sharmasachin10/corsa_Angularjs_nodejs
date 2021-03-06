
module.exports = function ($scope, $state, $uibModal, $sce,$AccountService,$location,$anchorScroll,$window) {

     var getDate = function (days) {
          var today = new Date();
          if(days) {
               today.setDate(today.getDate() + days);
          }
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();

          if(dd<10) {
               dd='0'+dd
          }

          if(mm<10) {
               mm='0'+mm
          }

          return mm+'/'+dd+'/'+yyyy;
     }

     function customRange(input){
          return {
               minDate: (input.id == "endDate" ? angular.element("#startDate").datepicker("getDate") : new Date())
          };
     }

     function customRangeStart(input){
          return {
               maxDate:(input.id == "startDate" ?angular.element("#endDate").datepicker("getDate") : null)
          };
     }

     $scope.ctrl = $scope.ctrl || {};

     $scope.compareDate = function () {
          console.log("HOOOOOOOO");
          $scope.$watch('ctrl', function (newDate, oldDate, scope) {
               if($scope.ctrl.fromDate && $scope.ctrl.toDate) {
                    console.log($scope.ctrl.fromDate + "==" + $scope.ctrl.toDate);
                    console.log($scope.ctrl);
                    if ( new Date ($scope.ctrl.fromDate).getTime() == new Date ($scope.ctrl.toDate).getTime() ) {
                         if($scope.ctrl.fromTime == $scope.ctrl.toTime) {
                              console.log("Hhhhhhhhhhh");
                         }
                    }
               }
          });

     }

     angular.element('#startDate').datepicker({
          minDate: new Date(),
     }).change($scope.compareDate);

     angular.element('#endDate').datepicker({
          beforeShow: customRange
     }).change($scope.compareDate);


     $scope.searchVehicle=function(obj){
          var obj = obj || {};
          if($scope.autocomplete) {
               if($scope.autocomplete.getPlace()) {
                    obj.location = $scope.autocomplete.getPlace().formatted_address;
                    var location = $scope.autocomplete.getPlace().geometry.location;
                    var placeObj = $scope.autocomplete.getPlace();
                    obj.lat = location.lat();
                    obj.lon = location.lng();
                    placeObj.address_components.forEach(function (item) {
                         for(i=0; i<item.types.length; i++) {
                              if(item.types[i] =='locality'){
                                   obj.city = item.long_name ? item.long_name : "";
                              }
                              if(item.types[i] =='country'){
                                   obj.country = item.long_name ? item.long_name : "";
                              }
                              if(item.types[i] =='administrative_area_level_1'){
                                   obj.state = item.long_name ? item.long_name : "";
                              }
                         }
                    });
                    //console.log("===========");
                    $state.go('anon.search.list', {message : obj});
                    //$state.go("user.dashboard", {message:serverMsg});
               } else {
                    //console.log("===========");
                    $scope.isRequired = true;
               }
          } else {
               $scope.isRequired = true;
          }
     }
     $scope.showVideo = false;
     $scope.playVideo = function () {
          $scope.showVideo = true;
          // var modalInstance = $uibModal.open({
          //      //animation: $ctrl.animationsEnabled,
          //      ariaLabelledBy: 'modal-title',
          //      ariaDescribedBy: 'modal-body',
          //      templateUrl: '/elements/videoPopup.html',
          //      controller: 'ModalInstanceController',
          //      resolve: {
          //           items : $sce.trustAsResourceUrl('http://player.vimeo.com/video/189964314')
          //      }
          // });
          // modalInstance.result.then(function (selectedItem) {
          //
          // }, function () {
          //
          // });
     }

     $scope.dispalyDuration = function () {
          $scope.showDuration = true;
     }

     $scope.submitNewsletter = function(){
          $AccountService.newsletter($scope.email,function(response){
               var serverMsg;
               if(response.resStatus == "error") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
               } else if(response.resStatus == "success") {
                    serverMsg = {resStatus : response.resStatus, msg: response.msg};
                    $scope.serverMsg = serverMsg;
                    //console.log($scope.serverMsg )
               }
          });
     }

     //
     $scope.gotoAnchor = function(x) {
          var newHash = 'anchor' + x;
          if ($location.hash() !== newHash) {
               $location.hash('anchor' + x);
          } else {
               $anchorScroll();
          }
     };

     $scope.gotoTop = function(){
          $window.scrollTo(0, 0);
     }

     $scope.videoSrc = $sce.trustAsResourceUrl('http://player.vimeo.com/video/189964314');

}
