module.exports = {
  title: 'OES分布式在线考试系统',
  // 获取令牌时，请求头信息(Basic Base64.encode(client_id:client_secret))
  authorizationValue: 'Basic b2VzOjEyMzQ1Ng==',
  // 社交登录后台地址
  socialLoginUrl: 'http://api.cloudx.cn:8301/auth/social/login',
  // 请替换为您的实际地址
  pages: {
    // OES-Admin 控制台地址
    springBootAdminUrl: 'http://localhost:8400/login',
    // kibana 控制台地址
    kibanaUrl: 'http://elk.chachae.cn',
    // nacos 控制台地址
    nacosUrl: 'http://nacos.chachae.cn/nacos',
    // skywalking地址
    skywalkingUrl: 'http://localhost:8080/',
    // 文档中心
    docUrl: 'http://localhost:8301/doc.html',
    // Granfana控制台
    grafanaUrl: 'http://localhost:8404/',
    // tx-manager控制台
    txUrl: 'http://localhost:8501/admin/index.html#/login'
  }
}
