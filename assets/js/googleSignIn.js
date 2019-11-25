var profile = null;

function onSignIn(googleUser) {
  profile = googleUser.getBasicProfile();
  window.localStorage.removeItem('check');
  window.localStorage.setItem('check', true);
  if ("http://localhost:8000/profile.html" == window.location.href || "http://localhost:8000/profile.html#" == window.location.href) {
    $('#loginModal').modal('hide');
    $("h4").html("");
    $("h4").html(profile.getName());
    $("#email").html("");
    $("#email").html("Email: " + profile.getEmail());
    $(".rounded-circle").attr("src", profile.getImageUrl());
    $(".spinner-border").remove();
    $("#spinner").remove();
    $("#display").show();
    
    getReview(profile.getName());
  }
  if ("http://localhost:8000/" == window.location.href || "http://localhost:8000/index.html" == window.location.href) {
    $('#loginModal').modal('hide');
    $('#profile').show();
    $('#profile > a').html(profile.getName());
    $('#logout').show();
    $('#logbtn').hide();
    $('.close').click();
  }
  if ("http://localhost:8000/editorMode.html" == window.location.href || "http://localhost:8000/editorMode.html/" == window.location.href || "http://localhost:8000/editorMode.html#" == window.location.href) {
      $("#profileText").html(profile.getName());
      $('#loginModal').modal('hide');
      createMap();
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

function getLog() {
  if (window.localStorage.getItem('check') == null) {
    $('#loginModal').modal({ backdrop: 'static', keyboard: false })
  }
}
