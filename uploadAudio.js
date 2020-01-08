var toServer=[],length,latx,lonx;

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
      setNewId(fileId);
    }
  }

  resetForm(0);
}

function setNewId(fileId){
  var url,index,cont = 0;

  var radios = document.getElementsByName(fileId+'clip');
  var div = document.getElementById(fileId+"_wave");
  var listId = document.getElementById(fileId+"_list");
  var waveList = document.getElementById("waveList");
  var type="";

  for (var i = 0, length = radios.length; i < length; i++){
    if (radios[i].checked){
      type = radios[i].id.replace(fileId,"");
      type = type.replace("Input","");
      break;
    }
  }
  index = controlStruct(fileId);
  url = URL.createObjectURL(struct[index].blob);
  struct.splice(index,1);
  for(var i in wavesurfer){
    if(i == fileId+"_wave"){
      wavesurfer[i].destroy();
      wavesurfer = wavesurfer.splice(cont,1);
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
  var list = document.getElementById('waveList');
  howInput.setAttribute('id', id+"HowInput");
  whyInput.setAttribute('id', id+"WhyInput");
  whatInput.setAttribute('id', id+"WhatInput");

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


  whyInput.checked = true;
  clipForm.setAttribute("id",id+"method")

  nameLabel.setAttribute("style","text-align: left; display: block;")

  clipForm.appendChild(nameLabel);

  if(controlClip(list,"How") == 1){
    clipForm.appendChild(howInput);
    clipForm.appendChild(howLabel);
  }
  clipForm.appendChild(whyInput);
  clipForm.appendChild(whyLabel);

  if(controlClip(list,"What") == 1){
    clipForm.appendChild(whatInput);
    clipForm.appendChild(whatLabel);
  }

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
  if(file instanceof File){
  var reader = new FileReader();
  var fileSize = file.size;
  reader.onload = await function(e) {
    if (file.type == "audio/mp3" || file.type == "audio/wav" || file.type == "video/webm") {
        var audioElement = document.createElement('audio');
        audioElement.src = e.target.result;
        var timer = setInterval(function() {
          if (audioElement.readyState === 4) {
              clearInterval(timer);
              var id = file.name.split(".");
              var url = URL.createObjectURL(file);
              loadModal(file,id[0],e.target.result);
              getReady(id[0],url,0);
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
}

function uploadAjax(){
  return new Promise(async (resolve,reject) => {
    toServer.forEach(function (item, ind, array) {
      var fd = new FormData();
      console.log(latx);
      fd.append("fname",item.name);
      fd.append("file",item.blob);
      fd.append("id",profile.getId());
      fd.append("etime",etime[item.name + "_wave"]);

      console.log($("#Content"+item.name).multipleSelect());


  //     $.ajax({
  //       url: "/uploadFile", //Need to adapt for audio in input
  //       method: "POST",
  //       data:fd,
  //       processData: false,
  //       contentType: false
  //     }).done(function(data) {
  //       length--;
  // //other ajax
  //     });
    })
    resolve();
  })
}

  function cancelDir(){
    var timer = null;
    if (length == 0) {
      var fd = new FormData();
      fd.append("id",profile.getId());
      $.ajax({
        url: "/removeDir?id="+profile.getId(), //Need to adapt for audio in input
        method: "POST",
        processData: false,
        contentType: false
      }).done(function(data) {
        clearTimeout(timer);
        resetForm(1);
      });
    }
    else{
        timer = setTimeout(cancelDir, 1000);
    }
  }

  $('#upload').on("click", async function(){
    var checkedValue = null,index,cont = 0;
    var inputElements = document.getElementsByClassName('toUpload');
    toServer = [];
    for(var i=0; inputElements[i]; i++){
          if(inputElements[i].checked){
               checkedValue = inputElements[i].id;
               index = controlStruct(checkedValue);
               toServer[cont] = {}
               toServer[cont].blob = struct[index].blob;
               toServer[cont].name = struct[index].id;
               cont++;
          }
    }
    length = cont;
    await uploadAjax();
    cancelDir();
  })

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
     return false;
     });
});
