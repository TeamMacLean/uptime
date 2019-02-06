const request = require('request');
const config = require('../config');
const Site = require('../models/site');
const Response = require('../models/response');

function checkSites() {
    console.log('checking sites');

    Site.run()
        .then(sites => {

            sites.map(site => {


                const options = {
                    uri: site.url,
                    method: 'GET'
                };

                const start = new Date();

                request(options, function (error, response, body) {

                    let responseCode;
                    let status;

                    const end = new Date();
                    const elapsed_time = end - start;

                    console.log(site.url, elapsed_time + 'ms');

                    if (error) {
                        responseCode = 999;
                        status = error.code ? error.code : 'ERROR';
                    } else {
                        responseCode = response.statusCode;
                        status = response.statusMessage ? response.statusMessage : "" + response.statusCode;
                    }


                    const up = !error && response.statusCode === 200;

                    new Response({
                        siteID: site.id,
                        statusCode: responseCode,
                        status: status,
                        up: up,
                        responseTime: elapsed_time
                    })
                        .save()
                        .then(savedResponse=>{
                            site.updateStats();
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
}

module.exports = {
    start: () => {

        checkSites();//one to get it going

        const interval = setInterval(function () {
            checkSites();
        }, config.monitoring.interval)

    }
};