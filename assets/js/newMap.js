var lat, lon;
var searchControl;
var waypoints = [];
var control = null;
var distanceRouting = null;
var routingMode = "foot";
var mymap;
var POIs = {};
var dsts, ret;
var currentLocation;

$(document).ready(function() {
  createMap();
  if (loadMarker()) {
    createPlayer();
  }
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

  mymap.on("locationerror", function(e) {});
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
    console.log("otherTimes");
    mymap.removeLayer(currentLocation);
  } catch {
    console.log("firstTime");
  }
  currentLocation = L.marker([lat, lon])
    .bindPopup(popup)
    .addTo(mymap);
}

function onError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

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
        var popup =
          '<div id="popupContainer" style="width: 300px;height: 250px;padding: 1em;overflow: scroll;"><div class="d-flex justify-content-between"><div class="d-flex align-items-center"><p>' +
          key +
          '</p></div><div><img style="width: 100px; height: 100px" src=' +
          POIs[key].img +
          '/></div></div><div style="padding-top: 1em;"><p style="margin: 0px;">' +
          POIs[key].description.it +
          "</p></div></div>";
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
          .bindPopup(popup)
          .addTo(mymap);
        await sleep(250);
      }
    });
    return true;
  } else {
    timer = setTimeout(loadMarker, 1000);
  }
}

function createPlayer() {
  for (var i in POIs) {
    var url =
      "https://graphhopper.com/api/1/matrix?from_point=" + lat + "," + lon;
    url +=
      "&to_point=" + POIs[i].latitudeCenter + "," + POIs[i].longitudeCenter;
    url +=
      "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=653995f0-72fe-4af8-b598-60e50479a0c2";
  }
  $.when(getDistance(url)).done(async function() {
    //ADD TO ROUTING
  });
}

function getDistance(q) {
  console.log(q);
}

function addRouting() {
  control = L.routing
    .control({
      createMarker: function() {
        return null;
      },
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
