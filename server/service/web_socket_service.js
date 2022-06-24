const path = require('path')
const fileUtils = require('../utils/file_utils')
const WebSocket = require('ws')
// 创建WebSocket服务端的对象, 绑定的端口号是9998
const wss = new WebSocket.Server({
  port: 9998
})

// 服务端开启监听
module.exports.listen = () => {
  // 对客户端的连接事件进行监听
  // client:代表的是客户端的连接socket对象
  wss.on('connection', client => {
    console.log('有客户端连接成功了...');
    // 对客户端的连接对象进行message事件的监听
    // msg:由客户端发给服务端的数据
    client.on('message', async msg => {
      console.log('客户端发送数据给服务端了:' + msg);
      // 由服务端往客户端发送数据
      // client.send('hello socket from backend')
      // 接受到的是字符串,所有要进行JSON解析
      let payload = JSON.parse(msg)
      // 拿出客户端发过来数据的action,因为要判断是拿表数据还是全屏展示还是切换主题
      const action = payload.action
      // 如果要拿表数据,就要拼接路径拿到对应的表数据
      if (action === 'getData') {
        // 这里是拼接路径
        let filePath = `../data/${payload.chartName}.json`
        // 转化成相对路径
        filePath = path.join(__dirname, filePath)
        // 这里利用拿到的数据读取文件拿到数据
        const ret = await fileUtils.getFileJsonData(filePath)
        // 需要在服务端获取到数据的基础之上, 增加一个data的字段
        // data所对应的值,就是某个json文件的内容
        payload.data = ret
        // 将数据返回给前端
        client.send(JSON.stringify(payload))
      } else {
        // 原封不动的将所接收到的数据转发给每一个处于连接状态的客户端
        // wss.clients // 所有客户端的连接
        wss.clients.forEach(client => {
          client.send(JSON.stringify(payload))
        })
      }
    })
  })
}

