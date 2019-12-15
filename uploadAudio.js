
$(document).ready(function () {

 $('#files').on('input',async function() {
      var files = document.querySelector('#files').files;
      console.log(files);
      for(var index in files ){
        var file = files[index];
        console.log("file");
        console.log(file);
        await loadFile(file);
        }
    });

function loadFile(file){
  return new Promise(async (resolve,reject) => {
  if(file instanceof File){
  var reader = new FileReader();
  var fileSize = file.size;
  console.log(file.size)
  reader.onload = await function(e) {
    if (file.type == "audio/mp3" || file.type == "audio/wav" || file.type == "video/webm") {
        var audioElement = document.createElement('audio');
        audioElement.src = e.target.result;
        $("body").append(audioElement)
        var timer = setInterval(function() {
          if (audioElement.readyState === 4) {
            // switch (tipo) {
            //     case "why":
            //     console.log("whyyyyy")
            //     if(audioElement.duration > 15){
            //       //TODO UPLOAD NEW AUDIO
            //       $('#'+id).val("");
            //     }else{
            //       //TODO CUT OR REJECT AUDIO
            //     };break;
            //     case "how":
            //     console.log("howwwww")
            //     carica(file);
            //     if(audioElement.duration > 30 && audioElement.duration < 15){
            //       //TODO UPLOAD NEW AUDIO
            //       //$('#'+id).val("");
            //     }else{
            //       //TODO CUT OR REJECT AUDIO
            //     };break;
            //     case "what":
            //     console.log("whaaattttt")
            //     if(audioElement.duration > 15){
            //       //TODO UPLOAD NEW AUDIO
            //       $('#'+id).val("");
            //     }else{
            //       //TODO CUT OR REJECT AUDIO
            //     };break;
            //     default:
            //     console.log("Bah, qualcosa è andato storto, mi disp")
            //   }
              clearInterval(timer);
              var div = document.createElement('div');
              var li = document.createElement('li');
              var audioList = document.getElementById("waveList");
              var id = file.name.split(".");
              var url = URL.createObjectURL(file);
              resolve(getReady(id[0],url,0));
              // div.setAttribute('id', 'wave' + id[0] );
              // li.appendChild(div);
              // li.appendChild(document.createElement('br'))
              // audioList.appendChild(li);
              // resolve(loadWave(div.id,url));
            }
          }, 500);
        }
      };
      if (file) {
        console.log("riga 97");
        reader.readAsDataURL(file);
      } else {
        alert('nofile');
      }
    }
  });
}
      $('#uploadForm').submit(function(event) {
         $("#status").empty().text("File is uploading...");
          event.preventDefault();
         $.ajax({
             error: function(xhr) {
         status('Error: ' + xhr.status);
             },

             success: function(response) {
         $("#status").empty().text(response);
                 console.log(response);
             }
     });
         //Very important line, it disable the page refresh.
     return false;
     });
});
