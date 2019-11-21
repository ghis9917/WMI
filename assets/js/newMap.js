var lat, lon;
var searchControl;
var waypoints = [];
var control = null;
var distanceRouting = null;
var routingMode = 'foot'
var mymap;
var POIs = {}
var DSTs = {}
var dsts, ret;
var nearest;
var speec = window.speechSynthesis;
var currentLocation;
var currentDestination;
var referenceTable = {};
var minIndexes = [];
/*Sets up the map are of the html file
*/
var currentLocation;

$(document).ready(function () {
  createMap();
  loadMarker();
  createPlayer();
});

$("#stop").click(function () {
  $("#popupContainer").css("z-index", "-1");

});

function showInfo(){
  $("#popupContainer").css("z-index", "2");

}
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
    mymap.removeLayer(currentLocation);
  } catch (err){
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
    var la = POIs[referenceTable[minIndexes[currentDestination]]].latitudeCenter;
    var lo = POIs[referenceTable[minIndexes[currentDestination]]].longitudeCenter;
    var mark = new L.marker([la, lo], {
    bounceOnAdd: true,
    bounceOnAddOptions: { },
    bounceOnAddCallback: function () { }
  })
    onClickMarker(mymap,mark);
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
      lat = e.latlng.lat;
      lon = e.latlng.lng;
      currentLocation.setLatLng(e.latlng);
      control.spliceWaypoints(0,1,e.latlng);
    });
    L.popup("#ffffff")
      .setContent(fakeBtn)
      .setLatLng(e.latlng)
      .openOn(mymap);
  });
}


async function onClickMarker (mymap, mark)  {
  // var speec = window.speechSynthesis;
  var availableVoices =  setSpeech();
  availableVoices.then(voice => {
        var msg = new SpeechSynthesisUtterance(POIs[referenceTable[minIndexes[currentDestination]]].description.en);
        msg.voice = voice[5]
        speec.speak(msg);
        $("#popupContainer").css("z-index", "2");
        var rout = document.getElementById("newroute");
        rout.hidden = true
  });

}

function changeDestination(mymap, m){
  for (key in POIs){
    if(POIs[key].latitudeCenter == m["latlng"].lat && POIs[key].longitudeCenter == m["latlng"]  .lng ){
      nearest = key;
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


function createPlayer() {
  var timer = null;
  if (Object.keys(POIs).length !== 0) {
    clearTimeout(timer);
    addRouting();
    elaborateDistance();
    addPlayButton();
  } else {
    timer = setTimeout(createPlayer, 1000);
  }
}

function addPlayButton() {
  L.easyButton({
    states: [
      {
        stateName: "starting", // name the state
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
          btn.state("starting");
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
  $.when(getDistance(url)).done(async function() {
    var index = 0;
    do{

      index = createRoute(index);
    }
    while(index != -1);
   currentDestination = 0;
   for(item in minIndexes){
     minIndexes[item] = minIndexes[item] - 1;
   }
   routingTo(POIs[referenceTable[minIndexes[currentDestination]]]);
   populatePopup();
 });
}

function createRoute(i) {
  var min = 40075000;
  var minIndex = -1;
  var exist = 0;
  for (var index in DSTs.distances[i]) {
    if (
      DSTs.distances[i][index] > 0 &&
      DSTs.distances[i][index] <= min
    ) {
      for(item in minIndexes){
        if(minIndexes[item] == index){
          exist = 1;
          break;
        }
      }
      if(exist == 0 && index != 0){
        minIndex = index;
        min = DSTs.distances[i][index];
      }
      exist = 0;
    }
  }
  if(minIndex != -1){
    minIndexes.push(Number(minIndex));
  }
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

function routingTo(p) {
  control.spliceWaypoints(
    control.getWaypoints().length - 1,
    1,
    L.latLng(p.latitudeCenter, p.longitudeCenter)
  );
}

$("#prev").on("click", function() {
  var rout = document.getElementById("newroute");
  rout.hidden = false;
  if (currentDestination !== 0) {
    currentDestination--;
  }
  populatePopup();
});

$("#next").on("click", function() {
  var rout = document.getElementById("newroute");
  rout.hidden = false;
  if (currentDestination !== minIndexes.length - 1) {
    currentDestination++;
  }
  populatePopup();
});

$("#newroute").on("click", function() {
  routingTo(POIs[referenceTable[minIndexes[currentDestination]]]);
});
//____________CREATEPLAYER FUNCTIONS_______________________________________
