import router from './index';
import { useStore } from '../store/store.js';
import http from '../plugins/http';

export default [
  {
    path: '/:pathMatch(.*)*',
    meta: {
      public: true,
    },
    redirect: {
      path: '/404',
    },
  },
  {
    path: '/404',
    meta: {
      public: true,
    },
    name: 'NotFound',
    component: () =>
      import('../views/error/NotFound.vue'),
  },
  {
    path: '/403',
    meta: { public: true },
    name: 'AccessDenied',
    component: () =>
      import('../views/error/Deny.vue'),
  },
  {
    path: '/500',
    meta: { public: true },
    name: 'ServerError',
    component: () =>
      import('../views/error/Error.vue'),
  },
  {
    path: '/login',
    meta: { public: true },
    name: 'Login',
    component: () =>
      import('../views/Login.vue'),
  },
  {
    path: '/passwordRestore',
    meta: { public: true },
    name: 'PasswordRestore',
    component: () =>
      import('../views/PasswordRestore.vue'),
  },
  {
    path: '/',
    meta: {},
    name: 'Root',
    redirect: {
      name: 'Home',
    },
  },
  {
    path: '/home',
    meta: { breadcrumb: true },
    name: 'Home',
    component: () =>
      import('../views/Home.vue'),
  },
  {
    path: '/client',
    meta: { breadcrumb: true },
    name: 'Client',
    component: () =>
      import(
        '../pages/Client.vue'),
  },
  {
    path: '/warehouse',
    meta: { breadcrumb: true },
    name: 'Warehouse',
    component: () =>
      import(
        '../pages/Warehouse.vue'),
  },
  {
    path: '/dictionary',
    meta: { breadcrumb: true },
    name: 'Dictionary',
    component: () =>
      import(
        '../pages/Dictionary.vue'),
  },
  {
    path: '/truck',
    meta: { breadcrumb: true },
    name: 'Truck',
    component: () =>
      import(
        '../pages/Truck.vue'),
  },
];
