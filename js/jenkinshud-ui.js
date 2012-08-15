/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="jenkinshud.js" />
/*jslint browser: true */
/*global $, jenkinsHUDModule */
var secondsBetweenReloads = 5;
var secondsRemainingBeforeReload = secondsBetweenReloads;
var jenkinsHUDReloadInterval;

$(document).ready(function () {
    'use strict';
    function jenkinsUpdateSoundIcon() {
        $('#jenkins-toggle-sounds-icon').removeClass('icon-volume-off');
        $('#jenkins-toggle-sounds-icon').removeClass('icon-volume-up');

        if (jenkinsHUDModule.soundsEnabled()) {
            $('#jenkins-toggle-sounds-icon').addClass('icon-volume-up');
        } else {
            $('#jenkins-toggle-sounds-icon').addClass('icon-volume-off');
        }
    }
    function jenkinsHUDLoad() {
        //Reset
        clearInterval(jenkinsHUDReloadInterval);
        jenkinsUpdateSoundIcon();
        //Load JenkinsHUD
        jenkinsHUDModule.load();
        //Reload JenkinsHUD again, every N seconds
        jenkinsHUDReloadInterval = setInterval(function () {
            if (secondsRemainingBeforeReload < 1) {
                jenkinsHUDModule.load();
                if ('_gauges' in window) { _gauges.push(['track']); }
                secondsRemainingBeforeReload = secondsBetweenReloads;
            } else {
                secondsRemainingBeforeReload = secondsRemainingBeforeReload - 1;
            }
            $('#jenkins-refresh-countdown').html(secondsRemainingBeforeReload);
        }, 1000);
    }
    function jenkinsHudInit() {
        var url = $('#modal-setup-url').val();
        if (url !== null && url !== "") {
            //Initialize JenkinsHUD
            jenkinsHUDModule.init(url);
            //Load JenkinsHUD
            jenkinsHUDLoad();
        }
    }
    $('#js-required').remove();
    $('#jenkins-toggle-sounds').click(function () {
        jenkinsHUDModule.toggleSounds();
        jenkinsUpdateSoundIcon();
    });
    $('#modal-setup').on('show', function () {
        $("#modal-setup-url").val(jenkinsHUDModule.url());
        $("#modal-setup-url").focus();
    });
    $('#modal-setup').submit(function () {
        //Init JenkinsHUD
        jenkinsHudInit();
        $('#modal-setup').modal('hide');
        return false;
    });
    $('#modal-setup-save').click(function () {
        //Init JenkinsHUD
        jenkinsHudInit();
    });
    if (jenkinsHUDModule.isInit()) {
        //Load JenkinsHUD
        jenkinsHUDLoad();
    } else {
        $('#jenkins-welcome').show();
    }
});