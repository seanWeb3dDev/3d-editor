import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from './../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";


export class WaterBMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '水体材质B';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};


        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#2ab2d5") }; //#2ab2d5
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.85 };
        this.uniforms.uSeg = uniforms.uSeg !== undefined ? { value: uniforms.uSeg } : { value: 1 };

        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = "WaterBMaterial";

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
        uniforms.uSeg = this.uniforms.uSeg.value;

        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }


    toUniformNode() {

        const uniforms = {};
        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });
        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider',range: [0,1] });
        uniforms.uSeg = new DataAgent(this.uniforms.uSeg.value,{ label: 'uSeg',inputType: 'number' });

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
        uniform float uSeg;

        varying vec2 st;


        //Colors
        #define WATER_COLOR vec4(0.0, 0.8, 0.8, 0.5)

        
        #define TAU 6.28318530718
        #define MAX_ITER 5

        #include <common>
        #include <packing>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <normal_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>


        void main(){
                    #include <logdepthbuf_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
             #include <dithering_fragment>
            float time = uElapsedTime * .5+23.0;
    
    
            vec2 q = st * uSeg;
                vec2 p = mod(q*TAU, TAU)-250.0;
    
    
             vec2 i = vec2(p);
             float c = 1.0;
             float inten = .005;
    
    
             for (int n = 0; n < MAX_ITER; n++)
             {
              float t = time * (1.0 - (3.5 / float(n+1)));
              i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
              c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
             }
             c /= float(MAX_ITER);
             c = 1.17-pow(c, 1.4);
             vec3 fColor = vec3(pow(abs(c), 8.0));
    
    
             fColor = clamp(fColor + color, 0.0, 1.0);
            //  fColor = clamp(fColor + vec3(0.0, 0.35, 0.5), 0.0, 1.0);
    
    
    
               gl_FragColor = vec4(fColor, opacity);
        }

       

        `;
    }
}


