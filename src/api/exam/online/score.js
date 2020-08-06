import request from '@/utils/request'

export function statisticScore(params) {
  return request.get(`exam-online/score/statistic`, { ...params })
}
