var cont_why = 0, struct =[], time, url,stime,etime, wavesurfer = [];


  function get_originaudio(id){
    if(!id.includes('Origin')){
      const audioURL = 'https://localhost:8000/home/blacksmog/WMI/users/1Origin' + id + '.mp3';
      remove(id);
      getReady(id, audioURL,0);
    }
    else{
      const audioURL = 'https://localhost:8000/home/blacksmog/WMI/users/1' + id + '.mp3';
      remove(id.substring(6,id.length));
      getReady(id.substring(6,id.length), audioURL,0);
    }
  }


  function edit(id){

    var index, ide;
    ide = id + "list"
    struct.forEach(function (item, ind, array) {
      if(item.id == ide) {
        index = ind;
        return;
      }
    });
    var fd = new FormData();
    fd.append('fname',id + '.mp3' );
    fd.append('file', struct[index].blob);
    fd.append('stime',stime );
    fd.append('etime', etime);
    $.ajax({
      url: "/cutAudio", //Need to adapt for audio in input
      method: "POST",
      data: fd,
      processData: false,
      contentType: false
    }).done(function(data) {
      remove(id)
      if(id.includes('Origin')){
        id = id.substring(6,id.length)
      }
      getReady(id,data,1);
  });
}


  function remove(id){
    var list = document.getElementById("waveList");
    var c = document.getElementById(id+"list");
    var index,ide = id + "list";
    struct.forEach(function (item, ind, array) {
      if(item.id == ide) {
        index = ind;
        return;
      }
    });
    struct.splice(index, 1);
    if(id.includes("Why")) cont_why--;
    list.removeChild(c);
  }
function getReady(id,data,ifOrigin){

  var li = document.createElement('li');
  var trash = document.createElement('span');
  var cut_button = document.createElement('button');
  var origin_button = document.createElement('button');
  var div =  document.createElement('div');
  var audioList = document.getElementById("waveList");
  var radioValue = $("input[name='clip']:checked").val();
  //link the a element to the blob
  // link.click()
  if(radioValue == "Why"){
    if(cont_why == 0){
      trash.setAttribute('id', id);
      cut_button.setAttribute('id', id);
      origin_button.setAttribute('id', id);

      div.setAttribute('id', id + 'wave');

    }
    else{
      trash.setAttribute('id', id);
      cut_button.setAttribute('id', id);
      origin_button.setAttribute('id', id);

      div.setAttribute('id', id + 'wave');
    }
  }
  else {
    trash.setAttribute('id', id);
    cut_button.setAttribute('id', id);
    origin_button.setAttribute('id', id);

    div.setAttribute('id', id + 'wave');

  }
  trash.setAttribute('class', "oi oi-trash");
  trash.setAttribute('onclick', "remove(this.id)");
  trash.setAttribute('style', "width:100%; text-align:right;position: relative;right:0px;");

  cut_button.setAttribute('onclick', "edit(this.id)");
  cut_button.setAttribute('style', "width:100%;position: relative;right:0px;");

  origin_button.setAttribute('onclick', "get_originaudio(this.id)");
  origin_button.setAttribute('style', "width:100%;position: relative;right:0px;");

  cut_button.innerHTML = "Cut";
  origin_button.innerHTML = "Origin Audio";

  //add the new audio and a elements to the li element
  div.appendChild(trash);
  li.appendChild(div);
  li.appendChild(document.createElement('br'));
  //add the li element to the ordered list
  audioList.appendChild(li);

  if (audioList.hasChildNodes()) {
    var children = audioList.childNodes;
    if(radioValue == "Why"){
      if(cont_why == 0){
        children[children.length-1].id = id + "list";
        }
      else{
        children[children.length-1].id = id + "list";
      }
      cont_why = cont_why + 1;
    }
    else children[children.length-1].id = id + "list";
  }
  var request = new XMLHttpRequest();
  request.open('GET', data, true);
  request.responseType = 'blob';
  request.onload = function() {
      struct.push({
        blob : request.response,
        id : children[children.length-1].id
      });
      loadWave(div.id,data)

      div.appendChild(cut_button);
      if(ifOrigin) div.appendChild(origin_button);
  };
  request.send();
}

function loadWave(id,data){
  console.log("id in load wave");
  console.log(id);
  var div;
  wavesurfer[id] = WaveSurfer.create({
    container: '#' + id,
    scrollParent : false,
    responsive : true,
    height: 128,
    normalize: false,
    waveColor: '#000000',
    progressColor: '#CCFF00',
    audioRate: 1,
    cursorColor: 'white',
    cursorWidth: 2,
    backend: 'MediaElement',
    mediaType: 'audio',
    renderer: 'Canvas',
    interact: true,
    hideScrollbar: true
  });
  div = document.getElementById(id)

  wavesurfer[id].on('ready', function () {
    stime = 0
    etime = wavesurfer[id].getDuration()
    wavesurfer[id].addRegion({
      id:'#' + id + 'region',
      start: 0,
      end: etime,
      color: 'hsl(231, 100%, 90%,0.4)',
      resize:true,
      drag:true
    });
  });
  wavesurfer[id].on('region-update-end', function (region) {
    stime = region.start;
    etime = region.end;
  });

  wavesurfer[id].on("seek", function(){
    wavesurfer[id].play();

  });
  wavesurfer[id].load(data); // load audio

  div.style = "width:800;background-color:#0060DF";
}
