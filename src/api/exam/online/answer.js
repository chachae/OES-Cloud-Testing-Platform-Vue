import request from '@/utils/request'

export function updateAnswer(question) {
  return request.put('exam-online/answer', { ...question })
}
