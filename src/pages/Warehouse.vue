<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWarehouseStore } from '@/stores/warehouse';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import ModalDialog from '@/components/WarehouseModal.vue';
import Rules from '@/utils/rules';

const warehouseStore = useWarehouseStore();
const appStore = useAppStore();
const { warehouses, cities } = storeToRefs(warehouseStore);

const warehouseDialog = ref(false);
const loading = ref(false);
const isEditing = ref(false);

interface WarehouseForm {
  id?: number;
  name: string;
  isLocal: boolean;
  city: string;
  address: string;
  phoneNumber: string;
  volumeM3: number;
  weightKg: number;
}

const newWarehouse = ref<WarehouseForm>({
  name: '',
  isLocal: false,
  city: 0,
  address: '',
  phoneNumber: '',
  volumeM3: 0,
  weightKg: 0,
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Местная', key: 'isLocal' },
  { title: 'Город', key: 'city.name' },
  { title: 'Адрес', key: 'address' },
  { title: 'Номер телефона', key: 'phoneNumber' },
  { title: 'Объем (м3)', key: 'volumeM3' },
  { title: 'Занятый объем (м3)', key: 'occupiedVolume' },
  { title: 'Вес (кг)', key: 'weightKg' },
  { title: 'Занятый вес (кг)', key: 'occupiedWeight' },
  { title: 'Действия', key: 'actions' },
];

const getWarehouses = async(): Promise<void> => {
  loading.value = true;
  try {
    await warehouseStore.fetchWarehouses();
    await warehouseStore.fetchCities();
  } catch (error) {
    console.error('Ошибка загрузки складов:', error);
  } finally {
    loading.value = false;
  }
};

const deleteWarehouse = async(id: number) => {
  try {
    await warehouseStore.deleteWarehouse(id);
    await getWarehouses();
  } catch (error) {
    console.error('Ошибка удаления склада:', error);
  }
};

const saveWarehouse = async(): Promise<void> => {
  try {

    if (typeof newWarehouse.value.city !== 'object') {
      newWarehouse.value.city = { id: newWarehouse.value.city };
    }

    if (isEditing.value) {
      await warehouseStore.updateWarehouse({ ...newWarehouse.value });
    } else {
      await warehouseStore.createWarehouse({ ...newWarehouse.value });
    }
    closeWarehouseModal();
    await getWarehouses();
  } catch (error) {
    console.error('Ошибка сохранения склада:', error);
  }
};

const editWarehouse = (id: number) : void => {
  const warehouse = warehouses.value.find(w => w.id === id);
  if (warehouse) {
    newWarehouse.value = { ...warehouse };
    isEditing.value = true;
    warehouseDialog.value = true;
  }
};

const closeWarehouseModal = (): void => {
  newWarehouse.value = { name: '', isLocal: false, city: '', address: '', phoneNumber: '', volumeM3: 0, weightKg: 0 };
  warehouseDialog.value = false;
  isEditing.value = false;
};

const openCreateWarehouseModal = async(): Promise<void> => {
  newWarehouse.value = { name: '', isLocal: false, city: '', address: '', phoneNumber: '', volumeM3: 0, weightKg: 0 };
  isEditing.value = false;
  warehouseDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('warehouse', 'update'));
const canDelete = computed(() => appStore.checkAccess('warehouse', 'delete'));
const canCreate = computed(() => appStore.checkAccess('warehouse', 'create'));

onMounted(getWarehouses);
</script>

<template>
  <v-container>
    <ModalDialog
      v-model:dialog="warehouseDialog"
      :title="isEditing ? 'Редактировать склад' : 'Создать склад'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveWarehouse"
      @close="closeWarehouseModal"
    >
      <form>
        <v-text-field v-model="newWarehouse.name" :rules="Rules.required" label="Название" />
        <v-checkbox v-model="newWarehouse.isLocal" label="Местный" />
        <v-select
          v-model="newWarehouse.city"
          :items="cities"
          item-title="name"
          item-value="id"
          label="Город"
        />
        <v-text-field v-model="newWarehouse.address" :rules="Rules.required" label="Адрес" />
        <v-text-field v-model="newWarehouse.phoneNumber" :rules="Rules.required" label="Телефон склада" />
        <v-text-field v-model="newWarehouse.volumeM3" type="number" :rules="Rules.required" label="Объем (м3)" />
        <v-text-field v-model="newWarehouse.weightKg" type="number" :rules="Rules.required" label="Вес (кг)" />
      </form>
    </ModalDialog>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список складов
        <v-btn v-if="canCreate" color="primary" @click="openCreateWarehouseModal">
          Создать склад
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="warehouses" :loading="loading" item-value="id">
        <template #item.isLocal="{ item }">
          {{ item.isLocal ? 'Да' : 'Нет' }}
        </template>

        <template #item.actions="{ item }">
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editWarehouse(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>

    </v-card>
  </v-container>
</template>
