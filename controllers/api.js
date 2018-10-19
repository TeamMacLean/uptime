const Site = require('../models/site');
const Response = require('../models/response');
const thinky = require('../lib/thinky');

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
    getResponses: (req, res, next) => {

        const hour = 60 * 60;
        const day = hour * 24;
        const week = day * 7;
        const month = day * 31;
        const year = day * 365;

        let range = day; //24 hours

        if (req.params.range) {

            switch (req.params.range) {
                case 'hour':
                    range = hour;
                    break;
                case 'day':
                    range = day;
                    break;
                case 'week':
                    range = week;
                    break;
                case 'month':
                    range = month;
                    break;
                case 'year':
                    range = year;
                    break;
                default:
                    range = day;
                    break;
            }


        }

        Site.get(req.params.siteID)
            .getJoin({
                responses: {
                    _apply: function (sequence) {
                        return sequence
                            .filter(function (row) {
                                return row('createdAt').during(thinky.r.now().sub(range), thinky.r.now()) //1 day ago - now
                            })
                            .orderBy(thinky.r.desc('createdAt'))
                        //.limit(100) shouldnt need to limit for now, might use skip though
                    }
                }
            })
            .run()
            .then(site => {

                const oldArr = site.responses.reverse();
                let filteredArray = [];

                const maxVal = 100;

                const delta = Math.floor(oldArr.length / maxVal);


                if (oldArr.length < maxVal) {
                    filteredArray = oldArr;
                } else {
                    for (let i = 0; i < oldArr.length; i = i + delta) {
                        filteredArray.push(oldArr[i]);
                    }
                }

                site.responses = filteredArray;

                return res.json(site);
            })
            .catch(err => {
                console.error(err);
                return res.status(400).json({error: err});
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