const config = require('../config.js');

module.exports = function (responses) {

    const T = config.apdexT || 0.1;

    let satisfied = 0;
    let tolerating = 0;
    let frustrated = 0;

    responses.map(r => {
        const timeInSeconds = responses.up ? r.responseTime / 1000 : T * 100;//to seconds
        if (timeInSeconds <= T) {
            satisfied += 1;
        } else if (timeInSeconds > T && timeInSeconds < timeInSeconds <= (T * 4)) {
            tolerating += 1;
        } else {
            frustrated += 1;
        }

    });

    return (satisfied + (tolerating / 2)) / responses.length;
};
