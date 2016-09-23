const request = require("./utils").requestPromise;
const errorHandler = require("./utils").errorHandler;
const fs = require('fs');

const hue = require('./hue');
const colorsApi = require('./colors');

const BING_ENDPOINT = 'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&mkt=en-US&n=';
const BING_ENDPOINT_TODAY = `${BING_ENDPOINT}1`; 
const BING_URL = 'http://www.bing.com';

const BING_SCENE_NAME = 'bing';
const BING_FILENAME = 'bing.jpg';

/** PUBLIC API */

const updateBingScenes = () => {
    downloadImageOfTheDay(BING_FILENAME)
    .then(() => { return colorsApi.getColorsFromFile(BING_FILENAME); })
    .then((colors) => { 
        console.log(`Got these colors from file: ${JSON.stringify(colors)}\n`);
        return colors.map(hue.getStateFromColor)
    }).then((states) => { 
        console.log(`Created these states from colors: ${JSON.stringify(states)}\n`);
        return hue.updateScenesWithName(BING_SCENE_NAME, states)
    }).catch(error => errorHandler);
}

const downloadImageOfTheDay = (filename) => {
    return getBingImageUrls(1)
        .then(urls => saveUrlToFile(urls[0], filename))
}


/** PRIVATE FUNCTIONS */

const getBingImageUrls = (numberOfUrls) => {
    let requestUrl = BING_ENDPOINT + numberOfUrls;
    return request(requestUrl)
        .then(responseBody => { return getUrlsFromApiResponse(responseBody)});
} 

const saveUrlToFile = (url, filename) => {
    return request(url, {encoding: 'binary'})
        .then(data => { fs.writeFileSync(filename, data, 'binary')})
        .catch(error => console.log(JSON.stringify(error)));
} 

const getUrlsFromApiResponse = (body) => {
    return JSON.parse(body).images.map(buildBingUrl);
}

const buildBingUrl = (imageInfo) => {
    return BING_URL + imageInfo.url;
}

exports.updateBingScenes = updateBingScenes;