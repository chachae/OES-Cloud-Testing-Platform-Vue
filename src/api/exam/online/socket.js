import request from '@/utils/request'

export function sendOne(params) {
  request.post('exam-online/monitor/send', { message: params })
}
