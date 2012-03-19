/// <reference path="jquery-1.7.1-vsdoc.js" />

var jsonpModule = (function () {

    function load(url, jsonpCallback, errorCallback) {
        var request = $.ajax({
            url: url,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            jsonpCallback: jsonpCallback
        });

        request.complete(function (jqXHR, textStatus) {
            if (errorCallback != null) {
                if (jqXHR.status != 200) {
                    errorCallback();
                }
            }
        });
    }

    return {
        load: load
    };
} ());