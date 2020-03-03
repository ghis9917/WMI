var direction=null;
var langue = null;
function getIconMarkerOfColor(color) {
  return new L.Icon({
    iconUrl: color,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

function setGeolocationApiKey() {
  $("#btn-load").click(function() {
    callGeoLocationApi();
  });
  this.placesAutocomplete = places({
    appId: "plTCO8O9NAP7",
    apiKey: "a5c7d70d42023f9e0afdfa6bac7a2634",
    container: document.querySelector("#addressInput")
  });
}

function callGeoLocationApi() {
	$(".ap-input").on("change paste keyup", function() {
			  console.log("ciao")
                $(".ap-input").css({ backgroundColor: "white" });
     });
  if ($("#addressInput").val() != "") {
    $.ajax({
      async: false,
      url:
        "https://api.opencagedata.com/geocode/v1/json?q=" +
        $("#addressInput").val() +
        "&key=4e6db93d236944d68db1551367316df5&language=it&pretty=1",
      success: result => {
        if (result.results.length != 0) {
          updateCurrentLocation(
            result.results[0].geometry.lat,
            result.results[0].geometry.lng
          );
          if (control !== null) {
            control.spliceWaypoints(0, 1, [
              result.results[0].geometry.lat,
              result.results[0].geometry.lng
            ]);
          }
          $("#noGeo").modal("toggle");
        } else {
          $(".ap-input").css({ backgroundColor: "red" });

        }
      },
      error: result => {
        $(".ap-input").css({ backgroundColor: "red" });
      }
    });
  } else {
    $(".ap-input").css({ backgroundColor: "red" });
  }
}

function updateCurrentLocation(lat, lon) {
  var popupCurrentLocation =
    '<p class="text-center" style="margin: 1em;">Sei qui!</p>';
  try {
    mymap.removeLayer(currentLocation);
    control.spliceWaypoints(0, 1, L.latLng(lat, lon));
  } catch (err) {}
  currentLocation = L.marker([lat, lon], {
    icon: getIconMarkerOfColor(redIcon)
  })
    .bindPopup(popupCurrentLocation)
    .addTo(mymap);
  updateCustomRoutingModal();
}

function createButton(label) {
  var btn = L.DomUtil.create("button", "#000000");
  btn.setAttribute("type", "button");
  btn.innerHTML = label;
  return btn;
}

function addPlayButton() {
  customdirectionsButton = L.easyButton({
    states: [
      newState("search", "fa-location-arrow", "Enter address", function(btn) {
        $("#noGeo").modal();
      }),
      newState("start", "fas fa-play", "Start routing to nearest POI", function(
        btn
      ) {
		speecIstance.cancel();
        createPlayer();
      }),
      newState("loading", "fas fa-spinner", "We are loading the POIs", function(
        btn
      ) {}),
      newState("started", "fas fa-pause", "Stop routing", function(btn) {
		speecIstance.cancel();
        for (poi in POIs) {
          POIs[poi].visited = false;
          blueMarker(poi);
        }
        actualRouting = [];
        updateCustomRoutingModal();
        currentDestination = 0;
        popupIndex = 0;
        mymap.removeControl(control);
        control = null;
        btn.state("start");
      })
    ]
  }).addTo(mymap);
}

function addFilterButton() {
  L.easyButton({
    states: [
      newState("search", "fa-filter", "Enter address", function(btn) {
        $("#filterModal").modal();
      })
    ]
  }).addTo(mymap);
}

function newState(name, icon, title, f) {
  return {
    stateName: name,
    icon: icon,
    title: title,
    onClick: f
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateCustomRoutingModal() {
  if (Object.keys(POIs).length !== 0) {
    updateList("B");
    updateList("A");
  }
}

function updateList(id) {
  var list = document.getElementById(id);
  var child = list.lastElementChild;
  while (child) {
    list.removeChild(child);
    child = list.lastElementChild;
  }
  var cont = 0,
    place = "";
  for (var poi in POIs) {
    if (
      (actualRouting.indexOf(poi) != -1) == (id == "A") &&
      !POIs[poi].visited
    ) {
      place +=
        "<div class='list-group-item'>" +
        "  <span class='glyphicon glyphicon-move' aria-hidden='true' id='" +
        poi +
        "' title='" +
        POIs[poi].name +
        "'></span>" +
        POIs[poi].name +
        "<span class='badge'>" +
        parseInt(
          L.latLng(
            POIs[poi].coords.latitudeCenter,
            POIs[poi].coords.longitudeCenter
          ).distanceTo(
            L.latLng(
              currentLocation.getLatLng().lat,
              currentLocation.getLatLng().lng
            )
          )
        ) +
        "</span>" +
        "</div>";
    }
    cont++;
  }
  $("#" + id).append(place);
}

function calculateRouting() {
  console.log('in calculate routingW');
  actualRouting = [];
  currentDestination = 0;
  blueMarker(popupIndex);
  var count = 0;
  var currentPOI = getFirstPOI();
  do {
    if (currentPOI != -1) {
      currentPOI = getNearestTo(
        POIs[currentPOI].coords.latitudeCenter,
        POIs[currentPOI].coords.longitudeCenter,
        currentPOI
      );
      count++;
    }
  } while (currentPOI != -1 && count < 50);
  popupIndex = actualRouting[currentDestination];
  populatePopup(actualRouting[currentDestination]);
  greenMarker(actualRouting[currentDestination]);
}

function getFirstPOI() {
  return getNearestTo(
    currentLocation.getLatLng().lat,
    currentLocation.getLatLng().lng,
    -1
  );
}

function getNearestTo(lat, lng, currentIndex) {
  var returnIndex = -1;
  var minimumDistance = 50000000;
  for (var place in POIs) {
    var distanceFromPlaceToLatLng = L.latLng(lat, lng).distanceTo(
      L.latLng(
        POIs[place].coords.latitudeCenter,
        POIs[place].coords.longitudeCenter
      )
    );
    if (
      distanceFromPlaceToLatLng < minimumDistance &&
      place != currentIndex &&
      actualRouting.indexOf(place) == -1
    ) {
      returnIndex = place;
      minimumDistance = distanceFromPlaceToLatLng;
    }
  }
  if (returnIndex != -1) {
    actualRouting.push(returnIndex);
  }
  return returnIndex;
}

function populatePopup(indexPOItoDisplay) {
  console.log(indexPOItoDisplay)
  var POItodisplay = POIs[indexPOItoDisplay];
  $("#popupTitle").text(POItodisplay.name);
  var languageSelector = $("#language");
  $("#popupDescription").text("")
    var c = languageSelector[0].selectedOptions[0].text.toLowerCase().substring(0,languageSelector[0].selectedOptions[0].text.toLowerCase().length - 1)
    for( var s in POItodisplay.description){
		if(s == c){
			$("#popupDescription").text(stringToBeSpoken = POItodisplay.description[s]);
		}
	}

  if ($("#popupDescription").text() == "") {
	$("#popupDescription").text("Description not avaible");
  }


  if ( POItodisplay.img == "NF") {
    $("#popupImg").css("display","none");
    $("#popupImg").attr("padding","0px");
  }else{
	$("#popupImg").attr("src",POItodisplay.img);
    $("#popupImg").attr("padding","1em");
    $("#popupImg").attr("height","160px");
    $("#popupImg").show();
  }

}

function createPlayer() {
  var timer = null;
  if (Object.keys(POIs).length !== 0) {
    clearTimeout(timer);
    addRouting();
    calculateRouting();
    routingTo(actualRouting[currentDestination]);
    customdirectionsButton.state("started");
  } else {
    timer = setTimeout(createPlayer, 1000);
  }
}

function addRouting() {
  if (control !== null) return;
  control = newRouting().addTo(mymap);
  control.spliceWaypoints(
    0,
    1,
    L.latLng(currentLocation.getLatLng().lat, currentLocation.getLatLng().lng)
  );
  control.on("routesfound", function(e) {
    var distance = e.routes[0].summary.totalDistance;
    var instruction = e.routes[0].instructions[0].text;
    var distanceChange = e.routes[0].instructions[0].distance;
    if (distanceChange <= 10) {
      try {
        instruction = e.routes[0].instructions[1].text;
      } catch (err) {
        console.log(err);
      }
    }
    console.log("controllo distanza");
    checkDistance(distance, instruction);
  });
}

function newRouting() {
  return L.routing.control({
    createMarker: function() {
      //this function prevents the routing control from creating another marker over the one already presentof the POI
      return null;
    },
    addWaypoints: false,
    waypoints: [
      L.latLng(currentLocation.getLatLng().lat, currentLocation.getLatLng().lng)
    ],
    router: L.Routing.graphHopper("b7874d3d-8ac4-4edd-ba5d-1be0eaebca05", {
      urlParameters: {
        vehicle: routingMode
      }
    })
  });
}

function routingTo(destination) {
  currentPOI = destination;
  orangeMarker(currentPOI);
  control.spliceWaypoints(
    0,
    1,
    L.latLng(currentLocation.getLatLng().lat, currentLocation.getLatLng().lng)
  );
  control.spliceWaypoints(
    control.getWaypoints().length - 1,
    1,
    L.latLng(
      POIs[destination].coords.latitudeCenter,
      POIs[destination].coords.longitudeCenter
    )
  );
}

function checkDistance(distance, instruction) {
  //versione solo una destinazione alla volta
  var stringToBeSpoken = instruction;

  if (distance <= 20) {
    POIs[actualRouting[currentDestination]].marker.setIcon(
      getIconMarkerOfColor(greyIcon)
    );
    POIs[actualRouting[currentDestination]].visited = true;
    var languageSelector = $("#language");
    var c = languageSelector[0].selectedOptions[0].text.toLowerCase().substring(0,languageSelector[0].selectedOptions[0].text.toLowerCase().length - 1)
    for( var s in POIs[actualRouting[currentDestination]].description){
		if( s == c){
			langue = c
			stringToBeSpoken = POIs[actualRouting[currentDestination]].description[s]
			console.log(stringToBeSpoken)
		}
	}
    $('#clipContainer').show();
    getVideoId(POIs[actualRouting[currentDestination]],1);
    onClickMarker(stringToBeSpoken, distance);
  }
  else if(stringToBeSpoken != direction){
      direction = stringToBeSpoken;
      onClickMarker(stringToBeSpoken, distance);
  }
  updateCustomRoutingModal();
}

async function onClickMarker(toBeSpoken, distance) {
  var talker = new SpeechSynthesisUtterance(toBeSpoken);
  var availableVoices = setSpeech();
  availableVoices.then(voice => {
	  if(langue != null){
		if(langue == "en"){
			for(var i in voice){
			if(voice[i].voiceURI == "Google US English"){
				talker.voice = voice[i];
				break;
			}
		}}
		else if(langue == "fr"){
			for(var i in voice){
			if(voice[i].voiceURI == "Google français"){
				talker.voice = voice[i];
				break;
			}
		}}else if(langue == "it"){
			for(var i in voice){
			if(voice[i].voiceURI == "Google italiano"){
				talker.voice = voice[i];
				break;
			}
		}}else if(langue == "de"){
			for(var i in voice){
			if(voice[i].voiceURI == "Google Deutsch"){
				talker.voice = voice[i];
				break;
			}
		}
	  }else{
		for(var i in voice){
			if(voice[i].voiceURI == "Google italiano"){
				talker.voice = voice[i];
				break;
			}
		}
	  }
	 }
	langue = null;
    window.speechSynthesis.speak(talker);
    if (distance <= 20) {
        infoPopupState = "close"
        showCloseInfo();
    }
  });
}

function showCloseInfo() {
  if (infoPopupState === "close") {
    setCSSAttribute("#popupContainer", {
      "z-index": "-1",
      height: "0px"
    });
    $("#upDown").attr("class", "fa fa-angle-up d-flex");
    infoPopupState = "open";
  } else {
    setCSSAttribute("#popupContainer", {
      "z-index": "2",
      height: "16em",
      "margin-top": "0em"
    });
    $("#upDown").attr("class", "fa fa-angle-down d-flex");
    infoPopupState = "close";
  }
}

function setCSSAttribute(id, changes) {
  for (attribute in changes) {
    $(id).css(attribute, changes[attribute]);
  }
}

function setSpeech() {
  return new Promise(function(resolve, reject) {
    let synthesis = window.speechSynthesis;
    let id;
    id = setInterval(() => {
      if (synthesis.getVoices().length !== 0) {
        resolve(synthesis.getVoices());
        clearInterval(id);
      }
    }, 10);
  });
}

function customRoutingFunction() {
  actualRouting = [];
  currentDestination = 0;
  blueMarker(popupIndex);
  var list = document.getElementById("A").children;
  if (control == null) addRouting();
  for (var index in list) {
    if (isNumber(index)) {
      actualRouting.push(list[index].childNodes[1].id);
    }
  }
  popupIndex = actualRouting[currentDestination];
  routingTo(actualRouting[currentDestination]);
  $("#customRoutingContainer").modal("hide");
  customdirectionsButton.state("started");
  // populatePopup(popupIndex);
  // greenMarker(popupIndex);
  // showCloseInfo();
}

// function showVideoInfo(){
//   var mode = document.getElementById('changeMode')
//   if(mode.innerHTML == 'Descrizione'){
//     $('#bodyClip').hide();
//     $('#popupContainer').show();
//     populatePopup(popupIndex);
//     mode.innerHTML = 'Video';
//   }
//   else{
//     $('#popupContainer').hide();
//     $('#bodyClip').show();
//     getVideoId(POIs[popupIndex],0)
//     mode.innerHTML = 'Descrizione';
//   }
// }

function isNumber(n) {
  return typeof n != "boolean" && !isNaN(n);
}

function blueMarker(indexPOI) {
  try {
	if (POIs[indexPOI].visited){
		POIs[indexPOI].marker.setIcon(getIconMarkerOfColor(greyIcon));
	} else {
		POIs[indexPOI].marker.setIcon(getIconMarkerOfColor(blueIcon));
	}
  } catch (error) {
    console.log(indexPOI);
  }
}

function greenMarker(indexPOI) {
  try {
    POIs[indexPOI].marker.setIcon(getIconMarkerOfColor(greenIcon));
  } catch (error) {
    console.log(indexPOI);
  }
}

function orangeMarker(indexPOI) {
  try {
    POIs[indexPOI].marker.setIcon(getIconMarkerOfColor(orangeIcon));
  } catch (error) {
    console.log(indexPOI);
  }
}
