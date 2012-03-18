/// <reference path="jquery-1.7.1-vsdoc.js" />

var cookieModule = (function () {
    
    function get() {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == "JenkinsHUD") {
                return unescape(y);
            }
        }
    }
    
    function set(url) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 300);
        var c_value = escape(url) + "; expires=" + exdate.toUTCString();
        document.cookie = "JenkinsHUD" + "=" + c_value;
    }

    return {
        get: get,
        set: set
    };
}());