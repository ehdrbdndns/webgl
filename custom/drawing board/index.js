(function() {
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = aVertexPosition;
      gl_PointSize = 3.0;
      vColor = aVertexColor;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      gl_FragColor = vColor;
    }
  `;

  let gl, vertexBuffers = [],
    colorBuffers = [],
    programInfo, colorCount = 0,
    isDraw = false;
  let color = [Math.random(), Math.random(), Math.random(), 1.0],
    resetBtn = document.getElementById('btn-reset'),
    modeBtn = document.querySelector(".select-mode"),
    canvas = document.getElementById('canvas'),
    vertexSize = 0,
    drawMode;

  function drawColor() {
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorBuffers), gl.STATIC_DRAW);

    let colorPosition = programInfo.attribLocations.vertexColor;
    gl.vertexAttribPointer(colorPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorPosition);
  }

  function drawVertex() {
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBuffers), gl.STATIC_DRAW);

    let vertexPosition = programInfo.attribLocations.vertexPosition;
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    vertexSize = vertexBuffers.length / 2;
  }

  function drawInit() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);
  }

  function drawScene() {
    drawInit();
    drawVertex();
    drawColor();

    gl.drawArrays(drawMode, 0, vertexSize);
  }

  function mouseMove(event) {
    let x = event.clientX,
      y = event.clientY,
      rect = event.target.getBoundingClientRect(),
      midX = canvas.width / 2,
      midY = canvas.height / 2;

    x = ((x - rect.x) - midX) / midX;
    y = (midY - (y - rect.y)) / midY;

    let buffer = {
      x: x,
      y: y
    };

    if ((colorCount % 100) === 0) {
      color = [Math.random(), Math.random(), Math.random(), 1.0];
    }

    colorCount++;

    colorBuffers.push(color[0]);
    colorBuffers.push(color[1]);
    colorBuffers.push(color[2]);
    colorBuffers.push(color[3]);

    vertexBuffers.push(buffer.x);
    vertexBuffers.push(buffer.y);

    drawScene();
  }

  function reset() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    colorBuffers.length = 0;
    vertexBuffers.length = 0;
    colorCount = 0;
  }

  function controlActionOfDraw(mode) {
    console.log(mode);
    switch (mode) {
      case "on":
        isDraw = true;
        break;
      case "off":
        isDraw = false;
        break;
    }
  }

  function changeModeOfDraw(e) {
    const targetBtn = e.target;
    if (targetBtn.parentNode.classList.contains("select-mode")) {
      const selectedBtn = document.querySelector(".select-mode li.selected");
      selectedBtn.classList.remove("selected");

      targetBtn.classList.add("selected");
      switch (targetBtn.innerHTML) {
        case "Points":
          drawMode = gl.POINTS;
          break;
        case "Lines":
          drawMode = gl.LINES;
          break;
        case "Line_strip":
          drawMode = gl.LINE_STRIP;
          break;
        case "Line_Loop":
          drawMode = gl.LINE_LOOP;
          break;
        case "Triangles":
          drawMode = gl.TRIANGLES;
          break;
        case "Triangle_strip":
          drawMode = gl.TRIANGLE_STRIP;
          break;
        case "Triangle_fan":
          drawMode = gl.TRIANGLE_FAN;
          break;
        default:
          alert("해당 모드가 없습니다.");
      }
      drawScene();
    }
  }

  function action() {
    canvas.addEventListener("mousedown", function(){
        controlActionOfDraw("on");
    });
    canvas.addEventListener("mousemove", function(e) {
      if (isDraw) {
        mouseMove(e);
      }
    });
    canvas.addEventListener("mouseup", function(){
      controlActionOfDraw("off");
    });
    resetBtn.addEventListener("click", function() {
      reset();
      drawScene();
    });
    modeBtn.addEventListener("click", changeModeOfDraw)
  }

  function createProgram(gl, vsSource, fsSource) {
    //vsShader
    const vsShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsShader, vsSource);
    gl.compileShader(vsShader);

    //fsShader
    const fsShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsShader, fsSource);
    gl.compileShader(fsShader);

    let program = gl.createProgram();
    gl.attachShader(program, vsShader);
    gl.attachShader(program, fsShader);
    gl.linkProgram(program);

    return program;
  }

  function init() {
    gl = canvas.getContext('webgl');

    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    const shaderProgram = createProgram(gl, vsSource, fsSource);

    programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor")
      },
      uniformLocations: {
        modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
      }
    };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function main() {
    init();
    action();
  }

  main();
})();
