function hello(){
  var msg = new SpeechSynthesisUtterance('Mamma mia Marcello, wat do u miiin!');
  window.speechSynthesis.speak(msg);
}
