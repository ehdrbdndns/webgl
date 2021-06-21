(function () {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uModelViewMatrix * aVertexPosition;
      // gl_Position = aVertexPosition;
      vColor = aVertexColor;
    }
  `;

    const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
      // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

    const canvas = document.getElementById('canvas'),
        gl = canvas.getContext('webgl');

    const randomColorBuffer = [
      Math.random(), Math.random(), Math.random(), 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0
    ];

    let programInfo, vertexArrayList = [], colorArrayList = [],
        angle = 0, vertexSize = 0;

    function setAngle() {
        angle += 0.5;
        angle = angle % 360;
        let radian = Math.PI * angle / 180.0;
        let modelMatrix = mat4.fromRotation(mat4.create(), radian, vec3.fromValues(0, 0, 1));
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelMatrix);
    }

    function setColor() {
        randomColorBuffer.forEach(function (buffer) {
            {
                colorArrayList.push(buffer);
            }
        });

        let colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArrayList), gl.STATIC_DRAW);

        let colorPosition = programInfo.attribLocations.vertexColor;
        gl.vertexAttribPointer(colorPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorPosition);
    }

    function setVertex() {
        let triangleBuffer = [
            0.0, 0.0,
            0.5, 0.0,
            0.0, 0.5
        ];

        triangleBuffer.forEach(function (buffer) {
            vertexArrayList.push(buffer);
        });

        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArrayList), gl.STATIC_DRAW);

        let vertexPosition = programInfo.attribLocations.vertexPosition;
        gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, true, 0, 0);
        gl.enableVertexAttribArray(vertexPosition);

        vertexSize = vertexArrayList.length / 2;
    }

    function drawInit() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(programInfo.program);
    }

    function draw() {
        setColor();
        setVertex();
        setAngle();
        drawInit();
        gl.drawArrays(gl.TRIANGLES, 0, vertexSize);
        requestAnimationFrame(draw);
    }

    function createProgram(gl, vsSource, fsSource) {
        //vsShader
        const vsShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vsShader, vsSource);
        gl.compileShader(vsShader);

        //fsShader
        const fsShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fsShletader, fsSource);
        gl.compileShader(fsShader);

        let program = gl.createProgram();
        gl.attachShader(program, vsShader);
        gl.attachShader(program, fsShader);
        gl.linkProgram(program);

        return program;
    }

    function init() {
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
        drawInit();
        draw();
    }

    main();
})();
