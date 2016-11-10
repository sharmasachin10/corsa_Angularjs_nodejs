/*
Author :- Sunny chauhan
Purpose :- Common Service used to provide utility methods
*/
const ENV_OBJ = require(APP_PATH + '/config/Env.js')();
const UserModel = require(APP_PATH + '/api/models/UserModel.js');
const ChatModel = require(APP_PATH + '/api/models/ConversationModel.js');
const TemplateModel = require(APP_PATH + '/api/models/TemplateModel.js');
const AppConstants = require(APP_PATH + '/config/Constant.js');
const EmailService = require(APP_PATH + '/api/services/EmailService.js');

var serviceObj = module.exports = {

     generateOtp : function (num) {
          let text = "";
          let possible = "0123456789";
          for( let i = 0; i < num; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
          return text;
     },

     getTemplate : function (referenceId, callback) {
          //console.log(referenceId);
          TemplateModel
          .findOne(
               {
                    "title" : referenceId
               },
               {
                    "status" : 0,
                    "isDeleted" : 0,
                    "createdDate" : 0,
                    "modifiedDate" : 0
               }
          )
          .exec(
               function (err, template) {
                    if(err) {
                         callback (true, null);
                    } else {
                         if(template) {
                              callback (null, template);
                         } else {
                              callback (true, null);
                         }
                    }
               }
          )
     },

     generateRandom:function(num){
          let text = "";
          possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          for( let i=0; i < num; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
          return text;
     },

     isEmailExist : function(newEmail, UserModel, cb) {
          let status = "ERR";
          UserModel.findOne ({email : newEmail}, function (err, res) {
               if(res != null) {
                    status =  true;
               } else {
                    status = false;
               }
               cb(status);
          });
     },

     isGoogleIdExist : function(googleId, UserModel, cb) {
          let status;
          UserModel.findOne ({googleId : googleId}, function (err, res) {
               if(res != null) {
                    status =  true;
               } else {
                    status = false;
               }
               cb(status);
          });
     },

     isFacebookIdExist : function(facebookId, UserModel, cb) {
          let status;
          UserModel.findOne ({facebookId : facebookId}, function (err, res) {
               if(res != null) {
                    status =  true;
               } else {
                    status = false;
               }
               cb(status);
          });
     },

     isMobileVerificationDone : function(userId, cb) {
          let UserModel = require(APP_PATH + '/api/models/UserModel.js');
          UserModel.findOne ( {_id : userId , "mobile" : { $ne : ""}, "otp" : null}, function (err, res) {
               if(err) {
                    cb("err", null);
               }else if(res != null) {
                    cb(null,true);
               } else {
                    cb(null,false);
               }
          });
     },

     isLicenseVerificationDone : function(userId, cb) {
          let UserModel = require(APP_PATH + '/api/models/UserModel.js');
          UserModel.findOne ( {_id : userId , "license.name" : { $exists : true, $ne : ""}}, function (err, res) {
               if(err) {
                    cb(true, null);
               }else if(res != null) {
                    cb(null,true);
               } else {
                    cb(null,false);
               }
          });
     },

     getUserTransactions : function(model, userId, cb) {
          model.find ( {userId : userId} , function (err, res) {
               if(err) {
                    cb("err", null);
               }else {
                    cb(null,res);
               }
          });
     },

     /**--------------------------------------------------------------------------
     Function    : sendPushNotification
     Description : send push notification
     --------------------------------------------------------------------------*/
     pushNotification (notifyObj, io, callback) {
          var FCM = require('fcm-node');
          var serverKey = ENV_OBJ.FCM.SERVERKEY;
          var fcm = new FCM(serverKey);

          UserModel.findOne({ "_id" : notifyObj.to} ,{fcm : 1, name : 1}, {"upsert" : false, "new":true}).exec(function (err, resData) {
               if(err) callback (true, null);
               if(!resData) {
                    callback (true, null);
               } else {

                    if(resData.fcm && resData.fcm.platform != 'WEB') {
                         ChatModel
                         .findOne(
                              {_id : notifyObj._id}
                         )
                         .populate (
                              {
                                   'path' : 'to from',
                                   'select' : 'name profile fcm'
                              }
                         )
                         .exec(function (err, data) {
                              if(err) callback (true, null);
                              if(data) {
                                   var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                        to : resData.fcm.deviceToken,
                                        //collapse_key: 'your_collapse_key',

                                        notification: {
                                             title: resData.fullname,
                                             body: notifyObj.message
                                        },

                                        data: {  //you can send only notification or only data(or include both)
                                             title : resData.fullname,
                                             message: notifyObj.message,
                                             userId : notifyObj.from,
                                             fromId : notifyObj.from,
                                             toId : notifyObj.to,
                                             action : 'PUSH',
                                             jsonData : data
                                        }
                                   };
                                   fcm.send(message, function(err, response){
                                        //console.log("==============", JSON.parse(err));
                                        if (JSON.parse(err) && JSON.parse(err).failure == 1) {
                                             //console.log(JSON.parse(err));
                                             callback ( true, null );
                                             //console.log("Something has gone wrong!");

                                        } else {

                                             callback ( null, data );
                                             console.log("Successfully sent with response: ", response);
                                        }
                                   });
                              }
                         });
                    } else {
                         ChatModel
                         .findOne(
                              {_id : notifyObj._id}
                         )
                         .populate (
                              {
                                   'path' : 'to from',
                                   'select' : 'name profile fcm'
                              }
                         )
                         .exec(function (err, data) {
                              if (err) {
                                   callback ( true, null );
                              } else {
                                   callback ( null, data);
                              }

                         });

                    }
               }
          });
     },

     sendEmailForBooking (userId, startDate, endDate) {
          /** Notify User For Booking */
          UserModel
          .findOne(
               {
                    _id : userId
               },
               {
                    'email' : 1,
                    'name' : 1

               }
          )
          .exec(
               function (err, userInfo) {

                    if (err) {
                         Winstonlogger.log('error', 'Email Not Sent to '+ userId, { error : err });
                    } else {
                         if(userInfo) {
                              let moment = require('moment');
                              let template = serviceObj.getTemplate("BOOKING-CONFIRMATION",function(err,data){

                                   let URL = 'http://localhost:3000/#/user/order';
                                   let STARTDATE = moment(startDate).format('MM/DD/YYYY h:mm a')
                                   let ENDDATE =moment(endDate).format('MM/DD/YYYY h:mm a');

                                   data.description =  data.description.replace("{{USERNAME}}", userInfo.fullname);
                                   data.description =  data.description.replace("{{STARTDATE}}", STARTDATE);
                                   data.description =  data.description.replace("{{ENDDATE}}", ENDDATE);
                                   data.description =  data.description.replace("{{URL}}",URL);
                                   let mailOptions = {
                                        from: AppConstants.EMAIL,
                                        to:  [userInfo.email],
                                        subject: data.subject,
                                        html: data.description
                                   }
                                   EmailService.send(mailOptions,function(err, response){
                                        if(err) {
                                             console.log("Email Not Sent");
                                        } else {
                                             console.log("Email Sent Succesfully");
                                        }
                                   });
                              });
                         }
                    }
               }
          )
     }


};
