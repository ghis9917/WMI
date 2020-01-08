function setApiKey() {
  $("#btn-load").click(function() {
    callApi();
  });
  this.placesAutocomplete = places({
    appId: "plTCO8O9NAP7",
    apiKey: "a5c7d70d42023f9e0afdfa6bac7a2634",
    container: document.querySelector("#address")
  });
}

function checkMode() {
  if (
    "https://localhost:8000/userMode.html" == window.location.href ||
    "https://localhost:8000/userMode.html/" == window.location.href ||
    "https://localhost:8000/userMode.html#" == window.location.href
  ) {
    return 1;
  } else return 0;
}

$("#stop").click(function() {
  $("#popupContainer").css("z-index", "-1");
});

function showCloseInfo() {
  if (state === "close") {
    $("#popupContainer").css("z-index", "-1");
    $("#popupContainer").css("height", "0px");
    $("#popupOpener").css("bottom", "0px");
    $("#popupOpener").css("margin-bottom", "1em");
    $("#popupOpener").css("border-radius", "15px");
    $("#upDown").attr("class", "fa fa-angle-up d-flex");
    state = "open";
  } else {
    $("#popupContainer").css("z-index", "2");
    $("#popupContainer").css("height", "250px");
    $("#popupContainer").css("margin-top", "0em");
    $("#popupOpener").css("bottom", "266px");
    $("#popupOpener").css("margin-bottom", "0em");
    $("#popupOpener").css("border-bottom-right-radius", "0px");
    $("#popupOpener").css("border-bottom-left-radius", "0px");
    $("#upDown").attr("class", "fa fa-angle-down d-flex");
    state = "close";
  }
}

function cssError() {
  $(".ap-input").css({ backgroundColor: "red" });
}

function callApi() {
  if ($("#address").val() != "") {
    $.ajax({
      async: false,
      url:
        "https://api.opencagedata.com/geocode/v1/json?q=" +
        $("#address").val() +
        "&key=4e6db93d236944d68db1551367316df5&language=it&pretty=1",
      success: result => {
        if (result.results.length != 0) {
          var popup =
            '<p class="text-center" style="margin: 1em;">Sei qui!</p>';
          lat = result.results[0].geometry.lat;
          lon = result.results[0].geometry.lng;
          try {
            mymap.removeLayer(currentLocation);
          } catch {}
          currentLocation = L.marker([lat, lon], { icon: blackIcon })
            .bindPopup(popup)
            .addTo(mymap);
          updateCustomRouting();
          if (checkMode() == 0) {
            console.log("rimosso in teoria");
            mymap.removeControl(customdirection);
          }

          if (control !== null) {
            control.spliceWaypoints(0, 1, [lat, lon]);
          }

          $("#noGeo").modal("toggle");
          if (
            "http://localhost:8000/editorMode.html" == window.location.href ||
            "http://localhost:8000/editorMode.html/" == window.location.href ||
            "http://localhost:8000/editorMode.html#" == window.location.href
          ) {
            loadMarker();
          }
        } else {
          cssError();
        }
      },
      error: result => {
        console.log("Impossibile contattare il server");
        cssError();
      }
    });
  } else {
    cssError();
  }
}

function addPlayButton() {
  if (checkMode() == 1) {
    customdirection = L.easyButton({
      states: [
        {
          stateName: "search", // name the state
          icon: "fa-location-arrow", // and define its properties
          title: "Enter address", // like its title
          onClick: function(btn) {
            $("#noGeo").modal();
          }
        },
        {
          stateName: "start", // name the state
          icon: "fas fa-play", // and define its properties
          title: "Start routing to nearest POI", // like its title
          onClick: function(btn) {
            createPlayer();
          }
        },
        {
          stateName: "loading", // name the state
          icon: "fa fa-spinner", // and define its properties
          title: "We are loading POI" // like its title
        },
        {
          stateName: "started", // name the state
          icon: "fas fa-pause", // and define its properties
          title: "Stop routing", // like its title
          onClick: function(btn) {
            mymap.removeControl(control);
            control = null;
            btn.state("start");
          }
        }
      ]
    }).addTo(mymap);
  } else {
    customdirection = L.easyButton({
      states: [
        {
          stateName: "search", // name the state
          icon: "fa-location-arrow", // and define its properties
          title: "Enter address", // like its title
          onClick: function(btn) {
            $("#noGeo").modal();
          }
        }
      ]
    }).addTo(mymap);
  }
}

function getPOIs(q) {
  return $.ajax({
    type: "get",
    url: "/getPOIs?searchQuery=" + q,
    success: function(data) {
      POIs = data;
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
