import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Form',
    component: () => import('@/views/FormPage.vue'),
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('@/views/PreviewPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
