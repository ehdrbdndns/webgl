#version 300 es

in vec4 a_position;
in vec3 a_normal;

out vec3 v_normal;
out vec3 v_surfaceToLight;

uniform vec3 u_lightWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

void main() {
    gl_Position = u_worldViewProjection * a_position;

    v_normal = mat3(u_worldInverseTranspose) * a_normal;

    vec3 surfaceWorldPosition = (u_world * a_position).xyz;

    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
}
