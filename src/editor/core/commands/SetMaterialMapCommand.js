import { Command } from '../../library';
import { EquirectangularReflectionMapping,SRGBColorSpace,Vector2,RepeatWrapping } from 'three';
import { Editor } from "../Editor";
import * as Util from "../Util";


class SetMaterialMapCommand extends Command {
	/**
	 * @param editor Editor
	 * @param object THREE.Object3D
	 * @param mapType string
	 * @param newMap THREE.Texture
	 * @constructor
	 */

	constructor(editor,material,mapType,newMap) {

		super(editor);

		this.editorEM = editor.editorEM;

		this.editor = editor;

		this.type = 'SetMaterialMapCommand';
		this.name = `Set Material.${mapType}`;

		this.material = material;


		this.oldMap = this.material[mapType];


		this.newMap = newMap;
		this.mapType = mapType;

	}

	execute() {

		Util.toTexture(this.newMap,{ imageOrientation: 'none' }).then(texture => {

			if (texture) {
				texture.mapping = EquirectangularReflectionMapping;
				texture.colorSpace = SRGBColorSpace;
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;

				// 纹理替换时直接替换整个纹理而不是texture.image，并且不修改新texture的属性，否则会影响历史操作
				this.material[this.mapType] = texture;

			} else {
				this.material[this.mapType] = null;
			}

			this.editorEM.textureUvFlowChanged.dispatch(this.material);

			this.material.needsUpdate = true;

			this.editorEM.materialChanged.dispatch();


			if (this.oldMap) this.oldMap.dispose();

			const target = this.editor.selected || this.material;

			this.editorEM.attributeChanged.dispatch(target.uuid);


		});

	}

	undo() {

		const map = this.material[this.mapType];


		this.material[this.mapType] = this.oldMap;


		this.editorEM.textureUvFlowChanged.dispatch(this.material);

		this.material.needsUpdate = true;
		this.editorEM.materialChanged.dispatch();

		if (map) map.dispose;

		const target = this.editor.selected || this.material;

		this.editorEM.attributeChanged.dispatch(target.uuid);



	}

	toJSON() {


	}

	fromJSON(json) {

	}
}

export { SetMaterialMapCommand };
