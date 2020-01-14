function getProfileReview() {
  var rat = 0;
  console.log(profile.getName());
  $.ajax({
    type: "GET",
    url: "https://localhost:8000/getReview?mode=profile&rd=" + profile.getName(),
    success: function(result) {
      if(result == "null"){

      }else{
        console.log(result)
        $.each(result, function(i, item) {
            rat = rat + parseInt(item.value.voto);
          $(".POIcontainer").append('<div class="shadow" id="POI" style="margin-right: 1em;margin-left: 1em;padding: 0.5em;margin-top: 1em;"><p id="cardFirstLine" style="margin-bottom: 0;max-width: 100%;">'+item._id+'</p><div"><p style="margin:0px;">Descrizione: '+item.value.descrizione+'</p><p style="margin:0px;">Rating: '+item.value.voto+'/5</p></div></div>');
        });

        rat = rat / result.length;
        console.log(rat);
        $("#rateContainer > p").text("Rating: "+ rat+"/5");
        $(".spinner-border").remove();
        $("#spinner").remove();
        $("#display").show();
      }
      console.log(result)
    },
    error: function(c) {
      console.log(c);
    }
  });
}
