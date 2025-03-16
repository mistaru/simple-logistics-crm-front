import type { RouteRecordRaw } from 'vue-router';

const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile.vue'),
  },
  {
    path: '/auth',
    name: 'Users',
    component: () => import('@/pages/Credentials/Users.vue'),
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('@/pages/Credentials/Roles.vue'),
  },
  {
    path: '/permission',
    name: 'Permission',
    component: () => import('@/pages/Credentials/Permissions.vue'),
  },
  {
    path: '/client',
    name: 'Client',
    component: () => import('@/pages/Client.vue'),
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    component: () => import('@/pages/Warehouse.vue'),
  },
  {
    path: '/country',
    name: 'Country',
    component: () => import('@/pages/Country.vue'),
  },
  {
    path: '/city',
    name: 'City',
    component: () => import('@/pages/City.vue'),
  },
  {
    path: '/truck',
    name: 'Truck',
    component: () => import('@/pages/Truck.vue'),
  },
  {
    path: '/cargo',
    name: 'Truck',
    component: () => import('@/pages/Truck.vue'),
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
  },
];

export default staticRoutes;
