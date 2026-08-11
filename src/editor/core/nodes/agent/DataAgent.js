import { getType,getColorString } from "../../Util";

/**
 * 简单数据描述类
 * @template T
 * @param {T} data 
 * @param {{writable:Boolean,options:Array<T>,defaultValue:T,inputType:string,type:string,range:[min:number,max:number],label:string}}  description 
 */
export class DataAgent {

    constructor(data,description = {}) {


        const type = getType(data);

        if (type === "object" || type === "function") {

            throw new Error(`you have given a wrong data in DataAgent's Constructor ,expect accept a Simple Data : ${data}`);

        }

        this.value = data;
        if (type === "vec2" || type === "vec3" || type === "vec4") this.value = [...data];
        if (type === "euler") this.value = [data.x,data.y,data.z];
        if (type === "color") this.value = getColorString(data);
        if (type === "intervalValue") this.value = [data.a,data.b];
        if (type === "constantColor") this.value = [...data.color];
        if (type === "constantValue") this.value = data.value;


        this.type = Reflect.has(description,"type") ? description.type : type;
        this.writable = Reflect.has(description,"writable") ? description.writable : true;
        this.defaultValue = Reflect.has(description,"defaultValue") ? description.defaultValue : this.value;

        // 输入类型
        this.inputType = Reflect.has(description,"inputType") ? description.inputType : 'input';



        this.label = description.label;

        if (Array.isArray(description.options)) {

            this.options = description.options;

        }
        if (Array.isArray(description.range)) {

            const range = description.range;

            if (typeof range[0] === "number" && typeof range[1] === "number" && range[1] > range[0]) {

                this.range = range;

            } else {

                throw new Error("you have given a wrong range , the value of the range is not an number array of the min number is bigger than the max number ");

            }
        }

    }
}

