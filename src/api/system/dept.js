import request from '@/utils/request'

export function deptOptions(params) {
  return request.get('system/dept/options', { ...params })
}

export function depts() {
  return request.get('system/dept')
}
