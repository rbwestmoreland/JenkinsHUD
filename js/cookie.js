/// <reference path="jquery-1.7.1-vsdoc.js" />
/*jslint browser: true */
/*global escape, unescape */
var cookieModule = (function () {
    'use strict';
    function get() {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i = i + 1) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x === "JenkinsHUD") {
                return unescape(y);
            }
        }
    }
    function set(url) {
        var exdate = new Date(), c_value = escape(url) + ", expires=" + exdate.toUTCString();
        exdate.setDate(exdate.getDate() + 300);
        document.cookie = "JenkinsHUD" + "=" + c_value;
    }
    return {
        get: get,
        set: set
    };
}());