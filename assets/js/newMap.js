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

$(document).ready(async function(){
  createMap();
  await loadMarker();

});

$("#stop").click(function(){
  document.getElementById('dad').hidden = true;
  try{
    document.getElementById('iframe').stop();
  }
  catch{}
});
//
// const onClick = (mymap) => {
//   mymap.on('click', function (e) {
//     var addBtn = createButton('Add Waypoint');
//     var fakeBtn = createButton("fakePos");
//
//     L.DomEvent.on(addBtn, 'click', function () {
//       mymap.closePopup();
//       waypoints.push(L.latLng([0, 0]));
//       var newMarker = L.marker(e.latlng);
//       onClickMarker(mymap, newMarker);
//       newMarker.addTo(mymap);
//       if ((control.getWaypoints())[1].latLng === null) {
//         control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
//       } else {
//         var route = control.getWaypoints();
//         route.push(e.latlng);
//         console.log(route);
//         control.setWaypoints(route);
//       }
//     });
//     L.DomEvent.on(fakeBtn, 'click', function () {
//       mymap.closePopup();
//       console.log(e);
//       lat = e.latlng.lat;
//       lon = e.latlng.lng;
//       currentLocation.setLatLng(e.latlng);
//       control.spliceWaypoints(0, 1, e.latlng);
//       askDst(1);
//     });
//     var div = L.DomUtil.create("div", "");
//     div.appendChild(addBtn);
//     div.appendChild(fakeBtn);
//     L.popup("#ffffff")
//       .setContent(div)
//       .setLatLng(e.latlng)
//       .openOn(mymap);
//   });
// }

function createMap() {
  // currentLoc1ation

  var bounds = new L.LatLngBounds(new L.LatLng(-90, -180), new L.LatLng(90, 180));
  mymap = L.map('mapid', {
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic21vZzk4IiwiYSI6ImNrMnh2c2s5ZDAxbW0zY2x2dWMybnQ4cHEifQ.QiPAgRSCZxhtoLHwEsegGw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 3,
    id: 'mapbox.streets'
  }).addTo(mymap);

  mymap.locate({ setView: false, watch: true, maxZoom: 18 });

  mymap.on('locationfound', function (e) {
    console.log("posizione trovata")
      lat = e.latitude;
      lon = e.longitude;
      if (currentLocation === undefined) currentLocation = L.marker([lat, lon]).addTo(mymap);
      else {
        currentLocation.setLatLng([lat, lon]);
      }
      mymap.setView(currentLocation.getLatLng(), 15);
  })

  mymap.on('locationerror', function (e) {console.log("posizione non trovata")});
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

function findDescription(q){
  var vector = q.split(" ");
  for(string in vector){
    vector[string] = "%27" + vector[string] + "%27";
    vector[string] = vector[string].toUpperCase();
  }


  var progress=20;
  return $.ajax({
    type: 'get',
    url: "/getMammt?data="+vector+"&que="+q  ,
    success: function(data) {
    },
    error: function(e) {
        console.log(e);
    }
  });
}

function findFinalDescription(desc){
  return $.ajax({
    type: 'get',
    url: desc,
    success: function(data) {
    },
    error: function(e) {
        console.log(e);
    }
  });
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadMarker(){
    if(typeof lat !== "undefined"){
      var q = OpenLocationCode.encode(lat, lon, 4);
      q = q.replace("+","");
      $.when(getPOIs(q)).done(async function(){
        for(key in POIs){
            $.when(findDescription(key)).done(function(desc){
                if(desc != "Not Found"){
                  $.when(findFinalDescription(desc)).done(function(data){
                      for(k in data){
                          var mm = data[k];
                          if(typeof mm["http://www.w3.org/2000/01/rdf-schema#comment"] !== "undefined"){

                            console.log(mm["http://www.w3.org/2000/01/rdf-schema#comment"][0].lang)
                            console.log(mm["http://www.w3.org/2000/01/rdf-schema#comment"][0].value)
                          }
                          //console.log(val);
                      }
                      return;
                  });
                }
            });
          }

        mymap.setView(currentLocation.getLatLng(),15);
      });
    }
    else{
        setTimeout(loadMarker, 1000);
    }
}
