const express = require('express');
const router = express.Router();
// const passport = require('passport');
const basicAuth = require('basic-auth');

const index = require('./controllers/index');
const auth = require('./controllers/auth');
const api = require('./controllers/api');
const sites = require('./controllers/sites');

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


//API
router.route('/api/sites')
    .all(isAuthenticatedAPI)
    .get(api.listSites);

router.route('/api/responses')
    .all(isAuthenticatedAPI)
    .post(api.postResponse);

function isAuthenticatedAPI(req, res, next) {

    const credentials = basicAuth(req);

    console.log(credentials);

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
                                res.status(401).send('failed to log you in');
                            }
                        });
                    } else {
                        //wrong password
                        res.status(401).send('username and password not valid');
                    }
                } else {
                    //no such user
                    res.status(401).send('username and password not valid');
                }
            })
    } else {
        //username or password not received
        res.status(401).send('username and password not received');
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
