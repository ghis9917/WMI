/**
 *Changes the theme (light/dark) on the navbar and body background 
 */
function changeTheme() {
  var body = document.getElementById("myNavBar");
  var currentClass = body.className;
  body.className = currentClass == "navbar navbar-collapse-lg navbar-fixed-top navbar-light bg-light" ? "navbar navbar-collapse-lg navbar-fixed-top navbar-dark bg-dark" : "navbar navbar-collapse-lg navbar-fixed-top navbar-light bg-light";
    
  var b = document.body; 
  var color = rgb2hex($('#navbarSupportedContent').css('backgroundColor'));
  b.style.backgroundColor = color == "#343a40" ? "#f8f9fa" : "#343a40";

  var collapsable = document.getElementById("navbarSupportedContent"); 
  var color = rgb2hex($('#navbarSupportedContent').css('backgroundColor'));
  collapsable.style.backgroundColor = color == "#343a40" ? "#f8f9fa" : "#343a40";

  var collapsable = document.getElementById("switchLabel"); 
  var color = rgb2hex($('#switchLabel').css('color'));
  collapsable.style.color = color == "#343a40" ? "#f8f9fa" : "#343a40";
}

function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

var hexDigits = new Array
  ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}