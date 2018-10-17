const Site = require('../models/site');
const renderError = require('../lib/renderError');
const config = require('../config');
const thinky = require('../lib/thinky');

module.exports = {
    index: (req, res, next) => {
        function showFull() {
            const showGraphs = config.graphsOnIndex ? {
                _apply: function (sequence) {
                    return sequence.orderBy(thinky.r.desc('createdAt')).limit(100)
                }
            } : false;
            Site
                .orderBy(thinky.r.asc('name'))
                .getJoin({
                    responses: showGraphs

                })
                .run()
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