module.exports = {
    port: 3000,
    db: 'uptime',
    secret: 'Change Me',
    showSitesToUnauth: true,
    graphsOnIndex: true,
    allowRegistration: false,
    apdexT: 0.2,
    monitoring:{
        interval:5
    },
    slack: {
        enabled: false,
        webhookURL: 'N/A'
    },
    airdale: {
        enabled:false,
        apiKey: ''
    }
};
