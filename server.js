const express = require('express');
const fs = require('fs');
const multer  = require('multer');
var toWav = require('audiobuffer-to-wav')
const app = express();
const path = require('path');
const youtubeSearch = require('youtube-search');
const f = require('./functions.js');
var client = require('mongodb').MongoClient;

app.use(express.static('public')); // for serving the HTML file

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname )
  }
})
var upload = multer({
  destination: storage
});
var type = upload.single('upl');


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'./index.html'));
});

app.get('/getPOIs', (req, res) => {
  var opts =  youtubeSearch.YouTubeSearchOptions = {
    maxResults: 20,
    key: "AIzaSyBFXSS4CBQKDc8yJtAdEruvXgAEHNwg8ko"
  };

  youtubeSearch(req.query.searchQuery, opts, (err, results) => {
    if (err) {
      return console.log(err);
    }
    else {
      var POIs = {};
      for (var key in results) {
        var item = results[key];
        if ((olcArea = f.validator(item.description)) !== false){
          POIs[item.title] = olcArea;
          POIs[item.title].videoId = item.id;
          //console.log("prima di sta cazzata");
          //await f.getDescription(item.title, POIs);
          //console.log(POIs[item.title].description);
        }
      }
      res.send(POIs);
    }
  });
});

app.get('/poi', (req, res) => {
  res.sendFile(path.join(__dirname,'./poi.json'));
});


app.get('/audio.wav', (req, res) => {
  res.sendFile(path.join(__dirname,'./audio.wav'));
});

app.get('*', (req, res) => {
  var ext = path.extname(req.url);
  if (ext === ".css" || ext === ".html" || ext === ".js" || ext === ".jpg" || ext === ".png" || ext === ".woff" || ext === ".woff2" || ext === ".ttf" || ext === ".svg" || ext === ".eot"){
    res.sendFile(path.join(__dirname,'./'+req.url));
  } else if (ext === ".ico") {
    res.status(204).json({nope: true});
  } else {
    //TODO
  }
});

app.get('/insertDescription', (req, res) => {
  client.connect("mongodb://localhost:27017/",
    function(error, db) {
      if(! error) {
          var mydb = db.db("WMIdb");
          var myobj = { nome: req.query.nome, descrizione: req.query.des };
          mydb.collection("Descrizioni").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          });
        }
      }
  );
});

app.post('/api/test', type, function (req, res) {
  console.log(req.body);
  console.log(req.file);
  var f = req.file;
  console.log(f.buffer);
  fs.writeFile('sample.mp3', f.buffer, function(err) {
    res.sendStatus(err ? 500 : 200);
  });
});

app.listen(8000, () => console.log('Gator app listening on port 8000!'))
