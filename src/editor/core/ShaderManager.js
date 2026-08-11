
import * as THREE from 'three';
import { Editor } from './Editor';
import { material } from './../../api/base';

const EXAMPLE = {
    fresnel: {
        type: 'fresnel',
        strength: 2.5
    },
    brighten: {
        type: 'brighten',
        strength: 2.5
    },
    water1: {
        type: 'water1'
    }
};

const shaderPlayList = {
    fresnel: false,
    brighten: false,
    water1: true
};

class ShaderManager {


    constructor(editor) {

        this.editor = editor;

        this.editorEM = editor.editorEM;

        this.update = false;


        // 模型添加着色器
        this.editorEM.setShader.add((type) => {
            const setting = EXAMPLE[type];
            const target = editor.selected;

            if (!target.isMesh) return;

            const shader = target.userData.shader;

            // 用于保证着色器被修改时每次都可重新编译,该部分已挪至shaderProcess流程中
            // target.material.needsUpdate = true;
            // target.material.customProgramCacheKey = () => {
            //     return type;
            // };




            if (shader) {

                // 材质本身已经添加着色器特效

                // setting为空 删除着色器特效
                if (!setting) {

                    target.material.onBeforeCompile = shader => {
                        // shaderReset(shader);
                    };

                    delete target.userData.shader;

                    if (target.material.hasShader) delete target.material.hasShader;



                    this.editorEM.sceneGraphChanged.dispatch();

                    return;
                }

                // 传入的setting不为空，进行参数对比

                const type = shader.type;
                const uniforms = shader.uniforms;
                shader.setting = setting;

                if (type === setting.type) {
                    // 此时传入的配置项type和原有着色器一致


                    Reflect.ownKeys(uniforms).forEach((key) => {
                        // 仅修改uniform的值
                        if (key === 'color') {
                            uniforms.uColor.value = new THREE.Color(setting[key]);
                        } else {
                            uniforms[key].value = setting[key];
                        }
                    });

                } else {
                    // 重新修改着色器

                    this.editorEM.shaderProcess.dispatch(target,setting);



                    target.material['hasShader'] = true;
                }


            } else {

                // 无着色器

                if (Reflect.ownKeys(setting).length === 0) return;

                // 判断材质有无着色器特效，如果不含特效，直接添加
                this.editorEM.shaderProcess.dispatch(target,setting);



                target.material['hasShader'] = true;

            }
            // 重新返回节点
            const node = this.editor.format.objectMap.get(target.uuid);
            this.editor.callbackList.selected(node.toModifyJSON());

            this.editorEM.sceneGraphChanged.dispatch();
            target.material.needsUpdate = false;



        });



    }


}

export { ShaderManager };