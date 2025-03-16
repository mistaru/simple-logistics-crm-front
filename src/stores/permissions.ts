import { defineStore } from 'pinia';
import { UPDATE_USER_PASSWORD, USERS } from '@/const';
import type {
  Role,
  User,
  Permission,
  UpdatePassword,
  FormattedPermission,
  EditablePermission,
  NewUser,
} from '@/stores/types';
import { useAppStore } from '@/stores/app';
const appStore = useAppStore();
class State {
  users: User[] = [];
  roles: Role[] = [];
  permissions: Permission[] = [];
}
export const useUsersStore = defineStore('permissions', {
  state: (): State => ({
    users: [],
    roles: [],
    permissions: [],
  }),
  actions: {
    async fetchUserRoles() {
      const [response] = await fetchData('/role');

      this.roles = response
        .map((role: Role) => ({
          ...role,
          permissions: role.permissions.map((p: Permission) => ({
            ...p,
            create: !!(p.access & 0b1000),
            read: !!(p.access & 0b0100),
            update: !!(p.access & 0b0010),
            delete: !!(p.access & 0b0001),
          })),
        }))
        .sort((a: { id: number }, b: { id: number }) => a.id - b.id);

      return response;
    },

    async fetchPermissions() {
      const [response] = await fetchData('/permission');
      this.permissions = response;
      return response;
    },

    async createRole(roleData: Role): Promise<Role | null> {
      const formattedRole = {
        ...roleData,
        permissions: roleData.permissions
          ? roleData.permissions.map((p): FormattedPermission => {
            const access =
              p.access !== undefined
                ? p.access
                : ((p as EditablePermission).create ? 0b1000 : 0) |
                ((p as EditablePermission).read ? 0b0100 : 0) |
                ((p as EditablePermission).update ? 0b0010 : 0) |
                ((p as EditablePermission).delete ? 0b0001 : 0);
            return {
              id: p.id,
              name: p.name.value,
              access,
            };
          })
          : [],
      };

      const [response, error] = await fetchData('/role', {
        method: 'POST',
        body: JSON.stringify(formattedRole) as unknown as Record<string, never>,
      });

      if (error) {
        console.error('Ошибка при создании роли:', error);
        return null;
      }
      await appStore.init();
      await appStore.fetchMenu();
      this.roles.push(response);
      return response;
    },
    async deleteRole(roleId: number) {
      await fetchData(`/role?roleId=${roleId}`, { method: 'DELETE' });
      this.roles = this.roles.filter(role => role.id !== roleId);
    },

    async createUser(userData: NewUser): Promise<User | null> {
      const [response, error] = await fetchData('/auth', {
        method: 'POST',
        body: JSON.stringify(userData) as unknown as Record<string, never>,
      });
      if (error) {
        console.error('Ошибка при создании пользователя:', error);
      }
      return response;
    },
    async fetchUserList() {
      const [response] = await fetchData(USERS);
      this.users = response?.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
      return response;
    },
    async deleteUser(authId: number) {
      await fetchData(`/auth?authId=${authId}`, { method: 'DELETE' });
    },

    async updatePassword(body: UpdatePassword): Promise<Response | null> {
      const [response, error] = await fetchData(UPDATE_USER_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(body) as unknown as Record<string, never>,
      });

      if (error) {
        console.error('Ошибка обновления пароля:', error);
        return null;
      }

      return response;
    },
    async blockUser(authId: number, block: boolean) {
      await fetchData(`/auth/block?authId=${authId}&block=${block}`, { method: 'POST' });
    },
  },
});

