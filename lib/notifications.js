const request = require('request');
const config = require('../config');

module.exports = {
    siteDown: function (site) {
        if (config.slack.enabled && config.slack.webhookURL) {
            sendSlack('🔥 ' + site.name + ' is down');
        }
    },
    siteUp: function (site) {
        sendSlack('😄 ' + site.name + ' is back up');
    }
};

function sendSlack(string) {
    var options = {
        uri: config.slack.webhookURL,
        method: 'POST',
        json: {
            "text": string
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('slack message sent!');
            // console.log(body.id) // Print the shortened url.
        }
    });
}



