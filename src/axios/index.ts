import axios from 'axios';
import { useAppStore } from '@/stores/app.ts';
import router from '../router/';

const http = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? '/api'
      : 'http://localhost:8081/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 180000,
});
const token = sessionStorage.getItem('token');
if (token) {
  http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

http.interceptors.response.use(
  response => {
    return response;
  },
  err => {
    return new Promise((_, reject) => {
      if (err?.response?.status === 401) {
        const store = useAppStore();
        store.logout();
        router.push('/login');
      } else {
        reject(err);
      }
    });
  }
);

export default http;
