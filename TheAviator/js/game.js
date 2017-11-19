//COLORS
var Colors = { // elegimos los colores que usaremos en el proyecto
    purple:0xD778F9,
    white:0xFFFFFF,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x0198FD,
    orange:0xFF9D09,
    cyan:0x09FFB6,
    dark:0x0A0A0A,
    lavanda:0x850BC1,
    red:0xFD0819
};

///////////////

// variables del juego
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];

function resetGame(){ // que todo se resetee cuando pierda
  game = {speed:0,
          initSpeed:.00035,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000025,
          incrementSpeedByLevel:.000005,
          distanceForSpeedUpdate:100,
          speedLastUpdate:0,

          distance:0,
          ratioSpeedDistance:50,
          energy:100,
          ratioSpeedEnergy:3,

          level:1,
          levelLastUpdate:0,
          distanceForLevelUpdate:1000,

          planeDefaultHeight:100,
          planeAmpHeight:80,
          planeAmpWidth:75,
          planeMoveSensivity:0.005,
          planeRotXSensivity:0.0008,
          planeRotZSensivity:0.0004,
          planeFallSpeed:.001,
          planeMinSpeed:1.2,
          planeMaxSpeed:1.6,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,

          seaRadius:600,
          seaLength:800,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 5,
          wavesMaxAmp : 20,
          wavesMinSpeed : 0.001,
          wavesMaxSpeed : 0.003,

          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,

          coinDistanceTolerance:15,
          coinValue:3,
          coinsSpeed:.5,
          coinLastSpawn:0,
          distanceForCoinsSpawn:100,

          ennemyDistanceTolerance:10,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:50,

          status : "playing",
         };
  fieldLevel.innerHTML = Math.floor(game.level);
}

//THREEJS RELATED VARIABLES

var scene, // mandamos a llamar las variables de scena,la camara y renderer
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH, // ponemos los tamanos de hasta donde se movera el mouse
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {
// Obtener el ancho y el alto de la pantalla,
// utilícelos para configurar la relación de aspecto de la cámara
// y el tamaño del renderizador.
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();// creacion de la scena
  
  aspectRatio = WIDTH / HEIGHT;// creacion de la camara
  fieldOfView = 50;
  nearPlane = .1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );

  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);// Agrega un efecto de niebla a la escena; mismo color que el
  // color de fondo utilizado en la hoja de estilos
  
  camera.position.x = 0;// posiciones de la camara
  camera.position.z = 200;
  camera.position.y = game.planeDefaultHeight;
  //camera.lookAt(new THREE.Vector3(0, 400, 0));

  //creacion del renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });// alpha = permitiremos transferencia para mostrar el fondo degradado y definimos en css
  // luego antialias=  activamos el anti-aliasing; esto es menos eficiente, ya que el proyecto es baja poli
  renderer.setSize(WIDTH, HEIGHT);// definimos el tamano del renderer para que ocupe toda la pantalla

  renderer.shadowMap.enabled = true;// habilitamos la representacion de sombras

// Agrega el elemento DOM del renderizador al contenedor que creamos en el HTML
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);
// Escucha la pantalla: si el usuario la cambia de tamaño, tenemos que actualizar la cámara y el tamaño del renderizador
  window.addEventListener('resize', handleWindowResize, false);

  /*
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = -Math.PI / 2;
  controls.maxPolarAngle = Math.PI ;

  //controls.noZoom = true;
  //controls.noPan = true;
  //*/
}

// MOUSE AND SCREEN EVENTS
// actualiza la altura y el ancho del renderizador y la cámara
function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) { // poner las funciones del mouse al moverse
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

function handleTouchMove(event) {// clik con el mouse
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

function handleMouseUp(event){ // darle clik al mouse para que renicie el juego en el inicio
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}


function handleTouchEnd(event){// darle clik al mouse para que renicie el juego al final
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}

// LIGHTS

var ambientLight, hemisphereLight, shadowLight; // llamar las variables de la luz ambiental, 
//luz hemisferica y la sombra de la luz

function createLights() {// creacion de la luz
// la luz hemisferica es una luz de color degradada
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)// el primer parametro es el color del cielo, 
  //el segundo parámetro es el color del suelo y el tercero es la intensidad de la luz

  ambientLight = new THREE.AmbientLight(0xdc8874, .5); // poner las parametros para la luz ambiental

  shadowLight = new THREE.DirectionalLight(0xffffff, .9); // poner la insensidad del color de la sombra de la luz
  shadowLight.position.set(150, 350, 350);//Establecer la dirección de la luz
  shadowLight.castShadow = true;// permitir el sombreado
 // define el área visible de la sombra proyectada
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  //definir la resolución de la sombra; cuanto más alto mejor,pero también más caro y menos eficiente
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera); // el mesh de la camara donde mostrara,la sombra de la luz y la sombra de la camara

  //scene.add(ch);
  // se muestre las luces en la escena
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

}


var Pilot = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "pilot";
  this.angleHairs=0;//angleHairs es una propiedad utilizada para animar el cabello más tarde

  // creamos el cuerpo del piloto
  var bodyGeom = new THREE.BoxGeometry(15,15,15);
  var bodyMat = new THREE.MeshPhongMaterial({color:Colors.lavanda, shading:THREE.FlatShading});
  var body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(2,-12,0);
  this.mesh.add(body);

  // creamos la cara del piloto
  var faceGeom = new THREE.BoxGeometry(10,10,10);
  var faceMat = new THREE.MeshLambertMaterial({color:Colors.pink});
  var face = new THREE.Mesh(faceGeom, faceMat);
  this.mesh.add(face);

  // creamos el cabello del piloto
  var hairGeom = new THREE.BoxGeometry(4,4,4);
  var hairMat = new THREE.MeshLambertMaterial({color:Colors.dark});
  var hair = new THREE.Mesh(hairGeom, hairMat);
  hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));// Alinea la forma del cabello con su límite inferior, eso hará que sea más fácil escalar.
  var hairs = new THREE.Object3D();//crear un contenedor para el cabello

  this.hairsTop = new THREE.Object3D();// crear un contenedor para los pelos en la parte superior
  // de la cabeza (los que se animarán)

  // crea los pelos en la parte superior de la cabeza
// y colocarlos en una cuadrícula de 3 x 4
  for (var i=0; i<12; i++){
    var h = hair.clone();
    var col = i%3;
    var row = Math.floor(i/3);
    var startPosZ = -4;
    var startPosX = -4;
    h.position.set(startPosX + row*4, 0, startPosZ + col*4);
    h.geometry.applyMatrix(new THREE.Matrix4().makeScale(1,1,1));
    this.hairsTop.add(h);
  }
  hairs.add(this.hairsTop);

  // crear los pelos en el lado de la cara
  var hairSideGeom = new THREE.BoxGeometry(12,4,2);
  hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
  var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
  var hairSideL = hairSideR.clone();
  hairSideR.position.set(8,-2,6);
  hairSideL.position.set(8,-2,-6);
  hairs.add(hairSideR);
  hairs.add(hairSideL);

  // crea los pelos en la parte posterior de la cabeza
  var hairBackGeom = new THREE.BoxGeometry(2,8,10);
  var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
  hairBack.position.set(-1,-4,0)
  hairs.add(hairBack);
  hairs.position.set(-5,5,0);

  this.mesh.add(hairs);

  // crea los lentes o gafas del piloto
  var glassGeom = new THREE.BoxGeometry(5,5,5);
  var glassMat = new THREE.MeshLambertMaterial({color:Colors.brown});
  var glassR = new THREE.Mesh(glassGeom,glassMat);
  glassR.position.set(6,0,3);
  var glassL = glassR.clone();
  glassL.position.z = -glassR.position.z

  var glassAGeom = new THREE.BoxGeometry(11,1,11);
  var glassA = new THREE.Mesh(glassAGeom, glassMat);
  this.mesh.add(glassR);
  this.mesh.add(glassL);
  this.mesh.add(glassA);

  var earGeom = new THREE.BoxGeometry(2,3,2);
  var earL = new THREE.Mesh(earGeom,faceMat);
  earL.position.set(0,0,-6);
  var earR = earL.clone();
  earR.position.set(0,0,6);
  this.mesh.add(earL);
  this.mesh.add(earR);
}
//mover el cabello
Pilot.prototype.updateHairs = function(){
  //*
   var hairs = this.hairsTop.children;// obtener el cabello

   // actualizarlos según el ángulo angleHairs
   var l = hairs.length;
   for (var i=0; i<l; i++){
      var h = hairs[i];
  // cada elemento de cabello se escalará cíclicamente entre el 75% y el 100% de su tamaño original
      h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25;
   }
  this.angleHairs += game.speed*deltaTime*40;// incrementa el ángulo para el siguiente fotograma
  //*/
}

var AirPlane = function(){ // creamos la funcion del airoplano o avion
  this.mesh = new THREE.Object3D(); // que sean los objetos en  3D
  this.mesh.name = "airPlane"; // nombre del mesh aeroplano

  // creamos la cabina

  var geomCabin = new THREE.BoxGeometry(80,50,50,1,1,1); // usamos la primitiva y le ponemos la forma de su geometria
  var matCabin = new THREE.MeshPhongMaterial({color:Colors.purple, shading:THREE.FlatShading});// creamos el material lo que sera sus colores y tamanos
// podemos acceder a un vértice específico de una forma a través
// la matriz vértices, y luego mueve su propiedad x, y y z:
  geomCabin.vertices[4].y-=10;
  geomCabin.vertices[4].z+=20;
  geomCabin.vertices[5].y-=10;
  geomCabin.vertices[5].z-=20;
  geomCabin.vertices[6].y+=30;
  geomCabin.vertices[6].z+=20;
  geomCabin.vertices[7].y+=30;
  geomCabin.vertices[7].z-=20;

  var cabin = new THREE.Mesh(geomCabin, matCabin); // creamos el mesh de la cabina con su geometria y material
  cabin.castShadow = true; // permitir que tenga sombra y la reciba
  cabin.receiveShadow = true; 
  this.mesh.add(cabin); // que se muestre la cabina en la scena

  // Creamos el motor

  var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1); // le agregamos la primitiva para ponerla como motor con sus geometria
  var matEngine = new THREE.MeshPhongMaterial({color:Colors.purple, shading:THREE.FlatShading}); // el material de la geometria y sus colores
  var engine = new THREE.Mesh(geomEngine, matEngine); // mesh de la geometria del motor y su material
  engine.position.x = 50; // posicion del motor para que este enfrente
  engine.castShadow = true; // permitir que tenga sombra y que la reciba
  engine.receiveShadow = true;
  this.mesh.add(engine); // que se muestre el motor en la scena

  // creamos el plano de la cola

  var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1); // le agreamos la primitiva  y la modificamos para que paresca al plano de la cola
  var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.cyan, shading:THREE.FlatShading}); // le damos su material y su color
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane); // le ponemos el mesh donde tendra la geometria y material del plano de la cola
  tailPlane.position.set(-40,20,0); // le damos la posicion del plano de la cola que sera hasta atras
  tailPlane.castShadow = true; // que permita tener sombra y que la reciba
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane); // que se muestre el plano de la cola en la scena

  // alas

  var geomSideWing = new THREE.BoxGeometry(30,5,120,1,1,1); // le ponemos la primitiva y la modificamos para que paresca las alas del aeroplano
  var matSideWing = new THREE.MeshPhongMaterial({color:Colors.purple, shading:THREE.FlatShading}); // le damos su material y su color
  var sideWing = new THREE.Mesh(geomSideWing, matSideWing); // aqui estara el mesh que tendra la geometria y el material de las alas
  sideWing.position.set(0,15,0); // le damos la posicion de las alas para que esten a los lados
  sideWing.castShadow = true; // que permita sombra y que la reciba
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing); // que las alas se muestren en la scena

  // creamos los parabrisas
  var geomWindshield = new THREE.BoxGeometry(3,15,20,1,1,1);
  var matWindshield = new THREE.MeshPhongMaterial({color:Colors.cyan,transparent:true, opacity:.3, shading:THREE.FlatShading});;
  var windshield = new THREE.Mesh(geomWindshield, matWindshield);
  windshield.position.set(5,27,0);
  windshield.castShadow = true;
  windshield.receiveShadow = true;
  this.mesh.add(windshield);

  // creamos la helice
  var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
  geomPropeller.vertices[4].y-=5;
  geomPropeller.vertices[4].z+=5;
  geomPropeller.vertices[5].y-=5;
  geomPropeller.vertices[5].z-=5;
  geomPropeller.vertices[6].y+=5;
  geomPropeller.vertices[6].z+=5;
  geomPropeller.vertices[7].y+=5;
  geomPropeller.vertices[7].z-=5;
  var matPropeller = new THREE.MeshPhongMaterial({color:Colors.cyan, shading:THREE.FlatShading});
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  // creamos las cuchillas
  var geomBlade = new THREE.BoxGeometry(1,80,10,1,1,1);
  var matBlade = new THREE.MeshPhongMaterial({color:Colors.cyan, shading:THREE.FlatShading});
  var blade1 = new THREE.Mesh(geomBlade, matBlade);
  blade1.position.set(8,0,0);

  blade1.castShadow = true;
  blade1.receiveShadow = true;

  var blade2 = blade1.clone();
  blade2.rotation.x = Math.PI/2;

  blade2.castShadow = true;
  blade2.receiveShadow = true;

  this.propeller.add(blade1);
  this.propeller.add(blade2);
  this.propeller.position.set(60,0,0);
  this.mesh.add(this.propeller);

  var wheelProtecGeom = new THREE.BoxGeometry(30,15,10,1,1,1);
  var wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.purple, shading:THREE.FlatShading});
  var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
  wheelProtecR.position.set(25,-20,25);
  this.mesh.add(wheelProtecR);

  var wheelTireGeom = new THREE.BoxGeometry(24,24,4);
  var wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.dark, shading:THREE.FlatShading});
  var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
  wheelTireR.position.set(25,-28,25);

  var wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
  var wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.dark, shading:THREE.FlatShading});
  var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
  wheelTireR.add(wheelAxis);

  this.mesh.add(wheelTireR);

  var wheelProtecL = wheelProtecR.clone();
  wheelProtecL.position.z = -wheelProtecR.position.z ;
  this.mesh.add(wheelProtecL);

  var wheelTireL = wheelTireR.clone();
  wheelTireL.position.z = -wheelTireR.position.z;
  this.mesh.add(wheelTireL);

  var wheelTireB = wheelTireR.clone();
  wheelTireB.scale.set(.5,.5,.5);
  wheelTireB.position.set(-35,-5,0);
  this.mesh.add(wheelTireB);

  var suspensionGeom = new THREE.BoxGeometry(4,20,4);
  suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0))
  var suspensionMat = new THREE.MeshPhongMaterial({color:Colors.purple, shading:THREE.FlatShading});
  var suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
  suspension.position.set(-35,-5,0);
  suspension.rotation.z = -.3;
  this.mesh.add(suspension);

  this.pilot = new Pilot();
  this.pilot.mesh.position.set(-10,27,0);
  this.mesh.add(this.pilot.mesh);


  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;

};

Sky = function(){// definimos el cielo
  this.mesh = new THREE.Object3D(); // creamos un contenedor vacio
  this.nClouds = 20; // elegimos la cantidad de nubes que seran disparsidas en el cielo
  this.clouds = [];
  var stepAngle = Math.PI*2 / this.nClouds;// para distribuir las nubes consistentemente,tenemos que colocarlos de acuerdo con un ángulo uniforme
  for(var i=0; i<this.nClouds; i++){ // creamos las nubes
    var c = new Cloud();
    this.clouds.push(c);
    //establecemos la rotacion y la posicion de cada nube y para eso usaremos trigonometria
    var a = stepAngle*i;// este es el angulo final de la nube
    var h = game.seaRadius + 150 + Math.random()*200;// esta es la distancia entre el centro del eje y la nube misma
    // aqui estamos convirtiendo coordenadas polares (ángulo, distancia) en coordenadas cartesianas (x, y, z)
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = -300-Math.random()*500;//para un mejor resultado, posicionamos las nubes,a profundidades aleatorias dentro de la escena
    c.mesh.rotation.z = a + Math.PI/2;// rotamos la nube de acuerdo a su posición
    var s = 1+Math.random()*2;// tabien establecemos una escala aleatoria para cada nube
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh); // hacemos que las mallas de nubes se muestren en la scena
  }
}

Sky.prototype.moveClouds = function(){ //  creamos la funcion del movimiento de las nubes
  for(var i=0; i<this.nClouds; i++){
    var c = this.clouds[i];
    c.rotate();
  }
  this.mesh.rotation.z += game.speed*deltaTime;

}

Sea = function(){ // definio sel objeto de mar
  // crear la geometría (forma) del cilindro;
// los parámetros son: radio superior, radio inferior, altura, número de segmentos en el radio, número de segmentos verticalmente
  var geom = new THREE.CylinderGeometry(game.seaRadius,game.seaRadius,game.seaLength,40,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));// giramos la geometría en el eje x
  geom.mergeVertices();//al unir los vértices aseguramos la continuidad de las olas
  var l = geom.vertices.length;// obtenemos los vértices

  this.waves = [];// crea una matriz para almacenar nuevos datos asociados a cada vértice

  for (var i=0;i<l;i++){
    var v = geom.vertices[i];// obtener cada vértice
    //v.y = Math.random()*30;
    // almacenar algunos datos asociados a ella
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,// un ángulo aleatorio
                     amp:game.wavesMinAmp + Math.random()*(game.wavesMaxAmp-game.wavesMinAmp),// una distancia aleatoria
                     // una velocidad aleatoria entre 0.016 y 0.048 radianes / cuadro
                     speed:game.wavesMinSpeed + Math.random()*(game.wavesMaxSpeed - game.wavesMinSpeed)
                    });
  };
  var mat = new THREE.MeshPhongMaterial({ // creamos el material
    color:Colors.blue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);/// creamos el mesh o la malla que es la combinacion de la geometria y el material
  this.mesh.name = "waves"; // creamos el nombre del mesh llamadas olas
  this.mesh.receiveShadow = true; // permitimos que el mar reciba sombras

}

Sea.prototype.moveWaves = function (){ // creamos la funcion del movimiento de las olas
 // obtener los vértices
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];// obtener los datos asociados a ella
    // actualiza la posición del vértice
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    // incrementa el ángulo para el siguiente fotograma
    vprops.ang += vprops.speed*deltaTime;
    // Dile al procesador que la geometría del mar ha cambiado.
    // three.js almacena en caché las geometrías e ignora los cambios
    // a menos que agreguemos esta línea
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

Cloud = function(){ // creamos el funcionamiento de las nubes
  this.mesh = new THREE.Object3D(); // agregamos para que los objetos se miren en 3D
  this.mesh.name = "cloud"; // al mesh le llamamos nubes
  var geom = new THREE.CubeGeometry(20,20,20); // le damos la geometria que sera de forma de cubo
  var mat = new THREE.MeshPhongMaterial({ // le damos el material a las nubes y su color que sera blanco
    color:Colors.white,

  });

  //*
  var nBlocs = 3+Math.floor(Math.random()*3); // le decimos cuantos cubos de nubes seran
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);// clonara la cantidad de nubes
    m.position.x = i*15;
    m.position.y = Math.random()*10;// aqui les damos posiciones aleatorios
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;// le decimos que permita tener sombra
    m.receiveShadow = true;// y que la reciba

  }
  //*/
}

Cloud.prototype.rotate = function(){ // la funcion de la rotacion de las nubes
  var l = this.mesh.children.length;
  for(var i=0; i<l; i++){
    var m = this.mesh.children[i];
    m.rotation.z+= Math.random()*.005*(i+1);
    m.rotation.y+= Math.random()*.002*(i+1);
  }
}

Ennemy = function(){ // funcion del enemigo (bolitas rojas)
  var geom = new THREE.TetrahedronGeometry(8,2); // le damos la geometria para que paresca  una bolita 
  var mat = new THREE.MeshPhongMaterial({ // le damos el material y el color
    color:Colors.orange,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat); // le agregamos el mesh que tendra la geometria y el material del enemigo
  this.mesh.castShadow = true; // que permita que tenga sombra
  this.angle = 0; // que tenga el angulo
  this.dist = 0; // y la distancia
}

EnnemiesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.ennemiesInUse = [];
}

EnnemiesHolder.prototype.spawnEnnemies = function(){
  var nEnnemies = game.level;

  for (var i=0; i<nEnnemies; i++){
    var ennemy;
    if (ennemiesPool.length) {
      ennemy = ennemiesPool.pop();
    }else{
      ennemy = new Ennemy();
    }

    ennemy.angle = - (i*0.1);
    ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;

    this.mesh.add(ennemy.mesh);
    this.ennemiesInUse.push(ennemy);
  }
}

EnnemiesHolder.prototype.rotateEnnemies = function(){
  for (var i=0; i<this.ennemiesInUse.length; i++){
    var ennemy = this.ennemiesInUse[i];
    ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;

    if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;

    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
    ennemy.mesh.rotation.z += Math.random()*.1;
    ennemy.mesh.rotation.y += Math.random()*.1;

    //var globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.ennemyDistanceTolerance){
      particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);

      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      game.planeCollisionSpeedX = 100 * diffPos.x / d;
      game.planeCollisionSpeedY = 100 * diffPos.y / d;
      ambientLight.intensity = 2;

      removeEnergy();
      i--;
    }else if (ennemy.angle > Math.PI){
      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      i--;
    }
  }
}

Particle = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0xB35CEE,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
  var _this = this;
  var _p = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var speed = .6+Math.random()*.2;
  TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(_p) _p.remove(_this.mesh);
      _this.mesh.scale.set(1,1,1);
      particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

  var nPArticles = density;
  for (var i=0; i<nPArticles; i++){
    var particle;
    if (particlesPool.length) {
      particle = particlesPool.pop();
    }else{
      particle = new Particle();
    }
    this.mesh.add(particle.mesh);
    particle.mesh.visible = true;
    var _this = this;
    particle.mesh.position.y = pos.y;
    particle.mesh.position.x = pos.x;
    particle.explode(pos,color, scale);
  }
}

Coin = function(){// creamos la funcion de los puntos  o lo del combustible azul
  var geom = new THREE.TetrahedronGeometry(5,0);// le damos la geometria para que paresca a aun tringulo
  var mat = new THREE.MeshPhongMaterial({// le damos el material y el color que sera un azul
    color:0xB35CEE,
    shininess:0,
    specular:0xffffff,

    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);// aqui le damos el mesh que tendra la geometria y el material de los puntos
  this.mesh.castShadow = true; // que tenga sombra
  this.angle = 0;// un angulo
  this.dist = 0;// distancia en cada uno
}

CoinsHolder = function (nCoins){ // al tocarse se llenara el conbustible
  this.mesh = new THREE.Object3D();
  this.coinsInUse = [];
  this.coinsPool = [];
  for (var i=0; i<nCoins; i++){
    var coin = new Coin();
    this.coinsPool.push(coin);
  }
}

CoinsHolder.prototype.spawnCoins = function(){ 
  // el movimiento o velocidad de los coins cuando corra el juego
  var nCoins = 1 + Math.floor(Math.random()*10);
  var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
  var amplitude = 10 + Math.round(Math.random()*10);
  for (var i=0; i<nCoins; i++){
    var coin;
    if (this.coinsPool.length) {
      coin = this.coinsPool.pop();
    }else{
      coin = new Coin();
    }
    this.mesh.add(coin.mesh);
    this.coinsInUse.push(coin);
    coin.angle = - (i*0.02);
    coin.distance = d + Math.cos(i*.5)*amplitude;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
  }
}
 // la funcion de la rotacion de los puntos
CoinsHolder.prototype.rotateCoins = function(){ // la funcion de la rotacion de los puntos
  for (var i=0; i<this.coinsInUse.length; i++){
    var coin = this.coinsInUse[i];
    if (coin.exploding) continue;
    coin.angle += game.speed*deltaTime*game.coinsSpeed;
    if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
    coin.mesh.rotation.z += Math.random()*.1;
    coin.mesh.rotation.y += Math.random()*.1;

    //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.coinDistanceTolerance){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
      addEnergy();
      i--;
    }else if (coin.angle > Math.PI){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}


// Modelos 3D
var sea;
var airplane;

function createPlane(){
  airplane = new AirPlane();
  airplane.mesh.scale.set(.25,.25,.25);
  airplane.mesh.position.y = game.planeDefaultHeight;
  scene.add(airplane.mesh);
}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -game.seaRadius;
  scene.add(sea.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -game.seaRadius;
  scene.add(sky.mesh);
}

function createCoins(){

  coinsHolder = new CoinsHolder(20);
  scene.add(coinsHolder.mesh)
}

function createEnnemies(){
  for (var i=0; i<10; i++){
    var ennemy = new Ennemy();
    ennemiesPool.push(ennemy);
  }
  ennemiesHolder = new EnnemiesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(ennemiesHolder.mesh)
}

function createParticles(){
  for (var i=0; i<10; i++){
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(particlesHolder.mesh)
}

function loop(){

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

  if (game.status=="playing"){

    // Add energy coins every 100m;
    if (Math.floor(game.distance)%game.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn){
      game.coinLastSpawn = Math.floor(game.distance);
      coinsHolder.spawnCoins();
    }

    if (Math.floor(game.distance)%game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate){
      game.speedLastUpdate = Math.floor(game.distance);
      game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
    }


    if (Math.floor(game.distance)%game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn){
      game.ennemyLastSpawn = Math.floor(game.distance);
      ennemiesHolder.spawnEnnemies();
    }

    if (Math.floor(game.distance)%game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate){
      game.levelLastUpdate = Math.floor(game.distance);
      game.level++;
      fieldLevel.innerHTML = Math.floor(game.level);

      game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel*game.level
    }


    updatePlane();
    updateDistance();
    updateEnergy();
    game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
    game.speed = game.baseSpeed * game.planeSpeed;

  }else if(game.status=="gameover"){
    game.speed *= .99;
    airplane.mesh.rotation.z += (-Math.PI/2 - airplane.mesh.rotation.z)*.0002*deltaTime;
    airplane.mesh.rotation.x += 0.0003*deltaTime;
    game.planeFallSpeed *= 1.05;
    airplane.mesh.position.y -= game.planeFallSpeed*deltaTime;

    if (airplane.mesh.position.y <-200){
      showReplay();
      game.status = "waitingReplay";

    }
  }else if (game.status=="waitingReplay"){

  }


  airplane.propeller.rotation.x +=.2 + game.planeSpeed * deltaTime*.005;
  sea.mesh.rotation.z += game.speed*deltaTime;//*game.seaRotationSpeed;

  if ( sea.mesh.rotation.z > 2*Math.PI)  sea.mesh.rotation.z -= 2*Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;

  coinsHolder.rotateCoins();
  ennemiesHolder.rotateEnnemies();

  sky.moveClouds();
  sea.moveWaves();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function updateDistance(){
  game.distance += game.speed*deltaTime*game.ratioSpeedDistance;
  fieldDistance.innerHTML = Math.floor(game.distance);
  var d = 502*(1-(game.distance%game.distanceForLevelUpdate)/game.distanceForLevelUpdate);
  levelCircle.setAttribute("stroke-dashoffset", d);

}

var blinkEnergy=false;

function updateEnergy(){
  game.energy -= game.speed*deltaTime*game.ratioSpeedEnergy;
  game.energy = Math.max(0, game.energy);
  energyBar.style.right = (100-game.energy)+"%";
  energyBar.style.backgroundColor = (game.energy<50)? "#f25346" : "#68c3c0";

  if (game.energy<30){
    energyBar.style.animationName = "blinking";
  }else{
    energyBar.style.animationName = "none";
  }

  if (game.energy <1){
    game.status = "gameover";
  }
}

function addEnergy(){
  game.energy += game.coinValue;
  game.energy = Math.min(game.energy, 100);
}

function removeEnergy(){
  game.energy -= game.ennemyValue;
  game.energy = Math.max(0, game.energy);
}



function updatePlane(){

  game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
  var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
  var targetX = normalize(mousePos.x,-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);

  game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
  targetX += game.planeCollisionDisplacementX;


  game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
  targetY += game.planeCollisionDisplacementY;

  airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*deltaTime*game.planeMoveSensivity;
  airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*deltaTime*game.planeMoveSensivity;

  airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*deltaTime*game.planeRotXSensivity;
  airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*deltaTime*game.planeRotZSensivity;
  var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
  camera.fov = normalize(mousePos.x,-1,1,40, 80);
  camera.updateProjectionMatrix ()
  camera.position.y += (airplane.mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity;

  game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
  game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
  game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
  game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;

  airplane.pilot.updateHairs();
}

function showReplay(){
  replayMessage.style.display="block";
}

function hideReplay(){
  replayMessage.style.display="none";
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;

function init(event){

  // UI

  fieldDistance = document.getElementById("distValue");
  energyBar = document.getElementById("energyBar");
  replayMessage = document.getElementById("replayMessage");
  fieldLevel = document.getElementById("levelValue");
  levelCircle = document.getElementById("levelCircleStroke");

  resetGame();
  createScene();

  createLights();
  createPlane();
  createSea();
  createSky();
  createCoins();
  createEnnemies();
  createParticles();

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  loop();
}

window.addEventListener('load', init, false);
