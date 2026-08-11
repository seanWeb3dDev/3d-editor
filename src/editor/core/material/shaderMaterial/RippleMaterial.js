import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class RippleMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '波纹特效';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#23946b") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.5 };
        this.uniforms.speed = uniforms.speed !== undefined ? { value: uniforms.speed } : { value: 1 };
        this.uniforms.number = uniforms.number !== undefined ? { value: uniforms.number } : { value: 3 };


        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'RippleMaterial';

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
        uniforms.number = this.uniforms.number.value;

        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }

    toUniformNode() {

        const uniforms = {};

        const numberOptions = [
            { label: '低',value: 1 },
            { label: '中',value: 2 },
            { label: '高',value: 3 }
        ];

        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });

        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'number' });

        uniforms.speed = new DataAgent(this.uniforms.speed.value,{ label: '速度',inputType: 'number' });

        uniforms.number = new DataAgent(this.uniforms.number.value,{ label: '频率',inputType: 'select',options: numberOptions });

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
            uniform int number;

        vec3 RadarPing(in vec2 uv,  in float innerTail, 
            in float frontierBorder, in float timeResetSeconds, 
            in float speed, in float fadeDistance, float t)
        {
             float r = length(uv);
             float time = mod(t, timeResetSeconds) * speed;
            
             float circle;
   
             circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
             circle *= smoothstep(fadeDistance, 0.0, r); // fade to 0 after fadeDistance
                 
             return vec3(circle);
        }
        
        #include <common>
        #include <packing>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <normal_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>
        void main() {
            #include <logdepthbuf_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
             #include <dithering_fragment>


             vec2 vUv = st.xy*2.; // translate to the center
             vUv += vec2(-1.0, -1.0);
             
             vec3 final;
             // generate some radar pings
             float fadeDistance = 0.8;
             float resetTimeSec = 3.0;
             float radarPingSpeed = 0.25;
             vec2 greenPing = vec2(0.0, 0.0);
             int Z = int(number);
             for (int i = 0; i < Z; i++){
                float n = float(i);
                final += RadarPing(vUv, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, uElapsedTime * speed + n) * color;
             }
           
             //return the new color
             float al = sign(final.x);
             gl_FragColor = vec4(final,opacity*al);

        }
        
        `;
    }
}


