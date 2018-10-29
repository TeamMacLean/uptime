// const request = require('request');
// const config = require('../config');
//
//
// module.exports = {
//     start: () => {
//
//         var options = {
//             uri: '/',
//             method: 'POST',
//             json: {
//                 "text": string
//             }
//         };
//
//         const interval = setInterval(function () {
//
//             request(options, function (error, response, body) {
//                 if (!error && response.statusCode === 200) {
//                     console.log('slack message sent!');
//                 }
//             });
//         }, config.monitoring.interval)
//
//     }
// };