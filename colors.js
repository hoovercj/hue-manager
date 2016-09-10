const getColorsCallback = require('get-image-colors');
const lightState = require('node-hue-api').lightState;
const errorHandler = require('./utils').errorHandler;

const HUE_SCALAR = 65535 / 359;
const SAT_MAX = 254;
const BRI_MAX = 254;

/** PUBLIC API */

// Returns an array of Hue compatible color objects
const getColorsFromFile = (filename) => {
    return new Promise((resolve, reject) => { 
        getColorsCallback(filename, (error, colors) => {
            error ? reject(error) : resolve(colors.map(processColorObject));
        });
    });
}

/** PRIVATE FUNCTIONS */

const processColorObject = color => {
    console.log(`color.hsl = ${color.hsl()}`);
    return {
        hue: Math.floor(color.hsl()[0] * HUE_SCALAR),
        sat: Math.floor(color.hsl()[1] * SAT_MAX),
        bri: Math.floor(color.hsl()[2] * BRI_MAX)
    }
}

const setLightColor = (api, color, index) => {
    console.log(`Setting: ${index} to ${JSON.stringify(color)}`)
    api.setLightState(index, lightState.create().hue(color.hue).sat(color.sat));
}

exports.getColorsFromFile = getColorsFromFile;
