/**
 * Variabili globali per evitare passaggio di parametri nelle funzioni
 */
var mymap;
var currentLocation = null;
var currentDestination = 0;
var popupIndex = 0;
var customdirectionsButton = null;
var customRouting = undefined;
var POIs = {};
var control = null;
var routingMode = "foot";
var infoPopupState = "open";
var actualRouting = [];
var rangeArea = 40075 * 1000;
var youtubeChecked = true;
var currentPOI = 0;
var redIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
var greyIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png";
var greenIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png";
var blueIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png";

var orangeIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png";

var olcVect = ['2', '3', '4', '5', '6',
  '7', '8', '9', 'C', 'F', 'G', 'H', 'J', 'M', 'P', 'Q', 'R', 'V', 'W', 'X'],
  coordVect = [
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, 0],
    [1, -1],
  ];
/**
 * Funzione che gestisce l'avvio dell'applicazione
 */
$(document).ready(async function () {
  //Aggiunge agli script quello per la getione degli iframe di youtube
  var tag = document.createElement("script");
  tag.src = "https://youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  //Funcioni per la gestione dei bottoni del popup
  $("#aggiornaYT").click(function (e) {
    youtubeChecked = false;
    youtubeSearch();
  });

  $("#updatePoi").click(function (e) {
    if (document.getElementById('refresh').checked == true) {
      youtubeChecked = false;
      if (currentLocation == null) $("#noGeo").modal();
      loadMarker();
      youtubeSearch();
    }
    else {
      youtubeChecked = true;
      if (currentLocation == null) $("#noGeo").modal();
      loadMarker();
    }
  });
  $(".prev").click(function (e) {

if (actualRouting.length == 0) {
      if (popupIndex > 0) {
        blueMarker(popupIndex);
        popupIndex--;
        getVideoId(POIs[popupIndex],0)
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      } else if (popupIndex == 0) {
        blueMarker(popupIndex);
        popupIndex = Object.keys(POIs).length - 1;
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      }
}
else{
  if (popupIndex > 0) {
    try{
      console.log('.options.iconUrl');
      if(!(POIs[popupIndex].marker.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
      orangeMarker(currentPOI);
    }catch(e){
      console.log('.options.icon.iconUrl');
      if(!(POIs[popupIndex].marker.options.icon.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
      orangeMarker(currentPOI);
    }
    popupIndex--;
    getVideoId(POIs[popupIndex],0)
    greenMarker(popupIndex);
    populatePopup(popupIndex);
  } else if (popupIndex == 0) {
    try{
      console.log('.options.iconUrl');
      if(!(POIs[popupIndex].marker.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
      orangeMarker(currentPOI);
    }catch(e){
      console.log('.options.icon.iconUrl');
      if(!(POIs[popupIndex].marker.options.icon.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
      orangeMarker(currentPOI);
    }
    popupIndex = Object.keys(POIs).length - 1;
    greenMarker(popupIndex);
    populatePopup(popupIndex);
  }
}
  });

  $(".next").click(function (e) {
    if (actualRouting.length == 0) {
      console.log("mmmmm")
      if (popupIndex < Object.keys(POIs).length - 1) {
        blueMarker(popupIndex);
        popupIndex++;
        getVideoId(POIs[popupIndex],0)
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      } else if (popupIndex == Object.keys(POIs).length - 1) {
        blueMarker(popupIndex);
        popupIndex = 0;
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      }
    }
    else{
      if (popupIndex < Object.keys(POIs).length - 1) {
        console.log(POIs[popupIndex].marker.options.iconUrl);
        console.log(POIs[popupIndex]);
        try{
          console.log('.options.iconUrl');
          if(!(POIs[popupIndex].marker.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
          orangeMarker(currentPOI);
        }catch(e){
          console.log('.options.icon.iconUrl');
          if(!(POIs[popupIndex].marker.options.icon.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
          orangeMarker(currentPOI);
        }
        popupIndex++;
        getVideoId(POIs[popupIndex],0)
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      } else if (popupIndex == Object.keys(POIs).length - 1) {
        try{
          console.log('.options.iconUrl');
          if(!(POIs[popupIndex].marker.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
          orangeMarker(currentPOI);
        }catch(e){
          console.log('.options.icon.iconUrl');
          if(!(POIs[popupIndex].marker.options.icon.options.iconUrl.includes('orange'))) blueMarker(popupIndex);
          orangeMarker(currentPOI);
        }
        popupIndex = 0;
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      }
    }
  });
  $("#stop").on("click", function () {
    if (actualRouting.length == 0) {
      for (poi in POIs) {
        POIs[poi].visited = false;
        blueMarker(poi);
      }
      actualRouting = [];

      currentDestination = 0;
      popupIndex = 0;
      mymap.removeControl(control);
      control = null;
      customdirectionsButton.state("start");
    }
  });

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
    addFilterButton();

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
  console.log("ciao, sono nel a")
  if (actualRouting.length == 0) {
    /*try {
      currentDestination = 0;
      popupIndex = 0;
      mymap.removeControl(control);
      control = null;
      showCloseInfo();
      infoPopupState = "open";
      actualRouting = [];
    } catch (e) { }*/

    getJson();
  }
}

function onError(err) {
  $("#noGeo").modal();
}

function onClick() {
  mymap.on("click", function (e) {
    if (infoPopupState == "close") {
      showCloseInfo();
      blueMarker(popupIndex);
      blueMarker(actualRouting[currentDestination]);
    } else {
      var fakePositionBtn = createButton("Simula Posizione");
      L.DomEvent.on(fakePositionBtn, "click", function () {
        mymap.closePopup();
        currentLocation.setLatLng(e.latlng);

          if (control !== null ) {
            console.log(control.getWaypoints());
            control.spliceWaypoints(0, 1, e.latlng);
          }

        updateCustomRoutingModal();
        if (actualRouting.length == 0) {
          /*try {
            currentDestination = 0;
            popupIndex = 0;
            mymap.removeControl(control);
            control = null;
            showCloseInfo();
            infoPopupState = "open";
            actualRouting = [];
          } catch (e) { }*/
          getJson();
        }
        console.log("invece sono qua, click");
      });
      L.popup("#ffffff")
        .setContent(fakePositionBtn)
        .setLatLng(e.latlng)
        .openOn(mymap);
    }
  });
}
/**
 * createMap Functions
 */

/**
 * Loads marker with descriptions and images
 */
function getJson() {
  return $.ajax({
    type: "get",
    url: "/POIs.json",
    success: function (data) {
      youtubeChecked = false;
      console.log(data)
      try {
        currentDestination = 0;
        popupIndex = 0;
        mymap.removeControl(control);
        control = null;
        showCloseInfo();
        infoPopupState = "open";
        actualRouting = [];
      } catch (e) { }
      validatePoi(data);
      //chiama funzione per disegnare con i filtri
      console.log("HO RICEVUTO JSON");
    }
  });
}

function loadMarker(value) {
  if (value != undefined && currentLocation == null) {
    return;
  }
  if (currentLocation !== null) {
    console.log(' current location non null loadMarker');

    if (infoPopupState == "close") {
      showCloseInfo();
    }
    var currentLocationOLC = OpenLocationCode.encode(
      currentLocation.getLatLng().lat,
      currentLocation.getLatLng().lng,
      6
    );
    if (actualRouting.length == 0) {
      try {
        currentDestination = 0;
        popupIndex = 0;
        mymap.removeControl(control);
        control = null;
        showCloseInfo();
        infoPopupState = "open";
        actualRouting = [];
      } catch (e) { }
    }
    $.when(getJson().done(async function () { }))
  } else {
    console.log(' current location non null loadMarker');

    setTimeout(loadMarker, 1000);
  }
}



/**
 * loadMarker Functions
 */


function getPOIs(OLC, cont) {
  var valori = '';
  valori = getFilters(valori);
  console.log('FILTRI')
  console.log(valori);
  return $.ajax({
    type: "get",
    url: "/prova?searchQuery=" + OLC + "&filter=" + valori + "&contPOI=" + cont + "&mode=user",
    success: function (data) {
      var el = 'totalResults'
      console.log(data.totalResults)
      console.log(data);
      if (data != "Finito") POIs = data;
    }
  });
}

function changeArea(id) {
  var temp = $('#' + id).val();
  if (temp != 11) {
    $("#rangeAreaText").text("Area di Ricerca - " + temp + " Km");
    rangeArea = temp * 1000;
  } else {
    $("#rangeAreaText").text("Area di Ricerca - Tutto");
    rangeArea = 40075 * 1000;
  }
}

async function displayPOIs() {
  try {
    mymap.setView(currentLocation, 12);
  } catch (e) { }

  for (let place in POIs) {
    var distanceFromPlaceToLatLng = currgreenentLocation.getLatLng().distanceTo(
      L.latLng(
        POIs[place].coords.latitudeCenter,
        POIs[place].coords.longitudeCenter
      )
    );
    if (POIs[place].marker == undefined && distanceFromPlaceToLatLng < rangeArea) {
      var poi = L.marker(
        [POIs[place].coords.latitudeCenter, POIs[place].coords.longitudeCenter],
        {
          bounceOnAdd: true,
          bounceOnAddOptions: {},
          bounceOnAddCallback: function () { }
        }
      ).addTo(mymap);
      poi.on("click", function () {
        if (actualRouting.length != -1) {
          try {
            blueMarker(popupIndex);
          } catch (error) {
            blueMarker(actualRouting[currentDestination]);
          }
          popupIndex = place;
          greenMarker(popupIndex);
          populatePopup(popupIndex);
          if (infoPopupState == "open") {
            showCloseInfo();
          }
        } else {
          blueMarker(popupIndex);
          popupIndex = place;
          greenMarker(place);
          populatePopup(place);
          if (infoPopupState == "open") {
            showCloseInfo();
          }
        }
      });
      POIs[place].marker = poi;
      await sleep(100);
    } else console.log('gia disegnato')
  }
  updateCustomRoutingModal();
  customdirectionsButton.state("start");
}

function getOLCWithPrecision(p) {
  return OpenLocationCode.encode(
    currentLocation.getLatLng().lat,
    currentLocation.getLatLng().lng,
    p
  );
}

function youtubeSearch() {
  if (currentLocation !== null) {
    console.log(' current location non null yoputube search');
    if (infoPopupState == "close") {
      showCloseInfo();
    }
    var defOLC = getOLCWithPrecision(4);
    var currentLocationOLC = getOLCWithPrecision(6);

    defOLC = defOLC.replace('0000+', '');
    customdirectionsButton.state("loading");
    var contOLC = 10;
    var decoded = OpenLocationCode.decode(currentLocationOLC);
    currentLocationOLC = currentLocationOLC.replace("+", "");
    var encoded = '' + currentLocationOLC;

    var x = currentLocationOLC[currentLocationOLC.length - 3];
    var y = currentLocationOLC[currentLocationOLC.length - 4];

    for (var pair in coordVect) {
      try {
        encoded += " " + defOLC + olcVect[olcVect.indexOf(y) + coordVect[pair][1]] + olcVect[olcVect.indexOf(x) + coordVect[pair][0]] + '00';
      } catch (err) {
        continue;
      }
    }
    encoded += " " + defOLC + "0000";
    if (youtubeChecked == false) {
      youtubeChecked = true;
      console.log('STO CHIAMANDO GETPOIS');
      $.when(getPOIs(encoded, Object.keys(POIs).length))
        .done(async function () {
          try {
            currentDestination = 0;
            popupIndex = 0;
            mymap.removeControl(control);
            control = null;
            showCloseInfo();
            infoPopupState = "open";
            actualRouting = [];
          } catch (e) { }
          await validatePoi(POIs);
          if (Object.keys(POIs).length == 0) alert('Non riusciamo a trovare nessuno POI con le preferenze che hai inserito!');
        })
    }
  }
  else {
    console.log(' current location null yoputube search');

    setTimeout(youtubeSearch, 1000);
  }
}





async function validatePoi(json) {
  console.log("entro")
  var cont = 0;
  var temp = {}
  for (var place in json) {
    var distanceFromPlaceToLatLng = currentLocation.getLatLng().distanceTo(
      L.latLng(
        json[place].coords.latitudeCenter,
        json[place].coords.longitudeCenter
      )
    );
    var filterOrigin = '', check = false;
    filterOrigin = getFilters(filterOrigin);
    var filter = filterOrigin.split(' ');

    if (distanceFromPlaceToLatLng < rangeArea && checkFiltersPOI(filter, json[place].youtubeDescription)) {
      temp[cont] = json[place];

      var poi = L.marker(
        [json[place].coords.latitudeCenter, json[place].coords.longitudeCenter]
        // ,
        // {
        //   bounceOnAdd: true,
        //   bounceOnAddOptions: {},
        //   bounceOnAddCallback: function () { }
        // }
      )
        .addTo(mymap);



      poi.on("click", function (mark) {
        console.log(mark);
        if (actualRouting.length != -1) {
          // try {
          //   blueMarker(popupIndex);
          // } catch (error) {
          //   blueMarker(actualRouting[currentDestination]);
          // }
          for (var key in POIs) {
            if (POIs[key].marker.getLatLng().lat == mark.latlng.lat && POIs[key].marker.getLatLng().lng == mark.latlng.lng) popupIndex = key;
          }
          greenMarker(popupIndex);
          populatePopup(popupIndex);
          //TODOCIAO
          getVideoId(POIs[popupIndex],0);

        } else {
          // blueMarker(popupIndex);
          for (var key in POIs) {
            if (POIs[key].marker.getLatLng().lat == mark.latlng.lat && POIs[key].marker.getLatLng().lng == mark.latlng.lng) popupIndex = key;
          }
          greenMarker(popupIndex);
          populatePopup(popupIndex);
          //TODOCIAO
          getVideoId(POIs[popupIndex],0);
        }
        $('#clipContainer').show()
      });

      temp[cont].marker = poi;
      cont++;
      if (Object.keys(POIs).length == 0) await sleep(1);
    }
  }
    try {
      for (var i in POIs) {
        mymap.removeLayer(POIs[i].marker);
      }
    }
    catch (e) { }


  POIs = temp;
  if (Object.keys(POIs).length == 0) {
    if (youtubeChecked == true) {
      if (confirm("Nessun POI trovato con queste richieste. Vuoi cercare su YT?")) youtubeSearch();
    }
  }
  else {
    youtubeChecked = true;
    mymap.setView(currentLocation.getLatLng(), 14)
    if (customRouting == undefined) {
      customRouting = L.easyButton({
        states: [
          newState("custom", "fa fa-magic", "Custom way", function (btn) {
            $("#customRoutingContainer").modal({
              backdrop: "static",
              keyboard: false
            });
          })
        ]
      }).addTo(mymap);
      console.log('CUSTOM ROUTING')
      console.log(customRouting);
    }
    updateCustomRoutingModal();
    customdirectionsButton.state("start");
  }
}



/**
 * loadMarker Functions
 */
