import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class FlowNoiseMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '流动噪声纹理';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#23946b") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.35 };
        this.uniforms.speed = uniforms.speed !== undefined ? { value: uniforms.speed } : { value: 1 };
        this.uniforms.direction = uniforms.direction !== undefined ? { value: uniforms.direction } : { value: 1 };
        this.uniforms.flowDirection = uniforms.flowDirection !== undefined ? { value: uniforms.flowDirection } : { value: 0 };
        this.uniforms.intensity = uniforms.intensity !== undefined ? { value: new THREE.Vector2(...uniforms.intensity) } : { value: new THREE.Vector2(1,1) };

        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'FlowNoiseMaterial';

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
        uniforms.speed = this.uniforms.speed.value;
        uniforms.direction = this.uniforms.direction.value;

        uniforms.flowDirection = this.uniforms.flowDirection.value;
        uniforms.intensity = this.uniforms.intensity.value;
        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }

    toUniformNode() {

        const uniforms = {};

        const directionOptions = [
            { label: '横向',value: 1 },
            { label: '纵向',value: 0 }
        ];

        const flowDirection = [
            { label: '正向',value: 1 },
            { label: '反向',value: 0 }
        ];


        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });

        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider_input',range: [0,1] });

        uniforms.speed = new DataAgent(this.uniforms.speed.value,{ label: '速度',inputType: 'number' });

        uniforms.direction = new DataAgent(this.uniforms.direction.value,{ label: '路径方向',inputType: 'select',options: directionOptions });

        uniforms.flowDirection = new DataAgent(this.uniforms.flowDirection.value,{ label: '流动方向',inputType: 'select',options: flowDirection });

        uniforms.intensity = new DataAgent(this.uniforms.intensity.value,{ label: '纹理密度',inputType: 'vec2' });

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
        uniform float opacity;

        varying vec3 vViewPosition;
            uniform vec3 color;
            varying vec4 mPosition;
            varying vec3 mNormal;
            varying vec2 st;
            uniform float uElapsedTime;
            uniform float speed;
            uniform float direction;
            uniform vec2 intensity;
            uniform float flowDirection;

            
        
        #include <common>
        #include <packing>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <normal_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>

        float randomA(vec2 st){
            return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453);
          }
          float noiseA(vec2 st) {
          vec2 i = floor(st.xy);
          vec2 f = fract(st.xy);
          f = smoothstep(0.0,1.0,f);
          float a = randomA(i);
          float b = randomA(i + vec2(1.0,0.0));
          float c = randomA(i + vec2(0.0,1.0));
          float d = randomA(i + vec2(1.0,1.0));
          float mixN = mix(a,b,f.x); // 相当于a * (1.0 - f.x) + b * f.x
          float z = a * (1.0 - f.x) + b * f.x + (c - a) * f.y * (1.0 - f.x) + (d - b) * f.y * f.x;
          return z;
          }
          float fbmA(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 2.0;
          for(int i=0; i<6; i++) {
            value += amplitude*noiseA(st);
            st *= frequency;
            amplitude *= 0.5;
          }
          return value;
          }

        void main() {
            #include <logdepthbuf_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
             #include <dithering_fragment>
             vec2 nst = mix(st, 1.0 - st,flowDirection) * intensity;
             vec2 newSt = mix(vec2(nst.x, nst.y + (uElapsedTime * speed)),vec2(nst.x + (uElapsedTime * speed), nst.y),direction);
             float z =fbmA(fbmA(fbmA(newSt) + newSt) + newSt); 

            vec3 fColor = mix(
                color,
                vec3(0.8,0.8,0.891), // 白
                clamp(z*z*z*1.2,0.0,1.0)
               );

               vec4 water = vec4(fColor*(z*z*z+0.6*z*z+0.5*z),opacity);

           gl_FragColor = water;
        }
        
        `;
    }
}
