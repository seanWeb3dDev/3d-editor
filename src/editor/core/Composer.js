import * as THREE from "three";
import {
    EffectPass,
    SelectiveBloomEffect,
    EffectComposer,
    RenderPass,
    BlendFunction,
    OutlineEffect,
    HueSaturationEffect,
    BrightnessContrastEffect,
    SMAAEffect,
} from "postprocessing";


export class Composer {

    /**
    * @param { WebGLRenderer } render
    * @param { Scene } scene
    * @param { Camera } camera
    */
    constructor(renderer,scene,camera,setting) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        this.composer = this.#initComposer();
        this.createRenderPass();
        this.#initEffectPass(setting);

        this.test = true;
    }
    resize = (width,height) => {
        this.composer.setSize(width,height,true);
    };



    #initComposer() {
        // msaa anti-aliasing 多重采样抗锯齿
        const multisampling = this.renderer.capabilities.maxSamples;
        const composer = new EffectComposer(this.renderer,{ multisampling: 4 });
        return composer;
    }

    createRenderPass() {
        this.renderPass = new RenderPass(this.scene,this.camera);
        this.composer.addPass(this.renderPass);

    }

    #initEffectPass(setting) {
        const { hue,saturation,contrast,brightness } = setting;
        // 色调通道
        this.hueSaturationEffect = new HueSaturationEffect({ saturation: saturation,hue: hue });
        this.brightnessContrastEffect = new BrightnessContrastEffect({
            contrast: contrast,
            brightness: brightness
        });
        // 创建通道
        this.smaaEffect = new SMAAEffect();
        this.colorModifyEffect = new EffectPass(
            this.camera,
            this.hueSaturationEffect,
            this.brightnessContrastEffect,
            this.smaaEffect
        );
        this.composer.addPass(this.colorModifyEffect);

    }
    updatePass(setting) {
        const { hue,saturation,contrast,brightness } = setting;
        this.hueSaturationEffect.hue = hue;
        this.hueSaturationEffect.saturation = saturation;
        this.brightnessContrastEffect.contrast = contrast;
        this.brightnessContrastEffect.brightness = brightness;
    }
    /**渲染函数 */
    render() {
        this.composer.render();
    }
}