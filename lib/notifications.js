const request = require('request');
const config = require('../config');

module.exports = {
    siteDown: function (site) {
        if (config.slack.enabled && config.slack.webhookURL) {
            sendSlack('🔥 ' + site.name + ' is down');
        }
        if (config.airdale.enabled && config.airdale.apiKey) {
            sendAirdale('🔥 ' + site.name + ' is down', 'error');
        }
    },
    siteUp: function (site) {
        if (config.slack.enabled && config.slack.webhookURL) {
            sendSlack('😄 ' + site.name + ' is back up');
        }
        if (config.airdale.enabled && config.airdale.apiKey) {
            sendAirdale('😄 ' + site.name + ' is back up', 'success');
        }
    }
};

function sendSlack(string) {
    const options = {
        uri: config.slack.webhookURL,
        method: 'POST',
        json: {
            "text": string
        }
    };


    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log('slack message sent!');
        }
    });
}

function sendAirdale(string, type) {
    const options = {
        uri: `http://airdale.tsl.ac.uk/api/send/${config.airdale.apiKey}`,
        method: 'POST',
        json: {
            "message": string,
            "type": type,
            "details": 'n/a'
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log('airdale message sent!');
        }
    });
}


