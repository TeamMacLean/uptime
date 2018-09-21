const Site = require('../models/site');
const renderError = require('../lib/renderError');

module.exports = {
    index: (req, res, next) => {


        if (req.user) {
            //signed in


            //sites
            Site.filter({userID: req.user.id})
                .run()
                .then(sites => {
                    res.render('home', {sites});
                })
                .catch(err => renderError(res, err));


        } else {
            //no signed in
            res.render('index');
        }

    }
};