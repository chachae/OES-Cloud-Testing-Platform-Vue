import request from '@/utils/request'

export function getContent(contentId) {
  return request.get(`system/announce/content/${contentId}`)
}

export function pageActive(params) {
  return request.get('system/announce/active', { ...params })
}
