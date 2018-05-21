/**
 * Establece el parametro de identificacion de la planta arrastrada
 * @param  {String} e
 */
function drag(e) {
  window.dragging = true;
  e.dataTransfer.setData("text", e.target.id);
}

/**
 * Bloquea los disparadores de evento por defecto de JS
 * @param  {String} e
 */
function allowDrop(e) {
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Establece el color de celda sobre la que se esta arrastrando
 * @param  {String} e
 */
function dragCanvas(e){
  if (window.dragging) {
    e.preventDefault();
    e.stopPropagation();
    let cv = document.querySelector('#myCanvas');
    let point = get3DPoint([e.clientX, e.clientY], cv.offsetWidth, cv.offsetHeight);
    let p = [Math.round(point[0]), Math.round(point[2])];
    if (plantsMap.has(p[0] + '-' + p[1]))
      colorCell = ["suelo" + p[0] + '-' + p[1], "red"];
    else
      colorCell = ["suelo" + p[0] + '-' + p[1], "green"];
  }
}

/**
 * Inserta la planta en el jardin al soltar el click del raton
 * @param  {String} e
 */
function drop(e) {
  e.preventDefault();
  e.stopPropagation();
  let plant = e.dataTransfer.getData("text").split('-');
  let cv = e.target;
  let point = get3DPoint([e.clientX, e.clientY], cv.offsetWidth, cv.offsetHeight);
  let coordX = Math.round(point[0]);
  let coordY = Math.round(point[2]);

  if (coordX <= jardin.width * 1.0 / 2 && coordX >= jardin.width * (-1.0) / 2 && coordY <= jardin.length * 1.0 / 2 && coordY >= jardin.length * (-1.0) / 2) {
    let occupied = false;
    if (plantsMap.has(coordX + '-' + coordY)) {
      occupied = true;
    }

    if (!occupied) {
      insertMyPlant(window.jardin.id, plant[0], window.jardin.soil, coordX, coordY, plant[1]);

    }
  }
  colorCell = [];
  plant.x = coordX;
  plant.y = coordY;
  plantsMap.set(coordX + '-' + coordY, plant.id);//Para la iluminación
  window.dragging = false;
}

/**
 * Controla las acciones asociadas al movimiento del raton sobre el canvas, camara principalmente
 * @param  {String} e
 */
function mouse_move(e) {
  if (typeof projectionMatrix !== 'undefined') {
    let cv = document.querySelector('#myCanvas'),
      x = e.clientX,
      y = e.clientY;

    if (cv.getAttribute('moviendo-camara')) {
      let ejeY = window.originClickY - (y / cv.offsetHeight);
      let ejeX = window.originClickX - (x / cv.offsetWidth);
      let pos = motor.getPosCamaraActiva();
      let movPosible = pos[1] * 0.6;

      if (window.mode == 0) {//modo visualización
        e.preventDefault();
        e.stopPropagation();
        motor.moverCamara("dynamicCamera", ejeX * 10, 0, ejeY * 10);
      }
      else {
        let dir = vec3.fromValues(ejeX * 10, 0, ejeY * 10);
        let rad = Math.PI * rotationCamY / 180;
        vec3.rotateY(dir, dir, vec3.fromValues(0.0, 0.0, 0.0), rad);
        vec3.rotateY(dir, dir, vec3.fromValues(0.0, 0.0, 0.0), Math.PI * 45 / 180);
        motor.moverCamara("dynamicCamera", dir[0], 0, dir[2]);
      }
      //Necesarios para calcular la dirección de la cámara cuando arrastremos (variables ejeX y ejeY)
      window.originClickX = x / cv.offsetWidth;
      window.originClickY = y / cv.offsetHeight;
    }

    else if (cv.getAttribute('rotando-camara')) {
      let ejeY = window.originClickY - (y / cv.offsetHeight);
      let ejeX = window.originClickX - (x / cv.offsetWidth);
      if (window.mode == 1) {

        motor.rotarCamara("dynamicCamera", ejeX * 150, "z");
      } else {
        motor.rotarCamaraOrbital("dynamicCamera", ejeX * 150, "y");
      }
      //motor.rotarCamara("dynamicCamera", ejeY*50, "z");
      window.originClickX = x / cv.offsetWidth;
      window.originClickY = y / cv.offsetHeight;
    }

    if (window.mode != 0) {
      let point = get3DPoint([e.clientX, e.clientY], cv.offsetWidth, cv.offsetHeight);
      let p = [Math.round(point[0]), Math.round(point[2])];
      if (window.dragging) {
        e.preventDefault();
        e.stopPropagation();

        if (plantsMap.has(p[0] + '-' + p[1]))
          colorCell = ["suelo" + p[0] + '-' + p[1], "red"];
        else
          colorCell = ["suelo" + p[0] + '-' + p[1], "green"];

        let plant = window.jardin.plants.find(x => x.isDragging);
        if (plant) {
          motor.moverMallaA(plant.id, point[0], 0, point[2]);
        }
      }
      else if (plantsMap.has(p[0] + '-' + p[1])) {
        document.body.style.cursor = 'pointer';
        hovered = plantsMap.get(Math.round(point[0]) + '-' + Math.round(point[2]));
      }
      else {
        document.body.style.cursor = 'default';
        hovered = -1;
      }
    }
  }
}

/**
 * Controla las acciones asociadas al los clicks derecho (rotar) e izquierdo (seleccionar planta) del raton
 * @param  {String} e
 */
function mouse_down(e) {
  let cv = document.querySelector('#myCanvas'),
    x = e.clientX,
    y = e.clientY;
  if (!cv.getAttribute('rotando-camara') && !cv.getAttribute('moviendo-camara') && !window.dragging) {
    switch (e.which) {
      case 1: //Izquierdo
        if (window.mode == 1) {
          let point = get3DPoint([e.clientX, e.clientY], cv.offsetWidth, cv.offsetHeight);
          let coordX = Math.round(point[0]);
          let coordY = Math.round(point[2]);
          let plant = window.jardin.plants.find(x => x.x == coordX && x.y == coordY);
          if (plant) {
            plant.isDragging = true;
            window.dragging = true;
          }
          if (!dragging) {
            cv.setAttribute('moviendo-camara', 'true');
          }
        }
        else {
          cv.setAttribute('moviendo-camara', 'true');
          //Necesarios para calcular la dirección de la cámara cuando arrastremos (variables ejeX y ejeY)
          //de mouse_move
        }
        window.originClickX = x / cv.offsetWidth;
        window.originClickY = y / cv.offsetHeight;
        break;

      case 3:
        //if(window.mode==1){
        window.originClickX = x / cv.offsetWidth;
        window.originClickY = y / cv.offsetHeight;
        cv.setAttribute('rotando-camara', 'true');
        break;
      //}
    }
  }
}

/**
 * Controla las acciones asociadas al levantar el dedo del ratón. Derecho (detener rotacion), izquierdo (colocar planta seleccionada)
 * @param  {String} e
 */
function mouse_up(e) {
  colorCell = [];
  let cv = document.querySelector('#myCanvas')
  switch (e.which) {
    case 3: //Derecho
      if (!cv.getAttribute('moviendo-camara')) {
        window.originClickX = undefined;
        window.originClickY = undefined;
        cv.removeAttribute('rotando-camara');
      }
      break;
    case 1: //Izquierdo
      if (window.mode != 0 && window.dragging) {
        e.preventDefault();
        e.stopPropagation();
        let point = get3DPoint([e.clientX, e.clientY], cv.offsetWidth, cv.offsetHeight);
        let coordX = Math.round(point[0]);
        let coordY = Math.round(point[2]);
        let plant=window.jardin.plants.find(x=>x.isDragging);
          if (plant) {
            plant.isDragging = false;
            window.dragging = false;
            let datos = dataPlants[plant.model.toUpperCase()];
            if (coordX <= jardin.width * 1.0 / 2 && coordX >= jardin.width * (-1.0) / 2 && coordY <= jardin.length * 1.0 / 2 && coordY >= jardin.length * (-1.0) / 2) {
              let occupied = false;
              if(plantsMap.has(coordX+'-'+coordY)){
                motor.moverMallaA(plant.id, plant.x, datos.posY, plant.y);
                  occupied = true;
                  break;
              }
              if (!occupied)
                updateMyPlant(window.jardin.id, plant, coordX, coordY);
            }
            else {
              let rect = cv.getBoundingClientRect();
              let xPos = e.clientX - rect.left;
              let yPos = e.clientY - rect.top;
              if (xPos >= 90 * cv.offsetWidth / 100 && yPos >= 0 && xPos <= cv.offsetWidth && yPos <= 10 * cv.offsetHeight / 100)
                deleteMyPlant(window.jardin.id, plant);
              else
                motor.moverMallaA(plant.id, plant.x, datos.posY, plant.y);
            }
            cv.removeAttribute('rotando-camara');
            window.originClickX = undefined;
            window.originClickY = undefined;
            break;
          }
      }
      cv.removeAttribute('moviendo-camara');
      break;

  }
}

/**
 * Desactiva la variable general que controla el dragging
 * @param  {String} e
 */
function disableDragging(e){
  window.dragging=false;
}

/**
 * Elimina una MyPlant
 * @param  {String} e
 */
function deletePlant(e) {
  e.preventDefault();
  e.stopPropagation();
  if (window.mode == 1 && window.dragging) {
    let plant=window.jardin.plants.find(x=>x.isDragging);
      if (plant) {
        plant.isDragging = false;
        window.dragging = false;

        deleteMyPlant(window.jardin.id, plant);
        colorCell = [];
      }
  }
}

/**
 * Zoom in
 */
function plusZoom() {
  if (window.mode == 0) {
    let pos = motor.getPosCamaraActiva();
    if (pos[1] > 3) {
      motor.escalarCamara("dynamicCamera", 0.9);
    }
  }

  else if (window.mode == 1) {
    let camera = motor.getPosCamaraActiva();
    if (camera[1] > 4) {
      motor.moverCamara("dynamicCamera", 0, -0.2, 0);
    }
  }
}

/**
 * Zoom out
 */
function subZoom() {
  if (window.mode == 0) {
    let pos = motor.getPosCamaraActiva();
    if (pos[1] < 5) {
      motor.escalarCamara("dynamicCamera", 1.1);
    }
  }

  else if (window.mode == 1) {
    let camera = motor.getPosCamaraActiva();
    if (camera[1] < 8) {
      motor.moverCamara("dynamicCamera", 0, 0.2, 0);
    }
  }
}


/**
 * Controla el zoom de la cámara en el modo edición
 * @param  {String} e
 */
function scrolling(e) {
  e.preventDefault();
  e.stopPropagation();
  if (window.mode == 0) {

    let p = vec3.fromValues(-1.0, 1.0, 1.0);
    let pos = motor.getPosCamaraActiva();
    if (e.deltaY < 0 && pos[1] > 3) {

      motor.escalarCamara("dynamicCamera", 0.9);

    }
    else if (e.deltaY > 0 && pos[1] < 5) {
      motor.escalarCamara("dynamicCamera", 1.1);
    }
  }

  else if (window.mode == 1) {
    let cv = e.target;
    let point = get3DPoint([e.clientX, e.clientY], cv.offsetWidth, cv.offsetHeight);//punto donde queremos acercarnos
    let camera = motor.getPosCamaraActiva();

    let vector = vec3.fromValues(point[0] - camera[0], point[1] - camera[1], point[2] - camera[2]);
    vec3.normalize(vector, vector);
    vec3.scale(vector, vector, 1);
    if (e.deltaY < 0 && camera[1] > 4) {
      motor.moverCamara("dynamicCamera", vector[0], vector[1], vector[2]);
    }

    else if (e.deltaY > 0 && camera[1] < 8) {
      motor.moverCamara("dynamicCamera", -vector[0], -vector[1], -vector[2]);
    }
  }
}

/**
 * Controla el multigesto con los dispositivos tactiles
 */
function hammertime() {
  var is_touch_device = 'ontouchstart' in document.documentElement;
  if (is_touch_device) {
    mc = new Hammer(document.getElementById('myCanvas'), {
      tap: { enable: false }
    });

    // create a pinch and rotate recognizer
    // these require 2 pointers
    var pinch = new Hammer.Pinch();
    var rotate = new Hammer.Rotate();

    var pan = new Hammer.Pan();
    var press = new Hammer.Press();

    // we want to detect both the same time
    pinch.recognizeWith(rotate);
    pan.recognizeWith(press);

    // add to the Manager
    mc.add([pinch, rotate]);
    mc.add([pan, press]);

    var liveScale = 1;
    var currentRotation = 0;
    var prevRotation = 0;
    var rotation = 0;
    var scale = 1, last_scale = 1,
      rotation = 0, last_rotation, dragReady = 0, start_rotation = 0;

    var liveScale = 1;
    var currentRotation = 0, lastRotation, startRotation;
    var currentScale = 0;

    var lastPosX = 0, lastPosY = 0, posX = 0, posY = 0;

    mc.on("rotate rotatestart rotateend pan press panstart panend tap multitap", function (e) {
      e.preventDefault();

      let canvas = document.querySelector('#myCanvas');


      switch (e.type) {
        case 'rotatestart':
          currentRotation = Math.round(e.rotation);
          currentScale = Math.round(e.scale);
          break;
        case 'rotate':

          var diff = Math.round(e.rotation) - currentRotation;
          var diffScale;
          e.pointers = [];

          if (window.mode == 1) {
            diffScale = 2 * (currentScale - e.scale);
            motor.rotarCamara("dynamicCamera", diff, "z");
            motor.moverCamara("dynamicCamera", 0, diffScale, 0);

          } else {
            diffScale = 1 + ((currentScale - e.scale) * 2);
            motor.rotarCamaraOrbital("dynamicCamera", diff, "y");
            motor.escalarCamara("dynamicCamera", diffScale);
          }
          currentRotation = Math.round(e.rotation);
          currentScale = e.scale;

          break;

        case 'panstart':
          window.originDeltaX = 0;
          window.originDeltaY = 0;

          break;
        case 'pan':
          if (!dragging) {
            motor.moverCamara("dynamicCamera", (originDeltaX - e.deltaX) / 100, 0, (originDeltaY - e.deltaY) / 100);
            originDeltaX = e.deltaX;
            originDeltaY = e.deltaY;
          }
          else {
            let point = get3DPoint([e.center.x, e.center.y], canvas.offsetWidth, canvas.offsetHeight);
            let plant=window.jardin.plants.find(x=>x.isDragging);
              if (plant) {
                motor.moverMallaA(plant.id, point[0], 0, point[2]);
                break;
              }

          }
          break;

        case 'panend':
          if (dragging) {
            let point = get3DPoint([e.center.x, e.center.y], canvas.offsetWidth, canvas.offsetHeight);
            let coordX = Math.round(point[0]);
            let coordY = Math.round(point[2]);
            let plant=window.jardin.plants.find(x=>x.isDragging);
            if (plant) {
                plant.isDragging = false;
                window.dragging = false;
                if (coordX <= jardin.width * 1.0 / 2 && coordX >= jardin.width * (-1.0) / 2 && coordY <= jardin.length * 1.0 / 2 && coordY >= jardin.length * (-1.0) / 2) {
                  let occupied = false;
                  if(plantsMap.has(coordX+'-'+coordY)){
                      motor.moverMallaA(plant.id, plant.x, 0, plant.y);
                      occupied = true;
                      break;
                  }
                  if (!occupied)
                    updateMyPlant(window.jardin.id, plant, coordX, coordY);
                }
                else {
                  motor.moverMallaA(plant.id, plant.x, 0, plant.y);
                }
                break;
            }
          }

          break;
        case 'tap':
          break;
        case 'press':
          if (window.mode == 1) {
            let point = get3DPoint([e.center.x, e.center.y], canvas.offsetWidth, canvas.offsetHeight);
            let coordX = Math.round(point[0]);
            let coordY = Math.round(point[2]);
            if(plantsMap.has(coordX+'-'+coordY)){
              plant.isDragging = true;
                window.dragging = true;
            }
          }
          break;
        case 'multitap':
          break;
      }

    });
  }
}





