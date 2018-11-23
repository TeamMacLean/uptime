const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;
const moment = require('moment');

const Response = thinky.createModel('Response', {
    id: type.string(),
    siteID: type.string().required(),
    date: type.string(),
    createdAt: type.date().default(r.now()),
    updatedAt: type.date(),
    statusCode: type.number().required(),
    status: type.string().required(),
    up: type.boolean().required(),
    responseTime: type.number().required().default(10000),
    source: type.string().default("unknown")
});

module.exports = Response;

Response.pre('save', function (next) {
    if (!this.up) {
        this.responseTime = 0;
    }
    if (!this.date) {
        this.date = this.createdAt;
    }
    next();
});

Response.define('humanDate', function () {

    let calendar = moment(this.createdAt).calendar();

    if (calendar.indexOf('/') > -1) {
        //add the time too
        calendar += ' ' + moment(this.createdAt).format('h:mm:ss a');
    }

    return calendar;
});


Response.ensureIndex("createdAt");

const Site = require('./site');
Response.belongsTo(Site, 'site', 'siteID', 'id');