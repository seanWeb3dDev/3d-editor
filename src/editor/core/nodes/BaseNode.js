

export class BaseNode {

    constructor(object) {

        this.object = object;

    }

    toJSON() {
        return {};
    }

    /** 将可修改的属性暴露给前端页面 */

    toModifyJSON() {
        return {};
    }

    toMaterialList() {
        return {};
    }

    /**
     * 目标右键操作列表,如批量操作
     * @returns 
     */

    toOperateList() {
        return [];
    }
    toTriggerList() {
        return [];
    }
    toActionList() {
        return [];
    }
    toChildActionList() {
        return [];
    }

    /**
     * 绑定事件和动作的列表
     * @returns 
     */



    toEventData() {
        return {
            trigger: this.toTriggerList(),
            action: this.toActionList(),
            childAction: this.toChildActionList(),
            attribute: this.toAttributeChangeList()
        };
    }
    /**
     * 属性修改事件列表
     * @returns 
     */

    toAttributeChangeList() {
        return [
            { label: "可见性",value: "visible" },

        ];
    }

    dispose() {

        this.object = null;

    }
}