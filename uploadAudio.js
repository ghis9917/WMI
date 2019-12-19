function resetForm(check){
  document.getElementById("uploadForm").reset();
  var modalBody = document.getElementById("typeAudioSelectBody");
  var waveList = document.getElementById("waveList");
  var childBody = modalBody.lastElementChild;
  var childList = waveList.lastElementChild;

  while (childBody) {
    modalBody.removeChild(childBody);
    childBody = modalBody.lastElementChild;
  }
  if(check == 1){
    while (childList) {
      waveList.removeChild(childList);
      childList = waveList.lastElementChild;
    }
  }
}

function showWave(){
  var modalBody = $("#typeAudioSelectBody").children();
  var newId = "";
  for (var child in modalBody) {
    if(modalBody[child].id !== undefined){
      fileId = modalBody[child].id.replace("method","");
      console.log("file id");
      console.log(fileId);
      setNewId(fileId);
    }
  }

  resetForm(0);
}

function setNewId(fileId){

  var radios = document.getElementsByName(fileId+'clip');
  var div = document.getElementById(fileId+"_wave");
  var listId = document.getElementById(fileId+"_list");
  var waveList = document.getElementById("waveList");

  var type="",trashCut;

  for (var i = 0, length = radios.length; i < length; i++){
    if (radios[i].checked){

    type = radios[i].id.replace(fileId,"");
    type = type.replace("Input","");
    // div.setAttribute("id",type+ "-" + fileId+"_wave");
    // trashCut = $("#"+div.id).children();
    // trashCut[0].id = type+ "-" +fileId+"_trash";
    // trashCut[1].id = type+ "-" +fileId+"_cut";
    break;
 }
}
var url;
struct.forEach(function (item, ind, array) {
  if(item.id == fileId) {
    struct.splice(ind, 1);
    url = URL.createObjectURL(item.blob);
    return;
  }
});
var cont = 0;
for(var i in wavesurfer){
  if(i == fileId+"_wave"){
    console.log("splittato");
    wavesurfer[i].destroy();
    wavesurfer = wavesurfer.splice(cont,1);
    console.log(wavesurfer);
    break;
  }
  cont++;
}

waveList.removeChild(listId);
getReady(type+ "-" +fileId,url,0);
}
$(document).ready(function () {


function loadModal(file,id){

  var clipForm = document.createElement('form');
  var howInput = document.createElement('input');
  var whyInput = document.createElement('input');
  var whatInput = document.createElement('input');
  var howLabel = document.createElement('label');
  var whyLabel = document.createElement('label');
  var whatLabel = document.createElement('label');
  var nameLabel = document.createElement('label');

  howInput.setAttribute('id', id+"howInput");
  whyInput.setAttribute('id', id+"whyInput");
  whatInput.setAttribute('id', id+"whatInput");

  // howInput.setAttribute('value', "How");
  // whyInput.setAttribute('value', "Why");
  // whatInput.setAttribute('value', "What");
  howInput.setAttribute('type', "radio");
  whyInput.setAttribute('type', "radio");
  whatInput.setAttribute('type', "radio");

  howInput.setAttribute('name', id+"clip");
  whyInput.setAttribute('name', id+"clip");
  whatInput.setAttribute('name', id+"clip");

  howInput.setAttribute("style","right:0px; display: inline-block;");
  whyInput.setAttribute("style","right:0px; display: inline-block;");
  whatInput.setAttribute("style","right:0px; display: inline-block;");

  howLabel.setAttribute("style","text-align: right; display: block;");
  whyLabel.setAttribute("style","text-align: right; display: block;");
  whatLabel.setAttribute("style","text-align: right; display: block;");

  howLabel.innerHTML = "How";
  whyLabel.innerHTML = "Why";
  whatLabel.innerHTML = "What";
  nameLabel.innerHTML = file.name;


  whatInput.checked = true;
  clipForm.setAttribute("id",id+"method")

  nameLabel.setAttribute("style","text-align: left; display: block;")

  clipForm.appendChild(nameLabel);


  clipForm.appendChild(howInput);
  clipForm.appendChild(howLabel);

  clipForm.appendChild(whyInput);
  clipForm.appendChild(whyLabel);

  clipForm.appendChild(whatInput);
  clipForm.appendChild(whatLabel);

  $('#typeAudioSelectBody').append(clipForm);
  // $('#typeAudioSelectBody').append(nameLabel);

}



$('#files').on('input',async function() {
      var files = document.querySelector('#files').files;
      for(var index in files ){
        var file = files[index];
        loadFile(file);
        }
      $("#typeAudioSelect").modal();

    });



async function loadFile(file){
  // return new Promise(async (resolve,reject) => {
  if(file instanceof File){
  var reader = new FileReader();
  var fileSize = file.size;
  reader.onload = await function(e) {
    if (file.type == "audio/mp3" || file.type == "audio/wav" || file.type == "video/webm") {
        var audioElement = document.createElement('audio');
        audioElement.src = e.target.result;
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
              var id = file.name.split(".");
              var url = URL.createObjectURL(file);

              loadModal(file,id[0],e.target.result);
              getReady(id[0],url,0);
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
        reader.readAsDataURL(file);
      } else {
        alert('nofile');
      }
    }
  // });
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
