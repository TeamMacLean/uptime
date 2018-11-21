import moment from 'moment'
import Chart from 'chart.js';
// import {apdexT} from '../../../config';
const apdexT = 200;
window.Chart = Chart;
window.moment = moment;

window.charts = [];
window.dataSets = [];


function fixBrokenImages() {
    const img = document.getElementsByTagName('img');
    let i = 0, l = img.length;
    for (; i < l; i++) {
        const t = img[i];
        if (t.naturalWidth === 0) {
            //this image is broken
            t.src = '/img/potato.png';
        }
    }
}

window.loadGraph = function (siteID, range) {

    range = typeof range === 'string' ? '/' + range : ''; //skookum!

    if (window.dataSets[siteID] && window.dataSets[siteID][range]) {
        buildGraph(siteID, window.dataSets[siteID][range]);
    } else {
        window.queue.place(function () {

            try {
                const Http = new XMLHttpRequest();
                const url = '/api/responses/' + siteID + range;
                Http.open("GET", url);
                Http.send();
                let doneHere = false;

                Http.onreadystatechange = () => {
                    if (Http.readyState === 4 && Http.status === 200 && !doneHere) {
                        doneHere = true;
                        try {
                            const site = JSON.parse(Http.responseText);
                            if (site.responses) {

                                //cache results
                                if (!window.dataSets[siteID]) {
                                    window.dataSets[siteID] = [];
                                }
                                window.dataSets[siteID][range] = site.responses;

                                buildGraph(siteID, site.responses);
                            }
                            window.queue.next();
                        } catch (err) {
                            console.error(err);
                            window.queue.next();
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                window.queue.next();
            }
        });
    }

};

window.onload = function () {
    fixBrokenImages();
};

//https://github.com/tessel/sync-queue
function Queue() {

    // Create an empty array of commands
    const queue = [];
    // We're inactive to begin with
    queue.active = false;
    // Method for adding command chain to the queue
    queue.place = function (command) {
        // Push the command onto the command array
        queue.push(command);
        // If we're currently inactive, start processing
        if (!queue.active) queue.next();
    };
    // Method for calling the next command chain in the array
    queue.next = function () {
        // If this is the end of the queue
        if (!queue.length) {
            // We're no longer active
            queue.active = false;
            // Stop execution
            return;
        }
        // Grab the next command
        const command = queue.shift();
        // We're active
        queue.active = true;
        // Call the command
        command();
    };
    //Clearing queue
    queue.clear = function () {
        queue.length = 0;
        queue.active = false;
    };

    return queue;
}

window.queue = new Queue();


window.buildGraph = function (name, responses) {
    const ctx = document.getElementById("chart-" + name).getContext('2d');

    // const width = document.getElementById("chart-" + name).parentElement.clientWidth;
    const height = document.getElementById("chart-" + name).parentElement.clientHeight;
    const gradientStroke = ctx.createLinearGradient(0, height, 0, 0);

    // function getApdexColor(response) {
    //     const T = apdexT;
    //
    //     const timeInSeconds = response.up ? response.responseTime / 1000 : 999999;//to seconds
    //     if (timeInSeconds <= T) {
    //         return '#55efc4';
    //     } else if (timeInSeconds > T && timeInSeconds <= (T * 4)) {
    //         return '#ffeaa7'
    //     } else {
    //         return '#ff7675';
    //     }
    // }


    const quickData = responses.reduce((all, r, idx) => {
        all.labels.push(moment(r.createdAt).calendar());
        all.datasets.push(r.responseTime.toFixed(2));
        return all;
    }, {labels: [], datasets: [], colors: []});


    gradientStroke.addColorStop(0, "#5DEEC4");


    const max = Math.max(...quickData.datasets);

    const bit = 1 / max;

    if (max < apdexT) {
        gradientStroke.addColorStop(1, "#5DEEC4");
    }

    if (max >= apdexT) {
        gradientStroke.addColorStop(bit * apdexT, "#FEDB62");
    }

    if (max >= (apdexT * 2)) {
        gradientStroke.addColorStop(bit * (apdexT * 2), "#FC3C63");
        gradientStroke.addColorStop(1, "#FC3C63");
    }

    console.log('max:', max);


    const processedData = {
        labels: quickData.labels,
        datasets: [{
            label: 'ms',
            data: quickData.datasets,
            fill: false,//'start',
            // borderColor: '#7993F9'//quickData.colors,


            borderColor: gradientStroke,
            // pointBorderColor: gradientStroke,
            // pointBackgroundColor: gradientStroke,
            // pointHoverBackgroundColor: gradientStroke,
            // pointHoverBorderColor: gradientStroke,

            borderWidth: 4,

        }]
    };

    if (window.charts[name]) {
        window.charts[name].data = processedData;
        window.charts[name].update();
    } else {

        window.charts[name] = new Chart(ctx, {
            type: 'line',//'bar',
            data: processedData,
            options: {
                legend: {
                    display: false
                },
                elements: {point: {radius: 0, hitRadius: 30, hoverRadius: 0}},
                scales: {
                    yAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            // display: false,
                            suggestedMin: 0,
                            min: 0,
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            display: false //this will remove only the label
                        }
                    }]
                },
                tooltip: {
                    mode: 'label'
                }
            }
        });
    }
};