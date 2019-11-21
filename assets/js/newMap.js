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
var nearest;
var speec = window.speechSynthesis;
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
    speec.cancel();
  }
  catch(err){
  console.log(err)
 }
});

function createMap() {
  var bounds = new L.LatLngBounds(new L.LatLng(-90, -180), new L.LatLng(90, 180));
  mymap = L.map('mapid', {
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  });
  onClick(mymap);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic21vZzk4IiwiYSI6ImNrMnh2c2s5ZDAxbW0zY2x2dWMybnQ4cHEifQ.QiPAgRSCZxhtoLHwEsegGw', {
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
  addRouting(mymap);

}

function onError(err){
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function addRouting(mymap) {
  if (control  !== null) return;
  control = L.routing.control({
    createMarker: function () { return null; },
    addWaypoints: false,
    waypoints: [
      L.latLng(lat, lon)
    ],
    router: L.Routing.graphHopper('653995f0-72fe-4af8-b598-60e50479a0c2', {
      urlParameters: {
        vehicle: routingMode
      }
    })
  }).addTo(mymap);
  control.spliceWaypoints(0, 1, L.latLng(lat, lon));
  control.on('routesfound', function (e) {
      var distance = e.routes[0].summary.totalDistance;
      checkDistance(distance);
  });
}

function checkDistance(distance){
  if(distance <= 20){
    var la = POIs[nearest].latitudeCenter;
    var lo = POIs[nearest].longitudeCenter;
    var mark = new L.marker([la, lo], {
    bounceOnAdd: true,
    bounceOnAddOptions: { },
    bounceOnAddCallback: function () { }
  })
    var popup =
      '<div id="popupContainer" style="width: 300px;height: 250px;padding: 1em;overflow: scroll;"><div class="d-flex justify-content-between"><div class="d-flex align-items-center"><p>' +
      nearest +
      '</p></div><div><img style="width: 100px; height: 100px" src=' +
      POIs[nearest].img +
      '/></div></div><div style="padding-top: 1em;"><p style="margin: 0px;">' +
      POIs[nearest].description.en +
      "</p></div></div>";
    var x = new L.LatLng(la,lo)
    onClickMarker(mymap,mark,popup,distance);
  }
}

function getPOIs(q) {
  return $.ajax({
    type: "get",
    url: "/getPOIs?searchQuery=" + q+"&Slat="+ lat + "&Slon="+lon,
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
      // console.log(POIs);
      var min = 40075000;
      var id;
      for (var key in POIs) {
        if(POIs[key].distance < min){
          min = POIs[key].distance;
          id = key;
        }
        // if()
        // console.log(key)
        // console.log(POIs)
        // console.log(POIs[key].description)
        var popup =
          '<div id="popupContainer" style="width: 300px;height: 250px;padding: 1em;overflow: scroll;"><div class="d-flex justify-content-between"><div class="d-flex align-items-center"><p>' +
          key +
          '</p></div><div><img style="width: 100px; height: 100px" src=' +
          POIs[key].img +
          '/></div></div><div style="padding-top: 1em;"><p style="margin: 0px;">' +
          POIs[key].description.en +
          "</p></div></div>";
          var m = new L.marker([POIs[key].latitudeCenter, POIs[key].longitudeCenter], {
          bounceOnAdd: true,
          bounceOnAddOptions: { },
          bounceOnAddCallback: function () { }
        }).on('click', function(e){
          changeDestination(mymap, e);
          mymap.setView(m.getLatLng(), 12)
        }).bindPopup(popup).addTo(mymap);
        await sleep(250);

      }
      nearest = id;
      var la = POIs[id].latitudeCenter;
      var lo = POIs[id].longitudeCenter;
      var x = new L.LatLng(la,lo)
      control.spliceWaypoints(control.getWaypoints().length - 1, 1,x);
      console.log("CONTROL DOPO")
      console.log(control.routes)
      var mark = L.marker([la,lo], {
          bounceOnAdd: true,
          bounceOnAddOptions: { },
          bounceOnAddCallback: function () { }
        });
    });
  }
  else {
    setTimeout(loadMarker, 1000);
  }
}


const onClick = (mymap) => {
  mymap.on('click', function (e) {
    var fakeBtn = createButton("fakePos");

    L.DomEvent.on(fakeBtn, 'click', function () {
      mymap.closePopup();
      // console.log(e);
      lat = e.latlng.lat;
      lon = e.latlng.lng;
      currentLocation.setLatLng(e.latlng);
      control.spliceWaypoints(0,1,e.latlng);
      var m = L.marker([POIs[nearest].latitudeCenter, POIs[nearest].longitudeCenter], {
        bounceOnAdd: true,
        bounceOnAddOptions: { },
        bounceOnAddCallback: function () { }
      });
    });
    L.popup("#ffffff")
      .setContent(fakeBtn)
      .setLatLng(e.latlng)
      .openOn(mymap);
  });
}


async function onClickMarker (mymap, mark,popup,distance = null)  {
  // var speec = window.speechSynthesis;
  var availableVoices =  setSpeech();
  availableVoices.then(voice => {
        console.log(voice)
        mark.bindPopup(popup).addTo(mymap);
        var msg = new SpeechSynthesisUtterance(POIs[nearest].description.en);
        msg.voice = voice[5]
        speec.speak(msg);
        mark.openPopup();
  });

}

function changeDestination(mymap, m){
  for (key in POIs){
    // if(new L.LatLng(POIs[key].latitudeCenter,POIs[key].longitudeCenter) == m.getLatLng() ){
    if(POIs[key].latitudeCenter == m["latlng"].lat && POIs[key].longitudeCenter == m["latlng"]  .lng ){
      nearest = key;
      // console.log("NEW NEAREST " + nearest )
      control.spliceWaypoints(control.getWaypoints().length - 1, 1,m["latlng"])
    }
  }
}
function createButton(label) {
  var btn = L.DomUtil.create('button', "#000000");
  btn.setAttribute('type', 'button');
  btn.innerHTML = label;
  return btn;
}

function setSpeech() {
    return new Promise(
        function (resolve, reject) {
            let synth = window.speechSynthesis;
            let id;
            id = setInterval(() => {
                if (synth.getVoices().length !== 0) {
                    resolve(synth.getVoices());
                    clearInterval(id);
                }
            }, 10);
        }
    )
}
