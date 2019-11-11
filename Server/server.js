const express = require('express');
const app = express();
const path = require('path');
var client = require('mongodb').MongoClient;

app.get('/getDescription', (req, res) => {
  client.connect("mongodb://localhost:27017/",
    function(error, db) {
      if(! error) {
          var mydb = db.db("WMIdb");
          mydb.collection("Descrizioni").find({nome : req.query.val}).toArray(function(err, result) {
              if (err) throw err;
              if(result.length !== 0){
                  res.send(result);
              }else{
                  //TODO DBPEDIA
                  res.send("niente");
              }
              db.close();
            });
        }
      }
  );
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

app.get('/insertRating', (req, res) => {
  client.connect("mongodb://localhost:27017/",
    function(error, db) {
      if(! error) {
          var mydb = db.db("WMIdb");
          var myobj = { nome: req.query.nome, luogo: req.query.luogo,  commento: req.query.com, punteggio:req.query.punteggio};
          mydb.collection("Commento").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          });
        }
      }
  );
});

app.get('/getRating', (req, res) => {
  client.connect("mongodb://localhost:27017/",
    function(error, db) {
      if(! error) {
          var mydb = db.db("WMIdb");
          mydb.collection("Commento").find({luogo : req.query.val}).toArray(function(err, result) {
              if (err) throw err;
              if(result.length !== 0){
                  res.send(result);
              }else{
                  //TODO DBPEDIA
                  res.send("niente");
              }
              db.close();
            });
        }
      }
  );
});


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
app.get('/mapclass.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/mapclass.js'));
});

app.get('/mongoDB.js', (req, res) => {
  res.contentType("text/javascript");
  res.sendFile(path.join(__dirname,'../JS/mongoDB.js'));
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



app.post('/insert', (req, res) => {

});




app.listen(8000, () => console.log('Gator app listening on port 8000!'))
