import request from '@/utils/request'

export function typeOptions() {
  return request.get('exam-basic/type/options')
}

export function checkType(name) {
  return request.get(`exam-basic/type/check/${name}`)
}

export function saveType(params) {
  return request.post('exam-basic/type', { ...params })
}

export function updateType(params) {
  return request.put('exam-basic/type', { ...params })
}

export function deleteType(params) {
  return request.delete(`exam-basic/type/${params}`)
}

export function pageType(params) {
  return request.get('exam-basic/type', { ...params })
}
