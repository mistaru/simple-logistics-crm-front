<script setup lang="ts">
import { ref } from 'vue';
import ModalDialog from '@/components/UserModal.vue';
import { useUsersStore } from '@/stores/permissions';
import type { Role } from '@/stores/types';
import Rules from '@/utils/rules';
import { storeToRefs } from 'pinia';

const usersStore = useUsersStore();
const store = useAppStore();
const { user } = storeToRefs(store);
const isModal = ref(false);
const passwordInfo = ref({
  currentPassword: '',
  newPassword: '',
  repeatNewPassword: '',
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showRepeatPassword = ref(false);
const role = ref<Role | string>('');

const activateRole = () => {
  const id = typeof role.value === 'object' ? `${role.value?.id}` : role.value;
  store.activateRole(id);
};

const openModal = () => {
  isModal.value = true;
};

const closeUserModal = () => {
  passwordInfo.value = { currentPassword: '', newPassword: '', repeatNewPassword: '' };
  isModal.value = false;
};

const passwordRules = Rules.password;

const updatePassword = () => {
  if (passwordInfo.value.newPassword !== passwordInfo.value.repeatNewPassword) {
    alert('Новый пароль и его повтор не совпадают');
    return;
  }

  const { repeatNewPassword, ...dataToSend } = passwordInfo.value;

  usersStore.updatePassword(dataToSend);
  closeUserModal();
};

onMounted(() => {
  user.value?.roles?.some(i => {
    if (i.active) {
      role.value = i;
      return true;
    }
  });
});
</script>

<template>
  <v-container
    fluid
  >
    <h3>Информация о пользователе</h3>
    <div
      class="d-flex ga-10 mt-5"
    >
      <v-btn
        color="blue"
        class="ma-2"
        @click="openModal"
      >
        Обновить пароль
      </v-btn>

      <v-select
        v-model="role"
        :items="user.roles"
        item-title="description"
        item-value="id"
        variant="outlined"
        class="profile-roles"
        label="Текущая роль"
        density="compact"
        @update:model-value="activateRole"
      />
    </div>
  </v-container>
  <ModalDialog
    v-model:dialog="isModal"
    title="Обновление пароля"
    confirm-text="Обновить"
    @confirm="updatePassword"
    @close="closeUserModal"
  >
    <v-form>
      <v-text-field
        v-model="passwordInfo.currentPassword"
        label="Текущий пароль"
        :type="showCurrentPassword ? 'text' : 'password'"
        append-inner-icon="mdi-eye"
        @click:append-inner="showCurrentPassword = !showCurrentPassword"
      />
      <v-text-field
        v-model="passwordInfo.newPassword"
        label="Новый пароль"
        :type="showNewPassword ? 'text' : 'password'"
        :rules="passwordRules"
        append-inner-icon="mdi-eye"
        @click:append-inner="showNewPassword = !showNewPassword"
      />
      <v-text-field
        v-model="passwordInfo.repeatNewPassword"
        label="Повторите новый пароль"
        :type="showRepeatPassword ? 'text' : 'password'"
        :rules="passwordRules"
        append-inner-icon="mdi-eye"
        @click:append-inner="showRepeatPassword = !showRepeatPassword"
      />
    </v-form>
  </ModalDialog>
</template>
<style>
.profile-roles {
  max-width: 300px;
}
</style>
