const dps = require("dbpedia-sparql-client").default;
const express = require("express");
const fs = require("fs");
const multer = require("multer");
var toWav = require("audiobuffer-to-wav");
const app = express();
const path = require("path");
const youtubeSearch = require("youtube-search");
const f = require("./functions.js");
var client = require("mongodb").MongoClient;
var parseString = require("xml2js").parseString;

const rickyKey = "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI";
const guiKey = "AIzaSyBFXSS4CBQKDc8yJtAdEruvXgAEHNwg8ko";
const rickykey_second = "AIzaSyB5PLURpl92Ix6gBHvgBMJ9s1JC7m69b2c";
const maxKey = "AIzaSyD5gNJnmZJlz4DsDcD1cFjgpqLfzX0LsFk";

app.use(express.static("public")); // for serving the HTML file

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
var upload = multer({
  destination: storage
});
var type = upload.single("upl");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/askDBPedia", (req, res) => {
  var vector = req.query.name.split(" ");
  for (string in vector) {
    vector[string] = "'" + vector[string] + "'";
    vector[string] = vector[string].toUpperCase();
  }
  var string = req.query.name.toUpperCase();
  string = string.replace(/ /g, " AND ");
  var q =
    "select ?s1 as ?c1, (bif:search_excerpt (bif:vector (" +
    vector +
    " , 'BOLOGNA'), ?o1)) as ?c2, ?sc, ?rank, ?g where {{{ select ?s1, (?sc * 3e-1) as ?sc, ?o1, (sql:rnk_scale (<LONG::IRI_RANK> (?s1))) as ?rank, ?g where  { quad map virtrdf:DefaultQuadMap { graph ?g { ?s1 ?s1textp ?o1 . ?o1 bif:contains  '(" +
    string +
    " AND BOLOGNA)'  option (score ?sc)  . } } } order by desc (?sc * 3e-1 + sql:rnk_scale (<LONG::IRI_RANK> (?s1)))  limit 1  offset 0 }}}";
  dps
    .client()
    .query(q)
    .timeout(15000)
    .asJson()
    .then(r => {
      res.send(r);
    })
    .catch(e => {
      res.send(e);
    });
});

app.get("/getDescription", (req, res) => {
  client.connect("mongodb://localhost:27017/", function(error, db) {
    if (!error) {
      var mydb = db.db("WMIdb");
      mydb
        .collection("Descrizioni")
        .find({ nome: req.query.val })
        .toArray(async function(err, result) {
          if (err) throw err;
          if (result.length !== 0) {
            res.send({ val: result[0].descrizione });
          } else {
            var d = await f.get(
              "http://localhost:8000/askDBPedia?name=" + req.query.val
            );
            try {
              var e = await f.get(
                d.data.results.bindings[0].c1.value.replace(
                  "resource",
                  "data"
                ) + ".rdf"
              );
              parseString(e.data, function(err, result) {
                var json = {};
                var list =
                  result["rdf:RDF"]["rdf:Description"][0]["rdfs:comment"];
                for (var key in list) {
                  var chiave = list[key]["$"]["xml:lang"];
                  var valore = list[key]["_"];
                  json[chiave] = valore;
                }
                var img =
                  result["rdf:RDF"]["rdf:Description"][0]["dbo:thumbnail"][0][
                    "$"
                  ]["rdf:resource"];
                res.send({ val: json, img: img });
              });
            } catch (error) {
              res.send({ val: "NF", img: "NF" });
            }
          }
          db.close();
        });
    } else {
      console.log(error);
    }
  });
});

app.get("/getPOIs", (req, res) => {
  var opts = (youtubeSearch.YouTubeSearchOptions = {
    maxResults: 50,
    key: guiKey
  });

  youtubeSearch(req.query.searchQuery, opts, async (err, results) => {
    if (err) {
      console.log(err);
      res.send({ error: err.response.statusText });
    } else {
      console.log(results);
      //results = check(results);
      var POIs = {};
      var list = [];
      for (var key in results) {
        var item = results[key];
        if ((val = f.validator(item.description)) !== false) {
          if (list.indexOf(val.plusCode) === -1) {
            list.push(val.plusCode);
            POIs[item.title] = val.coords;
            POIs[item.title].videoId = item.id;
            var d = await f.get(
              "http://localhost:8000/getDescription?val=" + item.title
            );
            POIs[item.title].description = d.data.val;
            POIs[item.title].img = d.data.img;
          }
        }
      }
      res.send(POIs);
    }
  });
});

app.get("/poi", (req, res) => {
  res.sendFile(path.join(__dirname, "./poi.json"));
});

app.get("/audio.wav", (req, res) => {
  res.sendFile(path.join(__dirname, "./audio.wav"));
});

app.get("/insertDescription", (req, res) => {
  client.connect("mongodb://localhost:27017/", function(error, db) {
    if (!error) {
      var mydb = db.db("WMIdb");
      var myobj = { nome: req.query.nome, descrizione: req.query.des };
      mydb.collection("Descrizioni").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
    }
  });
});

app.post("/api/test", type, function(req, res) {
  console.log(req.body);
  console.log(req.file);
  var f = req.file;
  console.log(f.buffer);
  fs.writeFile("sample.mp3", f.buffer, function(err) {
    res.sendStatus(err ? 500 : 200);
  });
});

app.get("*", (req, res) => {
  var ext = path.extname(req.url);
  if (
    ext === ".css" ||
    ext === ".html" ||
    ext === ".js" ||
    ext === ".jpg" ||
    ext === ".png" ||
    ext === ".woff" ||
    ext === ".woff2" ||
    ext === ".ttf" ||
    ext === ".svg" ||
    ext === ".eot"
  ) {
    res.sendFile(path.join(__dirname, "./" + req.url));
  } else if (ext === ".ico") {
    res.status(204).json({ nope: true });
  } else {
    //TODO
  }
});

app.listen(8000, () => console.log("Gator app listening on port 8000!"));
