// import tippy from 'tippy.js'
//
// tippy('.btn');//https://atomiks.github.io/tippyjs/
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