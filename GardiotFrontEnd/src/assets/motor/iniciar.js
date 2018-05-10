function iniciar(accion, jardinBBDD, sunrise /*= new Date('December 25, 1995 07:03:23')*/, sunset /*= new Date('December 25, 1995 20:55:44')*/) {
  // console.log(jardinBBDD);
  window.canvas = null;

  window.jardin = jardinBBDD;
  //console.log(window.plantas);
  window.loading = [];//array que estará vacío si no hay nada cargándose

  //bucle movimiento
  window.frames = 0;
  window.fpsInterval = 0;
  window.startTime = 0;
  window.now = 0;
  window.then = 0;
  window.elapsed = 0;
  window.frameCount = 0;
  window.interval;


  window.hovered = -1;
  window.colorCell = [];

  window.rotationCamX = -40;
  window.rotationCamY = -45;
  window.step = [0, 0, 0];
  window.transition = false;
  window.escala = 1;
  window.cont = 19;
  window.camHeight = 4;


  window.mode = 0;
  //0 modo visualización
  //1 modo edición
  //2 modo sombras

  //inicialización de matrices
  window.matrixStack = [];//pila de matrices
  window.matrixModel = mat4.create();//matriz modelo
  matrixStack.push(matrixModel);
  window.camaraActiva = null;
  window.projectionMatrix = [];//matriz proyección
  window.lightProjectionMatrix = [];
  mat4.ortho(lightProjectionMatrix, -40, 40, -40, 40, -40.0, 80);
  window.viewMatrix = [];//matriz view

  window.viewLightMatrix = []; //view matrix from light

  //DragAndDrop
  window.dragging = false;
  for (let value of window.jardin.plants) {
    value.isDragging = false;
  }

  //declaramos las variables necesarias para ejecutar el programa
  //las variables de WebGL empezarán siempre por gl para distinguirlas de
  //las variables del motor gráfico
  window.gl = null;
  window.glVertexShader = [];
  window.glFragmentShader = [];
  window.glProgram = [];



  //program 0 = cartoon
  //program 1 = estandar
  window.program = 1;
  window.vertexShaders = ['shaderCartoon.vs', 'shaderP.vs', 'shadow.vs'];
  window.fragmentShaders = ['shaderCartoon.fs', 'shaderP.fs', 'shadow.fs'];

  //inicializamos el gestor de recursos
  window.gestor = new TGestorRecursos();

  iniciamosWebGL('myCanvas');
  cargarShaders();



  //fachada
  window.motor = new TMotor(gestor);

  //motor.crearNodoLuzDirigida("luz1", 10, [0.0, -10.0, 0.0], 1.7, undefined);
  window.sol = motor.crearNodoLuz("sol", 1.7, undefined);
  window.luna = motor.crearNodoLuz("luna", 1.7, undefined);
  //var luz3 = motor.crearNodoLuz("luz3", 0.7, undefined);

  //camara de vista
  motor.crearNodoCamara("dynamicCamera", true, undefined);

  //camara de edición
  //motor.crearNodoCamara("dynamicCamera", true, undefined);

  //window.mallaAnimada = motor.crearNodoAnimacion("animacion", ["chair", "bote", "Susan"], undefined);
  //motor.siguienteMallaAnimada("animacion");


  //window.malla2 = motor.crearNodoMalla("malla2", "bote", "madera.jpg",  undefined);

  //window.malla3 = motor.crearNodoMalla("malla3", "chair", undefined);

  //var malla4=motor.crearNodoMalla("malla4", "perejil", undefined);

  motor.escalarMalla("malla4", 0.2);

  //suelo
  let adjustX = 0, adjustY = 0;
  let width = Math.floor(jardin.width / 2), length = Math.floor(jardin.length / 2);

  motor.crearNodoMalla("around", "around", undefined, undefined);
  motor.escalarMallaXYZ("around", 500, 0.1, 500);
  motor.moverMalla("around", 0, -0.11, 0);
  for (let i = -width; i <= width; i++) {
    for (let j = -length; j <= length; j++) {
      motor.crearNodoMalla("suelo" + i + '-' + j, "sueloPolly", "cespedDef.jpg", undefined);
      motor.escalarMallaXYZ("suelo" + i + '-' + j, 0.5, 0.1, 0.5);
      motor.moverMalla("suelo" + i + '-' + j, i, -0.1, j);//POR FAVOR NO TOCAR EL SUELO, SI QUERÉIS AJUSTAR LAS ALTURAS
      //HACEDLO CON LAS PLANTAS
    }
  }
  //  Pruebas Valla JARDIN

    // VALLADO
    /* Consideramos length y width como unidades de suelo*/

    /* Construimos en el lado derecho del suelo tantas vallas
      como bloques de suelo y las colocamos en su lugar */
    let valla = 1;
    let desfase=0.5;
    // VALLA derecha.
    for (var i = -width; i < width; i++) {
      motor.crearNodoMalla("valla"+i, "valla", "maderablanca.jpg", undefined);
      motor.rotarMalla("valla"+i, -90, "z");
      motor.escalarMallaXYZ("valla"+i,0.15, valla, 0.2); /* alto - LARGO - ancho */
      motor.moverMalla("valla"+i, i*valla+desfase, 0, (length+desfase-0.038)); /* FONDO - altura - izda dcha*/

    }
    // VALLA izquierda.
    for (var i = -width; i < width; i++) {
      motor.crearNodoMalla("valla2"+i, "valla", "maderablanca.jpg", undefined);
      motor.rotarMalla("valla2"+i, -90, "z");
      motor.escalarMallaXYZ("valla2"+i,0.15, valla, 0.2); /* alto - LARGO - ancho */
      motor.moverMalla("valla2"+i, i*valla+desfase, 0, (-length-desfase)); /* FONDO - altura - izda dcha*/

    }
    // VALLA trasera.
    for (var i = -length; i < length; i++) {
      motor.crearNodoMalla("valla3"+i, "valla", "maderablanca.jpg", undefined);
      motor.rotarMalla("valla3"+i, -90, "z");
      motor.rotarMalla("valla3"+i, 90, "x");
      motor.escalarMallaXYZ("valla3"+i,0.15, valla, 0.2); /* alto - LARGO - ancho */
      motor.moverMalla("valla3"+i, width+desfase, 0, i*valla+desfase); /* FONDO - altura - izda dcha*/

    }
    // VALLA delantera.
    for (var i = -length; i < length; i++) {
      motor.crearNodoMalla("valla4"+i, "valla", "maderablanca.jpg", undefined);
      motor.rotarMalla("valla4"+i, -90, "z");
      motor.rotarMalla("valla4"+i, 90, "x");
      motor.escalarMallaXYZ("valla4"+i,0.15, valla, 0.2); /* alto - LARGO - ancho */
      motor.moverMalla("valla4"+i, (-width-desfase), 0, i*valla+desfase); /* FONDO - altura - izda dcha*/

    }

  window.dataPlants = {
    LECHUGA: {
      textura: 'lechuga.jpg',
      escalado: 2.5,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      posY: -0.2
    },
    CALABAZA: {
      textura: 'calabaza.jpg',
      escalado: 0.3,
      rotX: -90,
      rotY: 0,
      rotZ: 90,
      posY: 0.1
    },
    TOMATE: {
      textura: 'tomatera.png',
      escalado: 0.006,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      posY: 0
    },
    MACETA: {
      escalado: 0.05,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      posY: 0.1
    },
    PEREJIL: {
      textura: 'peregil.jpg',
      escalado: 0.004,
      rotX: -90,
      rotY: 0,
      rotZ: 0,
      posY: 0.1
    },
    ROSA: {
      textura: 'rosa.jpg',
      escalado: 0.01,
      rotX: -90,
      rotY: 10,
      rotZ: 0,
      posY: 0.1
    },
    MARGARITA: {
      textura: 'margarita.jpg',
      escalado: 0.06,
      rotX: -90,
      rotY: 0,
      rotZ: 0,
      posY: 0.5
    },
    CYCA: {
      textura: 'cyca2.jpg',
      escalado: 0.1,
      rotX: -90,
      rotY: 0,
      rotZ: 0,
      posY: 0.2
    },
    CIPRES: {
      textura: 'arbol.jpg',
      escalado: 0.2,
      rotX: -90,
      rotY: 0,
      rotZ: 0,
      posY: 0.2
    },
    LOGO: { // motor.escalarMallaXYZ("logo", 0.2, 0.2, 0.2);
      textura: 'logo.jpg',
      escalado: 0.3,
      rotX: -90,
      rotY: 0,
      rotZ: 90,
      posY: 0.2

    }
  };

  // plantas dragables
  window.plantsMap = new Map();
  for (let i = 0; i < jardin.plants.length; i++) {

    let resource = jardin.plants[i].model;
    if (typeof resource !== 'undefined') {
      plantsMap.set(jardin.plants[i].x + '-' + jardin.plants[i].y, jardin.plants[i].id);
      resource.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); //Cambia acentos por no acentos
      resource = resource.toUpperCase();

      // console.log(resource.toLowerCase());
      motor.crearNodoMalla(jardin.plants[i].id, resource.toLowerCase(), dataPlants[resource].textura, undefined);
      motor.escalarMalla(jardin.plants[i].id, dataPlants[resource].escalado);
      if (dataPlants[resource].rotX != 0)
        motor.rotarMalla(jardin.plants[i].id, dataPlants[resource].rotX, "x");
      if (dataPlants[resource].rotY != 0)
        motor.rotarMalla(jardin.plants[i].id, dataPlants[resource].rotY, "y");
      if (dataPlants[resource].rotZ != 0)
        motor.rotarMalla(jardin.plants[i].id, dataPlants[resource].rotZ, "z");
      motor.moverMalla(jardin.plants[i].id, jardin.plants[i].x, dataPlants[resource].posY, jardin.plants[i].y);
    }
  }

  if (accion != 'home') {
    //ANIMACION
    /*  motor.crearNodoAnimacion("pajaro", "pajaro", 80, undefined);
      motor.crearNodoAnimacion("alaA", "ala", 80, undefined);
      motor.crearNodoAnimacion("alaB", "alab", 80, undefined);

      motor.moverMalla("pajaro", 0.2, 0.2, 0.2);
      motor.moverMalla("alaA", 0.2, 0.2, 0.2);
      motor.moverMalla("alaB", 0.2, 0.2, 0.2);*/
  }

  // motor.escalarMalla("pajaro2_000000", 2.1);
  // motor.rotarMalla("pajaro2_000000", -90, "x");
  // motor.moverMalla("pajaro2_000000", 30, -15, 15);

  //luces
  motor.moverLuz("luz1", 10.0, 10.0, 0.0);
  motor.moverLuz("sol", 0.0, 500.0, 0.0);
  motor.moverLuz("luna", 0.0, -500.0, 0.0);
  //motor.moverLuz("luz3", 0.0, -10.0, 0.0);
  motor.activarLuz("luz1");
  motor.activarLuz("sol");
  //motor.activarLuz("luz3");



  //motor.moverMalla("malla1", -9, -15, -30);

  motor.escalarMalla("malla2", 0.5);
  motor.moverMalla("malla2", 0, 1, 0);

  motor.moverMalla("malla3", 15, 25, 0);
  motor.escalarMalla("malla3", 6);
  motor.rotarMalla("malla3", 40, "x");

  /* POSICION DEL SOL */
  if (typeof sunrise === 'undefined' && typeof sunset === 'undefined') {
    sunrise = new Date(2018, 11, 11, 8, 42, 30);
    sunset = new Date(2018, 11, 11, 20, 14, 42);
  }

  let today = new Date();
  let minuteOfDay = today.getHours() * 60 + today.getMinutes();
  window.minuteOfSunrise = sunrise.getHours() * 60 + sunrise.getMinutes();
  window.minuteOfSunset = sunset.getHours() * 60 + sunset.getMinutes();
  window.minutesOfSun = minuteOfSunset - minuteOfSunrise; // Minutos de sol diarios
  let minutesTotalDay = 24 * 60;
  window.relationSunDay = minutesOfSun / minutesTotalDay;
  let relationNowDay = minuteOfDay * relationSunDay;
  let gradeSunPosition = (relationNowDay * 360) / minutesTotalDay;
  motor.rotarLuzOrbitalA('sol', gradeSunPosition - 90);
  motor.rotarLuzOrbitalA('luna', gradeSunPosition + 90);
  window.lastTime = today;

  /* COLOR DEL SOL */
  window.rgbInit = { red: 182, green: 126, blue: 91 };
  window.rgbNoon = { red: 192, green: 191, blue: 173 };
  window.rgbMoon = { red: 192, green: 198, blue: 255 };
  window.rgbDiffSun = { red: rgbNoon.red - rgbInit.red, green: rgbNoon.green - rgbInit.green, blue: rgbNoon.blue - rgbInit.blue };
  window.rgbDiffMoon = { red: rgbMoon.red - rgbInit.red, green: rgbMoon.green - rgbInit.green, blue: rgbMoon.blue - rgbInit.blue };

  iluminarAstro(minuteOfDay);
  rotarSol();





  //motor.rotarCamaraOrbital("dynamicCamera", 45, "y");
  //motor.rotarCamaraOrbital("dynamicCamera", -45, "x");

  //motor.moverCamaraA("dynamicCamera", 0,10, 0);


  //motor.rotarCamaraOrbital("dynamicCamera", -90, "x");

  motor.activarCamara("dynamicCamera");

  //dependiendo de si estamos en modo visión o modo edición, habrá una cámara u otra
  if (accion == 'detail') {
    window.mode = 0;
    //motor.rotarCamara("dynamicCamera", -rotationCamX, "x");
    motor.moverCamaraA("dynamicCamera", 0, camHeight, camHeight * 2);
    motor.rotarCamaraOrbital("dynamicCamera", 0, "y");
    motor.rotarCamara("dynamicCamera", rotationCamX, "x");

    //motor.rotarCamaraOrbital("dynamicCamera", 45, "y");
    //motor.rotarCamaraOrbital("dynamicCamera", 25, "x");

    motor.startDrawing('shaderP.vs', 'shaderP.fs');
  }
  else if (accion == 'edit') {
    window.mode = 1;
    motor.rotarCamara("dynamicCamera", -90, "x");
    motor.moverCamara("dynamicCamera", 0, camHeight / 2, 0);

    motor.startDrawing('shaderP.vs', 'shaderP.fs');
  }
  else if (accion == 'home') {
    window.mode = 0;
    //motor.rotarCamara("dynamicCamera", -rotationCamX, "x");
    motor.moverCamaraA("dynamicCamera", -camHeight, camHeight, camHeight);
    motor.rotarCamara("dynamicCamera", rotationCamY, "y");
    motor.rotarCamara("dynamicCamera", rotationCamX, "x");

    //motor.rotarCamaraOrbital("dynamicCamera", 45, "y");
    //motor.rotarCamaraOrbital("dynamicCamera", 25, "x");

    motor.startDrawingStatic('shaderP.vs', 'shaderP.fs');
  }


  //motor.startDrawingStatic('shaderP.vs', 'shaderP.fs');

}


