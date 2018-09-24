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