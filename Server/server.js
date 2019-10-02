const express = require('express');
const app = express();
const path = require('path');


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'../HTML/index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname,'../HTML/index.html'));
});
app.get('/OpenLocationCode.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../js/OpenLocationCode.js'));
});
app.get('/speechSynthesis.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../js/speechSynthesis.js'));
});
app.get('/newMap.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../js/newMap.js'));
});
app.get('/changeTheme.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../js/changeTheme.js'));
});
app.get('/lrm-graphhopper.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../js/lrm-graphhopper.js'));
});
app.get('/favicon.ico', (req, res) => {
  console.log("jj")
});
app.get('/style.css', (req, res) => {
    res.contentType("text/css");
    res.sendFile(path.join(__dirname,'../css/style.css'));
});
app.listen(8000, () => console.log('Gator app listening on port 3000!'))
