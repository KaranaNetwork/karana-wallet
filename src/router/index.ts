import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Config from '@/lib/config/config';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/IndexView.vue'),
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('@/views/AccountsView.vue'),
  },
  {
    path: '/inscribe',
    name: 'inscribe',
    component: () => import('@/views/InscribeView.vue'),
  },
  {
    path: '/tokens',
    name: 'tokens',
    component: () => import('@/views/TokensView.vue'),
  },
  {
    path: '/token/info',
    name: 'token_info',
    component: () => import('@/views/token/TokenInfoView.vue'),
  },
  {
    path: '/activities',
    name: 'activities',
    component: () => import('@/views/ActivitiesView.vue'),
  },
  {
    path: '/explorer',
    redirect: '/explorer/index',
  },
  {
    path: '/explorer/index',
    name: 'explorer_index',
    component: () => import('@/views/explorer/ExplorerIndexView.vue'),
  },
  {
    path: '/explorer/batches',
    name: 'explorer_batches',
    component: () => import('@/views/explorer/ExplorerBatchesView.vue'),
  },
  {
    path: '/explorer/blocks',
    name: 'explorer_blocks',
    component: () => import('@/views/explorer/ExplorerBlocksView.vue'),
  },
  {
    path: '/explorer/block',
    name: 'explorer_block',
    component: () => import('@/views/explorer/ExplorerBlockView.vue'),
  },
  {
    path: '/explorer/transactions',
    name: 'explorer_transactions',
    component: () => import('@/views/explorer/ExplorerTransactionsView.vue'),
  },
  {
    path: '/explorer/transaction',
    name: 'explorer_transaction',
    component: () => import('@/views/explorer/ExplorerTransactionView.vue'),
  },
  {
    path: '/transform',
    name: 'transform',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/BridgeView.vue'),
  },
  {
    /**
     * 进行我们的路由匹配，通俗来讲就是比如我们是http://localhost:8080
     * 匹配我们/后面的如果你乱写的话就会重定向我们的404路由
     * 举个例子
     *   { path: '/user-:afterUser(.*)',      redirect: '/notfound},
     * 匹配我们/user后面的内容，如果你乱写的话就会进入404
     */
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = (to?.meta?.title as string) ?? Config.title;
  next();
});

export default router;
