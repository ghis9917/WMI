var lat, lon;
var searchControl;
var control = null;
var distanceRouting = null;
var routingMode = 'foot'
var mymap;
var POIs = {}
var Desc = {}
/*Sets up the map are of the html file
*/
var currentLocation;

$(document).ready(function () {
  newMap();
});

function newMap(data = null) {
  if (data !== null) {
    return reloadMap(data);
  } else {
    return createFirstMap();
  }
}

/*Reloads the last map to center the
  map on the current user position.
*/
function reloadMap(data) {
  /*TODO: This function recreates a map
          exactly like createFirstMap()
          would do, but it takes data
          which containts all the data
          it needs to reload all the things
          created on the last map.
  */
}

/*To be called only in the html file
  when the user page is loaded.
  It creates the first map in the page,
  when the maps has to be reloaded with JS
  it must be called the newMap() method with
  the optional parameter.
*/
const createFirstMap = () => {
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
    maxBoundsViscosity: 1.0
  });
  var layer = addLayer();
  layer.addTo(mymap);
  //var latlngs = L.rectangle(bounds).getLatLngs();
  //L.polyline(latlngs[0].concat(latlngs[0][0])).addTo(mymap);

  mymap = getLocation(mymap, currentLocation);
  addButton(mymap, currentLocation);
  addControlListener(mymap, currentLocation);
  var obj = ("#search-nogps");
  //addGeoSearch(mymap);

  onClick(mymap);
  currentLocation.addTo(mymap);
  /*window.setInterval(function(){
    mymap = getLocation(mymap, currentLocation);
  }, 5000);*/

  return mymap
}


// const onClickMarker = (mymap, mark) => {
//   mark.on('click', function (e) {
//     var removeBtn = createButton('Remove Waypoint');
//
//     L.DomEvent.on(removeBtn, 'click', function () {
//       mymap.closePopup();
//       var route = control.getWaypoints();
//       for (var i = 0; i < route.length; i++) {
//         if ((route[i].latLng === mark.getLatLng()) && (i != 0)) {
//           route.splice(i, 1);
//         }
//       }
//       console.log(route);
//       control.setWaypoints(route);
//       mymap.removeLayer(mark);
//     });
//     mark.bindPopup(removeBtn, "#ffffff");
//
//     /*L.popup()
//         .setContent(container)
//         .setLatLng(mark.getLatLng())
//         .openOn(mymap);*/
//   });
// }

const onClickMarker = (mymap, mark) => {
  mark.on('click', function (e) {
    // var Description = createButton('Description');
    // var removeBtn = createButton('Description');
    L.DomEvent.on(removeBtn, 'click', function () {
      control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
      // alert(Desc[mark.getLatLng()]);
    });
    mark.bindPopup(removeBtn, "#ffffff");

    /*L.popup()
        .setContent(container)
        .setLatLng(mark.getLatLng())
        .openOn(mymap);*/
  });
}

const onClick = (mymap) => {
  mymap.on('click', function (e) {
    var addBtn = createButton('Add Waypoint');
    var fakeBtn = createButton("fakePos");

    L.DomEvent.on(addBtn, 'click', function () {
      mymap.closePopup();
      var newMarker = L.marker(e.latlng);
      onClickMarker(mymap, newMarker);
      newMarker.addTo(mymap);
      if ((control.getWaypoints())[1].latLng === null) {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
      } else {
        var route = control.getWaypoints();
        route.push(e.latlng);
        console.log(route);
        control.setWaypoints(route);
      }
    });
    L.DomEvent.on(fakeBtn, 'click', function () {
      mymap.closePopup();
      console.log(e);
      lat = e.latlng.lat;
      lon = e.latlng.lng;
      currentLocation.setLatLng(e.latlng);
      control.spliceWaypoints(0, 1, e.latlng);
      askDst(1);
    });
    var div = L.DomUtil.create("div", "");
    div.appendChild(addBtn);
    div.appendChild(fakeBtn);
    L.popup("#ffffff")
      .setContent(div)
      .setLatLng(e.latlng)
      .openOn(mymap);
  });
}
/*Adds a rounting calculator to the map
 */
function addRouting(mymap) {
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

  askDst(2);
}

function validator(d){
  var list = d.split(":")
  try{
    // console.log(OpenLocationCode.decode(list[2]))
    return OpenLocationCode.decode(list[2])
  }catch{
    return false
  }
}

function ajax1(q, API_KEY){
  return $.ajax({
    url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + q + "&key=" + API_KEY+"&maxResults=50",
    success: function (data) {
      $.each(data.items, (key, item) => {
        console.log(item);
        if ((prova = validator(item.snippet.description)) !== false){
          POIs[item.snippet.title] = prova
          POIs[item.snippet.title].videoId = item.id.videoId
        }
      });
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function ajax2(search,ll){

  var url = 'https://lookup.dbpedia.org/api/search/KeywordSearch?QueryString='+ search.replace(/ /g, "+");
  console.log(url)

 return  $.ajax({
    url: 'https://lookup.dbpedia.org/api/search/KeywordSearch?QueryString='+ search,
    success: function processResult(apiResult){
      console.log( apiResult)
      try{

        console.log( apiResult.query.search[0].title)
        Desc[ll] = apiResult.query.search[0].title
      }
      catch{

      }
    }
    });
  }





//
// function fetchResults(searchQuery) {
//   $.when(ajax2(searchQuery)).done(function(){
//
//          });
//      });

//   const endpoint = "https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=" + searchQuery ;
//   fetch(endpoint)
//   .then(response => response.json())
//   .then(data => {
//     const results = data.query.search;
//     console.log(results);
// });
// }

function askDst(val) {
  var API_KEY = "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI";
  var q = "", vid;

  // else if(val == 3) //controlla distanza per avviare audio o farlo in automatico
  if(val == 2){ //Primo caso, trova il punto piu vicino
    q += OpenLocationCode.encode(lat, lon, 4);
    $.when(ajax1(q, API_KEY)).done(function(){           //inserisce i marker trovati su youtube, da fare solo una volta (?)
      var dsts = distFromUser(POIs);
      $.each(POIs, (key, item) => {
        var latlng = L.latLng(item.latitudeCenter, item.longitudeCenter);
        var newMarker = L.marker(latlng);
        $.when(ajax2(key,latlng)).done(function(){
          console.log("KEY SEARCHED IS: " + key)
        });
        onClickMarker(mymap, newMarker);
        newMarker.addTo(mymap);
        // if ((control.getWaypoints())[1].latLng === null) {
        //   // control.spliceWaypoints(control.getWaypoints().length - 1, 1, latlng);
        // } else {
        //
        //   // control.setWaypoints(route);
        //
        // }
        // var marker = L.marker([item.latitudeCenter, item.longitudeCenter]).addTo(mymap);
      });
      control.spliceWaypoints(control.getWaypoints().length - 1, 1,L.latLng([dsts.poi.latitudeCenter,dsts.poi.longitudeCenter]));
      var route = control.getWaypoints();
      route.push(latlng);
      // the code here will be executed when all four ajax requests resolve.
      // a1, a2, a3 and a4 are lists of length 3 containing the response text,
    });
  }
  else{
    //aggiornata posizione controllare se e' a meno di 10metri
    var dist = distFromUser(dsts);
    if(dist.distance < 10){
      console.log("ARRIVATO")
    }

  }

    // for (Object.keys(POIs)){
  //   console.log(key)
  //   console.log(POIs[key]["latitudeLo"])
  // }

}

/*function askDst(d = null) {
  $.ajax({
    type: "get",
    url: "/poi",
    success: function (r) {
      $.each(r, function (i, item) {
        var marker = L.marker([r[i].lat, r[i].lng]).addTo(mymap);
      });
      var dsts = distFromUser(r);
      console.log(dsts);
      if (d !== null) {
        console.log(dsts.distance);
        if (dsts.distance < 10) {
          console.log("play audio!");
        }
      } else {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, dsts.poi);
      }
    }
  });
}*/
function ajax3(url){
  try{
  return   $.ajax({
      type: "get",
      async: false,
      url: url
    });
  }
  catch{
    console.log("CATCH ERROR")
  }
}

function distFromUser(list) {
  var ret,it;
  var min = 40075000;
  console.log(list)
  $.each(list, function (i, item) {
    var url = "https://graphhopper.com/api/1/matrix?from_point=" + lat + "," + lon;
    url += "&to_point=" + list[i].latitudeCenter + "," + list[i].longitudeCenter;
    url += "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=653995f0-72fe-4af8-b598-60e50479a0c2";
      $.when(ajax3(url)).done(function(data){
        var index;
        $.each(data.distances[0], function (i, items) {
          if (data.distances[0][i] < min) {
            min = data.distances[0][i];
            index = i;
            it = item;
          }
        });

      });
    });
    ret = {
      distance: min,
      poi: it
    };


  return ret;
}

/*Creates button and it adds it to the
  pop up passed as parameter (container)
 */
function createButton(label) {
  var btn = L.DomUtil.create('button', "#000000");
  btn.setAttribute('type', 'button');
  btn.innerHTML = label;
  return btn;
}

/*Adds button to relocate user location
*/
function addButton(mymap, currentLocation) {
  L.easyButton('<span class="bigodot">&bigodot;</span>', function (btn, map) {
    /*Here now i check the current location:
      If it is equal to (0,0) the it means that the user
      blocked the geolocation or it wasn't available at that time.
      Else it just centers the map on the last current location found.
      TODO: update the location when the user moves.
    */
    if (currentLocation.getLatLng().lat !== 0 && currentLocation.getLatLng().lng !== 0) {
      mymap.fitBounds(L.latLngBounds([currentLocation.getLatLng()]));
    } else {
      mymap = getLocation(mymap, currentLocation);
    }

  }).addTo(mymap);
}

/*Add a control listener to know when someone used the
  GeoSearch to get the coords of an address
*/
function addControlListener(mymap, currentLocation) {
  mymap.on('geosearch/showlocation', function (e) {
    console.log(e.location.y);
    console.log(e.location.x);
    lat = e.location.y;
    lon = e.location.x;
    currentLocation.setLatLng([lat, lon]);
  });
}
/*Returns the coords of the user current location
*/
function getLocation(mymap, currentLocation) {
  return mymap.locate({ setView: true, watch: true, locateOptions: { enableHighAccuracy: true } })
    .on('locationfound', function (e) {
      lat = e.latitude;
      lon = e.longitude;
      currentLocation.setLatLng([lat, lon]);
      if (control === null) {
        addRouting(mymap);
      } else {
        control.spliceWaypoints(0, 1, L.latLng(lat, lon));
      }

    })
    .on('locationerror', function (e) {
      /*Add a handler:
        we should be able to get the user address
        and search it, maybe suggesting the results
        while they're typing.
      */
      //$("#locationErrorModal").modal();

    });
}

/*Adds a layer to the map area
*/
function addLayer() {
  return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 3,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZnJhbno5OTE3IiwiYSI6ImNrMml5c2FmZDAwZ3YzaG5vODVvdmVxZXUifQ.Dm-BwkGmch8JSsJ9tTpo5w'
  })
}

/*Creates the Control object which let
  the user to search his position by
  typing the address in the search bar
*/

function addGeoSearch(mymap) {
  /*  var GeoSearchControl = window.GeoSearch.GeoSearchControl;
    var OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider;
    console.log(GeoSearchControl);
    var provider = new OpenStreetMapProvider();
    searchControl = new GeoSearchControl({
      provider: provider,
      showMarker: false,
      retainZoomLevel: false,
      animateZoom: true
    });
    return searchControl;*/

  var search = BootstrapGeocoder.search({
    inputTag: 'address',
    placeholder: 'ex. LAX'
  }).addTo(mymap);
}
