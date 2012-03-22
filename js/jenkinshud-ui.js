/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="jenkinshud.js" />

var jenkinsHUDReloadInterval;
var jenkinsHUDReloadCountdownInterval;

$(document).ready(function () {

    $('#js-required').remove();

    $('#modal-setup').on('show', function () {
        $("#modal-setup-url").val(jenkinsHUDModule.url());
        $("#modal-setup-url").focus();
    });

    $('#modal-setup-save').click(function () {
        //Init JenkinsHUD
        jenkinsHudInit();
    });

    $('#modal-setup').submit(function () {
        //Init JenkinsHUD
        jenkinsHudInit();
        $('#modal-setup').modal('hide');
        return false;
    });

    if (jenkinsHUDModule.isInit()) {
        //Load JenkinsHUD
        jenkinsHUDLoad();
    }
    else {
        $('#jenkins-welcome').show();
    }

    function jenkinsHudInit() {
        var url = $('#modal-setup-url').val();
        if (url != null && url != "") {
            //Initialize JenkinsHUD
            jenkinsHUDModule.init(url);
            //Load JenkinsHUD
            jenkinsHUDLoad();
        }
    }

    function jenkinsHUDLoad() {
        var refreshInterval = 5000;
        //Reset
        clearInterval(jenkinsHUDReloadInterval);
        clearInterval(jenkinsHUDReloadCountdownInterval);
        //Load JenkinsHUD
        jenkinsHUDModule.load();
        //Reload JenkinsHUD again, every 5 seconds
        jenkinsHUDReloadInterval = setInterval(function () {
            jenkinsHUDModule.load();
        }, refreshInterval);
        Update countdown, every second
        $('#jenkins-refresh-countdown').html((refreshInterval / 1000));
        jenkinsHUDReloadCountdownInterval = setInterval(function () {
            var val = $('#jenkins-refresh-countdown').html();
            if (val == 1) {
                $('#jenkins-refresh-countdown').html((refreshInterval / 1000));
            }
            else {
                $('#jenkins-refresh-countdown').html(val - 1);
            }
        }, 1000);
    }
});
