const express = require('express');
const fs = require('fs');
const multer  = require('multer');
var toWav = require('audiobuffer-to-wav')
const app = express();
const path = require('path');
const youtubeSearch = require('youtube-search');


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
  console.log("coglionazzo");
  var opts =  youtubeSearch.YouTubeSearchOptions = {
    maxResults: 20,
    key: "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI"
  };

  youtubeSearch("8FPH0000", opts, (err, results) => {
    if(err) return console.log(err);
    res.send(results);
  });
});

app.get('/poi', (req, res) => {
  res.sendFile(path.join(__dirname,'./poi.json'));
});


app.get('/getRoutes', (req, res) => {
  console.log(req.query);
  res.send();
});

app.get('/audio.wav', (req, res) => {
  res.sendFile(path.join(__dirname,'./audio.wav'));
});

app.get('*', (req, res) => {
  switch (path.extname(req.url)) {
    case ".css":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".html":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".js":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".jpg":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".png":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".woff2":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".woff":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".ttf":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".woff":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".woff2":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".svg":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".eot":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".ico":{
        res.status(204).json({nope: true});
    }break;

    default:
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
