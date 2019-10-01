var http = require('http');
var fs = require('fs');
var path = require('path');
var mobile = require('is-mobile');
var mime = require('mime-types')
const request = require('request');


function invia(res,type,file){
  var s = fs.createReadStream(file);
  s.on('open', function () {
      res.setHeader('Content-Type', type);
      s.pipe(res);
  });
}

function errore(res){
  fs.readFile("../HTML/404.html", "UTF-8", function(err, html){
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end(html);
  });
}

http.createServer(function(req, res){
    //rihieste GET
    if( req.method == "GET"){
      if(path.extname(req.url) != ""){
        if(req.url == "/index.html"){
            console.log("index")
            invia(res,"text/html","../HTML/index.html")
        }
        else if(req.url != "/index.html"){
          var myFile = (req.url).toString();
          myFile = myFile.substring(myFile.indexOf('/')+1);
          if(mime.lookup(myFile) == "text/html" ){
            myFile = "../HTML/"+myFile;
          }else{
            myFile = "../"+myFile;
          }
          if (fs.existsSync(myFile)) {
            invia(res,mime.lookup(myFile),myFile);
          }else{
              errore(res);
          }
        }
      }
      else{
        if(req.url == "/"){
            console.log("index")
            invia(res,"text/html","../HTML/index.html")
        }
        //getValue?valore=.. api, ricerca su wikipedia, ritorna json
        else if(req.url.match("getValue")){
          var val  = req.url;
          val = val.replace("/getValue?valore=", "");
          getValue(val);
        }
        //getSound api, get Wikipedia description
        else if(req.url.match("getWikipedia")){
          var tools = require("./node_files/DBpedia.js");
          tools.getDBPedia("Milano", "Place",res);
        }
        else if(req.url.match("getLuoghi")){
        }
      }
  }
    // Richiesta POST
    else{
    }
}).listen(8000);  //porta 8000
