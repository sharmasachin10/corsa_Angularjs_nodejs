/*
* Author : Sunny Chauhan
* Module : InfractionController
* Description : Use to report User or listing if
*/
const AppMessages = require(APP_PATH + '/config/Message.js');
const InfractionModel = require(APP_PATH + '/api/models/InfractionModel.js');
const AppConstants = require(APP_PATH + '/config/Constant.js');
const EmailService = require(APP_PATH + '/api/services/EmailService.js');

class InfractionController  {

     /**--------------------------------------------------------------------------
     Function    : add
     Description : use to report a listing
     --------------------------------------------------------------------------*/
     add (req, res) {

          InfractionModel(req.body).save (function (err, resData) {
               if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
               return res.json({resStatus:'success', msg :AppMessages.INFRACTION_ADD});
          });
     }

     /**--------------------------------------------------------------------------
     Function    : list
     Description : list infractions
     --------------------------------------------------------------------------*/
     admin_list (req, res) {
          InfractionModel.find({}).populate({path:'userId', select: 'name profile email'}) .sort( { createdDate : -1 } ).exec(function(err, resData){
               if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
               return res.json({resStatus:'success', msg :'Infractions', result : resData});
          });
     }



     admin_sendMessageReportEmail (req, res) {
               InfractionModel.find({userId : req.body.userId},function(err, resData){
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    if (resData) {
                         console.log(resData)
                         let template = AppConstants.INFRACTION_TEMPLATE;
                         template = template.replace("{{STATUS}}",req.body.message);
                         template = template.replace("{{USERNAME}}", req.body.name);
                         let mailOptions = {
                              from: AppConstants.EMAIL,
                              to: [req.body.email],
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

module.exports = new InfractionController();
