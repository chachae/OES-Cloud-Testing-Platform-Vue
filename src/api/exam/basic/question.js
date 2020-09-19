import request from '@/utils/request'

export function pageQuestion(params) {
  return request.get('exam-basic/question', { ...params })
}

export function deleteQuestion(ids) {
  return request.delete(`exam-basic/question/${ids}`)
}
