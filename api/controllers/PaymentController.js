/*
* Author : Sunny Chauhan
* Module : PaymentController
*/
const AppMessages = require(APP_PATH + '/config/Message.js');
const CommonService = require(APP_PATH + '/api/services/CommonService.js');
const AppConstants = require(APP_PATH + '/config/Constant.js');
const TransactionModel = require(APP_PATH + '/api/models/TransactionModel.js');
const BookingModel = require(APP_PATH + '/api/models/BookingModel.js');
const EmailService = require(APP_PATH + '/api/services/EmailService.js');
const UserModel = require(APP_PATH + '/api/models/UserModel.js');
const ENV_OBJ = require(APP_PATH + '/config/Env.js')();

let Paypal = require('paypal-express-checkout');
let paypal = Paypal.init(
     ENV_OBJ.PAYPAL.USERNAME,
     ENV_OBJ.PAYPAL.PASSWORD,
     ENV_OBJ.PAYPAL.SIGNATURE,
     ENV_OBJ.SITEURl + '/#/user/paypalInfo',
     ENV_OBJ.SITEURl + '/#/user/dashboard?trackID=failure',
     true
);

const winston = require('winston');
let Winstonlogger = new (winston.Logger)({
     handleExceptions: true,
     json: true,
     exitOnError: false,
     transports: [
          new (winston.transports.Console)(),
          new (winston.transports.File)({ filename: 'corsa.log' })
     ],
     exceptionHandlers: [
          new winston.transports.File({ filename: 'corsa-exceptions.log' })
     ]
});



class PaymentController  {

     /**--------------------------------------------------------------------------
     Function    : paynow
     Description : Authenticate Paypal & return the url to redirect
     --------------------------------------------------------------------------*/
     initiateBooking(req,res) {
          let currency = 'USD';
          let invoice = "INV" + new Date().getTime();
          let amount = req.body.price;
          let userId = req.body.userId;
          let vehicleId = req.body.vehicleId;
          let vehicle = req.body.model + " " + req.body.year;
          let transactionObj = {};
          transactionObj.invoice = invoice;
          transactionObj.amount = amount;
          transactionObj.userId = userId;
          transactionObj.vehicleId = vehicleId;
          transactionObj.paymentStatus = 'INITIATED';

          /** Saving transactions info into the database when user initiate the booking process */
          TransactionModel(transactionObj).save(function (err, resData) {
               if (err)  {
                    Winstonlogger.log('error', 'Transaction', {Transaction : 'Initial Transaction Request Not saved for '+ userId});
               }
               let bookingObj = {};
               bookingObj.transactionId = resData._id;
               bookingObj.startDate = req.body.startDate;
               bookingObj.endDate = req.body.endDate;
               bookingObj.userId = userId;
               bookingObj.vehicleId = vehicleId;
               bookingObj.location = req.body.location;
               bookingObj.fee = req.body.fee;
               bookingObj.deliveryType = req.body.deliveryType;
               bookingObj.bookingStatus = 'INITIATED';

               /** Saving booking info into the database when user initiate the booking process */
               BookingModel(bookingObj).save(function (err, resData) {
                    if (err)  Winstonlogger.log('error', 'Booking', 'Booking Not Initiated for '+userId);
                    Winstonlogger.log('info', 'Booking', 'Booking Initiated Successfull to '+userId);
               });
          });

          /** Getting Paypal Redirect URL for payment */
          paypal.pay(invoice, amount, vehicle, currency, true, function(err, url) {
               if (err)  {
                    //console.log(err);
                    Winstonlogger.log('error', 'Paypal Payment Url', {'Paypal Error in getting URl=== ' : err});
                    return res.json( { resStatus:'error', msg : AppMessages.SERVER_ERR } );
               }
               return res.json({resStatus:'success', msg : AppMessages.PAYMENT_REIDT_URL, result:url});
          });
     }

     /**--------------------------------------------------------------------------
     Function    : saveBooking
     Description : Use to upadte the transaction & booking after receiving response from Paypal
     --------------------------------------------------------------------------*/
     updateBookingAfterPaypalReponse (req,res) {
          let token = req.body.token;
          let payerID = req.body.PayerID;

          /** Getting PayerId & token from Paypal */
          if(req.body.PayerID && req.body.token) {

               /** Check if transaction already exist for the given token & payerID */
               TransactionModel.findOne( { token : token, payerID : payerID, paymentStatus : 'COMPLETED' }, { _id : 1 }).exec ( function (err, transactionExist) {
                         if(err) {
                              Winstonlogger.log('error', 'Paypal', {paypal : 'An unauthorized attempt has been made by userId '+ userId});
                              if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                         } else {

                              if(!transactionExist) {

                                   /** If transaction not exist for the given token & payerID, Getting Transaction info from Paypal */
                                   paypal.detail(token, payerID, function(err, data, invoiceNumber, price) {
                                        if (err) {
                                             Winstonlogger.log('error', 'Paypal', {paypal : 'Error While fetching payment info from paypal'});
                                             if (err) return res.json({resStatus:'error', msg : 'An unauthorized attempt has been made'});
                                        }
                                        let transactionObj = {};
                                        transactionObj.token = data.TOKEN;
                                        transactionObj.payerID = payerID;
                                        transactionObj.transactionId = data.PAYMENTINFO_0_TRANSACTIONID;
                                        transactionObj.timeStamp = data.TIMESTAMP;
                                        transactionObj.paymentStatus = data.PAYMENTSTATUS;
                                        transactionObj.amount = data.PAYMENTINFO_0_AMT;
                                        transactionObj.paypalFee = data.PAYMENTINFO_0_FEEAMT;
                                        transactionObj.paymentType = data.PAYMENTINFO_0_TRANSACTIONTYPE;
                                        transactionObj.transObj = data;
                                        transactionObj.paymentStatus = 'COMPLETED';

                                        /** If transaction retrieved for the given token & payerID, Updating Transaction Collection */
                                        TransactionModel.findOneAndUpdate({invoice : invoiceNumber},{$set : transactionObj},{upsert : false}).exec (
                                                  function (err, resData) {
                                                       if (err)  {
                                                            Winstonlogger.log('error', 'Transaction', {Transaction : 'Transaction failed for '+ resData._id});
                                                            return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                                                       }

                                                       if(resData) {
                                                            let bookingObj = {};
                                                            bookingObj.bookingStatus = 'COMPLETED';

                                                            /** If transaction retrieved for the given token & payerID, Updating Booking Collection */
                                                            BookingModel.findOneAndUpdate({transactionId : resData._id},{$set : bookingObj},{upsert : false}).exec (function (err, bookingData ) {
                                                                 if (err)  Winstonlogger.log('error', 'Booking', 'Booking Not Successfull to '+ resData.userId);
                                                                 Winstonlogger.log('info', 'Booking', 'Booking Confirmed to '+resData.userId);

                                                                 /** Sending Email to user For Booking Confirmation */
                                                                 CommonService.sendEmailForBooking(resData.userId, bookingData.startDate, bookingData.endDate);

                                                                 return res.json({resStatus:'success', msg : 'Booking Confirmed'});
                                                            });
                                                       } else {
                                                            Winstonlogger.log('error', 'Transaction', {Transaction : 'Transaction failed for '+ resData._id});
                                                            return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                                                       }

                                                  }
                                        );
                                   });
                              } else {
                                   Winstonlogger.log('error', 'Paypal', {paypal : 'An unauthorized attempt has been made by userId '});
                                   return res.status(500).json({resStatus:'error', msg : 'An unauthorized payment attempt has been made by userId '});
                              }
                         }
               });
          } else {
               return res.status(500).json({resStatus:'error', msg : 'An unauthorized payment attempt has been made by userId '+ userId});
          }

     }

     /**--------------------------------------------------------------------------
     Function    : getBookings
     Description : list all the bookings of a particular User
     --------------------------------------------------------------------------*/
     getBookings (req,res) {
          let userId = req.query.userId;
          if (req.query.type && req.query.type == 'PAST') {
               BookingModel.find(
                    {
                         "bookingStatus" : "COMPLETED",
                         "userId" : userId,
                         "endDate" : { $lt : new Date() }
                    }
               )
               .populate(
                    {
                         "path" : 'vehicleId userId transactionId',
                         "select" : 'name profile specifications gallery ridingCost amount createdDate invoice startDate endDate paymentStatus timeStamp paymentType email userId',
                         "populate" :
                         {
                              path : 'userId',
                              select : 'name profile'
                         }
                    }
               )
               .sort({"createdDate" : -1})
               .exec(function (err, data) {
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    return res.json({resStatus:'success', msg : "Transaction Informations", result : data});
               });
          } else if(req.query.type && req.query.type == 'PRESENT'){
               BookingModel.find(
                    {
                         "bookingStatus" : "COMPLETED",
                         userId : userId,
                         endDate : { $gte : new Date() }
                    }
               )
               .populate(
                    {
                         path : 'vehicleId userId transactionId',
                         select : 'name profile specifications gallery ridingCost amount createdDate invoice startDate endDate paymentStatus timeStamp paymentType email userId',
                         populate :
                         {
                              path : 'userId',
                              select : 'name profile'
                         }
                    }
               )
               .sort({createdDate : -1})
               .exec(function (err, data) {
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    return res.json({resStatus:'success', msg : "Transaction Informations", result : data});
               });
          } else {
               BookingModel.find({
                    "bookingStatus" : "COMPLETED",
                    userId:userId
               })
               .populate(
                    {
                         path : 'vehicleId userId transactionId',
                         select : 'name profile specifications gallery ridingCost amount createdDate invoice startDate endDate paymentStatus timeStamp paymentType email userId',
                         populate :
                         {
                              path : 'userId',
                              select : 'name profile'
                         }
                    }
               )
               .sort({createdDate : -1})
               .exec(function (err, data) {
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    return res.json({resStatus:'success', msg : "Transaction Informations", result : data});
               });
          }
     }

     /**--------------------------------------------------------------------------
     Function    : viewBooking
     Description : Get all the detail of a particular booking
     --------------------------------------------------------------------------*/
     viewBooking (req,res) {
          let bookingId = req.query.bookingId;
          BookingModel
          .findOne(
               {
                    _id:bookingId
               }
          )
          .populate(
               {
                    path : 'vehicleId userId transactionId bookingId',
                    select : 'name gallery profile specifications ridingCost amount createdDate invoice startDate endDate paymentStatus timeStamp paymentType email userId',
                    populate : {
                         path : 'userId',
                         select : 'name profile'
                    }
               }
          ).exec(function (err, data) {
               if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
               return res.json({resStatus:'success', msg : "Booking Information", result : data});
          });
     }

     /**--------------------------------------------------------------------------
     Function    : getVehicleBookingHistory
     Description : Get the booking History of a particular vehicle
     --------------------------------------------------------------------------*/
     getVehicleBookingHistory (req,res) {
          let vehicleId = req.query.vehicleId;
          BookingModel.find({
               vehicleId : vehicleId
          })
          .populate({
               path : 'vehicleId userId transactionId',
               select : 'name profile gallery specifications ridingCost amount createdDate invoice startDate endDate paymentStatus timeStamp paymentType email userId',

          })
          .exec(
               function (err, data) {
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    return res.json({resStatus:'success', msg : "Vehicle Transaction History", result : data});
               }
          );
     }

     /**--------------------------------------------------------------------------
     Function    : admin_getTransactions
     Description : Get the transaction History for overall bookings
     --------------------------------------------------------------------------*/
     admin_getTransactions (req,res) {
          TransactionModel.find({

          })
          .populate({
               path : 'vehicleId userId',
               select : 'name specifications vehicleProtection fullname profile userId',
               populate : {
                    path : 'userId',
                    select : 'name profile'
               }
          })
          .exec(function (err, data) {
               if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
               return res.json({resStatus:'success', msg : "Transaction Informations", result : data});
          });
     }

     /**--------------------------------------------------------------------------
     Function    : admin_ViewTransaction
     Description : Get the deatil of a particular transaction
     --------------------------------------------------------------------------*/
     admin_ViewTransaction (req,res) {
          TransactionModel.findOne({
               _id : req.query.transactionId
          })
          .populate({
               path : 'vehicleId',
               select : 'name specifications vehicleProtection userId',
               populate : {
                    path : 'userId',
                    select : 'name profile'
               }
          })
          .exec(
               function (err, data) {
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    return res.json({resStatus:'success', msg : "Transaction Infor", result : data});
               });
          }

          /**--------------------------------------------------------------------------
          Function    : admin_refundTransaction
          Description : Get the deatil of a particular transaction
          --------------------------------------------------------------------------*/
          admin_refundTransaction (req,res) {
               let transactionId = req.query.transactionId;
               TransactionModel.findOne({
                    _id : transactionId
               })
               .populate({
                    path : 'vehicleId userId',
                    select : 'name email fullname specifications vehicleProtection userId'
               })
               .exec(function (err, data) {
                    if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                    return res.json({resStatus:'success', msg : "Transaction Infor", result : data});
               });
          }

          /**--------------------------------------------------------------------------
          Function    : admin_paynow
          Description : Authenticate Paypal express checkout Url
          --------------------------------------------------------------------------*/
          admin_paynow(req,res) {
               let invoice = "INV" + CommonService.generateOtp(6);
               paypal.pay(
                    invoice,
                    req.body.amount,
                    'Seller',
                    'USD',
                    true,
                    function(err, url) {
                         if (err) return res.json({resStatus:'error', msg : AppMessages.SERVER_ERR});
                         return res.json({resStatus:'success', msg :AppMessages.PAYMENT_REIDT_URL,result:url});
                    }
               );
          }

     }
     module.exports=new PaymentController();
