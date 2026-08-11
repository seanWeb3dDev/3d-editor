
import * as THREE from "three";
import * as GEOMETRY from "../geometry";

/**
 * 处理特殊属性的插件
 */
class GeometryProcessPlugin {
    constructor(executor) {
        this.executor = executor;
        this.core = executor.core;


    }

    process(object) {

        const userData = object.userData;

        const data = userData.geometry;

        if (data && object.geometry) {
            const geo = new GEOMETRY[data.type](...data.param);

            object.geometry.dispose();
            object.geometry = geo;
        }

    }


}


export { GeometryProcessPlugin };