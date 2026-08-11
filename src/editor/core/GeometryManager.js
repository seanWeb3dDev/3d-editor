import * as THREE from "three";
import * as GEOMETRY from "./geometry";
import * as MATERIAL from "./material";
import { Reflector } from "./Mesh/Reflector";


const GEOMETRY_LIST = [
    { label: '组',key: "group" },
    { label: "正方体",key: "BoxGeometry" },
    { label: "平面",key: "PlaneGeometry" },
    { label: "球体",key: "SphereGeometry" },
    { label: "圆柱体",key: "CylinderGeometry" },
    { label: "回形面",key: "HollowedPlaneGeometry" },
    { label: "镜面",key: "PlaneGeometry_mirror" },
    { label: "回形镜面",key: "HollowedPlaneGeometry_mirror" },
];

const geometry_name = {
    BoxGeometry: "正方体",
    PlaneGeometry: "平面",
    SphereGeometry: "球体",
    CylinderGeometry: "圆柱体",
    HollowedPlaneGeometry: "回形面",
    PipeGeometry: "管道",
    ArrowPathGeometry: "管道",

};

// 生成几何体
// 修改几何体

/**
 * 
 * @param {THREE.Geometry} url 几何类型
 * @param {*} param 几何类型参数
 * @param {*} options 特殊模型参数
 * @returns 
 */
function createMesh(url,param = []) {

    const name = geometry_name[url];
    if (!name) return null;
    const geo = new GEOMETRY[url](...param);

    const material = new THREE.MeshStandardMaterial();
    material.name = "标准材质";


    const mesh = new THREE.Mesh(geo,material);

    const geoData = geo.toParam ? geo.toParam() : undefined;



    mesh.name = name;
    mesh.userData.geometry = geoData;
    return mesh;

}

function createMirror(url,options = {},param = []) {
    const name = geometry_name[url];
    if (!name) return null;
    const geo = new GEOMETRY[url](...param);

    const material = new MATERIAL.ReflectMaterial();

    const mesh = new Reflector(geo,material,options);

    const geoData = geo.toParam ? geo.toParam() : undefined;

    mesh.userData.geometry = geoData;

    return mesh;

}


class GeometryManager {

    constructor(editor) {
        this.editor = editor;
    }
}

export { GeometryManager,GEOMETRY_LIST,createMesh,createMirror };