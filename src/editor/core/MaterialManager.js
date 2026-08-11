import * as THREE from "three";




class MaterialManager {

    constructor(editor) {
        this.editor = editor;

        this.editorEM = editor.editorEM;

        this.materialMap = new Map();

        // 材质引用索引表
        this.materialsRef = new Map();

        this.uvFlowMaterialMap = new Map();


    }
    addMaterial(material) {
        if (!material) return;
        if (Array.isArray(material)) {
            for (var i = 0,l = material.length; i < l; i++) {
                this.addMaterialToRefCounter(material[i]);
                this.checkMapUvFlow(material[i]);
            }
        } else {
            this.addMaterialToRefCounter(material);
            this.checkMapUvFlow(material);
        }


    }

    removeMaterial(material) {
        if (Array.isArray(material)) {
            for (var i = 0,l = material.length; i < l; i++) {
                this.removeMaterialFromRefCounter(material[i]);
            }
        } else {

            this.removeMaterialFromRefCounter(material);
        }


    }

    addMaterialToRefCounter(material) {
        const materialsRef = this.materialsRef;
        let count = materialsRef.get(material);
        if (count === undefined) {
            materialsRef.set(material,1);
            this.materialMap.set(material.uuid,material);
        } else {
            count++;
            materialsRef.set(material,count);
        }
    }
    removeMaterialFromRefCounter(material) {

        const materialsRef = this.materialsRef;

        let count = materialsRef.get(material);
        count--;
        materialsRef.set(material,count);

        if (count === 0) {
            materialsRef.delete(material);

            this.materialMap.delete(material.uuid);

            this.deleteUvFlowMaterial(material);
        }

        // 释放缓存
    }

    getAllMaterial() {
        return this.materialMap;
    }

    getMaterialByUuid(uuid) {
        return this.materialMap.get(uuid);
    }

    addUvFlowMaterial(material) {
        if (this.uvFlowMaterialMap.has(material.uuid)) return;
        this.uvFlowMaterialMap.set(material.uuid,material);

    }
    deleteUvFlowMaterial(material) {
        if (!this.uvFlowMaterialMap.has(material.uuid)) return;
        this.uvFlowMaterialMap.delete(material.uuid);
    }
    checkMapUvFlow(material) {

        const map = material.map;
        if (!map) return;
        if (!map.uvFlow) {
            const uvFlow = new THREE.Vector2();

            if (map.name.includes("uvFlow")) {
                // map名称中保留了uv流动的x和y的速度 结构为 UV_x_y
                const list = map.name.split("_");
                uvFlow.set(parseFloat(list[1]),parseFloat(list[2]));
                this.addUvFlowMaterial(material);
            }
            map.uvFlow = uvFlow;
            map.offset.set(0,0);
        }
    }
    uvFlowUpdate(time) {
        // texture.offset.x = time * speed; // s方向流动
        // texture.offset.y = time * speed;
        this.uvFlowMaterialMap.forEach((material,uuid) => {

            const map = material.map;

            if (map && map.uvFlow) {
                const xSpeed = map.uvFlow.x;
                const ySpeed = map.uvFlow.y;

                map.offset.x = time * xSpeed;
                map.offset.y = time * ySpeed;
            }

        });
    }

}



class MaterialViewport {
    constructor(editor) {
        this.editor = editor;

        this.renderer = editor.renderer;

        this.visible = false;

        this.scene = new THREE.Scene();


        this.createMesh();

        this.createLight();

        this.createCamera();

        this.radius = 48;

        const width = editor.container.offsetWidth; // 1386
        const height = editor.container.offsetHeight; //890


        this.location = {
            // x: width - this.radius,
            // y: height - this.radius
            x: width - this.radius - 44,
            y: height * 0.676 - this.radius
        };

        this.saveViewport = new THREE.Vector4(0,0,width,height);
        this.viewport = new THREE.Vector4(this.location.x,this.location.y,this.radius,this.radius);

    }

    resize = (width,height) => {


        this.saveViewport = new THREE.Vector4(0,0,width,height);

        // this.viewport = new THREE.Vector4(this.location.x,this.location.y,this.radius,this.radius);

    };

    viewportResize(width,height,radius) {

        this.location.x = width;
        this.location.y = height;
        this.radius = radius;
        this.viewport = new THREE.Vector4(this.location.x,this.location.y,this.radius,this.radius);

    }

    createMesh() {

        this.geometry = new THREE.SphereGeometry(1.7,32,16);

        this.originMaterial = new THREE.MeshStandardMaterial();

        this.mesh = new THREE.Mesh(this.geometry,this.originMaterial);

        this.mesh.rotateY(-Math.PI / 2);

        const planeGeo = new THREE.PlaneGeometry(14,14,2,2);

        const planeMaterial = new THREE.MeshBasicMaterial({

            color: "#333333",

            side: THREE.DoubleSide
        });

        this.background = new THREE.Mesh(planeGeo,planeMaterial);

        this.background.position.set(0,0,-3);

        this.scene.add(this.background);

        this.scene.add(this.mesh);

    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(50,1,0.1,200);

        camera.position.set(0,0,5);

        this.camera = camera;

    }

    createLight() {

        const light = new THREE.DirectionalLight(0xffffff,1.5);

        light.position.set(-5,5,5);

        this.scene.add(light);

    }

    changeMaterial(material) {
        const uuid = this.mesh.material.uuid;
        const old = this.mesh.material;

        if (!material) {
            this.mesh.material = this.originMaterial;

        } else {

            if (uuid !== material.uuid) {
                this.mesh.material = material;
            }

        }

        if (old !== this.originMaterial) return old;
        else return null;
    }


    render(core) {

        const renderer = this.renderer;

        renderer.setViewport(this.viewport);
        renderer.setScissor(this.viewport);

        renderer.render(this.scene,this.camera);

        renderer.setViewport(this.saveViewport);
        renderer.setScissor(this.saveViewport);

        // render
    }
}
class GLTFShaderMaterialExtension {
    constructor(writer) {

        this.writer = writer;
        this.name = 'BL_shaderMaterial_extension';
        this.count = 1;
        this.shaderMaterials = {};
    }

    writeNode(input,nodeDef) {


        // 整理出所有着色器擦材质
        if (input.material) {
            if (input.material instanceof THREE.ShaderMaterial) {

                const material = input.material;
                input.userData.shaderMaterial = material.uuid;
                nodeDef.extras = JSON.parse(JSON.stringify(input.userData));

                if (!this.shaderMaterials[material.uuid]) {
                    this.shaderMaterials[material.uuid] = material.toJSON();
                }

            } else {
                // 如果非着色器材质但是userData中有shaderMaterial属性

                if (nodeDef.extras.shaderMaterial) {
                    delete nodeDef.extras.shaderMaterial;
                }
            }



        }


    }

    beforeParse(input) {

    }
    afterParse(input) {
        const extra = this.writer.json.scenes[0].extras;

        if (Object.keys(this.shaderMaterials.length > 0)) {

            extra.shaderMaterials = this.shaderMaterials;
        }



    }



}

export { GLTFShaderMaterialExtension,MaterialManager,MaterialViewport };