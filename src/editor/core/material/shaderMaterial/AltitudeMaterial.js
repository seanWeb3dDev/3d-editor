import * as THREE from "three";

import { DataAgent } from './../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class AltitudeMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '高度着色材质';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms.colorA = uniforms.colorA ? { value: new THREE.Color(uniforms.colorA) } : { value: new THREE.Color("red") };
        this.uniforms.colorB = uniforms.colorB ? { value: new THREE.Color(uniforms.colorB) } : { value: new THREE.Color("green") };
        this.uniforms.colorC = uniforms.colorC ? { value: new THREE.Color(uniforms.colorC) } : { value: new THREE.Color("blue") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.35 };

        this.uniforms.altitude = uniforms.altitude !== undefined ? { value: new THREE.Vector2(...uniforms.altitude) } : { value: new THREE.Vector2(1,0) };


        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'AltitudeMaterial';

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

        uniforms.altitude = [...this.uniforms.altitude.value];

        return data;
    }

    toUniformNode() {

        const uniforms = {};

        uniforms.colorA = new DataAgent(this.uniforms.colorA.value,{ label: '顶部颜色',inputType: 'color' });
        uniforms.colorB = new DataAgent(this.uniforms.colorB.value,{ label: '中部颜色',inputType: 'color' });
        uniforms.colorC = new DataAgent(this.uniforms.colorC.value,{ label: '底部颜色',inputType: 'color' });
        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider',range: [0,1] });
        uniforms.altitude = new DataAgent(this.uniforms.altitude.value,{ label: '高度区间',inputType: 'vec2' });
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
            uniform vec2 altitude;
            varying vec4 mPosition;
            varying vec3 mNormal;
            varying vec2 st;
         
        
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
    
             float p = clamp((mPosition.y - altitude.y) / (altitude.x - altitude.y),0.0,1.0);

             vec3 top = mix(colorB,colorA,(p - 0.5) * 2.0); // p大于0.5
             vec3 bot = mix(colorC,colorB,p * 2.0); // p小于0.5

             vec3 finalC = mix(top,bot,step(p,0.5));
        
        
           gl_FragColor = vec4(finalC,opacity);
        }
        
        `;
    }
}
