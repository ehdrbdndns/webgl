(function(){
    let shaderProgramInfo, gl, a_positionLocation, a_normalLocation, programLocation;

    let objectRotateY, objectRotateX,
        cameraPositionX, cameraPositionY, cameraPositionZ,
        lightPositionX, lightPositionY, lightPositionZ, shininess, innerLimit, outerLimit;

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
        let fieldOfViewDeg = 60;
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let projectionMatrix = m4.perspective(degToRad(fieldOfViewDeg), aspect, zNear, zFar);

        //2. 카메라 뷰 생성
        let camera = [cameraPositionX, cameraPositionY, cameraPositionZ];
        let target = [0, 35, 0];
        let up = [0, 1, 0];
        let cameraMatrix = m4.lookAt(camera, target, up);

        let viewMatrix = m4.inverse(cameraMatrix);
        let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        //3. animation 적용
        let worldMatrix = m4.yRotation(degToRad(objectRotateY));
        worldMatrix = m4.xRotate(worldMatrix, degToRad(objectRotateX));
        worldMatrix = m4.translate(worldMatrix, -50, -75, -15);

        // object를 카메라 절두체 앞으로 위치시키고 animation 까지 적용
        let worldViewProjection = m4.multiply(viewProjectionMatrix, worldMatrix);

        // 법선 재설정
        let wordInverseMatrix = m4.inverse(worldMatrix);
        let wordInverseTransposeMatrix = m4.transpose(wordInverseMatrix);

        //4. u_viewWorldPosition(카메라) 전달
        gl.uniform3fv(shaderProgramInfo.programInfo.uniformLocations.u_viewWorldPosition, camera);

        //5. worldMarix 전달(object 위치)
        gl.uniformMatrix4fv(shaderProgramInfo.programInfo.uniformLocations.u_world, false, worldMatrix);

        //6. worldViewProjection 전달
        gl.uniformMatrix4fv(shaderProgramInfo.programInfo.uniformLocations.u_worldViewProjection, false, worldViewProjection);

        //7. world 전달(object 회전 시 조명도 동일하게 적용하기 위함)
        gl.uniformMatrix4fv(shaderProgramInfo.programInfo.uniformLocations.u_worldInverseTranspose, false, wordInverseTransposeMatrix);

        //8. shininess 전달(밝기)
        gl.uniform1f(shaderProgramInfo.programInfo.uniformLocations.u_shininess, shininess);

        //9. 빛 방향 설정
        let lightDirection = [0, 0, 1];
        gl.uniform3fv(shaderProgramInfo.programInfo.uniformLocations.u_lightDirection, lightDirection);

        //10. 빛 제한 범위 설정
        gl.uniform1f(shaderProgramInfo.programInfo.uniformLocations.u_innerLimit, Math.cos(innerLimit));
        gl.uniform1f(shaderProgramInfo.programInfo.uniformLocations.u_outerLimit, Math.cos(outerLimit));

        //TODO 조명 생성
        //1. 조명 위치 설정(3차원)
        let lightPosition = [lightPositionX, lightPositionY, lightPositionZ];
        // let lightPosition = [20, 30, 50];
        //2. uniform에 복사
        gl.uniform3fv(shaderProgramInfo.programInfo.uniformLocations.u_lightWorldPosition, lightPosition);

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

    function changeUIDataValue(data_id, value){
        switch (data_id) {
            case "ObjectRotateY":
                objectRotateY = value;
                break;
            case "ObjectRotateX":
                objectRotateX = value;
                break;
            case "CameraPositionX":
                cameraPositionX = value;
                break;
            case "CameraPositionY":
                cameraPositionY = value;
                break;
            case "CameraPositionZ":
                cameraPositionZ = value;
                break;
            case "LightPositionX":
                lightPositionX = value;
                break;
            case "LightPositionY":
                lightPositionY = value;
                break;
            case "LightPositionZ":
                lightPositionZ = value;
                break;
            case "Shininess":
                shininess = value;
                break;
            case "InnerLimit":
                innerLimit = degToRad(value);
                break;
            case "OuterLimit":
                outerLimit = degToRad(value);
                break;
            default:
                console.log("잘못된 data-id");
        }
    }

    function setAnimationValue(e){
        let data_id = e.target.dataset.id;
        let value = e.target.value;
        // e.target.parentNode.childNodes[0].innerText = value;

        changeUIDataValue(data_id, value);
    }

    function windowResize(){
        let animationUi = document.querySelector(".animation-ui");
        animationUi.addEventListener("input", function(e){
            setAnimationValue(e);
            draw();
        });

        window.addEventListener("resize", function(){
            draw();
        })
    }

    function setValue(){
        let dataList = document.getElementsByClassName("data");
        for(let i = 0; i <dataList.length; i++){
            let data = dataList[i];
            let data_id = data.dataset.id;
            let value = data.value;
            changeUIDataValue(data_id, value);
        }
    }

    function main(){
        shaderProgramInfo = initWebgl();
        gl = shaderProgramInfo.gl;
        a_positionLocation = shaderProgramInfo.programInfo.attribLocations.a_position;
        a_normalLocation = shaderProgramInfo.programInfo.attribLocations.a_normal;
        programLocation = shaderProgramInfo.program;

        setValue();
        setBuffer();
        windowResize();
        draw();
    }

    main();
})();