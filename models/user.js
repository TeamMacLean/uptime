const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;
const bcrypt = require('bcryptjs');

const User = thinky.createModel('User', {
    id: type.string(),
    email: type.string().required(),
    password: type.string().required(),
    createdAt: type.date().default(r.now()),
    updatedAt: type.date()
});

module.exports = User;

User.define('verifyPassword', function (passwordCheck) {
    return bcrypt.compareSync(passwordCheck, this.password);
});

User.pre('save', function (next) {
    const user = this;

    user.updatedAt = new Date();

    // if (!user.isModified('password')) {
    //     return next();
    // }

    // bcrypt.genSalt(10, function (err, salt) {
    //     bcrypt.hash(user.password, salt, function (err, hash) {
    //         if (err) return next(err);
    //         user.password = hash;
    //     });
    // });

    next();
});

const Site = require('./site');
User.hasMany(Site, 'sites', 'id', 'siteID');