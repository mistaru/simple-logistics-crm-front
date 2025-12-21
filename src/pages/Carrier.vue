<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCarrierStore } from '@/stores/carrier';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
// import TruckModal from '@/components/TruckModal.vue';

const carrierStore = useCarrierStore();
const appStore = useAppStore();
const { carriers } = storeToRefs(carrierStore);

const carrierDialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const saveCarrierRef = ref();

// interface CarrierForm {} TODO

// const newCarrier = ref<CarrierForm>({ // TODO
//   name: '',
//   email: '',
//   phoneNumber: '',
//   balance: 0,
//
// });

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Телефон', key: 'phoneNumber' },
  { title: 'Баланс', key: 'balance' },
  //{ title: 'Действия', key: 'actions', sortable: false },
];

const getCarriers = async(): Promise<void> => {
  loading.value = true;
  try {
    await carrierStore.fetchCarriers();
  } catch (error) {
    console.error('Ошибка загрузки перевозчиков:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(getCarriers);
</script>

<template>
  <v-container>
    <!-- Таблица с перевозчиками -->
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список перевозчиков
<!--        <v-btn v-if="canCreate" color="primary" @click="openCreateTruckModal">-->
<!--          Добавить фуру-->
<!--        </v-btn>-->
      </v-card-title>

      <v-data-table :headers="headers" :items="carriers" :loading="loading" item-value="id">
<!--        <template #item.actions="{ item }">-->
<!--          <v-btn v-if="canDelete" color="red" size="small" @click="deleteTruck(item.id)">-->
<!--            Удалить-->
<!--          </v-btn>-->
<!--          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editTruck(item.id)">-->
<!--            Редактировать-->
<!--          </v-btn>-->
<!--        </template>-->
      </v-data-table>
    </v-card>
  </v-container>
</template>
