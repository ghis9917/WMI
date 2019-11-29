//Called by editor map e user map

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
var speec = window.speechSynthesis;
var currentLocation;
var currentDestination;
var referenceTable = {};
var minIndexes = [];
var actualRoute = null;
/*Sets up the map are of the html file
*/
var currentLocation;
$(document).ready(async function() {
    setApiKey();
  if ("http://localhost:8000/userMode.html" == window.location.href || "http://localhost:8000/userMode.html/" == window.location.href || "http://localhost:8000/userMode.html#" == window.location.href) {
     await createMap();
    loadMarker();
    createPlayer();
  }
  $("#btn-load").click(function(){
      callApi();
  });
});

$("#stop").click(function() {
  $("#popupContainer").css("z-index", "-1");

});

function showInfo(){
  $("#popupContainer").css("z-index", "2");

}
function createMap() {
return new Promise((resolve,reject) => {
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
  var popup = "<p class=\"text-center\" style=\"margin: 1em;\">Sei qui!</p>";
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  try{
    mymap.removeLayer(currentLocation);
    control.spliceWaypoints(0, 1, L.latLng(lat, lon));
  } catch (err){
  }
  currentLocation = L.marker([lat, lon]).bindPopup(popup).addTo(mymap);
  // addRouting(mymap);
}


//____________CREATEMAP FUNCTIONS_______________________________________
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
      async: false,
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
            if ("http://localhost:8000/editorMode.html" == window.location.href || "http://localhost:8000/editorMode.html/" == window.location.href || "http://localhost:8000/editorMode.html#" == window.location.href) {
              loadMarker();
            }
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
    console.log("position not found")
    $('#noGeo').modal({ backdrop: 'static', keyboard: false })
}
function addRouting() {
  if (control  !== null) return;
  control = L.routing.control({
    createMarker: function () { return null; },
    addWaypoints: false,
    waypoints: [
      L.latLng(lat, lon)
    ],
    router: L.Routing.graphHopper('a0695b22-2381-4b66-8330-9f213b610d8f', {
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

//____________LOADMARKER FUNCTIONS_______________________________________

function createPlayer() {
  var timer = null;
  if (Object.keys(POIs).length !== 0) {
    clearTimeout(timer);
    addRouting();
    elaborateDistance();
  } else {
    timer = setTimeout(createPlayer, 1000);
  }
}

function addPlayButton() {
  L.easyButton({
    states: [
      {
        stateName: "search", // name the state
        icon: "fas fa-bong", // and define its properties
        title: "Click to get directions to the nearest POI", // like its title
        onClick: function(btn) {
            $('#noGeo').modal({ backdrop: 'static', keyboard: false });
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
  if(POIs[referenceTable[minIndexes[currentDestination]]].img){
    $("#popupImg").attr(
      "src",
      POIs[referenceTable[minIndexes[currentDestination]]].img !== "NF"
        ? POIs[referenceTable[minIndexes[currentDestination]]].img
        : "https://cdn.shopify.com/s/files/1/1552/7487/products/good_game_gg-smiley_fornite_spray_emote_printed_sticker_grfxp_grafixpressions_720x.jpg?v=1525975056"
    );
  }
  $("#popupImg").attr("style", "width: 50%;height: auto; float: right;");
  $("#popupContainer").css("width", "calc(100% - 2em)");
}

function elaborateDistance() {

  var count = 0;
  calculateDistance(lat,lon,0);
  for (var i in POIs){
    referenceTable[count] = i;
    count++;
    calculateDistance(POIs[i].latitudeCenter, POIs[i].longitudeCenter,count);
  }
  count = -1;
  do{
     count = createRoute(count+1);
  }while(count != -1);
  currentDestination = 0;
  routingTo(POIs[referenceTable[minIndexes[currentDestination]]]);
  populatePopup();
  }

  function calculateDistance(slat,slon,index){
    var x = L.latLng(slat,slon);
    DSTs[index] = {};
    for (var i in POIs) {
        var dist = x.distanceTo(L.latLng(POIs[i].latitudeCenter,POIs[i].longitudeCenter))
        DSTs[index][i] = {};
        DSTs[index][i] = dist ;
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
      console.lof
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
  if(currentDestination > 0){
    currentDestination--;
    routingTo(POIs[referenceTable[minIndexes[currentDestination]]]);
    populatePopup();
  }
});

$("#next").on("click", function() {
  if(currentDestination < minIndexes.length -   1){
    currentDestination++;
    routingTo(POIs[referenceTable[minIndexes[currentDestination]]]);
    populatePopup();
  }
});

//____________CREATEPLAYER FUNCTIONS_______________________________________

async function onClickMarker (instruction,distance)  {
  // var speec = window.speechSynthesis;
  var availableVoices =  setSpeech();
  availableVoices.then(voice => {
        var msg = new SpeechSynthesisUtterance(instruction);
        msg.voice = voice[5]
        speec.speak(msg);
        if(distance < 20){
          $("#popupContainer").css("z-index", "2");
          var rout = document.getElementById("newroute");
          rout.hidden = true
        }
  });function createButton(label) {
  var btn = L.DomUtil.create('button', "#000000");
  btn.setAttribute('type', 'button');
  btn.innerHTML = label;
  return btn;
}
}

const onClick = () => {
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

function createButton(label) {
  var btn = L.DomUtil.create('button', "#000000");
  btn.setAttribute('type', 'button');
  btn.innerHTML = label;
  return btn;
}
