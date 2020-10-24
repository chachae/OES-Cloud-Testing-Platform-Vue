import request from '@/utils/request'

export function updateAnswer(question) {
  return request.put('exam-online/answer', { ...question })
}

export function saveAnswer(question) {
  return request.post('exam-online/answer', { ...question })
}

