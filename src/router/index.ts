import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import AboutView from '../views/About.vue'
import SubmitView from '../views/Submit.vue'
import HistorysView from '../views/Records.vue'
import HistoryView from '../views/Record.vue'
import CreateView from '../views/Create.vue'

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
      path:'/Create',
      name:'Create',
      component:CreateView
    },
    {
      path:'/Submit',
      name:'Submit',
      component:SubmitView
    },
    {
      path:'/Record',
      name:'Records',
      component:HistorysView
    },
    {
      path:'/Record/:id',
      name:'Record',
      component:HistoryView
    }
  ]
})

export default router
