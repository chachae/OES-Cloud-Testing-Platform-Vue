import request from '@/utils/request'

export function get() {
  return request.get('system/user/index')
}

export default { get }
