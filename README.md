# [GoSlow](https://github.com/g00ds0n/goslow)

GoSlow is a video booth using an iPad and a GoPro camera to capture short video clips without having to press the buttons on the camera directly. It's called GoSlow because it was originally designed to capture high speed video off the GoPro to create slow motion videos.

## Installation

See [Installation Instructions](https://github.com/g00ds0n/goslow/wiki/Installation)

## Goal of this Project

Make an automated video booth that can be left unattended. The user should select a single button to get things started. This will automate the camera to capture a short clip. If possible, playback the video immediately afterwards.

## How it works

GoSlow has been used with a GoPro Hero 3 Black and an iPad 2 running GoSlow inside of the [Kiosk Pro](http://www.kioskproapp.com/itunes-apps) app. It may be possible to run GoSlow on any device (e.g. laptops, tablets, smartphones, etc) with a WiFi connection and web browser, but your mileage may vary.

This code is comprised of HTML, CSS, and JavaScript. The JavaScript sends commands to the camera using Ajax and some properly formatted URLs. GoSlow can either be put on the SD card of the camera or run locally on the device that is interfacing the camera.

> Note: GoPro doesn't actually support the webserver on their cameras, so it may or may not be working properly. Ideally you would want to put this code on the camera to avoid cross-domain issues when sending commands (via ajax) to the camera. Some browsers allow that to work while others do not.

### The Camera's Webserver

After you connect your device's WiFi to the camera, the webserver can be found at
```
http://10.5.5.9:8080
```
. Here you can browse through the files on the SD card using any web browser. GoSlow browses through this webserver to playback video after one is recorded.

### The Camera's API

> Note: This is not supported by GoPro and could change at any firmware update.

We can do anything that the official GoPro app can do because the commands it sends to the camera are over HTTP. For instance, the following URL call will turn the camera on:

```
http://10.5.5.9:80/bacpac/PW?t=<password>&p=%01
```

* We use the same IP address as the webserver but we use port 80 instead.
* 'bacpac' can also be replaced with 'camera' for other commands.
* 'PW' is the command and can be a number of different two letter combinations, such as 'SH' or 'PV'.
* '&lt;password&gt;' is the WiFi password of the camera.
* '%01' is the code to turn the camera on. If we used '%00' instead, it would turn the camera off.

[More about Commands](https://github.com/g00ds0n/goslow/wiki/Commands)

### Running GoSlow on the SD Card

> Note: The webserver on the camera doesn't always work properly.

If you have a properly running webserver on the camera and you have GoSlow on the SD card, then you can access GoSlow by navigating to index.html (e.g. http://10.5.5.9:8080/goslow/index.html). You can use an app like [Kiosk Pro Lite](http://www.kioskproapp.com/itunes-apps) to run GoSlow when it's on the SD card. If this doesn't work you'll have to run GoSlow locally on the device itself.

> Note: Kiosk Pro Lite and Kiosk Pro can be used to prevent users from navigating away from GoSlow

### Running Locally on the Device

Cross-domain scripting is an issue, so pick a browser that allows this. I used the [Kiosk Pro](http://www.kioskproapp.com/itunes-apps) paid app on the iPad because it also allowed me to copy my files over to the app and run it locally. You can use a program like [DiskAid](http://www.digidna.net/diskaid) to transfer the files to Kiosk Pro.

> Note: Kiosk Pro allows autoplay for videos while Safari on iOS does not. Autoplay is necessary to automatically run the preview screen or any other part of this app that plays video.
