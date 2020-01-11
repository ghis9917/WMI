const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const axios = require('axios');
const fs = require('fs')
var parseString = require('xml2js').parseString;
var multer = require('multer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
var readJson = require("r-json");
const Youtube = require("youtube-api"),
path = require("path");
ffmpeg.setFfmpegPath(ffmpegPath);

const CREDENTIALS = readJson("./credential.json");
var auth = Youtube.authenticate({
  type: 'key',
  key: 'AIzaSyCAXQP_4KlAztXqWzAOvjv7Pa7DWIUb42U'
});

let oauth = Youtube.authenticate({
    type: "oauth"
  , client_id: CREDENTIALS.web.client_id
  , client_secret: CREDENTIALS.web.client_secret
});

function UploadYoutube (myTitle, myDescription, myTags, myFileLocation) {
    var req = Youtube.videos.insert({
            resource: {
                // Video title and description
                snippet: {
                    title: myTitle
                  , description: myDescription
                  , tags: myTags

                }
                // I don't want to spam my subscribers
              , status: {
                    privacyStatus: "public"
                }
            }
            // This is for the callback function
          , part: "snippet,status"

            // Create the readable stream to upload the video
          , media: {
                body: fs.createReadStream(myFileLocation)
            }
        }, (err, data) => {
          console.log("this data");
            if(err){
              console.log(err);
            }
            else console.log(data);
            // process.exit();
        });
        return req;
}

module.exports = {
  validator: function validator(d) {
    var list = d.split(":")
    try {
      return {coords : openLocationCode.decode(list[2]), plusCode: list[2]};
    } catch(err){
      return false
    }
  },
  insertDescription : function insertDescription(client, titolo, desc, img){
    client.connect("mongodb://localhost:27017/",  { useUnifiedTopology: true },
      function (error, db) {
        if (!error) {
          var mydb = db.db("smogDB");
          var myobj = { nome: titolo, descrizione: desc, urlImg : img };
          mydb.collection("descrizioni").insertOne(myobj, function (err, res) {
            if (err) throw err;
            db.close();
          });
        }
      }
    );
  },
  getDescription : function getDescription(client, titolo,f){
    return new Promise((resolve, reject) => {
    var cont={},img;
    client.connect("mongodb://localhost:27017/", { useUnifiedTopology: true } ,
    function (error, db) {
      if (!error) {
        var mydb = db.db("smogDB");
        mydb.collection("descrizioni").find({ nome: titolo }).toArray( async function (err, result) {
          if (err) throw err;
          console.log(result)
          if(result.length !== 0){
                  var json = result[0].descrizione;
                  var img = result[0].urlImg;
                  cont["desc"] = json;
                  cont["img"] = img;
                  resolve(cont);
                }
                else {
                   console.log("qui si ferma e poi non stampa")
                  var d =  await f.get('http://localhost:8000/askDBPedia?que=' + titolo).catch((e)=>{console.log(e);});
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
                      f.insertDescription(client, titolo, json, img)
                      cont["desc"] = json;
                      cont["img"] = img;
                      resolve(cont)
                    });
                  }
                  catch (error) {
                    var json = {};
                    var img = "NF";
                    json["en"] = "NOT FOUND";
                    cont["desc"] = json;
                    cont["img"] = img;
                    f.insertDescription(client, titolo, json, img)
                    resolve(cont)
                  }
        }
        db.close();
        });
      }
      else {
        reject(error);
      }
    } );
  });
},

  get: function get(search) {
    return new Promise((resolve,reject) => {resolve(axios.get(search))});
  },
  dist: function dist(item,lat,lon){
    return new Promise((resolve,reject) => {
    var url = "https://graphhopper.com/api/1/matrix?from_point=" + lat + "," + lon;
    url += "&to_point=" + item["latitudeCenter"] + "," + item["longitudeCenter"]
    url += "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=a0695b22-2381-4b66-8330-9f213b610d8f";
    axios.get(url)
    .then(response => {
      item["distance"] = response["data"]["distances"][0][0];
      resolve(response["data"]["distances"][0][0])
    })
    .catch(error => {
        reject(error);
    });
});
},
cutAudio: function cutAudio(audio,res) {
const fileName = audio.body.fname;
const stime = audio.body.stime;
const etime = audio.body.etime;
const id = audio.body.id;
const newPath = __dirname + '/user/'+id+'/';
const filePath = newPath + fileName.replace("Origin","");

if (!fs.existsSync(newPath)) {
  fs.mkdirSync(newPath);
}

fs.writeFileSync(filePath, audio.file.buffer, error => {
  if (error) {
    console.error(error)
    res.end()
  } else {
    res.end(fileName)
  }
})

if(fileName.includes('Origin')){
console.log("E arrivato il file originale e lo salvo")
const origin = new ffmpeg({ source: filePath  });
origin
     .on("start", function(commandLine) {
       console.log("Spawned FFmpeg with command: " + commandLine);
     })
     .on("error", function(err) {
       console.log("errorp: ", +err.message);
     })
     .on("end", function(err) {
       if (!err) {
         console.log("conversion Done");
       }
     })
     .saveToFile(newPath + "1"+fileName);
}
if(stime != undefined && etime != undefined){
const conv = new ffmpeg({ source: filePath  });
conv
     .setStartTime(stime) //Can be in "HH:MM:SS" format also
     .setDuration(etime-stime)
     .on("start", function(commandLine) {
       console.log("Spawned FFmpeg with command: " + commandLine);
     })
     .on("error", function(err) {
       console.log("error: ", +err.message);
     })
     .on("end", function(err) {
       if (!err) { console.log("conversion Done"); }

       x = 0;
       res.send("https://localhost:8000/" +'user/'+id+'/new' + fileName);

     })
     .saveToFile(newPath + 'new' + fileName);
}
},
upload: function upload(fileName,id) {
  const newPath = __dirname + '/user/'+id+'/upload/';
  const absolute = newPath + fileName + '.mkv';
   var result = UploadYoutube("prova2 title"+fileName, "prova2 description"+fileName, ["upload"+fileName,"prove2"+fileName],absolute);
},
reload: function reload(base){
 if(oauth.credentials.access_token != undefined && oauth.credentials.refresh_token != undefined){
  oauth.setCredentials({
    access_token: base.query.token,
    refresh_token :base.query.refresh
  });
}
},
remove: function remove(id){
  fs.rmdir(__dirname + '/user/'+id, { recursive: true }, function (){});
}

}
