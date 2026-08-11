import { MeshStandardMaterial } from "three";

export class StandardMaterial extends MeshStandardMaterial {
    constructor() {
        super();
        this.name = "标准材质";
        this.depthTest = true;
        this.depthWrite = true;
    }
}
