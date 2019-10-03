const express = require('express');
const app = express();
const path = require('path');


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'../HTML/index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname,'../HTML/index.html'));
});

app.get('/yt.html', (req, res) => {
  const mongoose = require('mongoose');

  var mongoURI = "mongodb://mongo_site181947:ASae0ahr@site181947.tw.cs.unibo.it:27017/myproject";
      mongoose.connect(mongoURI, { useNewUrlParser: true , useUnifiedTopology: true});
      mongoose.connection.once('open',()=>{
          console.log('Connected to db');
      });
/*  var mongoURI = "mongodb://mongo_site181947:ASae0ahr@site181947.tw.cs.unibo.it:27017/myproject";
  var MongoDB = mongoose.connect(mongoURI, { useNewUrlParser: true , useUnifiedTopology: true}).connection;
  MongoDB.on('error', function(err) { console.log(err.message); });
  MongoDB.once('open', function() {
    console.log("mongodb connection open");
  });/*
   var MongoClient = require('mongodb').MongoClient;

   var url = 'mongodb://site181947:ASae0ahr@mongo_site181947:27017/myproject';

   MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true  }, function(err, db) {
     if(db == null){
      res.send("non connesso")
     }else{
       res.send("non connesso");
     }
  });*/
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
