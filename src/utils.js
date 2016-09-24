const request = require('request');
const winston = require('winston');

const requestPromise = (url, options) => {
    return new Promise((resolve, reject) => {
        request(url, options, (error, response, body) => {
            error ? reject(error) : resolve(body)
        });
    });
}

/** PUBLIC API */
const errorHandler = (error) => {
    winston.error(error);
}

exports.requestPromise = requestPromise;
exports.errorHandler = errorHandler;