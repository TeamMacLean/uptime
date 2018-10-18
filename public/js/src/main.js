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
    console.log("chart-" + name);
    var ctx = document.getElementById("chart-" + name).getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',//'bar',
        data: {
            labels: responses.map(function (r) {
                return moment(r.createdAt).calendar();
            }),
            datasets: [{
                label: 'ms',
                data: responses.map(function (r) {
                    return r.responseTime.toFixed(2);
                }),
                fill: false,//'start',
                backgroundColor: responses.map(function (r) {
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
        },
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