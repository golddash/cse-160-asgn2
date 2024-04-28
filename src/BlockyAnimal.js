// Kevin Chen 4/28/24

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
   }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Const
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global for UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_numSegments = 6;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
g_yellowAnimation = false;
g_magentaAnimation = false;

g_leftArmAngle = 0;
g_rightArmAngle = 0;
g_leftHandAngle = 0;
g_rightHandAngle = 0;
g_leftLegAngle = 0;
g_rightLegAngle = 0;

g_leftArmAnimation = false;
g_leftHandAnimation = false;

function addActionsForHtmlUI() {
  // Camera angle
  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderAllShapes();
    });

  document.getElementById("leftArmSlide").addEventListener("mousemove", function () {
    g_leftArmAngle = this.value;
    renderAllShapes();
  });

  document.getElementById("leftArmOn").onclick = function () {
    g_leftArmAnimation = true;
  };

  document.getElementById("leftArmOff").onclick = function () {
    g_leftArmAnimation = false;
  };


  document.getElementById("leftHandSlide").addEventListener("mousemove", function () {
    g_leftHandAngle = this.value;
    renderAllShapes();
  });

  document.getElementById("leftHandOn").onclick = function () {
    g_leftHandAnimation = true;
  };

  document.getElementById("leftHandOff").onclick = function () {
    g_leftHandAnimation = false;
  };
  
  

}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;

  // Drag mouse to draw
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapeList = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point = new Point();

  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_numSegments;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

  //renderAllShapes();
  requestAnimationFrame(tick);
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {

  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles()
{
  if (g_leftArmAnimation){
    g_leftArmAngle = 30 * Math.sin(g_seconds * 2 * Math.PI);
  }

  if (g_leftHandAnimation){
    g_leftHandAngle = 30 * Math.sin(g_seconds * 2 * Math.PI);
  }

  
}


function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

 var foxBack = new Cube();
  foxBack.color = [0.6, 0.3, 0.1, 1];
  foxBack.matrix.translate(0, -0.6, 0.0);
  foxBack.matrix.rotate(0, 1, 0, 0);
  foxBack.matrix.rotate(0, 0, 0, 1);
  foxBack.matrix.scale(0.5,0.7,0.2);
  foxBack.matrix.translate(-0.5,0,0);
  foxBack.render();

  var foxFront = new Cube();
  foxFront.color = [1,1,1,1];
  foxFront.matrix.translate(0, -0.6, -0.20);
  foxFront.matrix.rotate(0, 1, 0, 0);
  foxFront.matrix.rotate(0, 0, 0, 1);
  var attachHead = new Matrix4(foxFront.matrix);
  foxFront.matrix.scale(0.5,0.7,0.2);
  foxFront.matrix.translate(-0.5,0,0);
  foxFront.render();

  var foxHead = new Cube();
  foxHead.color = [0.6,0.3,0.1,1];
  foxHead.matrix = attachHead;
  foxHead.matrix.translate(0, .70, -0.05);
  foxHead.matrix.rotate(0, 0, 0, 1);
  foxHead.matrix.scale(.5, .40, .5);
  foxHead.matrix.translate(-.5, 0, -0.001)
  foxHead.render();

  var foxTail = new Cube();
  foxTail.color = [0.4, 0.2, 0.1, 1];
  var tailMatrix = new Matrix4(foxFront.matrix);
  foxTail.matrix = tailMatrix;
  foxTail.matrix.translate(0.4, 0.2, 2.0);
  foxTail.matrix.rotate(10, 1, 0, 0);
  foxTail.matrix.scale(.2, .2, 2);
  foxTail.render();

  var foxLeftArm = new Cube();
  foxLeftArm.color = [0.6, 0.3, 0.1, 1];
  var leftArmMatrix = new Matrix4(foxFront.matrix);
  foxLeftArm.matrix = leftArmMatrix;
  foxLeftArm.matrix.translate(0.8, .70, 0.5);
  foxLeftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
  foxLeftArm.matrix.rotate(-25, 0, 0, 1);
  foxLeftArm.matrix.scale(.59, .23, 1);
  foxLeftArm.render();

  var foxLeftHand = new Cube();
  foxLeftHand.color = [0.4, 0.2, 0.1, 1];
  foxLeftHand.matrix = leftArmMatrix; //connected to left arm
  foxLeftHand.matrix.translate(1.0, -0.1, 0.01);
  foxLeftHand.matrix.scale(.5, 1.2, .97);
  foxLeftHand.matrix.rotate(g_leftHandAngle,0,1,0);
  foxLeftHand.render();

  var foxRightArm = new Cube();
  foxRightArm.color = [0.6, 0.3, 0.1, 1];
  var rightArmMatrix = new Matrix4(foxFront.matrix);
  foxRightArm.matrix = rightArmMatrix;
  foxRightArm.matrix.translate(-0.8, .70, -0.5);
  foxLeftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
  foxLeftArm.matrix.rotate(-25, 0, 0, 1);
  foxLeftArm.matrix.scale(.59, .23, 1);
  foxRightArm.render();


  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "theFPS");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}