import {
    Color,
    Matrix4,
    Mesh,
    PerspectiveCamera,
    Plane,
    ShaderMaterial,
    UniformsUtils,
    Vector2,
    Vector3,
    Vector4,
    WebGLRenderTarget,
    TextureLoader,
    FrontSide
} from "three";


class ReflectEffect {
    constructor(scope,options = {}) {

        this.mesh = scope;


        const textureWidth = options.textureWidth || 512;
        const textureHeight = options.textureHeight || 512;
        const clipBias = options.clipBias || 0.0003;
        const multisample = options.multisample !== undefined ? options.multisample : 4;


        this.camera = new PerspectiveCamera();

        const reflectorPlane = new Plane();
        const normal = new Vector3();
        const reflectorWorldPosition = new Vector3();
        const cameraWorldPosition = new Vector3();
        const rotationMatrix = new Matrix4();
        const lookAtPosition = new Vector3(0,0,-1);
        const clipPlane = new Vector4();
        const view = new Vector3();
        const target = new Vector3();
        const q = new Vector4();
        const textureMatrix = new Matrix4();
        const virtualCamera = this.camera;

        const renderTarget = new WebGLRenderTarget(textureWidth,textureHeight,{
            samples: multisample,
        });

        this.renderTarget = renderTarget;

        const material = scope.material;
        material.uniforms["tDiffuse"].value = renderTarget.texture;
        material.uniforms["textureMatrix"].value = textureMatrix;



        scope.onBeforeRender = (renderer,scene,camera) => {

            reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
            cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

            rotationMatrix.extractRotation(scope.matrixWorld);

            normal.set(0,0,1);
            normal.applyMatrix4(rotationMatrix);

            view.subVectors(reflectorWorldPosition,cameraWorldPosition);

            // Avoid rendering when reflector is facing away

            if (view.dot(normal) > 0) return;

            view.reflect(normal).negate();
            view.add(reflectorWorldPosition);

            rotationMatrix.extractRotation(camera.matrixWorld);

            lookAtPosition.set(0,0,-1);
            lookAtPosition.applyMatrix4(rotationMatrix);
            lookAtPosition.add(cameraWorldPosition);

            target.subVectors(reflectorWorldPosition,lookAtPosition);
            target.reflect(normal).negate();
            target.add(reflectorWorldPosition);

            virtualCamera.position.copy(view);
            virtualCamera.up.set(0,1,0);
            virtualCamera.up.applyMatrix4(rotationMatrix);
            virtualCamera.up.reflect(normal);
            virtualCamera.lookAt(target);

            virtualCamera.far = camera.far; // Used in WebGLBackground

            virtualCamera.updateMatrixWorld();
            virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

            // Update the texture matrix
            textureMatrix.set(0.5,0.0,0.0,0.5,0.0,0.5,0.0,0.5,0.0,0.0,0.5,0.5,0.0,0.0,0.0,1.0);
            textureMatrix.multiply(virtualCamera.projectionMatrix);
            textureMatrix.multiply(virtualCamera.matrixWorldInverse);
            textureMatrix.multiply(scope.matrixWorld);

            // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
            // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
            reflectorPlane.setFromNormalAndCoplanarPoint(normal,reflectorWorldPosition);
            reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);

            clipPlane.set(reflectorPlane.normal.x,reflectorPlane.normal.y,reflectorPlane.normal.z,reflectorPlane.constant);

            const projectionMatrix = virtualCamera.projectionMatrix;

            q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
            q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
            q.z = -1.0;
            q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

            // Calculate the scaled plane vector
            clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

            // Replacing the third row of the projection matrix
            projectionMatrix.elements[2] = clipPlane.x;
            projectionMatrix.elements[6] = clipPlane.y;
            projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
            projectionMatrix.elements[14] = clipPlane.w;

            // Render

            // renderTarget.texture.encoding = renderer.outputEncoding;

            scope.visible = false;

            const currentRenderTarget = renderer.getRenderTarget();

            const currentXrEnabled = renderer.xr.enabled;
            const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

            renderer.xr.enabled = false; // Avoid camera modification
            renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

            renderer.setRenderTarget(renderTarget);

            renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897

            if (renderer.autoClear === false) renderer.clear();
            renderer.render(scene,virtualCamera);

            renderer.xr.enabled = currentXrEnabled;
            renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

            renderer.setRenderTarget(currentRenderTarget);

            // Restore viewport

            const viewport = camera.viewport;

            if (viewport !== undefined) {
                renderer.state.viewport(viewport);
            }

            scope.visible = true;
        };

        scope.getRenderTarget = () => {
            return renderTarget;
        };


    }

    dispose() {
        this.renderTarget.dispose();
    }
}

class Reflector extends Mesh {
    constructor(geometry,material,options = {}) {
        super(geometry,material);

        this.isReflector = true;



        this.type = "Reflector";
        this.name = "镜面模型";


        const scope = this;



        this.reflectEffect = new ReflectEffect(scope,options);


        this.dispose = function () {

            scope.reflectEffect.dispose();
            scope.material.dispose();
        };
    }

    clone() {
        console.log("镜面模型无法被复制");
        return null;
    }
}





export { Reflector };
