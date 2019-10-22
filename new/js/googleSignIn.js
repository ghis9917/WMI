var profile = null;

function onSignIn(googleUser) {
    profile = googleUser.getBasicProfile();
      window.localStorage.removeItem('check');
      window.localStorage.setItem('check', true);
      console.log("ma vabbe");
     if("http://localhost:8000/profile.html" == window. location. href){
       console.log("ma vabbe2");
       $('#loginModal').modal('hide');
       $("h3").html("");
       $("h3").html(profile.getName());
       $("#mail").html("");
       $("#mail").html(profile.getEmail());
       $(".rounded-circle").attr("src",profile.getImageUrl());
       $(".spinner-border").remove();
       $("#spinner").remove();
       $("#display").show();
     }
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
       window.localStorage.removeItem('check');
       url = "http://localhost:8000/";
       window.open(url, "_self");
    });
}

function getLog(){
  if(window.localStorage.getItem('check') == null){
    $('#loginModal').modal({backdrop: 'static', keyboard: false})
  }
}




function getGoogleEmail(){
  return profile.getEmail();
}

function getGoogleUrl(){
  return profile.getImageUrl();
}

function getGoogleName(){
  return profile.getName();
}

function getGoogleId(){
  return profile.getId();
}
