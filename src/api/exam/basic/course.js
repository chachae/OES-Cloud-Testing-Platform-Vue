import request from '@/utils/request'

export function page(params) {
  return request.get('exam-basic/course', { ...params })
}

export function save(params) {
  return request.post('exam-basic/course/', { ...params })
}

export function del(courseId) {
  return request.delete(`exam-basic/course/${courseId}`)
}

export function update(params) {
  return request.put('exam-basic/course', { ...params })
}

export function check(courseName) {
  return request.get('exam-basic/course/check', { ...courseName })
}

export function courseOptions() {
  return request.get('exam-basic/course/options')
}
