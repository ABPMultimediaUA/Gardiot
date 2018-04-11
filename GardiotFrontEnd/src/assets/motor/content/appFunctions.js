//bucle de animación
function animLoop(){
    now=Date.now();
    elapsed=now-then;

    //Si toca dibujar y el motor está corriendo
    if(elapsed>fpsInterval && motor.running){
        then=now-(elapsed%fpsInterval);
        motor.rotarMalla("malla2", 1, "x");
        motor.rotarMalla("malla2", 1, "y");
        motor.rotarMalla("malla2", 1, "z");
        motor.draw();
    }
    requestAnimationFrame(animLoop, canvas);
}

function drawGrid() {

}


function mouse_move(e, view){
    let cv=e.target,
        x=e.offsetX,
        y=e.offsetY;


				if(cv.getAttribute('data-down')){
	        //console.log(`MOUSEMOVE-> Posición: ${fila} - ${columna}`);
          let ejeY=window.originClickY-(y/cv.offsetHeight);
          let ejeX=window.originClickX-(x/cv.offsetWidth);
          //esto será lo bueno
          let pos=motor.getPosCamaraActiva();
          let movPosible=pos[1]*0.6;

          if(view=='detail'){
            motor.rotarCamaraOrbital("camara1", ejeX*150, "y");
            motor.rotarCamaraOrbital("camara1", ejeY*150, "x");
          }
          else{
            if((pos[0]<movPosible || ejeX<0) && (pos[0]>-movPosible || ejeX>0)){
              motor.moverCamara("camara2", ejeX*pos[1]*1.5, 0, 0);
            }

            if((pos[2]<movPosible || ejeY<0) && (pos[2]>-movPosible || ejeY>0)){
              motor.moverCamara("camara2", 0, 0, ejeY*pos[1]*1.5);
            }
          }


					/*motor.rotarCamaraOrbital("camara2", ejeX*150, "y");
          motor.rotarCamaraOrbital("camara2", ejeY*150, "x");*/
					window.originClickX=x/cv.offsetWidth;
					window.originClickY=y/cv.offsetHeight;
        }
        
        if (view != 'detail') {
          if(window.dragging) {
            e.preventDefault();
            e.stopPropagation();

            let cv=e.target;
            let point = get3DPoint([e.offsetX, e.offsetY], cv.offsetWidth, cv.offsetHeight);

            for (let plant of window.plants) {
              if (plant.isDragging) {
                motor.moverMallaA(plant.plant, point[0], 0, point[2]);
                break;
              }
            }
            //Redraw
          }
        }
}



function mouse_down(e, view){
  switch (e.which) {
    case 1: //Izquierdo
      if (view != 'detail') {
        e.preventDefault();
        e.stopPropagation();
        
        let cv=e.target;
        let point = get3DPoint([e.offsetX, e.offsetY], cv.offsetWidth, cv.offsetHeight);
        let coordX = Math.ceil(point[0]);
        let coordY = Math.ceil(point[2]);
        for (let plant of window.plants) {
          if (plant.x == coordX && plant.y == coordY) {
            plant.isDragging = true;
            break;
          }
        }
      }
      break;
    case 3: //Derecho
      let cv=e.target,
      x=e.offsetX,
      y=e.offsetY;

      console.log(x, y, cv.offsetWidth, cv.offsetHeight);
      //console.log(`DOWN-> Posición: ${fila} - ${columna}`);
      cv.setAttribute('data-down', 'true');

      window.originClickX=x/cv.offsetWidth;
      window.originClickY=y/cv.offsetHeight;
      break;
  }
}

function mouse_up(e, view){
  switch (e.which) {
    case 1: //Izquierdo
      if (view != 'detail') {
        e.preventDefault();
        e.stopPropagation();

        let cv = e.target;
        let point = get3DPoint([e.offsetX, e.offsetY], cv.offsetWidth, cv.offsetHeight);
        let coordX = Math.ceil(point[0]);
        let coordY = Math.ceil(point[2]);
        for (let plant of window.plants) {
          if (plant.isDragging) {
            plant.isDragging = false;
            window.dragging = false;

            let occupied = false;
            for (let value of window.plants) { //Si encuentra una planta con las mismas coordenadas, la devuelve a la pos original
              if (value.x == coordX && value.y == coordY) {
                motor.moverMallaA(plant.plant, plant.x, 0, plant.y);
                occupied = true;
                break;
              }
            }
            if (!occupied) {
              //Llamo a la API para actualizar la posicion en la BD
              updateMyPlant(window.jardin.id, plant.plant,)
            }
            break;
          }
        }        
      }
      break;
    case 3: //Derecho
      let cv=e.target,
      x=e.offsetX,
      y=e.offsetY,
      dimx=cv.offsetWidth/41,
      dimy=cv.offsetHeight/27,
      fila=Math.ceil(y/dimy),
      columna=Math.ceil(x/dimx);

      window.x=undefined;
      window.y=undefined;
      window.originClickX=undefined;
      window.originClickY=undefined;

      get3DPoint([x, y], cv.offsetWidth, cv.offsetHeight);

      //console.log(`UP-> Posición: ${fila} - ${columna}`);
      cv.removeAttribute('data-down');
      break;
  }
}

function scrolling(e){
  let cv=e.target;
  let point=get3DPoint([e.offsetX, e.offsetY], cv.offsetWidth, cv.offsetHeight);//punto donde queremos acercarnos
  let camera=motor.getPosCamaraActiva();

  let vector=vec3.fromValues(point[0]-camera[0], point[1]-camera[1], point[2]-camera[2]);
  vec3.normalize(vector, vector);
  vec3.scale(vector, vector, 1);
  if(e.deltaY<0 && motor.getPosCamaraActiva()[1]>5){
    motor.moverCamara("camara2", 0, vector[1], 0);
  }
  else if(e.deltaY>0 && motor.getPosCamaraActiva()[1]<40){
    motor.moverCamara("camara2", 0, -vector[1], 0);
  }
}

/*
function scrolling(e){
  let cv=e.target;
  let point=get3DPoint([e.offsetX, e.offsetY], cv.offsetWidth, cv.offsetHeight);//punto donde queremos acercarnos
  let camera=motor.getPosCamaraActiva();

  let vector=vec3.fromValues(point[0]-camera[0], point[1]-camera[1], point[2]-camera[2]);
  vec3.normalize(vector, vector);
  vec3.scale(vector, vector, 12);
  if(e.deltaY<0 && motor.getPosCamaraActiva()[1]>100){
    motor.moverCamara("camara2", vector[0], vector[1], vector[2]);
  }
  else if(e.deltaY>0 && motor.getPosCamaraActiva()[1]<500){
    motor.moverCamara("camara2", -vector[0], -vector[1], -vector[2]);
  }
}*/


function get2DPoint(point3D, width, height){
  let viewProjectionMatrix=[];
  mat4.multiply(viewProjectionMatrix, matrixProjection, invertedMView);
  vec3.transformMat4(point3D, point3D, viewProjectionMatrix);

  let invert=[];
  mat4.invert(invert, viewProjectionMatrix);
  vec3.transformMat4(point3D, point3D, invert);

  let winX=point3D[0]+1;
  winX=winX/2.0;
  winX=winX*width;

  let winY=1-point3D[1];
  winY=winY/2.0;
  winY=winY*height;

  return [winX, winY];
}

function get3DPoint(point2D, width, height){
  let x=point2D[0]/width;
  x=x*2.0;
  x=x-1;

  let y=point2D[1]/height;
  y=y*2.0;
  y=1-y;

  let viewProjectionMatrix=[];
  mat4.multiply(viewProjectionMatrix, matrixProjection, invertedMView);

  let invert=[];
  mat4.invert(invert, viewProjectionMatrix);

  let pointaux=[];
  vec3.transformMat4(pointaux, [0, 0, 0], viewProjectionMatrix);

  let point=[x, y, pointaux[2]];

  vec3.transformMat4(point, point, invert);
  //console.log(point);
  return point;
}
