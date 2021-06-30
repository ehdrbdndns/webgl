#version 300 es

precision highp float;

in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

out vec4 outColor;

uniform vec4 u_color;
uniform float u_shininess;
uniform vec3 u_lightDirection;
uniform float u_innerLimit;
uniform float u_outerLimit;

void main() {
    vec3 normal = normalize(v_normal);

    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    //    float light = dot(normal, surfaceToLightDirection);
    float light = 0.0;
    float specular = 0.0;

    float dotFromDirection = dot(surfaceToLightDirection, -u_lightDirection);
    float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);
    light = inLight * dot(normal, surfaceToLightDirection);
    specular = inLight * pow(dot(normal, halfVector), u_shininess);

    outColor = u_color;
    outColor.rgb *= light;
    outColor.rgb += specular;
}
