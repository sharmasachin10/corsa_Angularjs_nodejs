/*
* Author : Sunny Chauhan
* Module : NewsLetterController
* Description : Use to login the user with social media
*/
const AppMessages = require(APP_PATH + '/config/Message.js');
const AppConstants = require(APP_PATH + '/config/Constant.js');
const NewsLetterModel = require(APP_PATH + '/api/models/NewsLetterModel.js');
const EmailService = require(APP_PATH + '/api/services/EmailService.js');

class NewsLetterController  {

     subscribe (req, res) {

          NewsLetterModel(req.body).save(function(err,resData){
               if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
               return res.json({resStatus:'success', msg : "Request has been submitted"});
          });

     }

     admin_list (req, res) {
          NewsLetterModel.find({status : true, isDeleted : false},function(err, resData){
               if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
               if (resData) {
                    return res.json({resStatus:'success', msg :'NewsLetter List', result : resData});
               } else {
                    return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
               }
          });
     }
     admin_sendMessageSubsEmail (req, res) {
               NewsLetterModel.find({email : req.body.email},function(err, resData){
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    if (resData) {
                         let template = AppConstants.SUBSCRIBER_EMAIL;
                         template = template.replace("{{MESSAGE}}", req.body.message);
                         //console.log(status)

                         let mailOptions = {
                              from: AppConstants.EMAIL,
                              to: [resData.email],
                              subject: "Send From Corsa Team",
                              html: template
                         }
                         EmailService.send(mailOptions,function(err, response){
                              console.log(err)
                              if(err) {
                                   console.log("Email Not Sent");
                              } else {
                                   console.log("Email Sent Succesfully");
                              }
                         });
                         return res.json({resStatus:'success', msg :'message send to email Successfully', result : resData});
                    } else {
                         return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    }
               });

}
}
module.exports = new NewsLetterController();
