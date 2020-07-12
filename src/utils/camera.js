export function checkCamera() {
  // 获取媒体属性，旧版本浏览器可能不支持mediaDevices，我们首先设置一个空对象
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {}
  }
  // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
  // 使用getUserMedia，因为它会覆盖现有的属性。
  // 这里，如果缺少getUserMedia属性，就添加它。
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // 首先获取现存的getUserMedia(如果存在)
      // 有些浏览器不支持，会返回错误信息，保持接口一致
      return navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia
    }
  }
  return true
}
