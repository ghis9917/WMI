var cont_why = 0, struct =[], time, url,stime,etime, wavesurfer = [];


  function controlStruct(id){
    var index;
    struct.forEach(function (item, ind, array) {
      if(item.id == id) {
        index = ind;
        return;
      }
    });
    return index;
  }

  function get_originaudio(id){
    var ide;
    ide = id.split("_");
    const audioURL = 'https://localhost:8000/user/userid/1Origin' + ide[0] + '.mp3';
    remove(ide[0]);
    getReady(ide[0], audioURL,0);
  }


  function edit(id){

    var index, ide;
    ide = id.split("_");
    index = controlStruct(ide[0]);
    if(!(stime == 0 && etime.toFixed(0) == wavesurfer[ide[0]+"_wave"].getDuration().toFixed(0) )) {
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
      getReady(newid[0],data,1);
  });
}
}


function remove(id){
  var list = document.getElementById("waveList");
  var index,ide = id + "_list";
  ide = id.split("_");
  var listItem = document.getElementById(ide[0]+"_list");
  index = controlStruct(ide[0]);
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
  var cut = document.createElement('span');
  var origin_button = document.createElement('button');
  var div =  document.createElement('div');
  var input =  document.createElement('input');
  var audioList = document.getElementById("waveList");
  var radioValue = $("input[name='clip']:checked").val();
  var label = document.createElement('label');
  console.log("id passed to getready " + id);
  label.innerHTML = id + '.mp3';

  if(radioValue == "Why"){
    if(cont_why == 0){
      trash.setAttribute('id', id+ '_trash');
      cut.setAttribute('id', id+ '_cut');
      origin_button.setAttribute('id', id+ '_origin');

      div.setAttribute('id', id + '_wave');

    }
    else{
      trash.setAttribute('id', id+ '_trash');
      cut.setAttribute('id', id+ '_cut');
      origin_button.setAttribute('id', id+ '_origin');

      div.setAttribute('id', id + '_wave');
    }
  }
  else {
    trash.setAttribute('id', id+ '_trash');
    cut.setAttribute('id', id+ '_cut');
    origin_button.setAttribute('id', id+ '_origin');

    div.setAttribute('id', id + '_wave');

  }
  trash.setAttribute('class', "glyphicon glyphicon-trash");

  trash.setAttribute('onclick', "remove(this.id,1)");
  trash.setAttribute('style', "width:100%; text-align:left; position: relative;left:0px;");

  cut.setAttribute('class', "glyphicon glyphicon-pencil");
  cut.setAttribute('onclick', "edit(this.id,1)");
  cut.setAttribute('style', "width:100%; text-align:left; position: relative;left:50px;");

  origin_button.setAttribute('onclick', "get_originaudio(this.id,1)");
  origin_button.setAttribute('style', "width:100%;position: relative;right:0px;");

  // cut.innerHTML = "Cut";
  origin_button.innerHTML = "Origin Audio";

  input.setAttribute('class', "toUpload");
  input.setAttribute('id', id);
  input.setAttribute('type',"checkbox")

  //add the new audio and a elements to the li element
  li.appendChild(label);
  li.appendChild(trash);
  // li.appendChild(text)
  li.appendChild(cut);
  li.appendChild(div);
  li.appendChild(input);

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

      loadWave(div.id,request.response)
      console.log(struct);
      if(ifOrigin) div.appendChild(origin_button);
  };
  console.log(request);
  request.send();

  var text ='<label>Content</label>'+
  '<select id="Content'+id+'" multiple="multiple">'+
  '  <option value="1" selected>None</option>'+
  '  <option value="2">natura</option>'+
  '  <option value="3">arte</option>'+
  '  <option value="4">storia</option>'+
  '  <option value="5">folklore</option>'+
  '  <option value="6">cultura moderna</option>'+
  '  <option value="7">religione</option>'+
  '   <option value="8">cucina e drink</option>'+
  '   <option value="9">sport</option>'+
  '   <option value="10">folklore</option>'+
  '   <option value="11">musica</option>'+
  '   <option value="12">film</option>'+
  '   <option value="13">moda</option>'+
  '   <option value="14">shopping</option>'+
  '  <option value="15">tecnologia</option>'+
  '   <option value="16">cult. pop. e gossip</option>'+
  '   <option value="17">esperienze personali</option>'+
  '   <option value="18">altro</option>'+
  ' </select>'+
  ' <label>Audience</label>'+

  ' <select id="Audience'+id+'" multiple="multiple">'+
  '   <option value="1" selected>pubblico generico</option>'+
  '   <option value="2">pre-scuola</option>'+
  '   <option value="3">scuola primaria</option>'+
  '   <option value="4">scuola media</option>'+
  '   <option value="5">specialisti del settore</option>'+
  ' </select>'
  $("#"+li.id).append(text);
  $("#Content"+id).multiselect({
    hideOptgroupCheckboxes:true
    });
  $("#Audience"+id).multiselect({
    hideOptgroupCheckboxes:true
  });
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
