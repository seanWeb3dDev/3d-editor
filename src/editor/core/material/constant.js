/** @description 灯光风格控制器 4白天，8夜晚 16科技风 */
export const DAY = 4;
export const NIGHT = 8;
export const SCIENCE = 16;
export const lightingPattern = {
    value: DAY,
};
export const elapsedTime = {
    value: 0,
};

// 时间参数
export function shaderUpdateTime(time) {
    elapsedTime.value = time;

}