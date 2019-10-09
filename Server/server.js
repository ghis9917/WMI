const express = require('express');
const app = express();
const path = require('path');


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'../HTML/index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname,'../HTML/index.html'));
});
app.get('/map.html', (req, res) => {
  res.sendFile(path.join(__dirname,'../HTML/map.html'));
});

app.get('/yt.html', (req, res) => {
  const mongoose = require('mongoose');
  var MongoClient = require('mongodb').MongoClient;
  // Connect to the db
  MongoClient.connect("mongodb://site181947:ASae0ahr@mongo_site181947:27017/myproject", {useNewUrlParser: true, useUnifiedTopology: true}, function (err, db) {
    if (db === null){
      console.log(err);
    } else {
      console.log(db);
    }
  });
});

app.get('/OpenLocationCode.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/OpenLocationCode.js'));
});
app.get('/speechSynthesis.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/speechSynthesis.js'));
});
app.get('/newMap.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/newMap.js'));
});
app.get('/changeTheme.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/changeTheme.js'));
});
app.get('/lrm-graphhopper.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/lrm-graphhopper.js'));
});
app.get('/jquery.slim.min.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/jquery.slim.min.js'));
});

app.get('/bootstrap.bundle.min.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/bootstrap.bundle.min.js'));
});
app.get('/googleSignIn.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/googleSignIn.js'));
});
app.get('/GeosearchInput.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/GeosearchInput.js'));
});
app.get('/bootstrap-geocoder.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/bootstrap-geocoder.js'));
});


app.get('/favicon.ico', (req, res) => {
  res.status(204).json({nope: true});
});
app.get('/style.css', (req, res) => {
    res.contentType("text/css");
    res.sendFile(path.join(__dirname,'../CSS/style.css'));
});
app.get('/index.css', (req, res) => {
    res.contentType("text/css");
    res.sendFile(path.join(__dirname,'../CSS/index.css'));
});

app.get('/bootstrap.min.css', (req, res) => {
    res.contentType("text/css");
    res.sendFile(path.join(__dirname,'../CSS/bootstrap.min.css'));
});

app.get('/all.css', (req, res) => {
  res.contentType("text/css");
  res.sendFile(path.join(__dirname,'../CSS/all.css'));
});


app.get('/parallax.gif', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../img/parallax.gif'));
});




app.listen(8000, () => console.log('Gator app listening on port 8000!'))
