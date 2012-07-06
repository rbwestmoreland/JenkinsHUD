/// <reference path="jquery-1.7.1-vsdoc.js" />
/*jslint browser: true */
/*global $ */
var jsonpModule = (function () {
    'use strict';
    function load(url, successCallback, errorCallback) {
        $.ajax({
            accepts: 'application/json',
            url: url,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            timeout: 4000
        }).success(function (data) {
            successCallback(data);
        }).error(function () {
            errorCallback();
        });
        var $script = $(document.getElementsByTagName('head')[0].firstChild);
        url = $script.attr('src') || '';
        $script[0].onerror = function () {
            errorCallback();
        };
    }
    return {
        load: load
    };
}());