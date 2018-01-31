var express = require('express');
var router = express.Router();

var owmModel = require('../models/owm');

router.get('/weatherCity/:city/:code', function (request, response) {
  var city = request.params.city,
      code = request.params.code;
  owmModel.getWeatherCityCode (city, code, function(error, data){
    data = JSON.stringify(data);
    data = data.replace(/\\/g, "");
    data= data.substring(1, data.length-1);
    response.status(200).send(data);
  });
});

router.get('/weatherCity/:city', function (request, response) {
  var city = request.params.city;
  owmModel.getWeatherCity (city, function(error, data){
    data = JSON.stringify(data);
    data = data.replace(/\\/g, "");
    data= data.substring(1, data.length-1);
    response.status(200).send(data);
  });
});

router.get('/weatherLonLat/:lon/:lat', function (request, response) {
  var lon = request.params.lon,
      lat = request.params.lat;
  owmModel.getWeatherCoord (lon, lat, function(error, data){
    data = JSON.stringify(data);
    data = data.replace(/\\/g, "");
    data= data.substring(1, data.length-1);
    response.status(200).send(data);
  });
});

router.get('/weatherZip/:zip/:code', function (request, response) {
  var zip = request.params.zip,
      code = request.params.code;
  owmModel.getWeatherZip (zip, code, function(error, data){
    data = JSON.stringify(data);
    data = data.replace(/\\/g, "");
    data= data.substring(1, data.length-1);
    response.status(200).send(data);
  });
});

router.get('/forecastCity/:city/:code', function (request, response) {
  var city = request.params.city,
      code = request.params.code;
  owmModel.getForecastCityCode (city, code, function(error, data){
    data = JSON.stringify(data);
    data = data.replace(/\\/g, "");
    data= data.substring(1, data.length-1);
    response.status(200).send(data);
  });
});

router.get('/forecastLonLat/:lon/:lat', function (request, response) {
  var lon = request.params.lon,
      lat = request.params.lat;
  owmModel.getForecastCoord (lon, lat, function(error, data){
    data = JSON.stringify(data);
    data = data.replace(/\\/g, "");
    data= data.substring(1, data.length-1);
    response.status(200).send(data);
  });
});

router.get('/forecastZip/:zip/:code', function (request, response) {
  var zip = request.params.zip,
      code = request.params.code;
  owmModel.getForecastZip (zip, code, function(error, data){
    data = JSON.stringify(data);
    data = data.replace(/\\/g, "");
    data= data.substring(1, data.length-1);
    response.status(200).send(data);
  });
});




module.exports = router;
