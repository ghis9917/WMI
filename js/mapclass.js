


class Map {
    constructor() {
      this.lat = 0;
      this.lng = 0;
      this.searchControl;
      this.waypoints = [];
      this.control = null;
      this.routingMode = 'foot'
      this.mymap;
      this.currentLocation;
    }
     initApy(){
        this.placesAutocomplete = places({
        appId: 'plTCO8O9NAP7',
        apiKey: 'a5c7d70d42023f9e0afdfa6bac7a2634',
        container: document.querySelector('#address')
      });
    }
    setMap(){
          this.mymap = L.map('mapid', {
            zoomControl: true
          });

          this.getLocation();
          //this.addButton();
          //this.addControlListener();
          this.addLayer();
          //this.onClick();
    }
    addLayer(){
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZnJhbno5OTE3IiwiYSI6ImNrMHp2aDE3ZTBpNzAzZXB2YmdlNGRrcTUifQ.IsfpDPTiOg-gcCJzF0oL6Q'
      }).addTo(this.mymap);
    }

    getLocation(){
      this.mymap.locate({setView: true, watch: false, locateOptions:{ enableHighAccuracy: true}})
           .on('locationfound', (e)=>{
               this.lat = e.latitude;
               this.lng = e.longitude;
               this.addMarker();
           })
          .on('locationerror', function(e){
             /*Add a handler:
               we should be able to get the user address
               and search it, maybe suggesting the results
               while they're typing.
             */  $("#address").click(function(){
                     $('.ap-input').css({'backgroundColor':'white'});
                     $('.ap-input').val("");
               });
             $("#exampleModal").modal();
           });
    }
    getLatLng(){
      if($("#address").val() != ""){
        $.ajax({
          url: "https://api.opencagedata.com/geocode/v1/json?q="+$("#address").val()+"&key=4e6db93d236944d68db1551367316df5&language=it&pretty=1",
          success: (result) => {
              if(result.results.length != 0){
                this.lat = result.results[0].geometry.lat;
                this.lng = result.results[0].geometry.lng;
                this.addMarker();
                $('#exampleModal').modal('toggle');
              }else{
                this.errore();
              }
          },
          error: (result) =>{
            console.log("Impossibile contattare il server");
            this.errore();
          }
        });
      }else {
        this.errore();
      }
    }
    addMarker(marker = null){
      if(marker){
        //TODO add marker of something
      }else {
        this.currentLocation = L.marker([this.lat, this.lng]);
        this.currentLocation.addTo(this.mymap);
        this.mymap.setView(this.currentLocation.getLatLng(), 16);

        //console.log(this.mymap.fitBounds(L.latLngBounds([this.currentLocation.getLatLng()])));
      }
    }
    errore(){
          $('.ap-input').css({'backgroundColor':'red'});
    }
    getCorner(){
      console.log((this.mymap));
    }
}
