const express = require('express');
const app = express();
const path = require('path');




app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'./html/index.html'));
});

function send(res,file){
  res.sendFile(file, function(err) {
    if(err) {
        res.sendFile(path.join(__dirname,'./html/404.html'))
    }
  });
}


app.get('/getMap', (req, res) => {
  console.log(req.query.long)
  console.log(req.query.lat)
  var map = L.map('map').setView([req.query.lat, req.query.long], 13);

  // load a tile layer
  L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png',
    {
      attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
      maxZoom: 17,
      minZoom: 9
    });
    console.log(L);
  //res.sendFile(path.join(__dirname,'./html/index.html'));
});

app.get('*', (req, res) => {
  switch (path.extname(req.url)) {
    case ".css":{
      send(res,path.join(__dirname,'./'+req.url));
    }break;
    case ".html":{
        send(res,path.join(__dirname,'./html/'+req.url));
    }break;
    case ".js":{
      send(res,path.join(__dirname,'./'+req.url));
    }break;
    case ".jpg":{
      send(res,path.join(__dirname,'./'+req.url));
    }break;
    case ".png":{
      send(res,path.join(__dirname,'./'+req.url));
    }break;
    case ".woff2":{
      send(res,path.join(__dirname,'./'+req.url));
    }break;
    case ".woff":{
      send(res,path.join(__dirname,'./'+req.url));
    }break;
    case ".ico":{
        res.status(204).json({nope: true});
    }break;

    default:
      res.status(404).json({nope: true});
  }
});


app.listen(8000, () => console.log('Gator app listening on port 8000!'))
