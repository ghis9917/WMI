var lat, lon, searchControl;

/*Sets up the map are of the html file
*/
function newMap(data = null){
  if (data !== null){
    return reloadMap(data);
  }else{
    return createFirstMap();
  }
}

/*Reloads the last map to center the
  map on the current user position.
*/
function reloadMap(data){
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
function createFirstMap(){
  var currentLocation;
  currentLocation = L.marker([0, 0]);
  var mymap = L.map('mapid');
  mymap = getLocation(mymap, currentLocation);

  /*Adds a button to Leaflet map but when clicked
    it sort of delete the Bootstrap Navbar.
    TODO: Find a solution to this issue or another
          way to let the user get his actual location
          again.*/

  addButton(mymap, currentLocation);
  addControlListener(mymap, currentLocation);
  addGeoSearch(mymap);
  addLayer(mymap);
  currentLocation.addTo(mymap);
  L.Routing.control({
  waypoints: [
    L.latLng(44.4946,11.3407),
    L.latLng(44.8057,11.6700)
  ]
}).addTo(mymap);
console.log("map")
  return mymap
}

/*Adds button to relocate user location
*/
function addButton(mymap, currentLocation){
  L.easyButton('<span class="bigodot">&bigodot;</span>', function(btn, map){
    /*This way the maps gets recreated and the navbar doesn't disappear
      but whatever is on the map gets deleted, so if the user is following
      a route and they click on it loses it.
      Best to menage that issue could be create a JS function with
      optional arguments, if there are arguments we proceed to reload
      everything there was in the last map.
      (Function with optional arguments created but to test once we know which data
       should be reloaded).
    */
    mymap.remove();
    mymap = newMap();
  }).addTo(mymap);
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
