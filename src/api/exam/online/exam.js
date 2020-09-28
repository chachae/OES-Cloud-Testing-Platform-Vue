import request from '@/utils/request'

export function getExamPaper(paperId) {
  return request.get(`exam-online/exam/${paperId}`)
}
