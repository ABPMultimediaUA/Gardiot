var express = require('express');
var router = express.Router();
var passport = require('passport');
var validator = require('validator');
var geo = require('geo-hash');

var routeRequirements = require('../functions/routeRequirements');
var filter = require('../functions/filter');
var isASCII = require('../functions/isASCII');

var gardenModel = require('../models/garden');

router.get('/garden',  passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
  gardenModel.getGarden (function(error, data){
    response.status(200).json(data);
  });
});

router.get('/garden/:id', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	var id = request.params.id;
	var user = request.user;
	gardenModel.getGardenById(id, function(error, data) {
		if (error) 
			response.status(500).json({"Mensaje":error.message});
		else if (typeof data !== 'undefined' && data.length > 0) {
			if(user.id == data[0].user)
				response.status(200).json(data);
		}
		else 
			response.status(404).json({"Mensaje":"No existe"});
	});
});

router.get('/gardenByUser', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	var user = request.user.id;
	gardenModel.getGardenByUser(user, function(error, data) {
		if (error) 
			response.status(500).json({"Mensaje":error.message});
		else if (typeof data !== 'undefined' && data.length > 0) {
			let garden={};
			garden.id=data[0].gardenId;
			garden.title=data[0].title;
			garden.width=data[0].width;
			garden.length=data[0].lenght;
			garden.longitude=data[0].longitude;
			garden.latitude=data[0].latitude;
			garden.soil=data[0].soil;
			garden.countryCode=data[0].countryCode;
			garden.city=data[0].city;
			garden.plants=[];
			for(let i=0; i<data.length; i++){
				garden.plants.push({"id": data[i].id,
									"plant": data[i].plant,
									"model": data[i]._3DModel,
									"x": data[i].xCoordinate,
									"y": data[i].yCoordinate,
									"seed": data[i].seed});
			}

			response.status(200).json(garden);
		}
		else {
			response.status(404).json({"Mensaje":"No existe"});
		}
	});
});

router.post('/garden', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	var gardenData = {
    title: request.body.title,
	width: request.body.width,
    length: request.body.length,
    latitude: request.body.latitude,
    longitude: request.body.longitude,
    soil: request.body.soil,
    user: request.user.id,
    countryCode: request.body.countryCode,
    city: request.body.city,
    zip: request.body.zip,
	};
	gardenData = filter(gardenData);
	var geohash = geo.encode(data.latitude, data.longitude, 8);
	gardenModel.insertGarden(gardenData, function(error, data) {
		if (error) 
			response.status(500).json({"Mensaje":error.message});
		else if (data) 
			response.status(200).json(data);
	});
});

router.put('/garden', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
  var gardenData = {
    id: request.body.id,
	title: request.body.title,
	width: request.body.width,
    length: request.body.length,
    latitude: request.body.latitude,
    longitude: request.body.longitude,
    soil: request.body.soil,
    user: request.user.id,
    countryCode: request.body.countryCode,
    city: request.body.city,
    zip: request.body.zip,
	};
	gardenData = filter(gardenData);
	gardenModel.isOwner(request.user.id, gardenData.id, function(error, data) {
		if (error) 
			response.status(500).json({"Mensaje":error.message});
		else if(data){
			gardenModel.updateGarden(gardenData, function(error, data) {
				if (error)
					response.status(500).json({"Mensaje":error.message});
				else if (data) 
					response.status(200).json(data);						
			});
		}
	});
});

router.delete('/garden/:id', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	var id = request.params.id;
	gardenModel.isOwner(request.user.id, id, function(error, data) {
		if (error)
			response.status(500).json({"Mensaje":error.message});
		else if(data){
			gardenModel.deleteGarden(id, function(error, data) {
				if (error)
					response.status(500).json({"Mensaje":error.message});
				else if (data == 1) 
					response.status(200).json({"Mensaje":"Borrado"});
				else if (data == 0) 
					response.status(404).json({"Mensaje":"No existe"});				
			});
		}
	});
});

function validateInput(data) {
	var resp = '';
	if (typeof data.id!=='undefined' && !validator.isInt(data.id)) resp += 'ID no válido, ';
	if (typeof data.title!=='undefined' && !isASCII(data.title)) resp += 'Título no válido, ';
	if (typeof data.width!=='undefined' && !validator.isInt(data.width)) resp += 'Ancho no válida, ';
	if (typeof data.lenght!=='undefined' && !validator.isInt(data.lenght)) resp += 'Largo no válido, ';
	if (typeof data.latitude!=='undefined' && !validator.isFloat(data.latitude)) resp += 'Latitud no válida, ';
	if (typeof data.longitude!=='undefined' && !validator.isFloat(data.longitude)) resp += 'Longitud no válida, ';
	if (typeof data.garden!=='undefined' && !validator.isInt(data.garden)) resp += 'Jardín no válido, ';
	if (typeof data.soil!=='undefined' && !validator.isInt(data.soil)) resp += 'Suelo no válido, ';
	if (typeof data.seed!=='undefined' && !validator.isISO8601(data.seed)) resp += 'Fecha no válida, ';
	if (resp) resp = resp.slice(0, -2);
	return resp;
  }

module.exports = router;
