<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCargoStore } from '@/stores/cargo';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import CargoModal from '@/components/CargoModal.vue';
import AddClientModal from '@/components/AddClientModal.vue';
import Rules from '@/utils/rules';

const cargoStore = useCargoStore();
const appStore = useAppStore();
const { cargos, statuses, clients } = storeToRefs(cargoStore);

const loading = ref(false);
const cargoDialog = ref(false);
const addClientDialog = ref(false);
const isEditing = ref(false);

interface CargoForm {
  id?: number | null;
  weight: number | null;
  volume: number | null;
  quantity: number | null;
  warehouseArrivalDate?: string | null;
  shipmentDate?: string | null;
  status: string;
  client: number | string | null;
  description?: string;
}

const newCargo = ref<CargoForm>({
  weight: null,
  volume: null,
  quantity: 1,
  status: '',
  client: '',
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
  { title: 'Клиент', key: 'client.fullName' },
  { title: 'Описание', key: 'description' },
  { title: 'Действия', key: 'actions' },
];

// ------------------------------------------------------
// ГРУЗЫ
// ------------------------------------------------------
const getCargos = async () => {
  loading.value = true;
  try {
    await cargoStore.fetchCargos();
    await cargoStore.fetchStatuses();
    await cargoStore.fetchClients();
  } finally {
    loading.value = false;
  }
};

const deleteCargo = async (id: number) => {
  await cargoStore.deleteCargo(id);
  await getCargos();
};

// ------------------------------------------------------
// ВЫБОР КЛИЕНТА В SELECT
// ------------------------------------------------------
const onClientSelect = (value: number | string) => {
  if (value === -1) {
    addClientDialog.value = true;
    newCargo.value.client = null;
  }
};

// ------------------------------------------------------
// СОЗДАНИЕ НОВОГО КЛИЕНТА
// ------------------------------------------------------
const createClient = async(clientData: { fullName: string; phone: string }) => {
  try {
    const created = await cargoStore.createClient(clientData);

    await cargoStore.fetchClients();

    newCargo.value.client = created.id; // автоматический выбор нового
  } catch (e) {
    console.error('Ошибка создания клиента:', e);
  }
};

// ------------------------------------------------------
// ПОДГОТОВКА ГРУЗА К API
// ------------------------------------------------------
const prepareCargoData = (cargo: CargoForm) => ({
  id: cargo.id ?? null,
  weight: cargo.weight ?? 0,
  volume: cargo.volume ?? 0,
  quantity: cargo.quantity ?? 0,
  warehouseArrivalDate: cargo.warehouseArrivalDate
    ? new Date(cargo.warehouseArrivalDate).toISOString()
    : null,
  shipmentDate: cargo.shipmentDate
    ? new Date(cargo.shipmentDate).toISOString()
    : null,

  status: cargo.status,

  client: {
    id: cargo.client,
  },

  description: cargo.description ?? '',
});

// ------------------------------------------------------
// СОХРАНЕНИЕ ГРУЗА
// ------------------------------------------------------
const saveCargo = async () => {
  try {
    const preparedCargo = prepareCargoData(newCargo.value);

    if (isEditing.value && newCargo.value.id) {
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

// ------------------------------------------------------
// РЕДАКТИРОВАНИЕ ГРУЗА
// ------------------------------------------------------
const editCargo = (id: number) => {
  const cargo = cargos.value.find(c => c.id === id);
  if (!cargo) return;

  newCargo.value = {
    id: cargo.id,
    weight: cargo.weight,
    volume: cargo.volume,
    quantity: cargo.quantity,
    warehouseArrivalDate: cargo.warehouseArrivalDate,
    shipmentDate: cargo.shipmentDate,
    status: cargo.status.value,
    client: cargo.client.id,
    description: cargo.description,
  };

  isEditing.value = true;
  cargoDialog.value = true;
};

// ------------------------------------------------------
// ЗАКРЫТЬ МОДАЛКУ ГРУЗА
// ------------------------------------------------------
const closeCargoModal = () => {
  newCargo.value = {
    weight: null,
    volume: null,
    quantity: 1,
    status: statuses.value.length ? statuses.value[0].value : '',
    client: '',
    description: '',
  };
  isEditing.value = false;
  cargoDialog.value = false;
};

const openCreateCargoModal = () => {
  newCargo.value = {
    weight: null,
    volume: null,
    quantity: 1,
    warehouseArrivalDate: '',
    shipmentDate: '',
    status: statuses.value.length ? statuses.value[0].value : '',
    client: '',
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
  <!-- Модалка: добавление нового клиента -->
  <AddClientModal
    v-model:dialog="addClientDialog"
    @saved="createClient"
  />

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

        <v-text-field v-model="newCargo.warehouseArrivalDate" type="datetime-local" label="Дата прибытия" />
        <v-text-field v-model="newCargo.shipmentDate" type="datetime-local" label="Дата отправки" />

        <v-select
          v-model="newCargo.status"
          :items="statuses"
          item-title="description"
          item-value="value"
          label="Статус"
        />

        <!-- КЛИЕНТ с кнопкой + Добавить -->
        <v-select
          v-model="newCargo.client"
          :items="[...clients, { id: -1, fullName: '+ Добавить нового клиента' }]"
          item-title="fullName"
          item-value="id"
          label="Клиент"
          @update:modelValue="onClientSelect"
        />

        <v-text-field v-model="newCargo.description" label="Описание" />
      </form>
    </CargoModal>

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
