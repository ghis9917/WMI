const express = require('express');
const fs = require('fs');
const multer  = require('multer');
var toWav = require('audiobuffer-to-wav')
const app = express();
const path = require('path');
const youtubeSearch = require('youtube-search');
const f = require('./functions.js');
var client = require('mongodb').MongoClient;
var sparql = require('sparql' );
const {Client} = require('virtuoso-sparql-client');
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
  var opts =  youtubeSearch.YouTubeSearchOptions = {
    maxResults: 20,
    key: "AIzaSyD5gNJnmZJlz4DsDcD1cFjgpqLfzX0LsFk"
  };
  youtubeSearch(req.query.searchQuery, opts,  function(err, results) {
    if (err) {
      return console.log("err");
    }
    else {
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

app.get('/DBpedia', (req, res) => {
  const sparql = require('sparql')
 client = new sparql.Client('http://dbpedia.org/sparql')
 console.log(req.query.ciao);
client.query(req.query.ciao, (err, es) =>{
  console.log(es)
  res.send(es)});
  });

app.get('/getMammt', (req, res) => {
   const sparql = require('sparql')
   client = new sparql.Client('http://dbpedia.org/sparql')
   console.log(req.query.data)
   var prima = req.query.data;
   var dopo = req.query.que.toUpperCase();
   dopo = dopo.replace(/ /g," AND ")

  var q =   " select ?s1 as ?c1, (bif:search_excerpt (bif:vector ("+prima+" , 'BOLOGNA'), ?o1)) as ?c2, ?sc, ?rank, ?g where {{{ select ?s1, (?sc * 3e-1) as ?sc, ?o1, (sql:rnk_scale (<LONG::IRI_RANK> (?s1))) as ?rank, ?g where  { quad map virtrdf:DefaultQuadMap { graph ?g  { ?s1 <http://dbpedia.org/ontology/abstract> ?o1 .?o1 bif:contains  '(" +dopo + " AND BOLOGNA)'  option (score ?sc)  . }}} order by desc (?sc * 3e-1 + sql:rnk_scale (<LONG::IRI_RANK> (?s1)))  limit 1 offset 0 }}}   "
  client.query(q, (err, es) =>{
          if ( typeof es !== 'undefined'){
          if( es.results.bindings.length != 0){
              res.send(es.results.bindings[0].c1.value.replace("resource", "data")+".json");
          }else{
             res.send("Not Found");
          }}
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
