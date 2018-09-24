const Site = require('../models/site');
const renderError = require('../lib/renderError');
const config = require('../config');

module.exports = {
    index: (req, res, next) => {

        if (config.showSitesToUnauth) {
            Site.run()
                .then(sites => {
                    res.render('home', {sites});
                })
                .catch(err => renderError(res, err));
        } else {
            if (req.user) {
                Site.filter({userID: req.user.id})
                    .run()
                    .then(sites => {
                        res.render('home', {sites});
                    })
                    .catch(err => renderError(res, err));
            } else {
                res.render('index');
            }
        }
    }
};