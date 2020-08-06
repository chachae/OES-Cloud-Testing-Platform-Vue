import request from '@/utils/request'

export function typeOptions() {
  return request.get('exam-basic/type/options')
}
