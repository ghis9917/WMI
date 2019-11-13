const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const client = require('mongodb').MongoClient;
var Promise = require('rsvp').Promise;

module.exports = {
  validator: function validator(d){
    var list = d.split(":")
    try{
      return openLocationCode.decode(list[2]);
    }catch{
      return false
    }
  },
  getDescription: function getDescription(name, POIs){
    console.log("qui entra");
      client.connect('mongodb://localhost:27017/db1', { useUnifiedTopology : true }, function(error, db) {
        if(! error) {
            var mydb = db.db("WMIdb");
            console.log(mydb);
            mydb.collection("Descrizioni").find({nome : name}).toArray(function(err, result) {
                if (err) {console.log("Errrr");};
                if (result.length !== 0){
                  console.log(result);
                } else {
                  console.log("non trovato");
                  POIs[name].description = "notFound";
                }
            });
          }
          db.close();
          return;
        });
  }
}
