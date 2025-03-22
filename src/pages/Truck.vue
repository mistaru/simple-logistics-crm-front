<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTruckStore } from '@/stores/truck';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import TruckModal from '@/components/TruckModal.vue';

const truckStore = useTruckStore();
const appStore = useAppStore();
const { trucks } = storeToRefs(truckStore);

const truckDialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);

interface TruckForm {
  id?: number;
  registrationCountry: string;
  volumeM3: number;
  departureWarehouse: string;
  deliveryWarehouse: string;
  driverPhone: string;
  additionalInformation?: string;
}

const newTruck = ref<TruckForm>({
  registrationCountry: '',
  volumeM3: 0,
  departureWarehouse: '',
  deliveryWarehouse: '',
  driverPhone: '',
  additionalInformation: '',
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Страна регистрации', key: 'registrationCountry' },
  { title: 'Объем (м3)', key: 'volumeM3' },
  { title: 'Склад отправки', key: 'departureWarehouse' },
  { title: 'Склад доставки', key: 'deliveryWarehouse' },
  { title: 'Телефон водителя', key: 'driverPhone' },
  { title: 'Доп. информация', key: 'additionalInformation' },
  { title: 'Действия', key: 'actions', sortable: false },
];

const getTrucks = async(): Promise<void> => {
  loading.value = true;
  try {
    await truckStore.fetchTrucks();
  } catch (error) {
    console.error('Ошибка загрузки траков:', error);
  } finally {
    loading.value = false;
  }
};

const deleteTruck = async (id: number) => {
  try {
    await truckStore.deleteTruck(id);
    await getTrucks();
  } catch (error) {
    console.error('Ошибка удаления трака:', error);
  }
};

const saveTruck = async (): Promise<void> => {
  try {
    if (isEditing.value) {
      await truckStore.updateTruck({ ...newTruck.value });
    } else {
      await truckStore.createTruck({ ...newTruck.value });
    }
    closeTruckModal();
    await getTrucks();
  } catch (error) {
    console.error('Ошибка сохранения трака:', error);
  }
};

const editTruck = (id: number): void => {
  const truck = trucks.value.find(t => t.id === id);
  if (truck) {
    newTruck.value = { ...truck };
    isEditing.value = true;
    truckDialog.value = true;
  }
};

const closeTruckModal = (): void => {
  newTruck.value = {
    registrationCountry: '',
    volumeM3: 0,
    departureWarehouse: '',
    deliveryWarehouse: '',
    driverPhone: '',
    additionalInformation: '',
  };
  truckDialog.value = false;
  isEditing.value = false;
};

const openCreateTruckModal = (): void => {
  newTruck.value = {
    registrationCountry: '',
    volumeM3: 0,
    departureWarehouse: '',
    deliveryWarehouse: '',
    driverPhone: '',
    additionalInformation: '',
  };
  isEditing.value = false;
  truckDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('truck', 'update'));
const canDelete = computed(() => appStore.checkAccess('truck', 'delete'));
const canCreate = computed(() => appStore.checkAccess('truck', 'create'));

onMounted(getTrucks);
</script>

<template>
  <v-container>
    <!-- Модальное окно для создания/редактирования -->
    <TruckModal
      v-model:dialog="truckDialog"
      :title="isEditing ? 'Редактировать трак' : 'Добавить трак'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveTruck"
      @close="closeTruckModal"
    >
      <v-form>
        <v-text-field v-model="newTruck.registrationCountry" label="Страна регистрации" required />
        <v-text-field v-model="newTruck.volumeM3" label="Объем (м3)" type="number" required />
        <v-text-field v-model="newTruck.departureWarehouse" label="Склад отправки" required />
        <v-text-field v-model="newTruck.deliveryWarehouse" label="Склад доставки" required />
        <v-text-field v-model="newTruck.driverPhone" label="Телефон водителя" required />
        <v-text-field v-model="newTruck.additionalInformation" label="Доп. информация" />
      </v-form>
    </TruckModal>

    <!-- Таблица с траками -->
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список траков
        <v-btn v-if="canCreate" color="primary" @click="openCreateTruckModal">
          Добавить трак
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="trucks" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editTruck(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
