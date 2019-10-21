const express = require('express');
const app = express();
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'./html/index.html'));
});

app.get('*', (req, res) => {
  switch (path.extname(req.url)) {
    case ".css":{
      res.sendFile(path.join(__dirname,'./'+req.url));
    }break;
    case ".html":{
      res.sendFile(path.join(__dirname,'./html/'+req.url));
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
    case ".ico":{
        res.status(204).json({nope: true});
    }break;

    default:
      //TODO
  }
});


app.listen(8000, () => console.log('Gator app listening on port 8000!'))
