
const express = require("express");
const fs = require("fs");
const multer = require("multer");
var toWav = require("audiobuffer-to-wav");
const app = express();
const path = require("path");
const youtubeSearch = require("youtube-search");
const utils = require("./serverSideUtils.js");
var client = require("mongodb").MongoClient;
var parseString = require("xml2js").parseString;
var https = require("https");
var bodyParser = require("body-parser");
const upload = multer();
const Youtube = require("youtube-api"),
  readJson = require("r-json"),
  opn = require("opn"),
  prettyBytes = require("pretty-bytes");
const ffmpeg = require("fluent-ffmpeg");

// app.use(bodyParser.urlencoded());

const rickyKey = "AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI";
const rickykey_second = "AIzaSyB5PLURpl92Ix6gBHvgBMJ9s1JC7m69b2c";
const guiKey = "AIzaSyBFXSS4CBQKDc8yJtAdEruvXgAEHNwg8ko";
const maxKey = "AIzaSyD5gNJnmZJlz4DsDcD1cFjgpqLfzX0LsFk";

app.use(express.static("public")); // for serving the HTML file

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/askDBPedia", (req, res) => {
  return new Promise(async (resolve, reject) => {
    var vector = req.query.que.split(" ");
    for (string in vector) {
      vector[string] = "'" + vector[string] + "'";
      vector[string] = vector[string].toUpperCase();
    }
    var string = req.query.que.toUpperCase();
    string = string.replace(/ /g, " AND ");
    var q =
      "select ?s1 as ?c1, (bif:search_excerpt (bif:vector (" +
      vector +
      " , 'BOLOGNA'), ?o1)) as ?c2, ?sc, ?rank, ?g where {{{ select ?s1, (?sc * 3e-1) as ?sc, ?o1, (sql:rnk_scale (<LONG::IRI_RANK> (?s1))) as ?rank, ?g where  { quad map virtrdf:DefaultQuadMap { graph ?g { ?s1 ?s1textp ?o1 . ?o1 bif:contains  '(" +
      string +
      " AND BOLOGNA)'  option (score ?sc)  . } } } order by desc (?sc * 3e-1 + sql:rnk_scale (<LONG::IRI_RANK> (?s1)))  limit 1  offset 0 }}}";
    console.log("Eccomi")
    dps.client().query(q).timeout(15000).asJson().then(r => {
        console.log("mmmmmmm CIAO")
        console.log(r)
        res.send(r);
      })
      .catch(e => {
        console.log("mmmmmmm CIAO")
        res.send(e);
      });
  });
});

app.get("/updateReview", (req, res) => {
  client.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true }, async function(error, db) {
    var myquery = {  _id: req.query.luogo, wr : req.query.wr  };
    var myobj = {_id: req.query.luogo,
                value: {
                          voto: req.query.voto,
                          descrizione: req.query.descrizione
                        },
                wr: req.query.wr,
                rd:req.query.rd,
    };
    var newvalues = { $set: {_id: req.query.luogo,
                value: {
                          voto: req.query.voto,
                          descrizione: req.query.descrizione
                        },
                wr: req.query.wr,
                rd:req.query.rd,
    }};
    var mydb = db.db("WMIdb");
    mydb.collection("review").updateOne(myquery, newvalues, function(err, result) {
      if (err) {
        res.status(400).send({
          message: "DB error"
        });
      }else{
        res.send(newvalues);
      }
  });
  });
});


app.get("/getReview" , (req, res) => {
  if(req.query.mode == "user"){
    client.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true }, async function(error, db) {
      if(error){
        res.status(400).send({
          message: "DB error"
        });
      }else{
          var mydb = db.db("WMIdb");
          mydb.collection("review").find({  wr : req.query.wr }).toArray( function(err, result) {
            if(err){
              res.status(400).send({
                message: "DB error"
              });
            }else{
              if(result.length == 0){
                res.send("null")
              }else{
                res.send(result)
              }
            }
          });
      }
    });
  }else{
    client.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true }, async function(error, db) {
      if(error){
        res.status(400).send({
          message: "DB error"
        });
      }else{
          var mydb = db.db("WMIdb");
          mydb.collection("review").find({  rd : req.query.rd }).toArray( function(err, result) {
            if(err){
              res.status(400).send({
                message: "DB error"
              });
            }else{
              if(result.length == 0){
                res.send("null")
              }else{
                res.send(result)
              }
            }
          });
      }
    });
  }
});


app.get("/insertReview", (req, res) => {
  client.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true }, async function(error, db) {
      if (!error) {
        var mydb = db.db("WMIdb");

        var ifExist = await utils.getSingleReview(req.query.luogo, req.query.wr, mydb)
        console.log(ifExist)
        if(ifExist == "error"){
          res.status(400).send({
            message: "DB error"
          });
        }
        else if(ifExist.length == 0 ){
          var myobj = {_id: req.query.luogo,
                      value: {
                                voto: req.query.voto,
                                descrizione: req.query.descrizione
                              },
                      wr: req.query.wr,
                      rd:req.query.rd
          };
          mydb.collection("review").insertOne(myobj, function(err, result) {
            if (err) {
              res.status(400).send({
                message: "DB error"
              });
            }
            else{
              res.send("Successo!")
            }
          });
        }else{
          res.send(ifExist)
        }
      }
      db.close();
    });

});
//user modePage
app.get("/getReview", (req, res) => {
  client.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true },function(error, db) {
      if (!error) {
        var mydb = db.db("WMIdb");
        console.log(req.query.name);
        mydb.collection("review").find({ _id: req.query.luogo }).toArray(async function(err, result) {
            if (err) {
              res.status(400).send({
                message: "DB error"
              });
            } else if (result == 0) {
              res.send("null");
            } else {
              res.send(result);
            }
            db.close();
          });
      }
    }
  );
});

app.get("/getPOIs", (req, res) => {
  var opts = (youtubeSearch.YouTubeSearchOptions = {
    maxResults: 50,
    key: guiKey
  });

  try {
    //TODO SET LANGUAGE searchQuery
    var c = req.query.searchQuery;
    youtubeSearch(c, opts, async (err, results) => {
      if (err) {
        console.log(err);
        res.send({ error: err.response.statusText });
      } else {
        var data = await call(results,res);
        res.send(data);
      }
    });
  } catch (error) {}
});





function call(results,res){
    return new Promise(async (resolve, reject) => {
      var POIs = {};
      var list = [];
      var counter = 0;
      client.connect("mongodb://localhost:27017/", { useUnifiedTopology: true } , async function (error, db) {
        var mydb = db.db("smogDB");
        for (var key in results) {
          var item = results[key];
          if ((val = utils.validator(item.description)) !== false) {
            if (list.indexOf(val.plusCode) === -1) {
              list.push(val.plusCode);
              var c = await utils.getDescription(item.title, mydb, utils);
              console.log(c)
              try{
              POIs[counter] = {
                name: item.title,
                coords: val.coords,
                videoId: item.id,
                description: c[0].descrizione,
                img: c[0].urlImg,
                visited : false
              };
            }catch(error){
              POIs[counter] = {
                name: item.title,
                coords: val.coords,
                videoId: item.id,
                description: c.descrizione,
                img: c.urlImg,
                visited : false
              };
            }
              counter++;
            }
          }
        }
      resolve(POIs);
        });
    });
}


app.post("/uploadFile", upload.single("file"), function(req, res) {
  const fileName = req.body.fname;
  const id = req.body.id;
  const newPath = "user/" + id + "/upload/";
  const filePath = newPath + fileName + ".mp3";
  if (!fs.existsSync(newPath)) {
    fs.mkdirSync(newPath);
  }
  fs.writeFileSync(filePath, req.file.buffer, error => {
    if (error) {
      console.error(error);
      res.send("err");
    } else {
      res.send("end");
      //here you can save the file name to db, if needed
    }
  });
  var proc = new ffmpeg({ source: filePath })

    .addInputOption("-loop", "1")
    .addInputOption("-i", "firma.jpg")
    .addOptions([
      "-c:v libx264",
      "-tune stillimage",
      "-c:a aac",
      "-b:a 192k",
      "-pix_fmt yuv420p",
      "-shortest"
    ])
    .on("start", function(commandLine) {
      console.log("Spawned FFmpeg with command: " + commandLine);
    })
    .on("error", function(err) {
      console.log("error: ");
      console.log(err);
    })
    .on("end", function(err) {
      if (!err) {
        console.log("conversion Done");
      }
      utils.upload(fileName, id);
      res.send("end");
    })
    .setDuration(req.body.etime)
    .saveToFile(newPath + fileName + ".mkv");
});

app.post("/cutAudio", upload.single("file"), function(req, res) {
  //, is still necessary to upload file?
  utils.cutAudio(req, res);
});

app.post("/saveToken", function(req, res) {
  utils.reload(req);
  res.send("end");
});

app.post("/removeDir", function(req, res) {
  utils.remove(req.query.id);
  res.send("deleted");
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
  } else if (ext === ".mp3") {
    //audio
    res.sendFile(path.join(__dirname, "./" + req.url));
  }
});

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert")
    },
    app
  )
  .listen(8000, () => console.log("Gator app listening on port 8000!"));
