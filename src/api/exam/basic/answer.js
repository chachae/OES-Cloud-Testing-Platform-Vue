import request from '@/utils/request'

export function page(params) {
  return request.get('exam-basic/answer', { ...params })
}

export function update(params) {
  return request.put('exam-basic/answer', { ...params })
}
