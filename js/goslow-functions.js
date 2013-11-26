/**
 * Block the page, show a message, and reload the whole thing
 */
function error_restart(m) {
  var message = "There was a problem, please try again."
  if (m !== undefined) {
    message = m;
  }
  $('body').append('<div class="goslow-error-wrapper"></div><div class="alert alert-danger goslow-error">' + message + '</div>');
  // Block the page
  $('.goslow-error-wrapper').bind('click', function(){ return false; });

  setTimeout(function() {
    $('body').fadeOut(1000, function(){
      location.reload();
    });
  }, 4000);
}

/**
 * Get the last LRV (or MP4) file from the URL defined by goslow.videos
 */
function get_last() {
  var url = goslow.videos;
  $.ajax({
    url: url,
    async: false,
    success: function(data, status, xhr){
      // Find the last anchor tag with the extension MP4
      var latest = $("a:contains('MP4')", data).last().attr('href');
      // Pull the filename
      var filename = latest.substr(0, latest.indexOf('.'));
      // Find an LRV if one exists
      var lrv = $("a:contains('" + filename + ".LRV')", data).attr('href');
      if (lrv !== undefined) {
        latest = lrv;
      }
      url += latest;
    },
    error: function(xhr, status, error){
      $('#done > h1').text("There was an error trying to find your video. Please try again.");
      var playback = videojs("gopro_playback");
      $('#done > video').remove();
      playback.dispose();
      setTimeout(function() {
        $('body').fadeOut(1000, function(){
          location.reload();
        });
      }, 9000);
    },
    dataType: 'html'
  });
  return url;
}

/**
 * Commands to send to the camera
 *
 * Known commands found at
 * http://forums.openpilot.org/topic/15545-gcs-go-pro-wifi-widget/?p=168223
 * https://github.com/joshvillbrandt/GoProController/blob/master/GoProController.py
 * https://github.com/PhilMacKay/PyGoPro/blob/master/goPro.py
 */
function command(cmd, val) {
  if (goslow.test_mode) {
    return true;
  }
  var path = 'http://10.5.5.9:80/' +
    cmd + '?t=' +
    goslow.wifi;
  if (val !== undefined) {
    path += '&p=%' + val;
  }
  var code = null;
  $.ajax({
    url: path,
    async: false,
    timeout: 2000,
    success: function(data, status, xhr){
      if (status == 'success') {
        code = toHex(data);
      }
    },
    error: function(xhr, status, error){
      error_restart('There was a problem connecting to the camera. Restarting the video booth.');
    },
    dataType: 'text'
  });
  return code;
}

function beep() {
  command('camera/LL', '01');
  sleep(1000);
  command('camera/LL', '00');
}

function powerOn() {
  command('bacpac/PW', '01');
  sleep(5000);
}

function powerOff() {
   command('bacpac/PW', '00');
}

function volume(vol) {
  command('camera/BS', vol);
}
function previewOn() {
  command('camera/PV', '02');
}

function previewOff() {
  command('camera/PV', '00');
}

function fovWide() {
  command('camera/FV', '00');
}

function fovMed() {
  command('camera/FV', '01');
}

function fovNarrow() {
  command('camera/FV', '02');
}

function modeVideo() {
  command('camera/CM', '00');
}

function startCapture() {
  command('camera/SH', '01');
}

function stopCapture() {
  command('camera/SH', '00');
}

function resolution(res) {
  // 00: wvga
  // 01: 720
  // 02: 960
  // 03: 1080
  // 04: 1440
  // 05: 2.7K
  // 06: 4K
  // 07: 2.7K 17:9
  // 08: 4K 17:9

  switch(res) {
    case 'WVGA':
      command('camera/VV', '00');
      break;
    case '960':
      command('camera/VV', '02');
      break;
    case '1080':
      command('camera/VV', '03');
      break;
    default:
    case '720':
      command('camera/VV', '01');
      break;

  }
}

function frameRate(fps) {
  switch(fps) {
    case 12:  // (4K 17:9)
      command('camera/FS', '00');
      break;
    case 15:  // (4K)
      command('camera/FS', '01');
      break;
    case 24:  // (1080, 1440, 2.7K 17:9)
      command('camera/FS', '02');
      break;
    case 30:  // (1080, 1440, 2.7K)
      command('camera/FS', '04');
      break;
    case 48:  // (960, 1080, 1440)
      command('camera/FS', '05');
      break;
    case 60:  // (720, 1080)
      command('camera/FS', '07');
      break;
    case 100:  // (960)
      command('camera/FS', '08');
      break;
    case 120:  // (720)
      command('camera/FS', '09');
      break;
    case 240:  // (WVGA)
      command('camera/FS', '0a');
      break;
  }
}

var statsDef = {
  // TODO: Power
  'power': {
    'cmd': 'bacpac/se',
    'start': 18,
    'length': 2,
    'translate': {
      '00': 'off',
      '01': 'on'
    }
  },
  'volume': {
    'cmd': 'camera/se',
    'start': 19,
    'length': 1,
    'translate': {
      '0': 'Off',
      '1': '70%',
      '2': '100%'
    }
  },
  'led': {
    'cmd': 'camera/se',
    'start': 20,
    'length': 1,
    'translate': {
      '0': '0',
      '1': '2',
      '2': '4'
    }
  },
  'battery': {
    'cmd': 'camera/se',
    'start': 25,
    'length': 2,
    'translate': hexToDec
  },
  'spot_meter': {
    'cmd': 'camera/se',
    'start': 4,
    'length': 1,
    'translate': {
      '0': 'off',
      '1': 'on'
    }
  },
  'photos_remaining': {
    'cmd': 'camera/sx',
    'start': 27,
    'length': 4,
    'translate': hexToDec
  },
  // TODO: Video time remaining
  'video_time_remaining': {
    'cmd': 'camera/sx',
    'start': 27,
    'length': 4,
    'translate': hexToDec
  },
  'preview': {
    'cmd': 'camera/pv',
    'start': 0,
    'length': 2,
    'translate': {
      '00': 'off',
      '02': 'on'
    }
  },
  'recording': {
    'cmd': 'camera/sh',
    'start': 0,
    'length': 2,
    'translate': {
      '00': 'off',
      '01': 'on'
    }
  }
};

function cameraStats(stat) {
  var stats = {};
  var lookUpStats = {};
  if (stat === undefined) {
    // Load up all the stats
    lookUpStats = statsDef;
  }
  else {
    // Get one stat
    lookUpStats[stat] = statsDef[stat];
  }

  for (var s in lookUpStats) {
    var def = lookUpStats[s];
    if (typeof stats[["var"]] == "undefined") {
      stats[def.cmd] = command(def.cmd);
    }
    var raw = stats[def.cmd];
    var data = raw.substr(def.start, def.length);
    console.log(s + ": " + data);
    if (typeof def.translate === 'object' && typeof def.translate[data] != 'undefined') {
      stats[s] = def.translate[data];
    }
    else if (typeof def.translate == 'function') {
      stats[s] = def.translate(data);
    }
    else {
      stats[s] = data;
    }
  }

  return stats;
}

function toHex(str) {
  var hex = '';
  for (var i=0; i<str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return hex;
}

function hexToDec(hex) {
  return parseInt(hex.toString(), 16);
}

function next_page(show) {
  $('.goslow-page').hide();
  var height = $(window).height() + "px";
  $('#' + show).css('height', height).show();
}

var auto_off = function auto_off(){
  // Unbind the click so the user can't click the screen while it's powering off
  $('#instructions').unbind('click', ready);
  command('bacpac','PW','%00');
  setTimeout(function(){
    // Rebind the home page to be click ready after 3 seconds
    $('#instructions').bind('click', ready);
  }, 3000);
};

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
