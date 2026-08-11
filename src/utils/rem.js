// 获取当前显示设备的物理像素分辨率与CSS像素分辨率之比;
function setHtmlFontSize() {
  const width = document.documentElement.getBoundingClientRect().width
  const height = document.documentElement.getBoundingClientRect().height
  const screenDesignRatio = 1920 / 1080
  const screenRatio = width / height
  const w = (width / 1920) * 16
  const h = (height / 1080) * 16
  let scale = null
  if (!width) return
  if (screenRatio < screenDesignRatio) {
    scale = w
  } else {
    scale = h
  }
  document.documentElement.style.fontSize = `${scale.toFixed(2)}px`
}
setHtmlFontSize()
window.addEventListener('resize', () => {
  setHtmlFontSize()
})
