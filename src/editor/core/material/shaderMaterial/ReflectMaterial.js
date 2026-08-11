import {
    Color,
    ShaderMaterial,
    UniformsUtils,
    FrontSide,
    Vector2,
    Matrix4
} from "three";
import { DataAgent } from '../../nodes/agent/DataAgent';
import { getColorString } from "../../Util";

const UNIFORMS = {
    color: {
        value: new Color("#747474"),
    },

    tDiffuse: {
        value: null, // 相机拍摄到的场景
    },

    textureMatrix: {
        value: new Matrix4(),
    },
    textureSize: {
        value: new Vector2(400,400),
    },
    gaussEffect: {
        value: true,
    },
    opacity: {
        value: 0.15,
    },
    sigma: {
        value: 3
    },
    background: {
        value: 0.0
    }

};

/**
 * 反射材质需要和Reflector同时使用才有效果
 */

export class ReflectMaterial extends ShaderMaterial {
    constructor(setting = {}) {
        super();

        this.transparent = setting.transparent ?? true;
        this.side = setting.side ?? FrontSide;
        this.depthTest = setting.depthTest ?? true;
        this.depthWrite = setting.depthWrite ?? true;

        const uniforms = setting.uniforms ?? {};

        this.uniforms = UniformsUtils.clone(UNIFORMS);

        uniforms.opacity != null && (this.uniforms.opacity.value = uniforms.opacity);
        uniforms.background != null && (this.uniforms.background.value = uniforms.background);
        uniforms.gaussEffect != null && (this.uniforms.gaussEffect.value = uniforms.gaussEffect);
        uniforms.color != null && (this.uniforms.color.value = new Color(uniforms.color));





        this.vertexShader = this.createVerTexShader();
        this.fragmentShader = this.createFragmentShader();
        this.name = "镜面材质";
        this.shaderType = 'ReflectMaterial';
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
        uniforms.sigma = this.uniforms.sigma.value;
        uniforms.background = this.uniforms.background.value;
        uniforms.gaussEffect = this.uniforms.gaussEffect.value;

        return data;
    }
    toUniformNode() {

        const background = [
            { label: '去除底色',value: 1 },
            { label: '保留底色',value: 0 }
        ];

        const uniforms = {};
        uniforms.color = new DataAgent(this.uniforms.color.value,{ label: '颜色',inputType: 'color' });
        uniforms.background = new DataAgent(this.uniforms.background.value,{ label: '底色',inputType: 'select',options: background });
        uniforms.opacity = new DataAgent(this.uniforms.opacity.value,{ label: '透明度',inputType: 'slider_input',range: [0,1] });
        uniforms.gaussEffect = new DataAgent(this.uniforms.gaussEffect.value,{ label: '高斯模糊',inputType: 'switch' });
        uniforms.sigma = new DataAgent(this.uniforms.sigma.value,{ label: '模糊值',inputType: 'slider_input',range: [0.3,5] });


        return uniforms;

    }

    createVerTexShader() {
        return `
          uniform mat4 textureMatrix;
          varying vec4 vUv;
      varying vec2 st;
  
          #include <common>
          #include <logdepthbuf_pars_vertex>
  
          void main() {
  
        st = uv;
              vUv = textureMatrix * vec4( position, 1.0 );
  
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  
              #include <logdepthbuf_vertex>
  
          }`;
    }
    createFragmentShader() {
        return `
        uniform vec3 color;
  uniform vec2 textureSize;

        uniform sampler2D tDiffuse;
  uniform bool gaussEffect;
  uniform float opacity;
  uniform float background;
  uniform float sigma;
        varying vec4 vUv;
  varying vec2 st;

        #include <logdepthbuf_pars_fragment>

//   #define GAUSS_SIZE 20 // 高斯模糊尺寸 20


  const int GAUSS_SIZE = 20; // 高斯模糊尺寸 20

  float gaussKernel[GAUSS_SIZE];
  float gauss(float x, float sigma) {
   return 1.0 / (sigma * sqrt(2.0 * 3.1415926)) * exp(-(x*x) / (2.0 * sigma * sigma));
  }

 void generateGaussKernel() {
  for(int i = 0; i < GAUSS_SIZE; i++){
   float x = float(i) - float(GAUSS_SIZE)/2.0;
   gaussKernel[i] = gauss(x, sigma);
  }
 }

        void main() {

    #include <logdepthbuf_fragment>

   if(gaussEffect == true){
    generateGaussKernel();
    vec2 texelSize = float(GAUSS_SIZE ) / textureSize*0.5;

    vec4 reflectColor = vec4(0.0);
    for( int i = 0; i < GAUSS_SIZE; i++ ) {
     for(int j = 0; j < GAUSS_SIZE; j++){
      vec2 offset = vec2(float(i) - float(GAUSS_SIZE) / 2.0, float(j) - float(GAUSS_SIZE) / 2.0 )* texelSize;
      vec4 newUv = vec4(0.0);
      newUv.xy = vUv.xy + offset;
      newUv.zw = vUv.zw;
      reflectColor += gaussKernel[i] * gaussKernel[j] * texture2DProj( tDiffuse, newUv );
     }
    }
    vec3 fc =  mix(reflectColor.rgb + color,reflectColor.rgb,background);
    gl_FragColor = vec4(fc,opacity);
   } else {
   vec4 base = texture2DProj( tDiffuse, vUv ); // 对拍摄到的场景进行采样
   
   vec3 fc = mix(base.rgb + color,base.rgb,background);
   gl_FragColor = vec4(fc ,opacity);
   }


  #include <colorspace_fragment>

  }
        `;

    }

}