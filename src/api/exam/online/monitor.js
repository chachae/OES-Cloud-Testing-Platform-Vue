import request from '@/utils/request'

export function getExam(params) {
  return request.get('exam-online/monitor', { ...params })
}
