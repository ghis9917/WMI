function getReview(name){
  $.ajax({
    type: "get",
    url: "/getReview?name=" + name,
    success: function(data) {
      console.log(data)
      if(data == ""){
        $(".spinner-border").remove();
        $("#spinner").remove();
        $("#display").show();
        $("#POInotfound").show();
      }else{
        $(".spinner-border").remove();
        $("#spinner").remove();
        $("#display").show();
        $(".POIcontainer").show();
        for( key in data[0].reviews){
          console.log()
          var codice = '<div class="shadow" id="POI" style="margin-right: 1em;margin-left: 1em;padding: 0.5em;margin-top: 1em;"data-target="#myModal" data-toggle="modal"><p id="cardFirstLine" style="margin-bottom: 0;max-width: 100%;">'+data[0].reviews[key].luogo+'</p><div class="d-flex flex-row justify-content-sm-start align-items-sm-center"><p class="text-center">'+data[0].reviews[key].descrizione+'</p></div><div class="modal fade" role="dialog" tabindex="-1" id="myModal"style="font-family: Montserrat, sans-serif;"><div class="modal-dialog modal-dialog-centered" role="document"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Luogo di <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button></div><div class="modal-body"><p>Descrizione punto interesse con DBPedia</p><p>Audio presi da youtube</p><p>Rate</p></div><div class="modal-footer"><button class="btn btn-primary" type="button">Go to the map</button></div></div></div></div></div>'
          $(".POIcontainer").append(codice);
        }

      }
    },
    error : function(){
      console.log("Impossibile contattare il server :(")
    }
  });
}
