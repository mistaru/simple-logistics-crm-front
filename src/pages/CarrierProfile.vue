<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCarrierStore } from '@/stores/carrier';
import { useTruckStore } from '@/stores/truck';
import { storeToRefs } from 'pinia';

const route = useRoute();
const carrierStore = useCarrierStore();
const truckStore = useTruckStore();
const { carriers } = storeToRefs(carrierStore);
const { trucks } = storeToRefs(truckStore);

const carrier = ref();
const loading = ref(false);

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Страна регистрации', key: 'registrationCountry' },
  { title: 'ФИО водителя', key: 'driverFullname' },
  { title: 'Телефон водителя', key: 'driverPhone' },
  { title: 'Склад отправки', key: 'departureWarehouse' },
  { title: 'Склад доставки', key: 'arrivalWarehouse' },
  { title: 'Планируемая дата отправки', key: 'departureDatePlanned' },
  { title: 'Планируемая дата доставки', key: 'arrivalDatePlanned' },
  { title: 'Общая сумма', key: 'totalAmount' },
];

const carrierTrucks = computed(() => {
  if (!carrier.value) return [];
  // Filter trucks where the carrier object's ID matches the current carrier's ID
  return trucks.value.filter(t => t.carrier?.id === carrier.value.id);
});

const loadData = async () => {
  loading.value = true;
  try {
    if (carriers.value.length === 0) {
      await carrierStore.fetchCarriers();
    }
    if (trucks.value.length === 0) {
      await truckStore.fetchTrucks();
    }

    const id = Number(route.params.id);
    carrier.value = carriers.value.find(c => c.id === id);
  } catch (e) {
    console.error('Error loading carrier profile data', e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

// Watch for route changes in case we navigate from one profile to another (unlikely but good practice)
watch(() => route.params.id, loadData);
</script>

<template>
  <v-container>
    <v-btn color="primary" variant="text" class="mb-4" @click="$router.back()">
      <v-icon start>mdi-arrow-left</v-icon>
      Назад
    </v-btn>

    <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px;">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else-if="carrier">
      <v-card class="mb-6">
        <v-card-title class="text-h5">
          Профиль перевозчика: {{ carrier.name }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-email" class="mr-2"></v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ carrier.email }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="12" md="4">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-phone" class="mr-2"></v-icon>
                </template>
                <v-list-item-title>Телефон</v-list-item-title>
                <v-list-item-subtitle>{{ carrier.phoneNumber }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="12" md="4">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-wallet" class="mr-2"></v-icon>
                </template>
                <v-list-item-title>Баланс</v-list-item-title>
                <v-list-item-subtitle>{{ carrier.balance }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Список фур</v-card-title>
        <v-data-table
          :headers="headers"
          :items="carrierTrucks"
          :loading="loading"
          item-value="id"
        >
          <template #item.departureDatePlanned="{ item }">
            {{ new Date(item.departureDatePlanned).toLocaleDateString() }}
          </template>
          <template #item.arrivalDatePlanned="{ item }">
            {{ new Date(item.arrivalDatePlanned).toLocaleDateString() }}
          </template>
        </v-data-table>
      </v-card>
    </template>

    <v-alert v-else type="error" class="mt-4">
      Перевозчик не найден
    </v-alert>
  </v-container>
</template>
