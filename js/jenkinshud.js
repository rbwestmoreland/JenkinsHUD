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
        jsonpModule.load(urlModule.queueUrl(), jenkinsHUDModule.queueSuccessCallback, jenkinsHUDModule.queueErrorCallback);
        jsonpModule.load(urlModule.computersUrl(), jenkinsHUDModule.computersSuccessCallback, jenkinsHUDModule.computersErrorCallback);
        jsonpModule.load(urlModule.jobsUrl(), jenkinsHUDModule.jobsSuccessCallback, jenkinsHUDModule.jobsErrorCallback);

        $('#header-title').html(jenkinsHUDModule.url());
        $("#jenkins-lastupdated").html(dateModule.get());
        $("#jenkins-welcome").hide();
    }

    var JobsModule = (function () {

        var currentData;
        var lastData;

        function successCallback(data) {
            lastData = currentData;
            currentData = data;
            
            $("#jenkins-invalid-url").hide();
            $("#jenkins-container").show();
            $("#jenkins-jobs").empty();

            $.each(data.jobs, function () {
                var color = this.color;
                var name = this.name;
                var url = this.url;
                var labelType;

                switch (color) {

                    case "red":
                    case "red_anime":
                        labelType = 'label-important';
                        break;
                    case "yellow":
                    case "yellow_anime":
                        labelType = 'label-warning';
                        break;
                    case "blue":
                    case "blue_anime":
                        labelType = 'label-success';
                        break;
                    case "disabled":
                    default:
                        labelType = '';
                        break;
                }

                $("#jenkins-jobs").append('<span class="job label ' + labelType + '">' + name + '</span>');
            });
        }

        function errorCallback() {
            $("#jenkins-invalid-url").show();
            $("#jenkins-container").hide();
            $("#jenkins-jobs").empty();
        }

        return {
            successCallback: successCallback,
            errorCallback: errorCallback
        }

    } ());

    var QueueModule = (function () {

        var currentData;
        var lastData;

        function successCallback(data) {
            lastData = currentData;
            currentData = data;

            $("#jenkins-invalid-url").hide();
            $("#jenkins-container").show();
            $('#jenkins-queue').empty();

            $.each(data.items, function () {
                var name = this.task.name;

                if (name.length > 25) {
                    name = name.substring(0, 22) + '...';
                }

                $('#jenkins-queue').append('<p><span class="job label label-inverse">' + name + '</span></p>');
            });
        }

        function errorCallback() {
            $("#jenkins-invalid-url").show();
            $("#jenkins-container").hide();
            $('#jenkins-queue').empty();
        }

        return {
            successCallback: successCallback,
            errorCallback: errorCallback
        }

    } ());

    var ComputersModule = (function () {

        var currentData;
        var lastData;

        function successCallback(data) {
            lastData = currentData;
            currentData = data;

            $("#jenkins-invalid-url").hide();
            $("#jenkins-container").show();
            $('#jenkins-computers').empty();

            $.each(data.computer, function () {
                $('#jenkins-computers').append('<h4>' + this.displayName + '</h4>');
                $.each(this.oneOffExecutors, function () {
                    if (!this.idle) {
                        var progress = this.progress;
                        var buildnumber = this.currentExecutable.number.toString();
                        var name = this.currentExecutable.fullDisplayName;
                        name = name.substring(0, name.length - buildnumber.length - 2);

                        if (name.length > 25) {
                            name = name.substring(0, 22) + '...';
                        }

                        $('#jenkins-computers').append('<br/>');
                        $('#jenkins-computers').append('<span class="job label label-inverse">' + name + '</span>');
                        $('#jenkins-computers').append('<div class="progress progress-striped active"><div class="bar"style="width: ' + progress + '%;"></div></div>');
                    }
                });

                $.each(this.executors, function () {
                    var number = this.number + 1;

                    $('#jenkins-computers').append('<br/>');
                    if (!this.idle) {
                        var progress = this.progress;
                        var buildnumber = this.currentExecutable.number.toString();
                        var name = this.currentExecutable.fullDisplayName;
                        name = name.substring(0, name.length - buildnumber.length - 2);

                        if (name.length > 25) {
                            name = name.substring(0, 22) + '...';
                        }

                        $('#jenkins-computers').append('<span class="job label label-inverse">' + name + '</span>');
                        $('#jenkins-computers').append('<div class="progress progress-striped active"><div class="bar"style="width: ' + progress + '%;"></div></div>');
                    }
                    else {
                        $('#jenkins-computers').append('<span>idle</span>');
                    }
                });
                $('#jenkins-computers').append('<hr/>');
            });
        }

        function errorCallback() {
            $("#jenkins-invalid-url").show();
            $("#jenkins-container").hide();
            $('#jenkins-computers').empty();
        }

        return {
            successCallback: successCallback,
            errorCallback: errorCallback
        }

    } ());

    return {
        init: init,
        isInit: urlModule.hasValue,
        url: urlModule.get,
        load: load,
        jobsSuccessCallback: JobsModule.successCallback,
        jobsErrorCallback: JobsModule.errorCallback,
        computersSuccessCallback: ComputersModule.successCallback,
        computersErrorCallback: ComputersModule.errorCallback,
        queueSuccessCallback: QueueModule.successCallback,
        queueErrorCallback: QueueModule.errorCallback
    }

} ());
//#endregion jenkinsModule
