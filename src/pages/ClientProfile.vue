<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useClientStore } from '@/stores/client';
import { useCargoStore } from '@/stores/cargo';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();

type Maybe<T> = T | null | undefined;

interface CargoStatus {
  description?: string;
  value?: string;
}

interface CargoProfile {
  id: number;
  weight?: number;
  volume?: number;
  quantity?: number;
  status?: CargoStatus;

  invoiceTotal?: number;
  paymentReceived?: number;
  balanceDue?: number;
}

interface ClientProfile {
  id: number;
  fullName?: string;
  clientCode?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  additionalInfo?: string;

  totalInvoiceTotal?: number;
  totalPaymentReceived?: number;
  totalBalanceDue?: number;

  cargoProfiles?: CargoProfile[];
}

const route = useRoute();
const clientStore = useClientStore();
const cargoStore = useCargoStore();

const { clients } = storeToRefs(clientStore) as unknown as { clients: { value: ClientProfile[] } };

const client = ref<ClientProfile | null>(null);
const loading = ref(false);
const error = ref('');

// ===== UI state =====
const ratePerKgByCargoId = ref<Record<number, string>>({});
const savingCargoId = ref<number | null>(null);

// ===== helpers =====
const toNumber = (v: unknown) => Number((v as Maybe<number>) ?? 0);
const fmt = (v: unknown) => new Intl.NumberFormat('ru-RU').format(toNumber(v));

const getClientIdFromRoute = (): number => {
  const raw = route.params.id;
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const cargosSorted = computed<CargoProfile[]>(() => {
  const cargos = client.value?.cargoProfiles ?? [];
  return [...cargos].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
});

const cargoHeaders: Array<{ title: string; key: string }> = [
  { title: 'ID', key: 'id' },
  { title: 'Вес (кг)', key: 'weight' },
  { title: 'Объем', key: 'volume' },
  { title: 'Кол-во', key: 'quantity' },
  { title: 'Статус', key: 'status' },
  { title: 'Сумма (в системе)', key: 'invoiceTotal' },
  { title: 'Оплачено', key: 'paymentReceived' },
  { title: 'Долг', key: 'balanceDue' },

  // новые
  { title: 'Цена за кг', key: 'ratePerKg' },
  { title: 'Итог (расчёт)', key: 'computedTotal' },
  { title: 'Действия', key: 'actions' },
];

const canSetPrice = (cargo: CargoProfile): boolean => {
  const weight = toNumber(cargo.weight);
  return weight > 0;
};

const calcComputedTotal = (cargo: CargoProfile): number => {
  const weight = toNumber(cargo.weight);
  const rate = toNumber(ratePerKgByCargoId.value[cargo.id]);
  if (weight <= 0 || rate <= 0) return 0;
  return weight * rate;
};

const refreshClients = async(): Promise<void> => {
  await clientStore.fetchClients();
};

const loadData = async(): Promise<void> => {
  loading.value = true;
  error.value = '';
  try {
    if (!clients.value.length) {
      await refreshClients();
    }

    const id = getClientIdFromRoute();
    client.value = clients.value.find(c => Number(c.id) === id) ?? null;

    if (!client.value) error.value = 'Клиент не найден';
  } catch (e) {
    console.error('Error loading client profile', e);
    error.value = 'Ошибка загрузки данных клиента';
  } finally {
    loading.value = false;
  }
};

const saveComputedPrice = async(cargo: CargoProfile): Promise<void> => {
  const weight = toNumber(cargo.weight);
  if (weight <= 0) {
    alert('Сначала добавьте кг (вес) в груз');
    return;
  }

  const total = calcComputedTotal(cargo);
  if (total <= 0) {
    alert('Введите цену за кг (больше 0)');
    return;
  }

  savingCargoId.value = cargo.id;
  try {
    await cargoStore.setCargoPrice(cargo.id, total);

    await refreshClients();
    const id = getClientIdFromRoute();
    client.value = clients.value.find(c => Number(c.id) === id) ?? null;
  } catch (e) {
    const message =
        typeof e === 'object' && e !== null && 'message' in e ? String((e as { message: unknown }).message) : 'Ошибка сохранения цены';
    alert(message);
  } finally {
    savingCargoId.value = null;
  }
};

onMounted(loadData);
watch(() => route.params.id, loadData);
</script>

<template>
  <v-container>
    <v-btn color="primary" variant="text" class="mb-4" @click="$router.back()">
      <v-icon start>mdi-arrow-left</v-icon>
      Назад
    </v-btn>

    <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px;">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>

    <template v-else-if="client">
      <!-- Profile -->
      <v-card class="mb-6">
        <v-card-title class="text-h5">
          Профиль клиента: {{ client.fullName ?? `#${client.id}` }}
        </v-card-title>

        <v-card-text>
          <v-row class="mb-2">
            <v-col cols="12" md="4">
              <v-list-item>
                <template #prepend><v-icon icon="mdi-cash-minus" class="mr-2" /></template>
                <v-list-item-title>Общий долг</v-list-item-title>
                <v-list-item-subtitle>{{ fmt(client.totalInvoiceTotal) }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="4">
              <v-list-item>
                <template #prepend><v-icon icon="mdi-cash-check" class="mr-2" /></template>
                <v-list-item-title>Внесено</v-list-item-title>
                <v-list-item-subtitle>{{ fmt(client.totalPaymentReceived) }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="4">
              <v-list-item>
                <template #prepend><v-icon icon="mdi-wallet" class="mr-2" /></template>
                <v-list-item-title>Баланс</v-list-item-title>
                <v-list-item-subtitle>{{ fmt(client.totalBalanceDue) }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" md="4"><b>ФИО:</b> {{ client.fullName }}</v-col>
            <v-col cols="12" md="4"><b>Код:</b> {{ client.clientCode }}</v-col>
            <v-col cols="12" md="4"><b>Телефон:</b> {{ client.phoneNumber }}</v-col>
            <v-col cols="12" md="4"><b>Whatsapp:</b> {{ client.whatsappNumber }}</v-col>
            <v-col cols="12" md="4"><b>Email:</b> {{ client.email }}</v-col>
            <v-col cols="12" md="4"><b>Доп:</b> {{ client.additionalInfo }}</v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Cargos -->
      <v-card>
        <v-card-title>Грузы</v-card-title>

        <v-data-table
            :headers="cargoHeaders"
            :items="cargosSorted"
            item-value="id"
        >
          <template #item.status="{ item }">
            {{ item.status?.description ?? item.status?.value ?? '' }}
          </template>

          <template #item.invoiceTotal="{ item }">{{ fmt(item.invoiceTotal) }}</template>
          <template #item.paymentReceived="{ item }">{{ fmt(item.paymentReceived) }}</template>
          <template #item.balanceDue="{ item }">{{ fmt(item.balanceDue) }}</template>

          <!-- ✅ Цена за кг -->
          <template #item.ratePerKg="{ item }">
            <div v-if="!canSetPrice(item)" class="text-caption text-red">
              Сначала добавьте кг в груз
            </div>

            <v-text-field
                v-else
                v-model="ratePerKgByCargoId[item.id]"
                type="number"
                density="compact"
                hide-details
                placeholder="например 35"
            />
          </template>

          <!-- ✅ Итог (front calc) -->
          <template #item.computedTotal="{ item }">
            <span v-if="!canSetPrice(item)">—</span>
            <span v-else>
              {{ fmt(calcComputedTotal(item)) }}
            </span>
          </template>

          <!-- ✅ Сохранение -->
          <template #item.actions="{ item }">
            <v-btn
                color="primary"
                size="small"
                :disabled="!canSetPrice(item) || calcComputedTotal(item) <= 0 || savingCargoId === item.id"
                @click="saveComputedPrice(item)"
            >
              {{ savingCargoId === item.id ? 'Сохранение...' : 'Сохранить' }}
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <v-alert v-else type="error" class="mt-4">
      Клиент не найден
    </v-alert>
  </v-container>
</template>
