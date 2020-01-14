const ind = [1, 2, 3, 4, 5];
var voto = null;
var check = false;
var update = false;

function openReviewModal() {
  if (profile == null) {
    check == true;
    $("#signInModal").modal();
    $(document).on("hidden", "#signInModal:not(.in)", function() {
      if (check == true) {
        check = false;
        $("#modalReview").modal();
        checkReview();
      }
    });
  } else {
    checkReview();
  }
}

function sendReview() {
  if (voto == null) {
    var txt = $("#txtReview").val();
    if (txt == "") {
      txt = "null";
    }
    if (update == false) {
      $.ajax({
        type: "post",
        url:
          "insertReview?luogo=" +
          $("#reviewLuogo").text() +
          "&voto=3&descrizione=" +
          $("#txtReview").val() +
          "&wr=" +
          profile.getName() +
          "&rd=" +
          profile.getName(),
        success: function(result) {
          console.log(result);
        }
      });
    } else {
      //TODO UPDATE AJAX CALL
      console.log("mmmmmm");
    }
  } else {
    alert("ma");
  }
}

function checkReview() {
  $.ajax({
    type: "get",
    url:
      "getReview?luogo=" +
      $("#reviewLuogo").text() +
      "&wr=" +
      profile.getName() +
      "&mode=check",
    success: function(result) {
      if (result.length != 0) {
        update = true;
        //$("#txtReview").val(result[0].value.descrizione)
      } else {
        console.log("vuottoooo");
      }
      $("#modalReview").modal();
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
