//Init Map

async function init(){
  createMap();
  if ("http://localhost:8000/userMode.html" == window.location.href || "http://localhost:8000/userMode.html/" == window.location.href || "http://localhost:8000/userMode.html#" == window.location.href) {
    loadMarker();
    createPlayer();
  }
}



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


$("#stop").click(function() {
  document.getElementById("dad").hidden = true;
  try {
    document.getElementById("iframe").stop();
  } catch {}
});

function createMap() {

  $('#mapid').show();
  $('#spinner').remove();
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

  addPlayButton();
  mymap.setView([44.49394, 11.3426944], 12);
  navigator.geolocation.watchPosition(onLocationFound, onError, {
    enableHighAccuracy: true,
    maximumAge: 0
  });
  loadMarker();
}

function onLocationFound(position) {
  var popup = '<p class="text-center" style="margin: 1em;">Sei qui!</p>';
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  try {
    mymap.removeLayer(currentLocation);
  } catch (err){}
  currentLocation = L.marker([lat, lon])
    .bindPopup(popup)
    .addTo(mymap);
  if (control !== null) {
      control.spliceWaypoints(0, 1, [lat, lon]);
  }

  loadMarker();

}

function setApiKey(){
  this.placesAutocomplete = places({
  appId: 'plTCO8O9NAP7',
  apiKey: 'a5c7d70d42023f9e0afdfa6bac7a2634',
  container: document.querySelector('#address')
  });
}


function callApi(){
  if($("#address").val() != ""){
    $.ajax({
      url: "https://api.opencagedata.com/geocode/v1/json?q="+$("#address").val()+"&key=4e6db93d236944d68db1551367316df5&language=it&pretty=1",
      success: (result) => {
          if(result.results.length != 0){
            var popup = '<p class="text-center" style="margin: 1em;">Sei qui!</p>';
            lat = result.results[0].geometry.lat;
            lon = result.results[0].geometry.lng;;
            try {
              mymap.removeLayer(currentLocation);
            } catch {}
            currentLocation = L.marker([lat, lon])
              .bindPopup(popup)
              .addTo(mymap);
            if (control !== null) {
                control.spliceWaypoints(0, 1, [lat, lon]);
            }

            $('#noGeo').modal('toggle');

          }else{
            cssError();
          }
      },
      error: (result) =>{
        console.log("Impossibile contattare il server");
        cssError();
      }
    });
  }else {
      cssError();
  }
}

function onError(err) {
    setApiKey();
    $('#noGeo').modal({ backdrop: 'static', keyboard: false })
    $("#btn-load").click(function(){
        callApi();
    });
}

//____________CREATEMAP FUNCTIONS_______________________________________

function getPOIs(q) {
  return $.ajax({
    type: "get",
    url: "/getPOIs?searchQuery=" + q,
    success: function(data) {
      POIs = data;
    },
    error: function(e){
      console.log(e)
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
  } else {
    console.log("firstelse");
    timer = setTimeout(loadMarker, 1000);
  }
}

//____________LOADMARKER FUNCTIONS_______________________________________

function addPlayButton() {
  L.easyButton({
    states: [
      {
        stateName: "null", // name the state
        icon: "fas fa-bong", // and define its properties
        title: "Click to get directions to the nearest POI", // like its title
        onClick: function(btn) {
            $('#noGeo').modal({ backdrop: 'static', keyboard: false });
        }
      }
    ]
  }).addTo(mymap);
}
