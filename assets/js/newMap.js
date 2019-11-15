var lat, lon;
var searchControl;
var waypoints = [];
var control = null;
var distanceRouting = null;
var routingMode = 'foot'
var mymap;
var POIs = {}
var Desc = {}
var dsts, ret;
/*Sets up the map are of the html file
*/
var currentLocation;

$(document).ready(function () {
  createMap();
  loadMarker();
});

$("#stop").click(function () {
  document.getElementById('dad').hidden = true;
  try {
    document.getElementById('iframe').stop();
  }
  catch{ }
});

function createMap() {
  var bounds = new L.LatLngBounds(new L.LatLng(-90, -180), new L.LatLng(90, 180));
  mymap = L.map('mapid', {
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  });

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZnJhbno5OTE3IiwiYSI6ImNrMml5c2FmZDAwZ3YzaG5vODVvdmVxZXUifQ.Dm-BwkGmch8JSsJ9tTpo5w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 3,
    id: 'mapbox.streets'
  }).addTo(mymap);

  mymap.on('locationerror', function (e) { });
  mymap.setView([44.49394,11.3426944], 12);
  navigator.geolocation.watchPosition(onLocationFound, onError, { enableHighAccuracy: true, maximumAge: 0 });
}

function onLocationFound(position) {
  var popup = "<p class=\"text-center\" style=\"margin: 1em;\">Sei qui!</p>";
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  try{
    console.log("otherTimes");
    mymap.removeLayer(currentLocation);
  } catch {
    console.log("firstTime");
  }
  currentLocation = L.marker([lat, lon]).bindPopup(popup).addTo(mymap);
}

function onError(err){
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function getPOIs(q) {
  return $.ajax({
    type: "get",
    url: "/getPOIs?searchQuery=" + q,
    success: function (data) {
      POIs = data;
    }
  }
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadMarker() {
  if (typeof lat !== "undefined") {
    var q = OpenLocationCode.encode(lat, lon, 4);
    q = q.replace("+", "");
    $.when(getPOIs(q)).done(async function () {
      console.log(POIs);
      for (var key in POIs) {
        var popup = "<div id=\"popupContainer\" style=\"width: 300px;height: 250px;margin: 1em;padding: 1em;overflow: scroll;\"><div class=\"d-flex justify-content-between\"><div class=\"d-flex align-items-center\"><p>"+key+"</p></div><div><img style=\"width: 100px; height: 100px\" src="+POIs[key].img+"/></div></div><div style=\"padding-top: 1em;\"><p style=\"margin: 0px;\">"+POIs[key].description.it+"</p></div></div>";
        //var popup = "<h1 class=\"text-center\" style=\"margin: 1em;background-color: #000000;color: #ffffff\">" + key + "</h1>";
        //popup += "<img src=" + POIs[key].img + " ></img>";
        //popup += "<p class=\"text-center\" style=\"margin: 1em;background-color: #000000;color: #ffffff\">" + POIs[key].description.it + "</p>";
        var m = L.marker([POIs[key].latitudeCenter, POIs[key].longitudeCenter], {
          bounceOnAdd: true,
          bounceOnAddOptions: { },
          bounceOnAddCallback: function () { }
        }).on('click', function(e){mymap.setView(m.getLatLng(), 12)}).bindPopup(popup).addTo(mymap);
        await sleep(250);
      }
    });
  }
  else {
    setTimeout(loadMarker, 1000);
  }
}
