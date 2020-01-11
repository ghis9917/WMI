var profile = null;
var token, refresh;
function onSignIn(googleUser) {
  token = googleUser["Zi"].access_token;
  refresh = googleUser["Zi"].id_token;
  profile = googleUser.getBasicProfile();
  $.ajax({
    url: "/saveToken?token=" + token + "&refresh=" + refresh,
    type: "post",
    success: function(data) {},
    error: function(err) {
      console.log(err);
    }
  });

  window.localStorage.removeItem("check");
  window.localStorage.setItem("check", true);
  if (
    "https://localhost:8000/profile.html" == window.location.href ||
    "https://localhost:8000/profile.html#" == window.location.href
  ) {
    $("#loginModal").modal("hide");
    $("h4").html("");
    $("h4").html(profile.getName());
    $("#email").html("");
    $("#email").html("Email: " + profile.getEmail());
    $(".rounded-circle").attr("src", profile.getImageUrl());
    $(".spinner-border").remove();
    $("#spinner").remove();
    $("#display").show();
    getProfileReview();
  }
  if (
    "https://localhost:8000/" == window.location.href ||
    "https://localhost:8000/index.html" == window.location.href
  ) {
    $("#loginModal").modal("hide");
    $("#profile").show();
    $("#profile > a").html(profile.getName());
    $("#logout").show();
    $("#logbtn").hide();
    $(".close").click();
  }
  if (
    "https://localhost:8000/editorMode.html" == window.location.href ||
    "https://localhost:8000/editorMode.html/" == window.location.href ||
    "https://localhost:8000/editorMode.html#" == window.location.href
  ) {
    $("#profileText").html(profile.getName());
    $("#loginModal").modal("hide");
    createMap();
  }
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    console.log("User signed out.");
    window.localStorage.removeItem("check");
    url = "https://localhost:8000/";
    window.open(url, "_self");
  });
}

function getLog() {
  if (window.localStorage.getItem("check") == null) {
    $("#loginModal").modal({ backdrop: "static", keyboard: false });
  }
}
