const request = require('request');
const config = require('../config');
const Site = require('../models/site');
const Response = require('../models/response')


module.exports = {
    start: () => {



        Site.run()
            .then(sites => {

                sites.map(site => {

                    const interval = setInterval(function () {

                        const options = {
                            uri: site.url,
                            method: 'GET'
                        };

                        console.time(site.id);

                        request(options, function (error, response, body) {
                            if (!error && response.statusCode === 200) {


                                console.log('slack message sent!');
                            }

                            const timeTaken = console.timeEnd(site.id);

                            new Response({
                                siteID: site.id,
                                statusCode: response.statusCode,
                                status: response.statusCode,
                                up: !error && response.statusCode === 200,
                                responseTime: timeTaken
                            })

                        });
                    }, config.monitoring.interval)

                })

            })
            .catch(err => {
                console.error(err);
            });


    }
};