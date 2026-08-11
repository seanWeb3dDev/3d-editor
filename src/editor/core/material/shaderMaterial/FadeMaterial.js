import * as THREE from "three";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";


export class FadeMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '渐隐材质';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};


        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#9DB1D4") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.85 };
        this.uniforms.strength = uniforms.strength !== undefined ? { value: uniforms.strength } : { value: 3 };
        this.uniforms.direction = uniforms.direction !== undefined ? { value: uniforms.direction } : { value: 1 };
        this.uniforms.fadeDirection = uniforms.direction !== undefined ? { value: uniforms.fadeDirection } : { value: 1 };

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = "FadeMaterial";

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
        uniforms.strength = this.uniforms.strength.value;
        uniforms.direction = this.uniforms.direction.value;
        uniforms.fadeDirection = this.uniforms.fadeDirection.value;

        return data;
    }


    toUniformNode() {
        const uniforms = {};

        const directionOptions = [
            { label: '横向',value: 1 },
            { label: '纵向',value: 0 }
        ];
        const fadeDirection = [
            { label: '正向',value: 1 },
            { label: '反向',value: 0 }
        ];
        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });
        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider',range: [0,1] });
        uniforms.strength = new DataAgent(this.uniforms.strength.value,{ label: '强度',inputType: 'number' });
        uniforms.direction = new DataAgent(this.uniforms.direction.value,{ label: '轴向',inputType: 'select',options: directionOptions });
        uniforms.fadeDirection = new DataAgent(this.uniforms.fadeDirection.value,{ label: '渐隐方向',inputType: 'select',options: fadeDirection });
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
    uniform float strength;
    uniform float direction;
    uniform float fadeDirection;
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


    float dir = mix(1.0 - st.x, 1.0 - st.y, direction);
    float fadeDir = mix(1.0 - dir,dir,fadeDirection);
    gl_FragColor = vec4(color,pow(fadeDir,strength));
        }`;
    }
}


