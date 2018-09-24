// import tippy from 'tippy.js'
//
// tippy('.btn');//https://atomiks.github.io/tippyjs/


fixBrokenImages = function (url) {
    var img = document.getElementsByTagName('img');
    var i = 0, l = img.length;
    for (; i < l; i++) {
        var t = img[i];
        if (t.naturalWidth === 0) {
            //this image is broken
            t.src = '/img/potato.png';
        }
    }
}
window.onload = function () {
    fixBrokenImages('example.com/image.png');
}