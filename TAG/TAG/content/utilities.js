var loadTextResource=function (url, callback){
	var request = new XMLHttpRequest();
    request.open('GET', url+'?dont_cache=', false);
    request.onload=function(){
      if(request.status<200 || request.status>299){
        callback('Error: HTTP Status ' + request.status);
      }else{
        callback(null, request.responseText);
      }
    };
    request.send();
};

var loadImage = function (url, callback){
  let image=new Image();
    image.onload = function(){
      callback(null, image);
    };
    image.src=url;
};

var loadJSONResource=function(url, callback){
  loadTextResource(url, function (err, result){
    if(err){
      callback(err);
    } else{
      try{
        callback(null, JSON.parse(result));
      } catch(e){
        callback(e);
      }
    }
  });
};

function makeShader(src, type){
    //compilar el vertex shader
    let shader=gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert("Error compilando el Shader "+gl.getShaderInfoLog(shader));
    }
    return shader;
}


//función para inicializar los shaders
function configurarShaders(vertexShader, fragmentShader){
    //aquí dentro cogemos los recursos del directorio
    let vs=gestor.getRecurso(vertexShader, 'shader').shader,
        fs=gestor.getRecurso(fragmentShader, 'shader').shader;

    //Ya tenemos los shaders aquí! (formato texto)
    //console.log(vs);
    //console.log(fs);

    //Aqui viene WebGL
    //compilamos los shaders
    glVertexShader=makeShader(vs, gl.VERTEX_SHADER);
    glFragmentShader=makeShader(fs, gl.FRAGMENT_SHADER);

    //creamos el programa
    glProgram=gl.createProgram();

    //añadimos los shaders al programa
    gl.attachShader(glProgram, glVertexShader);
    gl.attachShader(glProgram, glFragmentShader);
    gl.linkProgram(glProgram);

    if(!gl.getProgramParameter(glProgram, gl.LINK_STATUS)){
        alert("No se puede inicializar el shader");
    }

    gl.useProgram(glProgram);
}


//inicializamos parámetros básicos de WebGL (como el viewport)
function setupWebGL(){
    
    //establece el clear color a blanco
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    //profundidad
    gl.enable(gl.DEPTH_TEST);

    //establecemos dimensiones del canvas
    gl.viewport(0, 0, canvas.width, canvas.height);

    /*//inicializamos matriz model y matriz projection (esto no se hará aquí)
    mat4.perspective(pMatrix, 45, canvas.width/canvas.height, 0.1, 100.0);
    mat4.identity(matrixModel);
    mat4.translate(matrixModel, matrixModel, [0, -1, -1.0]);*/


}