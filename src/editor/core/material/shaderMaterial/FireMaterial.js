import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class FireMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '火焰特效材质';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;




        const uniforms = setting.uniforms ?? {};


        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#F4DD89") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 1 };
        this.uniforms.width = uniforms.width !== undefined ? { value: uniforms.width } : { value: 0.5 };


        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'FireMaterial';

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
        uniforms.width = this.uniforms.width.value;


        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }

    toUniformNode() {

        const uniforms = {};


        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });

        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider_input',range: [0,1] });

        uniforms.width = new DataAgent(this.uniforms.width.value,{ label: '宽度',inputType: 'slider',range: [0,1] });


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
            uniform float width;

    


            
        
        #include <common>
        #include <packing>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <normal_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>

        vec2 hash22(vec2 p) {
            vec3 p3 = fract(p.xyx * vec3(0.1031, 0.1030, 0.0973));
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.xx + p3.yz) * p3.zy);
        }

        float noise(vec2 p) {
            vec2 i = floor(p + (p.x + p.y) * 0.366025);
            vec2 a = p - i + (i.x + i.y) * 0.211324;
            float m = step(a.y, a.x); 
            vec2 o = vec2(m, 1.0 - m);
            vec2 b = a - o + 0.211324;
            vec2 c = a - 0.577351;
            vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
            vec3 n = h * h * h * h * 
                vec3(dot(a, hash22(i) - 0.5), 
                     dot(b, hash22(i + o) - 0.5), 
                     dot(c, hash22(i + 1.0) - 0.5));
            return dot(n, vec3(70));
        }

        float fbm(vec2 uv) {
            const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
            float f = 0.5 * noise(uv); uv = m * uv;
            f += 0.25 * noise(uv); uv = m * uv;
            f += 0.125 * noise(uv); uv = m * uv;
            f += 0.0625 * noise(uv); uv = m * uv;
            f += 0.03 * noise(uv); uv = m * uv;
            return f + 0.55;
        }


        void main() {
            #include <logdepthbuf_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
             #include <dithering_fragment>

             vec2 vUv = st.xy*2.; // translate to the center
             vUv += vec2(-1.0, -1.0);

             float d = fbm(vUv * 1.5 - vec2(0, uElapsedTime));
             float y = vUv.y * 0.5 + 0.5;
             float x = sqrt(y) * PI * 0.5;
             x = sin(x * 0.7) * cos(x);
             float w = abs(1.5 - width );
             float z = smoothstep(0.2*d*x, 0.7*d*d, x - sqrt(abs(vUv.x)) * abs(vUv.x) * w);
         
             d = smoothstep(0.0, 0.9+0.7*y*y*z, d);
             d *= z * z;

             vec3 col = vec3(d*sqrt(d)*color.r, d*d*d*color.g, d*d*d*d*color.b);
             z = max(0.0001, z);
             col *= vec3(3.1, 3.8 / (z * z), 2.5 / (z * z * z * z));
         
             gl_FragColor= vec4(col, z * opacity);
             

        }
        
        `;
    }
}
