<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCargoStore } from '@/stores/cargo';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import CargoModal from '@/components/CargoModal.vue';
import Rules from '@/utils/rules';

const cargoStore = useCargoStore();
const appStore = useAppStore();
const { cargos, statuses, clients } = storeToRefs(cargoStore);

const loading = ref(false);
const cargoDialog = ref(false);
const isEditing = ref(false);
const selectedCargoId = ref<number | null>(null);

// Правильная типизация
interface CargoForm {
  id?: number | null;
  weight: number | null;
  volume: number | null;
  quantity: number | null;
  warehouseArrivalDate?: string | null;
  shipmentDate?: string | null;
  status: string | null;  // статус — строка
  client: number | null;  // клиент — только id
  description?: string | null;
}

// пустая форма
const newCargo = ref<CargoForm>({
  id: null,
  weight: null,
  volume: null,
  quantity: null,
  warehouseArrivalDate: null,
  shipmentDate: null,
  status: null,
  client: null,
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

// 🔥 правильное формирование JSON
const prepareCargoData = (cargo: CargoForm) => ({
  id: cargo.id ?? null,

  weight: Number(cargo.weight) || 0,
  volume: Number(cargo.volume) || 0,
  quantity: Number(cargo.quantity) || 0,

  warehouseArrivalDate: cargo.warehouseArrivalDate
    ? new Date(cargo.warehouseArrivalDate).toISOString()
    : null,

  shipmentDate: cargo.shipmentDate
    ? new Date(cargo.shipmentDate).toISOString()
    : null,

  // правильно: только { id }
  client: cargo.client ? { id: Number(cargo.client) } : null,

  // статус строка
  status: cargo.status ?? null,

  description: cargo.description ?? null,
});

const saveCargo = async () => {
  try {
    const prepared = prepareCargoData(newCargo.value);

    if (isEditing.value && newCargo.value.id) {
      await cargoStore.updateCargo(newCargo.value.id, prepared);
    } else {
      await cargoStore.createCargo(prepared);
    }

    closeCargoModal();
    await getCargos();
  } catch (error) {
    console.error("Ошибка сохранения груза:", error);
  }
};

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

    // 🔥 статус — только строка
    status: cargo.status?.value ?? null,

    // 🔥 клиент — только ID
    client: cargo.client?.id ?? null,

    description: cargo.description ?? '',
  };

  isEditing.value = true;
  cargoDialog.value = true;
};

const closeCargoModal = () => {
  newCargo.value = {
    id: null,
    weight: null,
    volume: null,
    quantity: null,
    warehouseArrivalDate: null,
    shipmentDate: null,
    status: null,
    client: null,
    description: '',
  };
  isEditing.value = false;
  cargoDialog.value = false;
};

const openCreateCargoModal = () => {
  newCargo.value = {
    id: null,
    weight: null,
    volume: null,
    quantity: null,
    warehouseArrivalDate: null,
    shipmentDate: null,
    status: statuses.value.length ? statuses.value[0].value : null,
    client: null,
    description: '',
  };

  isEditing.value = false;
  cargoDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('cargo', 'update'));
const canDelete = computed(() => appStore.checkAccess('cargo', 'delete'));
const canCreate = computed(() => appStore.checkAccess('cargo', 'create'));

onMounted(() => getCargos());
</script>
