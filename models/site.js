const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const request = require('request');


const Site = thinky.createModel('Site', {
    id: type.string(),
    name: type.string().required(),
    url: type.string().required(),
    userID: type.string().required(),
    createdAt: type.date().default(r.now()),
    updatedAt: type.date(),

    icon: type.string(),
    up: type.boolean().default(true),
    uptime: type.number().default(100),
    responseTime: type.number().default(0),
    apdex: type.number().default(0.0),
    outages: type.number().default(0)
});

module.exports = Site;

const Response = require('./response');
const User = require('./user');

Site.pre('save', function (next) {

    const site = this;
    site.updatedAt = new Date();

    const possibleIconPath = new URL(site.url).origin + '/favicon.ico';

    request({url: possibleIconPath, method: 'HEAD'}, function (err, res) {
        if (err) {
            site.icon = '';
        } else {
            if (/4\d\d/.test(res.statusCode) === false) {
                //it exists
                site.icon = possibleIconPath;
            }
        }
        next();
    });


});

const averageOfMostRecentNum = 3;

Site.define('updateStats', function () {
    console.log('updating stats');
    const site = this;
    Response
        .orderBy({index: r.desc("createdAt")})
        .filter({siteID: site.id})
        .run()
        .then(responses => {

            //getting outages
            //TODO this SHOULD be 1 outage reported each time it comes up from being down
            site.outages = responses.reduce((total, current) => {
                if (!current.up) {
                    total += 1;
                }
                return total;
            }, 0);

            site.responseTime = responses[0].responseTime;
            site.uptime = responses.length + site.outages / 100;

            site.uptime = 100 - (site.outages * 100) / responses.length; //...not ideal

            site.up = responses[0].up;

            site.save();

        })
        .catch(err => {
            console.error(err);
        })

});

Site.hasMany(Response, 'responses', 'id', 'siteID');

Response.belongsTo(User, 'user', 'userID', 'id');