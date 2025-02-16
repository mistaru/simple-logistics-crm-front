<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '../stores/app.ts';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notifications';
const { addNotification } = useNotificationStore();
const username = ref('');
const password = ref('');
const store = useAppStore();
const router = useRouter();

const handleLogin = () => {
  if (username.value && password.value) {
    const user = {
      username: username.value, password: password.value,
    };
    store.login(user)
      .then((data) => {
        if (data.resultCode.value === 'OK') {
          router.push('/home');
        } else {
          addNotification('error', data.details);
        }
      })
      .catch(err => addNotification('error', err));
  }
};
const isDisabledBtn = computed(() => !username.value || !password.value);
</script>

<template>
  <v-container
    fluid
    class="d-flex justify-center align-center login-container"
    style="min-height: 100vh;"
  >
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="pa-5"
          elevation="4"
        >
          <v-row justify="center">
            <v-col
              cols="auto"
              class="w-50"
            >
              <v-img
                src="@/assets/logistic.jpg"
                alt="logo"
                height="100"
                contain
              />
            </v-col>
          </v-row>

          <v-card-title class="text-h5 justify-center text-center pa-4">
            Авторизация
          </v-card-title>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="username"
              variant="outlined"
              label="Логин"
              placeholder="Введите логин"
              prepend-icon="mdi-account"
              type="text"
              required
            />

            <v-text-field
              v-model="password"
              variant="outlined"
              label="Пароль"
              placeholder="Введите пароль"
              prepend-icon="mdi-lock"
              type="password"
              required
            />

            <v-btn
              type="submit"
              color="primary"
              :disabled="isDisabledBtn"
              block
              class="mt-4"
            >
              Войти
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-container {
  background: #F7F7F7;
  padding: 0;
}
</style>
