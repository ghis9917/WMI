
function openReviewModal(){
  $('#modalReview').modal()
}

function review(){
  var title = "prova"
  $.ajax({
    type: "post",
    url: "insertReviewUserMode?id="+title+"&voto=3&descrizione=oooo", success: function(result){
      alert(result)
  }});
}
