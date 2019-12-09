// $("#volume").slider({
//   	min: 0,
//   	max: 100,
//   	value: 0,
// 		range: "min",
//   	slide: function(event, ui) {
//     	setVolume(ui.value / 100);
//   	}
// 	});
//
// 	var myMedia = document.createElement('audio');
// 	$('#player').append(myMedia);
// 	myMedia.id = "myMedia";
//
// 	playAudio('http://emilcarlsson.se/assets/Avicii%20-%20The%20Nights.mp3', 0);
//
// 	function playAudio(fileName, myVolume) {
// 			myMedia.src = fileName;
// 			myMedia.setAttribute('loop', 'loop');
//     	setVolume(myVolume);
//     	myMedia.play();
// 	}
//
// 	function setVolume(myVolume) {
//     var myMedia = document.getElementById('myMedia');
//     myMedia.volume = myVolume;
// 	}
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}
