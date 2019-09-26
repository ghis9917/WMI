
module.exports = {
    getDBPedia: function(value, ontology, res) {
        //TODO MIGLIORARE LA RICERCA
        var query =
          "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+
          "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"+
          "PREFIX foaf: <http://xmlns.com/foaf/0.1/>"+
          "SELECT ?film ?description ?film_name WHERE {"+
          "?film rdf:type <http://dbpedia.org/ontology/"+ontology+">."+
          "?film foaf:name ?film_name."+
          "?film rdfs:comment ?description ."+
          "FILTER (LANG(?description)='it' && ?film_name like '"+value+"'@en)} ";
        var SparqlClient = require('sparql-client');
        var util = require('util');
        var endpoint = 'http://dbpedia.org/sparql';
        var client = new SparqlClient(endpoint);
         client.query(query).execute( function(error, results) {
            var string = JSON.stringify(results);
            var objectValue = JSON.parse(string);
            console.log(objectValue["results"]["bindings"][0]["description"]["value"])
            //TODO
            res.end(objectValue["results"]["bindings"][0]["description"]["value"]);
        });
    }
};
