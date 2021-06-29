#version 300 es

precision highp float;

in vec3 v_normal;
in vec3 v_surfaceToLight;

out vec4 outColor;

uniform vec4 u_color;

void main() {
    vec3 normal = normalize(v_normal);

    vec3 surfaceToLight = normalize(v_surfaceToLight);

    float light = dot(normal, surfaceToLight);

    outColor = u_color;
    outColor.rgb *= light;
}
