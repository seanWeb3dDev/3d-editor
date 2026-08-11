// | term        | 主名称          |
// | alias       | 支持模糊搜索（非常关键） |
// | description | 展示内容         |
export default [
  {
    id: "AmbientLight",
    term: "环境光",
    alias: ["光", "环境光"],
    description: "没有特定方向，只是整体改变场景的光照明暗。",
  },
  {
    id: "DirectionalLight",
    term: "平行光",
    alias: ["光", "平行光"],
    description: "就是沿着特定方向发射,常用于模拟太阳。",
  },
  {
    id: "SpotLight",
    term: "聚光源",
    alias: ["光", "聚光源"],
    description:
      "聚光源可以认为是一个沿着特定方会逐渐发散的光源，照射范围在三维空间中构成一个圆锥体。",
  },
  {
    id: "PointLight",
    term: "点光源",
    alias: ["光", "点光源"],
    description:
      "点光源PointLight可以类比为一个发光点，就像生活中一个灯泡以灯泡为中心向四周发射光线。",
  },
  {
    id: "shadow_resolution",
    term: "阴影精度",
    parent: "阴影",
    alias: ["阴影分辨率"],
    description:
      "决定阴影贴图分辨率，数值越高阴影越清晰，但性能消耗越大。高性能：512（默认），普通：1024，高精：2048，超高精：4096",
  },
  {
    id: "sample_radius",
    parent: "阴影",
    term: "采样半径",
    alias: ["sample radius", "shadow radius"],
    description:
      "控制阴影边缘模糊程度，大于1时边缘变软。数值过高可能产生带状自阴影问题，高精度阴影下可适当提高",
  },
  {
    id: "blur_samples",
    parent: "阴影",
    term: "模糊采样",
    alias: ["blur samples", "shadow samples"],
    description: "阴影模糊计算时的采样数量，数值越高阴影越平滑，但性能开销越大",
  },
  {
    id: "shadow_bias",
    parent: "阴影",
    term: "偏移",
    alias: ["shadow bias", "depth bias"],
    description: "阴影贴图偏移量，默认0，通常使用微小负值（如-0.0001）来减少自阴影问题",
  },
  {
    id: "normal_bias",
    parent: "阴影",
    term: "法线偏移",
    alias: ["normal bias"],
    description:
      "沿物体法线方向偏移阴影采样位置，可减少低角度光照下的伪阴影，但可能导致阴影失真或漂浮",
  },
  {
    id: "shadow_frustum",
    parent: "阴影",
    term: "直线光阴影视距",
    alias: ["近视距离", "远视距离", "阴影上距", "阴影下距", "阴影右距", "阴影左距", "平行光"],
    description: `定义平行光阴影的有效范围，只有在该区域内的物体才会产生阴影，可通过上下左右及近远裁剪面调整。
      可通过 工具栏 -> 灯光线 操作 查看有效范围`,
  },
  {
    id: "render_order",
    term: "渲染顺序",
    alias: ["渲染顺序"],
    description: `Three.js 中的 renderOrder 是一个控制渲染顺序的属性，用于解决深度冲突（Z-fighting）和实现特定的视觉效果。<br/>
Render Order（渲染顺序）：指 WebGL 渲染器在每一帧中绘制场景中物体的先后顺序。<br/>
Three.js 默认按照物体到相机的距离（深度）进行排序，但 renderOrder 允许开发者手动覆盖这一行为，强制指定特定物体的渲染优先级。<br/>
1. 强制渲染优先级<br/>
值越小，越早被渲染（默认值为 0）<br/>
2. 解决深度冲突（Z-Fighting）<br/>
当两个物体重叠或非常接近时，GPU 难以判断哪个在前，导致闪烁<br/>
`,
  },
  {
    id: "render_order",
    term: "深度写入测试",
    alias: ["深度写入", "深度测试", "渲染顺序", "深度缓冲"],
    description: `深度缓冲（Z-Buffer）基础
GPU 在渲染时维护一个与屏幕像素对应的深度缓冲（Depth Buffer / Z-Buffer），存储每个像素点到相机的距离值。<br/>
深度测试（Depth Test）GPU 在绘制像素前，将该像素的新深度值与深度缓冲中已存在的值进行比较，决定是否绘制此像素。
解决"物体遮挡"问题——确保远处的物体不会覆盖近处的物体。<br/>
深度写入（Depth Write）绘制像素时，是否将该像素的深度值写入深度缓冲，供后续渲染参考。
控制当前物体是否"留下深度痕迹"，影响后续物体的深度测试。
`,
  },
  {
    id: "map",
    term: "贴图",
    alias: ["贴图", "map", "纹理"],
    description: `一张 2D 图像，映射到 3D 模型表面，决定物体每个像素点的基础颜色（RGB）。它替代或调制材质的 color 属性。
`,
  },
  {
    id: "wrapST",
    term: "贴图包裹模式",
    alias: ["水平包裹", "垂直包裹", "边缘拉伸", "夹紧边缘", "镜像重复", "重复", "纹理重复"],
    description: `夹紧边缘：UV 超出 0~1 时，使用边缘像素颜色无限延伸。<br/>
    重复：UV 超出 0~1 时，纹理重复平铺。 4， 4  水平和垂直各重复 4 次<br/>
    镜像重复：UV 超出 0~1 时，纹理像镜子一样反射平铺。
`,
  },
  {
    id: "DoubleSide",
    term: "正反显示",
    alias: ["正反显示", "正面", "反面", "正反面"],
    description: `面3D 模型由三角形组成，每个三角形有正面和背面，由顶点绕序决定。<br/>
正面：顶点按逆时针 排列时朝向观察者的一面 只渲染正面，背面完全透明不可见<br/>
性能最优，GPU 可剔除约 50% 不可见面<br/>
背面：顶点按顺时针 排列的一面，默认被剔除以优化性能 只渲染背面，正面透明不可见<br/>
正反面: 都渲染：性能开销 ×2（GPU 无法剔除背面）<br/>
`,
  },
  {
    id: "Metalness",
    term: "金属度",
    alias: ["金属度", "材质"],
    description: `控制材质是金属还是非金属（电介质）的线性参数。<br/>
    决定漫反射颜色的是否参与计算<br/>
    金属：漫反射为黑色（纯镜面反射），反射环境光并带有金属色调<br/>
    非金属：漫反射保留 color/map 的颜色，反射为灰度<br/>
`,
  },
  {
    id: "Roughness",
    term: "粗糙度",
    alias: ["粗糙度", "材质"],
    description: `控制材质表面的光滑程度，影响反射/高光区域的模糊或锐利程度。<br/>
低粗糙度：反射清晰，高光锐利（镜子、抛光金属、光滑塑料）<br/>
高粗糙度：反射模糊，无明确高光（混凝土、天鹅绒、泥土）<br/>
`,
  },
  {
    id: "transparent",
    term: "透明度",
    alias: ["透明度", "是否透明"],
    description: `控制整个材质的整体透明程度。值为 0.0~1.0，越低越透明。<br/>
注意：透明度 仅在 是否透明打开时 生效。
`,
  },
  {
    id: "Emissive",
    term: "外发光",
    alias: ["自发光", "外发光", "发光强度"],
    description: `材质自身发出的光的颜色，不受场景光照影响。模拟灯泡、霓虹灯、岩浆等主动发光体。<br/>
独立于光照：即使场景全黑，外发光 部分依然可见<br/>
叠加到基础颜色：最终颜色 = 基础光照计算 + 外发光<br/>
不照亮其他物体：仅为视觉效果，不是真实光源（需配合 PointLight 等实现照明）<br/>
EmissiveIntensity（发光强度）<br/>
控制自发光颜色的强度倍率，实现从微弱辉光到强烈曝光的效果。
`,
  },
  {
    id: "color",
    term: "颜色",
    alias: ["基础颜色", "颜色", "color"],
    description: `物体表面在白光照射下反射的固有颜色，即物体"本身的颜色"。<br/>
    1. 漫反射基础色 决定光照计算中漫反射部分的颜色：<br/>
①白光下呈现 color 本身<br/>
②有色光下与光源颜色混合<br/>
③黑暗环境中不可见（除非有 外发光）<br/>
2. 与贴图相乘 当存在 map（颜色贴图）时，color 变为色调乘数：
`,
  },
  {
    id: "duration",
    parent: "粒子",
    term: "特效时长",
    alias: ["特效时长"],
    description: `粒子系统的持续时间（以秒为单位）`,
  },
  {
    id: "looping",
    parent: "粒子",
    term: "是否循环",
    alias: ["是否循环"],
    description: `粒子系统是否应在持续时间后循环`,
  },
  {
    id: "startLife",
    parent: "粒子",
    term: "生命周期",
    alias: ["是否循环"],
    description: `粒子的初始寿命（以秒为单位） 区间范围a-b`,
  },
  {
    id: "startSize",
    parent: "粒子",
    term: "起始尺寸",
    alias: ["起始尺寸"],
    description: `粒子的初始大小（以秒为单位） 区间范围a-b`,
  },
  {
    id: "startSpeed",
    parent: "粒子",
    term: "起始速度",
    alias: ["起始速度"],
    description: `粒子的初始速度（以秒为单位） 区间范围a-b`,
  },
  {
    id: "startRotation",
    parent: "粒子",
    term: "起始角度",
    alias: ["起始角度"],
    description: `粒子的初始角度 区间范围a-b`,
  },
  {
    id: "startColor",
    parent: "粒子",
    term: "起始颜色",
    alias: ["起始颜色", "固定颜色", "随机颜色"],
    description: `粒子的初始颜色 固定颜色 单一确定颜色<br/>
    随机颜色 区间范围a-b 之间的随机颜色`,
  },
  {
    id: "number",
    parent: "粒子",
    term: "粒子数量",
    alias: ["粒子数量"],
    description: `粒子的初始数量`,
  },
  {
    id: "RenderMode",
    parent: "粒子",
    term: "渲染模式",
    alias: ["渲染模式", "几何体"],
    description: `粒子被渲染为实例网格Mesh`,
  },
  {
    id: "direction",
    parent: "粒子 / 行为",
    term: "方向力",
    alias: ["方向力", "行为", "粒子"],
    description: `对粒子施加恒定的力，随时间影响它们的速度。对粒子应用持续的恒定力（如重力、风力）。`,
  },
  {
    id: "direction",
    parent: "粒子 / 行为",
    term: "力度",
    alias: ["方向力", "引力", "随机行为", "行为", "粒子"],
    description: `对粒子施加作用的大小`,
  },
  {
    id: "direction",
    parent: "粒子 / 行为 / 方向力",
    term: "方向",
    alias: ["方向力", "方向", "行为", "粒子"],
    description: `对粒子施加的力的三维向量方向`,
  },
  {
    id: "GravityForce",
    parent: "粒子 / 行为",
    term: "引力",
    alias: ["引力", "重力", "行为", "粒子"],
    description: `施加重力，将粒子拉向中心点。`,
  },
  {
    id: "center",
    parent: "粒子 / 行为 / 引力",
    term: "中心点",
    alias: ["引力", "重力", "中心点", "行为", "粒子"],
    description: `施加力，将粒子拉向中心点的位置。 设置重力引力的位置。`,
  },
  {
    id: "Noise",
    parent: "粒子 / 行为",
    term: "随机行为",
    alias: ["随机行为", "行为", "粒子"],
    description: `为粒子位置和旋转添加随机噪声。`,
  },
  {
    id: "Noise",
    parent: "粒子 / 行为",
    term: "随机行为",
    alias: ["随机行为", "行为", "粒子"],
    description: `为粒子位置和旋转添加随机噪声。`,
  },
  {
    id: "frequency",
    parent: "粒子 / 行为 / 噪音",
    term: "频率",
    alias: ["随机行为", "频率", "行为", "粒子"],
    description: `粒子产生的噪音频率`,
  },
  {
    id: "positionAmount",
    parent: "粒子 / 行为 / 噪音",
    term: "位移量",
    alias: ["随机行为", "位移量", "行为", "粒子"],
    description: `影响粒子位移的数值 范围0-1`,
  },
  {
    id: "rotationAmount",
    parent: "粒子 / 行为 / 噪音",
    term: "旋转量",
    alias: ["随机行为", "旋转量", "行为", "粒子"],
    description: `影响粒子旋转的数值 范围0-1`,
  },
];
