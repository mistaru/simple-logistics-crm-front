<template>
  <v-container fluid>
    <data-table
      :headers="headers"
      :items="cargoStore.cargos"
      :loading="cargoStore.loading"
    >
      <template #top-button>
        <v-btn
          v-show="!isHidden"
          class="mx-2"
          color="primary"
          variant="elevated"
          @click="openDialog"
        >
          Добавить
        </v-btn>
      </template>
      <template #item.actions="{ item }">
        <div class="text-left d-flex ga-2">
          <hint msg="Редактировать">
            <v-btn
              v-show="!isHidden"
              class="mx-2"
              color="primary"
              variant="text"
              size="x-small"
              icon="edit"
              @click="editItem(item)"
            />
          </hint>
          <hint msg="Удалить">
            <v-btn
              v-show="!isHidden"
              class="mx-2"
              color="primary"
              variant="text"
              size="x-small"
              icon="delete"
              @click="confirmDelete(item)"
            />
          </hint>
        </div>
      </template>
    </data-table>

    <v-dialog v-model="dialog" persistent max-width="600">
      <v-card>
        <v-card-title>
          <v-spacer />
          <span class="headline">{{ formData.id ? 'Редактировать' : 'Добавить' }}</span>
          <v-spacer />
        </v-card-title>

        <v-card-text class="py-4">
          <v-form v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="formData.weight" label="Вес (кг)" type="number" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="formData.volume" label="Объем (м³)" type="number" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="formData.quantity" label="Количество" type="number" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="formData.warehouseArrivalDate" label="Дата прибытия" type="datetime-local" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="formData.shipmentDate" label="Дата отправки" type="datetime-local" />
              </v-col>
              <v-col cols="12">
                <v-select v-model="formData.status" :items="statuses" item-title="description" item-value="value" label="Статус" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="formData.description" label="Описание" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="!valid" color="primary" variant="elevated" @click="save">Сохранить</v-btn>
          <v-btn color="primary" variant="outlined" @click="cancel">Отмена</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <confirm-dialog ref="deleteDialog" v-model="deleteDialogIsOpen" @handle-ok="deleteItem" />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCargoStore } from '@/store/cargoStore';
import { useFetchData } from '@/composables/fetchData';
import Rules from '@/api/rules';
import Hint from '@/components/Hint.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const cargoStore = useCargoStore();
const { fetchData } = useFetchData();

const dialog = ref(false);
const deleteDialogIsOpen = ref(false);
const formData = ref({});
const valid = ref(false);
const isHidden = ref(false);
const statuses = ref([]);
const selectedCargo = ref(null);

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Вес (кг)', key: 'weight' },
  { title: 'Объем (м³)', key: 'volume' },
  { title: 'Количество', key: 'quantity' },
  { title: 'Дата прибытия', key: 'warehouseArrivalDate' },
  { title: 'Дата отправки', key: 'shipmentDate' },
  { title: 'Статус', key: 'status' },
  { title: 'Описание', key: 'description' },
  { title: 'Действие', key: 'actions', sortable: false, align: 'start' },
];

const loadStatuses = async() => {
  const [response, error] = await fetchData('/enums/cargoStatuses');
  if (!error) {
    statuses.value = response.map((status) => ({
      value: status.value,
      description: status.description,
    }));
  }
};

const formatDateTime = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

const openDialog = () => {
  formData.value = {};
  dialog.value = true;
};

const editItem = (item) => {
  formData.value = { ...item };
  dialog.value = true;
};

const confirmDelete = (item) => {
  selectedCargo.value = item;
  deleteDialogIsOpen.value = true;
};

const deleteItem = async() => {
  if (selectedCargo.value) {
    await cargoStore.deleteCargo(selectedCargo.value.id);
    deleteDialogIsOpen.value = false;
    selectedCargo.value = null;
  }
};

const save = async() => {
  const payload = {
    ...formData.value,
    warehouseArrivalDate: formatDateTime(formData.value.warehouseArrivalDate),
    shipmentDate: formatDateTime(formData.value.shipmentDate),
  };

  if (formData.value.id) {
    await cargoStore.updateCargo(payload);
  } else {
    await cargoStore.createCargo(payload);
  }

  dialog.value = false;
};

const cancel = () => {
  dialog.value = false;
  formData.value = {};
};

onMounted(() => {
  cargoStore.fetchCargos();
  loadStatuses();
});
</script>
