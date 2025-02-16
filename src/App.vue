<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAppStore } from './stores/app';
import router from './router';

const store = useAppStore();
const drawer = ref(true);
const rail = ref(true);
const timeNow = ref(Date.now());
const lastUserActiveTime = ref<number | null>(null);
const expired = ref<number>(Number(sessionStorage.getItem('expired')) || 0);
const token = ref<string | null>(sessionStorage.getItem('token') || '');

const links = [
  { title: 'Главная', path: '/Home', icon: 'mdi-home' },
  { title: 'Роли', path: '/Role', icon: 'mdi-account-details' },
];

const logout = () => {
  store.logout();
  router.push('/login');
};

const isLoginPage = computed(() => router.currentRoute.value.path === '/login');

const convertTimesToMilliseconds = (time1: number, time2: number) => {
  return Math.abs(time1 - time2);
};

const refreshToken = async() => {
  try {
    await store.refreshToken();
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
  }
};

watch(timeNow, (newTimeNow) => {
  if (newTimeNow && store.isLoggedIn) {
    const secondsTillLogout = Math.round((expired.value - newTimeNow) / 1000);
    const secondsForRefresh = 180;

    if (secondsTillLogout <= secondsForRefresh && token.value?.length > 0 && lastUserActiveTime.value) {
      if (convertTimesToMilliseconds(timeNow.value, lastUserActiveTime.value) < secondsForRefresh) {
        refreshToken();
      }
    }
  }
});

</script>

<template>
  <v-app>
    <template v-if="isLoginPage">
      <router-view />
    </template>

    <template v-else>
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
      >
        <v-list-item
          title="admin (юзер)"
          nav
        >
          <template #append>
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click.stop="rail = !rail"
            />
          </template>
        </v-list-item>

        <v-divider />
        <v-list
          density="compact"
          nav
        >
          <v-list-item
            v-for="link in links"
            :key="link.title"
            :prepend-icon="link.icon"
            :title="link.title"
            :to="link.path"
            nav
          />
        </v-list>
      </v-navigation-drawer>
      <v-app-bar>
        <v-toolbar-title>
          <h3>Админ панель</h3>
        </v-toolbar-title>
        <template #append>
          <v-btn
            icon="mdi-logout"
            @click="logout"
          />
        </template>
      </v-app-bar>
      <v-main>
        <router-view />
      </v-main>
    </template>
    <Notification />
  </v-app>
</template>
