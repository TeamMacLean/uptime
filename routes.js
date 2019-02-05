const express = require('express');
const router = express.Router();
// const passport = require('passport');
const basicAuth = require('basic-auth');

const index = require('./controllers/index');
const auth = require('./controllers/auth');
const sites = require('./controllers/sites');
const api = require('./controllers/api');
const User = require('./models/user');

router.route('/')
    .get(index.index);

router.route('/signup')
    .get(auth.signup)
    .post(auth.signupPost);

router.route('/signin')
    .get(auth.signin)
    .post(auth.signinPost);

router.route('/signout')
    .get(auth.signout);

//SITES

router.route('/sites/new')
    .all(isAuthenticated)
    .get(sites.new)
    .post(sites.newPost);
router.route('/sites/:id')
    .get(sites.show);

router.route('/sites/:id/edit')
    .all(isAuthenticated)
    .get(sites.edit)
    .post(sites.editPost);

//API
router.route('/api/sites')
    .all(isAuthenticatedAPI)
    .get(api.listSites);

router.route('/api/responses')
    .all(isAuthenticatedAPI)
    .post(api.postResponse);

router.route('/api/responses/:siteID')
    .get(api.getResponses);

router.route('/api/responses/:siteID/:range')
    .get(api.getResponses);


function isAuthenticatedAPI(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    const credentials = basicAuth(req);

    if (credentials && credentials.name && credentials.pass) {

        User.filter({email: credentials.name})
            .run()
            .then(users => {
                if (users && users.length) {
                    const user = users[0];
                    if (user.verifyPassword(credentials.pass)) {
                        //valid user

                        //log them in
                        req.login(user, function (err) {
                            if (!err) {
                                //return continue (good)
                                return next();
                            } else {
                                //failed, dono why
                                return res.status(401).send('failed to log you in');
                            }
                        });
                    } else {
                        //wrong password
                        return res.status(401).send('username and password not valid');
                    }
                } else {
                    //no such user
                    return res.status(401).send('username and password not valid');
                }
            })
    } else {
        //username or password not received
        return res.status(401).send('username and password not received');
    }

}


function isAuthenticated(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.returnTo = req.path;
        return res.redirect('/signin');
    }

}

module.exports = router;
