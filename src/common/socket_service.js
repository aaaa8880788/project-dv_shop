export default class SocketService {
  // 加上static代表是类的方法或者属性,不会被实例继承
  // 而且里面的this指向的是类而不是创建出来的实例
  // 在类里面添加的属性和方法实际是存在它的prototype里面的
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService
    }
    return this.instance
  }
  // 和服务端连接的socket对象
  ws = null

  // 存储回调函数
  callBackMapping = {}

  // 标识是否连接成功
  connected = false

  // 记录重试的次数
  sendRetryCount = 0

  // 重新连接尝试的次数
  connectRetryCount = 0

  // 定义连接服务器的方法
  connect() {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket');
    }
    // 这里的this指的是实例对象
    this.ws = new WebSocket('ws://localhost:9998')

    // 连接成功的事件
    this.ws.onopen = () => {
      console.log('连接服务端成功了...');
      // 将是否连接成功标识重置
      this.connected = true
      // 重置重新连接的次数
      this.connectRetryCount = 0
    }

    // 连接失败的事件
    // 1.连接服务端失败
    // 2.当连接成功之后,服务器关闭的情况
    this.ws.onclose = () => {
      console.log('连接服务端失败了...');
      this.connected = false
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, 500 * this.connectRetryCount);
    }

    // 得到服务端发送过来的数据
    this.ws.onmessage = msg => {
      console.log('从服务端获取到了数据');
      // 真正服务端发送过来的原始数据是在msg中的data字段
      // console.log(msg.data)
      const resData = JSON.parse(msg.data)
      const socketType = resData.socketType
      // 判断回调函数是否存在
      if (this.callBackMapping[socketType]) {
        const action = resData.action
        if (action === 'getData') {
          const realData = JSON.parse(resData.data)
          this.callBackMapping[socketType](realData)
        } else if (action === 'fullScreen') {
          this.callBackMapping[socketType](resData)
        } else if (action === 'themeChange') {
          this.callBackMapping[socketType](resData)
        }
      }
    }
  }

  // 回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack
  }

  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }

  // 发送数据的方法
  send(data) {
    // 判断此时此刻有没有连接成功
    if (this.connected) {
      this.sendRetryCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, this.sendRetryCount * 500)
    }
  }
}