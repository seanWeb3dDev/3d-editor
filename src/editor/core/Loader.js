import { Editor } from "./Editor";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFLoader } from "../library/GLTFLoader";
import { LoadingManager } from "three";
import { LoaderUtils } from "./LoaderUtils";
import { saveObject3dImage } from "./offscreenRendering";


export class Loader {
    /**
 * @param {Editor} editor 
 */
    constructor(editor) {

        this.editor = editor;

    }

    createGLTFLoader(manager) {

        const loader = new GLTFLoader(manager);

        return loader;

    }

    /**
 * 加载模型文件列表，在拖拽文件进三维场景时执行。
 * @param {DataTransferItemList} ItemList 
 */
    loadItemList(ItemList) {

        LoaderUtils.getFilesFromItemList(ItemList,(files,filesMap) => {

            this.loadFiles(files,filesMap);

        });

    }
    /**
 * 加载模型文件列表，在拖拽文件进三维场景时执行。
 * @param {FileList} files 
 * @param {{[key:string]:File}} filesMap 
 */
    loadFiles(files,filesMap) {
        if (files.length > 0) {

            filesMap = filesMap || LoaderUtils.createFilesMap(files);

            const manager = new LoadingManager();
            manager.setURLModifier(url => {

                url = url.replace(/^(\.?\/)/,'');

                const file = filesMap(url);

                if (file) {

                    return URL.createObjectURL(file);

                }

                return url;
            });

            for (let i = 0,length = files.length; i < length; i++) {

                this.loadFile(files[i],manager);

            }
        }

    }

    /**
 * @param {File} file 
 * @param {LoadingManager} manager 
 */
    loadFile(file,manager) {
        const filename = file.name;
        const splitNameArray = filename.split('.');
        const preName = splitNameArray[0];
        const extension = splitNameArray[1].toLowerCase();

        const reader = new FileReader();


        const editor = this.editor;

        switch (extension) {

            case 'glb':

                {
                    const scope = this;
                    reader.addEventListener('load',(event) => {

                        const contents = event.target.result;

                        const loader = scope.createGLTFLoader();

                        this.editor.callbackList.loadProgress('loading');

                        this.editor.loadLength++;

                        loader.parse(contents,'',result => {
                            this.editor.loadLength--;
                            this.#_onGltfLoaded(result,filename,extension);

                            this.editor.callbackList.loadProgress('loaded');

                            loader.dracoLoader?.dispose();
                            loader.ktx2Loader?.dispose();

                        },error => {
                            this.editor.loadLength--;
                            this.editor.callbackList.loadProgress('loaded');
                            console.log(filename,'文件加载出错',error);

                        });

                    },false);

                    reader.readAsArrayBuffer(file);

                    break;

                }

            case 'gltf':

                {

                    reader.addEventListener('load',(event) => {

                        const contents = event.target.result;

                        const loader = createGLTFLoader(manager);

                        this.editor.callbackList.loadProgress('loading');

                        this.editor.loadLength++;

                        loader.parse(contents,'',(result) => {

                            this.editor.loadLength--;
                            // this.#_onGltfLoaded(result,preName);

                            this.editor.callbackList.loadProgress('loaded');

                            loader.dracoLoader?.dispose();
                            loader.ktx2Loader?.dispose();

                        },error => {
                            this.editor.loadLength--;
                            this.editor.callbackList.loadProgress('loaded');
                            console.log(filename,'文件加载出错',error);

                        });

                    },false);
                    reader.readAsArrayBuffer(file);

                    break;

                }

            case 'obj':

                {
                    reader.addEventListener('load',(event) => {

                        const content = event.target.result;

                        // this.#_onObjLoaded(content,preName);

                    },false);
                    reader.readAsText(file);

                    break;

                }

            default:

                console.error('Unsupported file format (' + extension + ').');

                break;

        }

    }
    loadUrls(urls) {
        urls.forEach(this.loadUrl);

    }
    loadUrl = (url,process) => {

        const filename = url.split('/').pop();


        const splitNameArray = filename.split('.');

        // 文件名
        const preName = splitNameArray[0];

        // 文件格式
        const extension = splitNameArray[1].toLowerCase();


        switch (extension) {

            case 'glb':

                {
                    const scope = this;

                    const loader = scope.createGLTFLoader();

                    this.editor.callbackList.loadProgress('loading');

                    this.editor.loadLength++;

                    loader.load(url,gltf => {
                        this.editor.loadLength--;
                        // 加载完成回调：MCP 等待机制将 taskId + uuid 推入队列
                        if (typeof process === 'function') {
                            try { process(gltf,null); } catch (e) { console.warn('[loadUrl] process error:',e); }
                        }
                        this.#_onGltfLoaded(gltf,preName);
                        this.editor.callbackList.loadProgress('loaded');
                        loader.dracoLoader?.dispose();
                        loader.ktx2Loader?.dispose();
                    },null,error => {
                        this.editor.loadLength--;
                        this.editor.callbackList.loadProgress('loaded');
                        console.log(filename,'文件加载出错',error);

                    });

                    break;

                }

            case 'gltf':

                {
                    const scope = this;
                    const loader = scope.createGLTFLoader();

                    this.editor.callbackList.loadProgress('loading');
                    this.editor.loadLength++;

                    loader.load(url,gltf => {
                        this.editor.loadLength--;
                        // 加载完成回调：MCP 等待机制将 taskId + uuid 推入队列
                        if (typeof process === 'function') {
                            try { process(gltf,null); } catch (e) { console.warn('[loadUrl] process error:',e); }
                        }
                        this.#_onGltfLoaded(gltf,filename);

                        this.editor.callbackList.loadProgress('loaded');

                        loader.dracoLoader?.dispose();
                        loader.ktx2Loader?.dispose();

                    },null,error => {
                        this.editor.loadLength--;
                        this.editor.callbackList.loadProgress('loaded');
                        console.log(filename,'文件加载出错',error);

                    });


                    break;

                }

            case 'obj':

                {
                    console.log('暂不支持obj模型文件');

                    break;

                }

            default:

                console.error('Unsupported file format (' + extension + ').');

                break;

        }
    };
    /** loadTwins: 保留供 MCP 使用（离线模式下功能受限） */
    loadTwins = (url, process, param) => {
        // 离线模式简化：直接调用 loadUrl
        this.loadUrl(url, process ? (gltf) => process(gltf, param) : null);
    };
    /** 
 * gltf 加载完成回调，将模型添加入场景，收集动画
 * @param {import("three/examples/jsm/loaders/GLTFLoader").GLTF} gltf 
 * @param {string} filename 
 */
    //todo 如果是初始化现有项目，加载结束后应该清空redo和undo队列
    #_onGltfLoaded(gltf,filename,extension) {
        const editor = this.editor;
        const scene = gltf.scene;
        const processManager = editor.processManager;
        scene.name = filename;

        scene.animations.push(...gltf.animations);// 把动画保存在模型内
        processManager.process(scene,extension);

        // MCP 模型加载等待机制的 pushLoadedModel 已迁移到 load_model_by_url 的 process 回调中，
        // 这里不再调用，以保证：
        //   1. 仅 Agent 触发的加载会进入 loadedModelQueue（UI/拖拽/模板加载不入队）
        //   2. pushLoadedModel 能拿到 taskId 和 uuid 两个参数
    }
}