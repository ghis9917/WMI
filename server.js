var http = require('http');
var fs = require('fs');
var path = require('path');
var mobile = require('is-mobile');

const request = require('request');



function getValue(val){
    request('https://it.wikipedia.org/w/api.php?action=opensearch&search='+val+'&limit=1&format=json', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    console.log(body);
  });
}

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

        if(req.url === "/"){
            invia(res,"text/html","./HTML/index.html");
        }
        //Ritorna tutti file css
        else if(req.url.match("\.css$")){
            var myFile = (req.url).toString();
            myFile = myFile.substring(myFile.indexOf('/')+1);
            if (fs.existsSync(myFile)) {
              invia(res,"text/css",myFile);
            }
        }
        //Ritorna tutti file html
        else if(req.url.match("\.html$")){
            var myFile= (req.url).toString();
            myFile = myFile.substring(myFile.indexOf('/')+1);
            myFile = "./HTML/"+myFile;

            if (fs.existsSync(myFile)) {
              invia(res,"text/html",myFile);
            }else{
              errore(res);
            }
        }
        //Ritorna tutti file js
        else if(req.url.match("\.js$")){
            var myFile= (req.url).toString();
            myFile = myFile.substring(myFile.indexOf('/')+1);
            if (fs.existsSync(myFile)) {
              invia(res,"text/js",myFile);
            }
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

        //404 PAGE NOT FOUND
        else{
            console.log(req.url);
            errore(res);
      }
  }
    // Richiesta POST
    else{
    }
}).listen(8000);  //porta 8000
