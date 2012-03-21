/// <reference path="jquery-1.7.1-vsdoc.js" />

var jsonpModule = (function () {

    function load(url, successCallback, errorCallback) {

        $.ajax({
            accepts: 'application/json',
            url: url,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            timeout: 4000
        }).success(function (data, textStatus, jqXHR) {
            successCallback(data);
        }).error(function (jqXHR, textStatus, errorThrown) {
            errorCallback();
        }).complete(function (jqXHR, textStatus) {
            var request = jqXHR;
        });

        var $script = $(document.getElementsByTagName('head')[0].firstChild);
        var url = $script.attr('src') || '';
        var cb = (url.match(/jsonp=(\w+)/) || [])[1];

        $script[0].onerror = function (e) {
            errorCallback();
        };

        var wait = 'wait';
    }

    return {
        load: load
    };
} ());