import moment from 'moment'
import Chart from 'chart.js';

window.Chart = Chart;
window.moment = moment;

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

window.charts = [];

window.buildGraph = function (name, responses) {

    //TODO limit data, get even split
    //e.g 1000 point, limit to 100 = get every 10th

    console.log('1');
    const oldArr = responses.reverse();
    const filteredArray = [];

    const maxVal = 100;

    const delta = Math.floor(oldArr.length / maxVal);
    console.log('2');

// avoid filter because you don't want
// to loop over 10000 elements !
// just access them directly with a for loop !
//                                 |
//                                 V
    for (let i = 0; i < oldArr.length; i = i + delta) {
        filteredArray.push(oldArr[i]);
    }

    console.log('3');


    const processedData = {
        labels: filteredArray.map(function (r) {
            return moment(r.createdAt).calendar();
        }),
        datasets: [{
            label: 'ms',
            data: filteredArray.map(function (r) {
                return r.responseTime.toFixed(2);
            }),
            fill: false,//'start',
            backgroundColor: filteredArray.map(function (r) {
                return r.up ? '#64EDC6' : '#ff7675';
            }),
            // // backgroundColor: [
            // //     '#64EDC6'
            // // ],
            // borderColor: responses.map(function (r) {
            //     return r.up ? '#64EDC6' : '#ff7675';
            // }),
            borderColor: [
                '#a29bfe'//'#64EDC6'
            ],
            // borderWidth: 1
        }]
    };

    console.log('4');
    if (window.charts[name]) {
        console.log('5');
        window.charts[name].data = processedData;
        window.charts[name].update();
    } else {
        console.log('6');
        var ctx = document.getElementById("chart-" + name).getContext('2d');
        window.charts[name] = new Chart(ctx, {
            type: 'line',//'bar',
            data: processedData,
            options: {
                // animation: false,
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