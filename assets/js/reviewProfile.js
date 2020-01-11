function getProfileReview() {
  $(".rightContainer").hide();

  console.log(profile.getName());
  $.ajax({
    type: "GET",
    url: "https://localhost:8000/getReviewProfileMode?id=" + profile.getName(),
    success: function(result) {
      $(".rightContainer").show();
      $.each(result, function(i, item) {
        //console.log(item[])
      });
    },
    error: function(c) {
      console.log(c.responseText);
    }
  });
}
