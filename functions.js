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
  }
  //   console.log("qui entra");
  //       await client.connect('mongodb://localhost:27017/db1', (error, db) =>{
  //       console.log("error");
  //       console.log(error);
  //       console.log("db");
  //       console.log(db);
  //       if(!error) {
  //
  //           var mydb = db.db("WMIdb");
  //            mydb.collection("Descrizioni").find({nome : name}).toArray(function(err, result) {
  //               if (err) {console.log("Errrr");};
  //               if (result.length !== 0){
  //                 console.log("result");
  //                 console.log(result);
  //               } else {
  //                 console.log("non trovato");
  //                 POIs[name].description = "notFound";
  //               }
  //           });
  //           db.close();
  //         }
  //         return;
  //       });
  //     console.log("fine funzione    ")
  // }
}
