const hue = require('./hue');
const SunCalc = require('suncalc');
const LAT = 55.7456;
const LON = 12.4904;

const MIN_TEMP = 153;
const MAX_TEMP = 450;
// const MAX_TEMP = 6500; // Hue max
const TEMP_RANGE = MAX_TEMP - MIN_TEMP;

const FLUX_SCENE_NAME = 'flux';

/** PUBLIC API */

// Returns a hue-compatible temperature value
const getTemperature = () => {
    // get today's sunlight times for Buddinge
    let now = new Date();
    let times = SunCalc.getTimes(now, LAT, LON);

    // Now is after the evening golden hour but before midnight
    if (now > times.goldenHour) {
        let midnight = new Date();
        midnight.setHours(24,0,0,0);

        let timeBetweenGoldenHourAndMidnight = midnight - times.goldenHour;
        let timeBetweenNowAndMidnight = midnight - now;
        let percentageTowardsMidnight = timeBetweenNowAndMidnight / timeBetweenGoldenHourAndMidnight;
        let percentageLight = 1 - percentageTowardsMidnight;
        return MIN_TEMP + (percentageLight * TEMP_RANGE);
    } 
    // Now is after midnight but before the morning golden hour
    else if (now < times.godenHourEnd) {
        let midnight = new Date();
        midnight.setHours(0,0,0,0);

        let timeBetweenGoldenHourAndMidnight = times.goldenHourEnd - midnight;
        let timeBetweenNowAndMidnight = now - midnight;
        let percentageLight = timeBetweenNowAndMidnight / timeBetweenGoldenHourAndMidnight;
        return MIN_TEMP + (percentageLight * TEMP_RANGE);
    }
    // Now is "daytime"
    else {
        return MAX_TEMP;
    }
}

const activateFluxScenes = () => {
    // Need to do a few things:
    // 1. Match scenes to groups
    // 2. Get the latest group action
    // 3. If the action has changed, update the scene but don't activate it.
    // 4. If the action has NOT changed, update the scene and activate it.
    // 5. Update the "expected" action for next time

    getFluxScenes()
    .then(scenes => scenes.forEach(scene => {
        api.recallScene(scene.id);
    }));
}

const updateFluxScenes = () => {
    let temperature = getTemperature();
    console.log('temp: ' + temperature);
    let state = hue.getStateFromTemperature(temperature);
    hue.updateScenesWithName(FLUX_SCENE_NAME, state);
    
    recallFluxScenesIfActive();
}

const recallFluxScenesIfActive = () => {
    hue.getScenesWithName(FLUX_SCENE_NAME)
    .then(scenes => {
        scenes.forEach(scene => {
            hue.getGroupForScene(scene)
            .then(group => {
                if (hue.isGroupActive(group)) {
                    api.recallScene(scene.id);
                    hue.updateSavedGroupState(group);
                }
            });
        });
    })
}

exports.getTemperature = getTemperature;
exports.updateFluxScenes = updateFluxScenes;