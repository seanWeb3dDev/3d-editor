import * as THREE from "three";
import { elapsedTime } from "../constant";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";



export class AirFlowMaterial extends THREE.ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.name = setting.name ?? '气流特效';
        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? THREE.FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms.color = uniforms.color ? { value: new THREE.Color(uniforms.color) } : { value: new THREE.Color("#bab2b2") };
        this.uniforms.opacity = uniforms.opacity !== undefined ? { value: uniforms.opacity } : { value: 1 };
        this.uniforms.speed = uniforms.speed !== undefined ? { value: uniforms.speed } : { value: 12.8 };
        this.uniforms.number = uniforms.number !== undefined ? { value: uniforms.number } : { value: 38 };
        this.uniforms.flowDirection = uniforms.flowDirection === undefined ? { value: 0 } : { value: uniforms.flowDirection };

        this.uniforms.uElapsedTime = elapsedTime;

        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();

        this.shaderType = 'AirFlowMaterial';

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
        uniforms.flowDirection = this.uniforms.flowDirection.value;
        uniforms.uElapsedTime = 'elapsedTime';

        return data;
    }

    toUniformNode() {

        const uniforms = {};


        const flowDirection = [
            { label: '正向',value: 1 },
            { label: '反向',value: 0 }
        ];


        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });

        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider_input',range: [0,1] });

        uniforms.speed = new DataAgent(this.uniforms.speed.value,{ label: '速度',inputType: 'number' });

        uniforms.flowDirection = new DataAgent(this.uniforms.flowDirection.value,{ label: '流动方向',inputType: 'select',options: flowDirection });

        uniforms.number = new DataAgent(this.uniforms.number.value,{ label: '线条数量',inputType: 'number' });

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
            uniform float flowDirection;
            uniform int number;

            const float overallSpeed=12.8;
            const float gridSmoothWidth=.025;
            const float axisWidth=.25;
            const float majorLineWidth=.25;
            const float minorLineWidth=.125;
            const float majorLineFrequency=5.;
            const float minorLineFrequency=1.;
            const vec4 gridColor=vec4(.5);
            const float scale=4.; // 缩窄风柱

            const float minLineWidth=.32;
            const float maxLineWidth=.58;

            const float lineAmplitude=.02; // 线条振幅
            const float lineFrequency=.32;
            const float warpFrequency=.85;
            const float warpAmplitude=.04;
            const float offsetFrequency=.5;
            const float minOffsetSpread=.32;
            const float maxOffsetSpread=.32;

            #define drawCircle(pos,radius,coord)smoothstep(radius+gridSmoothWidth,radius,length(coord-(pos)))
				  
            #define drawSmoothLine(pos,halfWidth,t)smoothstep(halfWidth,0.,abs(pos-(t)))

            #define drawCrispLine(pos,halfWidth,t)smoothstep(halfWidth+gridSmoothWidth,halfWidth,abs(pos-(t)))

            #define drawPeriodicLine(freq,width,t)drawCrispLine(freq/2.,width,abs(mod(t,freq)-(freq)/2.))


            // probably can optimize w/ noise, but currently using fourier transform
            float random(float t)
            {
              return(cos(t)+cos(t*1.3+1.3)+cos(t*1.4+1.4))/3.;
            }

            float getPlasmaY(float x,float horizontalFade,float offset)
            {
              return random(x*lineFrequency+uElapsedTime*(speed*2.))*horizontalFade*lineAmplitude+offset;
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

             float offsetSpeed=.23*speed;
             float warpSpeed=.82*speed;

             vec2 nst = mix(st, 1.0 - st,flowDirection);

             vec2 vUvt=vec2(nst.x,nst.y-.5);
             vec2 space=vUvt;

             vec4 lineColor = vec4(color,0.02);

             float horizontalFade=1.-(cos(vUvt.x*6.28)*.5+.5);
			float verticalFade=1.-(cos(vUvt.y*6.28)*.5+.5);

            // fun with nonlinear transformations! (wind / turbulence)
            space.y+=random(space.x*warpFrequency+uElapsedTime*warpSpeed)*warpAmplitude*(.5+horizontalFade);
            space.x+=random(space.y*warpFrequency+uElapsedTime*warpSpeed+2.)*warpAmplitude*horizontalFade;
            
            vec4 lines=vec4(0);

            
            for(int l=0;l<number;l++)
            {
              float normalizedLineIndex=float(l)/float(number);
              float offsetTime=uElapsedTime*offsetSpeed;
              float offsetPosition=float(l)+space.x*offsetFrequency;
              float rand=random(offsetPosition+offsetTime)*.5+.5;
              float halfWidth=mix(minLineWidth,maxLineWidth,rand*horizontalFade)/2.;
              float offset=random(offsetPosition+offsetTime*(1.+normalizedLineIndex))*mix(minOffsetSpread,maxOffsetSpread,horizontalFade);
              float linePosition=getPlasmaY(space.x,horizontalFade,offset);
              float line=drawSmoothLine(linePosition,halfWidth,space.y)/2.+drawCrispLine(linePosition,halfWidth*.15,space.y);
              
              float circleX=mod(float(l)+uElapsedTime*(speed * 2.),25.)-12.;
              vec2 circlePosition=vec2(circleX,getPlasmaY(circleX,horizontalFade,offset));
              float circle=drawCircle(circlePosition,.01,space)*4.;
              
              // line=line+circle;
              lines+=line*lineColor*rand;
            }


            gl_FragColor*=verticalFade;
            gl_FragColor.a=0.;


            float dist = abs(vUvt.x - 0.5);
            float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
            gl_FragColor+=lines;
            gl_FragColor.a = gl_FragColor.a * alpha * opacity;

        }
        
        `;
    }
}
