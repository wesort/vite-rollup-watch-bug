import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ListView from '../views/ListView.vue'
import NoteView from '../views/NoteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/list/:id?',
      name: 'list',
      component: ListView
    },
    {
      path: '/note/:id',
      name: 'note',
      component: NoteView
    }
  ]
})

export default router
