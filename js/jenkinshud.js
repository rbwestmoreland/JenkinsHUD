/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="cookie.js" />
/// <reference path="jsonp.js" />
/// <reference path="date.js" />
/// <reference path="jenkinshud-ui.js" />
/*jslint browser: true, eqeq: true */
/*global $, cookieModule, jsonpModule, dateModule */
var jenkinsHUDModule = (function () {
    'use strict';
    var settingsModule = (function () {
        var cachedUrl, cachedViewName, cachedSoundsEnabled;
        function supports_html5_storage() {
            try {
                return window.hasOwnProperty('localStorage') && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        }
        function clearView() {
            if (supports_html5_storage() === true) {
                localStorage.removeItem('jenkinsViewName');
            }
            cachedViewName = null;
        }
        function clearUrl() {
            if (supports_html5_storage() === true) {
                localStorage.removeItem('jenkinsUrl');
            }
            cachedUrl = null;
        }
        function clear() {
            clearUrl();
            clearView();
        }
        function setUrl(url) {
            clear();
            if (supports_html5_storage() === true) {
                localStorage.jenkinsUrl = url;
            } else {
                cachedUrl = url;
            }
        }
        function getUrl() {
            if (supports_html5_storage() === true) {
                return localStorage.jenkinsUrl;
            }
            return cachedUrl;
        }
        function hasUrl() {
            if (getUrl() == null || getUrl() == '') {
                return false;
            }
            return true;
        }
        function setView(viewName) {
            if (supports_html5_storage() === true) {
                localStorage.jenkinsViewName = viewName;
            } else {
                cachedViewName = viewName;
            }
        }
        function getView() {
            if (supports_html5_storage() === true) {
                return localStorage.jenkinsViewName;
            }
            return cachedViewName;
        }
        function hasView() {
            if (getView() == null || getView() == '') {
                return false;
            }
            return true;
        }
        function soundsEnabled() {
            if (supports_html5_storage() === true) {
                var jenkinsSoundsEnabled = localStorage.jenkinsSoundsEnabled;
                if (jenkinsSoundsEnabled == 'true') {
                    return true;
                }
                return false;
            }
            return cachedSoundsEnabled;
        }
        function toggleSounds() {
            if (supports_html5_storage() === true) {
                localStorage.jenkinsSoundsEnabled = !soundsEnabled();
            } else {
                cachedSoundsEnabled = !cachedSoundsEnabled;
            }
            try {
                if (soundsEnabled()) {
                    soundModule.playJobStarted();
                }
            } catch (e) { }
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
        };
    }()),
        soundModule = (function () {
            var soundQueue = [];
            function initInterval() {
                return setInterval(function () {
                    try {
                        var audioElement = document.createElement('audio'), sourceElement;
                        audioElement.setAttribute('autobuffer', 'true');
                        audioElement.setAttribute('preload', 'auto');
                        audioElement.setAttribute('autoplay', 'true');
                        if (audioElement.paused || audioElement.ended) {
                            if (soundQueue.length > 0) {
                                sourceElement = document.createElement('source');
                                if (audioElement.canPlayType('audio/ogg')) {
                                    sourceElement.setAttribute('src', soundQueue.pop() + '.ogg');
                                    sourceElement.setAttribute('type', 'audio/ogg');
                                } else if (audioElement.canPlayType('audio/mpeg')) {
                                    sourceElement.setAttribute('src', soundQueue.pop() + '.mp3');
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
            initInterval();
            return {
                playJobStarted: playJobStarted,
                playJobSuccessful: playJobSuccessful,
                playJobUnstable: playJobUnstable,
                playJobFailed: playJobFailed
            };
        }()),
        JobsModule = (function () {
            var currentData, lastData, activeView;
            function successCallback(data) {
                lastData = currentData;
                currentData = data;
                //Standard UI calls
                $("#jenkins-invalid-url").hide();
                $("#jenkins-container").show();
                $("#jenkins-jobs").empty();
                //Create tab container
                var jobsPrefix = 'jenkins-view-', regex = new RegExp('\\W+', 'g');
                $('#jenkins-jobs').append('<ul id="jenkins-views" class="nav nav-tabs"></ul>');
                $.each(data.views, function (viewIndex) {
                    //Populate tab container with tabs
                    var viewName = this.name.replace(regex, ''), id = jobsPrefix + viewName;
                    $('#jenkins-views').append('<li><a href="#' + id + '" data-toggle="tab">' + this.name + '</a></li>');
                    //Generate tab content
                    $('#jenkins-jobs').addClass('tab-content');
                    $('#jenkins-jobs').append('<div id="' + id + '" class="tab-pane"></div>');
                    $.each(this.jobs, function (jobIndex) {
                        var lastColor = this.color, color = this.color, name = this.name, labelType;
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
                            labelType = '';
                            break;
                        }
                        $('#' + id).append('<span class="job label ' + labelType + '">' + name + '</span>');
                    });
                });
                //Hook up tab click event
                $('#jenkins-views a[data-toggle="tab"]').click(function () {
                    //Save view as current view.
                    var id = this.attributes.href.nodeValue, viewName = id.replace('#' + jobsPrefix, '');
                    settingsModule.setView(viewName);
                });
                //Set from settings as current
                if (settingsModule.hasView()) {
                    activeView = $('a[href="#' + jobsPrefix + settingsModule.getView() + '"]');
                    if (activeView.length > 0) {
                        activeView.click();
                    } else {
                        $('#jenkins-views a[data-toggle="tab"]').first().click();
                    }
                } else {
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
            };
        }()),
         QueueModule = (function () {
             var currentData, lastData, name;
             function successCallback(data) {
                 lastData = currentData;
                 currentData = data;
                 $("#jenkins-invalid-url").hide();
                 $("#jenkins-container").show();
                 $('#jenkins-queue').empty();
                 $.each(data.items, function () {
                     name = this.task.name;
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
             };
         }()),
        ComputersModule = (function () {
            var currentData, lastData, executorsCountTotal, executorsCountIdle, executorsCountBusy, progress, buildnumber, name;
            function successCallback(data) {
                lastData = currentData;
                currentData = data;
                $("#jenkins-invalid-url").hide();
                $("#jenkins-container").show();
                $('#jenkins-computers').empty();
                $.each(data.computer, function (computerIndex) {
                    executorsCountTotal = this.executors.length;
                    executorsCountIdle = 0;
                    executorsCountBusy = 0;
                    $.each(this.executors, function () {
                        if (!this.idle) {
                            executorsCountBusy = executorsCountBusy + 1;
                        } else {
                            executorsCountIdle = executorsCountIdle + 1;
                        }
                    });
                    $('#jenkins-computers').append('<h4>' + this.displayName + ' <small>' + executorsCountTotal + ' executors</small></h4>');
                    $.each(this.oneOffExecutors, function () {
                        if (!this.idle) {
                            progress = this.progress;
                            buildnumber = this.currentExecutable.number.toString();
                            name = this.currentExecutable.fullDisplayName;
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
                        var thisName = '', lastName = '';
                        if (!this.idle) {
                            progress = this.progress;
                            buildnumber = this.currentExecutable.number.toString();
                            thisName = this.currentExecutable.fullDisplayName;
                            name = this.currentExecutable.fullDisplayName;
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
            };
        }());
    function init(jenkinsurl) {
        settingsModule.setUrl(jenkinsurl);
    }
    function load() {
        var queueUrl = settingsModule.getUrl() + '/queue/api/json',
            computersUrl = settingsModule.getUrl() + '/computer/api/json?depth=2',
            jobsUrl = settingsModule.getUrl() + '/api/json?depth=1';
        jsonpModule.load(queueUrl, jenkinsHUDModule.queueSuccessCallback, jenkinsHUDModule.queueErrorCallback);
        jsonpModule.load(computersUrl, jenkinsHUDModule.computersSuccessCallback, jenkinsHUDModule.computersErrorCallback);
        jsonpModule.load(jobsUrl, jenkinsHUDModule.jobsSuccessCallback, jenkinsHUDModule.jobsErrorCallback);
        $('#header-title').html(jenkinsHUDModule.url());
        $("#jenkins-lastupdated").html(dateModule.get());
        $("#jenkins-welcome").hide();
    }
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
    };
}());