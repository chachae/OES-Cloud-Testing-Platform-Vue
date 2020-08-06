import request from '@/utils/request'

export function check(checkParam) {
  return request.get('exam-basic/paperType/check', { ...checkParam })
}

export function paperTypeOptions(params) {
  return request.get('exam-basic/paperType/options', { ...params })
}
