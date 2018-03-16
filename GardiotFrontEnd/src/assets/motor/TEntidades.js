//clase entidad de la que derivarán todas las transformaciones
class TEntidad {
	beginDraw(){}
    endDraw(){}
}


class TTransf extends TEntidad{
    constructor (  ) {
        super();
        this._matrix = mat4.create();
    }

    get matrix(){
        return this._matrix;
    }

    set cargar(matrix4x4){
        this._matrix=matrix4x4;
    }

    identidad(){
        mat4.identity(this._matrix)
    }

    trasponer(){
        mat4.transpose(this._matrix, this._matrix);
    }


    //OPERACIONES DE TRANSFORMACIÓN: trasladar, rotar y escalar
    trasladar(x, y, z){
        let vec3traslation=vec3.fromValues(x, y, z);
        mat4.translate(this._matrix, this._matrix, vec3traslation);
    }

    rotar(rotation, axis){//rotación en radianes, eje: x, y o z
        let vec3axis;
        let degrees=rotation * Math.PI / 180;
        if(axis=='x'){
            vec3axis=vec3.fromValues(1, 0, 0);
        }
        else if(axis=='y'){
            vec3axis=vec3.fromValues(0, 1, 0);
        }
        else if(axis=='z'){
            vec3axis=vec3.fromValues(0, 0, 1);
        }
        mat4.rotate(this._matrix, this._matrix, degrees, vec3axis);
    }

    escalar(x, y, z){
        let vec3scalation=vec3.fromValues(x, y, z);
        mat4.scale(this._matrix, this._matrix, vec3scalation);
    }

    //sobreescribiendo métodos de dibujado
    beginDraw(){

        /*Aquí añadimos la matriz de la entidad actual a la pila de matrices. Luego tenemos que multiplicar todas
        las matrices de la pila y guardarla en el this._matrix para que a la hora de dibujar las entidades se le
        apliquen todas las transformaciones del árbol*/
        let a=matrixModel.slice(0);

        matrixStack.push(a);

        mat4.multiply(matrixModel, matrixModel, this._matrix);


    }

    endDraw(n){
        matrixModel=matrixStack.pop();

    }

}


class TLuz extends TEntidad {
    constructor (r, g, b, specR, specG, specB) {
    	super();
        this._intensidad = [r, g, b];
        this._intensidadSpecular=[specR, specG, specB];
    }

    setIntensidad (r, g, b) {
        this._intensidad = [r, g, b];
    }

    setIntensidadSpecular (r, g, b){
        this._intensidadSpecular=[r, g, b];
    }

    get intensidad () {
        return this._intensidad;
    }

    get intensidadSpecular () {
        return this._intensidadSpecular;
    }

    beginDraw(){} //Suelen estar vacios
    endDraw(){}
}

/*No se todavía bien como se gestiona la clase TCamara*/
class TCamara extends TEntidad {
    constructor (isPerspective) {
    	super();
        this._isPerspective = isPerspective;
        this._left;
        this._right;
        this._bottom;
        this._top;
        this._near;
        this._far;
    }

    setParams (left, right, bottom, top, near, far) { //Estos floats no se para que son
        this._left=left;
        this._right=right;
        this._bottom=bottom;
        this._top=top;
        this._near=near;
        this._far=far;
        this._esPerspectiva=true;
    }

    setPerspectiva(){
        this._isPerspective=true;
    }

    setParalela (left, right, bottom, top, near, far) {
        this._esPerspectiva = false;
    }

    beginDraw () {} //Suelen estar vacios
    endDraw () {}
}


/*La clase TMalla tiene su estructura, solo que el método beginDraw más
adelante se comunicará con WebGL para que se dibuje en pantalla.
Ahora mismo el atributo this._malla es un String provisional, así podemos
saber que malla es en concreto.*/
class TMalla extends TEntidad {
    //Al constructor deberemos pasarle un puntero.
    //Para más info ved el archivo readmePunteros.txt
    constructor (nombreMalla) {
    	super();
        this._malla=gestor.getRecurso(nombreMalla, 'malla');
    }

    get malla(){
        return this._malla;
    }

    //A set malla le pasamos el nombre de la malla para que la carge del gestor
    set malla(nombreMalla){
        this._malla=gestor.getRecurso(nombreMalla, 'malla');
    }

    beginDraw () { 
        this._malla.draw();
    }
    endDraw () {}
}
