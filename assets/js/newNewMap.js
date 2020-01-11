/**
 * Variabili globali per evitare passaggio di parametri nelle funzioni
 */
var mymap;
var currentLocation = null;
var currentDestination = 0;
var blackIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png";
var orangeIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png";
var customDirectionsButton = null;
var POIs = {};
var control = null;
var routingMode = "foot";
var infoPopupState = "open";
var actualRouting = [];

/**
 * Funzione che gestisce l'avvio dell'applicazione
 */
$(document).ready(async function() {
  setGeolocationApiKey();
  createMap();
  loadMarker();
});

/**
 * Creates map, adds layer and set the view on Bologna
 */
function createMap() {
  return new Promise((resolve, reject) => {
    $("#mapid").show();
    $("#spinner").remove();
    var boundsMap = new L.LatLngBounds(
      new L.LatLng(-90, -180),
      new L.LatLng(90, 180)
    );
    mymap = L.map("mapid", {
      zoomControl: true,
      maxBounds: boundsMap,
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

/**
 * createMap Functions
 */
function onLocationFound(position) {
  updateCurrentLocation(position.coords.latitude, position.coords.longitude);
}

function onError(err) {
  $("#noGeo").modal();
}

function onClick() {
  mymap.on("click", function(e) {
    var fakePositionBtn = createButton("Simula Posizione");
    L.DomEvent.on(fakePositionBtn, "click", function() {
      mymap.closePopup();
      currentLocation.setLatLng(e.latlng);
      if (control !== null) {
        control.spliceWaypoints(0, 1, e.latlng);
      }
      updateCustomRouting();
    });
    L.popup("#ffffff")
      .setContent(fakePositionBtn)
      .setLatLng(e.latlng)
      .openOn(mymap);
  });
}
/**
 * createMap Functions
 */

/**
 * Loads marker with descriptions and images
 */
function loadMarker() {
  if (currentLocation !== null) {
    var currentLocationOCL = OpenLocationCode.encode(
      currentLocation.getLatLng().lat,
      currentLocation.getLatLng().lng,
      4
    );
    customdirectionsButton.state("loading");
    currentLocationOCL = currentLocationOCL.replace("+", "");
    $.when(getPOIs(currentLocationOCL)).done(async function() {
      displayPOIs();
    });
  } else {
    setTimeout(loadMarker, 1000);
  }
}

/**
 * loadMarker Functions
 */
function getPOIs(OCL) {
  return $.ajax({
    type: "get",
    url: "/getPOIs?searchQuery=" + OCL,
    success: function(data) {
      POIs = data;
    }
  });
}

async function displayPOIs() {
  for (var place in POIs) {
    var poi = L.marker(
      [POIs[place].coords.latitudeCenter, POIs[place].coords.longitudeCenter],
      {
        bounceOnAdd: true,
        bounceOnAddOptions: {},
        bounceOnAddCallback: function() {}
      }
    ).addTo(mymap);
    POIs[place].marker = poi;
    await sleep(250);
  }
  L.easyButton({
    states: [
      newState("custom", "fas fa-bong", "Custom way", function(btn) {
        $("#customRoutingContainer").modal({
          backdrop: "static",
          keyboard: false
        });
      })
    ]
  }).addTo(mymap);
  updateCustomRouting();
  customdirectionsButton.state("start");
}
/**
 * loadMarker Functions
 */