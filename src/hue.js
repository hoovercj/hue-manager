const bing = require('./bing');
const setLightColorsFromFile = require('./colors').setLightColorsFromFile;
const errorHandler = require('./utils').errorHandler;
const flux = require('./flux');
const config = require('../config.json');

const FILENAME = 'bing.jpg';

const hue = require('node-hue-api'),
    HueApi = hue.HueApi,
    lightState = hue.lightState,
    host = config.hue.ip,
    username = config.hue.username,
    api = new HueApi(host, username);

var _ = require('lodash/core');

/** PUBLIC API */

// takes a name and an array of states
// Finds all scenes with that name and
// iterates over the lights in the scene,
// setting the states 
const updateScenesWithName = (name, states) => {
    // coerce states into an array
    states = [].concat(states);
    return getScenesWithName(name)
    .then(scenes => {
        console.log(`Updating these scenes:`);
        return scenes.forEach((scene) => {
            console.log(`Scene: ${scene.id}`);
            scene.lights.forEach((lightId, lightIndex) => {
                let newState = states[lightIndex % states.length];
                console.log(`light: ${lightId} - ${JSON.stringify(newState)}`);
                api.setSceneLightState(scene.id, lightId, newState);
            });
            console.log();
        });
    });
}

const updateSceneWithId = (sceneId, state) => {
    console.log(`Update scene ${sceneId}`);
    return api.scene(sceneId).then(scene => {
        return Promise.all(scene.lights.map(light => {
            console.log(`Set scene ${sceneId} light ${light} to ${JSON.stringify(state)}\n`);
            return api.setSceneLightState(sceneId, light, state);
        }));
    });
}

const getStateFromColor = (color) => {
    return lightState.create().on().hue(color.hue).sat(color.sat).bri(color.bri);
}

const getStateFromTemperature = (temperature) => {
    return lightState.create().on().ct(temperature);
}

const getScenesWithName = (name) => {
    return api.getScenes()
        .then(scenes => {
            return scenes.filter(scene => {
                return scene.name.toLowerCase()
                   .includes(name.toLowerCase());
            });
        });
}

/** PRIVATE FUNCTIONS */

const isRoom = (scene) => {
    return scene.type.toLowerCase() == 'room';
}

// Checks if all the lights in a scene are present in the group
const groupContainsScene = (group, scene) => {
    return scene.lights.reduce((result, light) => {
        return result && group.lights.includes(light);
    }, true);
}

exports.getScenesWithName = getScenesWithName;
exports.updateScenesWithName = updateScenesWithName;
exports.updateSceneWithId = updateSceneWithId;
exports.getStateFromColor = getStateFromColor;
exports.getStateFromTemperature = getStateFromTemperature;
exports.api = api;