function getVideoId(poi) {
  var search = "";
  search += OpenLocationCode.encode(
    poi.coords.latitudeCenter,
    poi.coords.longitudeCenter,
    4
  );
  search += OpenLocationCode.encode(
    poi.coords.latitudeCenter,
    poi.coords.longitudeCenter,
    6
  );
  search += OpenLocationCode.encode(
    poi.coords.latitudeCenter,
    poi.coords.longitudeCenter
  );
  searchByKeyword(search);
}

function searchByKeyword(query) {
  console.log("search keyword");
  $.ajax({
    type: "GET",
    url: "https://www.googleapis.com/youtube/v3/search",
    data: {
      key: "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI",
      q: query,
      part: "snippet",
      maxResults: 50,
      type: "video",
      videoEmbeddable: true
    },
    success: function(data) {
      console.log(data);
      var item = data["items"];
      var iframe;
      var iCont = document.getElementById("iframeContainer");
      for (video in item) {
        var audio_tag = document.createElement("audio");
        videoId = item[video].id.videoId;
        // iframe.src = "https://www.youtube.com/watch?v="+videoId;
        // iframe.controls = true;
        // iframe.width="0";
        // iframe.height="0";
        // iframe.frameborder="0";
        // $("#iframeContainer").append(iframe)
        onYouTubeIframeAPIReady(videoId);
      }
      var div = document.getElementById("clipContainer");
      div.hidden = false;
    },
    error: function(response) {
      console.log("Request Failed");
    }
  });
}

function onYouTubeIframeAPIReady(videoId) {
  var e = document.getElementById("iframeContainer"),
    t = document.createElement("img");
  t.setAttribute("id", "youtube-icon" + videoId);
  t.style.cssText = "cursor:pointer;cursor:hand";
  e.appendChild(t);
  var a = document.createElement("div");
  a.setAttribute("id", "youtube-player" + videoId), e.appendChild(a);
  var o = function(e) {
    var a = e ? "IDzX9gL.png" : "quyUPXN.png";
    t.setAttribute("src", "https://i.imgur.com/" + a);
  };
  var r = new YT.Player("youtube-player" + videoId, {
    height: "0",
    width: "0",
    videoId: videoId,
    playerVars: { autoplay: e.dataset.autoplay, loop: e.dataset.loop },
    events: {
      onReady: function(e) {
        r.setPlaybackQuality("small"),
          o(r.getPlayerState() !== YT.PlayerState.CUED);
      },
      onStateChange: function(e) {
        e.data === YT.PlayerState.ENDED && o(!1);
      }
    }
  });
  e.onclick = function() {
    console.log("player");
    console.log(r);
    r.getPlayerState() === YT.PlayerState.PLAYING ||
    r.getPlayerState() === YT.PlayerState.BUFFERING
      ? (r.pauseVideo(), o(!1))
      : (r.playVideo(), o(!0));
  };
}
