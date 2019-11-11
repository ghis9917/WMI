var lat = 0;
var long = 0;

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  lat = position.coords.latitude;
  long = position.coords.longitude;
  getMap();
}


function getMap(){
  $.ajax({
    type:"get",
    url: "/getMap?lat="+lat+"&long="+long,
    success: function(result){
      
   }});
}
