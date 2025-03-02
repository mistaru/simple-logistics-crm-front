import { defineStore } from 'pinia';
//import { ACTIVE_PRODUCT_TYPES } from '@/const/api';

export const useStore = defineStore('store',{
  state: () => ({
    creditProductTypes: [],
    windowWidth: 0,
    globalErrorMessage: {},
    status: '',
    token: sessionStorage.getItem('token') || '',
    exp: sessionStorage.getItem('expired') || 0,
    user: {
      roles: [],
    },
    http: null,
    checkAccess: () => false,
    loading: false,
    errorMessages: [],
    currentApplication: null,
    currentProduct: null,
    permissionsMenus: [],
    lastUserActiveTime: null,
    videoIdentificationInProcess: null,
    key: 'firstKey',
    time: {
      from: new Date().toJSON().slice(0, 10) + ' 00:00',
      to: new Date().toJSON().slice(0, 10) + ' 23:59',
    },
    initData: {
      incoming: {
        url: '/application/incoming',
        values: [],
      },
      outgoing: {
        url: '/application/outgoing',
        values: [],
      },
      all: {
        url: '/application/all?dateFrom=&dateTo=',
        values: [],
      },
    },

  }),
  getters: {
    modalWidth: state => {
      let dw = (700 / state.windowWidth) * 90;
      if (state.windowWidth > 1280) return '30vw';
      else if (state.windowWidth < 700) return '90vw';
      else return Math.round(dw) + 'vw';
    },
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    username: state => state.user.username,
    globalErrorDialog: state => state.globalErrorMessage && state.globalErrorMessage.message,
    allRoles: state => state.user.roles || [],
    activeRole: state => (state.user.roles || []).filter(role => role.active).values().next().value,
    expired: state => state.exp,
  },

  actions: {
    updateApp() {
      this.key = this.key === 'firstKey' ? 'secondKey' : 'firstKey';
    },
    setHttp(http) {
      this.http = http;
    },
    setTime(payload) {
      this.time = payload;
    },
    setInitData(payload) {
      this.initData = payload;
    },
    setVideoIdentificationInProcess(payload) {
      this.videoIdentificationInProcess = payload;
    },
    setPermissionsMenus(menus) {
      this.permissionsMenus = menus;
    },
    setCurrentApplication(app) {
      this.currentApplication = app;
    },
    clearCurrentApplication() {
      this.currentApplication = null;
    },
    setCurrentProduct(product) {
      this.currentProduct = product;
    },
    clearCurrentProduct() {
      this.currentProduct = null;
    },
    setWindowWidth(payload) {
      this.windowWidth = payload;
    },
    auth_request() {
      this.status = 'loading';
    },
    auth_success(payload) {
      this.status = 'success';
      this.token = payload;
    },
    set_user(payload) {
      const hasAccess = (mask, c, r, u, d) => {
        let result = false;

        if (c) result |= Boolean(Number(mask) & 0b1000);
        if (r) result |= Boolean(Number(mask) & 0b0100);
        if (u) result |= Boolean(Number(mask) & 0b0010);
        if (d) result |= Boolean(Number(mask) & 0b0001);

        return !!result;
      };

      this.user = payload;
      this.checkAccess = ({ permission, c, r, u, d }) => {
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
    auth_error() {
      this.status = 'error';
    },

    show_first_message() {
      if (this.errorMessages[0] && !this.errorMessages[0].isOpen) {
        this.errorMessages[0].isOpen = true;
      }

    },
    addErrorMessages(error) {
      let message = error;
      if (error instanceof Error) {
        message = error.response?.data?.message || error.response?.data?.details;
      }
      if (error.response?.data instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        const err = JSON.parse(decoder.decode(error.response?.data));
        message = err.message;
      }

      this.errorMessages = [...this.errorMessages,{ message: message, color: 'rgba(35,40,51,0.93)' } ];
      this.show_first_message();
    },
    addSuccessMessages(message) {
      this.errorMessages = [...this.errorMessages,{ message: message, color: 'rgba(76,175,80,0.93)' } ];
      this.show_first_message();
    },
    addPasswordExpireNotify(message) {
      this.errorMessages = [...this.errorMessages,{ message: message, color: 'rgba(189,14,14,0.93)' } ];
      this.show_first_message();
    },
    removeMessage() {
      if (Array.isArray(this.errorMessages) && this.errorMessages.length > 0) {
        this.errorMessages = this.errorMessages.slice(0,-1);
        this.show_first_message();
      }
    },
    set_expired_date(val) {
      sessionStorage.setItem('expired', val);
    },
    setLastUserActiveTime(val) {
      this.lastUserActiveTime = val;
    },
    fillInitData() {
      this.initData.all.url = `/application/all?dateFrom=${this.time.from + ':00'}&dateTo=${this.time.to + ':00'}`;
      this.initData.incoming.url = `/application/incoming?dateFrom=${this.time.from + ':00'}&dateTo=${this.time.to + ':00'}`;
      this.initData.outgoing.url = `/application/outgoing?dateFrom=${this.time.from + ':00'}&dateTo=${this.time.to + ':00'}`;
      this.setLoading(true);
      const promises = Object.entries(this.initData)
        .map(
          dict => this.http.get(dict[1].url)
            .then(response => {
              this.initData[dict[0]].values = response.data;
            }, () => this.setGlobalErrorMessage())
        );
      return Promise.all(promises).finally(() =>  this.setLoading(false));
    },
    errorHandler(e) {
      if (typeof e === 'string') {
        this.addErrorMessages(e);
      } else if (e instanceof Error && e.response.data.message) {
        this.addErrorMessages(e.response.data.message);
      } else {
        this.setGlobalErrorMessage(e);
      }
    },
    setGlobalErrorMessage(message) {
      if (message === undefined) {
        this.globalErrorMessage =  {
          message: 'Упс... Что-то пошло не так',
          error: null,
        };
      } else if (message instanceof Error) {
        console.error(message);
        this.globalErrorMessage =  {
          message: 'Упс... Что-то пошло не так',
          error: message,
        };
      } else {
        this.globalErrorMessage = {
          message: message,
          error: null,
        };
      }
    },
    setLoading(payload) {
      this.loading = payload;
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

    login(user) {
      return new Promise((resolve, reject) => {
        this.auth_request();
        this.http.post('/public/auth/login', user)
          .then(resp => {
            if (resp.data.token) {
              sessionStorage.setItem('token', resp.data.token);

              const token = resp.data.token;
              let base64Url = token.split('.')[1];
              let decodedValue = JSON.parse(window.atob(base64Url));

              this.init();

              this.set_expired_date(decodedValue.exp * 1000);
              this.notifyPasswordExpiration(user);
              resolve(resp);
            } else {
              reject(resp.data.message || 'Ошибка! Обратитесь к администратору.');
            }
          },
          err => {
            this.auth_error();
            sessionStorage.removeItem('token');
            reject(err.response?.data?.message);
          });
      });
    },
    notifyPasswordExpiration(user) {
      this.http.post('/public/auth/check-password-status', user)
        .then((el) => {
          if (el.data.result) {
            this.addPasswordExpireNotify(el.data.result);
          }
        })
        .catch(() => {
          this.errorHandler('Не удалось проверить статус истечения пароля');
        });
    },
    logout() {
      return new Promise((resolve) => {
        this.status = '';
        this.token = '';
        this.user = {};
        this.set_expired_date(0);
        sessionStorage.removeItem('token');
        delete this.http.defaults.headers.common['Authorization'];
        resolve();
      });
    },

    // обновляем токен если юзер был активным в течение 3-х минут
    refreshToken() {
      return new Promise((resolve, reject) => {
        this.http.get(`/public/auth/refreshToken/${this.token}`)
          .then(resp => {
            if (resp.data) {
              sessionStorage.setItem('token', resp.data);
              const token = resp.data;
              let base64Url = token.split('.')[1];
              let decodedValue = JSON.parse(window.atob(base64Url));
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
    getActiveProductTypes() {
      if (this.creditProductTypes.length > 0) return;
      return this.http.get(ACTIVE_PRODUCT_TYPES)
        .then(({ data }) => this.creditProductTypes = data)
        .catch(e => this.addErrorMessages(e));
    },
  },

});
