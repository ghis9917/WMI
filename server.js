var http = require('http');
var fs = require('fs');
var path = require('path');
var mobile = require('is-mobile');

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
    if( req.method == "GET"){
      if(req.url === "/"){
          invia(res,"text/html","index.html");
      }else if(req.url.match("\.css$")){
          var myFile= (req.url).toString();
          myFile = myFile.substring(myFile.indexOf('/')+1);
          if (fs.existsSync(myFile)) {
            invia(res,"text/css",myFile);
          }
      }else if(req.url.match("\.html$")){
        var myFile= (req.url).toString();
        myFile = myFile.substring(myFile.indexOf('/')+1);
        if (fs.existsSync(myFile)) {
          invia(res,"text/html",myFile);
        }
      }else if(req.url.match("\.js$")){
        var myFile= (req.url).toString();
        myFile = myFile.substring(myFile.indexOf('/')+1);
        if (fs.existsSync(myFile)) {
          invia(res,"text/js",myFile);
        }else{
          errore(res);
        }
      }else{
        errore(res);
      }
    }
    // Richiesta POST
    else{
    }
}).listen(80);
