
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
      var button = document.createElement('button');
      var div =  document.createElement('div');
      var c = document.getElementById("waveList");
      var radioValue = $("input[name='clip']:checked").val();
      var id = radioValue + cont_why;

      label.innerHTML = radioValue + '.mp3';
      if(radioValue == "Why"){
        if(cont_why == 0){
          trash.setAttribute('id',radioValue+"_trash");
          button.setAttribute('id', radioValue+"_cut");

          div.setAttribute('id', radioValue + '_wave');

        }
        else{
          label.innerHTML = id + '.mp3';

          trash.setAttribute('id', id+"_trash");
          button.setAttribute('id', id+"_cut");

          div.setAttribute('id', id + '_wave');
        }
      }
      else {

        trash.setAttribute('id', radioValue+"_trash");
        button.setAttribute('id',radioValue+"_cut");

        div.setAttribute('id', radioValue + '_wave');

      }
      trash.setAttribute('class', "oi oi-trash");
      trash.setAttribute('onclick', "remove(id)");
      trash.setAttribute('style', "width:100%; text-align:right;position: relative;right:0px;color:red;");
      button.setAttribute('onclick', "edit(id)");
      button.setAttribute('style', "width:100%;position: relative;right:0px;color:red;");
      button.innerHTML = "Cut";


      //add the new audio and a elements to the li element
      li.appendChild(label);
      li.appendChild(trash);
      div.appendChild(button);
      li.appendChild(div);
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

      loadWave(div.id,url)

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
