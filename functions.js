const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const client = require('mongodb').MongoClient;
var Promise = require('rsvp').Promise;

module.exports = {
  validator: function validator(d) {
    var list = d.split(":")
    try {
      return openLocationCode.decode(list[2]);
    } catch{
      return false
    }
  },
  getDescription: function getDescription(name, POIs) {
    POIs[name].description = "Descrizione";
    /*client.connect('mongodb://site181947:27017/', { useUnifiedTopology: true }, function (error, db) {
      if (!error) {
        console.log(db);
        var mydb = db.db("WMIdb");
        mydb.collection("Descrizioni").find({ nome: name }).toArray(function (err, result) {
          if (err) {//console.log("Errrr");
          };
          if (result.length !== 0) {
            //console.log(result);
          } else {
            //console.log("non trovato");
            POIs[name].description = "notFound";
          }
        });
      }else{
        console.log(error);
      }
      db.close();
      return;
    });*/
  }
}
