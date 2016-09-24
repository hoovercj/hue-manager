const hue = require('./hue');
const SunCalc = require('suncalc');
const LAT = 55.7456;
const LON = 12.4904;

const MIN_TEMP = 153;
const MAX_TEMP = 447;
// const MAX_TEMP = 6500; // Hue max
const TEMP_RANGE = MAX_TEMP - MIN_TEMP;

const FLUX_SCENE_NAME = 'flux';
const TEMPERATURE_KEY = 'temperature';

const winston = require('winston');
const storage = require('node-persist');
storage.initSync();

/** PUBLIC API */

const updateFluxScenes = () => {
    let oldTemperature = getStoredTemperature();
    let newTemperature = getTemperature();
    let newState = hue.getStateFromTemperature(newTemperature);
    winston.info(`Old temperature: ${oldTemperature}`);
    winston.info(`New temperature: ${newTemperature}`);
    winston.info(`New state: ${JSON.stringify(newState)}`);
    setStoredTemperature(newTemperature);

    return hue.getScenesWithName(FLUX_SCENE_NAME)
    .then(scenes => {
        return scenes.map(scene => {
            return Promise.all(scene.lights.map(light => {
                return hue.api.lightStatus(light)
                       .then(status => {
                           winston.info(`light ${light} has temperature ${status.state.ct}`);
                           return status.state.ct == oldTemperature;
                       });
            })).then(lightStatuses => {
                winston.info(`Light statuses for ${scene.id}: ${JSON.stringify(lightStatuses)}`);
                return lightStatuses.every(status => status);
            }).then(active => {
                return hue.updateSceneWithId(scene.id, newState).then(() => {
                    if(active) {
                        winston.info(`Recalling scene ${scene.id}`);
                        return hue.api.recallScene(scene.id);
                    }
                    winston.info(`Scene ${scene.id} not active`);
                })
            });
        })
    }).then(winston.info('updateFluxScenes complete'));
}

/** PRIVATE FUNCTIONS */

const getStoredTemperature = () => {
    return storage.getItemSync(TEMPERATURE_KEY);
}

const setStoredTemperature = (temperature) => {
    winston.info(`Storing temperature ${temperature}`);
    storage.setItemSync(TEMPERATURE_KEY, temperature);
}

// Returns a hue-compatible temperature value
const getTemperature = () => {
    // get today's sunlight times for Buddinge
    let now = new Date();
    let times = SunCalc.getTimes(now, LAT, LON);
    
    let temp = MAX_TEMP;
    // Now is after the evening golden hour but before midnight
    if (now > times.goldenHour) {
        let midnight = new Date();
        midnight.setHours(24,0,0,0);

        let timeBetweenGoldenHourAndMidnight = midnight - times.goldenHour;
        let timeBetweenNowAndMidnight = midnight - now;
        let percentageTowardsMidnight = timeBetweenNowAndMidnight / timeBetweenGoldenHourAndMidnight;
        let percentageLight = 1 - percentageTowardsMidnight;
        temp = MAX_TEMP - (percentageLight * TEMP_RANGE);
        winston.info(`Time is after evening golden hour but before midnight.`);
    } 
    // Now is after midnight but before the morning golden hour
    else if (now < times.godenHourEnd) {
        let midnight = new Date();
        midnight.setHours(0,0,0,0);

        let timeBetweenGoldenHourAndMidnight = times.goldenHourEnd - midnight;
        let timeBetweenNowAndMidnight = now - midnight;
        let percentageLight = timeBetweenNowAndMidnight / timeBetweenGoldenHourAndMidnight;
        temp = MAX_TEMP - (percentageLight * TEMP_RANGE);
        winston.info(`Time is after midnight but before the morning golden hour.`);
    }
    // Now is "daytime"
    else {
        winston.info('Now it is daytime');
        temp = MIN_TEMP;
    }
    winston.info(`Temperature is ${temp}\n`);
    return temp;
}

exports.updateFluxScenes = updateFluxScenes;