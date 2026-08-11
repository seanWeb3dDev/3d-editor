import * as THREE from "three";

export class GlassMaterial extends THREE.MeshStandardMaterial {
    constructor() {
        super();
        this.name = "玻璃材质";
        this.transparent = true;
        this.side = THREE.FrontSide;
        this.depthTest = true;
        this.depthWrite = true;
        this.metalness = 0.9;
        this.roughness = 0.1;
        this.opacity = 0.2;

    }
}