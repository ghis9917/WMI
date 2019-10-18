function sendDataLogin(){
  $.ajax({
    type: "POST",
    url: "http://localhost:8000/insert?email="+getGoogleEmail()+"&id="+ getGoogleId() +"&name="+ getGoogleId() +"&url="+ getGoogleUrl(),
     success: function(result){
       console.log(result);
     },
     error : function(){
       console.log ("non va");
     }
   });
}
