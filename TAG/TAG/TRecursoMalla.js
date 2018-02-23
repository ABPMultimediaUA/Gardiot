class TRecursoMalla extends TRecurso{

  constructor (nombre){
    super(nombre)
    this._vertices=[];
    this._verticesIndex=[];
    this._normales;
    this._texturas;
    this._vertTriangulos;
    this._normTriangulos;
    this._texTriangulos;
    this._nTriangulos;

  }
  cargarFichero(nombre){
    let cargado;
    let objeto;
    //cargamos el objeto del directorio
    loadJSONResource('/recursos/mallas/'+nombre+'.json', function (modelErr, modelObj){
      if(modelErr){
        cargado=false;
        alert("fail to cargar malla "+nombre);
      }
      else{
        cargado=true;
        console.log('JSON del objeto '+nombre+':');
        console.log(modelObj);
        objeto=modelObj;
      }
    });
    if(cargado){
      //almacenamos los vértices del objeto
      this._vertices=objeto.meshes[0].vertices;

      //almacenamos el índice de caras
      for(let i=0; i<objeto.meshes[0].faces.length; i++){
        for(let j=0; j<objeto.meshes[0].faces[i].length; j++){
          this._verticesIndex.push(objeto.meshes[0].faces[i][j]);
        }
      }
    }

    return cargado;
  }
  
  draw(){
    console.log('a dibujar '+this.nombre);
    //primero creamos el buffer de vertices
    let buffer=gl.createBuffer();
    //se lo pasamos al programa
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //asignamos los vértices leídos al buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertices), gl.STATIC_DRAW);

    //Ahora vamos a crear el índice de vértices 
    //(esto es como indicarle a WebGL los vértices que componen cada cara)
    let index=gl.createBuffer();
    index.number_vertex_points=this._verticesIndex.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._verticesIndex), gl.STATIC_DRAW);


    //dibujamos en el canvas
    let vertexPositionAttribute=gl.getAttribLocation(glProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.drawElements(gl.TRIANGLES, index.number_vertex_points, gl.UNSIGNED_SHORT, 0);


  }
}


//http://www.opengl-tutorial.org/es/beginners-tutorials/tutorial-7-model-loading/
