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
var currentLocation;
var currentDestination;
var referenceTable = {};
var minIndexes = [];

$(document).ready(async function() {
  createMap();
  loadMarker();
  createPlayer();
});

$("#stop").click(function() {
  document.getElementById("dad").hidden = true;
  try {
    document.getElementById("iframe").stop();
  } catch {}
});

function createMap() {
  var bounds = new L.LatLngBounds(
    new L.LatLng(-90, -180),
    new L.LatLng(90, 180)
  );
  mymap = L.map("mapid", {
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  });

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

  mymap.setView([44.49394, 11.3426944], 12);
  navigator.geolocation.watchPosition(onLocationFound, onError, {
    enableHighAccuracy: true,
    maximumAge: 0
  });
}

function onLocationFound(position) {
  var popup = '<p class="text-center" style="margin: 1em;">Sei qui!</p>';
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  try {
    mymap.removeLayer(currentLocation);
  } catch {}
  currentLocation = L.marker([lat, lon])
    .bindPopup(popup)
    .addTo(mymap);
  if (control !== null) {
    if (checkDistanceFromPOI()) {
      control.spliceWaypoints(0, 1, null);
    } else {
      control.spliceWaypoints(0, 1, [lat, lon]);
    }
  }
}

function onError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

//____________CREATEMAP FUNCTIONS_______________________________________

function getPOIs(q) {
  return $.ajax({
    type: "get",
    url: "/getPOIs?searchQuery=" + q,
    success: function(data) {
      POIs = data;
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadMarker() {
  var timer = null;
  if (typeof lat !== "undefined") {
    clearTimeout(timer);
    var q = OpenLocationCode.encode(lat, lon, 4);
    q = q.replace("+", "");
    $.when(getPOIs(q)).done(async function() {
      console.log(POIs);
      for (var key in POIs) {
        var m = L.marker(
          [POIs[key].latitudeCenter, POIs[key].longitudeCenter],
          {
            bounceOnAdd: true,
            bounceOnAddOptions: {},
            bounceOnAddCallback: function() {}
          }
        )
          .on("click", function(e) {
            mymap.setView(m.getLatLng(), 12);
          })
          .addTo(mymap);
        await sleep(250);
      }
    });
  } else {
    console.log("firstelse");
    timer = setTimeout(loadMarker, 1000);
  }
}

//____________LOADMARKER FUNCTIONS_______________________________________

function createPlayer() {
  var timer = null;
  if (Object.keys(POIs).length !== 0) {
    clearTimeout(timer);
    addRouting();
    addPlayButton();
  } else {
    timer = setTimeout(createPlayer, 1000);
  }
}

function addPlayButton() {
  L.easyButton({
    states: [
      {
        stateName: "null", // name the state
        icon: "fa-play", // and define its properties
        title: "Click to get directions to the nearest POI", // like its title
        onClick: function(btn) {
          // and its callback
          elaborateDistance();
          $("#popupContainer").css("z-index", "2");
          btn.state("started"); // change state on click!
        }
      },
      {
        stateName: "started",
        icon: "fa-stop",
        title: "Stop the player!",
        onClick: function(btn) {
          $("#popupContainer").css("z-index", "-1");
          control.spliceWaypoints(control.getWaypoints().length - 1, 1, null);
          btn.state("null");
        }
      }
    ]
  }).addTo(mymap);
}

function populatePopup() {
  $("#popupTitle").text(referenceTable[minIndexes[currentDestination]]);
  $("#popupDescription").text(
    POIs[referenceTable[minIndexes[currentDestination]]].description !== "NF"
      ? POIs[referenceTable[minIndexes[currentDestination]]].description.it
      : "Non è disponibile nessuna descrizione..."
  );
  $("#popupImg").attr(
    "src",
    "" + POIs[referenceTable[minIndexes[currentDestination]]].img
  );
  $("#popupImg").attr("style", "width: 50%;height: auto; float: right;");
  $("#popupContainer").css("width", "calc(100% - 2em)");
}

function elaborateDistance() {
  var count = 0;
  var url = "https://graphhopper.com/api/1/matrix?point=" + lat + "," + lon;
  for (var i in POIs) {
    referenceTable[count] = i;
    count++;
    url += "&point=" + POIs[i].latitudeCenter + "," + POIs[i].longitudeCenter;
  }
  url +=
    "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=653995f0-72fe-4af8-b598-60e50479a0c2";
  $.when(getDistance(url)).done(function() {
    console.log(DSTs);
    var index = 0;
    while (true) {
      index = createRoute(index);
      if (index === -1) {
        break;
      }
    }
    console.log(minIndexes);
    routingTo(POIs[referenceTable[minIndexes[0]]]);
    currentDestination = 0;
    populatePopup();
  });
}

function createRoute(i) {
  var min = 40075000;
  var minIndex = -1;
  for (var index in DSTs.distances[i]) {
    if (
      DSTs.distances[i][index] > 0 &&
      DSTs.distances[i][index] <= min &&
      !minIndexes.includes(index) &&
      index != 0
    ) {
      minIndex = index - 1;
      min = DSTs.distances[i][index];
    }
  }
  minIndexes.push(minIndex);
  return minIndex;
}

function getDistance(q) {
  return $.ajax({
    type: "get",
    url: q,
    success: function(data) {
      DSTs = data;
    }
  });
}

function addRouting() {
  control = L.routing
    .control({
      createMarker: function() {
        return null;
      },
      fitSelectedRoutes: false,
      addWaypoints: false,
      waypoints: [L.latLng(lat, lon)],
      router: L.Routing.graphHopper("653995f0-72fe-4af8-b598-60e50479a0c2", {
        urlParameters: {
          vehicle: routingMode
        }
      })
    })
    .addTo(mymap);
}

function routingTo(p) {
  control.spliceWaypoints(
    control.getWaypoints().length - 1,
    1,
    L.latLng(p.latitudeCenter, p.longitudeCenter)
  );
}

$("#prev").on("click", function() {
  if (currentDestination !== 0) {
    currentDestination--;
  }
  populatePopup();
});

$("#next").on("click", function() {
  if (currentDestination !== minIndexes.length() - 1) {
    currentDestination++;
  }
  populatePopup();
});

//____________CREATEPLAYER FUNCTIONS_______________________________________
