
var mymap;
var POIs = {};

var blackIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png";
  
var redIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
var blueIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png";
var currentPoi = null,currentLocation = null;
function callGeoLocationApi() {
  if ($("#addressInput").val() != "") {
    $.ajax({
      async: false,
      url:
        "https://api.opencagedata.com/geocode/v1/json?q=" +
        $("#addressInput").val() +
        "&key=4e6db93d236944d68db1551367316df5&language=it&pretty=1",
      success: result => {
          if (result.results.length != 0) {
            latx = result.results[0].geometry.lat;
            lonx = result.results[0].geometry.lng;
            updateCurrentPoi(latx,lonx,0);
            $("#uploadModal").modal();
			$("#noGeo").modal("toggle");
        } else {
          $(".ap-input").css({ backgroundColor: "red" });
        }
      },
      error: result => {
        $(".ap-input").css({ backgroundColor: "red" });
      }
    });
  } else {
    $(".ap-input").css({ backgroundColor: "red" });
  }
}


function setGeolocationApiKey() {
  $("#btn-load").click(function() {
    callGeoLocationApi();
  });
  this.placesAutocomplete = places({
    appId: "plTCO8O9NAP7",
    apiKey: "a5c7d70d42023f9e0afdfa6bac7a2634",
    container: document.querySelector("#addressInput")
  });
}

function createEditorMap() {
  setGeolocationApiKey();
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
    onClickMap();

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
	routeButton();
    mymap.setView([44.49394, 11.3426944], 12);
    navigator.geolocation.watchPosition(onLocationFound, function(){}, {
      enableHighAccuracy: true,
      maximumAge: 0
    });
    resolve(mymap);
  });
}

function onLocationFound(position) {
	console.log("location found")
  updateCurrentPoi(position.coords.latitude, position.coords.longitude,1);
}

function routeButton(){
	L.easyButton('fa-location-arrow', function(btn, map){
		$("#noGeo").modal();
	}).addTo(mymap);
}

function onClickMap(){
	mymap.on("click", function(e) {
      var fakeBtn = createButton("Aggiungi audio");
      fakeBtn.setAttribute('class','btn btn-outline-dark');
      L.DomEvent.on(fakeBtn, "click", function() {
        mymap.closePopup();
        latx = e.latlng.lat;
        lonx = e.latlng.lng;
        updateCurrentPoi(latx,lonx,0);
        $("#uploadModal").modal();
      });
      L.popup("#ffffff")
        .setContent(fakeBtn)
        .setLatLng(e.latlng)
        .openOn(mymap);
    });	
}


function getIconMarkerOfColor(color) {
  return new L.Icon({
    iconUrl: color,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

function updateCurrentPoi(lat, lon,check) {
  if(check == 0){
  var popupCurrentPoi =
    '<p class="text-center" style="margin: 1em;">Aggiungi audio al POI</p>';
  try {
    mymap.removeLayer(currentPoi);
  } catch (err) {}
	currentPoi = L.marker([lat, lon], {
    icon: getIconMarkerOfColor(blackIcon),
    bounceOnAdd: true,
	bounceOnAddOptions: {},
	bounceOnAddCallback: function() {}
  })
    .bindPopup(popupCurrentPoi)
    .addTo(mymap);
  }
  else{
	var popupCurrentLocation =
    '<p class="text-center" style="margin: 1em;">Sei qui.</p>';
  try {
    mymap.removeLayer(currentLocation);
  } catch (err) {}
	currentLocation = L.marker([lat, lon], {
    icon: getIconMarkerOfColor(redIcon)
  })
    .bindPopup(popupCurrentLocation)
    .addTo(mymap);
  }
}

function loadMarker() {
  if (currentLocation !== null) {
    console.log(currentLocation)
    var currentLocationOCL = OpenLocationCode.encode(
      currentLocation.getLatLng().lat,
      currentLocation.getLatLng().lng,
      4
    );
    currentLocationOCL = currentLocationOCL.replace("+", "");
    $.when(getPOIs(currentLocationOCL)).done(async function() {
      modifyPOI();
    });
  } else {
    setTimeout(loadMarker, 1000);
  }
}

function getPOIs(OCL) {
  var valori = OCL;
	console.log("valore" +valori);
  return $.ajax({
    type: "get",
    url: "/getPOIs?mode=editor&searchQuery=" + valori,
    success: function(data) {
	console.log(data)
      try{
          for(var i in POIs){
            mymap.removeLayer(POIs[i].marker);
          }
      }catch(e){
          console.log(e)
      }
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

async function modifyPOI(){
	
	 for (let place in POIs) {
		    var poi = L.marker(
				  [POIs[place].coords.latitudeCenter, POIs[place].coords.longitudeCenter],
				  {
					bounceOnAdd: true,
					bounceOnAddOptions: {},
					bounceOnAddCallback: function() {}
				  }
				).addTo(mymap);
		poi.on("click", async function() {
			var title = document.getElementById("titleName");
			title.value = POIs[place].name;
			title.disabled = true;
			mymap.removeLayer(poi);
			
			poi = L.marker([POIs[place].coords.latitudeCenter, POIs[place].coords.longitudeCenter], {
				icon: getIconMarkerOfColor(blackIcon)
			})
			.addTo(mymap);
			latx = POIs[place].coords.latitudeCenter;
			lonx = POIs[place].coords.longitudeCenter;
			
			$("#uploadModal").modal();
		});
		POIs[place].marker = poi;
		await sleep(250);
	  }
}
function createButton(label) {
  var btn = L.DomUtil.create("button", "#000000");
  btn.setAttribute("type", "button");
  btn.innerHTML = label;
  return btn;
}
