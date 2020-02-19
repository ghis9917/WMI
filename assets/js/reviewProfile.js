function setDefault(){
	var i = 0
	$(".pt-4").text((0).toFixed(1));
	$(".text-right").each(function() {
			$(".bar-"+(i +1)).css("width", 0 + "%" );
			$(this).text(0);
			i = i +1;
		});
}


function removeReview(id){
	//$("#"+id).parent().fadeOut(2000);
	$("#"+id).parent().remove();
	if ($("#PersonalReview").children().length == 1){
		$("#PersonalReview > h5").remove();
	}
	$.ajax({
				type: "GET",
				url: "/removeReview?id=" + id,
				success: function(result) {
						 
				}
			 });
}
function getYourReview(){
		$.ajax({
			type: "GET",
			url: "/getReview?mode=user&wr=" + profile.getName(),
			success: function(result) {
					 if(result == "null"){
					//TODO SOMETHING
					}else{
						$("#PersonalReview").empty();
						$("#PersonalReview").append('<h5>Personal Review</h5>');
					$.each(result, function(i, item) {
						
						  $("#PersonalReview").append(
						  '<div class="shadow" id="POI" style="margin: 0.25em; padding: 0.5em;">'+
						  '<p id="cardFirstLine" style="margin-bottom: 0;max-width: 100%;">'+item.luogo+'</p>'+
						  '<div>'+
						  '<p style="margin:0px;">Descrizione: '+item.value.descrizione+'</p>'+
						  '<div>'+
						  '<span id="star1" class="fa fa-star star-inactive mx-1"></span>'+
						  '<span id="star2" class="fa fa-star star-inactive mx-1"></span>'+
						  '<span id="star3" class="fa fa-star star-inactive mx-1"></span>'+
						  '<span id="star4" class="fa fa-star star-inactive mx-1"></span>'+
						  '<span id="star5" class="fa fa-star star-inactive mx-1"></span>'+
						  '</div>'+
						  '</div>'+
						  '<button class="btn btn-outline-danger" id="'+item._id+'" onclick="removeReview(this.id)" >Elimina</button>'+
						  '</div>');
							var last = $(".POIcontainer:last-child");
							for(var i=1; i<=item.value.voto; i++){
								
								$(".shadow:last-child > div > div > #star"+i).removeClass("star-inactive");
								$(".shadow:last-child > div > div > #star"+i).addClass("star-active");
							}
						});
					}
		  }
		 });
}



function getProfileReview() {
  var rat = 0;
  
  
  $.ajax({
    type: "GET",
    url: "/getReview?mode=profile&rd=" + profile.getName(),
    success: function(result) {
	  var x =  [0,0,0,0,0];
      if(result == "null"){
        setDefault();
      }else{
		$(".POIcontainer").empty();
		$(".POIcontainer").append('<h5>Other Review</h5>');
        $.each(result, function(i, item) {
			x[item.value.voto -1] = x[item.value.voto -1 ] +1;
            rat = rat + parseInt(item.value.voto);
          $(".POIcontainer").append(
          '<div class="shadow" id="POI" style="margin: 0.25em; padding: 0.5em;">'+
          '<p id="cardFirstLine" style="margin-bottom: 0;max-width: 100%;">'+item.luogo+'</p>'+
          '<div>'+
          '<p style="margin:0px;">Descrizione: '+item.value.descrizione+'</p>'+
          '<div>'+
          '<span id="star1" class="fa fa-star star-inactive mx-1"></span>'+
          '<span id="star2" class="fa fa-star star-inactive mx-1"></span>'+
          '<span id="star3" class="fa fa-star star-inactive mx-1"></span>'+
          '<span id="star4" class="fa fa-star star-inactive mx-1"></span>'+
          '<span id="star5" class="fa fa-star star-inactive mx-1"></span>'+
          '</div>'+
          '</div>'+
          '</div>');
		    var last = $(".POIcontainer:last-child");
		    for(var i=1; i<=item.value.voto; i++){
				
				
				$(".shadow:last-child > div > div > #star"+i).removeClass("star-inactive");
				$(".shadow:last-child > div > div > #star"+i).addClass("star-active");
			}
        });
        
		var rateo = parseInt(rat / result.length);	
		for(var i=1; i<=rateo; i++){		
			$("#star"+i).removeClass("star-inactive");
			$("#star"+i).addClass("star-active");
		}
        $(".pt-4").text((rateo).toFixed(1));
        $(".spinner-border").remove();
        
        i = 4
        $(".text-right").each(function() {
			var l = result.length;
			var t = (x[i]*100);
			$(".bar-"+(i +1)).css("width", (t/l) + "%" );
			$(this).text(x[i]);
			i = i -1
		});
      }
      getYourReview();
      $("#spinner").remove();
       $("#display").show();
      $("#main").show();
    },
    error: function(c) {
      console.log(c);
    }
  });
}
