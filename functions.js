const OpenLocationCode = require('open-location-code').OpenLocationCode;
const openLocationCode = new OpenLocationCode();
const axios = require('axios');

module.exports = {
  validator: function validator(d) {
    var list = d.split(":")
    try {
      return {coords : openLocationCode.decode(list[2]), plusCode: list[2]};
    } catch{
      return false
    }
  },
  get: function get(search) {
    return axios.get(search);
  },
  dist: function dist(item,lat,lon){
    var url = "https://graphhopper.com/api/1/matrix?from_point=" + lat + "," + lon;
    url += "&to_point=" + item["latitudeCenter"] + "," + item["longitudeCenter"]
    url += "&type=json&vehicle=foot&debug=true&out_array=weights&out_array=times&out_array=distances&key=a0695b22-2381-4b66-8330-9f213b610d8f";
    return axios.get(url)
    .then(response => {
      item["distance"] = response["data"]["distances"][0][0];
    })
    .catch(error => {
        console.log(error);
    });
  }
}
