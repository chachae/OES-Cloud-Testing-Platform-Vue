export function checkWebcam() {
// 判断摄像头并调用
  if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
    return true
  } else {
    console.error('该平台没有摄像头设备')
    return false
  }
}
//
// // 访问用户媒体设备的兼容方法
// function getUserMedia(constrains, success, error) {
//   if (navigator.mediaDevices.getUserMedia) {
//     // 最新标准API
//     navigator.mediaDevices.getUserMedia(constrains)
//       .then(success)
//       .catch(error)
//   } else if (navigator.webkitGetUserMedia) {
//     // webkit内核浏览器
//     navigator.webkitGetUserMedia(constrains)
//       .then(success)
//       .catch(error)
//   } else if (navigator.mozGetUserMedia) {
//     // Firefox浏览器
//     navagator.mozGetUserMedia(constrains)
//       .then(success)
//       .catch(error)
//   } else if (navigator.getUserMedia) {
//     // 旧版API
//     navigator.getUserMedia(constrains)
//       .then(success)
//       .catch(error)
//   }
// }
//
// // 成功的回调函数
// function success(stream) {
//   // 兼容webkit内核浏览器
//   var CompatibleURL = window.URL || window.webkitURL
//   // 将视频流设置为video元素的源
//   video.src = CompatibleURL.createObjectURL(stream)
//   // 播放视频
//   video.play()
// }
//
// // 异常的回调函数
// function error(error) {
//   // window.alert(error);
//   console.log('访问用户媒体设备失败：', error.name, error.message)
// }
