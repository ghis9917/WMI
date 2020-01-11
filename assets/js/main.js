$(document).ready(function(){
     // redirect_uri of the project
     var redirect_uri = "https://localhost:8000/userMode.html";

     const scope = "https://www.googleapis.com/auth/youtube";

     var clientId = "114712511052-o00pbvnd01mt0jfl946p61k2vtjfk6m8.apps.googleusercontent.com";// replace it with your client id
     // the url to which the user is redirected to
     var url = "";
     // this is event click listener for the button
     $("#login").click(function(){
        // this is the method which will be invoked it takes four parameters
        signIn(clientId,redirect_uri,scope,url);
      });

      function signIn(clientId,redirect_uri,scope,url){
        // the actual url to which the user is redirected to
        url = "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri="+redirect_uri
        +"&prompt=consent&response_type=code&client_id="+clientId+"&scope="+scope
        +"&access_type=offline";
        // this line makes the user redirected to the url
        window.location = url;
     }

});
