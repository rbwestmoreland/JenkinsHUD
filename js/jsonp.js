/// <reference path="jquery-1.7.1-vsdoc.js" />

var jsonpModule = (function () {

    function load(url, callback) {
        $.ajax({
            url: url,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            jsonpCallback: callback
        });
    }

    return {
        load: load
    };
}());