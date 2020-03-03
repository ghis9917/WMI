const maxKey = "AIzaSyAin9iPCpvqsNVWEVtsJhpUemBcoIWFGbo";
const guiKey = "AIzaSyBFXSS4CBQKDc8yJtAdEruvXgAEHNwg8ko";
const rickyKey = "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI";
const rickykey_second = "AIzaSyB5PLURpl92Ix6gBHvgBMJ9s1JC7m69b2c";
var first = true;
var speecIstance = window.speechSynthesis;

function checkFiltersPOI(filter, description) {
  for (var i in filter) {
    if (!description.includes(filter[i])) return false;
  }
  return true;
}

function getFilters(valori) {
  var languageSelector = $("#language");
  valori +=
    languageSelector[0].selectedOptions[0].text.toLowerCase() == "default"
      ? " "
      : " " + languageSelector[0].selectedOptions[0].text.toLowerCase();

  var contentSelector = $("#content");
  if (contentSelector[0].selectedOptions.length > 0) {
    for (var selection in contentSelector[0].selectedOptions) {
      if (isNumber(selection)) {
        valori +=
          " " + contentSelector[0].selectedOptions[selection].value + " ";
      }
    }
  }

  var audienceSelector = $("#audience");
  if (audienceSelector[0].selectedOptions.length > 0) {
    for (var selection in audienceSelector[0].selectedOptions) {
      if (isNumber(selection)) {
        valori +=
          " A" + contentSelector[0].audienceSelector[selection].value + " ";
      }
    }
  }

  var detailSelector = $("#detail");
  valori +=
    detailSelector[0].selectedOptions[0].text.toLowerCase() == "default"
      ? " "
      : " P" + detailSelector[0].selectedOptions[0].text.toLowerCase();

  return valori;
}

function getVideoId(poi,mode) {
  var search = "";
  $("#infoTitolo").text(poi.name.toString());
  if (poi.img !== "NF") {
    $("#imgOnLocation").attr("src", poi.img);
    $("#imgOnLocation").show();
  } else {
    $("#imgOnLocation").attr("src", "");
    $("#imgOnLocation").hide();
  }
  if (poi.description.en !== "NOT FOUND") {
    var languageSelector = $("#language");
    var c = languageSelector[0].selectedOptions[0].text.toLowerCase().substring(0, languageSelector[0].selectedOptions[0].text.toLowerCase().length - 1)

    for (var s in poi.description) {
      if (s == c) {
        $("#descriptionOnLocation").text(poi.description[s]);
        $("#descriptionOnLocation").show();
      }
    }

  } else {
    $("#descriptionOnLocation").text("");
    $("#descriptionOnLocation").hide();
  }
  if (poi.img !== "NF" || poi.description.en !== "NOT FOUND") {
    $("#dividerOnLocation").show();
  } else {
    $("#dividerOnLocation").hide();
  }
  clearClipModal(mode);
  for (var el in poi.videoId) searchByKeyword(poi.videoId[el]);
}

function searchByKeyword(query) {
  $.ajax({
    type: "GET",
    url: "https://www.googleapis.com/youtube/v3/videos",
    data: {
      key: "AIzaSyCAXQP_4KlAztXqWzAOvjv7Pa7DWIUb42U",
      id: query,
      part: "snippet",
      maxResults: 50,
      type: "video",
      videoEmbeddable: true
    },
    success: function (data) {
      console.log(data);
      var item = data["items"];
      var iframe;
      //var iCont = document.getElementById("iframeContainer");
      first = true;
      for (video in item) {
        var audio_tag = document.createElement("audio");
        videoId = item[video].id;
        // iframe.src = "https://www.youtube.com/watch?v="+videoId;
        // iframe.controls = true;
        // iframe.width="0";
        // iframe.height="0";
        // iframe.frameborder="0";
        // $("#iframeContainer").append(iframe)
        onYouTubeIframeAPIReady(videoId, item[video].snippet.title, item[video].snippet.description, item[video].snippet.channelTitle);
      }
      var div = document.getElementById("clipContainer");
      div.hidden = false;
      $('#reviewContainer').hide();
      $('#iframeContainerWHAT').show();
      $('#iframeContainerHOW').show();
      $('#iframeContainerWHY').show();

      setCSSAttribute("#popupContainer", {
        "z-index": "-1",
        height: "0px"
      });
      $("#upDown").attr("class", "fa fa-angle-up d-flex");
      infoPopupState = "open";
      if (data["items"].length == 0) {
        console.log("nessunvideo")
        //$("#iframeContainer").append("<p id='cliperror'>Unable to load any clip</p>");
      }
    },
    error: function (response) {
      console.log("Request Failed");
    }
  });
}

function getTypeOfVideo(d) {
  var der = d.split(":");
  var motivo = "";
  for (var n in der) {
    if (der[n] == "why") {
      motivo = "why";
    } else if (der[n] == "how") {
      motivo = "how";
    } else if (der[n] == "what") {
      motivo = "what";
    } else if (der[n] == "who") {
      motivo = "why";
    }
  }
  return motivo
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var playerYT;
function onYouTubeIframeAPIReady(videoId, titolo, descrizione, channelTitle) {
  if (videoId == undefined) {
    return;
  }
  var motivo = getTypeOfVideo(descrizione);
  if(motivo == ""){
    return;
  }
  $("#h6"+motivo).show();
  $("#iframeContainer"+motivo.toUpperCase()).show();
  $("#iframeContainer"+motivo.toUpperCase() + " + hr").show();
  var der = descrizione.split(":");
  var filterOrigin = '';
  filterOrigin = getFilters(filterOrigin);
  var filter = filterOrigin.split(' ');
  if (checkFiltersPOI(filter, descrizione)) {

    if (first == false) {
      $("#iframeContainer" + motivo.toUpperCase()).append(
        "<hr style='margin-top: 2em;'id='dividerOnLocation'>" +
        "<div style='margin-top: 1em;'>" +
        "<div>" +
        "<p style='margin-bottom:1em!important'>" +
        "<b>Utente: </b>" +
        channelTitle +
        " &nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp<b>Categoria: </b>" +
        motivo +
        "</p>" +
        "</div>" +
        "<div style='margin:0px!important;width: auto;'>" +
        "<div style='float:left;display: inline-block;width: auto;margin-left:4em;'>" +
        "<i id='controller" +
        videoId +
        "'class='fas fa-play' style='font-size: 30px;'>" +
        "</i>" +
        "</div>" +
        "<div style='float:right;display: inline-block; width: auto;margin-right:0.5em;'>" +
        "<button class='btn btn-outline-success' id='btn" +
        videoId +
        "' onclick='openReviewModal(this.id, " +
        '"' +
        channelTitle +
        '"' +
        ")'>Lascia un recensione</button>" +
        "</div>" +
        "</div>"
      );
    } else {
      first = false;
      $("#iframeContainer" + motivo.toUpperCase()).append(
        "<div>" +
        "<div>" +
        "<p style='margin-bottom:1em!important'>" +
        "<div style='margin-top: 1em;'>" +
        "<div>" +
        "<p style='margin-bottom:1em!important'>" +
        "<b>Utente: </b>" +
        channelTitle +
        "&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp<b>Categoria: </b>" +
        motivo +
        "</p>" +
        "</div>" +
        "<div style='margin:0px!important;width: auto;'>" +
        "<div style='float:left;display: inline-block;width: auto;margin-left:4em;'>" +
        "<i id='controller" +
        videoId + "'class='fas fa-play' style='font-size: 30px;'>" +
        "</i>" +
        "</div>" +
        "<div style='float:right;display: inline-block; width: auto;margin-right:0.5em;'>" +
        "<button class='btn btn-outline-success' id='btn" +
        videoId +
        "' onclick='openReviewModal(this.id, " +
        '"' +
        channelTitle +
        '"'
        + ")'>Lascia un recensione</button>" +
        "</div>" +
        "</div>"
      );
    }


    checkReviewStyle(videoId);
    var iFramer = document.createElement("div");
    iFramer.setAttribute("id", "player" + videoId);
    $("#controller" + videoId).on("click", function () {
      $("#controller" + videoId).attr("class", "fas fa-pause");

      var player = YT.get("player" + videoId);
      if (
        player.getPlayerState() == YT.PlayerState.ENDED ||
        player.getPlayerState() == YT.PlayerState.PAUSED ||
        player.getPlayerState() == -1 ||
        player.getPlayerState() == YT.PlayerState.CUED
      ) {
        speecIstance.cancel();
        stopOtherVideos(videoId);
        player.playVideo();
      } else {
        stopOtherVideos(player);
        $("#controller" + videoId).attr("class", "fas fa-play");
        player.pauseVideo();
      }
    });

    document.getElementById("iframeContainer" + motivo.toUpperCase()).appendChild(iFramer);

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
}

function stopOtherVideos(id) {
  var listOfPlayers = document.getElementsByTagName("iframe");
  for (element in listOfPlayers) {
    if (isNumber(element)) {
      if (
        listOfPlayers[element].id.includes("player") &&
        listOfPlayers[element].id.replace("player", "") != id
      ) {
        YT.get(listOfPlayers[element].id).stopVideo();
        $("#" + listOfPlayers[element].id.replace("player", "controller")).attr(
          "class",
          "fas fa-play"
        );
      }
    }
  }
}

function onPlayerReady(event) {
  //event.target.playVideo();
}

var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    $("#" + event.target.a.id.replace("player", "controller")).attr(
      "class",
      "fas fa-play"
    );
  } else if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
}
function stopVideo() {
  playerYT.stopVideo();
}

function clearClipModal(mode) {
  speecIstance.cancel();
  try { $("#cliperror").remove(); } catch (e) { }
  var div = document.getElementById("clipContainer");
  //div.hidden = true;
  $("#iframeContainerWHAT").empty();
  $("#iframeContainerHOW").empty();
  $("#iframeContainerWHY").empty();
  $("#reviewContainer").hide();
  $("#iframeContainerWHAT" + " + hr").hide();
  $("#iframeContainerHOW" +" + hr").hide();
  $("#iframeContainerWHY" +" + hr" ).hide();
  $("#h6why").hide();
  $("#h6what").hide();
  $("#h6how").hide();
  if(mode == 1){
    actualRouting.splice(currentDestination, 1);

    if (actualRouting.length != 0) {
      routingTo(actualRouting[currentDestination]);
      greenMarker(actualRouting[currentDestination]);
      popupIndex = actualRouting[currentDestination];
    } else{

      customdirectionsButton.state("start");
      currentDestination = 0;
      calculateRouting();
      mymap.removeControl(control);
      control = null;
      showCloseInfo();
      infoPopupState = "open";
      actualRouting = [];
    }
  }
}

function startRoutingFromModal() {
  control = null;
  addRouting();
  actualRouting = [];
  actualRouting.push(popupIndex)
  currentPOI = popupIndex;
  console.log(control.getWaypoints());
  routingTo(popupIndex);
  customdirectionsButton.state("started");
}
