import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class RadarMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '雷达特效';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#0fec12") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 0.5 };
        this.uniforms.speed = uniforms.speed !== undefined ? { value: uniforms.speed } : { value: 1 };
        this.uniforms.background = uniforms.background !== undefined ? { value: uniforms.background } : { value: true };
        this.uniforms.number = uniforms.number !== undefined ? { value: uniforms.number } : { value: 4 };
        this.uniforms.strength = uniforms.strength !== undefined ? { value: uniforms.strength } : { value: 0.45 };

        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'RadarMaterial';

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
        uniforms.strength = this.uniforms.strength.value;
        uniforms.number = this.uniforms.number.value;
        uniforms.background = this.uniforms.background.value;

        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }

    toUniformNode() {

        const uniforms = {};


        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });

        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'number' });

        uniforms.speed = new DataAgent(this.uniforms.speed.value,{ label: '扫描速度',inputType: 'number' });

        uniforms.number = new DataAgent(this.uniforms.number.value,{ label: '圈数',inputType: 'number' });

        uniforms.strength = new DataAgent(this.uniforms.strength.value,{ label: '范围',inputType: 'slider',range: [0,1] });

        uniforms.background = new DataAgent(this.uniforms.background.value,{ label: '底色',inputType: 'switch' });

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


        #include <logdepthbuf_pars_fragment>

        uniform float opacity;

        varying vec3 vViewPosition;
            uniform vec3 color;
            varying vec4 mPosition;
            varying vec3 mNormal;
            varying vec2 st;
            uniform float uElapsedTime;
            uniform float speed;
            uniform bool background;
            uniform float strength;
            uniform float number;

            /**
             A very simple and basic navigation radar inspired from retro video games. This
             is mostly a result of my boredom. :p
             */
             
             #define PI 3.1415926535
             
             #define ROT(x) mat2(cos(x), -sin(x), sin(x), cos(x))
             
             #define BRIGHT_COLOR vec3(color*1.2)
             #define MEDIUM_COLOR vec3(color*0.7)
             #define DARK_COLOR vec3(color*0.3)
             
             #define RADAR_SIZE .9
             
             // hash function by Dave_Hoskins
             vec2 hash22(vec2 p)
             {
                 uvec2 q = uvec2(ivec2(p))*uvec2(1597334673U, 3812015801U);
                 q = (q.x ^ q.y) * uvec2(1597334673U, 3812015801U);
                 return vec2(q) * (1.0 / float(0xffffffffU));
             }
             
             // remaps value x from range [a, b] to range [c, d]
             float remap(float x, float a, float b, float c, float d)
             {
                 return (((x - a) / (b - a)) * (d - c)) + c;
             }
             
             // iq's 2d line sdf
             float line(vec2 p, vec2 a, vec2 b)
             {
                 vec2 pa = p-a, ba = b-a;
                 float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
                 return length( pa - ba*h );
             }
             
             // thanks FabriceNeyret2, for a more efficient circle function!
             float circle(vec2 p, float r, float t)
             {
                 //float or = r + t;
                 //return smoothstep(or, or-.01, length(p)) - smoothstep(r, r-.01, length(p));
                 return smoothstep(.01, -.01, abs(length(p) - r) - t * .5);
             }
             

             
             void main()
             {
                #include <logdepthbuf_fragment>

                 float asp = st.x / st.y;

                 vec2 vUv = st.xy*2.; // translate to the center
                 vUv += vec2(-1.0, -1.0);

                 
                 // rotate uv over time
                 vec2 rv = vUv * ROT(uElapsedTime*speed);
                 // polar angle
                 float theta = atan(rv.y, rv.x);
                 theta = remap(theta, -PI, PI, 0., 1./min(1., strength));
                 vec2 a = vec2(0.), b = vec2(-asp, 0.);
                 float aaLine = smoothstep(.007, 0., line(rv, a, b));
                 // circle mask for drawing the radar navigation cross-section
                 float radarArea = smoothstep(RADAR_SIZE, RADAR_SIZE - .01, length(vUv));
                 float radarCrossSec = max(0., (1. - theta - aaLine)) * radarArea;
                 
                 vec3 col = circle(vUv, RADAR_SIZE, .01) * BRIGHT_COLOR;
                 col += radarCrossSec * MEDIUM_COLOR;
                 float sr = RADAR_SIZE, rStep = RADAR_SIZE/number;
                 
                 int loop = int(number);
                 // draw inner circles
                 for (int i = 0; i < loop; ++i)
                 {
                     sr -= rStep;
                     col += circle(vUv, sr, .01) * DARK_COLOR;
                 }

                // draw inner line
                 col += smoothstep(.005, .004, line(vUv, vec2(0., -RADAR_SIZE),
                             vec2(0., RADAR_SIZE))) * DARK_COLOR;
                 col += smoothstep(.005, .004, line(vUv, vec2(-RADAR_SIZE, 0.),
                             vec2(RADAR_SIZE, 0.))) * DARK_COLOR;
                 
                //background color
                vec3 bg = DARK_COLOR * radarArea * .5;
                if(background == true){
                    col += bg;
                }
                float al = sign(col.x);
                 gl_FragColor = vec4(col, opacity*al);
             }
        
        `;
    }
}


