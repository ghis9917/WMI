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

function chec(data){
  for(item in data){
    for(){

    }
  }
}

app.get('/getPOIs', (req, res) => {
  var opts =  youtubeSearch.YouTubeSearchOptions = {
    maxResults: 20,
    key: "AIzaSyB5PLURpl92Ix6gBHvgBMJ9s1JC7m69b2c"
  };
  youtubeSearch(req.query.searchQuery, opts,  function(err, results) {
    if (err) {
      return console.log("  err");
    }
    else {
      results = chec(results);
      var POIs = {};
      for (var key in results) {
        var item = results[key];
        if ((olcArea = f.validator(item.description)) !== false){
          POIs[item.title] = olcArea;
          POIs[item.title].videoId = item.id;
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



app.get('/data', (req, res) => {
  console.log("PArtita vhiamata")
  client.connect("mongodb://localhost:27017/",
  function(error, db) {
    if(! error) {
        var mydb = db.db("smogDB");
        mydb.collection("descrizioni").find({_id : req.query.searchQuery}).toArray(function(err, result) {
            if (err) throw err;
            if(result.length !== 0){
                res.send(result);
            }else{
                //TODO DBPEDIA
                console.log("result")
                res.send("niente");
            }
            db.close();
          });
      }
    });
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

app.get('/ciao', (req, res) => {
  console.log("ciaone")

});


app.get('/insertDescription', (req, res) => {
  console.log("ISNERT")
  client.connect("mongodb://localhost:27017/",
    function(error, db) {
      if(! error) {
          var mydb = db.db("smogDB");
          var myobj = { nome: req.query.nome};
          mydb.collection("descrizioni").insertOne(myobj, function(err, res) {
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
