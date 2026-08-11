import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from './../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";


export class WaterAMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '水体材质A';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};


        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#75e3ff") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.85 };
        this.uniforms.sizeMul = uniforms.sizeMul !== undefined ? { value: uniforms.sizeMul } : { value: 2.8 };
        this.uniforms.alphaMul = uniforms.alphaMul !== undefined ? { value: uniforms.alphaMul } : { value: 0.8 };
        this.uniforms.noiseBrightness = uniforms.noiseBrightness !== undefined ? { value: uniforms.noiseBrightness } : { value: 0.05 };
        this.uniforms.noisePow = uniforms.noisePow !== undefined ? { value: uniforms.noisePow } : { value: 6 };
        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = "WaterAMaterial";

    }
    toJSON() {
        const data = {};

        data.name = this.name;
        data.shaderType = this.shaderType;
        data.transparent = this.transparent;
        data.side = this.side;
        data.depthTest = this.depthTest;
        data.depthWrite = this.depthWrite;

        const uniforms = {};
        data.uniforms = uniforms;
        uniforms.color = getColorString(this.uniforms.color.value);
        uniforms.opacity = this.uniforms.opacity.value;
        uniforms.sizeMul = this.uniforms.sizeMul.value;
        uniforms.alphaMul = this.uniforms.alphaMul.value;
        uniforms.noiseBrightness = this.uniforms.noiseBrightness.value;
        uniforms.noisePow = this.uniforms.noisePow.value;
        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }


    toUniformNode() {

        const uniforms = {};
        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });
        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider',range: [0,1] });
        uniforms.sizeMul = new DataAgent(this.uniforms.sizeMul.value,{ label: 'sizeMul',inputType: 'number' });
        uniforms.alphaMul = new DataAgent(this.uniforms.alphaMul.value,{ label: 'alphaMul',inputType: 'slider_input',range: [0,1] });
        uniforms.noiseBrightness = new DataAgent(this.uniforms.noiseBrightness.value,{ label: '噪声亮度',inputType: 'slider_input',range: [0.01,0.2] });
        uniforms.noisePow = new DataAgent(this.uniforms.noisePow.value,{ label: '噪声指数',inputType: 'number' });

        return uniforms;
    }

    createVerTexShader() {
        return `
        varying vec3 vViewPosition;
        varying vec4 mPosition;
        varying vec3 mNormal;
        varying vec2 st;
        #include <common>
        #include <uv_pars_vertex>
        
        #include <normal_pars_vertex>
        #include <logdepthbuf_pars_vertex>
        void main() {
            #include <uv_vertex>
            #include <beginnormal_vertex>
            #include <defaultnormal_vertex>
            #include <normal_vertex>
            #include <begin_vertex>
           mNormal = normal;
          mPosition = modelMatrix * vec4( position, 1.0 );
          st = uv;
            #include <project_vertex>
            #include <logdepthbuf_vertex>
            vViewPosition = - mvPosition.xyz;
            #include <worldpos_vertex>
        }

        `;
    }
    createFragmentShader() {
        return `

        

        uniform float uElapsedTime;
        uniform vec3 color;
        uniform float opacity;
        uniform float sizeMul;
        uniform float alphaMul;
        uniform float noiseBrightness;
        uniform float noisePow;
        varying vec2 st;

        #define LAYERS 4

        //Colors
        #define WATER_COLOR vec4(0.0, 0.8, 0.8, 0.5)

        //Image size and displacement
        #define UV_MUL 3.0
        #define UV_DISPLACEMENT_STRENGTH 0.15
        #define UV_DISPLACEMENT_SIZE 5.0

        //Animation
        #define WATER_SPEED 0.06
        #define ANIMATION_SPEED 0.35


        uniform float uOpacity;
        float hash1_2(vec2 x)
{
 	return fract(sin(dot(x, vec2(52.127, 61.2871))) * 521.582);
}

vec2 hash2_2(vec2 x)
{
    return fract(sin(x * mat2x2(20.52, 24.1994, 70.291, 80.171)) * 492.194);
}

//Simple interpolated noise
vec2 noise2_2(vec2 uv)
{
    vec2 f = smoothstep(0.0, 1.0, fract(uv));

 	vec2 uv00 = floor(uv);
    vec2 uv01 = uv00 + vec2(0,1);
    vec2 uv10 = uv00 + vec2(1,0);
    vec2 uv11 = uv00 + 1.0;
    vec2 v00 = hash2_2(uv00);
    vec2 v01 = hash2_2(uv01);
    vec2 v10 = hash2_2(uv10);
    vec2 v11 = hash2_2(uv11);

    vec2 v0 = mix(v00, v01, f.y);
    vec2 v1 = mix(v10, v11, f.y);
    vec2 v = mix(v0, v1, f.x);

    return v;
}

vec2 rotate(vec2 point, float deg)
{
 	float s = sin(deg);
    float c = cos(deg);
    return mat2x2(s, c, -c, s) * point;
}

//Cell center from point on the grid
vec2 voronoiPointFromRoot(vec2 root, float deg)
{
  	vec2 point = hash2_2(root) - 0.5;
    float s = sin(deg);
    float c = cos(deg);
    point = mat2x2(s, c, -c, s) * point;
    point += root + 0.5;
    return point;
}

float degFromRootUV(vec2 uv)
{
 	return uElapsedTime * ANIMATION_SPEED * (hash1_2(uv) + 0.2);
}

//x - voronoi coordinates (grid step = 1)
float voronoi(vec2 uv)
{
    vec2 rootUV = floor(uv);
    float deg = degFromRootUV(rootUV);
    vec2 pointUV = voronoiPointFromRoot(rootUV, deg);

    vec2 tempRootUV;	//Used in loop only
    vec2 tempPointUV;	//Used in loop only
    vec2 closestPointUV = pointUV;
    float minDist = 2.0;
    float dist = 2.0;
    for (float x = -1.0; x <= 1.0; x+=1.0)
    {
     	for (float y = -1.0; y <= 1.0; y+=1.0)
        {
         	tempRootUV = rootUV + vec2(x, y);
            deg = (uElapsedTime * hash1_2(tempRootUV) * ANIMATION_SPEED);
            tempPointUV = voronoiPointFromRoot(tempRootUV, deg);

            dist = distance(uv, tempPointUV);
            if(dist < minDist)
            {
             	closestPointUV = tempPointUV;
               	minDist = dist;
            }
        }
    }

    return minDist;
}

//Layered voronoi noise
float fractVoronoi(vec2 uv, float sizeMul, float alphaMul, int layers)
{
 	float noise = 0.0;
    float size = 1.0;
    float alpha = 1.0;
    vec2 uvOffset; //Used in loop only
    for(int i = 0; i < layers; i++)
    {
        uvOffset = hash2_2(vec2(size, alpha)) * uElapsedTime * WATER_SPEED;
        noise += pow(voronoi((uv + uvOffset) * size) * alpha + noiseBrightness, noisePow);
        size *= sizeMul;
        alpha *= alphaMul;
    }

    noise *= (1.0 - alphaMul)/(1.0 - pow(alphaMul, float(layers)));
    return noise;
}


        #include <logdepthbuf_pars_fragment>

    void main() {
                    #include <logdepthbuf_fragment>

         vec2 vSt = st;
    vSt *= 1.5;
    float x =  1.0; // 0.65
    vec2 noise2D = noise2_2(vSt * UV_DISPLACEMENT_SIZE) * UV_DISPLACEMENT_STRENGTH;
    float fractVoro = fractVoronoi(st + noise2D, sizeMul, alphaMul, LAYERS);
    float res = smoothstep(-0.2, 0.3, fractVoro) * x;
    gl_FragColor = vec4(res,res,res,res-0.1) * vec4(color.rgb,opacity) + fractVoro;
    	

    }

        `;
    }
}


