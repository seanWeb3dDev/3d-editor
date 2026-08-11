import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class FlowLightMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '流光特效';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#23946b") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.35 };
        this.uniforms.speed = uniforms.speed !== undefined ? { value: uniforms.speed } : { value: 1 };
        this.uniforms.direction = uniforms.direction !== undefined ? { value: uniforms.direction } : { value: 1 };
        this.uniforms.number = uniforms.number !== undefined ? { value: uniforms.number } : { value: 1 };
        this.uniforms.flowDirection = uniforms.flowDirection === undefined ? { value: 0 } : { value: uniforms.flowDirection };

        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'FlowLightMaterial';

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
        uniforms.number = this.uniforms.number.value;
        uniforms.flowDirection = this.uniforms.flowDirection.value;
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

        uniforms.number = new DataAgent(this.uniforms.number.value,{ label: '条纹数量',inputType: 'number' });

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
            uniform float number;
            uniform float flowDirection;
        
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
             vec2 nst = mix(st, 1.0 - st,flowDirection);
             float h = fract(((1.0 - nst.x) * number - uElapsedTime) * speed);
             float v = fract(((1.0 - nst.y) * number - uElapsedTime) * speed);

             float dir = mix(h,v,direction);

           gl_FragColor = vec4(color,pow( dir,2.0)* opacity);
        }
        
        `;
    }
}
