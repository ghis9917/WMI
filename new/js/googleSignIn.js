var profile;
function onSignIn(googleUser) {
     profile = googleUser.getBasicProfile();
     if("http://localhost:8000/profile.html#" == window. location. href){
       $("h3").html("");
       $("h3").html(profile.getName());
       $("#mail").html("");
       $("#mail").html(profile.getEmail());
       $(".rounded-circle").attr("src",profile.getImageUrl());
     }
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
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
