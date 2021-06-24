(function(){

    let program, programInfo, gl;
    let tx, ty, tz, rx, ry, rz, sx, sy, sz, fF;
    let drawMode;
    function makeRadian(deg){
        return deg * Math.PI /180;
    }

    function setCameraMatrix(){
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        return m4.perspective(fF, aspect, zNear, zFar);
    }

    function setAnimationMatrix(u_matrix){
        //1. 행렬 생성
        u_matrix = m4.multiply(u_matrix, m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400));
        u_matrix = m4.translate(u_matrix, tx, ty, tz);
        u_matrix = m4.xRotate(u_matrix, makeRadian(rx));
        u_matrix = m4.yRotate(u_matrix, makeRadian(ry));
        u_matrix = m4.zRotate(u_matrix, makeRadian(rz));
        u_matrix = m4.scale(u_matrix, sx, sy, sz);

        return u_matrix;
    }

    function draw(){
        //TODO vao
        //1. vao 생성
        let vao = gl.createVertexArray();

        //2. bind vertexArrayObject
        gl.bindVertexArray(vao);

        //TODO 큐브
        //1. 버퍼 생성
        let cubData = createCubCoord();
        let cubBuf = gl.createBuffer();

        //2. 바인딩
        gl.bindBuffer(gl.ARRAY_BUFFER, cubBuf);

        //3. 바인딩 포인터를 통한 복사
        gl.bufferData(gl.ARRAY_BUFFER, cubData, gl.STATIC_DRAW);

        //4. attribute에 전달할 buffer 설정
        gl.enableVertexAttribArray(programInfo.attribLocations.a_position);
        let numberComponents = 3;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.vertexAttribPointer(programInfo.attribLocations.a_position, numberComponents, type, normalize, stride, offset);

        //TODO 색상
        //1. 버퍼 생성
        let colorData = createColorCoord();
        let colorBuf = gl.createBuffer();

        //2. 바인딩
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);

        //3. 바인딩 포인터를 통한 복사
        gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

        //4. attribute에 전달할 buffer 설정
        gl.enableVertexAttribArray(programInfo.attribLocations.a_color);
        numberComponents = 3;
        type = gl.UNSIGNED_BYTE;
        normalize = true;
        stride = 0;
        offset = 0;
        gl.vertexAttribPointer(programInfo.attribLocations.a_color, numberComponents, type, normalize, stride, offset);

        //TODO camera
        let u_matrix = setCameraMatrix();

        //TODO animation
        u_matrix = setAnimationMatrix(u_matrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.u_matrix, false, u_matrix);

        //TODO 그리기
        //1. canvas 크기 리사이즈 및 뷰포트 재조정
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //2. canvas 컬러 및 깊이 픽셀 초기화
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //3. DEPTH_TEST(깊이 픽셀 적용)
        gl.enable(gl.DEPTH_TEST);

        //4. 사용할 프로그램 선택
        gl.useProgram(programInfo.program);

        //5. 사용할 vertexArray 선택
        gl.bindVertexArray(vao);

        //6. 그리기
        gl.drawArrays(drawMode, 0, 16 * 6);
    }

    function searchDataLocation(program){
        gl.useProgram(program);

        return {
            program: program,
            attribLocations: {
               a_position: gl.getAttribLocation(program, "a_position"),
               a_color: gl.getAttribLocation(program, "a_color")
            },
            uniformLocations: {
                u_matrix: gl.getUniformLocation(program, "u_matrix"),
            }
        }
    }

    function createProgram(){
        let canvas = document.getElementById("canvas");
        gl = canvas.getContext("webgl2");
        if (!gl) {
            alert("webgl2 를 가지고 올 수 없습니다.");
            return null;
        }
        const vertexShaderSource = readTextFile("./shader/vertex.glsl");
        const fragmentShaderSource = readTextFile("./shader/fragment.glsl");
        return webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
    }

    function changeUIDataValue(data_id, value){
        switch (data_id) {
            case "tx":
                tx = value;
                break;
            case "ty":
                ty = value;
                break;
            case "tz":
                tz = value;
                break;
            case "rx":
                rx = value;
                break;
            case "ry":
                ry = value;
                break;
            case "rz":
                rz = value;
                break;
            case "sx":
                sx = value;
                break;
            case "sy":
                sy = value;
                break;
            case "sz":
                sz = value;
                break;
            case "fF":
                fF = value;
                break;
            default:
                console.log("잘못된 data-id");
        }
    }

    function setAnimationValue(e){
        let data_id = e.target.dataset.id;
        let value = e.target.value;

        changeUIDataValue(data_id, value);
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
            draw();
        }
    }

    function manageEvent(){
        let animationUi = document.querySelector(".animation-ui");
        animationUi.addEventListener("input", function(e){
            setAnimationValue(e);
            draw();
        });

        let drawModeBtn = document.querySelector(".select-mode");
        drawModeBtn.addEventListener("click", changeModeOfDraw);

        window.addEventListener("resize", draw);
    }

    function setValue(){
        let dataList = document.getElementsByClassName("data");
        for(let i = 0; i <dataList.length; i++){
            let data = dataList[i];
            let data_id = data.dataset.id;
            let value = data.value;
            changeUIDataValue(data_id, value);
        }
        // dataList.forEach(function(data){
        //     let data_id = data.dataset.id;
        //     let value = data.value;
        //     changeUIDataValue(data_id, value);
        // });
    }

    function init(){
        program = createProgram();
        programInfo = searchDataLocation(program);
        drawMode = gl.TRIANGLES;
        setValue();
        manageEvent();
        draw();
    }

    init();
})();