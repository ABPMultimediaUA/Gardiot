var connection = require('../config/connection');

var plant = {};

plant.getPlants = function(number, page, orderBy, sort, callback) {
  if(connection) {
    let minPeak = (page - 1) * number;
    let maxPeak = page * number;
    let orderSentence = '';
    let orderByParam = '';
    if (sort.toUpperCase() === 'DESC')
      orderSentence = 'DESC';
    if (orderBy.toUpperCase() === 'NAME')
      orderByParam = 'commonName ' + orderSentence;
    else if (orderBy.toUpperCase() === 'FAMILY')
      orderByParam = 'family ' + orderSentence + ', commonName';
    connection.query('SELECT * FROM Plant ORDER BY ' + orderByParam + ' LIMIT ' + minPeak  + ',' + maxPeak , function (error, rows){
      if(error)
        callback(error, null);
      else
        callback(null, rows);
    });
  }
}


plant.getPlantById = function(id, callback) {
	if (connection) {
		connection.query('SELECT * FROM Plant WHERE id = ' + id, function(error, row) {
			if (error)
				callback(error, null);
			else
				callback(null, row);
		});
	}
}

plant.getPlantsByFamily = function(id, number, page, sort, callback) { //HAY QUE AFINAR MAS LOS CAMPOS A DEVOLVER
  if (connection) {
    let minPeak = (page - 1) * number;
    let maxPeak = page * number;
    let orderSentence = '';
    if (sort.toUpperCase() === 'DESC')
      orderSentence = 'DESC';
    connection.query('SELECT * FROM Plant, Family WHERE plant.family = family.id AND family.id = ' + id + 'ORDER BY commonName ' + orderSentence + ' LIMIT ' + minPeak + ',' + maxPeak, function(error, row) {
      if (error)
        callback(error, null);
      else
        callback(null, row);
    });
  }
}

plant.insertPlant = function(data, callback) {
  if(connection) {
    sql = 'INSERT INTO Plant SET ';
    for (var key in data)
      if (typeof data[key]!== 'undefined')
        sql += key + ' = "' + data[key] + '",';
    sql = sql.slice(0, -1);
    connection.query(sql, function(error, result){
      if(error)
        callback(error, null);
      else
        callback(null, result.affectedRows);
    });
  }
}
plant.updatePlant = function(data, id, callback) {
  if(connection) {
    var sql = 'UPDATE Plant SET ';
    for (var key in data)
      if (typeof data[key]!== 'undefined')
        sql += key + ' = "' + data[key] + '",';
    sql = sql.slice(0, -1);
    sql += ' WHERE id= "' + id +'"';
    connection.query(sql, function(error, result) {
			if (error)
				callback(error, null);
			else{
        if(result.affectedRows < 1)
          callback(null, {"mensaje":"No existe"});
        else
  				callback(null, {"mensaje":"Actualizado"});
      }
		});
  }
}

plant.deletePlant = function(id, callback) {
  if(connection) {
    connection.query('DELETE FROM Plant WHERE id = "' + id + '"', function(error, result) {
			if (error)
				callback(error, null);
			else
				callback(null, result.affectedRows);
		});
  }
}


module.exports = plant;
