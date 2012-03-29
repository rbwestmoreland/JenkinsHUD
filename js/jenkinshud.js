/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="cookie.js" />
/// <reference path="jsonp.js" />
/// <reference path="date.js" />
/// <reference path="jenkinshud-ui.js" />

//#region jenkinsModule
var jenkinsHUDModule = (function () {

    //#region settingsModule
    var settingsModule = (function () {

        var cachedUrl;
        var cachedViewName;
        var cachedSoundsEnabled;

        function supports_html5_storage() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        }

        function clear() {
            clearUrl();
            clearView();
        }

        function setUrl(url) {
            clear();
            if (supports_html5_storage() == true) {
                localStorage['jenkinsUrl'] = url;
            }
            else {
                cachedUrl = url;
            }
        }

        function getUrl() {
            if (supports_html5_storage() == true) {
                return localStorage['jenkinsUrl'];
            }
            else {
                return cachedUrl;
            }
        }

        function clearUrl() {
            if (supports_html5_storage() == true) {
                localStorage.removeItem('jenkinsUrl');
            }

            cachedUrl = null;
        }

        function hasUrl() {
            if (getUrl() == null || getUrl() == '') {
                return false;
            }
            else {
                return true;
            }
        }

        function setView(viewName) {
            if (supports_html5_storage() == true) {
                localStorage['jenkinsViewName'] = viewName;
            }
            else {
                cachedViewName = viewName;
            }
        }

        function getView() {
            if (supports_html5_storage() == true) {
                return localStorage['jenkinsViewName'];
            }
            else {
                return cachedViewName;
            }
        }

        function clearView() {
            if (supports_html5_storage() == true) {
                localStorage.removeItem('jenkinsViewName');
            }

            cachedViewName = null;
        }

        function hasView() {
            if (getView() == null || getView() == '') {
                return false;
            }
            else {
                return true;
            }
        }

        function soundsEnabled() {
            if (supports_html5_storage() == true) {
                var jenkinsSoundsEnabled = localStorage['jenkinsSoundsEnabled'];
                if (jenkinsSoundsEnabled == 'true') {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return cachedSoundsEnabled;
            }
        }

        function clearSoundsEnabled() {
            if (supports_html5_storage() == true) {
                localStorage.removeItem('jenkinsSoundsEnabled');
            }

            cachedSoundsEnabled = false;
        }

        function toggleSounds() {
            if (supports_html5_storage() == true) {
                localStorage['jenkinsSoundsEnabled'] = !soundsEnabled();
            }
            else {
                cachedSoundsEnabled = !cachedSoundsEnabled;
            }

            if (soundsEnabled()) {
                soundModule.playJobStarted();
            }
        }

        return {
            getUrl: getUrl,
            setUrl: setUrl,
            hasUrl: hasUrl,
            getView: getView,
            setView: setView,
            hasView: hasView,
            toggleSounds: toggleSounds,
            soundsEnabled: soundsEnabled
        }

    } ());
    //#endregion settingsModule

    function init(jenkinsurl) {
        settingsModule.setUrl(jenkinsurl);
    }

    function load() {
        var queueUrl = settingsModule.getUrl() + '/queue/api/json';
        var computersUrl = settingsModule.getUrl() + '/computer/api/json?depth=2';
        var jobsUrl = settingsModule.getUrl() + '/api/json?depth=1';

        jsonpModule.load(queueUrl, jenkinsHUDModule.queueSuccessCallback, jenkinsHUDModule.queueErrorCallback);
        jsonpModule.load(computersUrl, jenkinsHUDModule.computersSuccessCallback, jenkinsHUDModule.computersErrorCallback);
        jsonpModule.load(jobsUrl, jenkinsHUDModule.jobsSuccessCallback, jenkinsHUDModule.jobsErrorCallback);

        $('#header-title').html(jenkinsHUDModule.url());
        $("#jenkins-lastupdated").html(dateModule.get());
        $("#jenkins-welcome").hide();
    }

    //#region jobsModule
    var JobsModule = (function () {

        var currentData;
        var lastData;

        function successCallback(data) {
            lastData = currentData;
            currentData = data;

            //Standard UI calls
            $("#jenkins-invalid-url").hide();
            $("#jenkins-container").show();
            $("#jenkins-jobs").empty();

            //Create tab container
            var jobsPrefix = 'jenkins-view-';
            var regex = new RegExp('\\W+', 'g');
            $('#jenkins-jobs').append('<ul id="jenkins-views" class="nav nav-tabs"></ul>');
            $.each(data.views, function (viewIndex) {

                //Populate tab container with tabs
                var viewName = this.name.replace(regex, '');
                var id = jobsPrefix + viewName;
                $('#jenkins-views').append('<li><a href="#' + id + '" data-toggle="tab">' + this.name + '</a></li>');

                //Generate tab content
                $('#jenkins-jobs').addClass('tab-content');
                $('#jenkins-jobs').append('<div id="' + id + '" class="tab-pane"></div>');

                $.each(this.jobs, function (jobIndex) {
                    var lastColor = this.color;
                    var color = this.color;
                    var name = this.name;
                    var url = this.url;
                    var labelType;

                    try {
                        lastColor = lastData.views[viewIndex].jobs[jobIndex].color;
                    } catch (e) { }

                    if (viewName == settingsModule.getView()) {
                        if (lastColor != color) {
                            if (color == 'blue') {
                                soundModule.playJobSuccessful();
                            }
                            if (color == 'yellow') {
                                soundModule.playJobUnstable();
                            }
                            if (color == 'red') {
                                soundModule.playJobFailed();
                            }
                        }
                    }

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

                    $('#' + id).append('<span class="job label ' + labelType + '">' + name + '</span>');
                });
            });

            //Hook up tab click event
            $('#jenkins-views a[data-toggle="tab"]').click(function () {
                //Save view as current view.
                var id = this.attributes['href'].nodeValue;
                var viewName = id.replace('#' + jobsPrefix, '');
                settingsModule.setView(viewName);
            });

            //Set from settings as current
            if (settingsModule.hasView()) {
                var activeView = $('a[href="#' + jobsPrefix + settingsModule.getView() + '"]');

                if (activeView.length > 0) {
                    activeView.click();
                }
                else {
                    $('#jenkins-views a[data-toggle="tab"]').first().click();
                }
            }
            else {
                $('#jenkins-views a[data-toggle="tab"]').first().click();
            }
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
    //#endregion jobsModule

    //#region queueModule
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
    //#endregion queueModule

    //#region computersModule
    var ComputersModule = (function () {

        var currentData;
        var lastData;

        function successCallback(data) {
            lastData = currentData;
            currentData = data;

            $("#jenkins-invalid-url").hide();
            $("#jenkins-container").show();
            $('#jenkins-computers').empty();

            $.each(data.computer, function (computerIndex) {
                var executorsCountTotal = this.executors.length;
                var executorsCountIdle = 0;
                var executorsCountBusy = 0;

                $.each(this.executors, function () {

                    if (!this.idle) {
                        executorsCountBusy++;
                    }
                    else {
                        executorsCountIdle++;
                    }
                });

                $('#jenkins-computers').append('<h4>' + this.displayName + ' <small>' + executorsCountTotal + ' executors</small></h4>');

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

                $.each(this.executors, function (executorIndex) {
                    var number = this.number + 1;
                    var thisName = '';
                    var lastName = '';

                    if (!this.idle) {
                        var progress = this.progress;
                        var buildnumber = this.currentExecutable.number.toString();
                        thisName = this.currentExecutable.fullDisplayName;
                        var name = this.currentExecutable.fullDisplayName;
                        name = name.substring(0, name.length - buildnumber.length - 2);

                        if (name.length > 25) {
                            name = name.substring(0, 22) + '...';
                        }

                        $('#jenkins-computers').append('<br/>');
                        $('#jenkins-computers').append('<span class="job label label-inverse">' + name + '</span>');
                        $('#jenkins-computers').append('<div class="progress progress-striped active"><div class="bar"style="width: ' + progress + '%;"></div></div>');
                    }

                    try {
                        lastName = lastData.computer[computerIndex].executors[executorIndex].currentExecutable.fullDisplayName;
                    } catch (e) { }

                    if (lastData != null && lastName == '' && thisName != '') {
                        soundModule.playJobStarted();
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
    //#endregion copmutersModule

    //#region soundModule
    var soundModule = (function () {

        var interval = initInterval();
        var soundQueue = new Array();

        function initInterval() {
            return setInterval(function () {
                try {
                    var audioElement = document.createElement('audio');
                    audioElement.setAttribute('autobuffer', 'true');
                    audioElement.setAttribute('preload', 'auto');
                    audioElement.setAttribute('autoplay', 'true');

                    if (audioElement.paused || audioElement.ended) {
                        if (soundQueue.length > 0) {
                            var url = soundQueue.pop();

                            var sourceElement = document.createElement('source');

                            if (audioElement.canPlayType('audio/ogg')) {
                                sourceElement.setAttribute('src', url + '.ogg');
                                sourceElement.setAttribute('type', 'audio/ogg');
                            }
                            else if (audioElement.canPlayType('audio/mpeg')) {
                                sourceElement.setAttribute('src', url + '.mp3');
                                sourceElement.setAttribute('type', 'audio/mpeg');
                            }

                            audioElement.appendChild(sourceElement);
                        }
                    }
                } catch (e) { }
            }, 500);
        }

        function playJobStarted() {
            if (settingsModule.soundsEnabled()) {
                soundQueue.push('audio/theme1/job-started');
            }
        }

        function playJobSuccessful() {
            if (settingsModule.soundsEnabled()) {
                soundQueue.push('audio/theme1/job-successful');
            }
        }

        function playJobUnstable() {
            if (settingsModule.soundsEnabled()) {
                soundQueue.push('audio/theme1/job-unstable');
            }
        }

        function playJobFailed() {
            if (settingsModule.soundsEnabled()) {
                soundQueue.push('audio/theme1/job-failed');
            }
        }

        return {
            playJobStarted: playJobStarted,
            playJobSuccessful: playJobSuccessful,
            playJobUnstable: playJobUnstable,
            playJobFailed: playJobFailed
        }
    } ());
    //#endregion soundModule

    return {
        init: init,
        isInit: settingsModule.hasUrl,
        url: settingsModule.getUrl,
        load: load,
        jobsSuccessCallback: JobsModule.successCallback,
        jobsErrorCallback: JobsModule.errorCallback,
        computersSuccessCallback: ComputersModule.successCallback,
        computersErrorCallback: ComputersModule.errorCallback,
        queueSuccessCallback: QueueModule.successCallback,
        queueErrorCallback: QueueModule.errorCallback,
        toggleSounds: settingsModule.toggleSounds,
        soundsEnabled: settingsModule.soundsEnabled
    }

} ());
//#endregion jenkinsModule
