// Gestor de recursos. Abre cada recurso apuntando
// a la dirección de memoria. Julián Sánchez García y Mariano López Escudero

// aquí debemos de llamar al RECURSO
import('./TRecurso.js');
require('TRecurso.js');
class TGestorRecursos {
  //lo que de verdad se quiere es un array
    var recursos = new TRecurso('caca');
    constructor () {

    }

    getRecurso(nombre){
      return 1;
    }
  }



/*
function loadResource(malla){

  console.log("llamada al gestor "+malla.toString());

  var object;
  // comprobar que existe en memoria

  for(var i = 0; i <= arrayResource.length; i++){
    // si existe devolver la dirección de memoria
    if(arrayResource.length != 0 && arrayResource[i] == malla){
      console.log("Ya está en Memoria "+malla.toString());
    }else{
      // si no existe cargar el recursos
      console.log("Cargo el fichero y lo meto Memoria "+malla.toString());
      object = malla;
    }

  }
  arrayResource.push(object);
  console.log(arrayResource.length);

  return 0;

}
*/
