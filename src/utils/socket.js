export function connectSocket(socket, username, fullName, paperId) {
  let url
  const isHttps = document.location.protocol === 'https:'
  if (isHttps) {
    url = 'wss://127.0.0.1:10086/ws-exam-online/monitor?username=' + username + '&fullName=' + fullName
  } else {
    url = 'ws://127.0.0.1:10086/ws-exam-online/monitor?username=' + username + '&fullName=' + fullName
  }
  if (paperId !== null) {
    url += '&paperId=' + paperId
  }
  return new WebSocket(url)
}
