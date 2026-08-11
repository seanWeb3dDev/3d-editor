import { BaseNode } from ".";
import { DataAgent } from "./agent/DataAgent";
import {
    RepeatWrapping,ClampToEdgeWrapping,MirroredRepeatWrapping,
    UVMapping,CubeReflectionMapping,CubeRefractionMapping,
    EquirectangularRefractionMapping,EquirectangularReflectionMapping,
    CubeUVReflectionMapping,Vector2
} from 'three';

const wrapOptions = [
    { label: '重复',value: RepeatWrapping },
    { label: '夹紧边缘',value: ClampToEdgeWrapping },
    { label: '镜像重复',value: MirroredRepeatWrapping }
];

const mappingOptions = [
    { label: 'UV映射',value: UVMapping },
    { label: '立方体反射',value: CubeReflectionMapping },
    { label: '立方体折射',value: CubeRefractionMapping },
    { label: '球形环境贴图反射',value: EquirectangularReflectionMapping },
    { label: '球形环境贴图折射',value: EquirectangularRefractionMapping },
    { label: '立方体UV反射',value: CubeUVReflectionMapping },
];

export class TextureNode extends BaseNode {
    /**
 * @param {TextureNode} textureNode 
 */
    constructor(map,type) {
        super(map);
        this.map = map;
        this.type = type;

    }

    toModifyJSON() {
        let data = {};
        const map = this.map;

        data.inputType = 'group';

        if (this.type === "map") {

            data.image = new DataAgent(map.image,{ inputType: "chartlet",label: '贴图' });
            // data.image = new DataAgent(map.image,{ inputType: "imageBitmap",label: '贴图' });
            data.wrapS = new DataAgent(map.wrapS,{ label: "水平包裹",inputType: 'select',options: wrapOptions });
            data.wrapT = new DataAgent(map.wrapT,{ label: "垂直包裹",inputType: 'select',options: wrapOptions });
            data.repeat = new DataAgent(map.repeat,{ label: "纹理重复",inputType: 'vec2' });

            data.uvFlow = new DataAgent(map.uvFlow,{ label: "纹理流动",inputType: 'vec2' });


            // data.offset = new DataAgent(map.offset,{ label: "纹理偏移",inputType: 'vec2' });
            // data.mapping = new DataAgent(map.mapping,{ label: "纹理映射",inputType: 'select',options: mappingOptions });
            //   data.flipY = new DataAgent(map.flipY, { label: "是否翻转", inputType: 'switch' });
        }



        return data;
    }

}