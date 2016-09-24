// let _logger;
// const init = (logName) => {
//     // create a stdout and file logger
//     logName = logName ? logName : 'default'; 
//     _logger = require('simple-node-logger').createSimpleLogger(`${logName}.log`);
// }

// const log = (message) => {
//     console.log(message);
//     if (!_logger) {
//         console.log('re-init');
//         init();
//     }
//     _winston.info(message);
// }

// exports.init = init;
// exports.log = log;