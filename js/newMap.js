var lat, lon;
var searchControl;
var waypoints = [];
var control = null;
var routingMode = 'foot'

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
const createFirstMap = () => {
  var currentLocation = L.marker([0, 0]).on('click', function(e){
    if ((control !== null)&&(control.getWaypoints().length > 1)) {
      var destBtn = createButton('Da implementare'); 

      L.DomEvent.on(destBtn, 'click', function() {
        
      });
      currentLocation.bindPopup(destBtn, setPopupColor());
    }
  });
  var mymap = L.map('mapid', {
    zoomControl: true
  });
  mymap = getLocation(mymap, currentLocation);
  addButton(mymap, currentLocation);
  addControlListener(mymap, currentLocation);
  //addGeoSearch(mymap);
  addLayer(mymap);
  onClick(mymap);
  currentLocation.addTo(mymap);
  /*window.setInterval(function(){
    mymap = getLocation(mymap, currentLocation);
  }, 5000);*/
  return mymap
}


const onClickMarker = (mymap, mark) => {
  mark.on('click', function(e){
    var removeBtn = createButton('Remove Waypoint');
    
    L.DomEvent.on(removeBtn, 'click', function() {
      mymap.closePopup();
      var route = control.getWaypoints();
        for (var i = 0; i < route.length; i++) {
          if ((route[i].latLng === mark.getLatLng()) && (i != 0)){
           route.splice(i, 1);
          }
        }
        console.log(route);
        control.setWaypoints(route);
        mymap.removeLayer(mark);
    });
    mark.bindPopup(removeBtn, setPopupColor());
    /*L.popup()
        .setContent(container)
        .setLatLng(mark.getLatLng())
        .openOn(mymap);*/
  });
}



const onClick = (mymap) => {
  mymap.on('click', function(e) {
    var addBtn = createButton('Add Waypoint');

    L.DomEvent.on(addBtn, 'click', function() {
      mymap.closePopup();
      waypoints.push(L.latLng([0,0]));
      var newMarker = L.marker(e.latlng);
      onClickMarker(mymap, newMarker);
      newMarker.addTo(mymap);
      if ((control.getWaypoints())[1].latLng === null){
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
      }else {
        var route = control.getWaypoints();
        route.push(e.latlng);
        console.log(route);
        control.setWaypoints(route);
      }
    });
    L.popup(setPopupColor())
        .setContent(addBtn)
        .setLatLng(e.latlng)
        .openOn(mymap);
  });  
}

/*Adds a rounting calculator to the map
 */
function addRouting(mymap){
  control = L.routing.control({
    createMarker: function() { return null; },
    addWaypoints : true,
    waypoints: [
      L.latLng(lat, lon)
    ],
    router: L.Routing.graphHopper('a0695b22-2381-4b66-8330-9f213b610d8f' , {
      urlParameters: {
        vehicle: routingMode
      }
    })
  }).addTo(mymap);
}

/*Creates button and it adds it to the
  pop up passed as parameter (container)
 */
function createButton(label) {
  var btn = L.DomUtil.create('button', setOutlineBtn());
  btn.setAttribute('type', 'button');
  btn.innerHTML = label;
  return btn;
}

/*Adds button to relocate user location
*/
function addButton(mymap, currentLocation){
  L.easyButton('<span class="bigodot">&bigodot;</span>', function(btn, map){
    /*Here now i check the current location:
      If it is equal to (0,0) the it means that the user
      blocked the geolocation or it wasn't available at that time.
      Else it just centers the map on the last current location found.
      TODO: update the location when the user moves.
    */
    if (currentLocation.getLatLng().lat !== 0 && currentLocation.getLatLng().lng !== 0){
      mymap.fitBounds(L.latLngBounds([currentLocation.getLatLng()]));
    }else {
      mymap = getLocation(mymap, currentLocation);
    }
    
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
  return mymap.locate({setView: true, watch: false, locateOptions:{ enableHighAccuracy: true}})
        .on('locationfound', function(e){
            lat = e.latitude;
            lon = e.longitude;
            currentLocation.setLatLng([lat, lon]);
            if (control === null){
              addRouting(mymap);
            }
        })
       .on('locationerror', function(e){
          /*Add a handler:
            we should be able to get the user address 
            and search it, maybe suggesting the results
            while they're typing.
          */
          console.log(e);
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

function addGeoSearch(popup){
  var GeoSearchControl = window.GeoSearch.GeoSearchControl;
  var OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider;
  var provider = new OpenStreetMapProvider();
  searchControl = new GeoSearchControl({
    provider: provider,
    showMarker: false,
    retainZoomLevel: false,
    animateZoom: true
  });
  return searchControl;
}