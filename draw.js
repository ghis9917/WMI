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
    ide = id.split("_");
    struct.forEach(function (item, ind, array) {
      if(item.id == ide[0]) {
        index = ind;
        return;
      }
    });
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
      remove(newid[0])
      if(id.includes('Origin')){
        id = id.substring(6,id.length)
      }
      console.log("id nuovo da slavare " + newid[0]);
      getReady(newid[0],data,1);
  });
}


function remove(id){
  var list = document.getElementById("waveList");
  var listItem = document.getElementById(id+"_list");
  var index,ide = id + "_list";
  struct.forEach(function (item, ind, array) {
    if(item.id == ide) {
      index = ind;
      return;
    }
  });
  var cont = 0;
  for(var i in wavesurfer){
    if(i == id){
      console.log("splittato");
      wavesurfer[i].destroy();
      wavesurfer[i].empty();
      wavesurfer = wavesurfer.splice(cont,1);
      console.log(wavesurfer);
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
  console.log("id passed to getready " + id);

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
  // var xhr = new XMLHttpRequest();
  //
  // $.ajax({
  //             url:data,
  //             cache:false,
  //             type:"get",
  //             xhrFields: {
  //               responseType: 'blob'
  //             },
  //             success: function(blob){
  //               console.log("blob ");
  //               console.log(blob);
  //               struct.push({
  //                 blob : blob,
  //                 id : id
  //               });
  //               loadWave(div.id,data)
  //
  //               if(ifOrigin) div.appendChild(origin_button);
  //             },
  //             error:function(err){
  //                 console.log("some err " + err);
  //             }
  //         });
  //
  //
  var request = new XMLHttpRequest();
  request.open('GET', data, true);
  request.responseType = 'blob';
  request.onload = function() {
      struct.push({
        blob : request.response,
        id : id
      });
      console.log("rima di load wave " + div.id);
      loadWave(div.id,data)
      console.log(struct);
      if(ifOrigin) div.appendChild(origin_button);
  };
  request.send();
}

function loadWave(id,data){

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
    etime = wavesurfer[id].getDuration();
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
    wavesurfer[id].loadBlob(data);
  }
  else {
    console.log("url");
    console.log(data);
    wavesurfer[id].load(data); // load audio
  }
  div.style = "width:800;background-color:#0060DF";
}
