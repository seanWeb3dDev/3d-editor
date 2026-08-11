


class EventBinder {
    constructor(editor) {

        this.editor = editor;

        this.editorEM = editor.editorEM;

        //绑定事件
        this.editorEM.bindEvent.add((index,setting,object = this.editor.selected,result = null) => {


            if (!object.userData.hasOwnProperty('eventList')) {

                object.userData.eventList = [];

            } else {
                // 重复校验
                const newEvent = JSON.stringify(setting);

                const list = object.userData.eventList;

                const hasEvent = list.find((e) => {
                    const origin = JSON.stringify(e);
                    return origin === newEvent;
                });

                if (hasEvent === true) {
                    if (result !== null) result.value = false;
                    return;
                }

            }

            if (index === -1) {
                object.userData.eventList.push(setting);
            } else {

                object.userData.eventList.splice(index,1,setting);
            }

            if (result !== null) result.value = true;

            this.editor.callbackList.updateSceneData({
                uuid: object.uuid,
                key: "hasEvent",
                value: true
            });


        });

        //删除事件
        this.editorEM.deleteEvent.add((index,object = this.editor.selected) => {

            const eventList = object.userData.eventList;

            eventList.splice(index,1);

            if (eventList.length < 1) {

                this.editor.callbackList.updateSceneData({
                    uuid: object.uuid,
                    key: "hasEvent",
                    value: false
                });
            }



        });

        //绑定伴随事件
        this.editorEM.bindFollowEvent.add((parent,index,setting,object = this.editor.selected) => {


            const parentEvent = object.userData.eventList[parent];

            if (!parentEvent.follow) {
                parentEvent.follow = [];
            }

            if (index === -1) {
                parentEvent.follow.push(setting);
            } else {
                parentEvent.follow.splice(index,1,setting);
            }

        });


        //删除伴随事件
        this.editorEM.deleteFollowEvent.add((parent,index,object = this.editor.selected) => {

            const userData = object.userData;

            const followEventList = userData.eventList[parent].follow;

            followEventList.splice(index,1);

        });


    }
}

export { EventBinder };