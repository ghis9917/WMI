
module.exports = {
    getConnection: function() {
      var MongoClient = require('../Server/node_modules/mongodb').MongoClient;
      // Connect to the db
      MongoClient.connect("mongodb://127.0.0.1", {useNewUrlParser: true, useUnifiedTopology: true}, function (err, db) {
        if (db === null){
          console.log(err);
        } else {
          console.log(db);
        }
      });
    },
    insertLogin : function(id, email, url, name){
      var MongoClient = require('../Server/node_modules/mongodb').MongoClient;
      // Connect to the dbù
      MongoClient.connect("mongodb://127.0.0.1/WMIdb", {useNewUrlParser: true, useUnifiedTopology: true}, function (err, db) {
        if(!db){console.log("bah");
          db.collection("Login").findOne({}, function(err, result) {
            if (err) throw err;
            console.log("bah");
            console.log(result.prova);
          });

          db.close();
      }
    });
    }
};
