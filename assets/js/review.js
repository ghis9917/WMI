const ind = [1, 2, 3, 4, 5];
var voto = null;
var check = false;
var update = false;
var channel;
function showInfo(){
  $("#bodyClip").show();
  $("#LoginRequired").hide();
  $("#spinnerReview").hide();
}

function openReviewModal(titolo, ch) {
  channel = ch;
  
  clip = titolo.replace("btn", "");
  if (profile == null) {
    check == true;
    bodyClip
    $("#bodyClip").hide();
    $("#LoginRequired").show();
  } else {
    checkReview();
  }
}


function sendReview() {
    var api;
    if (update == false) {
      api = "insertReview"
    }else{
      api = "updateReview"
    }
	
      $.ajax({
        type: "post",
        url:
          api+"?luogo=" +
          $("#infoTitolo").text() +
          "&voto="+voto+"&descrizione=" +$("#txtReview").val()+
          "&clip="+clip+
          "&wr=" +
          profile.getName() +
          "&rd=" +
          channel,
          success: function(result) {
			  voto = null;
			    update = false;
			   $("#btn"+clip).text("Edit review");
				showInfo();
				cancelReview();
        }
      });
}


function checkReviewStyle(video) {
	if(profile == null){
		return;}
  $.ajax({
    type: "get",
    url:"getReview?luogo=" + $("#infoTitolo").text() +"&clip="+video+ "&wr=" + profile.getName() +"&mode=check",
    success: function(result) {
	
      if (result.length != 0) {
        $("#btn"+video).text("Edit review");
      }
    }
  });
}


function checkReview() {
  $.ajax({
    type: "get",
    url:"getReview?luogo=" + $("#infoTitolo").text() +"&clip="+clip+ "&wr=" + profile.getName() +"&mode=check",
    success: function(result) {
      if (result.length != 0) {
        update = true;
        $("#txtReview").val(result[0].value.descrizione)
        voto = Number(result[0].value.voto);
        var color = "rgb(0,0,0)";
        for (i in ind) {
          $("#star" + ind[i]).css("color", color);
          if (voto == Number(ind[i])) {
              color = "rgb(100,100,100)";
          }
        }
      } else {
        $("#txtReview").val("")
      }
      $("#bodyClip").hide();
      $("#spinnerReview").hide();
      $("#reviewContainer").show();
    }
  });
}

function cancelReview(){
	$("#reviewContainer").hide();
    $("#bodyClip").show();
    $(".starReview").each(function() {
		$(this).css("color", "rgb(100,100,100)");
	});
	$('#sendReview').attr("disabled", true);
	channel = null;
	update = false;
}

$(document).ready(function() {
  $(".starReview").on("click", function(self) {
    voto = self.currentTarget.id;
    voto = Number(voto.replace("star", ""));
    var color = "rgb(0,0,0)";
    for (i in ind) {
      $("#star" + ind[i]).css("color", color);
      if (voto == Number(ind[i])) {
          color = "rgb(100,100,100)";
      }
    }
     $('#sendReview').removeAttr('disabled');
  });
  
  $("#txtReview").on("change input paste keyup", function() {
			if(voto != null){
				if($("#txtReview").val() != ""){
					$('#sendReview').attr("disabled", false);
				}else{
					$('#sendReview').attr("disabled", true);
				}
			}
	});
  
});
