var cont_why = 0, struct =[], time, url,stime = [],etime = [], wavesurfer = [], audience = [], content = [],currentAudioId,drawOrigin = 0;

function playAudio(id){
	var ide = id.split("_");
	ide = ide[0];
	
	var icon = document.getElementById(ide+'_Icon');
	if(icon.className.includes("play")){
		 icon.className = "fa fa-pause play";
	 }
	else {
		icon.className = "fa fa-play play";
	}
	wavesurfer[ide+'_wave'].playPause();
}

async function reDraw(id){
	await wavesurfer[id].clearRegions();
	wavesurfer[id].addRegion({
      id:'#' + id + 'region',
      start: stime[id],
      end: etime[id] ,
      color: 'hsl(231, 100%, 90%,0.4)',
      resize:false,
      drag:false
    });
}

function changeEnd(id,mode) {
	
  var rId = id.split("_");
  rId = rId[0];
 
  if(document.getElementById(rId+"_start").value >= Number(etime[rId+"_wave"])){
	   document.getElementById(rId+"_start").value = Number(etime[rId+"_wave"])-0.01;
  }
  else if(document.getElementById(rId+"_start").value < 0) document.getElementById(rId+"_start").value = 0;
  document.getElementById(rId+"_end").min = Number(stime[rId+"_wave"])+0.01;
  stime[rId+"_wave"] = document.getElementById(rId+"_start").value;
  if(mode == 1) reDraw(rId+"_wave");
   if(stime[rId+"_wave"] == 0 && etime[rId+"_wave"] == wavesurfer[rId+"_wave"].getDuration().toFixed(2) ) $("#"+rId+'_cut').attr('disabled',true);
  else $("#"+rId+'_cut').attr('disabled',false);

}

function changeStart(id,mode) {
  var rId = id.split("_");
  rId = rId[0];
  
  if(document.getElementById(rId+"_end").value <= Number(stime[rId+"_wave"])){
	   document.getElementById(rId+"_end").value = Number(stime[rId+"_wave"])+0.01;
  }
  else if(document.getElementById(rId+"_end").value > wavesurfer[rId+'_wave'].getDuration()) document.getElementById(rId+"_end").value = wavesurfer[rId+'_wave'].getDuration().toFixed(2);
  document.getElementById(rId+"_start").max = Number(etime[rId+"_wave"])-0.01;
  
  etime[rId+"_wave"] = document.getElementById(rId+"_end").value;
  if(mode == 1) reDraw(rId+"_wave");
   if(stime[rId+"_wave"] == 0 && etime[rId+"_wave"] == wavesurfer[rId+"_wave"].getDuration().toFixed(2) ) $("#"+rId+'_cut').attr('disabled',true);
  else $("#"+rId+'_cut').attr('disabled',false);

}

  function drawOption(id,listId,ifOrigin){
  
  
  var modalOpen = "$('#Option"+id+"').modal();"
  var modalClose = "$('#Option"+id+"').modal('hide');"
  var text = 
		'<div>'+
		'<div ><button type="button" id="'+id+'_play" class="btn btn-outline-primary btn-circle m-1"   style="text-align:center!important; margin: 0em!important; float:left; width: 35px; height: 35px; line-height: 35px; text-align: center; padding: 0; border-radius: 50px; border-radius:50%; position: relative;" onclick="playAudio(this.id)"><i text-align:center!important; id="'+id+'_Icon" class="fa fa-play play"></i> </button>'+
		'<input disabled id="'+id+'_cut" style="position: relative!important; float:right!important; " class="btn btn-primary" type="submit" value="Taglia" onclick="edit(this.id)"></input>'+
		
		'<input id="'+id+'_origin" style="position: relative!important; float:center!important; " class="btn btn-primary" type="reset" value="Reset" onclick="get_originaudio(this.id)"></input></div>'+
		
		'<div style="margin-bottom:1em;"><table style="display:inline; text-align:center; margin-bottom:1em;">'+
		'<tr><td style="border-right:0.25px solid #6495ed;">Tempo inizio:</td><td style="border-left:0.25px solid #6495ed;">Tempo fine:</td></tr>'+
		'<tr><td style="width:50%; border-right:0.25px solid #6495ed;">'+
		'<input type="number" step=".01" id="'+id+'_start" onchange="changeEnd(this.id,1)" class="form-control" style="display:inline; text-align:center!important; margin-right:0px!important; position: relative; border-radius: 1rem; width: 80%!important;" min="0" max="'+(etime[id+'_wave']-0.01)+'" value="0"></input>'+
		'</td><td style="width:50%; border-left:0.25px solid #6495ed;">'+
		'<input type="number" step=".01" id="'+id+'_end" onchange="changeStart(this.id,1)" class="form-control" style="display:inline; text-align:center!important; margin-right:0px!important; position: relative; border-radius: 1rem; width: 80%!important;" min="'+(stime[id+'_wave']+0.01)+'" max="'+etime[id+'_wave']+'" value="'+etime[id+'_wave']+'"></input>'+
		'</td></tr></table></div>'+
		
		'<div class="custom-control custom-checkbox" style="text-align: left!important; padding-left:0px!important;">'+
		
		'<table style="display:inline; text-align:center; margin-bottom:1em;"><tr><td>'+
        '<select id="Content'+id+'" class="selectpicker" style=" float:left;" title="Contenuto" data-width="120px" data-selected-text-format="count > 2" MULTIPLE>'+
        '  <option value="0" id="nat">natura</option>'+
        '  <option value="1" id="art">arte</option>'+
        '  <option value="2" id="his">storia</option>'+
        '  <option value="3" id="flk">folklore</option>'+
        '  <option value="4" id="mod">cultura moderna</option>'+
        '  <option value="5" id="rel">religione</option>'+
        '  <option value="6" id="cui">cucina e drink</option>'+
        '  <option value="7" id="spo">sport</option>'+
        '  <option value="8" id="mus">musica</option>'+
        '  <option value="9" id="mov">film</option>'+
        '  <option value="10" id="fas">moda</option>'+
        '  <option value="11" id="shp">shopping</option>'+
        '  <option value="12" id="tec">tecnologia</option>'+
        '  <option value="13" id="pop">cult. pop. e gossip</option>'+
        '  <option value="14" id="prs">esperienze personali</option>'+
        '  <option value="15" id="oth">altro</option>'+
        ' </select></td><td>'+
        ' <select id="Audience'+id+'" class="selectpicker" style="float:left;" title="Audience(gen)" data-width="120px" data-selected-text-format="count > 2">'+
        '   <option value="0" id="gen">pubblico generico</option>'+
        '   <option value="1" id="pre">pre-scuola</option>'+
        '   <option value="2" id="elm">scuola primaria</option>'+
        '   <option value="3" id="mid">scuola media</option>'+
        '   <option value="4" id="scl">specialisti del settore</option>'+
        ' </select></td></tr>' +
        ' <tr><td><select id="Language'+id+'" class="selectpicker" style="float:left;" title="Lingua(ita)" data-width="120px">'+
        '   <option value="0" id="ita">Italiano</option>'+
        '   <option value="1" id="eng">English</option>'+
        '   <option value="2" id="deu">Deutsch</option>'+
        '   <option value="3" id="fra">Français</option>'+
        '   <option value="4" id="esp">español</option>'+
        ' </select></td><td>'+
        ' <select id="Detail'+id+'" class="selectpicker" style="float:left;" title="Dettaglio(1)" data-width="120px">'+
        '   <option value="1" >1</option>'+
        '   <option value="2" >2</option>'+
        '   <option value="3" >3</option>'+
        '   <option value="4" >4</option>'+
        '   <option value="5" >5</option>'+
        ' </select></tr></td></table>'+
		' <input type="checkbox" class="my-class custom-control-input" style="float: right;" id="'+id+'Input" checked="true">'+
		'<label class="custom-control-label" style="margin-top:1em!important; float: right; bottom:0%!important;"  for="'+id+'Input">Da Caricare</label>'+
		'</div>';
		
    $("#"+listId).append(text);
    $('#Audience'+id).selectpicker();
    $('#Language'+id).selectpicker();
    $('#Content'+id).selectpicker();
    $('#Detail'+id).selectpicker();
    if(drawOrigin == 1) document.getElementById(id+'_origin').hidden = true;
  
  }


  function addItem(id,name){
	 var list = document.getElementById("waveList");
	 var children = list.childNodes;
	 var val = children.length-1;
	 $("#listDropDown").append('<option val='+val+' id="'+ id + '" selected="">'+name+'</option>');
     document.getElementById('listDropDown').value=name;
     $("#listDropDown").selectpicker("refresh");
  }

  function updateCurrentAudio() {
	var id = (document.getElementById("listDropDown").value).split(".");
	currentAudioId = id[0]+"_list";
	hiddenListItem(currentAudioId);
	
  }

  function nextAudio(){
	  
	var index = controlList();
	if(index  == struct.length) {
		return;
	}
	else if(index < struct.length){
		let list = document.getElementById("waveList");
		let children = list.childNodes;
		var ide = currentAudioId.split("_")
		ide = ide[0];
		try{wavesurfer[ide+'_wave'].stop();}catch(e){}
		currentAudioId = children[index+1].id;
		hiddenListItem(currentAudioId);
		var id = currentAudioId.split('_');
		$("#listDropDown").val(id[0]);
        $("#listDropDown").selectpicker("refresh");
	}
	
  }

  function prevAudio(){
	var index = controlList();
	if(index == 0 || index == undefined ) {
		return;
	}else{
	
		let list = document.getElementById("waveList");
		let children = list.childNodes;
		var ide = currentAudioId.split("_")
		ide = ide[0];
		try{wavesurfer[ide+'_wave'].stop();}catch(e){}
		currentAudioId = children[index-1].id;
		hiddenListItem(currentAudioId);
		var id = currentAudioId.split('_');
		$("#listDropDown").val(id[0]);
        $("#listDropDown").selectpicker("refresh");
	 
  }
	  
	
  }

  function hiddenListItem(id){
	 var list = document.getElementById("waveList");
     var children = list.childNodes;
        for (var i = 0; i < children.length; i++) {
            if(children[i].id != id) {
				document.getElementById(children[i].id).hidden = true;
            }
            else document.getElementById(children[i].id).hidden = false;
        }  
  }

  function checkExistence(id){
    var list = document.getElementById("waveList");
    var actualId = "";
        var children = list.childNodes;
        for (var i = 0; i < children.length; i++) {
			try{
				actualId = children[i].id.split("-")
				actualId = actualId[1].split("_");
				if(actualId[0] == id) {
					return i;
				}
			}
			catch(e){
			}
        }
    
  }

  function controlList(){
    var list = document.getElementById("waveList");
        var children = list.childNodes;
        for (var i = 0; i < children.length; i++) {
            if(children[i].id == currentAudioId) {
				return i;
            }
        }
    
  }

  function controlStruct(id){
    var index;
    struct.forEach(function (item, ind, array) {
      if(item.id == id) {
        index = ind;
      }
    });
    return index;
  }

  function get_originaudio(id){
    var ide;
    ide = id.split("_");
    const audioURL = 'user/'+profile.getId()+'/Origin' + ide[0] + '.mp3';
    $("#waveList").hide();
    $("#spinnerBorderAudio").show();
    $("#spinnerAudio").show();
    remove(ide[0],0);
    var request = new XMLHttpRequest();
	  request.open('GET', audioURL, true);
	  request.responseType = 'blob';
      request.header= {Range: "bytes=0-500000"};
      request.onload = function() {
      struct.push({
        blob : request.response,
        id : ide[0]
      });
      $("#"+ide[0]+'_cut').attr('disabled',true);
      loadWave(ide[0]+ '_wave',request.response,ide[0],ide[0]+ '_list',0)
      document.getElementById(ide[0]+ '_origin').hidden = true;
      $("#spinnerBorderAudio").hide();
      $("#spinnerAudio").hide();
      $("#waveList").show();

  }
  request.send();
  }


  function edit(id){

    var index, ide;
    ide = id.split("_");
    index = controlStruct(ide[0]);
    if(!(stime[ide[0]+"_wave"] == 0 && etime[ide[0]+"_wave"] == wavesurfer[ide[0]+"_wave"].getDuration().toFixed(2) )) {
    var fd = new FormData();

    fd.append('fname',ide[0] + '.mp3' );
    fd.append('file', struct[index].blob);
    fd.append('stime',stime[ide[0]+"_wave"] );
    fd.append('etime', etime[ide[0]+"_wave"]);
    fd.append('id',profile.getId());
    $.ajax({
      url: "/cutAudio", 
      method: "POST",
      data: fd,
      processData: false,
      contentType: false
    }).done(function(data) {
	  if(!data.includes('.mp3')){
		  alert(data);
		  return;
	  }
      var newid = id.split("_");
      $("#waveList").hide();
      $("#spinnerBorderAudio").show();
	  $("#spinnerAudio").show();
      remove(newid[0],0);
      var request = new XMLHttpRequest();
	  request.open('GET', data, true);
	  request.responseType = 'blob';
      request.header= {Range: "bytes=0-500000"};
      request.onload = function() {
      struct.push({
        blob : request.response,
        id : newid[0]
      });
      $("#"+ide[0]+'_cut').attr('disabled',true);
      loadWave(newid[0]+ '_wave',request.response,newid[0],newid[0]+ '_list',0)
      document.getElementById(newid[0]+ '_origin').hidden = false;
      $("#spinnerBorderAudio").hide();
	  $("#spinnerAudio").hide();
	  $("#waveList").show();

  };
  request.send();
  });
}
}


function remove(id, mode){
  var list = document.getElementById("waveList");
  var index,ide = id + "_list";
  ide = id.split("_");
  var listItem = document.getElementById(ide[0]+"_list");
  index = controlStruct(ide[0]);
  wavesurfer[ide[0]+"_wave"].destroy();
  delete wavesurfer[ide[0]+"_wave"];
  struct.splice(index, 1);
  if(mode == 1) {
	  var itemSelectorOption = $('#listDropDown option:selected');
	  itemSelectorOption.remove(); 
	  $('#listDropDown').selectpicker('refresh');
	  if(struct.length == 0){
		document.getElementById("listDropDown").innerHTML = "";
        $("#listDropDown").selectpicker("refresh");
		currentAudioId = ""; // sto rimuovendo l'ultimo elemento
	  }
	  else if(controlList() == struct.length ) prevAudio();
	  else nextAudio();
	  
  }
  
  if(mode == 1) list.removeChild(listItem);
  
}

function getReady(id,data,ifOrigin = 1,mode){

  var li = document.createElement('li');
  var trash = document.createElement('span');
  var cut = document.createElement('span');
  
  origin.hidden = true;
 
  var div =  document.createElement('div');
  var input =  document.createElement('input');
  var audioList = document.getElementById("waveList");
  var radioValue = $("input[name='clip']:checked").val();
  var label = document.createElement('label');
  label.innerHTML = id;
  $("#waveList").hide();
  $("#spinnerBorderAudio").show();
  $("#spinnerAudio").show();

  div.setAttribute('id', id + '_wave');
 
  
  li.setAttribute('style','list-style-type: none;');
  
  var request = new XMLHttpRequest();
  request.open('GET', data, true);
  request.responseType = 'blob';
  request.header= {Range: "bytes=0-500000"};
  request.onload = function() {
   
  li.innerHTML += '<button type="button" id='+id+'_trash" class="btn btn-outline-danger btn-circle m-1" style="text-align:center!important; width: 25px; height: 25px; line-height: 25px; padding: 0; border-radius: 50px; border-radius:50%; position: absolute; right:0%; top:0%;" onclick="remove(this.id,1);"><i style="text-align:center!important;" class="fa fa-times delete"></i> </button>'
  li.appendChild(label);
  li.appendChild(div);

  li.appendChild(document.createElement('br'));

  //add the li element to the ordered list
  audioList.appendChild(li);

  if (audioList.hasChildNodes()) {
    var children = audioList.childNodes;
    children[children.length-1].id = id + "_list";
    if(mode != 2){ 
		if(radioValue == "Why"){
		  cont_why = cont_why + 1;
		}
	}
  }
      struct.push({
        blob : request.response,
        id : id
      });
   drawOrigin = 1;
   loadWave(div.id,request.response,id,li.id,1);
        
    hiddenListItem(li.id);
    currentAudioId = li.id;
    
    if(ifOrigin == 0){
		addItem(id,label.innerHTML);
	}
    $("#spinnerBorderAudio").hide();
	$("#spinnerAudio").hide();
	$("#waveList").show();

  };
  request.send();
}
function loadWave(id,data,optionId,listId,mode){

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

  wavesurfer[id].on('ready', async function () {
    stime[id] = 0.00;
    etime[id] = wavesurfer[id].getDuration().toFixed(2);
    wavesurfer[id].addRegion({
      id:'#' + id + 'region',
      start: 0,
      end: etime[id] ,
      color: 'hsl(231, 100%, 90%,0.4)',
      resize:false,
      drag:false
    });
       if(mode == 1) drawOption(optionId,listId);
	   else{
		let opt = id.split("_")
		opt = opt[0];
		document.getElementById(opt+"_end").value = etime[id];
		document.getElementById(opt+"_start").value = 0;
	   }
  });
  wavesurfer[id].on('region-update-end', function (region) {
	if(stime[id] == region.start.toFixed(2) && etime[id] == region.end.toFixed(2)) return;
	
	let opt = id.split("_");
    opt = opt[0];

	document.getElementById(opt+"_start").value = region.start.toFixed(2);
	document.getElementById(opt+"_end").value = region.end.toFixed(2);
	changeEnd(opt+"_start",0);
	changeStart(opt+"_end",0);
	
  });

	wavesurfer[id].on('pause', function () {
		var ide = id.split("_");
		ide = ide[0];
		document.getElementById(ide+'_Icon').className = "fa fa-play";
		
	});
	wavesurfer[id].on('finish', function () {
		var ide = id.split("_");
		ide = ide[0];
		document.getElementById(ide+'_Icon').className = "fa fa-play";
		
	});
  if(data instanceof Blob) {
    wavesurfer[id].load( URL.createObjectURL(data));
  }
  else {
    wavesurfer[id].load(data); // load audio
  }
  div.style = "width:800;background-color:#0060DF";
}
