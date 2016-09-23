const bing = require('./bing');
const setLightColorsFromFile = require('./colors').setLightColorsFromFile;
const errorHandler = require('./utils').errorHandler;
const flux = require('./flux');

const storage = require('./storage').collection;
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
    getScenesWithName(name)
    .then(scenes => {
        console.log(`Updating these scenes: ${JSON.stringify(scenes)}\n`);
        return scenes.forEach((scene) => {
            scene.lights.forEach((lightId, lightIndex) => {
                api.setSceneLightState(scene.id, lightId, states[lightIndex % states.length]);
            });
        });
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
            // console.log('Scenes: ' + JSON.stringify(scenes));
            return scenes.filter(scene => { 
                return scene.name.toLowerCase()
                   .includes(name.toLowerCase());
            });
        });
}

const getGroupForScene = (scene) => {
    // TODO: check bounds
    return api.groups()
        .then(groups => { 
            return groups.filter(isRoom)
                .filter(group => { return groupContainsScene(group, scene); })[0];
        });
}

const isGroupActive = (group) => {
    return _.isEqual(storage.get(group.id), group.lastAction);
}

const updateSavedGroupState = (group) => {
    api.group(group.id).then(group => {
        storage.update(group.id, group.lastAction);
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
exports.getStateFromColor = getStateFromColor;
exports.getStateFromTemperature = getStateFromTemperature;
exports.getGroupForScene = getGroupForScene;
exports.isGroupActive = isGroupActive;
exports.updateSavedGroupState = updateSavedGroupState;
exports.api = api;