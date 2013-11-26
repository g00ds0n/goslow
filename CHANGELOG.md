GoSlow Changelog
================

v1.1.0
------
**IMPORTANT:** ``goslow-config.js`` has changed. Make sure to update accordingly.

* Restart the video booth automatically when an error occurs.
* The preview screen is now optional when setting ``live_timer`` to zero.
* The camera beeps only when starting and stopping the recording.
* The opening video on the home page ``clip.mp4`` is now optional by setting ``show_clip`` to false.
* The countdown screen now points to the camera. Use the ``direction`` variable to point the arrow up, down, left, or right.
* Clearer langauge on the countdown screen to convey that it isn't recording just yet.
* A new ``test_mode`` config variable that prevents GoSlow from connecting to the camera while running through the program.

v1.0.1
------
Update documentation

v1.0.0
------

Initial release of goslow.
