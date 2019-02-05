const request = require('request');
const config = require('../config');
const Site = require('../models/site');
const Response = require('../models/response');


module.exports = {
    start: () => {

        const interval = setInterval(function () {
            console.log('checking sites');

            Site.run()
                .then(sites => {

                    sites.map(site => {


                        const options = {
                            uri: site.url,
                            method: 'GET'
                        };

                        console.time(site.id);

                        request(options, function (error, response, body) {

                            const timeTaken = console.timeEnd(site.id);

                            new Response({
                                siteID: site.id,
                                statusCode: response.statusCode,
                                status: ""+response.statusCode,
                                up: !error && response.statusCode === 200,
                                responseTime: timeTaken
                            })
                                .save()
                                .then(savedResponse => {
                                    console.log(savedResponse, timeTaken);
                                })
                                .catch(err => {
                                    console.error(err);
                                })



                        });


                    })

                })
                .catch(err => {
                    console.error(err);
                });
        }, config.monitoring.interval)

    }
};