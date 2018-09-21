const renderError = require('../lib/renderError');
const Site = require('../models/site');

module.exports = {

    new: (req, res, next) => {
        return res.render('sites/new');
    },
    newPost: (req, res, next) => {

        const name = req.body.name;
        const url = req.body.url;

        if (name && url && name.length && url.length) {


            new Site({
                name, url, userID: req.user.id
            })
                .save()
                .then(savedSite => {
                    return res.redirect('/');
                })
                .catch(err => renderError(res, err));

        } else {
            renderError(res, new Error('Site name and URL not received'))
        }

    },
    /* edit: (req, res, next) => {

     },
     editPost: (req, res, next) => {

     },*/
    remove: (req, res, next) => {

    },
    show: (req, res, next) => {

    }

};