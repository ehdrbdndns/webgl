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
  
    uniform float u_kernel[9];
    uniform float u_kernelWeight;
 
    in vec2 v_texCoord;
 
    out vec4 outColor;
     
    void main() {
      vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));
     
      vec4 colorSum =
          texture(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
          texture(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
          texture(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
          texture(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
          texture(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
          texture(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
          texture(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
          texture(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
          texture(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;
      outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
    }`;

    //쉐이더 프로그램의 정보를 담는 객체
    let programInfo = {}, canvas, gl, edgeDetectKernel, shaderProgram, kernelMode = "normal";

    function getKernelOption() {
        switch (kernelMode) {
            case "normal":
                edgeDetectKernel = [
                    0, 0, 0,
                    0, 1, 0,
                    0, 0, 0
                ];
                break;
            case "sharpen":
                edgeDetectKernel = [
                    0, -1, 0,
                    -1, 5, -1,
                    0, -1, 0
                ];
                break;
            case "blur":
                edgeDetectKernel = [
                    1, 1, 1,
                    1, 1, 1,
                    1, 1, 1
                ];
                break;
            case "edge_enhance":
                edgeDetectKernel = [
                    0, 0, 0,
                    -1, 1, 0,
                    0, 0, 0
                ];
                break;
            case "edge_detect":
                edgeDetectKernel = [
                    0, 1, 0,
                    1, -4, 1,
                    0, 1, 0
                ];
                break;
            case "emboss":
                edgeDetectKernel = [
                    -2, -1, 0,
                    -1, 1, 1,
                    0, 1, 2
                ];
                break;
            default:
                edgeDetectKernel = [
                    0, 0, 0,
                    0, 1, 0,
                    0, 0, 0
                ];
        }
    }

    function computeKernelWeight(kernel) {
        var weight = kernel.reduce(function (prev, curr) {
            return prev + curr;
        });
        return weight <= 0 ? 1 : weight;
    }

    function setRectangle(gl, x, y, width, height) {
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

        getKernelOption();

        gl.uniform1fv(programInfo.uniformLocations.u_kernel, edgeDetectKernel);
        gl.uniform1f(programInfo.uniformLocations.u_kernelWeight, computeKernelWeight(edgeDetectKernel));
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
                u_image: gl.getUniformLocation(shaderProgram, "u_image"),
                u_kernel: gl.getUniformLocation(shaderProgram, "u_kernel[0]"),
                u_kernelWeight: gl.getUniformLocation(shaderProgram, "u_kernelWeight")
            }
        };
    }

    function render(image) {
        init();
        bindBuffer(image);
    }

    function clickEventFromSelect(e){
        kernelMode = e.target.value;
        main();
    }

    function main() {
        let select = document.querySelector(".kernel-option");
        select.addEventListener("change", clickEventFromSelect);

        const image = new Image();
        image.src = "./img/leaves.jpg";
        image.onload = function () {
            render(image);
        };
    }

    main();
})();