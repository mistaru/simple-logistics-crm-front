import axios from 'axios';
import { useAppStore } from '@/stores/app';
import router from '../router/index';
const origin = window.location.origin;
const dnsMapper:Record<string, string> = {
  'localhost': 'http://localhost:8081/api',
  'test': 'http://localhost:8081/api',
  'https://logistic.kg': 'https://logistic.kg/api/',
};
const getBaseUrl = () => {
  const matchedKey = Object.keys(dnsMapper).find(key => origin.includes(key));
  return matchedKey ? dnsMapper[matchedKey] : dnsMapper.test;
};

const axiosIns = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 180000,
});

axiosIns.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosIns.interceptors.response.use(
  response => {
    return response;
  },
  err => {
    return new Promise((_, reject) => {
      if ([401, 403].includes(err?.response?.status)) {
        const store = useAppStore();
        store.logout();
        router.push('/login');
      } else {
        reject(err);
      }
    });
  }
);

export default axiosIns;
