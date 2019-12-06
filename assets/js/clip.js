function getVideo(data){
  var videoId;
  var item = data["items"];
  console.log(item)
  for(video in item){
  console.log("VIDEO ID");
  videoId = item[video].id.videoId;
  // console.log("Description");
  // console.log(item[video].snippet.description)
  var div = document.getElementById('dad');
    var audio_streams = {}
    var audio_tag = document.createElement('audio');
    fetch("https://"+videoId+"-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=https%3A%2F%2Fwww.youtube.com%2Fget_video_info%3Fvideo_id%3D" + videoId).then(response => {
      if (response.ok) {
        response.text().then(data => {
          var data = parse_str(data),
          streams = (data.url_encoded_fmt_stream_map + ',' + data.adaptive_fmts).split(',');
          streams.forEach(function(s, n) {
            var stream = parse_str(s),
            itag = stream.itag * 1,
            quality = false;
            console.log(stream);
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
          console.log(audio_streams);
          audio_tag.src = audio_streams['128kbps'];
          audio_tag.controls = true;
          $("#iframe").append(audio_tag);
          div.hidden = false;
          // audio_tag.play();
        })
      }
    });
  }
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
              getVideo(data)
          },
          error: function(response){
              console.log("Request Failed");
          }
        });
}
