import request from '@/utils/request'

export function pageLog(params) {
  return request.get('exam-basic/exam/violatelog', { ...params })
}

export function saveLog(paperId, code, violateTime) {
  return request.post('exam-basic/exam/violatelog', { paperId: paperId, code: code, violateTime: violateTime })
}

export function deleteLog(ids) {
  return request.delete(`exam-basic/exam/violatelog/${ids}`)
}

export function checkMaxLog(paperId) {
  return request.get('exam-basic/exam/violatelog/check', { paperId: paperId })
}

export function getCount(paperId) {
  return request.get('exam-basic/exam/violatelog/count', { paperId: paperId })
}
