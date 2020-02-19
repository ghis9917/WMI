var toServer=[],latx,lonx;
var redIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
var handling = 0,mode;
document.addEventListener("click",handler,true);

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
    currentAudioId = "";
    backColor();
    var title = document.getElementById("titleName");
    title.value = "";
    title.disabled = false;
    cont_why = 0;
    try{
		mymap.removeLayer(currentPoi);
	}
	catch(e){}
	length = 0;
	wavesurfer = [];
	struct = [];
	document.getElementById("listDropDown").innerHTML = "";
    $("#listDropDown").selectpicker("refresh");
    mode = 1;
	cancelDir();
  }
}
async function backColor(){
	var title = document.getElementById("titleName");
	for (let place in POIs) {
		if(title.value == POIs[place].name){
			 try {
				mymap.removeLayer(POIs[place].marker);
				
			 } catch (err) {}
				let poi = L.marker(
				  [POIs[place].coords.latitudeCenter, POIs[place].coords.longitudeCenter]).addTo(mymap);
			poi.on("click", async function() {
			var title = document.getElementById("titleName");
			title.value = POIs[place].name;
			title.disabled = true;
			mymap.removeLayer(poi);
			
			poi = L.marker([POIs[place].coords.latitudeCenter, POIs[place].coords.longitudeCenter], {
				icon: getIconMarkerOfColor(blackIcon)
			})
			.addTo(mymap);
			
			
			$("#uploadModal").modal();
		});
			POIs[place].marker = poi;
			await sleep(250);
		}
	}
}
function showWave(){
  $('#typeAudioSelectBody').hide();
  var modalBody = $("#typeAudioSelectBody").children();
  var name = "",id;
  for (var child in modalBody) {
    if(modalBody[child].id !== undefined){
      id = modalBody[child].id.replace("method","");
      name = modalBody[child].name;
      setNewId(id,name);
    }
  }
  
  document.getElementById('typeAudioSelectBody').innerHTML = "";
  document.getElementById("uploadForm").reset();
}

function setNewId(fileId,url){
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
      if(type.includes("Why")){
		   if(cont_why != 0) type = type + cont_why;
		   cont_why = cont_why + 1;
	  }
      break;
    }
  } 
    var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'blob';
		request.header= {Range: "bytes=0-500000"};
		request.onload = function() {
			var fd = new FormData();
				fd.append('fname', "Origin"+type+ "-" +fileId);
				fd.append('file', request.response);
				fd.append('id',profile.getId());
				fd.append('mode',0);
				$.ajax({
					url: "/saveOriginAudio",
					method: "POST",
					data: fd,
					processData: false,
					contentType: false,
					success: function (data){
						if(!data.includes('.mp3')){
							alert(data);
							return;
						}
						let id = type+ "-" +fileId;
						let name = id + '.mp3';
						getReady(id,data,0,2);
						
					}
				})  
		};
	request.send();
    
	
}
$(document).ready(function () {


function loadModal(file,id,url){

  var clipForm = document.createElement('form');
  var howInput = document.createElement('input');
  var whyInput = document.createElement('input');
  var whatInput = document.createElement('input');
  var howLabel = document.createElement('label');
  var whyLabel = document.createElement('label');
  var whatLabel = document.createElement('label');
  var nameLabel = document.createElement('label');
  var list = document.getElementById('waveList');
  
  nameLabel.innerHTML = file.name;

  whatInput = '<div class="custom-control custom-radio custom-control-inline">'+
  ' <input type="radio" class="custom-control-input" id="'+id+'WhatInput" name="'+id+'clip" value="What">'+
  ' <label class="custom-control-label" for="'+id+'WhatInput">What</label>'+
  '</div>';
  
  howInput = '<div class="custom-control custom-radio custom-control-inline">'+
  '<input type="radio" class="custom-control-input" id="'+id+'HowInput" name="'+id+'clip" value="How">'+
  '<label class="custom-control-label" for="'+id+'HowInput">How</label>'+
  '</div>';

  whyInput = '<div class="custom-control custom-radio custom-control-inline">'+
  '<input type="radio" class="custom-control-input" id="'+id+'WhyInput" name="'+id+'clip" value="Why" checked="checked">'+
  '<label class="custom-control-label" for="'+id+'WhyInput">Why</label>'+
  '</div>';



  whyInput.checked = true;
  clipForm.setAttribute("id",id+"method")
  clipForm.setAttribute("name",url)

  nameLabel.setAttribute("style","text-align: left; display: block;")

  clipForm.appendChild(nameLabel);

  if(controlClip(list,"How") == 1){
    clipForm.innerHTML += howInput;
  }
  clipForm.innerHTML += whyInput;

  if(controlClip(list,"What") == 1){
    clipForm.innerHTML += whatInput;
  }

  $('#typeAudioSelectBody').append(clipForm);
  $('#typeAudioSelect').modal();
}



$('#files').on('input',async function() {
      var files = document.querySelector('#files').files;
      document.getElementById("typeAudioSelectBody").style = "";
      for(var index in files ){
        var file = files[index];
        loadFile(file);
        }
    });



async function loadFile(file){
  if(file instanceof File){
  var reader = new FileReader();
  var fileSize = file.size;
  reader.onload = await function(e) {
    if (file.type == "audio/mp3") {
        var audioElement = document.createElement('audio');
        audioElement.src = e.target.result;
        var timer = setInterval(function() {
          if (audioElement.readyState === 4) {
              clearInterval(timer);
              var id = file.name.split(".");
              var url = URL.createObjectURL(file);
              if(checkExistence(id[0]) == undefined) loadModal(file,id[0],url);
			  else {
				  alert("Attenzione! La clip: " + file.name + " esiste già.")
				  document.getElementById('typeAudioSelectBody').innerHTML = "";
				  document.getElementById("uploadForm").reset();
              }
          }
        }, 500);
      }
      else{
		alert("Error! Invalid audio file.\n Please select only .mp3 file")
	  }
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      alert('nofile');
    }
  }
}


  $('#upload').on("click", function(){
	prepareAudio();
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

function handler(e){
	if(handling == 0) return;
    e.stopPropagation()
}

async function  prepareAudio(){
	if($("#titleName").val() == "") {
		alert("Attenzione inserire il nome del POI!");
		return;
	};
	$("#title").toggle();
    var checkedValue = null,index,cont = 0;
    var inputElements = document.getElementsByClassName('my-class');
    toServer = [];
    for(var i=0; inputElements[i]; i++){
          if(inputElements[i].checked){
               checkedValue = inputElements[i].id;
               checkedValue = checkedValue.replace("Input", "")
            
               index = controlStruct(checkedValue);
              /* if(checkedValue.includes('Why') && $("#Detail"+item.name).val() == 1) {
				   $.ajax({
						url: "/getDuration?name="+struct[index].id+'&id='+profile.getId(), 
						method: "GET",
						processData: false,
						contentType: false,
						success: function(data){
							if(data == 1){
								alert('Le clip Why con Dettaglio 1 non possono durare più di 15 secondi!');
							}
						}
				})
				   
			   }*/
               toServer[cont] = {}
               toServer[cont].blob = struct[index].blob;
               toServer[cont].name = struct[index].id;
               cont++;
			   
          }
    }
    length = cont;
    if(cont == 0) return;
    $("#waveList").hide();
	$("#spinnerAudio").show();
	$("#spinnerBorderAudio").show();
    handling = 1;
    await uploadAjax();
    mode = 0;
    cancelDir();
}

function getFilterText(item){
	var filterText = "";
	var contentTable = $("#Content"+item.name);
    var audienceTable = $("#Audience"+item.name);
    var audienceVal = $("#Audience"+item.name).val();
    var contentVal = $("#Content"+item.name).val();
    var languageVal = $("#Language"+item.name).val();
    var languageTable = $("#Language"+item.name);
    var detailText = $("#Detail"+item.name).val();
    var contentText = "";
    var audienceText = "";
    var languageText = ""; 
    for(var index in contentVal){
       contentText+= contentTable[0][contentVal[index]].id + "-";
    }
    if(contentText == "") contentText = "nonee";
    contentText = contentText.substring(0,contentText.length-1);
    
    
    try{
		audienceText+= audienceTable[0][audienceVal].id;
		if(audienceText == "") audienceText = "ita";
	}
	catch{
		audienceText = "gen";
	}
    try{
		languageText = languageTable[0][languageVal].id;
		if(languageText == "") languageText = "ita";
	}
	catch{
		languageText = "ita";
	}
    if(detailText == "" || detailText < 1) detailText = "1";
    
    filterText += languageText+":"+contentText+":"+"A"+audienceText+":P"+detailText;
    //console.log(filterText);
    return filterText;
    	
}


function uploadAjax(){
  return new Promise(async (resolve,reject) => {
    toServer.forEach(function (item, ind, array) {
      var fd = new FormData(),filterText="";
      fd.append("fname",item.name);
      fd.append("file",item.blob);
      fd.append("id",profile.getId());
      fd.append("etime",etime[item.name + "_wave"]);
      fd.append("title",$("#titleName").val());
      fd.append("token",token);
      fd.append("refresh",refresh);
	  filterText += OpenLocationCode.encode(latx,lonx,4)+"-";
	  filterText += OpenLocationCode.encode(latx,lonx,6)+"-";
	  filterText += OpenLocationCode.encode(latx,lonx)+":";
	  //add type of clip
	  if(item.name.includes("How")) filterText += "how:"
	  else if(item.name.includes("What")) filterText += "what:"
	  else filterText += "why:";
      filterText += getFilterText(item);
      fd.append("desc",filterText);
       $.ajax({
         url: "/uploadFile", //Need to adapt for audio in input
         method: "POST",
         data:fd,
         processData: false,
         contentType: false
       }).done(function(data) {
         length--;
         console.log(data);
      });
    })
    resolve();
  })
}


function cancelDir(){
    var timer = null;
    if (length == 0) {
	  clearTimeout(timer);
	  handling = 0;
      if(mode == 0){
		  $("#spinnerAudio").hide();
		  $("#spinnerBorderAudio").hide();
		  resetForm(1);
		  alert("Upload Finito");
	  }
	  
	  $("#uploadModal").modal('hide');
      var fd = new FormData();
      fd.append("id",profile.getId());
      $.ajax({
        url: "/removeDir?id="+profile.getId(),
        method: "POST",
        processData: false,
        contentType: false
      })
    }
    else{
        timer = setTimeout(cancelDir, 1000);
    }
  }
