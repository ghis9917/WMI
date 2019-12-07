// function getVideo(data){
//   var videoId;
//   var item = data["items"];
//   console.log(item)
//   for(video in item){
//   console.log("VIDEO ID");
//   videoId = item[video].id.videoId;
//   console.log(videoId);
//   // console.log(item[video].snippet.description)
//   var div = document.getElementById('dad');
//   audio_streams = {},
//   audio_tag = document.getElementById('iframe');
//   fetch("https://"+videoId+"-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=https%3A%2F%2Fwww.youtube.com%2Fget_video_info%3Fvideo_id%3D" + videoId).then(response => {
//     if (response.ok) {
//       response.text().then(data => {
//         var data = parse_str(data),
//         streams = (data.url_encoded_fmt_stream_map + ',' + data.adaptive_fmts).split(',');
//         streams.forEach(function(s, n) {
//           var stream = parse_str(s),
//           itag = stream.itag * 1,
//           quality = false;
//           console.log(stream);
//           switch (itag) {
//             case 139:
//               quality = "48kbps";
//               break;
//               case 140:
//               quality = "128kbps";
//               break;
//               case 141:
//               quality = "256kbps";
//               break;
//           }
//           if (quality) audio_streams[quality] = stream.url;
//         });
//         console.log(audio_streams);
//         audio_tag.src = audio_streams['128kbps'];
//         audio_tag.controls = true;
//         div.hidden = false;
//         $("#iframe").append(audio_tag)
//         // audio_tag.play();
//       })
//     }
//   });
//   }
// }

function getVideo(data){
    var item = data["items"],videoId;

  for(video in item){
    videoId = item[video].id.videoId;
}
console.log("VIDEO ID");
console.log(videoId);

  var div = document.getElementById('dad');
    audio_streams = {},
    audio_tag = document.getElementById('iframe');
    fetch("https://"+videoId+"-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=https%3A%2F%2Fwww.youtube.com%2Fget_video_info%3Fvideo_id%3D" + videoId).then(response => {
      if (response.ok) {
        response.text().then(data => {
          // console.log("daata");
          // console.log(data);
          var data = parse_str(data),
          streams = (data.url_encoded_fmt_stream_map + ',' + data.adaptive_fmts).split(',');
          // console.log("STRSMD")
          // console.log(streams);
          var quality = false;
          streams.forEach(function(s, n) {
            var stream = parse_str(s),
            itag = stream.itag * 1;
            console.log("itag");
            console.log(itag);
            switch (itag) {
              case 139:
                quality = "48kbps";
                break;
                case 140:
                quality = "128kbps";
                break;
                case 141:
                quality = "256kbps";
                break;
            }
            if (quality) audio_streams[quality] = stream.url;
          });
          console.log("quality");
          console.log(quality);
          audio_tag.src = audio_streams[quality];
          audio_tag.controls = true;
          div.hidden = false;
          // audio_tag.play();
        })
      }
    });
}

function parse_str(str) {
    return str.split('&').reduce(function(params, param) {
        var paramSplit = param.split('=').map(function(value) {
            return decodeURIComponent(value.replace('+', ' '));
        });
        params[paramSplit[0]] = paramSplit[1];
        return params;
    }, {});
}

function getVideoId(poi){
  var search = "";
  search += OpenLocationCode.encode(poi.latitudeCenter,poi.longitudeCenter,4);
  search += OpenLocationCode.encode(poi.latitudeCenter,poi.longitudeCenter,6);
  search += OpenLocationCode.encode(poi.latitudeCenter,poi.longitudeCenter);
  console.log("SEARCH")
  console.log(search)
  searchByKeyword(search)
}

function searchByKeyword(query) {
  console.log("search keyword")
        $.ajax({
          type: 'GET',
          url: 'https://www.googleapis.com/youtube/v3/search',
          data: {
              key: 'AIzaSyBEpETjNZc18OP9L603YkzOvotslkQiBGI',
              q: query,
              part: 'snippet',
              maxResults: 50,
              type: 'video',
              videoEmbeddable: true,
          },
          success: function(data){
              console.log(data)
              var item = data["items"];
              var iframe;
              for(video in item ){
                iframe = document.createElement("audio");
                videoId = item[video].id.videoId;
                // iframe.src = "https://www.youtube.com/watch?v="+videoId;
                // iframe.controls = true;
                // iframe.width="0";
                // iframe.height="0";
                // iframe.frameborder="0";
                // $("#iframeContainer").append(iframe)
                onYouTubeIframeAPIReady(videoId);

              }
              var div = document.getElementById("clipContainer")
              div.hidden = false;

              // getVideo(data)
          },
          error: function(response){
              console.log("Request Failed");
          }
        });
}


function onYouTubeIframeAPIReady(videoId){
  var e = document.getElementById("iframeContainer"),t=document.createElement("img");
  t.setAttribute("id","youtube-icon");
  t.style.cssText="cursor:pointer;cursor:hand";
  e.appendChild(t);
  var a=document.createElement("div");a.setAttribute("id","youtube-player"),e.appendChild(a);
  var o=function(e){
    var a=e?"IDzX9gL.png":"quyUPXN.png";
    t.setAttribute("src","https://i.imgur.com/"+a)
  };
  e.onclick=function(){
    r.getPlayerState()===YT.PlayerState.PLAYING||r.getPlayerState()===YT.PlayerState.BUFFERING?(r.pauseVideo(),o(!1)):(r.playVideo(),o(!0))
  };
  var r=new YT.Player("youtube-player",{height:"0",width:"0",videoId:videoId,playerVars:{autoplay:e.dataset.autoplay,loop:e.dataset.loop},events:{
    onReady:function(e){
      r.setPlaybackQuality("small"),o(r.getPlayerState()!==YT.PlayerState.CUED)},onStateChange:function(e){
        e.data===YT.PlayerState.ENDED&&o(!1)}
      }}
    )
  }
