
const ind = [1, 2, 3, 4, 5];
var voto = null;

$(document).ready(function() {
  $(".starReview").on("click", function(self) {
    voto = Number(self.currentTarget.id);
    var color = "rgb(230,180,0)";
    for (i in ind) {
      $("#" + ind[i]).css("color", color);
      if (voto == Number(ind[i])) {
        color = "rgb(100,100,100)";
      }
    }
  });
});


function openReviewModal(){
  $('#modalReview').modal()
}


function sendReview(){
  if(voto != null){
    var txt = $("#txtReview").val();
    if(txt == ""){
      txt = "null"
    }
    $.ajax({
      type: "post",
      url: "insertReviewUserMode?id="+$("#reviewLuogo").text()+"&voto=3&descrizione="+txt, success: function(result){
        console.log(result)
    }});
  }else{
    alert("ma");
  }
}
