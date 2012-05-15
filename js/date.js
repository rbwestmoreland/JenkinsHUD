/// <reference path="jquery-1.7.1-vsdoc.js" />

var dateModule = (function () {

    function get() {
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        return month + '/' + day + '/' + year + ' ' + date.toLocaleTimeString();
    }

    return {
        get: get
    };
} ());