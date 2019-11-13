const express = require('express');
const fs = require('fs');
const multer  = require('multer');
var toWav = require('audiobuffer-to-wav')
const app = express();
const path = require('path');
const youtubeSearch = require('youtube-search');
const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();


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

function validator(d){
  var list = d.split(":")
  try{
    return openLocationCode.decode(list[2]);
  }catch{
    return false
  }
}

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
        if ((olcArea = validator(item.description)) !== false){
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
