import { MeshBasicMaterial } from "three";

export class BasicMaterial extends MeshBasicMaterial {
    constructor() {
        super();
        this.name = "基础材质";
        this.depthTest = true;
        this.depthWrite = true;
    }
}
