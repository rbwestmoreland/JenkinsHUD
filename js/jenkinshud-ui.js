/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="jenkinshud.js" />

var jenkinsHUDReloadInterval;

$(document).ready(function () {

    $("#js-required").remove();

    $("#modal-setup").on('show', function () {
        $("#modal-setup-url").val(jenkinsHUDModule.url());
    });

    $("#modal-setup-save").click(function () {
        var url = $("#modal-setup-url").val();
        if (url != null && url != "") {
            //Initialize JenkinsHUD
            jenkinsHUDModule.init(url);
            //Load JenkinsHUD
            loadJenkinsHUD();
        }
    });

    if (jenkinsHUDModule.isInit()) {
        //Load JenkinsHUD
        loadJenkinsHUD();
    }
    else {
        $("#jenkins-welcome").show();
    }

    function loadJenkinsHUD() {
        //Load JenkinsHUD
        jenkinsHUDModule.load();
        //Reload JenkinsHUD every 5 seconds
        clearInterval(jenkinsHUDReloadInterval);
        jenkinsHUDReloadInterval = setInterval(function () {
            jenkinsHUDModule.load();
        }, 5000);
    }
});

var jenkinsHUDUIModule = (function () {

    function onLoad() {
        $('#header-title').html('JenkinsHUD');

        $("#jenkins-invalid-url").show();
        $("#jenkins-container").hide();
    }

    function onCallback() {
        $('#header-title').html(jenkinsHUDModule.url());
        $("#jenkins-lastupdated").html(dateModule.get());

        $("#jenkins-invalid-url").hide();
        $("#jenkins-container").show();
    }

    function onLoadQueue() {
        onLoad();
        $("#jenkins-queue").hide();
        $("#jenkins-queue").empty();
    }

    function onCallbackQueue(data, lastData) {
        onCallback();

        $.each(data.items, function () {
            var name = this.task.name;

            if (name.length > 25) {
                name = name.substring(0, 22) + '...';
            }

            $('#jenkins-queue').append('<p><span class="job label label-inverse">' + name + '</span></p>');
        });

        $("#jenkins-queue").show();
    }

    function onLoadComputers() {
        onLoad();
        $("#jenkins-computers").hide();
        $("#jenkins-computers").empty();
    }

    function onCallbackComputers(data, lastData) {
        onCallback();

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

        $("#jenkins-computers").show();
    }

    function onLoadJobs() {
        onLoad();
        $("#jenkins-jobs").hide();
        $("#jenkins-jobs").empty();
    }

    function onCallbackJobs(data, lastData) {
        onCallback();

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

        $("#jenkins-jobs").show();
    }

    return {
        onLoadQueue: onLoadQueue,
        onCallbackQueue: onCallbackQueue,
        onLoadComputers: onLoadComputers,
        onCallbackComputers: onCallbackComputers,
        onLoadJobs: onLoadJobs,
        onCallbackJobs: onCallbackJobs
    };

} ());