var ffmpeg = require('fluent-ffmpeg');
var 

$("button").on("click", function (){
    var file = document.querySelector('#avatar1').files[0];
    var file2;
    const conv = new ffmpeg(file);
      conv
      .setStartTime(2) //Can be in "HH:MM:SS" format also
      .setDuration(10)
      .on("start", function(commandLine) {
          console.log("Spawned FFmpeg with command: " + commandLine);
      })
      .on("error", function(err) {
          console.log("error: ", +err);
      })
      .on("end", function(err) {
          if (!err) {
              console.log("conversion Done");
          }
      })
});
