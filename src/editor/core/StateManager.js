



class StateManager {
    constructor(editor) {

        this.editor = editor;

        this.editorEM = editor.editorEM;

        //修改状态
        this.editorEM.setState.add((state,object) => {


            if (!object.userData.hasOwnProperty('state')) {
                object.userData.state = {};

            }

            const key = state.key;

            object.userData.state[key] = state;


        });

        //todo 修改状态后某些三维对象如果引用了状态属性,也需要跟着修改
        this.editorEM.setState.add((state,object) => {



            if (object.isText) {
                object.updateText();
            }


        });

        //删除状态
        this.editorEM.deleteState.add((key,object) => {

            const userData = object.userData;

            if (userData.state[key]) {

                delete userData.state[key];

            }

        });


        //todo 删除状态后某些三维对象如果引用了状态属性,也需要跟着修改
        this.editorEM.deleteState.add((state,object) => {



            if (object.isText) {
                object.updateText();
            }


        });


    }
}

export { StateManager };