import { getType } from "../../Util";

/**
 * 对象（仅指键值对）数据描述类
 */
export class ObjectAgent {

    constructor(data,label) {

        const type = getType(data);

        if (type != "object") {

            return new DataAgent(data,{ label });

        }

        const keys = Reflect.ownKeys(data);

        const scope = this;

        keys.forEach(key => {

            scope[key] = new ObjectAgent(data[key]);

        });


    }

}

