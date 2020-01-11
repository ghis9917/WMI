var x,c, prova = 0, cont_why = 0, timeout = 15000, edit, time, url,stime,etime, wavesurfer = [];


      function controlClip(list,radioValue){
        var clicked = 1;
        var children = list.childNodes;
        for (var i = 0; i < children.length; i++) {
          if(!children[i].id.includes('Why')){
            if(children[i].id.includes(radioValue)) {
                clicked = 0;
            }
          }
        }
        return clicked;
      }
  $(document).ready(function () {

    function disable(boolean){
      var why = document.getElementById("why");
      var how = document.getElementById("how");
      var what = document.getElementById("what");
      if(boolean) {
        why.disabled = true;
        how.disabled = true;
        what.disabled = true;
      }
      else{
        why.disabled = false;
        how.disabled = false;
        what.disabled = false;
      }
    }

    function closetimer(){
      clearTimeout(x) ;
    }


    function set_recording(rec){
      recordButton.disabled = false;
      stopButton.disabled = true;
    }

    function set_stop(rec){
      stopButton.disabled = false;
      clearTimeout(c);
    }

    function stop_recording(rec){
      try{
        rec.stop();
        recordButton.disabled = false;
        stopButton.disabled = true;
        clearTimeout(x);
        disable(0);
      }
      catch{
        //Some error
      }
    }

    function createReg(radioValue,rec){
      var z,c;
      recordButton.disabled = true;
      stopButton.disabled = false;
      disable(1);
      audioChunks = [];
      rec.start();
      if(radioValue == 'How'){
        stopButton.disabled = true;
        c = setTimeout(function(){
          set_stop(rec)
        }, timeout)
        x = setTimeout(function(){
          stop_recording(rec)
        }, timeout*2)
      }
      else{
        stopButton.disabled = false;
        x = setTimeout(function(){
          stop_recording(rec)
        }, timeout)
      }
    }



    navigator.mediaDevices.getUserMedia({audio : true})
    .then(stream => {handlerFunction(stream)})

    function handlerFunction(stream) {
      a = document.createElement('a');
      rec = new MediaRecorder(stream);
      rec.ondataavailable = e => {
        audioChunks.push(e.data);
        if (rec.state == "inactive"){
          let blob = new Blob(audioChunks,{type:'audio/mp3'});
          url = URL.createObjectURL(blob);
          waveList.src=url;
          sendData(blob)
        }
      }
    }

    function sendData(data) {
      var url = URL.createObjectURL(data);
      var li = document.createElement('li');
      var label = document.createElement('label');
      var trash = document.createElement('span');
      var cut = document.createElement('span');
      var div =  document.createElement('div');
      var input =  document.createElement('input');

      var c = document.getElementById("waveList");
      var radioValue = $("input[name='clip']:checked").val();
      var id = radioValue + cont_why;

      label.innerHTML = radioValue + '.mp3';
      if(radioValue == "Why"){
        if(cont_why == 0){
          trash.setAttribute('id',radioValue+"_trash");
          cut.setAttribute('id', radioValue+ '_cut');

          div.setAttribute('id', radioValue + '_wave');

        }
        else{
          label.innerHTML = id + '.mp3';

          trash.setAttribute('id', id+"_trash");
          cut.setAttribute('id', id+ '_cut');

          div.setAttribute('id', id + '_wave');
        }
      }
      else {

        trash.setAttribute('id', radioValue+"_trash");
        cut.setAttribute('id', radioValue+ '_cut');

        div.setAttribute('id', radioValue + '_wave');

      }
      trash.setAttribute('class', "oi oi-trash");
      trash.setAttribute('onclick', "remove(id)");
      trash.setAttribute('style', "width:100%; text-align:right;position: relative;right:0px;color:red;");
      cut.setAttribute('class', "glyphicon glyphicon-pencil");
      cut.setAttribute('onclick', "edit(this.id,1)");
      cut.setAttribute('style', "width:100%; text-align:left; position: relative;left:50px;");

      input.setAttribute('class', "toUpload");
      input.setAttribute('id', radioValue);
      input.setAttribute('type',"checkbox")
      //add the new audio and a elements to the li element
      li.appendChild(label);
      li.appendChild(trash);
      li.appendChild(cut);
      li.appendChild(div);
      li.appendChild(input);
      li.appendChild(document.createElement('br'));
      //add the li element to the ordered list
      waveList.appendChild(li);

      if (c.hasChildNodes()) {
        var children = c.childNodes;
        if(radioValue == "Why"){
          if(cont_why == 0){
            children[children.length-1].id = radioValue + "_list";
            }
          else{
            children[children.length-1].id = id + "_list";
          }
          cont_why = cont_why + 1;
        }
        else children[children.length-1].id = radioValue + "_list";
      }
      struct.push({
        blob : data,
        id : radioValue
      });
      var fd = new FormData();

      fd.append('fname', "Origin"+label.innerHTML);
      fd.append('file', data);
      fd.append('id',profile.getId());
      $.ajax({
        url: "/cutAudio", //Need to adapt for audio in input
        method: "POST",
        data: fd,
        processData: false,
        contentType: false
      })
      loadWave(div.id,url)
      var text ='<label>Content</label>'+
        '<select id="Content'+radioValue+'" multiple="multiple">'+
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

        ' <select id="Audience'+radioValue+'" multiple="multiple">'+
        '   <option value="1" selected>pubblico generico</option>'+
        '   <option value="2">pre-scuola</option>'+
        '   <option value="3">scuola primaria</option>'+
        '   <option value="4">scuola media</option>'+
        '   <option value="5">specialisti del settore</option>'+
        ' </select>'
        $("#"+li.id).append(text);
        $("#Content"+radioValue).multiselect({
          hideOptgroupCheckboxes:true
          });
        $("#Audience"+radioValue).multiselect({
          hideOptgroupCheckboxes:true
        });

    }

    function check(){
      var c = document.getElementById("waveList");
      var x = document.getElementById("description");
      var one = 0;
      var why = 0, how = 0, what = 0;
      if(x.value != "" && x.value != "Input Description Here..."){
        one = 1;
      }
      else{
        alert("You need to write a description!");
      }
      if (c.hasChildNodes()) {
        var children = c.childNodes;
        for (var i = 0; i < children.length; i++) {
          if(children[i].id == 'Why'){
              why = 1;
            }
            else if(children[i].id == 'How'){
              how = 1;
            }
            else if(children[i].id == 'What'){
              what = 1;
            }
            if(why && how && what){
              break;
            }
        }
      }
      if(!why) alert("Missing why recorder");
      if(!how) alert("Missing how recorder");
      if(!what) alert("Missing what recorder");
      if(why && how && what && one){
        prova = 1;
      }
    }

    //Button action
    recordButton.onclick = e => {
      var clicked = 1;
      var radioValue = $("input[name='clip']:checked").val();
      var list = document.getElementById("waveList");
      if (list.hasChildNodes()) {
        if(controlClip(list,radioValue) == 1) createReg(radioValue, rec);
        else alert("Puoi avere una sola clip di tipo " + radioValue )

      }
      else{
        createReg(radioValue, rec);
      }

      clicked = 1;
    }

    stopButton.onclick = e => {
      stop_recording(rec);
      var button = document.getElementById("methode");
      button.disabled = false;
    }

    // uploa.onclick = e => {
    //   check();
    //   if(prova) alert("Good job");
    //   prova = 0;
    // }
  });
