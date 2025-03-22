<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCargoStore } from '@/stores/cargo';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import CargoModal from '@/components/CargoModal.vue';
import Rules from '@/utils/rules';

const cargoStore = useCargoStore();
const appStore = useAppStore();
const { cargos, statuses } = storeToRefs(cargoStore);

const loading = ref(false);
const cargoDialog = ref(false);
const isEditing = ref(false);
const selectedCargoId = ref<number | null>(null);

interface CargoForm {
  id?: number;
  weight: number;
  volume: number;
  quantity: number;
  warehouseArrivalDate?: string;
  shipmentDate?: string;
  status: string;
  description?: string;
}

const newCargo = ref<CargoForm>({
  weight: 0,
  volume: 0,
  quantity: 1,
  status: '',
  description: '',
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Вес (кг)', key: 'weight' },
  { title: 'Объем (м³)', key: 'volume' },
  { title: 'Количество', key: 'quantity' },
  { title: 'Дата прибытия', key: 'warehouseArrivalDate' },
  { title: 'Дата отправки', key: 'shipmentDate' },
  { title: 'Статус', key: 'status.description' },
  { title: 'Описание', key: 'description' },
  { title: 'Действия', key: 'actions' },
];

const getCargos = async(): Promise<void> => {
  loading.value = true;
  try {
    await cargoStore.fetchCargos();
    await cargoStore.fetchStatuses();
  } catch (error) {
    console.error('Ошибка загрузки грузов:', error);
  } finally {
    loading.value = false;
  }
};

const deleteCargo = async(id: number) => {
  await cargoStore.deleteCargo(id);
  await getCargos();
};

const prepareCargoData = (cargo) => ({
  ...cargo,
  warehouseArrivalDate: cargo.warehouseArrivalDate
    ? new Date(cargo.warehouseArrivalDate).toISOString()
    : null,
  shipmentDate: cargo.shipmentDate
    ? new Date(cargo.shipmentDate).toISOString()
    : null,
});

const saveCargo = async(): Promise<void> => {
  try {

    const preparedCargo = prepareCargoData(newCargo.value);

    newCargo.value.status = typeof newCargo.value.status === 'object'
      ? newCargo.value.status.value
      : newCargo.value.status;

    if (isEditing.value) {
      await cargoStore.updateCargo(preparedCargo);
    } else {
      await cargoStore.createCargo(preparedCargo);
    }
    closeCargoModal();
    await getCargos();
  } catch (error) {
    console.error('Ошибка сохранения груза:', error);
  }
};

const editCargo = (id: number): void => {
  const cargo = cargos.value.find(c => c.id === id);
  if (cargo) {
    newCargo.value = { ...cargo };
    isEditing.value = true;
    cargoDialog.value = true;
  }
};

const closeCargoModal = () => {
  newCargo.value = {
    weight: 0,
    volume: 0,
    quantity: 1,
    status: '',
    description: '',
  };
  selectedCargoId.value = null;
  cargoDialog.value = false;
  isEditing.value = false;
};

const openCreateCargoModal = (): void => {
  newCargo.value = {
    weight: 0,
    volume: 0,
    quantity: 0,
    warehouseArrivalDate: '',
    shipmentDate: '',
    status: statuses.value.length ? statuses.value[0].value : '',
    description: '',
  };
  isEditing.value = false;
  cargoDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('cargo', 'update'));
const canDelete = computed(() => appStore.checkAccess('cargo', 'delete'));
const canCreate = computed(() => appStore.checkAccess('cargo', 'create'));

onMounted(async() => {
  await getCargos();
});
</script>

<template>
  <v-container>
    <CargoModal
      v-model:dialog="cargoDialog"
      :title="isEditing ? 'Редактировать груз' : 'Добавить груз'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveCargo"
      @close="closeCargoModal"
    >
      <form>
        <v-text-field v-model="newCargo.weight" :rules="Rules.required" label="Вес (кг)" type="number" />
        <v-text-field v-model="newCargo.volume" :rules="Rules.required" label="Объем (м³)" type="number" />
        <v-text-field v-model="newCargo.quantity" :rules="Rules.required" label="Количество" type="number" />
        <v-text-field v-model="newCargo.warehouseArrivalDate" label="Дата прибытия" type="datetime-local" />
        <v-text-field v-model="newCargo.shipmentDate" label="Дата отправки" type="datetime-local" />
        <v-select
          v-model="newCargo.status"
          :items="statuses"
          item-title="description"
          item-value="value"
          label="Статус"
        />
        <v-text-field v-model="newCargo.description" label="Описание" />
      </form>
    </CargoModal>

    {{ newCargo.status }}

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список грузов
        <v-btn v-if="canCreate" color="primary" @click="openCreateCargoModal">
          Добавить груз
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="cargos" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editCargo(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
