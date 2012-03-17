/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="cookie.js" />
/// <reference path="jsonp.js" />
/// <reference path="date.js" />
/// <reference path="jenkinshud-ui.js" />

//#region jenkinsModule
var jenkinsHUDModule = (function () {

    //#region urlModule
    var urlModule = (function () {

        function hasUrl() {
            return !(cookieModule.get() == null || cookieModule.get() == "");
        }

        function setUrl(url) {
            cookieModule.set(url);
        }

        function getUrl() {
            return cookieModule.get();
        }

        function getQueueUrl() {
            return getUrl() + '/queue/api/json';
        }

        function getComputersUrl() {
            return getUrl() + '/computer/api/json?depth=2';
        }

        function getJobsUrl() {
            return getUrl() + '/api/json';
        }

        return {
            get: getUrl,
            set: setUrl,
            hasValue: hasUrl,
            queueUrl: getQueueUrl,
            computersUrl: getComputersUrl,
            jobsUrl: getJobsUrl
        };
    } ());
    //#endregion urlModule

    function init(jenkinsurl) {
        urlModule.set(jenkinsurl);
    }

    function load() {
        //jenkinsHUDUIModule.onLoad(); //todo: implement pubsub

        jenkinsHUDUIModule.onLoadQueue(); //todo: implement pubsub
        jsonpModule.load(urlModule.queueUrl(), 'jenkinsHUDModule.callbackQueue');

        jenkinsHUDUIModule.onLoadComputers(); //todo: implement pubsub
        jsonpModule.load(urlModule.computersUrl(), 'jenkinsHUDModule.callbackComputers');

        jenkinsHUDUIModule.onLoadJobs(); //todo: implement pubsub
        jsonpModule.load(urlModule.jobsUrl(), 'jenkinsHUDModule.callbackJobs');
    }

    var lastUpdated;

    function callbackBase() {
        //jenkinsHUDUIModule.onCallback(); //todo: implement pubsub
        lastUpdated = dateModule.get();
    }

    var queue;
    var lastQueue;

    function callbackQueue(data) {
        callbackBase();
        lastQueue = queue;
        queue = data;
        jenkinsHUDUIModule.onCallbackQueue(queue, lastQueue); //todo: implement pubsub
    }

    var computers;
    var lastComputers;

    function callbackComputers(data) {
        callbackBase();
        lastComputers = computers;
        computers = data;
        jenkinsHUDUIModule.onCallbackComputers(computers, lastComputers); //todo: implement pubsub
    }

    var jobs;
    var lastJobs;

    function callbackJobs(data) {
        callbackBase();
        lastJobs = jobs;
        jobs = data;
        jenkinsHUDUIModule.onCallbackJobs(jobs, lastJobs); //todo: implement pubsub
    }

    return {
        isInit: urlModule.hasValue,
        init: init,
        url: urlModule.get,
        load: load,
        callbackQueue: callbackQueue,
        callbackComputers: callbackComputers,
        callbackJobs: callbackJobs
    };

} ());
//#endregion jenkinsModule
