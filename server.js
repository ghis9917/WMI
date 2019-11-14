const express = require('express');
const fs = require('fs');
const multer = require('multer');
var toWav = require('audiobuffer-to-wav')
const app = express();
const path = require('path');
const youtubeSearch = require('youtube-search');
const f = require('./functions.js');
var client = require('mongodb').MongoClient;
const rickyKey = "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI"
const guiKey = "AIzaSyBFXSS4CBQKDc8yJtAdEruvXgAEHNwg8ko"

app.use(express.static('public')); // for serving the HTML file

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
var upload = multer({
  destination: storage
});
var type = upload.single('upl');


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/getDescription', (req, res) => {
  client.connect("mongodb://localhost:27017/",
    function (error, db) {
      if (!error) {
        var mydb = db.db("WMIdb");
        mydb.collection("Descrizioni").find({ nome: req.query.val }).toArray(function (err, result) {
          if (err) throw err;
          if (result.length !== 0) {
            res.send({val:result[0].descrizione});
          } else {
            //TODO DBPEDIA
            res.send({val:"niente"});
          }
          db.close();
        });
      }
      else{
        console.log(error);
      }
    }
  );
});

function check(results){
  for(var x in results){
    for(var i in results){
      var b = f.validator(results[x].description);
      var d = f.validator(results[x].description);
      if( x != i ){
        if(d == b){
          console.log(results[x].title);
          console.log(results[i].title);
        }
      }
    }
  }
  return results;
}

app.get('/getPOIs', (req, res) => {
  var opts = youtubeSearch.YouTubeSearchOptions = {
    maxResults: 50,
    key: rickyKey
  };

  youtubeSearch(req.query.searchQuery, opts, async (err, results) => {
    if (err) {
      res.send({val : "niente"});
    }
    else {
      console.log(results);
      //results = check(results);
      var POIs = {};
      var list = [];
      for (var key in results) {
        var item = results[key];
        if ((val = f.validator(item.description)) !== false) {
          if (list.indexOf(val.plusCode) === -1){
            list.push(val.plusCode);
            POIs[item.title] = val.coords;
            POIs[item.title].videoId = item.id;
            var d = await f.get('http://localhost:8000/getDescription?val='+item.title);
            POIs[item.title].description = d.data.val;
          }
        }
      }
      res.send(POIs);
    }
  });
});

app.get('/poi', (req, res) => {
  res.sendFile(path.join(__dirname, './poi.json'));
});


app.get('/audio.wav', (req, res) => {
  res.sendFile(path.join(__dirname, './audio.wav'));
});

app.get('/insertDescription', (req, res) => {
  client.connect("mongodb://localhost:27017/",
    function (error, db) {
      if (!error) {
        var mydb = db.db("WMIdb");
        var myobj = { nome: req.query.nome, descrizione: req.query.des };
        mydb.collection("Descrizioni").insertOne(myobj, function (err, res) {
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
  fs.writeFile('sample.mp3', f.buffer, function (err) {
    res.sendStatus(err ? 500 : 200);
  });
});

app.get('*', (req, res) => {
  var ext = path.extname(req.url);
  if (ext === ".css" || ext === ".html" || ext === ".js" || ext === ".jpg" || ext === ".png" || ext === ".woff" || ext === ".woff2" || ext === ".ttf" || ext === ".svg" || ext === ".eot") {
    res.sendFile(path.join(__dirname, './' + req.url));
  } else if (ext === ".ico") {
    res.status(204).json({ nope: true });
  } else {
    //TODO
  }
});

app.listen(8000, () => console.log('Gator app listening on port 8000!'))
