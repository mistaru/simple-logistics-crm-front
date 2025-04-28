<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUsersStore } from '@/stores/permissions';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import ModalDialog from '@/components/UserModal.vue';
import Rules from '@/utils/rules';

const usersStore = useUsersStore();
const appStore = useAppStore();
const { users, roles } = storeToRefs(usersStore);

const userDialog = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const showPassword = ref(false);

interface UserForm {
  id?: number
  name: string,
  password: string,
  roles: number[],
}
const newUser = ref<UserForm>({
  name: '',
  password: '',
  roles: [],
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Имя пользователя', key: 'username' },
  { title: 'Роли', key: 'roles' },
  { title: 'Активен', key: 'active' },
  { title: 'Действия', key: 'actions' },
];

const getUsers = async(): Promise<void> => {
  loading.value = true;
  try {
    await usersStore.fetchUserList();
    await usersStore.fetchUserRoles();
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
  } finally {
    loading.value = false;
  }
};

const deleteUser = async(id: number): Promise<void> => {
  try {
    await usersStore.deleteUser(id);
    await getUsers();
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
  }
};

const createUser = async(): Promise<void> => {

  try {
    await usersStore.createUser({
      id: newUser.value.id,
      username: newUser.value.name,
      password: newUser.value.password,
      roles: newUser.value.roles.map((u: number) => ({ id: u })),
    });

    closeUserModal();
    await getUsers();
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
  }
};

const editUser = (id: number): void => {
  const user = users.value.find(u => u.id === id);

  if (user) {
    newUser.value = {
      id: Number(user.id),
      name: user.username || '',
      password: '',
      roles: user.roles.map(role => role.id),
    };
    isEditing.value = true;
    userDialog.value = true;
  }
};

const closeUserModal = (): void => {
  newUser.value = { name: '', password: '', roles: [] };
  userDialog.value = false;
  isEditing.value = false;
};

const openCreateUserModal = (): void => {
  newUser.value = { name: '', password: '', roles: [] };
  isEditing.value = false;
  userDialog.value = true;
};

const confirmDeleteUser = async(id: number): Promise<void> => {
  const user = users.value.find(u => u.id === id);
  if (user) {
    const confirmDelete = confirm(`Вы уверены, что хотите удалить пользователя ${user.username}?`);
    if (confirmDelete) {
      await deleteUser(id);
    }
  }
};

const canUpdate = computed(() => appStore.checkAccess('auth', 'update'));
const canDelete = computed(() => appStore.checkAccess('auth', 'delete'));
const canCreate = computed(() => appStore.checkAccess('auth', 'create'));

const toggleBlockUser = async(id: number, block: boolean): Promise<void> => {
  try {
    await usersStore.blockUser(id, block);
    await getUsers();
  } catch (error) {
    console.error('Ошибка блокировки пользователя:', error);
  }
};

onMounted(getUsers);
</script>

<template>
  <v-container>
    <ModalDialog
      v-model:dialog="userDialog"
      :title="isEditing ? 'Редактировать пользователя' : 'Создать пользователя'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="createUser"
      @close="closeUserModal"
    >
      <form>
        <v-text-field
          v-model="newUser.name"
          :rules="Rules.login"
          label="Имя пользователя"
        />
        <v-text-field
          v-model="newUser.password"
          :rules="Rules.password"
          :type="showPassword ? 'text' : 'password'"
          label="Пароль"
          autocomplete="on"
        >
          <template #append-inner>
            <v-icon @click="showPassword = !showPassword">
              {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
            </v-icon>
          </template>
        </v-text-field>
        <v-select
          v-model="newUser.roles"
          label="Роли"
          :items="roles"
          item-title="name"
          item-value="id"
          multiple
        />
      </form>
    </ModalDialog>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список пользователей
        <v-btn
          v-if="canCreate"
          color="primary"
          @click="openCreateUserModal"
        >
          Создать пользователя
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        item-value="id"
      >
        <template #item.roles="{ item }">
          <span v-if="item?.roles?.length">
            {{ item?.roles?.map(role => role.name).join(', ') }}
          </span>
        </template>

        <template #item.active="{ item }">
          <v-icon
            v-if="!item.blocked"
            color="green"
          >
            mdi-check
          </v-icon>
          <v-icon
            v-else
            color="red"
          >
            mdi-close
          </v-icon>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="canDelete"
            color="red"
            size="small"
            @click="confirmDeleteUser(item.id)"
          >
            Удалить
          </v-btn>
          <v-btn
            v-if="canUpdate"
            color="blue"
            size="small"
            class="ma-2"
            @click="editUser(item.id)"
          >
            Редактировать
          </v-btn>
          <v-btn
            v-if="canUpdate"
            color="orange"
            size="small"
            @click="toggleBlockUser(item.id, !item.blocked)"
          >
            {{ item.blocked ? 'Разблокировать' : 'Заблокировать' }}
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
