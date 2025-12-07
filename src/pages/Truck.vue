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
const saveTruckRef = ref();

interface TruckForm {
  id?: number;
  registrationCountry: string;
  volumeTotalM3: number;
  volumeOccupiedM3: number;
  volumeAvailableM3: number;
  departureWarehouse: string;
  arrivalWarehouse: string;
  driverFullname: string;
  driverPhone: string;
  departureDatePlanned: Date;
  departureDateActual: Date;
  arrivalDatePlanned: Date;
  arrivalDateActual: Date;
  carrier: string;
  serviceFee: number; // TODO это поле нужно??
  customsFee: number;
  expenses: number;
  additionalExpenses: number;
  totalAmount: number;
  additionalInformation?: string;
  // availableVolume: number;
}

const newTruck = ref<TruckForm>({
  registrationCountry: '',
  volumeTotalM3: 0,
  volumeOccupiedM3: 0,
  volumeAvailableM3: 0,
  departureWarehouse: '',
  arrivalWarehouse: '',
  driverFullname: '',
  driverPhone: '',
  departureDatePlanned: new Date(),
  departureDateActual: new Date(),
  arrivalDatePlanned: new Date(),
  arrivalDateActual: new Date(),
  carrier: '',
  serviceFee: 0, // TODO это поле нужно??
  customsFee: 0,
  expenses: 0,
  additionalExpenses: 0,
  totalAmount: 0,
  additionalInformation: '',
  // availableVolume: 0,
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Страна регистрации', key: 'registrationCountry' },
  { title: 'Объем общий (м3)', key: 'volumeTotalM3' },
  { title: 'Объем занятый (м3)', key: 'volumeOccupiedM3' },
  { title: 'Объем доступный (м3)', key: 'volumeAvailableM3' },
  { title: 'Склад отправки', key: 'departureWarehouse' },
  { title: 'Склад доставки', key: 'arrivalWarehouse' },
  { title: 'ФИО водителя', key: 'driverFullname' },
  { title: 'Телефон водителя', key: 'driverPhone' },
  { title: 'Планируемая дата отправки', key: 'departureDatePlanned' },
  { title: 'Фактическая дата отправки', key: 'departureDateActual' },
  { title: 'Планируемая дата доставки', key: 'arrivalDatePlanned' },
  { title: 'Фактическая дата доставки', key: 'arrivalDateActual' },
  { title: 'Перевозчик', key: 'carrier' },
  { title: 'Цена', key: 'serviceFee' }, // TODO это поле нужно??
  { title: 'Стоимость таможни', key: 'customsFee' },
  { title: 'Расходы', key: 'expenses' },
  { title: 'Доп. расходы', key: 'additionalExpenses' },
  { title: 'Общая сумма', key: 'totalAmount' },
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

const deleteTruck = async(id: number) => {
  try {
    await truckStore.deleteTruck(id);
    await getTrucks();
  } catch (error) {
    console.error('Ошибка удаления трака:', error);
  }
};

const saveTruck = async(): Promise<void> => {
  try {
    const isValid = await saveTruckRef.value?.validate();
    if (isValid?.valid) {
      console.log('saving truck, if block is:' + isValid?.valid);
      console.log('I am here anyway!!!');
      const payload = {
        ...newTruck.value,
        departureDatePlanned: formatDateTime(newTruck.value.departureDatePlanned),
        departureDateActual: formatDateTime(newTruck.value.departureDateActual),
        arrivalDatePlanned: formatDateTime(newTruck.value.arrivalDatePlanned),
        arrivalDateActual: formatDateTime(newTruck.value.arrivalDateActual),
      };
      if (isEditing.value) {
        await truckStore.updateTruck(payload);
      } else {
        payload.volumeOccupiedM3 = 0;
        payload.volumeAvailableM3 = payload.volumeTotalM3;
        await truckStore.createTruck(payload);
      }
      closeTruckModal();
      await getTrucks();
    }
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

// const availableVolume = computed(() => {
//   return newTruck.value.volumeTotalM3 - newTruck.value.volumeOccupiedM3;
// });
//
// const trucksWithAvailableVolume = computed(() => {
//   return trucks.value.map(truck => ({
//     ...truck,
//     availableVolume: truck.volumeTotalM3 - truck.volumeOccupiedM3,
//   }));
// });

const closeTruckModal = (): void => {
  newTruck.value = {
    registrationCountry: '',
    volumeTotalM3: 0,
    volumeOccupiedM3: 0,
    volumeAvailableM3: 0,
    departureWarehouse: '',
    arrivalWarehouse: '',
    driverFullname: '',
    driverPhone: '',
    departureDatePlanned: new Date(),
    departureDateActual: new Date(),
    arrivalDatePlanned: new Date(),
    arrivalDateActual: new Date(),
    carrier: '',
    serviceFee: 0, // TODO это поле нужно??
    customsFee: 0,
    expenses: 0,
    additionalExpenses: 0,
    totalAmount: 0,
    additionalInformation: '',
    //availableVolume: 0,
  };
  truckDialog.value = false;
  isEditing.value = false;
};

const openCreateTruckModal = (): void => {
  newTruck.value = {
    registrationCountry: '',
    volumeTotalM3: 0,
    volumeOccupiedM3: 0,
    volumeAvailableM3: 0,
    departureWarehouse: '',
    arrivalWarehouse: '',
    driverFullname: '',
    driverPhone: '',
    departureDatePlanned: new Date(),
    departureDateActual: new Date(),
    arrivalDatePlanned: new Date(),
    arrivalDateActual: new Date(),
    carrier: '',
    serviceFee: 0, // TODO это поле нужно??
    customsFee: 0,
    expenses: 0,
    additionalExpenses: 0,
    totalAmount: 0,
    additionalInformation: '',
    //availableVolume: 0,
  };
  isEditing.value = false;
  truckDialog.value = true;
};

const formatDateTime = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
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
      :title="isEditing ? 'Редактировать фуру' : 'Добавить фуру'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveTruck"
      @close="closeTruckModal"
    >
      <v-form ref="saveTruckRef">
        <v-text-field
          v-model="newTruck.registrationCountry"
          label="Страна регистрации"
          :rules="[v => !!v || 'Обязательное поле']"
          required
        />
        <v-text-field v-model="newTruck.volumeTotalM3" label="Объем общий (м3)"
          :rules="[
            v => !!v || 'Обязательное поле',
            v => v > 0 || 'Значение должно быть больше 0'
          ]"
          type="number" required
        />
        <v-text-field v-model="newTruck.volumeOccupiedM3" label="Объем занятый (м3)" type="number" readonly />
        <v-text-field v-model="newTruck.volumeAvailableM3" label="Объем доступный (м3)" type="number" readonly />
        <v-text-field v-model="newTruck.departureWarehouse" label="Склад отправки" :rules="[v => !!v || 'Обязательное поле']" required />
        <v-text-field v-model="newTruck.arrivalWarehouse" label="Склад доставки" :rules="[v => !!v || 'Обязательное поле']" required />
        <v-text-field v-model="newTruck.driverFullname" label="ФИО водителя" :rules="[v => !!v || 'Обязательное поле']" required />
        <v-text-field v-model="newTruck.driverPhone" label="Телефон водителя" :rules="[v => !!v || 'Обязательное поле']" required />
        <v-text-field v-model="newTruck.departureDatePlanned" label="Планируемая дата отправки" type="datetime-local" required />
        <v-text-field v-model="newTruck.departureDateActual" label="Фактическая дата отправки" type="datetime-local" required />
        <v-text-field v-model="newTruck.arrivalDatePlanned" label="Планируемая дата доставки" type="datetime-local" required />
        <v-text-field v-model="newTruck.arrivalDateActual" label="Фактическая дата доставки" type="datetime-local" required />
        <v-text-field v-model="newTruck.carrier" label="'Перевозчик" type="text" :rules="[v => !!v || 'Обязательное поле']" />
        <v-text-field v-model="newTruck.serviceFee" label="Цена"
          :rules="[
            v => !!v || 'Обязательное поле',
            v => v > 0 || 'Значение должно быть больше 0'
          ]"
          type="number"
          required
        />
        <v-text-field v-model="newTruck.customsFee" label="Стоимость таможни" type="number" />
        <v-text-field v-model="newTruck.expenses" label="Расходы" type="number" />
        <v-text-field v-model="newTruck.additionalExpenses" label="Доп. расходы" type="number" />
        <v-text-field v-model="newTruck.totalAmount" label="Общая сумма" type="number" />
        <v-text-field v-model="newTruck.additionalInformation" label="Доп. информация" />
      </v-form>
    </TruckModal>

    <!-- Таблица с траками -->
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список фур
        <v-btn v-if="canCreate" color="primary" @click="openCreateTruckModal">
          Добавить фуру
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="trucks" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <v-btn v-if="canDelete" color="red" size="small" @click="deleteTruck(item.id)">
            Удалить
          </v-btn>
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editTruck(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
