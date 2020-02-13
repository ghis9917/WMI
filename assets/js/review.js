const ind = [1, 2, 3, 4, 5];
var voto = null;
var check = false;
var update = false;

function showInfo(){
  $("#bodyClip").show();
  $("#LoginRequired").hide();
  $("#spinnerReview").hide();
}

function openReviewModal(titolo) {

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
          $("#reviewLuogo").text() +
          "&voto="+voto+"&descrizione=" +$("#txtReview").val()+
          "&clip="+clip+
          "&wr=" +
          profile.getName() +
          "&rd=" +
          profile.getName(),
          success: function(result) {
            $("#reviewContainer").hide();
            $("#iframeContainer").show();
        }
      });
}

function checkReview() {
  $.ajax({
    type: "get",
    url:"getReview?luogo=" + $("#reviewLuogo").text() +"&clip="+clip+ "&wr=" + profile.getName() +"&mode=check",
    success: function(result) {
      if (result.length != 0) {
        update = true;
        $("#txtReview").val(result[0].value.descrizione)
        voto = Number(result[0].value.voto);
        var color = "rgb(230,180,0)";
        for (i in ind) {
          $("#star" + ind[i]).css("color", color);
          if (voto == Number(ind[i])) {
              color = "rgb(100,100,100)";
          }
        }
      } else {
        $("#txtReview").val("")
      }
      $("#spinnerReview").hide();
      $("#reviewContainer").show();
    }
  });
}

$(document).ready(function() {
  $(".starReview").on("click", function(self) {
    voto = self.currentTarget.id;
    voto = Number(voto.replace("star", ""));
    var color = "rgb(230,180,0)";
    for (i in ind) {
      $("#star" + ind[i]).css("color", color);
      if (voto == Number(ind[i])) {
          color = "rgb(100,100,100)";
      }
    }
  });
});
