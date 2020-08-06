import request from '@/utils/request'

export function userIndex() {
  return request.get('system/user/index')
}

export function page(params) {
  return request.get('system/user', { ...params })
}

export function get(userId) {
  return request.get(`system/user/${userId}`)
}

export function del(userIds) {
  return request.delete(`system/user/${userIds}`)
}

export function resetPassword(userNames) {
  return request.put(`system/user/password/reset`, {
    usernames: userNames.join(',')
  })
}

export function options(params) {
  return request.get('system/user/options', { ...params })
}

export default { page, get, del, resetPassword }
