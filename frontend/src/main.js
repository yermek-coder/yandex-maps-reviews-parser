import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/global.css'
import { createRouter, createWebHistory } from 'vue-router'
import Reviews from '@/components/pages/reviews.vue'
import Settings from '@/components/pages/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/reviews/:id', component: Reviews },
    { path: '/', component: Settings },
  ],
})

const app = createApp(App).use(router).mount('#app')
