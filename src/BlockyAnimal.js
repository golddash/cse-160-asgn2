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
g_tailAngle = 0;
g_leftEarAngle = 0;
g_rightEarAngle = 0;

g_leftArmAnimation = false;
g_leftHandAnimation = false;
g_rightArmAnimation = false;
g_rightHandAnimation = false;
g_tailAnimation = false;
g_leftEarAnimation = false;
g_rightEarAnimation = false;

g_globalAngleX = 0;
g_globalAngleZ = 0;

function addActionsForHtmlUI() {
  // Camera angle
  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderAllShapes();
    });
    // Camera angle X
    document.getElementById("angleXSlide").addEventListener('mousemove', function () { g_globalAngleX = this.value; renderAllShapes(); });
    // Camera angle Z
    document.getElementById("angleZSlide").addEventListener('mousemove', function () { g_globalAngleZ = this.value; renderAllShapes(); });

  // Left arm slider
  document.getElementById("leftArmSlide").addEventListener("mousemove", function () {
    g_leftArmAngle = this.value;
    renderAllShapes();
  });

  // Feft arm button
  document.getElementById("leftArmOn").onclick = function () {
    g_leftArmAnimation = true;
  };

  document.getElementById("leftArmOff").onclick = function () {
    g_leftArmAnimation = false;
  };

  // Left hand slider
  document.getElementById("leftHandSlide").addEventListener("mousemove", function () {
    g_leftHandAngle = this.value;
    renderAllShapes();
  });

  // Left hand button
  document.getElementById("leftHandOn").onclick = function () {
    g_leftHandAnimation = true;
  };

  document.getElementById("leftHandOff").onclick = function () {
    g_leftHandAnimation = false;
  };
  
  // Right arm slider
  document.getElementById("rightArmSlide").addEventListener("mousemove", function () {
    g_rightArmAngle = this.value;
    renderAllShapes();
  });
  
  // Right arm button
  document.getElementById("rightArmOn").onclick = function () {
    g_rightArmAnimation = true;
  };
  
  document.getElementById("rightArmOff").onclick = function () {
    g_rightArmAnimation = false;
  };
  
  // Right hand slider
  document.getElementById("rightHandSlide").addEventListener("mousemove", function () {
    g_rightHandAngle = this.value;
    renderAllShapes();
  });

  // Right hand button
  document.getElementById("rightHandOn").onclick = function () {
    g_rightHandAnimation = true;
  };
  
  document.getElementById("rightHandOff").onclick = function () {
    g_rightHandAnimation = false;
  };
  
  // Tail slider
  document.getElementById("tailSlide").addEventListener("mousemove", function () {
    g_tailAngle = this.value;
    renderAllShapes();
  });

  // Tail button
  document.getElementById("tailOn").onclick = function () {
    g_tailAnimation = true;
  };
  document.getElementById("tailOff").onclick = function () {  
    g_tailAnimation = false;
  }

  // left ear slider
  document.getElementById("leftEarSlide").addEventListener("mousemove", function () {
    g_leftEarAngle = this.value;
    renderAllShapes();
  });

  // left ear button
  document.getElementById("leftEarOn").onclick = function () {
    g_leftEarAnimation = true;
  };
  document.getElementById("leftEarOff").onclick = function () {  
    g_leftEarAnimation = false;
  }
  
  // shift click

  canvas.addEventListener("click", function (ev) {
    if (ev.shiftKey) {
      g_tailAnimation = true;
      g_leftEarAnimation = true;
      
    }
  });

  canvas.addEventListener('mousemove', function(ev) {
    // Calculate rotation angles based on mouse position
    let xRotation = ev.clientY / canvas.height * 360; // Map y-position to x-rotation (X-axis)
    let yRotation = ev.clientX / canvas.width * 360; // Map x-position to y-rotation (Y-axis)
    
    // Update global rotation angles
    g_globalAngle = yRotation; // X-axis rotation
    g_globalAngleX = xRotation; // Y-axis rotation
    g_globalAngleZ = 0; // Z-axis rotation (assuming Z-axis rotation is not controlled by mouse)
  });

  document.getElementById("resetButton").addEventListener("click", function() {
    // Reset global angle variables to initial values
    g_globalAngle = 0;
    g_globalAngleX = 0;
    g_globalAngleZ = 0;

});

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
  if (g_rightArmAnimation) {
    g_rightArmAngle = 30 * Math.sin(g_seconds * 2 * Math.PI);
  }
  
  if (g_rightHandAnimation) {
    g_rightHandAngle = 30 * Math.sin(g_seconds * 2 * Math.PI);
  }
  
  if (g_tailAnimation) {
    g_tailAngle = 30 * Math.sin(g_seconds * 2 * Math.PI);
  }

  if (g_leftEarAnimation) {
    g_leftEarAngle = 30 * Math.sin(g_seconds * 2 * Math.PI);
  }
  
}


function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);

  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);




  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Back of Fox Body
  var foxBack = new Cube();
  foxBack.color = [0.6, 0.3, 0.1, 1];
  foxBack.matrix.translate(0, -0.6, 0.0);
  foxBack.matrix.rotate(0, 1, 0, 0);
  foxBack.matrix.rotate(0, 0, 0, 1);
  foxBack.matrix.scale(0.5,0.7,0.2);
  foxBack.matrix.translate(-0.5,0,0);
  foxBack.render();

  // Front of Fox Body
  var foxFront = new Cube();
  foxFront.color = [0.95, 0.8, 0.6, 1.0];
  foxFront.matrix.translate(0, -0.6, -0.20);
  foxFront.matrix.rotate(0, 1, 0, 0);
  foxFront.matrix.rotate(0, 0, 0, 1);
  var attachHead = new Matrix4(foxFront.matrix);
  foxFront.matrix.scale(0.5,0.7,0.2);
  foxFront.matrix.translate(-0.5,0,0);
  foxFront.render();

  // Head of Fox
  var foxHead = new Cube();
  foxHead.color = [0.6,0.3,0.1,1];
  foxHead.matrix = attachHead;
  foxHead.matrix.translate(0, .70, -0.05);
  foxHead.matrix.rotate(0, 0, 0, 1);
  foxHead.matrix.scale(.5, .40, .5);
  foxHead.matrix.translate(-.5, 0, -0.001)
  foxHead.render();

  // Tail of Fox
  var foxTail = new Cube();
  foxTail.color = [0.4, 0.2, 0.1, 1];
  var tailMatrix = new Matrix4(foxFront.matrix);
  foxTail.matrix = tailMatrix;
  foxTail.matrix.translate(0.4, 0.2, 2.0);
  foxTail.matrix.rotate(g_tailAngle, 0, 1, 0);
  foxTail.matrix.rotate(10, 1, 0, 0);
  foxTail.matrix.scale(.2, .2, 2);
  foxTail.render();

  // Left Arm of Fox
  var foxLeftArm = new Cube();
  foxLeftArm.color = [0.6, 0.3, 0.1, 1];
  var leftArmMatrix = new Matrix4(foxFront.matrix);
  foxLeftArm.matrix = leftArmMatrix;
  foxLeftArm.matrix.translate(0.8, .70, 0.5);
  foxLeftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
  foxLeftArm.matrix.rotate(-25, 0, 0, 1);
  foxLeftArm.matrix.scale(.59, .23, 1);
  foxLeftArm.render();

  // Left Hand of Fox
  var foxLeftHand = new Cube();
  foxLeftHand.color = [0.4, 0.2, 0.1, 1];
  foxLeftHand.matrix = leftArmMatrix; 
  foxLeftHand.matrix.translate(1.0, -0.1, 0.01);
  foxLeftHand.matrix.scale(.5, 1.2, .97);
  foxLeftHand.matrix.rotate(g_leftHandAngle,0,1,0);
  foxLeftHand.render();

  // Right Arm of Fox
  var foxRightArm = new Cube();
  foxRightArm.color = [0.6, 0.3, 0.1, 1];
  var rightArmMatrix = new Matrix4(foxFront.matrix);
  foxRightArm.matrix = rightArmMatrix;
  foxRightArm.matrix.translate(-0.1, .7, 0.7);
  foxRightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
  foxRightArm.matrix.rotate(-25, 0, 0, -1);
  foxRightArm.matrix.scale(.23, .59, 1);
  foxRightArm.render();

  // Right Hand of Fox
  var foxRightHand = new Cube();
  foxRightHand.color = [0.4, 0.2, 0.1, 1];
  foxRightHand.matrix = rightArmMatrix; 
  foxRightHand.matrix.translate(-0.1, 1, 0.01);
  foxRightHand.matrix.scale(1.2, 0.4, .97);
  foxRightHand.matrix.rotate(g_rightHandAngle,0,1,0);
  //foxRightHand.matrix.rotate(0,0,1,0);
  foxRightHand.render();

  // Left Leg of Fox
  var foxLeftLeg = new Cube();
  foxLeftLeg.color = [0.4, 0.2, 0.1, 1];
  foxLeftLeg.matrix.translate(0, -.6, -0.10)
  foxLeftLeg.matrix.rotate(0, 0, 0, 1);
  foxLeftLeg.matrix.scale(0.2, 0.11, .2);
  foxLeftLeg.matrix.translate(-1.30, -1.1, -0.9);
  foxLeftLeg.render();

  // Right Leg of Fox
  var foxRightLeg = new Cube();
  foxRightLeg.color = [0.4, 0.2, 0.1, 1];
  foxRightLeg.matrix.translate(0.07, -.61, -0.29)
  foxLeftLeg.matrix.rotate(0, 0, 0, 1);
  foxRightLeg.matrix.scale(0.2, 0.11, .2);
  foxRightLeg.matrix.translate(0,-1,0);
  foxRightLeg.render();

  // Left Ear of Fox
  var foxLeftEar = new Cone();
  foxLeftEar.color = [0.4, 0.2, 0.1, 1];
  foxLeftEar.matrix = attachHead;
  foxLeftEar.matrix.translate(-0.3, .50, 0);
  foxLeftEar.matrix.rotate(g_leftEarAngle,2,0,0);
  foxLeftEar.matrix.rotate(270, 1, 0, 0);
  
  foxLeftEar.matrix.scale(.15, .15, .8);
  foxLeftEar.matrix.translate(3.4, -4, 0.34);
  foxLeftEar.render();

  // Right Ear of Fox
  var foxRightEar = new Cone();
  foxRightEar.color = [0.4, 0.2, 0.1, 1];
  foxRightEar.matrix = attachHead;
  foxRightEar.matrix.translate(0.8, 8, -0.2);
  foxRightEar.matrix.rotate(1, 1, 0, 0);
  foxRightEar.matrix.scale(1, 2, 1);
  foxRightEar.matrix.translate(3.4, -4, 0.34);
  foxRightEar.render();
  

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