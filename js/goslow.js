
$(document).ready(function() {
  $('.start-button').hide();
  // Disable rubber band effect on mac browser
  $(document).bind(
    'touchmove',
    function(e) {
      e.preventDefault();
    }
  );

  // Initially load an example video
  videojs("gopro_stream").ready(function(){
    var stream = this;
    stream
      .volume(0)
      .src({src: "clip.mp4", type: "video/mp4"})
      .on("loadedalldata", function(){
        // Initialize the camera after the video loads
        powerOn();
        previewOff();
        stopCapture();
        volume('00');
        $('.loading').hide();
        // Show user buttons after camera checks out
        $('.start-button').fadeIn().bind('click', ready);
      })
      .on("error", function(xhr, status, error){
        // Reload this page if there's errors with
        // loading this video
        error_restart();
      });
  });

  $('#instructions-title').html(goslow.title);
  $('#instructions-text').html(goslow.instructions);

});

/**
 * The "ready" page opens up a live stream from the camera, then
 * moves onto the "countdown" screen after some time defined by
 * "goslow.live_timer" global variable in the config file
 */
var ready = function() {
  // Hide the button pressed and switch the other
  $(this).hide();
  $('.start-button').html($(this).html());
  $('.start-button').unbind().
    removeClass('btn-primary').removeClass('btn-warning').
    addClass('btn-danger').addClass('disabled').
    parent().removeClass('col-sm-6').addClass('col-sm-12');

  var video_type = $(this).data('video');

  fovWide();
  // Change video resolution
  switch(video_type) {
    case "slowmo":
      resolution('720');
      frameRate(120);
      goslow.record_timer = 5;
      goslow.repeat = 0;

      $('#recording-info').html('High speed video looks great in slow motion');
      $('#recording-text').html('High Speed');
      break;
    case "message":
      resolution('1080');
      frameRate(24);
      goslow.record_timer = 10;
      goslow.repeat = 1;

      $('#recording-info').html('Leave a nice video message');
      $('#recording-text').html('Message');
      break;
  }

  if (goslow.live_timer > 0) {
    $('#instructions-title').fadeOut();
    $('#instructions-text').fadeOut(function(){
      $(this).html('<div class="text-danger" style="font-size:2.8em">Preview before you begin</div>').fadeIn();
    });

    previewOn();
    videojs("gopro_stream")
      .volume(0)
      .src({src: goslow.live, type: "video/mp4"})
      .on("loadeddata", function(){
        $('.delay-message').animate({'opacity':1}, 800);
        setTimeout(function(){
          videojs("gopro_stream").pause();
          $('#instructions').fadeOut(function(){
            previewOff();
            videojs("gopro_stream").dispose();
            modeVideo();
            countdown();
          });
        }, goslow.live_timer * 1000);
      })
      .on("error", function(xhr, status, error){
        // Reload this page if there's errors with
        // loading the stream
        error_restart('There was a problem loading the live stream from the camera. Please try again.');
      });
  }
  else {
    $('#instructions').fadeOut(function(){
      videojs("gopro_stream").dispose();
      modeVideo();
      countdown();
    });
  }
};

function countdown() {
  next_page("countdown");
  volume('02');
  var count = 3;
  var countdown = setInterval(function(){
    $("#countdown .count").html(count).show().fadeOut(900);
    count--;

    if (count == -1) {
      clearInterval(countdown);
      setTimeout(function(){
        $("#countdown").fadeOut(function(){
          recording(goslow.record_timer);
        });
      }, 1000);
    }
  }, 1000);
}

function recording() {
  startCapture();
  next_page("recording");
  var count = goslow.record_timer;

  $("#recording .count").html(count).fadeOut(900);
  count--;

  var countdown = setInterval(function(){
    $("#recording .count").html(count).show().fadeOut(900);
    count--;

    if (count == -1) {
      clearInterval(countdown);
      setTimeout(function(){
        // Stop recording
        stopCapture();
        $("#recording").fadeOut(function(){
          done();
        });
      }, 1000);
    }
  }, 1000);
}

function done() {
  next_page("done");
  if (goslow.repeat > 0) {
    $('#done').append('<video id="gopro_playback" autoplay class="video-js vjs-default-skin" width="640" height="356"></video>');
    videojs("gopro_playback").ready(function(){
      var latestVideo = get_last();
      var ext = latestVideo.substr(latestVideo.lastIndexOf('.') + 1);
      var count = goslow.repeat;

      var playback = this;

      playback
        // Turn on the volume, iOS devices ignore this
        .volume(1)
        // Load the latest video
        .src({
          src: latestVideo,
          type: "video/mp4"
        })
        // Pause it to stop the autoplay
        .pause()
        // No errors occurred while loading, start off here
        .on("loadstart", function(){
          $('#playback_text').text('Getting your video...');
          // If it's an MP4, it will step through the video to show the user
          // something is happenning. This adds one more count to the number
          // of times it's repeated.
          if (ext == 'MP4') {
            //count++;
          }
        })
        // Display the percentage loaded
        .on("progress", function(){
          var loaded = this.bufferedPercent();
          // Only step through the video if it's an mp4 (Because they're huge)
          if (ext == 'MP4') {
            // Have the video step thru while it's loading, one second at a time
            var positionLoaded = Math.floor(this.duration() * loaded);
            if (positionLoaded >= this.currentTime() && loaded < 1) {
              this.currentTime(positionLoaded);
            }
          }
          $('#percent').text(Math.floor(loaded * 100) + '%');
        })
        // Video is fully transferred
        .on("loadedalldata", function(){
          setTimeout(function(){
            $('#playback_text').text("Here's your video!");
            $('#percent').text('');
          }, 500);

          // Reset the playhead
          this.currentTime(0);
          // Wait a second then start playing the video
          setTimeout(function(){
            playback.play();
            // Failsafe timeout if the video doesn't repeat correctly
            setTimeout(function(){
              $('html').fadeOut(1000, function(){
                location.reload();
              });
            }, ((goslow.repeat * goslow.record_timer) + (goslow.record_timer * 2)) * 1000);
          }, 1000);
        })
        .on("ended", function(){
          count--;
          if (count > 0) {
            if (count == 1 && goslow.playback_slowmo) {
              $('#playback_text').text("Slow motion");
              // In video.js, the video tag given a new ID
              var video = document.getElementById($('#gopro_playback video').attr('id'));
              // playbackRate isn't available on video.js so we change it a different way
              video.playbackRate = 0.5;
            }
            this.play();
          }
          else {
            setTimeout(function(){
              $('body').fadeOut(1000, function(){
                location.reload();
              });
            }, 1000);
          }
        })
        .on("error", function(xhr, status, error){
          var playback = videojs("gopro_playback");
          $('#done > video').remove();
          playback.dispose();
          goslow.playback_text = "Sorry, there was an <span class='text-danger'>error</span> trying to playback your video.";
          skipPlayback();
        });
    });
  }
  else {
    skipPlayback();
  }
}

function skipPlayback() {
  $('#playback_text').html(goslow.playback_text);
  $('#percent').text('');
  setTimeout(function() {
    $('body').fadeOut(1000, function(){
      location.reload();
    });
  }, 9000);
}
