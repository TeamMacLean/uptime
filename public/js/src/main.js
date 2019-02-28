import moment from 'moment'
import Chart from 'chart.js';

window.Chart = Chart;
window.moment = moment;

window.charts = [];
window.dataSets = [];

const apdexT = 0.2;
// import {apdexT} from '../../../config.js';
const apdexTInMS = apdexT * 1000;

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

    //mark as active
    const links = document.getElementById("card-" + siteID).getElementsByClassName('graph')[0].getElementsByClassName('link');
    for (let link of links) {
        if (link.innerText.toLowerCase() === range) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    }


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

// const safe = '#2CDCBE';
// const warn = '#24B1DD';
// const danger = '#725EFB';

const safe = '#2CDCBE';
const warn = '#FEDB62';
const danger = '#FC3C63';

window.buildGraph = function (name, responses) {
    const ctx = document.getElementById("chart-" + name).getContext('2d');

    const quickData = responses.reduce((all, r, idx) => {
        all.labels.push(moment(r.createdAt).calendar());
        all.datasets.push(r.responseTime.toFixed(2));
        return all;
    }, {labels: [], datasets: [], colors: []});


    const processedData = {
        labels: quickData.labels,
        datasets: [{
            label: 'ms',
            data: quickData.datasets,
            fill: true,//'start',
            // borderColor: '#7993F9'//quickData.colors,


            borderColor: safe,//gradientStroke,
            // pointBorderColor: gradientStroke,
            // pointBackgroundColor: gradientStroke,
            // pointHoverBackgroundColor: gradientStroke,
            // pointHoverBorderColor: gradientStroke,

            borderWidth: 4,

        }]
    };

    if (window.charts[name]) {
        window.charts[name].data = processedData;

        window.charts[name].data.borderColor = safe;
        window.charts[name].update();
    } else {

        window.charts[name] = new Chart(ctx, {
            type: 'line',//'bar',
            data: processedData,
            options: {
                legend: {
                    display: false
                },
                // animation: {
                //     easing: "easeInOutBack"
                // },
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
            , plugins: [
                {
                    id: "responsiveGradient",

                    afterLayout: function (chart, options) {

                        const scales = chart.scales;

                        // create a linear gradient with the dimentions of the scale
                        const color = chart.ctx.createLinearGradient(
                            0,//scales["x-axis-0"].left,
                            scales["y-axis-0"].bottom,
                            0,//scales["x-axis-0"].right,
                            scales["y-axis-0"].top
                        ); //vertical


                        const max = Math.max(...chart.data.datasets[0].data);
                        const bit = max > 0 ? 1 / max : 0;
                        color.addColorStop(0, danger); //this is to handle timeouts where the response time is 0
                        color.addColorStop(bit, safe); //safe starting from the first step that isn't 0;


                        if (max < apdexTInMS) {
                            color.addColorStop(1, safe);
                        } else {
                            if (max >= apdexTInMS) {
                                color.addColorStop(bit * apdexTInMS, warn);

                                if (max >= (apdexTInMS * 2)) {
                                    color.addColorStop(bit * (apdexTInMS * 2), danger);
                                    color.addColorStop(1, danger);
                                } else {
                                    color.addColorStop(1, warn);
                                }
                            }
                        }
                        chart.data.datasets[0].borderColor = color;
                        // chart.data.datasets[0].backgroundColor = color;
                    }
                }
            ]
        });
    }
};