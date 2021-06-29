#version 300 es

in vec4 a_position;
in vec3 a_normal;
out vec3 v_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

void main() {
    gl_Position = u_worldViewProjection * a_position;
    gl_PointSize = 10.0;
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
}
