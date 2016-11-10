module.exports = function(app, express) {
     let router = express.Router();
     let routeObj = require(APP_PATH + '/api/controllers/NewsLetterController.js');
     let authorization = require(APP_PATH + "/api/middlewares/user_TokenAuth.js");
     let adminAuthorization = require(APP_PATH + "/api/middlewares/admin_TokenAuth.js");

     /** -----------Admin Api's --------------------*/
     router.post('/subscribe', routeObj.subscribe);
     router.get('/admin/list', adminAuthorization, routeObj.admin_list);
     router.post('/admin/sendEmailMsg', adminAuthorization, routeObj.admin_sendMessageSubsEmail);
     app.use('/newsletter', router);
}
