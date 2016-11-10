var winston = require('winston');
exports.Winstonlogger = new (winston.Logger)({
     transports: [
          new (winston.transports.Console)(),
          new (winston.transports.File)({ filename: 'corsa.log' })
     ]
});
