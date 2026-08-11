import * as THREE from "three";
import { Config } from "./config";
import { GLTFLoader } from "../library/GLTFLoader";
import * as PROCESS from "3dEditor-glb-process";



class TextPlugin extends PROCESS.BaseProcessPlugin {
  constructor(executor) {
    super(executor);
    this.texts = [];
  }


  process(object) {

    const userData = object.userData;

    if (userData.isText) {

      this.texts.push(object);

    }
  }

  afterProcess() {
    this.texts.forEach((child) => {
      child.parent.remove(child);
    });
  }

}
const PROCESS_ARRAY = [
  TextPlugin,
  PROCESS.ShaderMaterialPlugin,
  PROCESS.StateProcessPlugin,
  PROCESS.AttributeProcessPlugin,
  PROCESS.CustomMeshPlugin, // 需要更新到1.1.6
  PROCESS.SceneProcessPlugin,
];

const processManager = new PROCESS.ProcessManager(PROCESS_ARRAY);

const loader = new GLTFLoader();

const canvas = document.createElement("canvas");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true,
  precision: "highp",
  canvas,
  alpha: true,
  toneMapping: THREE.NoToneMapping,
});

renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(50,canvas.width / canvas.height,0.1,10000);

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff,1.5); // 线性SRG

const directionalLight = new THREE.DirectionalLight(0xffffff,1.4);

directionalLight.shadow.mapSize.width = 1 << 12;
directionalLight.shadow.mapSize.height = 1 << 12;
directionalLight.shadow.blurSamples = 8;

directionalLight.shadow.radius = 1.15;
directionalLight.shadow.bias = -0.0015;

directionalLight.position.set(-100,300,-300);
directionalLight.castShadow = true;

const directionalLight2 = new THREE.DirectionalLight(0xffffff,0.7);

const defaultLights = [ambientLight,directionalLight,directionalLight2];

/**
 * 保存模型缩略图
 * @param {THREE.Object3D} object
 */
export function saveObject3dImage(file,width = 300,height = 300,lights = defaultLights) {
  return new Promise((reslove,reject) => {
    // set canvas renderer camera
    canvas.width = width;
    canvas.height = height;
    renderer.setSize(width,height);
    camera.aspect = width / height;

    loader
      .parseAsync(file)
      .then((gltf) => {
        processManager.process(gltf);
        const object = gltf.scene;
        // ser render scene
        scene.children.length = 0;
        scene.children.push(object);
        scene.children.push(...lights);

        // get boundingBox boundingSphere
        const box = new THREE.Box3().setFromObject(object);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const radius = sphere.radius;
        const center = sphere.center;

        // set camera
        camera.far = radius * 3;
        camera.position.addVectors(
          center,
          new THREE.Vector3(radius * 0.75,radius * 0.75,radius * 1.5)
        );
        camera.lookAt(center);
        camera.updateProjectionMatrix();
        camera.updateWorldMatrix(true,true);

        // set light
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = radius * 2;
        directionalLight.shadow.camera.right = radius * 2;
        directionalLight.shadow.camera.left = -radius * 2;
        directionalLight.shadow.camera.top = radius * 2;
        directionalLight.shadow.camera.bottom = -radius * 2;
        directionalLight.position.addVectors(center,new THREE.Vector3(radius,radius,radius));

        // set shadow attributes
        // object.traverse((child) => {
        //   child.__castShadow = child.castShadow;
        //   child.__receiveShadow = child.receiveShadow;
        //   child.castShadow = true;
        //   child.receiveShadow = true;
        // });


        renderer.render(scene,camera);

        // reset shadow attributes
        // object.traverse((child) => {
        //   child.castShadow = child.__castShadow;
        //   child.receiveShadow = child.__receiveShadow;

        //   delete child.__castShadow;
        //   delete child.__receiveShadow;
        // });

        // get blob
        canvas.toBlob((blob) => {
          reslove(blob);
          processManager.dispose();
        });

      })
      .catch((err) => {
        reject(err);
      });
  });
}
