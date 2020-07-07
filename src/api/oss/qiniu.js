import request from '@/utils/request'
import { Message } from 'element-ui'
import { qiNiuUrl } from '@/settings'
export function page(params) {
  return request.get('oss-qiniu/content', { ...params })
}

export function upload(params) {
  return request.upload(qiNiuUrl, params)
}

export function del(id) {
  return request.delete(`oss-qiniu/content/${id}`).then(() => {
    Message({
      message: '删除成功',
      type: 'success'
    })
  })
}

export function synchronize() {
  return request.post('oss-qiniu/content/synchronize').then(() => {
    Message({
      showClose: true,
      message: '同步成功',
      duration: 5000,
      type: 'success'
    })
  })
}

export function getConfig() {
  return request.get(`oss-qiniu/config`)
}

export function download(id) {
  return request.get(`oss-qiniu/content/download/${id}`)
}

export function updateConfig(qiNiuConfig) {
  return request.put('oss-qiniu/config', { ...qiNiuConfig })
}

export default { getConfig, upload, updateConfig, page, del, synchronize, download }
