const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const axios = require('axios');
const fs = require('fs')
var parseString = require('xml2js').parseString;
var mkdirp = require('mkdirp');
var multer = require('multer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
var readJson = require("r-json");
const Youtube = require("youtube-api"),
opn = require("opn"),
prettyBytes = require("pretty-bytes");
ffmpeg.setFfmpegPath(ffmpegPath);

const CREDENTIALS = readJson("./credential.json");
var auth = Youtube.authenticate({
  type: 'key',
  key: 'AIzaSyCAXQP_4KlAztXqWzAOvjv7Pa7DWIUb42U'
});

//
// var youtube = Youtube({
//   video: {
//     part: 'status,snippet'
//   }

// })


// Authenticate
// You can access the Youtube resources via OAuth2 only.
// https://developers.google.com/youtube/v3/guides/moving_to_oauth#service_accounts
//
let oauth = Youtube.authenticate({
    type: "oauth"
  , client_id: CREDENTIALS.web.client_id
  , client_secret: CREDENTIALS.web.client_secret
  , redirect_url: CREDENTIALS.web.redirect_uris[0]
});




opn(oauth.generateAuthUrl({
    access_type: "offline"
  , scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));



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
            if(err){
              console.log(err);
            }
            else console.log(data);
            process.exit();
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
  getDescription : function getDescription(client, POIs, titolo,f){
    return new Promise((resolve, reject) => {
    var cont={},img;
    client.connect("mongodb://localhost:27017/", { useUnifiedTopology: true } ,
    function (error, db) {
      if (!error) {
        var mydb = db.db("smogDB");
        mydb.collection("descrizioni").find({ nome: titolo }).toArray( async function (err, result) {
          if (err) throw err;
          if(result.length !== 0){
                  var json = result[0].descrizione;
                  var img = result[0].urlImg;
                  cont["desc"] = json;
                  cont["img"] = img;
                  resolve(cont);
                }
                else {
                  var d =  await f.get('http://localhost:8000/askDBPedia?que=' + titolo);
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
var x = 1
const fileName = audio.body.fname;
const stime = audio.body.stime;
const etime = audio.body.etime;

const newPath = __dirname + '/user/userid/';
const filePath = newPath + fileName.replace("Origin","");
fs.writeFileSync(filePath, audio.file.buffer, error => {
  if (error) {
    console.error(error)
    res.end()
  } else {
    res.end(fileName)
    //here you can save the file name to db, if needed
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
  console.log("posso tagliare");
  console.log(stime);
  console.log(etime);
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
       res.send("https://localhost:8000/" +'user/userid/new' + fileName);

     })
     .saveToFile(newPath + 'new' + fileName);
}
},
save: function save(req, res) {
//
console.log("in save");
mkdirp('/user/userid/upload' , function (err) {
  var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './user/userid/upload');
        },
        filename: function (req, file, cb) {
          console.log(file);
          console.log(file.originalname);
          cb(null , "Origin"+file.originalname);
        }
      });
    var upload = multer({ storage: storage }).array('file', 6)
    upload(req, res, function(err) {

    if(err) {
        return res.end("Error uploading file.");
    }
    res.end("File is uploaded");
});
});
},
upload: function upload() {
  const newPath = __dirname + '/user/userid/upload/';
  console.log("oauth");
  fs.readdir(newPath,(err,files)=>{
    for(var file in files){
      if(files[file].includes(".mkv"))  {
        var result = UploadYoutube("prova2 title", "prova2 description", ["upload","prove2"],newPath+files[file]);
      }
    }
    if (err) {
      throw err;
    }
  })
},
reload: function reload(base){

  oauth.setCredentials({
    access_token: base.query.token,
    refresh_token :base.query.refresh
  });
}

}
