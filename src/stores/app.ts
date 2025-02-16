import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  roles: {
    active: boolean;
    errorMessages: Array<any>,
    permissions: {
      name: { value: string };
      operationPermissions: string;
    }[];
  }[];
}

interface AppState {
  token: string;
  status: string;
  user: User;
  errorMessages: any[];
  checkAccess: ({ permission, c, r, u, d }: { permission: string; c: boolean; r: boolean; u: boolean; d: boolean }) => boolean;
  http: axios.AxiosInstance | null;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    token: '',
    status: '',
    errorMessages: [],
    user: {
      roles: [],
    },
    checkAccess: () => false,
    http: null,
  }),
  getters: {
    isLoggedIn: state => !!state.token,
  },
  actions: {
    setHttp(http: axios.AxiosInstance): void {
      this.http = http;
    },
    init() {
      return new Promise ((res)=>{
        const token = sessionStorage.getItem('token');
        if (token) {
          this.http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
          this.auth_success(token);
          this.http.get('/auth/current')
            .then(value => {
              this.set_user(value.data);
              res();
            });
        }
      });

    },
    auth_success(payload: string): void {
      this.status = 'success';
      this.token = payload;
    },
    set_expired_date(val: number): void {
      sessionStorage.setItem('expired', val.toString());
    },
    set_user(payload: any): void {
      const hasAccess = (mask: string, c: boolean, r: boolean, u: boolean, d: boolean): boolean => {
        let result = false;
        if (c) result |= Boolean(Number(mask) & 0b1000);
        if (r) result |= Boolean(Number(mask) & 0b0100);
        if (u) result |= Boolean(Number(mask) & 0b0010);
        if (d) result |= Boolean(Number(mask) & 0b0001);
        return !!result;
      };

      this.user = payload;
      this.checkAccess = ({ permission, c, r, u, d }: { permission: string; c: boolean; r: boolean; u: boolean; d: boolean }): boolean => {
        let result = false;
        if (this.user && this.user.roles) {
          result = this.user.roles
            .filter(role =>
              role.active && role.permissions
                .filter(p => p.name.value === permission && hasAccess(p.operationPermissions, c, r, u, d))
                .length > 0)
            .length > 0;
        }
        return result;
      };
    },
    auth_request(): void {
      this.status = 'loading';
    },
    auth_error(): void {
      this.status = 'error';
    },

    login(user: { username: string; password: string }): Promise<any> {
      return new Promise((resolve, reject) => {
        this.auth_request();
        this.http.post('/public/auth/login', user)
          .then(({ data }) => {
            if (data.resultCode.value === 'OK') {
              sessionStorage.setItem('token', data.result);

              const token =  data.result;
              const base64Url = token.split('.')[1];
              const decodedValue = JSON.parse(window.atob(base64Url));

              this.init();

              this.set_expired_date(decodedValue.exp * 1000);
              resolve(data);
            } else {
              reject(data.details || 'Ошибка! Обратитесь к администратору.');
            }
          },
          err => {
            this.auth_error();
            sessionStorage.removeItem('token');
            reject(err.response?.data?.message);
          });
      });
    },

    logout(): Promise<void> {
      return new Promise((resolve) => {
        this.token = '';
        this.user = { roles: [] };
        sessionStorage.removeItem('token');
        resolve();
      });
    },
    refreshToken() {
      return new Promise((resolve, reject) => {
        this.http.get(`/public/auth/refreshToken/${this.token}`)
          .then(resp => {
            if (resp.data) {
              sessionStorage.setItem('token', resp.data);
              const token = resp.data;
              const base64Url = token.split('.')[1];
              const decodedValue = JSON.parse(window.atob(base64Url));
              this.init();
              this.set_expired_date(decodedValue.exp * 1000);
              resolve(resp);
            } else {
              reject(resp.data.message || 'Ошибка! Обратитесь к администратору.');
            }
          },
          err => {
            this.auth_error();
            sessionStorage.removeItem('token');
            reject(err.response?.data?.message);
          }
          );
      });
    },
  },
});
