import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import SubmitView from '../views/Submit.vue'
import HistorysView from '../views/Historys.vue'
import HistoryView from '../views/History.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/Test',
      name: 'Test',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: AboutView
    },
    {
      path:'/Submit',
      name:'Submit',
      component:SubmitView
    },
    {
      path:'/History',
      name:'Historys',
      component:HistorysView
    },
    {
      path:'/History/:id',
      name:'History',
      component:HistoryView
    }
  ]
})

export default router
