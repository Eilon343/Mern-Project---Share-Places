const request = require("requestify");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyBMzvr5XVru50xC7v9DHjDi1pYCzpGP8EA";
async function convertAddressToCords(address) {
  const url =
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    encodeURIComponent(address) +
    "&key=" +
    API_KEY;

  let response = await request.get(url);

  let data = response.getBody();
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address",
      422
    );
    throw error;
  }

  return data.results[0].geometry.location;
}

module.exports = convertAddressToCords;
