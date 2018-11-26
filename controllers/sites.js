const renderError = require('../lib/renderError');
const Site = require('../models/site');
// const thinky = require('../lib/thinky');

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
    edit: (req, res, next) => {
        const id = req.params.id;
        Site.get(id)
            .then(site => {
                return res.render('sites/edit', {site})
            })
            .catch(err => renderError(res, err));
    },
    editPost: (req, res, next) => {
        const id = req.params.id;
        const name = req.body.name;
        const url = req.body.url;

        Site.get(id)
            .then(site => {
                site.name = name;
                site.url = url;
                site.save()
                    .then(savedSite => {
                        return res.redirect('/sites/' + site.id);
                    })
                    .catch(err => renderError(res, err))
            })
            .catch(err => renderError(res, err));

    },
    remove: (req, res, next) => {

    },
    show: (req, res, next) => {

        const id = req.params.id;

        Site.get(id)
            .getJoin({
                responses: {
                    _apply: function (sequence) {
                        return sequence.orderBy("createdAt") // Retrieve all the accounts ordered by sold
                    }
                }
            })
            .run()
            .then(site => {

                //TODO get responses for down and up

                const responsesToKeep = [];

                site.responses.map((r, ri) => {
                    if (!r.up && (responsesToKeep.length === 0 || responsesToKeep[responsesToKeep.length - 1].up)) { //only if the response id down and the last response (if any) was up
                        responsesToKeep.push(r);
                        //get next up
                        for (let i = ri; i < site.responses.length; i++) {
                            if (site.responses[i].up) {
                                responsesToKeep.push(site.responses[i]);
                                break;
                            }
                        }
                    }
                });

                delete site.responses;
                site.events = responsesToKeep;

                console.log(site);
                return res.render('sites/show', {site});
            })
            .catch(err => renderError(res, err));

    }

};