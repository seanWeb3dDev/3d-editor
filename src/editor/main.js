import { Editor } from "./core/Editor";
import { Viewport } from "./core/Viewport";
import { registerEvents } from "./core/EventRegister";
import { registerFunctions,_FUNCS,_AddObjectList } from "./core/FunctionRegister";

export function editorInit(dom) {


	const editor = new Editor(dom);

	Viewport(editor);
	registerEvents(editor);
	registerFunctions(editor);

	// MCP 连接改为手动触发（顶部栏开关），不再自动连接

	window.addEventListener("resize",event => {
		editor.editorEM.windowResize.dispatch();
	});


	editor.editorEM.windowResize.dispatch();

	const doc = document;

	doc.addEventListener("dragover",event => {

		event.preventDefault();

		event.dataTransfer.dropEffect = "copy";

	});
	doc.addEventListener("drop",event => {

		event.preventDefault();

		if (event.dataTransfer.types[0] === "text/plain") return;

		if (event.dataTransfer.items) {

			editor.loader.loadItemList(event.dataTransfer.items);

		} else {

			editor.loader.loadFiles(event.dataTransfer.files);

		}

	});



	return editor;
}
