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
  $.ajax({
    type: "GET",
    url: "https://www.googleapis.com/youtube/v3/search",
    data: {
      key: "AIzaSyB5PLURpl92Ix6gBHvgBMJ9s1JC7m69b2c",
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
        console.log(item[video].snippet.title)
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

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var playerYT;
function onYouTubeIframeAPIReady(videoId) {
  if (videoId == undefined) {
    console.log("undefined videoId");
    return;
  }


  $("#iframeContainer").append("<div class='d-flex'><div class='d-flex justify-content-center align-items-center' style='  width: 25%;'>  <i id='controller"+videoId+" 'class='fas fa-play' style='font-size: 30px;'></i></div><div class='d-flex flex-row justify-content-between' style='  width: 75%;'><div><p>Titolo</p><p>Tipo di audio</p></div><div class='d-flex flex-column justify-content-end align-items-end'><p class='d-md-flex justify-content-md-end'>Media recensioni</p><p class='d-md-flex justify-content-md-end'><button  onclick='openReviewModal()'>Leave a review</button></p></div></div></div>");


  var iFramer = document.createElement("div");
  iFramer.setAttribute("id", "player" + videoId);
  $("#controller"+videoId).on("click" , function() {


    $("#controller"+videoId).attr("class", "fas fa-pause");

    var player = YT.get("player" + videoId);
    console.log(player.getPlayerState());
    if (player.getPlayerState() == YT.PlayerState.ENDED || player.getPlayerState() == YT.PlayerState.PAUSED || player.getPlayerState() == -1 ||player.getPlayerState() == YT.PlayerState.CUED) {

      stopOtherVideos(videoId);
      player.playVideo();
    } else {
      stopOtherVideos(player);
      $("#controller"+videoId).attr("class", "fas fa-play");
      player.pauseVideo();
    }
  });

  document.getElementById("iframeContainer").appendChild(iFramer);


  playerYT = new YT.Player("player" + videoId, {
    height: "0",
    width: "0",
    videoId: videoId.toString(),
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function stopOtherVideos(id) {
  var listOfPlayers = document.getElementsByTagName("iframe");
  console.log(listOfPlayers);
  for (element in listOfPlayers) {
    if (isNumber(element)) {
      if (
        listOfPlayers[element].id.includes("player") &&
        listOfPlayers[element].id.replace("player", "") != id
      ) {
        YT.get(listOfPlayers[element].id).stopVideo();
        console.log(listOfPlayers[element].id);
        $("#"+(listOfPlayers[element].id).replace("player", "controller") ).attr("class", "fas fa-play");
      }
    }
  }
}

function onPlayerReady(event) {
  //event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
}
function stopVideo() {
  playerYT.stopVideo();
}


function clearClipModal(){
  var div = document.getElementById('clipContainer');
  div.hidden = true;
  $("#iframeContainer").empty();
}

/*function onYouTubeIframeAPIReady(videoId) {
  if (typeof null == undefined) {
    return;
  }
  var e = document.getElementById("iframeContainer");
  var t = document.createElement("img");
  var a = document.createElement("div");
  t.setAttribute("id", "youtube-icon" + videoId);
  t.style.cssText = "cursor:hand";
  e.appendChild(t);
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
  // 2. This code loads the IFrame Player API code asynchronously.
}*/
