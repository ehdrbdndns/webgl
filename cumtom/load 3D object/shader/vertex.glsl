#version 300 es

in vec4 a_position;
uniform mat4 u_matrix;

in vec4 a_color;
out vec4 v_color;

void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
}
