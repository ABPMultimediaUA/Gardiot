/**
 * Realiza la iteracion de dibujado segun fps
 */
function animLoop() {
  let now = Date.now();
  let elapsed = now - then;

  //Si toca dibujar y el motor está corriendo
  if (elapsed > fpsInterval && motor.running) {
    then = now - (elapsed % fpsInterval);

    motor.drawSombras();
    motor.draw();
  }
  requestAnimationFrame(animLoop, canvas);
}

/**
 * Controla el zoom de la cámara en el modo edición
 * @param  {String} src
 * @param  {number} type 
 */
function makeShader(src, type) {
  //compilar el vertex shader
  let shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Error compilando el Shader " + gl.getShaderInfoLog(shader));
  }
  return shader;
}

/**
 * Inicializa shaders
 */
function cargarShaders(vertexShaders, fragmentShaders) {
  let vs = [];
  let fs = [];

  for (let i = 0; i < vertexShaders.length && i < fragmentShaders.length; i++) {
    vs[i] = gestor.getRecurso(vertexShaders[i], 'shader').shader,
      fs[i] = gestor.getRecurso(fragmentShaders[i], 'shader').shader;

    glProgram[i] = gl.createProgram();
    //añadimos los shaders al programa
    gl.attachShader(glProgram[i], makeShader(vs[i], gl.VERTEX_SHADER));
    gl.attachShader(glProgram[i], makeShader(fs[i], gl.FRAGMENT_SHADER));
    gl.linkProgram(glProgram[i]);


    if (!gl.getProgramParameter(glProgram[i], gl.LINK_STATUS)) {
      alert("No se puede inicializar el shader");
    }
  }
  gl.useProgram(glProgram[window.program]);
}

/**
 * Incializa parametros basicos de WebGL
 */
function setupWebGL() {

  glProgram[2].lmvpMatrixUniform = gl.getUniformLocation(glProgram[2], "uMVPMatrixFromLight");

  glProgram[window.program].shadowMapUniform = [];
  glProgram[window.program].shadowMapUniform[0] = gl.getUniformLocation(glProgram[window.program], "uShadowMap[0]");

  glProgram[window.program].lmvpMatrixUniform = [];
  glProgram[window.program].lmvpMatrixUniform[0] = gl.getUniformLocation(glProgram[window.program], "uMVPMatrixFromLight[0]");

  //Nos traemos las matrices, projection, model y view al motor
  glProgram[window.program].pMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uPMatrix");
  glProgram[window.program].mMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uMMatrix");
  glProgram[window.program].vMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uVMatrix");
  glProgram[window.program].mvMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uMVMatrix");
  glProgram[window.program].mvpMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uMVPMatrix");
  
  glProgram[window.program].lpMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uPMatrixFromLight");
  glProgram[window.program].lvMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uVMatrixFromLight");

  glProgram[window.program].samplerUniform = gl.getUniformLocation(glProgram[window.program], "uSampler");
  glProgram[window.program].textured = gl.getUniformLocation(glProgram[window.program], "uTextured");
  glProgram[window.program].lighted = gl.getUniformLocation(glProgram[window.program], "uLighted");
  glProgram[window.program].hovered = gl.getUniformLocation(glProgram[window.program], "uHovered");
  glProgram[window.program].factor = gl.getUniformLocation(glProgram[window.program], "uFactor");
  glProgram[window.program].noche = gl.getUniformLocation(glProgram[window.program], "uNight");
  glProgram[window.program].cont = gl.getUniformLocation(glProgram[window.program], "uLightCount");
  //matriz de normales
  glProgram[window.program].normalMatrixUniform = gl.getUniformLocation(glProgram[window.program], "uNormalMatrix");

  glProgram[window.program].ka = gl.getUniformLocation(glProgram[window.program], "material.Ka");
  glProgram[window.program].kd = gl.getUniformLocation(glProgram[window.program], "material.Kd");
  glProgram[window.program].ks = gl.getUniformLocation(glProgram[window.program], "material.Ks");

  glProgram[window.program].shin = gl.getUniformLocation(glProgram[window.program], "propiedades.shininess");
  glProgram[window.program].opac = gl.getUniformLocation(glProgram[window.program], "propiedades.opacity");

}

/**
 * Inicializa el framebuffer de sombras
 * @param  {number} i Iterador 
 */
function initFramebufferSombras(i) {
  
  shadowFramebuffer[i] = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer[i]);

  shadowDepthTexture[i] = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + window.index);
  gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture[i]);
  shadowDepthTexture[i].index=parseInt(''+window.index);
  window.index++;

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowDepthTextureSize, shadowDepthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  renderBuffer[i] = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer[i]);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowDepthTextureSize, shadowDepthTextureSize);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowDepthTexture[i], 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer[i]);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
}

/**
 * Obtiene el punto x,y solicitado
 * @param  {Array} point3D
 * @param  {number} width  
 * @param  {number} height 
 * @returns {Array} 
 */
function get2DPoint(point3D, width, height) {
  let viewProjectionMatrix = [];
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
  vec3.transformMat4(point3D, point3D, viewProjectionMatrix);

  let invert = [];
  mat4.invert(invert, viewProjectionMatrix);
  vec3.transformMat4(point3D, point3D, invert);

  let winX = point3D[0] + 1;
  winX = winX / 2.0;
  winX = winX * width;

  let winY = 1 - point3D[1];
  winY = winY / 2.0;
  winY = winY * height;

  return [winX, winY];
}

/**
 * Obtiene el punto  solicitado en tres dimensiones
 * @param  {Array} point2D
 * @param  {number} width  
 * @param  {number} height 
 * @returns {Array} 
 */
function get3DPoint(point2D, width, height) {
  let x = (point2D[0] / width) * 2 - 1;
  let y = 1 - (point2D[1] / height) * 2;
  let viewProjectionMatrix = [];
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
  let invert = [];
  mat4.invert(invert, viewProjectionMatrix);
  let pointaux = [];
  vec3.transformMat4(pointaux, [0, 0, 0], viewProjectionMatrix);
  let point = [x, y, pointaux[2]];
  vec3.transformMat4(point, point, invert);
  return point;
}

/**
 * Inicia el contexto WebGl
 * @param  {number} idCanvas
 */
function iniciamosWebGL(idCanvas) {
  canvas = document.getElementById(idCanvas);
  try {
    gl = canvas.getContext("webgl");
    if (gl) {
      return true;
    }
    return false;
  }
  catch (e) {
    return false;
  }
}
/*
async function rotarSol() {
  await sleep(300000); //5 min
  let now = new Date();
  let minutesDiff = Math.abs(now - window.lastTime) / 60000;
  let relationNowDay = minutesDiff / (24 * 60);
  let gradeSunPosition = relationNowDay * 360;
  motor.rotarLuzOrbital('sol', gradeSunPosition, 'z');
  motor.rotarLuzOrbital('luna', gradeSunPosition, 'z');
  window.lastTime = now;
  iluminarAstro(now.getHours() * 60 + now.getMinutes());
  rotarSol();
}*/

/**
 * Rota los astros cada X tiempo recursivamente
 */
async function rotarSol(){
  await sleep(300000); //5 min
  let now = new Date();
  calcularPosicionAstros(now);
  rotarSol();
}

/**
 * Demo para comprobar el ciclo de un dia en pocos segundos
 */
async function demoSol() {
  await sleep(100);
  let now = new Date(window.lastTime);
  now.setMinutes(now.getMinutes() + 20);
  calcularPosicionAstros(now);
  demoSol();
}

/**
 * Calcula cuantos grados rotar en funcion del tiempo transcurrido desde la ultima vez
 * @param  {Date} now
 */
function calcularPosicionAstros(now){
  let minuteOfDay = now.getHours() * 60 + now.getMinutes();
  let minutesDiff = Math.abs(now - window.lastTime) / 20000;
  let relationNowDay = minutesDiff / (24 * 60);
  let gradeSunPosition = relationNowDay * 110 * velocidadOrbital;
  console.log("Roto el sol " + gradeSunPosition + ' grados a las ' + now.getHours() + ':' + now.getMinutes() + ':'+now.getSeconds());
  motor.rotarLuzOrbital('sol', gradeSunPosition, 'z');
  motor.rotarLuzOrbital('luna', gradeSunPosition, 'z');
  //Cogemos la luz activa
  let luz = motor.luzRegistro.find(x => x.activa == true);
    if (luz.name == 'sol') {
      //Si es el sol y acabamos de pasar la hora de la puesta, hacemos salir la luna
      if (minuteOfDay >= window.minuteOfSunset) {
        motor.rotarLuzOrbitalA('sol', -100);
        motor.rotarLuzOrbitalA('luna', 100);
        motor.desactivarLuz('sol');
        motor.activarLuz('luna');
        iluminarLuna(minuteOfDay);
      }
      //Si no, actualizamos el color del sol para dibujar
      else{
        iluminarSol(minuteOfDay);    
      }
    }
    else if (luz.name == 'luna') {
      //Idem Sol. Si es de noche y llegamos a la hora de amanecer, sacamos el sol
      if (minuteOfDay >= window.minuteOfSunrise && now.getHours()<14) {
        motor.rotarLuzOrbitalA('luna', 100);
        motor.rotarLuzOrbitalA('sol', -80);
          //inclinación lateral para evitar errores
        motor.rotarLuzOrbital('sol', 10, 'x');
        motor.desactivarLuz('luna');
        motor.activarLuz('sol');
        iluminarSol(minuteOfDay);
      }
      //De noche, el color de la luna es uniforme durante el paso del tiempo
    }
  window.lastTime = now;
}

/**
 * Ilumina sol o luna en funcion de los minutos transcurridos en el dia
 * @param  {number} minuteOfDay
 */
function iluminarAstro(minuteOfDay) {
  if (minuteOfDay >= window.minuteOfSunrise && minuteOfDay <= window.minuteOfSunset) {
    motor.activarLuz("sol");
    motor.desactivarLuz("luna");
    iluminarSol(minuteOfDay);
    gl.uniform1i(glProgram[window.program].noche, -1);
  }
  else {
    motor.activarLuz("luna");
    motor.desactivarLuz("sol");
    iluminarLuna(minuteOfDay);
    gl.uniform1i(glProgram[window.program].noche, 0);
  }
}

/**
 * Ilumina el sol en funcion de los minutos transcurridos en el dia
 * @param  {number} minutes
 */
function iluminarSol(minutes) {
  let rgb = {};
  let minutesSinceSunrise = minutes - window.minuteOfSunrise;
  if (minutesSinceSunrise < window.minutesOfSun / 2) {
    let percent = minutesSinceSunrise / (window.minutesOfSun / 2);
    let rgbMoment = { red: rgbDiffSun.red * percent, green: rgbDiffSun.green * percent, blue: rgbDiffSun.blue * percent };
    rgb = { red: rgbMoment.red + rgbInit.red, green: rgbMoment.green + rgbInit.green, blue: rgbMoment.blue + rgbInit.blue }
  }
  else {
    let percent = (minutesSinceSunrise - (window.minutesOfSun / 2)) / (window.minutesOfSun / 2);
    let rgbMoment = { red: rgbDiffSun.red * percent, green: rgbDiffSun.green * percent, blue: rgbDiffSun.blue * percent };
    rgb = { red: rgbNoon.red - rgbMoment.red, green: rgbNoon.green - rgbMoment.green, blue: rgbNoon.blue - rgbMoment.blue }
  }
  window.factorIlumination = 1-Math.abs((minutes-(window.minutesOfSun))/(window.minutesOfSun));      
  gl.uniform1i(glProgram[window.program].noche, -1);
  window.velocidadOrbital=(60*24/2)/minutesOfSun;
  sol.entity.setIntensidad(rgb.red / 70, rgb.green / 70, rgb.blue / 70);
  sol.entity.setIntensidadSpecular(rgb.red / 70, rgb.green / 70, rgb.blue / 70);
}

/**
 * Ilumina la luna en funcion de los minutos transcurridos en el dia. Pasadas las doce, suma un dia entero a los minutos transcurridos
 * @param  {number} minutes
 */
function iluminarLuna(minutes){
  let minutesOfNight = (24 * 60) - window.minutesOfSun;
  window.velocidadOrbital=(60*24/2)/minutesOfNight;
  luna.entity.setIntensidad(0.1, 0.1, 0.1);
  luna.entity.setIntensidadSpecular(0.1, 0.1, 0.1);
  gl.uniform1i(glProgram[window.program].noche, 0);
  window.factorIlumination = 0.2;
}
/*
async function iluminarLuna(minutes) {
  let rgb = {};
  let minutesOfNight = (24 * 60) - window.minutesOfSun;
  let minutesSinceSunset = '';
  if (minutes > window.minuteOfSunset)
    minutesSinceSunset = minutes - window.minuteOfSunset;
  else
    minutesSinceSunset = minutes + ((24 * 60) - window.minuteOfSunset);

  if (minutesSinceSunset < minutesOfNight / 2) {
    let percent = minutesSinceSunset / (minutesOfNight / 2);
    rgb = { red: (window.rgbDiffMoon.red * percent) + window.rgbInit.red, green: (window.rgbDiffMoon.green * percent) + window.rgbInit.green, blue: (window.rgbDiffMoon.blue * percent) + window.rgbInit.blue };
  }
  else {
    let percent = (minutesSinceSunset - (minutesOfNight / 2)) / (minutesOfNight / 2);
    rgb = { red: window.rgbMoon.red - (window.rgbDiffMoon.red * percent), green: window.rgbMoon.green - (window.rgbDiffMoon.green * percent), blue: window.rgbMoon.blue - (window.rgbDiffMoon.blue * percent) };
  }
  window.velocidadOrbital=(60*24/2)/minutesOfNight;
  luna.entity.setIntensidad(0.1, 0.1, 0.1);
}*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
