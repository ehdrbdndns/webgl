(function () {
    let vertexShaderSource = `#version 300 es
    
    in vec2 a_position;
    in vec2 a_texCoord;
    
    uniform vec2 u_resolution;
    
    out vec2 v_texCoord;
    
    void main(){
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        
        v_texCoord = a_texCoord;
    }`;

    let fragmentShaderSource = `#version 300 es
    
    precision highp float;
    
    uniform sampler2D u_image;
    
    in vec2 v_texCoord;
    
    out vec4 outColor;
    
    void main(){
        outColor = texture(u_image, v_texCoord);
    }`;

    //쉐이더 프로그램의 정보를 담는 객체
    let shaderProgram;

    let programInfo = {}, canvas, gl;

    function setRectangle(gl, x, y, width, height){
        let x1 = x;
        let x2 = x + width;
        let y1 = y;
        let y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
    }

    function bindBuffer(image) {
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        gl.enableVertexAttribArray(programInfo.attributeLocations.a_position);
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        let size = 2;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.vertexAttribPointer(programInfo.attributeLocations.a_position, size, type, normalize, stride, offset);

        setRectangle(gl, 0, 0, image.width, image.height);

        gl.enableVertexAttribArray(programInfo.attributeLocations.a_texCoord);
        let texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);

        size = 2;
        type = gl.FLOAT;
        normalize = false;
        stride = 0;
        offset = 0;
        gl.vertexAttribPointer(programInfo.attributeLocations.a_texCoord, size, type, normalize, stride, offset);

        let texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        let mipLevel = 0;
        let internalFormat = gl.RGBA;
        let srcFormat = gl.RGBA;
        let srcType = gl.UNSIGNED_BYTE;
        gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, image);

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        gl.bindVertexArray(vao);

        gl.uniform2f(programInfo.uniformLocations.u_resolution, gl.canvas.width, gl.canvas.height);
        gl.uniform1i(programInfo.uniformLocations.u_image, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function init() {
        canvas = document.getElementById("canvas");
        gl = canvas.getContext("webgl2");
        if (!gl) {
            alert("webgl2 를 가지고 올 수 없습니다.");
            return null;
        }

        shaderProgram = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
        programInfo = {
            program: shaderProgram,
            attributeLocations: {
                a_position: gl.getAttribLocation(shaderProgram, "a_position"),
                a_texCoord: gl.getAttribLocation(shaderProgram, "a_texCoord")
            },
            uniformLocations: {
                u_resolution: gl.getUniformLocation(shaderProgram, "u_resolution"),
                u_image: gl.getUniformLocation(shaderProgram, "u_image")
            }
        };
    }

    function render(image) {
        init();
        bindBuffer(image);
    }

    function main() {
        const image = new Image();
        image.src = "./img/leaves.jpg";
        image.onload = function () {
            render(image);
        };
    }

    main();
})();