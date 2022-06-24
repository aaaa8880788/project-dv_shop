import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入全局样式
import '@/assets/css/global.css'
// 引入字体的文件
import './assets/font/iconfont.css'
// 引入echarts
import * as echarts from 'echarts';
// 引入图表主题
import '@/assets/theme/chalk.js'
import '@/assets/theme/vintage.js'
// WebSocket部分
import SocketService from '@/common/socket_service'
// 对服务端进行webSocket的连接
SocketService.Instance.connect()
// 将创建的实例对象挂载到vue的原型对象上
Vue.prototype.$socket = SocketService.Instance


// 将全局的echarts对象挂载到Vue的原型对象上
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
