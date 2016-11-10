module.exports = function(app, express, io) {
     let router = express.Router();
     let adminAuthorization = require(APP_PATH + "/api/middlewares/admin_TokenAuth.js");
     let authorization = require(APP_PATH + "/api/middlewares/user_TokenAuth.js");
     let routeObj = require(APP_PATH + '/api/controllers/ChatController.js');
     const UserModel = require(APP_PATH + '/api/models/UserModel.js');
     const ConversationModel = require(APP_PATH + '/api/models/ConversationModel.js');
     const CommonService = require(APP_PATH + '/api/services/CommonService.js');
     const ChatModel = require(APP_PATH + '/api/models/ConversationModel.js');

     router.post('/register',routeObj.registerChatUser);
     router.get('/list/:userId/:fromId',routeObj.listChat);
     router.get('/listUsers',authorization, routeObj.listUsers);
     router.get('/listMessage',authorization, routeObj.listMessage);

     router.post('/addMessage',authorization, function (req, res) {
          req.body.type = 'Message';
          ChatModel(req.body)
          .save(
               function(err,resData){
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    /** Send Push Notification to Mobile*/
                    CommonService.pushNotification(resData,io, function (errPush, response) {
                         if (errPush) {
                              return res.json({resStatus:'error', msg : "Some Error Occured, Please try after Some time"});
                         } else {
                              //console.log("1111111111111UIINNNNNN");
                              if(response.to.fcm.platform == 'WEB') {

                                   io.sockets.to(response.to.fcm.deviceToken).emit('ChatMsg', response);
                              }
                              return res.json({resStatus:'success', msg :"Your message has been sent", result: response});
                         }
                    });
               }
          );
     });

     app.use('/chat', router);
}
