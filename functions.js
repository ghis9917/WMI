const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const axios = require('axios');

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
    client.connect("mongodb://localhost:27017/",
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
    client.connect("mongodb://localhost:27017/", { useUnifiedTopology: true } ,
      function (error, db) {
        if (!error) {
          var mydb = db.db("smogDB");
          mydb.collection("descrizioni").find({ nome: titolo }).toArray(async function (err, result) {
            if (err) throw err;
            // console.log("Trovato");
              if(result.length !== 0){
                console.log("TITOLO TROVATO " + titolo)
                POIs[titolo].description = result[0].descrizione;
                POIs[titolo].img = result[0].urlImg;
                console.log(result[0].descrizione)

              }
              else {
                var d = await f.get('http://localhost:8000/askDBPedia?que=' + titolo);
                try{
                  var e = await f.get(d.data.results.bindings[0].c1.value.replace("resource", "data")+".rdf");
                  console.log("senza to string")
                  console.log(e.data)
                  console.log("wela")
                  console.log(e.data["rdf:RDF"]["rdf:Description"][0]['rdfs:comment'].toString())
                  var list = e.data["rdf:RDF"]["rdf:Description"][0]['rdfs:comment'].toString();
                  console.log(list)
                  var json = {};
                  for (var key in list) {
                    var chiave = list[key]["$"]["xml:lang"];
                    var valore = list[key]["_"];
                    json[chiave] = valore;
                    var img = e.data["rdf:RDF"]["rdf:Description"][0]["dbo:thumbnail"][0]["$"]["rdf:resource"];
                    f.insertDescription(client, titolo, list, img)
                    POIs[titolo].description = list;
                    POIs[titolo].img = img;
                  }
              }
              catch{
                var json = {};
                var img = "NF";
                json["en"] = "NOT FOUND";
                // f.insertDescription(client, titolo, json, img)
                POIs[titolo].description = json;
                POIs[titolo].img = img;
              }
              }
              db.close();
            });
        }
        else {
          console.log(error);
        }
      }
    );
  },
  get: function get(search) {
    return axios.get(search);
  },
  dist: function dist(item,lat,lon){
    var url = "https://graphhopper.com/api/1/matrix?from_point=" + lat + "," + lon;
    url += "&to_point=" + item["latitudeCenter"] + "," + item["longitudeCenter"]
    url += "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=653995f0-72fe-4af8-b598-60e50479a0c2";
    return axios.get(url)
    .then(response => {
      item["distance"] = response["data"]["distances"][0][0];
    })
    .catch(error => {
        console.log(error);
    });
  }
}
