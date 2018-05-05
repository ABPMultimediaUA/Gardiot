var express = require('express');
var router = express.Router();
var passport = require('passport');
var validator = require('validator');
var routeRequirements = require('../functions/routeRequirements');

var taskModel = require('../models/task');

router.get('/todayTask/:number/:page', passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
	if (!validator.isInt(request.params.number, {gt: 0}) || !validator.isInt(request.params.page, {gt: 0})) 
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		taskModel.getMyTasksForToday (request.params.number, request.params.page, request.user.id, function (error, data) {
			if (error)
				response.status(500).json({"Mensaje":error.message});
			else
				response.status(200).json(data);
		})
	}
});

router.get('/dayTask/:number/:page/:date', passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
	if (!validator.isInt(request.params.number, {gt: 0}) || !validator.isInt(request.params.page, {gt: 0}) || !validator.isISO8601(request.params.date)) 
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		taskModel.getMyTasksByDate (request.params.number, request.params.page, request.user.id, request.params.date, function (error, data) {
			if (error)
				response.status(500).json({"Mensaje":error.message});
			else
				response.status(200).json(data);
		})
	}
});

router.get('/monthTask', passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
	
	let dates=[];
	if(request.query.fecha1!==undefined){
		if (!validator.isISO8601(request.query.fecha1)){
			response.status(400).json({"Mensaje":"Petición incorrecta"});
		}
		else{
			dates.push(request.query.fecha1);
		}
	}
	if(request.query.fecha2!==undefined){
		if (!validator.isISO8601(request.query.fecha2)){
			response.status(400).json({"Mensaje":"Petición incorrecta"});
		}
		else{
			dates.push(request.query.fecha2);
		}
	}
	if(request.query.fecha3!==undefined){
		if (!validator.isISO8601(request.query.fecha3)){
			response.status(400).json({"Mensaje":"Petición incorrecta"});
		}
		else{
			dates.push(request.query.fecha3);
		}
	}
	console.log(request.query.fecha1);
	if(dates.length>0) {
		taskModel.getMyTasksByMonth (request.user.id, dates, function (error, data) {
			if (error) {
				console.log(error.message);
				response.status(500).json({"Mensaje":error.message});
			}
			else
				response.status(200).json(data);
		})
	}
	else{
		response.status(400).json({"Mensaje":"Debes pasar alguna fecha"});
	}
});

router.get('/plantTask/:number/:page/:myPlant', passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
	if (!validator.isInt(request.params.number, {gt: 0}) || !validator.isInt(request.params.page, {gt: 0}) || !validator.isInt(request.params.myPlant, {gt: 0})) 
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		taskModel.getTasksByMyPlant (request.params.number, request.params.page, request.user.id, request.params.myPlant, function (error, data) {
			if (error)
				response.status(500).json({"Mensaje":error.message});
			else
				response.status(200).json(data);
		})
	}
});


router.put('/moveTask/:myPlant/:mPlant/:tPlant/:treatmentPlant/:date/:newDate', passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
	if (!validator.isInt(request.params.myPlant, {gt: 0}) || !validator.isInt(request.params.mPlant, {gt: 0}) || !validator.isInt(request.params.treatmentPlant, {gt: 0}) || !validator.isISO8601(request.params.date)) 
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		taskModel.moveTask (request.params.myPlant, request.params.mPlant, request.params.tPlant, request.params.treatmentPlant, request.params.date, request.params.newDate, function (error, data) {
			if (error)
				response.status(500).json({"Mensaje":error.message});
			else if (data == 1)
				response.status(200).json({"Mensaje":"Actualizado."});
			else
				response.status(400).json({"Mensaje":"No actualizado"});
		})
	}
});

router.put('/taskDone/:myPlant/:mPlant/:tPlant/:treatmentPlant/:date/:dateDone', passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
	if (!validator.isInt(request.params.myPlant, {gt: 0}) || !validator.isInt(request.params.mPlant, {gt: 0}) || !validator.isInt(request.params.treatmentPlant, {gt: 0}) || !validator.isISO8601(request.params.date)) 
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		taskModel.setTaskDone (request.params.myPlant, request.params.mPlant, request.params.tPlant, request.params.treatmentPlant, request.params.date, request.params.dateDone, function (error, data) {
			if (error)
				response.status(500).json({"Mensaje":error.message});
			else if (data == 1)
				response.status(200).json({"Mensaje":"Actualizado."});
			else
				response.status(400).json({"Mensaje":"No actualizado"});
		})
	}
});

router.put('/taskUndone/:myPlant/:mPlant/:tPlant/:treatmentPlant/:date', passport.authenticate('jwt', {session: false}), routeRequirements, function (request, response) {
	if (!validator.isInt(request.params.myPlant, {gt: 0}) || !validator.isInt(request.params.mPlant, {gt: 0}) || !validator.isInt(request.params.treatmentPlant, {gt: 0}) || !validator.isISO8601(request.params.date)) 
		response.status(400).json({"Mensaje":"Petición incorrecta"});
	else {
		taskModel.setTaskUndone (request.params.myPlant, request.params.mPlant, request.params.tPlant, request.params.treatmentPlant, request.params.date, function (error, data) {
			if (error)
				response.status(500).json({"Mensaje":error.message});
			else if (data == 1)
				response.status(200).json({"Mensaje":"Actualizado."});
			else
				response.status(400).json({"Mensaje":"No actualizado"});
		})
	}
});


module.exports = router;