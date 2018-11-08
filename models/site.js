const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const favicon = require('favicon');
const apdex = require('../lib/apdex');

const notifications = require('../lib/notifications');

const Site = thinky.createModel('Site', {
    id: type.string(),
    name: type.string().required(),
    url: type.string().required(),
    userID: type.string().required(),
    createdAt: type.date().default(r.now()),
    updatedAt: type.date(),
    icon: type.string().default('/img/potato.png'),
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

    favicon(site.url, function (err, favicon_url) {
        if (err) {
            console.error('could not get favicon for', site.url);
        } else {
            site.icon = favicon_url;
        }
        next();
    });

});

Site.defineStatic('cleanup', async function () {
    const month = 60 * 60 * 24 * 32; //32 days
    await this.filter(token => token('expires_on').lt(thinky.r.now().sub(month)).delete().execute();
});
    
Site.define('updateStats', function () {
    const site = this;

    Site.cleanup(); //start and ignore

    function averageResponse(responses) {
        const averages = 3;
        const sub = responses.slice(0, averages);
        return sub.reduce((total, current) => {
            return total + current.responseTime
        }, 0) / averages;

    }

    Response
        .orderBy({index: r.desc("createdAt")})
        .filter({siteID: site.id})
        .run()
        .then(responses => {

            if (responses[0].up) {
                if (!site.up) {
                    notifications.siteUp(site);
                }
                site.up = true;
            } else {
                if (site.up) {
                    site.outages = site.outages + 1;
                    notifications.siteDown(site);
                }
                site.up = false;

            }

            const timesDown = responses.reduce((total, current) => {
                if (!current.up) {
                    total += 1;
                }
                return total;
            }, 0);

            site.uptime = 100 - ((timesDown * 100) / responses.length);
            site.responseTime = averageResponse(responses);
            site.up = responses[0].up;
            site.apdex = apdex(responses);

            site.save();

        })
        .catch(err => {
            console.error(err);
        })

});

Site.hasMany(Response, 'responses', 'id', 'siteID');

Response.belongsTo(User, 'user', 'userID', 'id');
