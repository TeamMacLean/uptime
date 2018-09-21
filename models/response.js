const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;


const Response = thinky.createModel('Response', {
    id: type.string(),
    siteID: type.string().required(),
    createdAt: type.date().default(r.now()),
    statusCode: type.number().required(),
    status: type.string().required(),
    up: type.boolean().required(),
    responseTime: type.number().required()
});

module.exports = Response;

Response.ensureIndex("createdAt");

const Site = require('./site');
Response.belongsTo(Site, 'site', 'siteID', 'id');