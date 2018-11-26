const renderError = require('../lib/renderError');
const Site = require('../models/site');
// const thinky = require('../lib/thinky');
const Response = require('../models/response');
const thinky = require('../lib/thinky');

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

        function getUp(site, date) {
            // if (!date) date = 0;
            console.log(date);
            return new Promise((good, bad) => {
                Response.filter({up: true, siteID: site.id}).orderBy(thinky.r.asc('createdAt'))
                    .filter(function (row) {
                        if (date) {
                            return row('createdAt').gt(date)
                        } else {
                            return true;
                        }

                    })
                    // .nth(0)
                    .limit(1)
                    .run()
                    .then(found => {
                        console.log(found);
                        if (found && found.length) {
                            good(found[0]);
                        } else {
                            good(null);
                        }
                    })
                    .catch(bad)
            });
        }

        function getDown(site, date) {
            // if (!date) date = 0;
            console.log(date);
            return new Promise((good, bad) => {
                Response.filter({up: false, siteID: site.id}).orderBy(thinky.r.asc('createdAt'))
                    .filter(function (row) {
                        if (date) {
                            return row('createdAt').gt(date)
                        } else {
                            return true;
                        }
                    })
                    .limit(1)
                    .run()
                    .then(found => {
                        console.log(found);
                        if (found && found.length) {
                            good(found[0]);
                        } else {
                            good(null);
                        }
                    })
                    .catch(bad)
            })

        }


        Site.get(id)
            .run()
            .then(site => {


                function getAllEvents() {

                    return new Promise((good, bad) => {
                        const events = [];

                        function finished() {

                            good(events);
                        }

                        function getNext() {
                            // console.log(events);

                            if (events && events.length) {
                                console.log(events[events.length - 1].up);
                                if (events[events.length - 1].up) {
                                    getDown(site, events[events.length - 1].createdAt)
                                        .then(event => {
                                            if (event) {
                                                events.push(event);
                                                getNext();
                                            } else {
                                                finished(events); //todo sort by createdAt
                                            }

                                        })
                                        .catch(err => {
                                            bad(err);
                                        });
                                } else {
                                    getUp(site, events[events.length - 1].createdAt)
                                        .then(event => {
                                            if (event) {
                                                events.push(event);
                                                getNext();
                                            } else {
                                                finished(events); //todo sort by createdAt
                                            }
                                        })
                                        .catch(err => {
                                            bad(err);
                                        });
                                }
                            } else {
                                getDown(site)
                                    .then(event => {
                                        if (event) {
                                            events.push(event);
                                            getNext();
                                        } else {
                                            finished(events); //todo sort by createdAt
                                        }

                                    })
                                    .catch(err => {
                                        bad(err);
                                    });
                            }

                        }


                        getNext();
                    });

                }


                getAllEvents()
                    .then(events => {
                        site.events = events;
                        return res.render('sites/show', {site});
                    })
                    .catch(err => {
                        console.error(err);
                    });

                // function looper(prevEvent) {
                //     return new Promise((good, bad) => {
                //         if (events && events.length) {
                //             if (events[events.length - 1].up) {
                //                 getDown(prevEvent)
                //                     .then(event => {
                //
                //                     })
                //             } else {
                //                 getUp(site, prevEvent)
                //                     .then(event => {
                //
                //                     })
                //             }
                //         } else {
                //             getUp(site, prevEvent)
                //                 .then(event => {
                //
                //                 })
                //         }
                //     })
                // }


                //
                // //TODO get responses for down and up
                //
                // const responsesToKeep = [];
                //
                // const promises = site.responses.map((r, ri) => {
                //
                //     return new Promise((good, bad)=>{
                //
                //     })
                //
                //     if (!r.up && (responsesToKeep.length === 0 || responsesToKeep[responsesToKeep.length - 1].up)) { //only if the response id down and the last response (if any) was up
                //         responsesToKeep.push(r);
                //         //get next up
                //         Response.filter(function (row) {
                //             return row('createdAt').gt(r.createdAt) && row('up').eq(true);
                //         })
                //             .nth(0)
                //             .run()
                //             .then(results => {
                //                 responsesToKeep.push(results[0]);
                //                 console.log(results);
                //             })
                //             .catch(err => {
                //                 console.error(err);
                //             });
                //         //
                //         // for (let i = ri; i < site.responses.length; i++) {
                //         //     if (site.responses[i].up) {
                //         //         responsesToKeep.push(site.responses[i]);
                //         //         break;
                //         //     }
                //         // }
                //     }
                // });
                //
                // delete site.responses;
                // site.events = responsesToKeep;

                // console.log(site);

            })
            .catch(err => renderError(res, err));

    }

};