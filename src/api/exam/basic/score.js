import request from '@/utils/request'

export function statisticScore(paperId) {
  return request.get('exam-basic/score/statistic', { paperId: paperId })
}

export function updateStatus(scoreId, status) {
  return request.put('exam-basic/score', { scoreId: scoreId, status: status })
}

export function pageScore(params) {
  return request.get('exam-basic/score', { ...params })
}
