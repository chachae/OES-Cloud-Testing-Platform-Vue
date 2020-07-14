import request from '@/utils/request'

export function examIndex() {
  return request.get('exam-basic/statistic/index')
}
