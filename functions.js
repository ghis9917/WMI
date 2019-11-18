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
    return axios.get(search);
  }
};
