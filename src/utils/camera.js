/**
 * 摄像头（webcam）检测
 * @returns {boolean}
 */
export function checkWebcam() {
  return openCamera() !== null
}

export function openCamera() {
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {}
  }
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // 首先，如果有getUserMedia的话，就获得它
      const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
      // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia 浏览器不支持摄像头'))
      }
      // 否则，为老的navigator.getUserMedia方法包裹一个Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }
  const constraints = {
    video: true,
    audio: false
  }
  return navigator.mediaDevices.getUserMedia(constraints)
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
