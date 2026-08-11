import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from './../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";


export class ArrowPathMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '箭头路径特效';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#23946b") };
        this.uniforms.background = uniforms.background === undefined ? { value: 1 } : { value: uniforms.background };
        this.uniforms.edgeColor = uniforms.edgeColor ? { value: new THREE.Color(uniforms.edgeColor) } : { value: new THREE.Color("#7800ff") };
        this.uniforms.edgeThickness = uniforms.edgeThickness === undefined ? { value: 1 } : { value: uniforms.edgeThickness };
        this.uniforms.arrowLength = uniforms.arrowLength === undefined ? { value: 0.8 } : { value: uniforms.arrowLength };
        this.uniforms.opacity = uniforms.opacity === undefined ? { value: 0.5 } : { value: uniforms.opacity };
        this.uniforms.speed = uniforms.speed === undefined ? { value: 1 } : { value: uniforms.speed };
        this.uniforms.number = uniforms.number === undefined ? { value: 2 } : { value: uniforms.number };
        this.uniforms.direction = uniforms.direction ? { value: uniforms.direction } : { value: 1 };
        this.uniforms.arrowDirection = uniforms.arrowDirection === undefined ? { value: 0 } : { value: uniforms.arrowDirection };


        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'ArrowPathMaterial';

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
        uniforms.background = this.uniforms.background.value;
        uniforms.edgeColor = getColorString(this.uniforms.edgeColor.value);
        uniforms.edgeThickness = this.uniforms.edgeThickness.value;
        uniforms.arrowLength = this.uniforms.arrowLength.value;
        uniforms.opacity = this.uniforms.opacity.value;
        uniforms.speed = this.uniforms.speed.value;
        uniforms.number = this.uniforms.number.value;
        uniforms.direction = this.uniforms.direction.value;
        uniforms.arrowDirection = this.uniforms.arrowDirection.value;

        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }

    toUniformNode() {

        const uniforms = {};

        const directionOptions = [
            { label: '横向',value: 1 },
            { label: '纵向',value: 2 }
        ];
        const arrowDirection = [
            { label: '正向',value: 1 },
            { label: '反向',value: 0 }
        ];

        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '底色',inputType: 'color' });

        uniforms.background = new DataAgent(this.uniforms.background.value,{ label: '底色明度',inputType: 'slider_input',range: [0,1] });

        uniforms.edgeColor = new DataAgent(this.uniforms.edgeColor.value,{ label: '箭头',inputType: 'color' });

        uniforms.edgeThickness = new DataAgent(this.uniforms.edgeThickness.value,{ label: '边缘宽度',inputType: 'slider_input',range: [0,1] });

        uniforms.arrowLength = new DataAgent(this.uniforms.arrowLength.value,{ label: '箭头长度',inputType: 'slider_input',range: [0,1] });

        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider_input',range: [0,1] });

        uniforms.speed = new DataAgent(this.uniforms.speed.value,{ label: '速度',inputType: 'number' });

        uniforms.number = new DataAgent(this.uniforms.number.value,{ label: '数量',inputType: 'number' });

        uniforms.direction = new DataAgent(this.uniforms.direction.value,{ label: '路径方向',inputType: 'select',options: directionOptions });

        uniforms.arrowDirection = new DataAgent(this.uniforms.arrowDirection.value,{ label: '箭头方向',inputType: 'select',options: arrowDirection });
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
            uniform float number;
            uniform vec3 edgeColor;
            uniform float direction;
            uniform float edgeThickness;
            uniform float arrowLength;
            uniform float background;
            uniform float arrowDirection;

            void rotate2d(inout vec2 v, float a) {
                mat2 m = mat2(cos(a), -sin(a), sin(a), cos(a));
                v = m * v;
               }
                float arrow(vec2 av) {
                 float line1L = 0.5;
                  float line1 = length(av - vec2(clamp(av.x, -line1L, line1L), 0.));
                  line1 = smoothstep(0.06, 0.05, line1);
         
                  vec2 rav = av;
                  rav.x -= line1L + 0.03; // 箭头初始位置
                  rotate2d(rav, 3.1415/1.54);
         
                  float arrowL = 0.83 * arrowLength; // 0.39 - 0.83
                  float line2 = length(rav - vec2(clamp(rav.x, 0., arrowL), 0.));
                  line2 = smoothstep(0.06, 0.05, line2);
         
                  rotate2d(rav, -3.1415 * 1.3 );
                  float line3 = length(rav - vec2(clamp(rav.x, 0., arrowL),0.));
                  line3 = smoothstep(0.06, 0.05, line3);
         
                  return clamp(line2 + line3 , 0., 1.);
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


             float p = number / 2.0; //线段段数

             
             vec2 dst = st;

             if(direction == 2.0){
                dst = vec2(st.y,st.x);
             }

             dst = mix(1.0 - dst, dst,arrowDirection);
             
             vec2 nst = (dst * 2.0)-1.0;
             vec2 vSt = vec2(fract(nst.x * p - uElapsedTime *speed), nst.y);
                 vec3 col;
                 float a = arrow(vSt) ;
                 vec3 cola = color;  //底色
                 vec3 colb = edgeColor;
                 col = mix(cola,colb,a);
       
                //  float al = 1.0;
                 float al = a + background;
                 if(abs(0.5 - dst.y) >= 0.4){
                   float s = smoothstep(0.4, 0.5,abs(0.5 - dst.y)) *edgeThickness;
                   col = mix(cola,colb,s);
                 }
                 gl_FragColor = vec4(col,al * opacity);
           

        }
        
        `;
    }
}


