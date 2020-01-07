//Called by editor map e user map

var lat, lon;
var searchControl;
var waypoints = [];
var control = null;
var distanceRouting = null;
var routingMode = "foot";
var mymap;
var POIs = {};
var DSTs = {};
var dsts, ret;
var speec = window.speechSynthesis;
var currentLocation;
var currentDestination;
var referenceTable = {};
var minIndexes = [];
var actualRoute = null;
var state = "open";
var customdirection = null;
var routing = [];
var blackIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var orangeIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var lang = "en"; // use for metadata and translate deafult english
/*Sets up the map are of the html file
 */
$(document).ready(async function() {
  setApiKey();
  if (checkMode() == 1) {
    await createMap();
  }
  loadMarker();
});

//____________CREATEMAP FUNCTIONS_______________________________________

function createMap() {
  return new Promise((resolve, reject) => {
    $("#mapid").show();
    $("#spinner").remove();
    var bounds = new L.LatLngBounds(
      new L.LatLng(-90, -180),
      new L.LatLng(90, 180)
    );
    mymap = L.map("mapid", {
      zoomControl: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    });
    onClick();

    L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZnJhbno5OTE3IiwiYSI6ImNrMml5c2FmZDAwZ3YzaG5vODVvdmVxZXUifQ.Dm-BwkGmch8JSsJ9tTpo5w",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        minZoom: 3,
        id: "mapbox.streets"
      }
    ).addTo(mymap);
    addPlayButton();

    mymap.setView([44.49394, 11.3426944], 12);
    navigator.geolocation.watchPosition(onLocationFound, onError, {
      enableHighAccuracy: true,
      maximumAge: 0
    });
    resolve(mymap);
  });
}

function onLocationFound(position) {
  var popup = '<p class="text-center" style="margin: 1em;">Sei qui!</p>';
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  try {
    mymap.removeLayer(currentLocation);
    control.spliceWaypoints(0, 1, L.latLng(lat, lon));
  } catch (err) {}
  currentLocation = L.marker([lat, lon], { icon: blackIcon })
    .bindPopup(popup)
    .addTo(mymap);
  updateCustomRouting();
  if (checkMode() == 0) {
    console.log("rimosso in teoria2");
    mymap.removeControl(customdirection);
  }
}

//____________END OF CREATEMAP FUNCTIONS_______________________________________


//____________CONTROL ROUTING FUNCTIONS_______________________________________

function checkDistance(distance, instruction) {
  if (instruction.includes("Waypoint")) {
    //Time to talk description of POI waypoint
    var waylength = control.getWaypoints().length - routing.length;
    var key = routing.shift();
    var poi = POIs[key];
    mymap.removeLayer(poi.marker);
    poi.marker.addTo(mymap);
    poi.marker.setIcon(orangeIcon);
    var route = control.getWaypoints();
    route.splice(1, 1);
    control.setWaypoints(route);
    instruction = poi.description.en;
    populatePopup(key);
    distance = 5;
    if (routing.length > 1) addNewWaypoint();
    getVideoId(poi);
  } else if (distance <= 20) {
    //Time to talk description of POI destination
    var poi = POIs[referenceTable[minIndexes[currentDestination]]];
    var la = poi.latitudeCenter;
    var lo = poi.longitudeCenter;
    mymap.removeLayer(poi.marker);
    poi.marker.addTo(mymap);
    poi.marker.setIcon(orangeIcon);
    instruction = poi.description.en;
    routing = [];
    customdirection.state("start");
    populatePopup(referenceTable[minIndexes[currentDestination]]);
    getVideoId(poi);
  }
  onClickMarker(instruction, distance);
}

function addNewWaypoint() {
  var key, poi, x;
  for (var cont in routing) {
    if (routing[cont] == referenceTable[minIndexes[currentDestination]]) {
      x = true;
    } else if (x == true) {
      key = routing[cont];
      break;
    }
  }
  poi = POIs[key];
  var route = control.getWaypoints();
  route.push(L.latLng(poi.latitudeCenter, poi.longitudeCenter));
  +control.setWaypoints(route);
  updateCurrentDestination(key);
}

//____________END OF CONTROL ROUTING FUNCTIONS_______________________________________


//____________LOADMARKER FUNCTIONS_______________________________________

function loadMarker() {
  if (typeof lat !== "undefined") {
    var q = OpenLocationCode.encode(lat, lon, 4);
    customdirection.state("loading");
    q = q.replace("+", "");
    $.when(getPOIs(q)).done(async function() {
      for (var key in POIs) {
        var m = L.marker(
          [POIs[key].latitudeCenter, POIs[key].longitudeCenter],
          {
            bounceOnAdd: true,
            bounceOnAddOptions: {},
            bounceOnAddCallback: function() {}
          }
        ).addTo(mymap);
        POIs[key].marker = m;
        await sleep(250);
      }
      if (checkMode() == 1) {
        L.easyButton({
          states: [
            {
              stateName: "custon", // name the state
              icon: "fas fa-bong", // and define its properties
              title: "Custom way", // like its title
              onClick: function(btn) {
                $("#customRoutingContainer").modal({
                  backdrop: "static",
                  keyboard: false
                });
              }
            }
          ]
        }).addTo(mymap);
        console.log(POIs);
        updateCustomRouting();
        customdirection.state("start");
      }
    });
  } else {
    setTimeout(loadMarker, 1000);
  }
}

function createPlayer() {
  var timer = null;
  if (Object.keys(POIs).length !== 0) {
    customdirection.state("started");
    currentDestination = 0;
    clearTimeout(timer);
    addRouting();
    routingTo(POIs[referenceTable[minIndexes[0]]]);
  } else {
    timer = setTimeout(createPlayer, 1000);
  }
}

//____________END OF LOADMARKER FUNCTIONS_______________________________________


//____________DEVELOPERS UTILS FUNCTIONS_______________________________________

function onError(err) {
  $("#noGeo").modal();
}

async function onClickMarker(instruction, distance) {
  // var speec = window.speechSynthesis;
  var msg = new SpeechSynthesisUtterance(instruction);
  var availableVoices = setSpeech();
  availableVoices.then(voice => {
    msg.voice = voice[5];
    speec.speak(msg);
    console.log("PWECHE NON PARLI");
    if (distance <= 20) {
      state = "open";
      showCloseInfo();
    }
  });
}

const onClick = () => {
  mymap.on("click", function(e) {
    var fakeBtn = createButton("fakePos");

    L.DomEvent.on(fakeBtn, "click", function() {
      mymap.closePopup();
      lat = e.latlng.lat;
      lon = e.latlng.lng;
      currentLocation.setLatLng(e.latlng);
      if (control !== null) control.spliceWaypoints(0, 1, e.latlng);
      updateCustomRouting();
    });
    L.popup("#ffffff")
      .setContent(fakeBtn)
      .setLatLng(e.latlng)
      .openOn(mymap);
  });
};

function setSpeech() {
  return new Promise(function(resolve, reject) {
    let synth = window.speechSynthesis;
    let id;
    id = setInterval(() => {
      if (synth.getVoices().length !== 0) {
        resolve(synth.getVoices());
        clearInterval(id);
      }
    }, 10);
  });
}

function createButton(label) {
  var btn = L.DomUtil.create("button", "#000000");
  btn.setAttribute("type", "button");
  btn.innerHTML = label;
  return btn;
}

//____________END OF DEVELOPERS UTILS FUNCTIONS_______________________________________


//____________AJAX REQUEST_______________________________________

function getDistance(q) {
  return $.ajax({
    type: "get",
    url: q,
    success: function(data) {
      DSTs = data;
    }
  });
}

//____________END AJAX FUNCTIONS_______________________________________


//____________CUSTOMROUTING FUNCTIONS_______________________________________

function customRouting() {
  var cont = 0;
  var lastPoi;
  var latlng = L.latLng(lat, lon);
  var list = document.getElementById("A").children,
  child;
  console.log(list);
  if (control == null) addRouting();
  while (cont < list.length) {
    child = list[cont].childNodes[2].data;
    routing[cont] = child;
    if (cont < 4) {
      latlng = L.latLng(
        POIs[child].latitudeCenter,
        POIs[child].longitudeCenter
      );
      control.spliceWaypoints(cont + 1, 1, latlng);
      lastPoi = cont;
    }
    cont++;
  }
  updateCurrentDestination(routing[lastPoi]);
  customdirection.state("started");
}

function updateCustomRouting() {
  if (Object.keys(POIs).length !== 0) {
    var list = document.getElementById("B");
    var child = list.lastElementChild;
    while (child) {
      list.removeChild(child);
      child = list.lastElementChild;
    }
    elaborateDistance();
    var cont = 0,
    place = "";
    console.log(referenceTable);
    console.log(DSTs);
    for (var i in referenceTable){

    }
    for (var i in referenceTable) {
      place +=
      "<div class='list-group-item'>" +
      "  <span class='glyphicon glyphicon-move' aria-hidden='true' id='route" +
      cont +
      "' title='" +
      referenceTable[minIndexes[cont]] +
      "'></span>" +
      referenceTable[minIndexes[cont]] +
      "<span class='badge'>" +
      DSTs[0][referenceTable[minIndexes[cont]]].toFixed(0) +
      "</span>" +
      "</div>";
      cont++;
    }
    $("#B").append(place);
  }
}

function updateCurrentDestination(lastPoi) {
  var i;
  for (key in referenceTable) {
    if (referenceTable[key] == lastPoi) {
      i = key;
    }
  }
  for (key in minIndexes) {
    if (minIndexes[key] == i) {
      currentDestination = key;
    }
  }
}

//____________END CUSTOMROUTING FUNCTIONS_______________________________________


//____________ROUTING FUNCTIONS_______________________________________

function addRouting() {
  if (control !== null) return;
  control = L.routing
    .control({
      createMarker: function() {
        return null;
      },
      addWaypoints: false,
      waypoints: [L.latLng(lat, lon)],
      router: L.Routing.graphHopper("a0695b22-2381-4b66-8330-9f213b610d8f", {
        urlParameters: {
          vehicle: routingMode
        }
      })
    })
    .addTo(mymap);
  control.spliceWaypoints(0, 1, L.latLng(lat, lon));
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
    checkDistance(distance, instruction);
  });
}

function elaborateDistance() {
  var count = 0;
  calculateDistance(lat, lon, 0,null);
  for (var i in POIs) {
    referenceTable[count] = i;
    count++;
    console.log(i);
    calculateDistance(POIs[i].latitudeCenter, POIs[i].longitudeCenter, count, i);
  }
  console.log(POIs);
  count = -1;
  minIndexes = [];
  do {
    count = createRoute(count + 1);
  } while (count != -1);
  currentDestination = 0;
  populatePopup(referenceTable[minIndexes[currentDestination]]);
}

function calculateDistance(slat, slon, index, t) {
  var x = L.latLng(slat, slon);
  DSTs[index] = {};
  for (var i in POIs) {
    var dist = x.distanceTo(
      L.latLng(POIs[i].latitudeCenter, POIs[i].longitudeCenter)
    );
    DSTs[index][i] = {};
    DSTs[index][i] = dist;
    if(t != null){
      POIs[t]["distance"] = dist; //inutile?
    }
  }
}

function createRoute(i) {
  var min = 40075000;
  var minIndex = -1;
  var count = 0;
  for (var index in DSTs[i]) {
    if (
      DSTs[i][index] > 0 &&
      DSTs[i][index] <= min &&
      !minIndexes.includes(count)
    ) {
      minIndex = count;
      min = DSTs[i][index];
    }
    count++;
  }
  if (minIndex != -1) {
    minIndexes.push(Number(minIndex));
  }
  return minIndex;
}

function routingTo(p) {
  control.spliceWaypoints(0, 1, L.latLng(lat, lon));
  control.spliceWaypoints(
    control.getWaypoints().length - 1,
    1,
    L.latLng(p.latitudeCenter, p.longitudeCenter)
  );
}

//____________END OF ROUTING FUNCTIONS_______________________________________


//____________INFORMATION FUNCTIONS_______________________________________

function populatePopup(key) {
  $("#popupTitle").text(key);
  $("#popupDescription").text(
    POIs[key].description.en !== "NOT FOUND"
      ? POIs[key].description.en
      : "No description available"
  );
  if (POIs[key].img) {
    $("#popupImg").attr(
      "src",
      POIs[key].img !== "NF"
        ? POIs[key].img
        : "https://cdn.shopify.com/s/files/1/1552/7487/products/good_game_gg-smiley_fornite_spray_emote_printed_sticker_grfxp_grafixpressions_720x.jpg?v=1525975056"
    );
  }
  $("#popupImg").attr("style", "width: 50%;height: auto; float: right;");
  $("#popupContainer").css("width", "calc(100% - 2em)");
}

$("#prev").on("click", function() {
  if (currentDestination > 0) {
    currentDestination--;
    populatePopup(referenceTable[minIndexes[currentDestination]]);
  }
});

$("#next").on("click", function() {
  if (currentDestination < minIndexes.length - 1) {
    currentDestination++;
    populatePopup(referenceTable[minIndexes[currentDestination]]);
  }
});

//____________END OF INFORMATION FUNCTIONS_______________________________________
