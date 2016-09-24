const bing = require('./src/bing');
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'bingScenes.log' });

winston.info('Starting BingScenes');
bing.updateBingScenes();