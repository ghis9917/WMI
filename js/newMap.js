var lat, lon, searchControl; 

/*Sets up the map are of the html file 
*/
function newMap(){
  var currentLocation;
  currentLocation = L.marker([0, 0]);

  var mymap = L.map('mapid');
  mymap = getLocation(mymap, currentLocation);

  /*Adds a button to Leaflet map but when clicked 
    it sort of delete the Bootstrap Navbar.
    TODO: Find a solution to this issue or another 
          way to let the user get his actual location 
          again.

  L.easyButton('<span class=bigodot>&bigodot;</span>', function(btn, map){
    getLocation(map, currentLocation);
  }).addTo(mymap);*/

  addControlListener(mymap, currentLocation);
  addGeoSearch(mymap);
  addLayer(mymap);
  currentLocation.addTo(mymap);
}

/*Add a control listener to know when someone used the 
  GeoSearch to get the coords of an address
*/
function addControlListener(mymap, currentLocation){
  mymap.on('geosearch/showlocation', function(e) {
    console.log(e.location.y);
    console.log(e.location.x);
    lat = e.location.y;
    lon = e.location.x;
    currentLocation.setLatLng([lat, lon]);
  });
}

/*Returns the coords of the user current location
*/
function getLocation(mymap, currentLocation){
  return mymap.locate({setView: true, watch: false})
        .on('locationfound', function(e){
            lat = e.latitude;
            lon = e.longitude;
            currentLocation.setLatLng([lat, lon]);
        })
       .on('locationerror', function(e){
            //askPosition(mymap, currentLocation);
        });
}

/*Adds a layer to the map area
*/
function addLayer(mymap){
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZnJhbno5OTE3IiwiYSI6ImNrMHp2aDE3ZTBpNzAzZXB2YmdlNGRrcTUifQ.IsfpDPTiOg-gcCJzF0oL6Q'
  }).addTo(mymap);
}

/*Creates the Control object which let 
  the user to search his position by 
  typing the address in the search bar
*/
function addGeoSearch(mymap){
  var GeoSearchControl = window.GeoSearch.GeoSearchControl;
  var OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider;
  var provider = new OpenStreetMapProvider();
  searchControl = new GeoSearchControl({
    provider: provider,
    showMarker: false,
    retainZoomLevel: false,
    animateZoom: true
  });
  mymap.addControl(searchControl);
}