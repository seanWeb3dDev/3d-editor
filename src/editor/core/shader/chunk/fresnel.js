import { ShaderChunk } from "three";
import { SHADER_UNIFORM,SHADER_END } from "../constant";


/**
 * 菲涅尔反射
 */

ShaderChunk.effect_uniform_fresnel = /* glsl */ `
#define USE_FRESNEL
uniform float strength;
`;

ShaderChunk.effect_fragment_fresnel = /* glsl */ `
#ifdef USE_FRESNEL

vec3 viewDir = normalize(cameraPosition - mPosition.xyz);
float intensity = 1.0 - dot( mNormal,viewDir);
gl_FragColor = vec4(diffuse,pow(intensity,strength));


#endif
`;

export const fresnel = {
    uniform: {
        shader: "effect_uniform_fresnel",
        location: SHADER_UNIFORM
    },
    chunk: {
        shader: "effect_fragment_fresnel",
        location: SHADER_END
    },
};