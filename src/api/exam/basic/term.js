import request from '@/utils/request'

export function termOptions() {
  return request.get('exam-basic/term/options')
}

export function checkName(name) {
  return request.get('exam-basic/term/check', { termName: name })
}

export function saveTerm(params) {
  return request.post('exam-basic/term', { ...params })
}

export function updateTerm(params) {
  return request.put('exam-basic/term', { ...params })
}

export function deleteTerm(termId) {
  return request.delete(`exam-basic/term/${termId}`)
}

export function pageTerm(params) {
  return request.get('exam-basic/term', { ...params })
}
