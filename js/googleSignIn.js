var profile;
function onSignIn(googleUser) {
     profile = googleUser.getBasicProfile();
     console.log(profile);
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
