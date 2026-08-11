
import * as THREE from "three";
import { Dispatcher } from "../library";


const editorEM = {
    forTest: new Dispatcher(),
    cameraChanged: new Dispatcher(),

    windowResize: new Dispatcher(),
    //渲染器创建事件
    rendererCreated: new Dispatcher(),
    //渲染器更新
    rendererChanged: new Dispatcher(),
    //渲染器渲染
    sceneRendered: new Dispatcher(),
    // 射线事件
    selectorDetected: new Dispatcher(),
    // 对象选中事件
    objectSelected: new Dispatcher(),
    // 对象聚焦事件
    objectFocused: new Dispatcher(),
    // 材质选中事件
    materialSelected: new Dispatcher(),
    // 创建数据节点
    createNode: new Dispatcher(),
    // 异步刷新场景
    syncRender: new Dispatcher(),
    // 三维对象更新事件
    objectChanged: new Dispatcher(),
    // 场景更新
    sceneGraphChanged: new Dispatcher(),
    // 材质更新
    materialChanged: new Dispatcher(),
    // 材质替换
    materialReplaced: new Dispatcher(),
    // 纹理流动更新
    textureUvFlowChanged: new Dispatcher(),
    // 添加对象事件
    addObject: new Dispatcher(),
    // 移除对象事件
    removeObject: new Dispatcher(),
    // 对象移除后
    objectRemoved: new Dispatcher(),
    // 历史操作队列改变
    historyChanged: new Dispatcher(),
    // 相机配置修改
    cameraSetting: new Dispatcher(),
    //  背景图修改
    backgroundChange: new Dispatcher(),
    // 场景添加标记事件
    markerDetected: new Dispatcher(),
    // 激活marker工具
    markerActive: new Dispatcher(),
    // 隐藏灯光辅助器
    lightHelperVisible: new Dispatcher(),
    // 动画播放
    animationPlay: new Dispatcher(),
    // 全场景动画播放
    allAnimation: new Dispatcher(),
    // 模型设置特效
    setShader: new Dispatcher(),
    // 模型移除特效
    removeShader: new Dispatcher(),
    // 着色器特效处理
    shaderProcess: new Dispatcher(),
    // 保存场景
    saveScene: new Dispatcher(),
    // 隐藏辅助网格
    gridVisible: new Dispatcher(),
    // 添加/修改状态 
    setState: new Dispatcher(),
    // 删除状态
    deleteState: new Dispatcher(),
    // 3D对象绑定事件
    bindEvent: new Dispatcher(),
    // 3D对象删除事件
    deleteEvent: new Dispatcher(),
    // 3D对象绑定伴随事件
    bindFollowEvent: new Dispatcher(),
    // 3D对象删除伴随事件
    deleteFollowEvent: new Dispatcher(),
    // 特效预览
    shaderPreview: new Dispatcher(),
    // 复制对象
    duplicate: new Dispatcher(),
    // 几何体更新
    geometryChanged: new Dispatcher(),
    // 编辑器中主动修改三维对象属性 比如undo redo 或者通过控制器修改目标属性
    attributeChanged: new Dispatcher(),
    // 控制对象锁定状态
    lockObject: new Dispatcher(),
    // 清空场景
    removeAllObject: new Dispatcher(),
    // 环境贴图更新
    environmentChange: new Dispatcher(),
    // 单独显示功能
    singleShow: new Dispatcher()

};



/**注册事件 */
function registerEvents(editor) {

    editorEM.sceneGraphChanged.add(editor.render);
    editorEM.rendererChanged.add(editor.render);
    editorEM.cameraChanged.add(editor.render);
    editorEM.materialChanged.add(editor.render);
    editorEM.syncRender.add((time = 500) => {
        setTimeout(() => {
            editor.render();
        },time);
    });

    // editorEM.historyChanged.add(() => { console.log("历史操作记录修改",editor.history));

}

export { registerEvents,editorEM };