<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ref, onMounted, computed } from 'vue';
import { useUsersStore } from '@/stores/permissions';
import { useNotificationStore } from '@/stores/notifications';
import type { Role, Permission, EditablePermission } from '@/stores/types';

const store = useUsersStore();
const appStore = useAppStore();
const { addNotification } = useNotificationStore();

const loading = ref(false);
const dialog = ref(false);
const saveLoading = ref(false);
const selectedRole = ref<Role | null>(null);

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Описание', key: 'description' },
  { title: 'Действия', key: 'actions', sortable: false },
];

const permissionHeaders = [
  { title: 'Название', key: 'name.description' },
  { title: 'Чтение', key: 'read' },
  { title: 'Создание', key: 'create' },
  { title: 'Редактирование', key: 'update' },
  { title: 'Удаление', key: 'delete' },
];

const canUpdate = computed(() => appStore.checkAccess('roles', 'update'));
const canDelete = computed(() => appStore.checkAccess('roles', 'delete'));
const canCreate = computed(() => appStore.checkAccess('roles', 'create'));
const fetchRoles = async() => {
  loading.value = true;
  try {
    await store.fetchUserRoles();
  } catch (error) {
    addNotification('error', error instanceof Error ? error.message : 'Ошибка при загрузке ролей');
  } finally {
    loading.value = false;
  }
};

const openDialog = async(role?: Role) => {
  if (!store.permissions.length) {
    await store.fetchPermissions();
  }

  const existingPermissionsMap = new Map(
    (role?.permissions ?? []).map(p => [p.id, p])
  );
  selectedRole.value = role
    ? ({
      ...role,
      permissions: store.permissions.map((p: Permission) => {
        const existingPermission = existingPermissionsMap.get(p.id);
        const access = existingPermission?.access ?? 0;
        return {
          id: p.id,
          name: p.name,
          access: p.access === 0 ? 0 : p.access,
          read: Boolean(access & 0b0100),
          create: Boolean(access & 0b1000),
          update: Boolean(access & 0b0010),
          delete: Boolean(access & 0b0001),
        } as EditablePermission;
      }),
    } as Role & { permissions: EditablePermission[] })
    : ({
      name: '',
      description: '',
      permissions: store.permissions.map((p: Permission) => ({
        id: p.id,
        name: p.name,
        access: 0,
        read: false,
        create: false,
        update: false,
        delete: false,
      })) as EditablePermission[],
    } as Role & { permissions: EditablePermission[] });

  dialog.value = true;
};

const saveRole = async() => {
  if (!selectedRole.value) return;
  saveLoading.value = true;
  try {
    const filteredPermissions = (selectedRole.value.permissions ?? [])
      .filter(p => p.read || p.create || p.update || p.delete)
      .map(p => ({
        id: p.id,
        name: p.name,
        access:
          (p.create ? 0b1000 : 0) |
          (p.read ? 0b0100 : 0) |
          (p.update ? 0b0010 : 0) |
          (p.delete ? 0b0001 : 0),
      }));

    const roleDataToSend = {
      ...selectedRole.value,
      permissions: filteredPermissions,
    };
    await store.createRole(roleDataToSend);
    addNotification('success', 'Роль успешно сохранена');
    dialog.value = false;
    await fetchRoles();
  } catch (error) {
    addNotification('error', error instanceof Error ? error.message : 'Ошибка при сохранении роли');
  } finally {
    saveLoading.value = false;
  }
};

const deleteRole = async(id: number) => {
  try {
    await store.deleteRole(id);
    addNotification('success', 'Роль удалена');
    await fetchRoles();
  } catch (error) {
    addNotification('error', error instanceof Error ? error.message : 'Ошибка при удалении роли');
  }
};

onMounted(() => {
  fetchRoles();
  store.fetchPermissions();
});
</script>

<template>
  <v-container fluid>
    <h3 class="mb-4">
      Список ролей
    </h3>
    <v-btn
      v-if="canCreate"
      color="primary"
      @click="openDialog()"
    >
      Создать новую роль
    </v-btn>

    <v-data-table
      :headers="headers"
      :items="store.roles"
      :loading="loading"
      item-value="id"
    >
      <template #item.actions="{ item }">
        <v-btn
          v-if="canUpdate"
          color="primary"
          size="x-small"
          icon="mdi-pencil"
          @click="openDialog(item)"
        />
        <v-btn
          v-if="canDelete"
          color="error"
          size="x-small"
          icon="mdi-delete"
          @click="deleteRole(item.id)"
        />
      </template>
    </v-data-table>

    <v-dialog
      v-model="dialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>{{ selectedRole?.id ? 'Редактирование роли' : 'Создание роли' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedRole!.name"
            variant="outlined"
            class="mb-4"
            label="Название"
            required
          />
          <v-text-field
            v-model="selectedRole!.description"
            variant="outlined"
            label="Описание"
          />

          <v-data-table
            :headers="permissionHeaders"
            :items="selectedRole!.permissions"
          >
            <template #item.read="{ item }">
              <v-checkbox v-model="item.read" />
            </template>
            <template #item.create="{ item }">
              <v-checkbox v-model="item.create" />
            </template>
            <template #item.update="{ item }">
              <v-checkbox v-model="item.update" />
            </template>
            <template #item.delete="{ item }">
              <v-checkbox v-model="item.delete" />
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialog = false">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :loading="saveLoading"
            @click="saveRole"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
.v-btn {
  margin-right: 8px;
}
</style>
