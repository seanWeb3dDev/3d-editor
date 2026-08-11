import { EdgesGeometry, LineSegments, LineBasicMaterial, Vector3, FrontSide } from "three";

/**
 * @description 绘制模型轮廓线方法
 */
export function generateEdgeLine(obj, set = {}) {
  let color = set.color || "white";
  let opacity = set.opacity || 1;
  let clone = set.clone || false;
  let threshold = set.threshold || 1;
  let width = set.width || 1;
  let edges = new EdgesGeometry(clone ? obj.geometry.clone() : obj.geometry, threshold);
  let line = new LineSegments(
    edges,
    new LineBasicMaterial({
      color: color,
      linewidth: width,
      transparent: true,
      opacity: opacity,
      side: FrontSide,
    }),
  );
  const vec = new Vector3();
  obj.getWorldPosition(vec);
  line.scale.copy(obj.scale);
  line.position.copy(vec);
  line.rotation.copy(obj.rotation);
  return line;
}
