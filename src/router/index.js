import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter)

// 路由懒加载
const screenPage = () => import('@/views/ScreenPage')

const routes = [
  {
    path: '',
    redirect: '/screenPage',
  },
  {
    path: '/screenPage',
    component: screenPage
  },
]

const router = new VueRouter({
  mode: 'hash',
  // base: process.env.BASE_URL,
  routes
})

export default router