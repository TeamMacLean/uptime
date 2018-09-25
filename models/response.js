const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;


const Response = thinky.createModel('Response', {
    id: type.string(),
    siteID: type.string().required(),
    date: type.string(),
    createdAt: type.date().default(r.now()),
    updatedAt: type.date(),
    statusCode: type.number().required(),
    status: type.string().required(),
    up: type.boolean().required(),
    responseTime: type.number().required()
});

module.exports = Response;

Response.pre('save', function (next) {

    if (!this.date) {
        this.date = this.createdAt;
    }
    next();

});


Response.ensureIndex("createdAt");

const Site = require('./site');
Response.belongsTo(Site, 'site', 'siteID', 'id');