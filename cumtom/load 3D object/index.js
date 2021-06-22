(function(){

    let program, programInfo, gl;

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

        //TODO uniform
        //1. 행렬 생성
        let u_matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);

        // //2. 애니메이션 적용
        u_matrix = m4.translate(u_matrix, 300, 200, 1);
        u_matrix = m4.yRotate(u_matrix, -100);

        //3. uniform 전송
        gl.uniformMatrix4fv(programInfo.uniformLocations.u_matrix, false, u_matrix);

        //TODO 그리기
        //1. canvas 크기 리사이즈 및 뷰포트 재조정
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //2. canvas 컬러 및 깊이 픽셀 초기화
        gl.clear(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //3. CULL 설정(정면만 보기)
        gl.enable(gl.CULL_FACE);

        //4. DEPTH_TEST(깊이 픽셀 적용)
        gl.enable(gl.DEPTH_TEST);

        //5. 사용할 프로그램 선택
        gl.useProgram(programInfo.program);

        //6. 사용할 vertexArray 선택
        gl.bindVertexArray(vao);

        //7. 그리기
        gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
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
        canvas = document.getElementById("canvas");
        gl = canvas.getContext("webgl2");
        if (!gl) {
            alert("webgl2 를 가지고 올 수 없습니다.");
            return null;
        }
        const vertexShaderSource = readTextFile("./shader/vertex.glsl");
        const fragmentShaderSource = readTextFile("./shader/fragment.glsl");
        return webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
    }

    function init(){
        program = createProgram();
        programInfo = searchDataLocation(program);
        draw();
    }

    init();
})();