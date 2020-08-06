import request from '@/utils/request'

export function statisticScore(paperId) {
  return request.get('exam-basic/score/statistic', { paperId: paperId })
}
