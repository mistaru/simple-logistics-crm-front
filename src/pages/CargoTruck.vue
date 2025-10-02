<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTruckStore } from '@/stores/truck';
import { useCargoStore } from '@/stores/cargo';
import { useCargoTruckStore } from '@/stores/cargoTruck';
import { storeToRefs } from 'pinia';

const truckStore = useTruckStore();
const cargoStore = useCargoStore();
const cargoTruckStore = useCargoTruckStore();
const { trucks } = storeToRefs(truckStore);
//const { cargosByTruckId, cargos } = storeToRefs(cargoStore);
const { cargos } = storeToRefs(cargoStore);
const { cargoTrucks, cargosByTruckId, unassignedCargos } = storeToRefs(cargoTruckStore);

const selectedTruckId = ref<number | null>(null);
const loading = ref(false);

const headers = [
  { title: 'ID', key: 'truck.id' },
  { title: 'Страна регистрации', key: 'truck.registrationCountry' },
  { title: 'Объем общий (м3)', key: 'truck.volumeTotalM3' },
  { title: 'Объем занятый (м3)', key: 'truck.volumeOccupiedM3' },
  { title: 'Объем доступный (м3)', key: 'truck.volumeAvailableM3' },
  { title: 'Склад отправки', key: 'truck.departureWarehouse' },
  { title: 'Склад доставки', key: 'truck.arrivalWarehouse' },
  { title: 'ФИО водителя', key: 'truck.driverFullname' },
  { title: 'Телефон водителя', key: 'truck.driverPhone' },
  { title: 'Действия', key: 'actions', sortable: false },
];

const cargoHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Вес (кг)', key: 'weight' },
  { title: 'Объем (м³)', key: 'volume' },
  { title: 'Количество', key: 'quantity' },
  { title: 'Клиент', key: 'client.fullName' },
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

const getCargoTrucksAll = async(): Promise<void> => {
  loading.value = true;
  try {
    await cargoTruckStore.fetchCargoTrucks();
  } catch (error) {
    console.error('Ошибка загрузки траков:', error);
  } finally {
    loading.value = false;
  }
};

const getCargosByTruck = async(truckId: number): Promise<void> => {
  selectedTruckId.value = truckId;
  try {
    await cargoTruckStore.fetchCargoTrucksByTruckId(truckId);
  } catch (error) {
    console.error('Ошибка загрузки грузов по траку:', error);
  }
};

const getUnassignedCargos = async(): Promise<void> => {
  loading.value = true;
  try {
    await cargoTruckStore.fetchUnassignedCargos();
  } catch (error) {
    console.error('Ошибка загрузки не назначенных грузов:', error);
  } finally {
    loading.value = false;
  }
};

const assignCargoToTruck = async(cargoId: number, truckId: number): Promise<void> => {
  const truck = cargoTrucks.value.find(ct => ct.truck.id === truckId)?.truck;
  const cargo = unassignedCargos.value.find(c => c.id === cargoId);
  if (!truck || !cargo) {
    console.error('Трак или груз не найдены');
    return;
  }
  const totalCargoVolumeM3 = cargo.volume * cargo.quantity;
  const truckOccupiedVolumeM3 = truck.volumeOccupiedM3;
  if (truckOccupiedVolumeM3 + totalCargoVolumeM3 <= truck.volumeTotalM3) {
    try {
      await cargoTruckStore.assignCargoToTruck(cargoId, truckId);
      await getCargoTrucksAll();
      await getCargosByTruck(truckId);
      await getUnassignedCargos();
    } catch (error) {
      console.error('Ошибка привязки груза к траку:', error);
    }
  } else {
    alert('Недостаточно места в траке!');
  }
};

const unassignCargoFromTruck = async(cargoId: number, truckId: number): Promise<void> => {
  try {
    console.log('cargoId: ' + cargoId + ', truckId: ' + truckId);
    await cargoTruckStore.unassignCargoFromTruck(cargoId, truckId);
    await getCargoTrucksAll();
    await getCargosByTruck(truckId);
    await getUnassignedCargos();
  } catch (error) {
    console.error('Ошибка отвязки груза от трака:', error);
  }
};

const availableCargos = computed(() => {
  if (!selectedTruckId.value) return [];
  return cargos.value.filter(
    cargo => !cargosByTruckId.value.some(c => c.id === cargo.id)
  );
});

onMounted(() => {
  getCargoTrucksAll();
  getUnassignedCargos();
});

// onMounted(getTrucks); TODO: return later
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <h2>Доступные фуры</h2>
        <v-data-table
          :headers="headers"
          :items="cargoTrucks"
          :loading="loading"
          item-value="id"
        >
          <template #item="{ item }">
            <tr :class="item.truck.id === selectedTruckId ? 'selected-row' : ''">
              <td>{{ item.truck.id }}</td>
              <td>{{ item.truck.registrationCountry }}</td>
              <td>{{ item.truck.volumeTotalM3 }}</td>
              <td>{{ item.truck.volumeOccupiedM3 }}</td>
              <td>{{ item.truck.volumeAvailableM3 }}</td>
              <td>{{ item.truck.departureWarehouse }}</td>
              <td>{{ item.truck.arrivalWarehouse }}</td>
              <td>{{ item.truck.driverFullname }}</td>
              <td>{{ item.truck.driverPhone }}</td>
              <td>
                <v-btn color="primary" size="small" class="ma-2" @click="getCargosByTruck(item.truck.id)">
                  Посмотреть грузы
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-row v-if="selectedTruckId">
      <v-col>
        <h2>Грузы на фуре</h2>
        <v-data-table :headers="cargoHeaders" :items="cargosByTruckId" item-value="id">
          <template #item.actions="{ item }">
            <v-btn color="red" size="small" @click="unassignCargoFromTruck(item.id, selectedTruckId)">
              Отвязать
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-row v-if="selectedTruckId">
      <v-col>
        <h2>Доступные для привязки грузы</h2>
        <v-data-table :headers="cargoHeaders" :items="unassignedCargos" item-value="id">
          <template #item.actions="{ item }">
            <v-btn color="green" size="small" @click="assignCargoToTruck(item.id, selectedTruckId)">
              Привязать
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

<!--    <v-row v-if="selectedTruckId && availableCargos.length > 0">-->
<!--      <v-col>-->
<!--        <h2>Доступные для привязки грузы</h2>-->
<!--        <v-data-table :headers="cargoHeaders" :items="availableCargos" item-value="id">-->
<!--          <template #item.actions="{ item }">-->
<!--            <v-btn color="green" size="small" @click="assignCargoToTruck(item.id, selectedTruckId)">-->
<!--              Привязать-->
<!--            </v-btn>-->
<!--          </template>-->
<!--        </v-data-table>-->
<!--      </v-col>-->
<!--    </v-row>-->
  </v-container>
</template>

<style>
.selected-row {
  background-color: #BDBDBD !important;
}
</style>
