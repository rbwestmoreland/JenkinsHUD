/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="jenkinshud.js" />

var jenkinsHUDReloadInterval;

$(document).ready(function () {

    $("#js-required").remove();

    $("#modal-setup").on('show', function () {
        $("#modal-setup-url").val(jenkinsHUDModule.url());
    });

    $("#modal-setup-save").click(function () {
        //Init JenkinsHUD
        jenkinsHudInit();
    });

    $("#modal-setup").submit(function () {
        //Init JenkinsHUD
        jenkinsHudInit();
        $("#modal-setup").modal('hide');
        return false;
    });

    if (jenkinsHUDModule.isInit()) {
        //Load JenkinsHUD
        jenkinsHUDLoad();
    }
    else {
        $("#jenkins-welcome").show();
    }

    function jenkinsHudInit() {
        var url = $("#modal-setup-url").val();
        if (url != null && url != "") {
            //Initialize JenkinsHUD
            jenkinsHUDModule.init(url);
            //Load JenkinsHUD
            jenkinsHUDLoad();
        }
    }

    function jenkinsHUDLoad() {
        //Load JenkinsHUD
        jenkinsHUDModule.load();
        //Reload JenkinsHUD again, every 5 seconds
        clearInterval(jenkinsHUDReloadInterval);
        jenkinsHUDReloadInterval = setInterval(function () {
            jenkinsHUDModule.load();
        }, 5000);
    }
});
