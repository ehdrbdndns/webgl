(function(){
    let shaderProgramInfo, gl, a_positionLocation, a_normalLocation, programLocation;

    let fieldOfViewDeg = 60, fRotation = 0;

    function degToRad(d){
        return d * Math.PI / 180;
    }

    function draw(){
        //TODO 초기화
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.useProgram(programLocation);

       //TODO 뷰 생성
        //1. projection 행렬
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let projectionMatrix = m4.perspective(degToRad(fieldOfViewDeg), aspect, zNear, zFar);

        //2. 카메라 뷰 생성
        let camera = [100, 150, 200];
        let target = [0, 35, 0];
        let up = [0, 1, 0];
        let cameraMatrix = m4.lookAt(camera, target, up);

        let viewMatrix = m4.inverse(cameraMatrix);
        let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        //3. animation 적용
        let matrix = m4.yRotate(viewProjectionMatrix, degToRad(fRotation));
        matrix = m4.translate(matrix, -200, 100, -100);
        matrix = m4.xRotate(matrix, degToRad(180));

        //4. uniform에 복사
        gl.uniformMatrix4fv(shaderProgramInfo.programInfo.uniformLocations.u_matrix, false, matrix);

        //TODO 조명 생성
        //1. 조명 위치 설정(3차원)
        let lightPosition = [0.5, 0.7, 0.1];
        //2. uniform에 복사
        gl.uniform3fv(shaderProgramInfo.programInfo.uniformLocations.u_reverseLightDirection, m4.normalize(lightPosition));

        //TODO 단일 컬러 생성
        //1. 컬러값 설정
        let color = [0.2, 1, 0.2, 1];
        //2. uniform에 복사사
        gl.uniform4fv(shaderProgramInfo.programInfo.uniformLocations.u_color, color);

        //TODO 그리기
        let primitiveType = gl.TRIANGLES;
        let offset = 0;
        let count = 16 * 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    function setBuffer(){
        //TODO VAO
        //1. VAO 생성
        let vao = gl.createVertexArray();
        //2. 바인딩
        gl.bindVertexArray(vao);

        //TODO 'F'생성
        //1. 버퍼 생성
        let fBuffer = gl.createBuffer();
        //2. 바인딩
        gl.bindBuffer(gl.ARRAY_BUFFER, fBuffer);
        //3. 바인딩 포인터에 복사
        gl.bufferData(gl.ARRAY_BUFFER, createFBuffer(), gl.STATIC_DRAW);
        //4. attrib 전송
        gl.enableVertexAttribArray(a_positionLocation);
        let numberComponents = 3;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.vertexAttribPointer(a_positionLocation, numberComponents, type, normalize, stride, offset);

        //TODO 법선 생성
        //1. 버퍼 생성
        let nBuffer = gl.createBuffer();
        //2. 바인딩
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        //3. 바인딩 포인터에 복사
        gl.bufferData(gl.ARRAY_BUFFER, createFNormals(), gl.STATIC_DRAW);
        //4. attrib 전송
        gl.enableVertexAttribArray(a_normalLocation);
        numberComponents = 3;
        type = gl.FLOAT;
        normalize = false;
        stride = 0;
        offset = 0;
        gl.vertexAttribPointer(a_normalLocation, numberComponents, type, normalize, stride, offset);
    }

    function windowResize(){
        window.addEventListener("resize", function(){
            draw();
        })
    }

    function main(){
        shaderProgramInfo = initWebgl();
        gl = shaderProgramInfo.gl;
        a_positionLocation = shaderProgramInfo.programInfo.attribLocations.a_position;
        a_normalLocation = shaderProgramInfo.programInfo.attribLocations.a_normal;
        programLocation = shaderProgramInfo.program;

        setBuffer();
        windowResize();
        draw();
    }

    main();
})();