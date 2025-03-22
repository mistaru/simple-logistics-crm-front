<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAppStore } from './stores/app';
import router from './router';
import { storeToRefs } from 'pinia';

const store = useAppStore();
const drawer = ref(true);
const rail = ref(false);
const timeNow = ref(Date.now());
const lastUserActiveTime = ref<number | null>(null);
const expired = ref<number>(Number(sessionStorage.getItem('expired')) || 0);
const token = ref<string | null>(sessionStorage.getItem('token') || '');
const { menuList } = storeToRefs(store);

interface Permission {
  title: string
  icon: string
  path?: string
  value?: string
  children?: Permission[]
}
const links = computed(() => {
  return menuList.value
    .map(menu => {
      const isAdmin = menu?.screen?.value === 'ADMINISTRATION';
      const isDictScreen = menu?.screen?.value === 'DICT_SCREEN';  // Проверка для DICT_SCREEN
      const children = menu.permissions
        .map((permission) => ({
          title: permission.description,
          path: `/${permission.view}`,
          icon: permission.icon ?? 'mdi-credit-card-multiple',
        } as Permission));

      if (children.length === 1) {
        return {
          title: children[0].title,
          path: children[0].path,
          icon: children[0].icon,
        };
      }

      if (children.length > 0) {
        if (isAdmin) {
          return {
            title: menu.screen.description,
            icon: menu.screen.icon || 'mdi-view-dashboard',
            value: menu.screen.value,
            children,
          };
        } else if (isDictScreen) {
          return {
            title: menu.screen.description,
            icon: menu.screen.icon || 'mdi-folder',
            value: menu.screen.value,
            children,
          };
        } else {
          return children;
        }
      }

      return null;
    }).flat()
    .filter(Boolean);
});

const logout = () => {
  store.logout();
  router.push('/login');
};

const goToProfile = () => {
  router.push('/profile');
};

const isLoginPage = computed(() => router.currentRoute.value.path === '/login');

const convertTimesToMilliseconds = (time1: number, time2: number) => {
  return Math.abs(time1 - time2);
};

const refreshToken = async() => {
  try {
    console.info('Обновление токена');
    await store.refreshToken();
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
  }
};

watch(timeNow, (newTimeNow) => {
  if (newTimeNow && store.isLoggedIn) {
    const secondsTillLogout = Math.round((expired.value - newTimeNow) / 1000);
    const secondsForRefresh = 180;

    if (secondsTillLogout <= secondsForRefresh && token.value && lastUserActiveTime.value) {
      if (convertTimesToMilliseconds(timeNow.value, lastUserActiveTime.value) < secondsForRefresh) {
        refreshToken();
      }
    }
  }
});
if (!isLoginPage.value) {
  store.fetchMenu();
  store.init().then(() => {
    store.initialized = true;
  });
}
</script>

<template>
  <v-app>
    <template v-if="isLoginPage">
      <router-view />
    </template>

    <template v-else>
      <template v-if="store.initialized">
        <v-navigation-drawer
          v-model="drawer"
          :rail="rail"
          permanent
          @click="rail = false"
        >
          <v-list-item
            title="Administrator"
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
            <template
              v-for="link in links"
              :key="link?.value"
            >
              <v-list-item
                v-if="!link?.children"
                :prepend-icon="link?.icon"
                :title="link?.title"
                :to="link?.path"
                nav
              />
              <v-list-group
                v-else
                :value="link?.value"
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :prepend-icon="link?.icon"
                    :title="link?.title"
                  />
                </template>
                <v-list-item
                  v-for="child in link?.children"
                  :key="child.title"
                  :prepend-icon="child.icon"
                  :title="child.title"
                  :to="child.path"
                  nav
                />
              </v-list-group>
            </template>
          </v-list>
        </v-navigation-drawer>

        <v-app-bar class="app-header">
          <v-toolbar-title>Admin</v-toolbar-title>
          <toggle-theme />
          <template #append>
            <v-btn
              icon="mdi-account-circle"
              @click="goToProfile"
            />
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
    </template>

    <Notification />
  </v-app>
  <list-snack-bar />
</template>

<style lang="scss">
.app-header {
  max-height: 56px;
}
</style>
