const OpenLocationCode = require("open-location-code").OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const axios = require("axios");

module.exports = {
  validator: function validator(d) {
    var list = d.split(":");
    try {
      return { coords: openLocationCode.decode(list[2]), plusCode: list[2] };
    } catch {
      return false;
    }
  },
  get: function get(search) {
<<<<<<< Updated upstream
    return axios.get(search);
  }
};
=======
    return new Promise((resolve,reject) => {
      axios.get(search)
      .then(response => {
        resolve(axios.get(search));
      })
      .catch(error => {
          reject(error);
      });
    });
  },
  dist: function dist(item,lat,lon){
    return new Promise((resolve,reject) => {
    var url = "https://graphhopper.com/api/1/matrix?from_point=" + lat + "," + lon;
    url += "&to_point=" + item["latitudeCenter"] + "," + item["longitudeCenter"]
    url += "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=653995f0-72fe-4af8-b598-60e50479a0c2";
    axios.get(url)
    .then(response => {
      item["distance"] = response["data"]["distances"][0][0];
      resolve(response["data"]["distances"][0][0])
    })
    .catch(error => {
        reject(error);
    });
});
}
}
>>>>>>> Stashed changes
