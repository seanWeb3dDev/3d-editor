import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class NoiseAMaterial extends THREE.ShaderMaterial {
  constructor(setting = {}) {
    super();

    this.name = setting.name ?? '分型布朗纹理A';
    this.transparent = setting.transparent ?? true;
    this.side = setting.side ?? THREE.FrontSide;
    this.depthTest = setting.depthTest ?? true;
    this.depthWrite = setting.depthWrite ?? true;

    const uniforms = setting.uniforms ?? {};

    this.uniforms.colorA = uniforms.colorA ? { value: new THREE.Color(uniforms.colorA) } : { value: new THREE.Color("#1a9eaa") };
    this.uniforms.colorB = uniforms.colorB ? { value: new THREE.Color(uniforms.colorB) } : { value: new THREE.Color("#aad37d") };
    this.uniforms.colorC = uniforms.colorC ? { value: new THREE.Color(uniforms.colorC) } : { value: new THREE.Color("#aaffff") };
    this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.35 };
    this.uniforms.speed = uniforms.speed !== undefined ? { value: uniforms.speed } : { value: 1 };
    this.uniforms.direction = uniforms.direction !== undefined ? { value: uniforms.direction } : { value: 1 };
    this.uniforms.intensity = uniforms.intensity !== undefined ? { value: uniforms.intensity } : { value: 5 };

    this.uniforms.uElapsedTime = elapsedTime;

    this.vertexShader = this.createVerTexShader();
    this.fragmentShader = this.createFragmentShader();

    this.shaderType = 'NoiseAMaterial';

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
    uniforms.colorA = getColorString(this.uniforms.colorA.value);
    uniforms.colorB = getColorString(this.uniforms.colorB.value);
    uniforms.colorC = getColorString(this.uniforms.colorC.value);
    uniforms.opacity = this.uniforms.opacity.value;
    uniforms.speed = this.uniforms.speed.value;
    uniforms.direction = this.uniforms.direction.value;

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



    uniforms.colorA = new DataAgent(this.uniforms.colorA.value,{ label: '暗部色',inputType: 'color' });
    uniforms.colorB = new DataAgent(this.uniforms.colorB.value,{ label: '亮部色',inputType: 'color' });
    uniforms.colorC = new DataAgent(this.uniforms.colorC.value,{ label: '整体色',inputType: 'color' });

    uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider_input',range: [0,1] });

    // uniforms.speed = new DataAgent(this.uniforms.speed.value,{ label: '速度' });

    uniforms.direction = new DataAgent(this.uniforms.direction.value,{ label: '纹理方向',inputType: 'select',options: directionOptions });

    uniforms.intensity = new DataAgent(this.uniforms.intensity.value,{ label: '纹理密度',inputType: 'number' });

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
            uniform vec3 colorA;
            uniform vec3 colorB;
            uniform vec3 colorC;
            varying vec4 mPosition;
            varying vec3 mNormal;
            varying vec2 st;
            uniform float uElapsedTime;
            uniform float speed;
            uniform float direction;
            uniform float intensity;

            #define ra 43758.5453


            
        
        #include <common>
        #include <packing>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <normal_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>

        float random(vec2 st){
            return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*ra);
          }
          float noise(vec2 st) {
          vec2 i = floor(st.xy);
          vec2 f = fract(st.xy);
          f = smoothstep(0.0,1.0,f);
          float a = random(i);
          float b = random(i + vec2(1.0,0.0));
          float c = random(i + vec2(0.0,1.0));
          float d = random(i + vec2(1.0,1.0));
          float mixN = mix(a,b,f.x); // 相当于a * (1.0 - f.x) + b * f.x
          float z = a * (1.0 - f.x) + b * f.x + (c - a) * f.y * (1.0 - f.x) + (d - b) * f.y * f.x;
          return z;
          }

          float fbmRotate(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 2.0;
            vec2 shift = vec2(100.0);
            mat2 rot = mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
            for(int i=0; i<6; i++) {
              value += amplitude*noise(st);
              st = rot * st * frequency + shift;
              amplitude *= 0.5;
            }
            return value;
          }

        void main() {
            #include <logdepthbuf_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
             #include <dithering_fragment>
             vec2 nst = mix(st, 1.0 - st,direction) * intensity;


            //  复杂分型函数
             vec2 q =vec2(0.0);
             q.x = fbmRotate(nst + 0.0 * uElapsedTime);
             q.y = fbmRotate(nst + 1.0 * uElapsedTime);
          
             vec2 p = vec2(0.0);
             p.x = fbmRotate(nst + 1.0 * q + vec2(1.7,9.2) + 0.15 * uElapsedTime);
             p.y = fbmRotate(nst + 1.0 * q + vec2(8.3,2.8) + 0.126 * uElapsedTime);
          
             float z = fbmRotate(nst + p);
             vec3 finalColor = vec3(0.0);
          
             finalColor = mix(
              // vec3(0.101,0.619,0.666),
              // vec3(0.666,0.827,0.491),
              colorA,
              colorB,
              clamp(z*z*4.0,0.0,1.0)
             );
             finalColor = mix(
              finalColor,
              vec3(0.0,0.0,0.16),
              clamp(length(q),0.0,1.0)
             );
          
             finalColor = mix(
              finalColor,
              // vec3(0.5,1.0,1.0),
              colorC,
              clamp(length(p.x),0.0,1.0)
             );
             
            gl_FragColor = vec4(finalColor*(z*z*z+0.6*z*z+0.5*z),opacity);


             
        }
        
        `;
  }
}
