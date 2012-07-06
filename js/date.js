/// <reference path="jquery-1.7.1-vsdoc.js" />
var dateModule = (function () {
    'use strict';
    function get() {
        var date = new Date(), month = date.getMonth() + 1, day = date.getDate(), year = date.getFullYear();
        return month + '/' + day + '/' + year + ' ' + date.toLocaleTimeString();
    }
    return {
        get: get
    };
} ());