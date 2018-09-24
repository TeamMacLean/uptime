const User = require('../models/user');
const renderError = require('../lib/renderError');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const config = require('../config');

module.exports = {
    signin: (req, res, next) => {
        return res.render('auth/signin');
    },
    signinPost: (req, res, next) => {


        passport.authenticate('local', function (err, user, info) {
            console.log('user', info);
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/signin');
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/');
            });
        })(req, res, next);

    },


    signup: (req, res, next) => {
        if (!config.allowRegistration) {
            return res.status(400).send('Signups are currently disabled');
        }
        return res.render('auth/signup');
    },
    signupPost: (req, res, next) => {

        const email = req.body.email;
        const password = req.body.password;
        const password2 = req.body['password-confirm'];

        User.filter({email})
            .then((users) => {
                if (users.length > 0) {
                    return renderError(res, new Error(`A user already exists with email address ${email}`))
                }

                //TODO email must not exist already


                if (password !== password2) {
                    renderError(res, new Error('Passwords do not match'));
                }


                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hashedPassword) {
                        if (err) return next(err);

                        new User({
                            email, password: hashedPassword
                        })
                            .save()
                            .then(savedUser => {
                                //TODO show flash that it was created

                                req.login(savedUser, function (err) {
                                    if (!err) {
                                        res.redirect('/');
                                    } else {
                                        //handle error
                                        renderError(res, new Error('failed to log you in'))
                                    }
                                });
                            })
                            .catch(err => renderError(res, err));

                    });
                });


            })
            .catch(err => renderError(res, err));


    },
    signout: (req, res, next) => {
        req.logout();
        return res.redirect('/');
    }
};