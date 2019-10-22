var profile = null;

function onSignIn(googleUser) {
    profile = googleUser.getBasicProfile();
      window.localStorage.removeItem('check');
      window.localStorage.setItem('check', true);
     if("http://localhost:8000/profile.html#" == window. location. href){
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
    });
}

function getLog(){
  if(window.localStorage.getItem('check') == null){
    $("#myModal").modal();
  }else{
    alert("sei loggato");

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
