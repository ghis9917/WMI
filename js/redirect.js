var API_KEY = "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI";
// var localStorage;
function getPOIVideo(q)

{
  console.log(q);
  $.ajax({
      type: "GET",
      url:"https://www.googleapis.com/youtube/v3/search?part=snippet&q="+q+"&key="+API_KEY,

      success: function (data) {

        console.log(data.items);
        console.log("DA AJAX: " + data.items[0].id.videoId )
        return data.items[0].id.videoId;


      },
      error: function (error) {
        console.log(error);
      },

    });

  }

$(document).ready(function(){


    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const redirect_uri = "https://localhost:8000/userMode.html" // replace with your redirect_uri;
    const client_secret = "tYsMp94ttKq9mpx9NLVZybRI"; // replace with your client secret
    const scope = "https://www.googleapis.com/auth/youtube";
    var client_id = "114712511052-o00pbvnd01mt0jfl946p61k2vtjfk6m8.apps.googleusercontent.com";// replace it with your client id
    var playlist;
    var playlistId;
    var channelId;
    var username;
    var search;
    var playlistId;
})
