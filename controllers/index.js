const Site = require('../models/site');
const renderError = require('../lib/renderError');
const config = require('../config');
const thinky = require('../lib/thinky');

module.exports = {
    index: (req, res, next) => {

        function showFull() {
            const site = Site.orderBy(thinky.r.asc('name'));

            if (config.graphsOnIndex) {
                site.getJoin({
                    responses: {
                        _apply: function (sequence) {
                            return sequence
                                .filter(  thinky.r.row('transactionDate').during(r.time(2016, 1, 1,"Z"), r.time(2016, 6, 8,"Z")))
                                .orderBy(thinky.r.desc('createdAt')).limit(100)
                        }
                    }
                })
            }
            site.run()
                .then(sites => {
                    return res.render('home', {sites});
                })
                .catch(err => renderError(res, err));
        }

        if (config.showSitesToUnauth) {
            showFull();
        } else {
            if (req.user) {
                showFull();
            } else {
                res.render('index');
            }
        }
    }
};