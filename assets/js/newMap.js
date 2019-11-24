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

<<<<<<< Updated upstream
function onError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

//____________CREATEMAP FUNCTIONS_______________________________________
=======
function setApiKey(){
  this.placesAutocomplete = places({
  appId: 'plTCO8O9NAP7',
  apiKey: 'a5c7d70d42023f9e0afdfa6bac7a2634',
  container: document.querySelector('#address')
  });
}

function cssError(){
      $('.ap-input').css({'backgroundColor':'red'});
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

            loadMarker();
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
      var instruction = e.routes[0].instructions[0].text;
      var distanceChange = e.routes[0].instructions[0].distance
      if(distanceChange <= 10){
        try{
          instruction = e.routes[0].instructions[1].text;
        }
        catch(err){
          console.log(err);
        }
      }

      checkDistance(distance,instruction)
    });
}

function checkDistance(distance,instruction){
  if(distance <= 20){
    //Time to talk description of POI
    var la = POIs[referenceTable[minIndexes[currentDestination]]].latitudeCenter;
    var lo = POIs[referenceTable[minIndexes[currentDestination]]].longitudeCenter;
    var mark = new L.marker([la, lo], {
    bounceOnAdd: true,
    bounceOnAddOptions: { },
    bounceOnAddCallback: function () { }
  })
  instruction = POIs[referenceTable[minIndexes[currentDestination]]].description.en;
  }
  onClickMarker(instruction,distance);
}
>>>>>>> Stashed changes

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
  $("#popupTitle").text(referenceTable[currentDestination]);
  $("#popupDescription").text(
    POIs[referenceTable[currentDestination]].description !== "NF"
      ? POIs[referenceTable[currentDestination]].description.it
      : "Non è disponibile nessuna descrizione..."
  );
  $("#popupImg").attr("src", "" + POIs[referenceTable[currentDestination]].img);
  $("#popupImg").attr("style", "width: 50%;height: auto; float: right;");
  $("#popupContainer").css("width", "calc(100% - 2em)");
}

function elaborateDistance() {
  var count = 0;
  var url =
    "https://graphhopper.com/api/1/matrix?from_point=" + lat + "," + lon;
  for (var i in POIs) {
    referenceTable[count] = i;
    count++;
    url +=
      "&to_point=" + POIs[i].latitudeCenter + "," + POIs[i].longitudeCenter;
  }
  url +=
    "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=653995f0-72fe-4af8-b598-60e50479a0c2";
  $.when(getDistance(url)).done(function() {
    var min = 40075000;
    var index = null;
    for (var key in DSTs.distances[0]) {
      if (DSTs.distances[0][key] <= min) {
        min = DSTs.distances[0][key];
        index = key;
      }
    }
    routingTo(POIs[referenceTable[index]]);
    currentDestination = index;
    populatePopup();
  });
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
  currentDestination--;
  populatePopup();
});

$("#next").on("click", function() {
  currentDestination++;
  populatePopup();
});

//____________CREATEPLAYER FUNCTIONS_______________________________________
