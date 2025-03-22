<script setup lang="ts">
import { useUsersStore } from '@/stores/permissions';
import { VDataTable } from 'vuetify/components';

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name.description' },
];
const loading = ref(false);
const usersStore = useUsersStore();
const fetchPermissions = () => {
  loading.value = true;
  usersStore.fetchPermissions()
    .finally(() => loading.value = false);
};
fetchPermissions();

</script>

<template>
  <v-container>
    <h3 class="mb-4">
      Список доступов
    </h3>
    <v-data-table
      :headers="headers"
      :items="usersStore.permissions"
      :loading="loading"
      item-value="id"
    />
  </v-container>
</template>

<style scoped lang="scss">

</style>
