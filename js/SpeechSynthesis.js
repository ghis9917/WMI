function hello(){
  var msg = new SpeechSynthesisUtterance('Marcello!');
  window.speechSynthesis.speak(msg);
}
