import request from '@/utils/request'

export function termOptions() {
  return request.get('exam-basic/term/options')
}
