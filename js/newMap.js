/*Pure OpenStreetMaps
function newMap(){
  map = new OpenLayers.Map("demoMap");
  map.addLayer(new OpenLayers.Layer.OSM());
  map.zoomToMaxExtent();
}*/

function addLayer(mymap){
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZnJhbno5OTE3IiwiYSI6ImNrMHp2aDE3ZTBpNzAzZXB2YmdlNGRrcTUifQ.IsfpDPTiOg-gcCJzF0oL6Q'
  }).addTo(mymap);
}

function askPosition(mymap, cl){
  $('#myModal').modal("show");
}

function newMap(){
  var lat, lon, currentLocation;
  $('#myModal').modal({ show: false});
  currentLocation = L.marker([0, 0]);

  var mymap = L.map('mapid');
  mymap = mymap.locate({setView: true, watch: false})
        .on('locationfound', function(e){
            lat = e.latitude;
            lon = e.longitude;
            currentLocation.setLatLng([lat, lon]);
        })
       .on('locationerror', function(e){
            //TODO: add popup box to ask for Route, City, etc...
            alert("negato");
            askPosition(mymap, currentLocation);
            alert("tua madre vacca");
        });
  currentLocation.addTo(mymap);
  addLayer(mymap);
}
