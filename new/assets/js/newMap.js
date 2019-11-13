var lat, lon;
var searchControl;
var waypoints = [];
var control = null;
var distanceRouting = null;
var routingMode = 'foot'
var mymap;
var POIs = {}
var Desc = {}
var dsts,ret;
/*Sets up the map are of the html file
*/
var currentLocation;


$("#stop").click(function(){
  document.getElementById('dad').hidden = true;
  try{
    document.getElementById('iframe').stop();
  }
  catch{}
});

function newMap(data = null) {
  if (data !== null) {
    return reloadMap(data);
  } else {
     return createFirstMap();
  }
}
function createFirstMap() {
  currentLocation = L.marker([0, 0]).on('click', function (e) {
    if ((control !== null) && (control.getWaypoints().length > 1)) {
      var destBtn = createButton('Da implementare');

      L.DomEvent.on(destBtn, 'click', function () {

      });
      currentLocation.bindPopup(destBtn, "#ffffff");
    }
  });

  var bounds = new L.LatLngBounds(new L.LatLng(-90, -180), new L.LatLng(90, 180));
  mymap = L.map('mapid', {
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    fadeAnimation: true,
    zoomAnimation: true
  });
  var layer = addLayer();
  layer.addTo(mymap);
  //var latlngs = L.rectangle(bounds).getLatLngs();
  //L.polyline(latlngs[0].concat(latlngs[0][0])).addTo(mymap);

  mymap = getLocation(mymap, currentLocation);

  /*addButton(mymap, currentLocation);
  addControlListener(mymap, currentLocation);
  var obj = ("#search-nogps");
  //addGeoSearch(mymap);

  onClick(mymap);
  currentLocation.addTo(mymap);
  /*window.setInterval(function(){
    mymap = getLocation(mymap, currentLocation);
  }, 5000);*/

  currentLocation.addTo(mymap);
  return mymap
}

function getLocation(mymap, currentLocation) {
  return mymap.locate({ setView: false, watch: true, locateOptions: { enableHighAccuracy: true } })
    .on('locationfound', function (e) {
      lat = e.latitude;
      lon = e.longitude;
      currentLocation.setLatLng([lat, lon]);

      if (control === null) {

      } else {
        control.spliceWaypoints(0, 1, L.latLng(lat, lon));
      }
    })
    .on('locationerror', function (e) {
    });
}

function addLayer() {
  return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 3,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZnJhbno5OTE3IiwiYSI6ImNrMml5c2FmZDAwZ3YzaG5vODVvdmVxZXUifQ.Dm-BwkGmch8JSsJ9tTpo5w'
  })
}

function getPOIs(q){
  return $.ajax({
        type: "get",
        url: "/getPOIs?searchQuery="+q,
        success: function(data){
          POIs = data;
        }
      }
    );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadMarker(){
    if(typeof lat !== "undefined"){
      var q = OpenLocationCode.encode(lat, lon, 4);
      q = q.replace("+","");
      $.when(getPOIs(q)).done(async function(){           //inserisce i marker trovati su youtube, da fare solo una volta (?)
        mymap.setView(currentLocation.getLatLng(),12);
        for (var key in POIs){
          var m = L.marker([POIs[key].latitudeCenter, POIs[key].longitudeCenter], {
            bounceOnAdd: true,
            bounceOnAddOptions: {duration: 750, height: 150, loop: 2},
            bounceOnAddCallback: function() {
              //funzione che viene triggerata quando è stato completato il bouncing
            }
          }).addTo(mymap);
          await sleep(250);
        }
      });
    }
    else{
        setTimeout(loadMarker, 250);
    }
}

newMap();

loadMarker();
