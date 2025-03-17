import { defineStore } from 'pinia';
import { MENU, ACTIVATE_ROLE } from '@/const';
import type { Permission, User } from '@/stores/types';

interface MenuItem {
  screen: {
    value: string;
    description: string;
    icon: string;
  };
  permissions: {
    value: string;
    authority: string;
    description: string;
    icon: string;
    screenType: {
      value: string;
      description: string;
      icon: string;
    };
    view: string;
  }[];
}
interface State {
  token: string;
  status: string;
  initialized: boolean,
  messages: Message[];
  errorMessages: string[];
  menuList: MenuItem[];
  userPermissions: Permission[];
  user: User;
}
export interface Bids {
  date: string,
  count: number,
}
interface Message {
  message: string;
  isError: boolean;
  isOpen: boolean;
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    token: '',
    status: '',
    errorMessages: [],
    blackList: [],
    initialized: false,
    menuList: [],
    userPermissions: [],
    user: {
      id: 0,
      name: '',
      login: '',
      roles: [],
    },
    messages: [],
  }),
  getters: {
    isLoggedIn: state => !!state.token,
    checkAccess(state) {
      return (view: string, accessType: 'create' | 'read' | 'update' | 'delete') => {
        const permission = state.userPermissions.find(p => p.name.view === view);
        if (!permission) return false;
        const masks = { create: 8, read: 4, update: 2, delete: 1 };
        return (Number(permission.access) & masks[accessType]) === masks[accessType];
      };
    },
  },
  actions: {
    async addMessage(messageOrError: unknown, showErrorMessage = false) {
      setTimeout(() => {
        let isError = showErrorMessage;
        let message = messageOrError;
        if (typeof message !== 'string') {
          message = getErrorMessage(message);
          isError = true;
        }
        this.messages = [...this.messages, { message: String(message), isError, isOpen: true }];
      }, 1);
    },
    async init() {
      const token = sessionStorage.getItem('token');

      if (token) {
        this.auth_success(token);

        try {
          const [data, error] = await fetchData('/auth/current');

          if (error || !data) {
            throw new Error(error?.message || 'Ошибка загрузки пользователя.');
          }

          this.set_user(data);
        } catch (error) {
          console.error('Ошибка загрузки пользователя:', error);
        }
      }

      this.initialized = true;
    },
    auth_success(payload: string): void {
      this.status = 'success';
      this.token = payload;
    },
    set_expired_date(val: number): void {
      sessionStorage.setItem('expired', val.toString());
    },
    auth_request(): void {
      this.status = 'loading';
    },
    auth_error(): void {
      this.status = 'error';
    },
    async login(user: { username: string; password: string }) {
      try {
        this.auth_request();

        const [data] = await fetchData('/public/auth/login', {
          method: 'POST',
          body: JSON.stringify(user) as unknown as Record<string, never>,
        });
        if (data) {
          sessionStorage.setItem('token', data);
          const token = data;
          const decodedValue = JSON.parse(window.atob(token.split('.')[1]));
          await this.init();
          this.set_expired_date(decodedValue.exp * 1000);
          return data;
        }
      } catch (error) {
        this.auth_error();
        sessionStorage.removeItem('token');
        throw error;
      }
    },
    async logout() {
      this.token = '';
      this.user = {
        id: 0,
        name: '',
        login: '',
        roles: [],
      };
      sessionStorage.removeItem('token');
    },
    async refreshToken(): Promise<string> {
      try {
        const [data, error] = await fetchData(`/public/auth/refreshToken/${this.token}`);

        if (error || !data) {
          throw new Error(error?.message || 'Ошибка! Обратитесь к администратору.');
        }

        sessionStorage.setItem('token', data);
        const decodedValue = JSON.parse(window.atob(data.split('.')[1]));
        await this.init();
        this.set_expired_date(decodedValue.exp * 1000);

        return data;
      } catch (error) {
        this.auth_error();
        sessionStorage.removeItem('token');
        throw error;
      }
    },
    async activateRole(roleId: string) {

      const [, error] = await fetchData(ACTIVATE_ROLE, { params: { roleId } });
      return !error;
    },
    set_user(payload: User) {
      this.user = payload as User;

      const activeRoles = payload.roles.filter(role => role.active);
      const permissions: Permission[] = [];
      activeRoles.forEach((role) => {
        role?.permissions?.forEach((permission: Permission) => {
          permissions.push({
            id: permission.id,
            name: {
              value: permission.name.value,
              authority: permission.name.authority,
              description: permission.name.description,
              icon: permission.name.icon,
              screenType: {
                value: permission.name.screenType.value,
                description: permission.name.screenType.description,
                icon: permission.name.screenType.icon,
              },
              view: permission.name.view,
            },
            access: Number(permission.access),
          });
        });
      });

      this.userPermissions = permissions;
    },
    async fetchMenu() {
      try {
        const [response] = await fetchData(MENU);
        this.menuList = response || [];
      } catch (error) {
        console.error('Ошибка загрузки меню:', error);
        this.menuList = [];
      }
    },
  },
});
