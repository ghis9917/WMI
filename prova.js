const express = require("express");
const app = express();
var client = require("mongodb").MongoClient;

app.get("/", (req, res) => {
  client.connect("mongodb://localhost:27017/", function(error, db) {
    if (!error) {
      var mydb = db.db("WMIdb");
      var myobj = { nome: "mammt" };
      mydb.collection("Descrizioni").insertOne(myobj, function(err, ris) {
        if (err) throw err;
        res.send("Inserito");
        db.close();
      });
    }else{
      res.send(error);
    }
  });
});

app.listen(8000, () => console.log("Gator app listening on port 8000!"));
