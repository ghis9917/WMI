const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const axios = require('axios');
var parseString = require('xml2js').parseString;

module.exports = {
  validator: function validator(d) {
    var list = d.split(":")
    try {
      return {coords : openLocationCode.decode(list[2]), plusCode: list[2]};
    } catch{
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
    url += "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=653995f0-72fe-4af8-b598-60e50479a0c2";
    axios.get(url)
    .then(response => {
      item["distance"] = response["data"]["distances"][0][0];
      resolve(response["data"]["distances"][0][0])
    })
    .catch(error => {
        reject(error);
    });
});
}
}
