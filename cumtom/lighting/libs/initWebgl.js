function createProgram(gl){
    const vertexShaderSource = readTextFile("./shader/vertex.glsl");
    const fragmentShaderSource = readTextFile("./shader/fragment.glsl");
    return webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
}

function searchDataLocation(gl, program){
    gl.useProgram(program);

    return {
        program: program,
        attribLocations: {
            a_position: gl.getAttribLocation(program, "a_position"),
            a_normal: gl.getAttribLocation(program, "a_normal")
        },
        uniformLocations: {
            u_matrix: gl.getUniformLocation(program, "u_matrix"),
            u_color: gl.getUniformLocation(program, "u_color"),
            u_reverseLightDirection: gl.getUniformLocation(program, "u_reverseLightDirection")
        }
    }
}

function initWebgl() {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl2");
    let programInfo, program;

    if (!gl) {
        alert("webgl2 를 가지고 올 수 없습니다.");
        return null;
    }

    program = createProgram(gl);
    programInfo = searchDataLocation(gl, program);

    console.log("hi~");

    return {
        gl: gl,
        program: program,
        programInfo: programInfo
    }
}