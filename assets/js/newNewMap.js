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
var rangeArea = 100;
var youtubeChecked = true;
var redIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
var greyIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png";
var greenIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png";
var blueIcon =
  "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png";

var olcVect = ['2','3','4','5','6',
  '7','8','9','C','F','G','H','J','M','P','Q','R','V','W','X'],
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
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  //Funcioni per la gestione dei bottoni del popup
  $("#aggiornaYT").click(function (e) {
    youtubeChecked = false;
    youtubeSearch();
  });

  $("#updatePoi").click(function (e) {
    if(document.getElementById('refresh').checked == true) {
      youtubeChecked = false;
      youtubeSearch();
    }
    else loadMarker()
  });
  $("#prev").click(function (e) {
    if (actualRouting.length > 0) {
      if (currentDestination > 0) {
        blueMarker(popupIndex);
        currentDestination--;
        popupIndex = actualRouting[currentDestination];
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      } else if (popupIndex == 0 || currentDestination == 0) {
        blueMarker(popupIndex);
        currentDestination = actualRouting.length - 1;
        popupIndex = actualRouting[currentDestination];
        greenMarker(popupIndex);
        populatePopup(popupIndex);distanceFromPlaceToLatLng < 1000
      }
    } else {
      if (popupIndex > 0) {
        blueMarker(popupIndex);
        popupIndex--;
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      } else if (popupIndex == 0) {
        blueMarker(popupIndex);
        popupIndex = Object.keys(POIs).length - 1;
        popupIndex;
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      }
    }
  });

  $("#next").click(function (e) {
    if (actualRouting.length > 0) {
      if (currentDestination < actualRouting.length - 1) {
        blueMarker(popupIndex);
        currentDestination++;
        popupIndex = actualRouting[currentDestination];
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      } else {
        blueMarker(popupIndex);
        currentDestination = 0;
        popupIndex = actualRouting[currentDestination];
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      }
    } else {
      if (popupIndex < Object.keys(POIs).length - 1) {
        blueMarker(popupIndex);
        popupIndex++;
        greenMarker(popupIndex);
        populatePopup(popupIndex);
      } else if (popupIndex == Object.keys(POIs).length - 1) {
        blueMarker(popupIndex);
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
        if (control !== null) {
          control.spliceWaypoints(0, 1, e.latlng);
        }
        updateCustomRoutingModal();
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
       try {
               for (var i in POIs) {
                 mymap.removeLayer(POIs[i].marker);
               }
               currentDestination = 0;
               popupIndex = 0;
               mymap.removeControl(control);
               control = null;
               showCloseInfo();
               infoPopupState = "open";
               actualRouting = [];
             } catch (e) { }
        youtubeChecked = false;
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
    if (infoPopupState == "close") {
      showCloseInfo();
    }



    var currentLocationOLC = OpenLocationCode.encode(
      currentLocation.getLatLng().lat,
      currentLocation.getLatLng().lng,
      6
    );
    $.when(getJson().done(async function () {}))
  } else {
    setTimeout(loadMarker, 1000);
  }
}

function getFilters(valori) {
  var languageSelector = $("#language");
  valori +=
    languageSelector[0].selectedOptions[0].text.toLowerCase() == "default"
      ? " "
      : " " + languageSelector[0].selectedOptions[0].text.toLowerCase();

  var contentSelector = $("#content");
  if (contentSelector[0].selectedOptions.length > 0) {
    for (var selection in contentSelector[0].selectedOptions) {
      if (isNumber(selection)) {
        valori +=
          " " + contentSelector[0].selectedOptions[selection].value + " ";
      }
    }
  }

  var audienceSelector = $("#audience");
  if (audienceSelector[0].selectedOptions.length > 0) {
    for (var selection in audienceSelector[0].selectedOptions) {
      if (isNumber(selection)) {
        valori +=
          " A" + contentSelector[0].audienceSelector[selection].value + " ";
      }
    }
  }

  var detailSelector = $("#detail");
  valori +=
    detailSelector[0].selectedOptions[0].text.toLowerCase() == "default"
      ? " "
      : " P" + detailSelector[0].selectedOptions[0].text.toLowerCase();

  return valori;
}

/**
 * loadMarker Functions
 */

 function extend(obj, src) {
   console.log(' length ' + Object.keys(obj).length)

     for (var key in src) {
        var ind = Object.keys(obj).length + Number(key)
        console.log(' INDICE ' + ind)
        var index = Object.values(obj).indexOf(src[key].name)
        console.log('FOUND THIS ')
        console.log(POIs[index]);
        if ( index > -1) {
          console.log('has test1');
        }
         obj[ind] = src[key];onchange
     }
     return obj;
 }

function getPOIs(OLC , cont) {
  var valori ='';
  valori = getFilters(valori);
  console.log('FILTRI')
  console.log(valori);
  return $.ajax({
    type: "get",
    url: "/prova?searchQuery="+ OLC + "&filter=" + valori + "&contPOI=" + cont + "&mode=user",
    success: function (data) {
      if(data != "Finito")  POIs = extend(POIs, data);
    }
  });
}

function changeArea(id){
  rangeArea = $('#'+id).val();
  $("#rangeAreaText").text("Area di Ricerca - "+rangeArea+"m");
}

async function displayPOIs() {
  try {
    mymap.setView(currentLocation, 12);
  } catch (e) { }

  for (let place in POIs) {
    var distanceFromPlaceToLatLng = currentLocation.getLatLng().distanceTo(
      L.latLng(
        POIs[place].coords.latitudeCenter,
        POIs[place].coords.longitudeCenter
      )
    );
    if(POIs[place].marker == undefined && distanceFromPlaceToLatLng < rangeArea){
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


function youtubeSearch(){
    if (currentLocation == null) {
      return;
    }
    if (infoPopupState == "close") {
      showCloseInfo();
    }
    var currentLocationOLC = OpenLocationCode.encode(
      currentLocation.getLatLng().lat,
      currentLocation.getLatLng().lng,
      6
    );
    var defOLC = OpenLocationCode.encode(
      currentLocation.getLatLng().lat,
      currentLocation.getLatLng().lng,
      4
    );
    var eigthOLC = OpenLocationCode.encode(
      currentLocation.getLatLng().lat,
      currentLocation.getLatLng().lng,
      8
    );
    defOLC = defOLC.replace('0000+','');
    customdirectionsButton.state("loading");
    var contOLC = 10;
    var decoded = OpenLocationCode.decode(currentLocationOLC);
    currentLocationOLC = currentLocationOLC.replace("+", "");
    eigthOLC = eigthOLC.replace("+", "");
    var encoded = ''+ eigthOLC + " " +currentLocationOLC;

    var x = currentLocationOLC[currentLocationOLC.length-3];
    var y = currentLocationOLC[currentLocationOLC.length-4];

    for (var pair in coordVect){
        try{
            encoded += " " + defOLC + olcVect[olcVect.indexOf(y)+coordVect[pair][1]] + olcVect[olcVect.indexOf(x)+coordVect[pair][0]] + '00';
        }catch(err){
            continue;
        }
    }
    encoded += " " + defOLC + "0000";
    console.log(encoded);

    var poggio = encoded.split(' ');
      var query1 = poggio[0] + ' ' + poggio[1];
      var query2 = poggio[2] + ' ' + poggio[3] + ' ' + poggio[4];
      var query3 = poggio[5] + ' ' + poggio[6] + ' ' + poggio[7];
      var query4 = poggio[8] + ' ' + poggio[9] + ' ' + poggio[10];
      console.log(query1);
      console.log(query2);
      console.log(query3);
      console.log(query4);
      if(youtubeChecked == false){
        youtubeChecked = true;
        $.when(getPOIs(query1, Object.keys(POIs).length) ,getPOIs(query2,
         Object.keys(POIs).length),getPOIs(query3, Object.keys(POIs).length),getPOIs(query4, Object.keys(POIs).length))
         .done(async function () {
           try {
                   for (var i in POIs) {
                     mymap.removeLayer(POIs[i].marker);
                   }
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


async function  validatePoi(json){
  var cont = 0;
  var temp = {}
  for(var place in json){
    var distanceFromPlaceToLatLng = currentLocation.getLatLng().distanceTo(
      L.latLng(
        json[place].coords.latitudeCenter,
        json[place].coords.longitudeCenter
      )
    );
    var filterOrigin = '',check = false;
    filterOrigin = getFilters(filterOrigin);
    var filter = filterOrigin.split(' ');
    for(var i in filter){
      if(json[place].youtubeDescription.includes(filter[i])) check = true;
      else {
        check = false;
        break;
      }
    }
    if(distanceFromPlaceToLatLng < rangeArea && check == true){
      temp[cont] = json[place];
      cont++;
      var poi = L.marker(
        [json[place].coords.latitudeCenter, json[place].coords.longitudeCenter],
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
      json[place].marker = poi;
      await sleep(100);
    }
  }
  POIs = temp;
  if(Object.keys(POIs).length == 0) {
    if(youtubeChecked == false)  if (confirm("Nessun POI trovato con queste richieste. Vuoi cercare su YT?")) youtubeSearch();
  else{
    youtubeChecked = true;
    var zoom = 18;
    if(rangeArea > 300) zoom = 16;
    if(rangeArea > 800) zoom = 14;
    if(rangeArea > 1300) zoom = 13;
    mymap.setView(currentLocation.getLatLng(),zoom)
    if(customRouting == undefined){
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
}



/**
 * loadMarker Functions
 */
