const dps = require('dbpedia-sparql-client').default;
const express = require('express');
const fs = require('fs');
const multer = require('multer');
var toWav = require('audiobuffer-to-wav')
const app = express();
const path = require('path');
const youtubeSearch = require('youtube-search');
const f = require('./functions.js');
var client = require('mongodb').MongoClient;
var parseString = require('xml2js').parseString;

const rickyKey = "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI";
const rickykey_second = "AIzaSyB5PLURpl92Ix6gBHvgBMJ9s1JC7m69b2c";
const guiKey = "AIzaSyBFXSS4CBQKDc8yJtAdEruvXgAEHNwg8ko";
const maxKey = "AIzaSyD5gNJnmZJlz4DsDcD1cFjgpqLfzX0LsFk";

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
//

app.get('/askDBPedia', (req, res) => {
  return new Promise(async (resolve,reject) => {
  var vector = req.query.que.split(" ");
  for(string in vector){
    vector[string] = "'" + vector[string] + "'";
    vector[string] = vector[string].toUpperCase();
  }
  var string = req.query.que.toUpperCase();
  string = string.replace(/ /g," AND ");
  var q = "select ?s1 as ?c1, (bif:search_excerpt (bif:vector ("+vector+" , 'BOLOGNA'), ?o1)) as ?c2, ?sc, ?rank, ?g where {{{ select ?s1, (?sc * 3e-1) as ?sc, ?o1, (sql:rnk_scale (<LONG::IRI_RANK> (?s1))) as ?rank, ?g where  { quad map virtrdf:DefaultQuadMap { graph ?g { ?s1 ?s1textp ?o1 . ?o1 bif:contains  '(" +string + " AND BOLOGNA)'  option (score ?sc)  . } } } order by desc (?sc * 3e-1 + sql:rnk_scale (<LONG::IRI_RANK> (?s1)))  limit 1  offset 0 }}}";
  dps.client().query(q).timeout(15000).asJson().then((r) => {
    console.log("RESOLVED")
    console.log(r)
    res.send(r);
  }).catch((e) => {
    res.send(e);
  });
});
});

app.get("/getReviewProfileMode", (req, res) => {
  client.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true },function(error, db) {
    var mydb = db.db("WMIdb");
    mydb.collection("reviewProfile").find({ _id: req.query.name  }).toArray(async function(err, result) {
      if(err){
        res.send(err)
      }else{
        res.send(result)
      }
  });
});
});

function insertReviewProfile(id, luogo,  voto, des , mydb, db, res){
          console.log("whr")
          mydb.collection("reviewProfile").find({ _id: id  }).toArray(async function(err, result) {
              if (result == 0) {
                var myobj = { _id: id , luogo: luogo, recensione: [{ Voto : voto, Descrizione : des}]};
                mydb.collection("reviewProfile").insertOne(myobj, function (err, resu) {
                  res.send("salvato");
                });
              } else {
                var ob = result;
                ob[0].recensione.push({
                  Voto: voto,
                  Descrizione: des
                });
                var myquery = { _id: id };
                var newvalues = { $set: { recensione: ob[0].recensione } };
                mydb.collection("reviewProfile").updateOne(myquery, newvalues, function(err, resu) {
                    if(err)throw err;
                    res.send("salvato");
                    });
              }
              db.close();
            });

}

app.post("/insertReviewUserMode", (req, res) => {
  console.log("ciao")
  client.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true },function(error, db) {
      if (!error) {
        var mydb = db.db("WMIdb");
        mydb.collection("review").find({ _id: req.query.id  }).toArray(async function(err, result) {
            if (result == 0) {
              var myobj = { _id: req.query.id , Value: [{ Voto : req.query.voto, Descrizione : req.query.descrizione}]};
              mydb.collection("review").insertOne(myobj, function (err, resu) {
                if (err) throw err;
                insertReviewProfile("Massimo Monacchi",req.query.id, req.query.voto, req.query.descrizione , mydb, db, res)

              });
            } else {
              insertReviewProfile("Massimo Monacchi",req.query.id, req.query.voto, req.query.descrizione, mydb, db, res )
              var ob = result;
              ob[0].Value.push({
                Voto: req.query.voto,
                Descrizione: req.query.descrizione
              });
              var myquery = { _id: req.query.id  };
              var newvalues = { $set: { Value: ob[0].Value } };
              mydb.collection("review").updateOne(myquery, newvalues, function(err, resu) {
                if (err) throw err;
                });
            }
          });
      }
    });
});

app.get("/getReview", (req, res) => {
  client.connect(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
    function(error, db) {
      if (!error) {
        var mydb = db.db("WMIdb");
        mydb.collection("review").find({ name: req.query.name }).toArray(async function(err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
          });
      }
    }
  );
});


app.get('/getPOIs', (req, res) => {
  var opts = youtubeSearch.YouTubeSearchOptions = {
    maxResults: 50,
    key: maxKey
  };

  youtubeSearch(req.query.searchQuery, opts, async (err, results) => {
    if (err) {
      console.log(err);
      res.send({ error: err.response.statusText });
    }
    else {
      var data = await call(results);
      console.log("SEND POISSS")
      console.log(data)
      res.send(data);
    }
  });
});

function call(results){
return new Promise(async (resolve,reject) => {
  var POIs = {};
  var list = [];
  for (var key in results) {
    var item = results[key];
    if ((val = f.validator(item.description)) !== false) {
      if (list.indexOf(val.plusCode) === -1) {
        list.push(val.plusCode);
        POIs[item.title] = val.coords;
        POIs[item.title].videoId = item.id;
        var json = await f.getDescription(client,POIs, item.title,f);
        POIs[item.title].description = json["desc"];
        POIs[item.title].img = json["img"];
      }
    }
  }
  resolve(POIs);
});
}

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
