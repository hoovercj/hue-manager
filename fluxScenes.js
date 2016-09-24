const flux = require('./src/flux');
const winston = require('winston');
winston.add(winston.transports.File, { filename: 'fluxScenes.log' });

winston.info('Starting FluxScenes');
flux.updateFluxScenes();