var http = require('http');
var fs = require('fs');
var path = require('path');
var mobile = require('is-mobile');
var mime = require('mime-types')
const request = require('request');


function invia(res,type,file){
   fs.readFile(file, "UTF-8", function(err, html){
    res.writeHead(200, {"Content-Type": type});
    res.end(html);
  });
}

function errore(res){
  res.writeHead(404, {"Content-Type": "text/html"});
  res.end("No Page Found");
}


http.createServer(function(req, res){
    //rihieste GET
    if( req.method == "GET"){

      if(path.extname(req.url) != ""){

            console.log("RICHIESTA")
        if(req.url == "/index.html"){
            console.log("index")
            invia(res,"text/html","../HTML/index.html")
        }
        else{
          var myFile = (req.url).toString();
          myFile = myFile.substring(myFile.indexOf('/')+1);
          myFile = "../"+myFile;
          console.log(myFile);
          if (fs.existsSync(myFile)) {
            invia(res,path.extname(req.url),myFile);
          }
        }
      }
      else{
        //getValue?valore=.. api, ricerca su wikipedia, ritorna json
        if(req.url.match("getValue")){
          var val  = req.url;
          val = val.replace("/getValue?valore=", "");
          getValue(val);
        }

        //getSound api, get Wikipedia description
        else if(req.url.match("getWikipedia")){
          var tools = require("./node_files/DBpedia.js");
          tools.getDBPedia("Milano", "Place",res);
        }

      }
        //404 PAGE NOT FOUND
        /*{
            console.log(req.url);
            errore(res);
      }*/
  }
    // Richiesta POST
    else{
    }
}).listen(8000);  //porta 8000
