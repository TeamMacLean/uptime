const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const rethinkSession = require('session-rethinkdb')(session);
const LocalStrategy = require('passport-local');


const config = require('./config');
const app = express();
const User = require('./models/user');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


const r = require('./lib/thinky').r;
const store = new rethinkSession(r);
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    store
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    if (req.user != null) {
        res.locals.signedInUser = {};
        res.locals.signedInUser.username = req.user.username;
        res.locals.signedInUser.email = req.user.email;
        res.locals.signedInUser.name = req.user.name;
        res.locals.signedInUser.mail = req.user.mail;
        if (req.user.iconURL) {
            res.locals.signedInUser.iconURL = req.user.iconURL;
        }
    }
    return next();
});


passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});
passport.use(new LocalStrategy(
    { // or whatever you want to use
        usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
        passwordField: 'password'
    },
    function (username, password, done) {
        User.filter({email: username})
            .then(users => {
                if (!users.length) {
                    return done(null, false);
                }
                if (!users[0].verifyPassword(password)) {
                    return done(null, false);
                }
                return done(null, users[0]);
            })
            .catch(done);
    }
));


const routes = require('./routes');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
