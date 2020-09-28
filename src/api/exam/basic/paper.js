import request from '@/utils/request'

export function page(params) {
  return request.get('exam-basic/paper', { ...params })
}

export function del(ids) {
  return request.delete(`exam-basic/paper/${ids}`)
}

export function updatePaper(params) {
  return request.put('exam-basic/paper', { ...params })
}

export function random(params) {
  return request.post('exam-basic/paper/random', { ...params })
}
