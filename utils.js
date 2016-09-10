const request = require('request');

const requestPromise = (url, options) => {
    return new Promise((resolve, reject) => {
        request(url, options, (error, response, body) => {
            error ? reject(error) : resolve(body)
        });
    });
}

/** PUBLIC API */
const errorHandler = (error) => {
    console.error(error);
}

exports.requestPromise = requestPromise;
exports.errorHandler = errorHandler;