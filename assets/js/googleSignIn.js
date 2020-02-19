
var profile = null; var token,length,refresh,google; 
$(document).ready(function () {
			getLog();
});

function onSignIn(googleUser) {
  google = googleUser;
  checkToken();
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    window.localStorage.removeItem('check');
    url = "/";
    window.open(url, "_self");
  });
}
function getLog() {
	if (window.localStorage.getItem('check') == null) {
		if(window.location.href.includes("editorMode")) $('#loginModalEditor').modal({ backdrop: 'static', keyboard: false })
		else if(window.location.href.includes("profile")) $('#loginModalProfile').modal({ backdrop: 'static', keyboard: false })
	}
}

function checkToken(){
  if(profile !== null){
    $.ajax({
      url: "/saveToken?token="+token+"&refresh="+refresh+"&id="+profile.getId(),
      type:"post",
      success: function (data){
		console.log(data);
      },
      error: function (err){
        console.log(err);
      }
    });
    window.localStorage.removeItem("check");
    window.localStorage.setItem("check", true);
    if(window.location.href.includes("profile")){
		$('#loginModalProfile').modal('hide');
		$("#nameFrame").html("");
		$("#nameFrame").html(profile.getName());
		$("#email").html("");
		$("#email").html("Email: " + profile.getEmail());
		$("#imageProfile").attr("src", profile.getImageUrl());
		getProfileReview();		
	}
	else if(window.location.href.includes("editorMode")){
		
		$(".spinner-border").hide();
		$("#spinner").hide();
		$("#loginModalEditor").modal("hide");
		$("#profile").show();
		$("#profile > a").html(profile.getName());
		$("#logout").show();
		$("#logbtn").hide();
		length = 0; 
		cancelDir(1);
		createEditorMap();
		loadMarker();
	}
	else if(window.location.href.includes("userMode")){
		$('#LoginRequired').hide();
		$('#profile').show();
		$('#profile > a').html(profile.getName());
		$('#logout').show();
		$('#logbtn').hide();
		$('#reviewContainer').show();	
	}
	else {
		$(".spinner-border").remove();
		$("#spinner").remove();
		$('#loginModal').modal('hide');
		$('#profile').show();
		$('#profile > a').html(profile.getName());
		$('#logout').show();
		$('#logbtn').hide();
		$('.close').click();
	}
  }
  else{
	console.log('token undefined')
    try{
		profile = google.getBasicProfile();
	  window.localStorage.removeItem('check');
      window.localStorage.setItem('check', profile);
      
      for(var key in google){
          for(var item in google[key]){
              if(item == "id_token"){
                 token = google[key].access_token;
                 refresh = google[key].id_token;
                 break;
              }
          }
      }
   }
   catch(err){}
   setTimeout(checkToken, 1000);
  }
}
function onFailure(error) {
      console.log(error);
}

function renderButton() {
	console.log('in render button')
	var id ='google-signin2';
	if(window.location.href.includes("editorMode")) id = 'google-signin3';
	
      gapi.signin2.render(id, {
        'scope': 'profile email https://www.googleapis.com/auth/youtube.upload',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSignIn,
        'onfailure': onFailure
      });
    }
