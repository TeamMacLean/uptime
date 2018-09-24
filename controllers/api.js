const Site = require('../models/site');
const Response = require('../models/response');

module.exports = {
    listSites: (req, res, next) => {

        Site.filter({userID: req.user.id})
            .run()
            .then(sites => {
                return res.json({sites: sites})
            })
            .catch(err => {
                return res.status(401).send(err);
            })


    },
    postResponse: (req, res, next) => {

        Site.get(req.body.siteID)
            .run()
            .then(site => {
                if (site) { //it exists
                    if (site.userID === req.user.id) {//current user owns the site
                        new Response({
                            siteID: req.body.siteID,
                            createdAt: req.body.createdAt,
                            statusCode: req.body.statusCode,
                            status: req.body.status,
                            responseTime: req.body.responseTime,
                            up: req.body.up,
                            date: req.body.date

                        }).save()
                            .then(savedResponse => {
                                // console.log(savedResponse);

                                site.updateStats();

                                return res.status(200).send('ok');
                            })
                            .catch(err => {
                                console.log(err);
                                return res.status(400).send(err);
                            })
                    }

                } else {
                    //no such site
                    console.err('no such site');
                    return res.status(400).send('Site not found');
                }
            })
            .catch(err => {
                console.error(err);
                return res.status(400).send(err);
            })
    }
};