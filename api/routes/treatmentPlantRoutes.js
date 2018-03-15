var express = require('express');
var router = express.Router();
var passport = require('passport');
var validator = require('validator');
var routeRequirements = require('../functions/routeRequirements');
var filter = require('../functions/filter');

var treatmentPlantModel = require('../models/treatmentPlant');

router.get('/treatmentPlant/:plant/:number/:page/:sort', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	if (!validator.isInt(request.params.plant, {gt: 0}) || !validator.isInt(request.params.number, {gt: 0}) || !validator.isInt(request.params.page, {gt: 0}) ||  !validator.isAscii(request.params.sort))
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		treatmentPlantModel.getTreatmentsByPlant(request.params.number, request.params.page, request.params.sort, request.params.plant, function(error, data) {
			if (typeof data !== 'undefined')
				response.status(200).json(data);
			else
				response.status(404).json({"Mensaje":"No existe"});
		});
	}
});

router.post('/admin/treatmentPlant', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	/*if (request.body.frequency=='null'){
		request.body.frequency='undefined';
		console.log(request.body.frequency);
	}
	if (request.body.initDate=='' || request.body.finalDate==''){
		request.body.initDate='undefined';
		request.body.finalDate='undefined';
	}*/
	/*if (request.body.frequency!='undefined' && (request.body.initDate!='undefined' || request.body.finalDate!='undefined'))
		response.status(400).json({"Mensaje":"Imposible crear tarea con frecuencia y periodo."});
	else if (request.body.frequency=='undefined' && (request.body.initDate=='undefined' || request.body.finalDate=='undefined'))
		response.status(400).json({"Mensaje":"Faltan parámetros necesarios"});
	else {*/
		var treatmentPlantData = {
			plant: request.body.plant,
			treatment: request.body.treatment,
			frequency: request.body.frequency,
			initDate: request.body.initDate,
			finalDate: request.body.finalDate,
		};
		treatmentPlantData = filter(treatmentPlantData); //FILTRA. PONEMOS LOS REQUISITOS DEPSUES DEL FILTRADO
		if (typeof treatmentPlantData.frequency!== 'undefined' && (typeof treatmentPlantData.initDate!=='undefined' || typeof treatmentPlantData.finalDate!=='undefined'))
			response.status(400).json({"Mensaje":"Imposible crear tarea con frecuencia y periodo."});
		else if (typeof treatmentPlantData.frequency==='undefined' && (typeof treatmentPlantData.initDate==='undefined' || typeof treatmentPlantData.finalDate==='undefined'))
			response.status(400).json({"Mensaje":"Faltan parámetros necesarios"});
		else {
			var validate = validateInput(treatmentPlantData);
			if (validate.length > 0)
				response.status(400).json({"Mensaje": validate});
			else {
				//treatmentPlantData = sanitizeInput(treatmentPlantData);
				treatmentPlantModel.insertTreatmentPlant(treatmentPlantData, function(error, data) {
					if (data)
						response.status(200).json({"Mensaje":"Insertado"});
					else
						response.status(500).json({"Mensaje":error.message});
				});
			}
		}	
	//}
});

router.put('/admin/treatmentPlant/:plant/:treatment', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	if (!validator.isInt(request.params.plant, {gt: 0}) || !validator.isInt(request.params.treatment, {gt: 0}))
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		var treatmentPlantData = {
			frequency: request.body.frequency,
			initDate: request.body.initDate,
			finalDate: request.body.finalDate,
		};
		var validate = validateInput(treatmentPlantData);
		if (validate.length > 0)
			response.status(400).json({"Mensaje": validate});
		else {
			treatmentPlantData = sanitizeInput(treatmentPlantData);
			treatmentPlantModel.updateTreatmentPlant(treatmentPlantData, request.params.plant, request.params.treatment, function(error, data) {
				if (data == 1)
					response.status(200).json({"Mensaje":"Actualizado"});
				else if (data == 0)
					response.status(404).json({"Mensaje":"No existe"});
				else
					response.status(500).json({"Mensaje":error.message});
			});
		}
	}
});

router.delete('/admin/treatmentPlant/:plant/:treatment', passport.authenticate('jwt', {session: false}), routeRequirements, function(request, response) {
	if (!validator.isInt(request.params.plant, {gt: 0}) || !validator.isInt(request.params.treatment, {gt: 0}))
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		treatmentPlantModel.deleteTreatmentPlant(request.params.plant, request.params.treatment, function(error, data) {
			if (data == 1)
				response.status(200).json({"Mensaje":"Borrado"});
			else if (data == 0)
				response.status(404).json({"Mensaje":"No existe"});
			else
				response.status(500).json({"Mensaje":error.message});
		});
	}
});

/*function sanitizeInput(data) {
  if (data.plant && typeof data.plant== 'undefined')   {  data.plant = validator.trim(data.plant); data.plant = validator.toInt(data.plant);}
  if (data.treatment && typeof data.treatment== 'undefined')  {  data.treatment = validator.trim(data.treatment); data.treatment = validator.toInt(data.treatment);}
  if (data.frequency && typeof data.frequency== 'undefined') {  data.frequency = validator.trim(data.frequency); data.frequency = validator.toInt(data.frequency);}
  return data;
}*/

function validateInput(data) {
  var resp = '';
  if (typeof data.plant!== 'undefined' && !validator.isInt(data.plant)) resp += 'Planta no válida, ';
  if (typeof data.treatment!== 'undefined' && !validator.isInt(data.treatment)) resp += 'Tratamiento no válida, ';
  if (typeof data.frequency!== 'undefined' && !validator.isInt(data.frequency)) resp += 'Frecuencia no válida, ';
  if (typeof data.initDate!== 'undefined' && !validator.isISO8601(data.initDate)) resp += 'Fecha inicio no válida, ';
  if (typeof data.finalDate!== 'undefined' && !validator.isISO8601(data.finalDate)) resp += 'Fecha final no válida, ';
  if (resp) resp = resp.slice(0, -2);
  return resp;
}

module.exports = router;
