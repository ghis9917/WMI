var cont_why = 0, struct =[], time, url,stime,etime, wavesurfer = [];


  function get_originaudio(id){
    if(!id.includes('Origin')){
      const audioURL = 'https://localhost:8000/user/userid/1Origin' + id + '.mp3';
      remove(id);
      getReady(id, audioURL,0);
    }
    else{
      const audioURL = 'https://localhost:8000/user/userid/1' + id + '.mp3';
      remove(id.substring(6,id.length));
      getReady(id.substring(6,id.length), audioURL,0);
    }
  }


  function edit(id){

    var index, ide;
    ide = id.split("_");
    console.log("ide");
    console.log(ide[0]);
    console.log(struct);
    struct.forEach(function (item, ind, array) {
      if(item.id == ide[0]) {
        index = ind;
        return;
      }
    });
    if(stime == 0 && etime == wavesurfer[ide[0]+"_wave"].getDuration()) return;
    var fd = new FormData();

    fd.append('fname',ide[0] + '.mp3' );
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
      var newid = id.split("_")
      remove(newid[0]);
      if(id.includes('Origin')){
        id = id.substring(6,id.length)
      }

      getReady(newid[0],data,1);
  });
}


function remove(id){
  var list = document.getElementById("waveList");
  var listItem = document.getElementById(id+"_list");
  var index,ide = id + "_list";
  struct.forEach(function (item, ind, array) {
    if(item.id == id) {
      index = ind;
      return;
    }
  });
  var cont = 0;
  for(var i in wavesurfer){
    if(i == id+"_wave"){
      wavesurfer[i].destroy();
      wavesurfer = wavesurfer.splice(cont,1);
      break;
    }
    cont++;
  }
  struct.splice(index, 1);
  if(id.includes("Why")) cont_why--;
  list.removeChild(listItem);
}

function getReady(id,data,ifOrigin){

  var li = document.createElement('li');
  var trash = document.createElement('span');
  var cut_button = document.createElement('button');
  var origin_button = document.createElement('button');
  var div =  document.createElement('div');
  var audioList = document.getElementById("waveList");
  var radioValue = $("input[name='clip']:checked").val();
  var label = document.createElement('label');
  console.log("id passed to getready " + id);
  label.innerHTML = id + '.mp3';

  if(radioValue == "Why"){
    if(cont_why == 0){
      trash.setAttribute('id', id+ '_trash');
      cut_button.setAttribute('id', id+ '_cut');
      origin_button.setAttribute('id', id+ '_origin');

      div.setAttribute('id', id + '_wave');

    }
    else{
      trash.setAttribute('id', id+ '_trash');
      cut_button.setAttribute('id', id+ '_cut');
      origin_button.setAttribute('id', id+ '_origin');

      div.setAttribute('id', id + '_wave');
    }
  }
  else {
    trash.setAttribute('id', id+ '_trash');
    cut_button.setAttribute('id', id+ '_cut');
    origin_button.setAttribute('id', id+ '_origin');

    div.setAttribute('id', id + '_wave');

  }
  trash.setAttribute('class', "oi oi-trash");
  trash.setAttribute('onclick', "remove(this.id,1)");
  trash.setAttribute('style', "width:100%; text-align:right;position: relative;right:0px;");

  cut_button.setAttribute('onclick', "edit(this.id,1)");
  cut_button.setAttribute('style', "width:100%;position: relative;right:0px;");

  origin_button.setAttribute('onclick', "get_originaudio(this.id,1)");
  origin_button.setAttribute('style', "width:100%;position: relative;right:0px;");

  cut_button.innerHTML = "Cut";
  origin_button.innerHTML = "Origin Audio";

  //add the new audio and a elements to the li element
  li.appendChild(label);
  li.appendChild(trash);
  div.appendChild(cut_button);
  li.appendChild(div);
  li.appendChild(document.createElement('br'));


  //add the li element to the ordered list
  audioList.appendChild(li);

  if (audioList.hasChildNodes()) {
    var children = audioList.childNodes;
    if(radioValue == "Why"){
      if(cont_why == 0){
        children[children.length-1].id = id + "_list";
        }
      else{
        children[children.length-1].id = id + "_list";
      }
      cont_why = cont_why + 1;
    }
    else children[children.length-1].id = id + "_list";
  }
  var request = new XMLHttpRequest();
  request.open('GET', data, true);
  request.responseType = 'blob';
  request.header= {Range: "bytes=0-500000"};
  request.onload = function() {
      struct.push({
        blob : request.response,
        id : id
      });
      console.log("response ");
      console.log(request.response);
      loadWave(div.id,request.response)
      console.log(struct);
      if(ifOrigin) div.appendChild(origin_button);
  };
  console.log(request);
  request.send();
}
var getDuration = function (url, next) {
  var _player = new Audio(url);
  _player.addEventListener("durationchange", function (e) {
  if (this.duration!=Infinity) {
     var duration = this.duration
     next(duration);
  };
}, false);
_player.currentTime = 24*60*60; //fake big time
};
function loadWave(id,data){

  var div;
  console.log("id");
  console.log(id);
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

  wavesurfer[id].on('ready', async function () {
    stime = 0
    etime = wavesurfer[id].getDuration();
    while(etime === Infinity) {
      await new Promise(r => setTimeout(r, 1000));
      etime= 10000000*Math.random();
    }
    console.log(etime);
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
  if(data instanceof Blob) {
    console.log("upload blob");
    console.log(data);
    wavesurfer[id].load( URL.createObjectURL(data));
  }
  else {
    console.log("url");
    console.log(data);
    wavesurfer[id].load(data); // load audio
  }
  div.style = "width:800;background-color:#0060DF";
}
