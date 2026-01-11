<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientStore } from '@/stores/client';
import { useCargoStore } from '@/stores/cargo';
import { storeToRefs } from 'pinia';

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

  totalInvoiceTotal?: number;      // сумма всех грузов
  totalPaymentReceived?: number;   // внесено
  totalBalanceDue?: number;        // осталось должен

  cargoProfiles?: CargoProfile[];
}

const route = useRoute();
const router = useRouter();
const clientStore = useClientStore();
const cargoStore = useCargoStore();

const { clients } = storeToRefs(clientStore) as unknown as { clients: { value: ClientProfile[] } };

const client = ref<ClientProfile | null>(null);
const loading = ref(false);
const error = ref('');

// ===== helpers =====
const toNumber = (v: unknown) => Number((v as Maybe<number>) ?? 0);
const fmt = (v: unknown) => new Intl.NumberFormat('ru-RU').format(toNumber(v));

const getClientIdFromRoute = (): number => {
  const raw = route.params.id;
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// ===== summary cards colors =====
const debtColor = computed(() => (toNumber(client.value?.totalBalanceDue) > 0 ? 'error' : 'success'));

// ===== table =====
const cargoHeaders: Array<{ title: string; key: string }> = [
  { title: 'ID', key: 'id' },
  { title: 'Вес (кг)', key: 'weight' },
  { title: 'Объем', key: 'volume' },
  { title: 'Кол-во', key: 'quantity' },
  { title: 'Статус', key: 'status' },
  { title: 'Сумма (в системе)', key: 'invoiceTotal' },
  { title: 'Оплачено', key: 'paymentReceived' },
  { title: 'Долг', key: 'balanceDue' },
  { title: 'Действия', key: 'actions' },
];

const cargosSorted = computed<CargoProfile[]>(() => {
  const cargos = client.value?.cargoProfiles ?? [];
  return [...cargos].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
});

// ===== dialog: edit price =====
type PriceMode = 'FIXED' | 'PER_KG';

const priceDialog = ref(false);
const selectedCargo = ref<CargoProfile | null>(null);
const priceMode = ref<PriceMode>('FIXED');

const fixedPriceInput = ref<string>(''); // итоговая сумма
const perKgInput = ref<string>('');      // цена за кг
const saving = ref(false);

const selectedWeight = computed(() => toNumber(selectedCargo.value?.weight));
const hasWeight = computed(() => selectedWeight.value > 0);

const computedByKgTotal = computed(() => {
  const rate = toNumber(perKgInput.value);
  const w = selectedWeight.value;
  if (rate <= 0 || w <= 0) return 0;
  // можно округлить до 2 знаков
  return Number((rate * w).toFixed(2));
});

const openPriceDialog = (cargo: CargoProfile) => {
  selectedCargo.value = cargo;
  priceMode.value = 'FIXED';
  // по умолчанию подставим текущую сумму, если есть
  fixedPriceInput.value = cargo.invoiceTotal != null ? String(cargo.invoiceTotal) : '';
  perKgInput.value = '';
  priceDialog.value = true;
};

const closePriceDialog = () => {
  priceDialog.value = false;
  selectedCargo.value = null;
  fixedPriceInput.value = '';
  perKgInput.value = '';
  priceMode.value = 'FIXED';
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

const savePrice = async(): Promise<void> => {
  if (!selectedCargo.value) return;

  let finalPrice = 0;

  if (priceMode.value === 'FIXED') {
    finalPrice = toNumber(fixedPriceInput.value);
    if (finalPrice <= 0) {
      alert('Введите сумму (больше 0)');
      return;
    }
  } else {
    // PER_KG
    if (!hasWeight.value) {
      alert('Сначала добавьте кг (вес) в груз');
      return;
    }
    const rate = toNumber(perKgInput.value);
    if (rate <= 0) {
      alert('Введите цену за кг (больше 0)');
      return;
    }
    finalPrice = computedByKgTotal.value;
    if (finalPrice <= 0) {
      alert('Не удалось рассчитать сумму');
      return;
    }
  }

  saving.value = true;
  try {
    // ✅ бэк ждёт JSON body { cargoId, price }
    await cargoStore.setCargoPrice(selectedCargo.value.id, finalPrice);

    await refreshClients();
    const id = getClientIdFromRoute();
    client.value = clients.value.find(c => Number(c.id) === id) ?? null;

    closePriceDialog();
  } catch (e) {
    const message =
        typeof e === 'object' && e !== null && 'message' in e ? String((e as { message: unknown }).message) : 'Ошибка сохранения цены';
    alert(message);
  } finally {
    saving.value = false;
  }
};

onMounted(loadData);
watch(() => route.params.id, loadData);
</script>

<template>
  <v-container>
    <v-btn color="primary" variant="text" class="mb-4" @click="router.back()">
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
          <!-- ✅ 3 фин карточки -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-card class="pa-4" color="warning" variant="tonal">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption">Сумма всех грузов</div>
                    <div class="text-h6">{{ fmt(client.totalInvoiceTotal) }}</div>
                  </div>
                  <v-icon icon="mdi-truck" size="28" />
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="pa-4" color="success" variant="tonal">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption">Внесено</div>
                    <div class="text-h6">{{ fmt(client.totalPaymentReceived) }}</div>
                  </div>
                  <v-icon icon="mdi-cash-check" size="28" />
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="pa-4" :color="debtColor" variant="tonal">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption">Осталось должен</div>
                    <div class="text-h6">{{ fmt(client.totalBalanceDue) }}</div>
                  </div>
                  <v-icon icon="mdi-cash-remove" size="28" />
                </div>
              </v-card>
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

        <v-data-table :headers="cargoHeaders" :items="cargosSorted" item-value="id">
          <template #item.status="{ item }">
            {{ item.status?.description ?? item.status?.value ?? '' }}
          </template>

          <template #item.invoiceTotal="{ item }">{{ fmt(item.invoiceTotal) }}</template>
          <template #item.paymentReceived="{ item }">{{ fmt(item.paymentReceived) }}</template>
          <template #item.balanceDue="{ item }">{{ fmt(item.balanceDue) }}</template>

          <template #item.actions="{ item }">
            <v-btn color="primary" size="small" @click="openPriceDialog(item)">
              Ввести новую цену
            </v-btn>
          </template>
        </v-data-table>
      </v-card>

      <!-- Dialog -->
      <v-dialog v-model="priceDialog" max-width="560">
        <v-card>
          <v-card-title class="text-h6">
            Изменить цену груза
          </v-card-title>

          <v-card-text v-if="selectedCargo">
            <div class="mb-2"><b>Груз ID:</b> {{ selectedCargo.id }}</div>
            <div class="mb-4"><b>Вес:</b> {{ fmt(selectedCargo.weight) }} кг</div>

            <v-radio-group v-model="priceMode" inline>
              <v-radio label="Задать сумму" value="FIXED" />
              <v-radio label="Рассчитать по кг" value="PER_KG" />
            </v-radio-group>

            <!-- FIXED -->
            <div v-if="priceMode === 'FIXED'" class="mt-3">
              <v-text-field
                  v-model="fixedPriceInput"
                  type="number"
                  label="Сумма"
                  placeholder="например 15000"
                  hide-details="auto"
              />
            </div>

            <!-- PER KG -->
            <div v-else class="mt-3">
              <v-alert v-if="!hasWeight" type="warning" variant="tonal" class="mb-3">
                Сначала добавьте кг (вес) в груз, затем можно рассчитать цену по кг.
              </v-alert>

              <v-text-field
                  v-model="perKgInput"
                  type="number"
                  label="Цена за кг"
                  placeholder="например 35"
                  hide-details="auto"
                  :disabled="!hasWeight"
              />

              <v-divider class="my-4" />

              <div class="d-flex justify-space-between">
                <div class="text-subtitle-2">Итоговая сумма:</div>
                <div class="text-h6">{{ fmt(computedByKgTotal) }}</div>
              </div>
              <div class="text-caption mt-1">
                Итог = вес × цена_за_кг
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="closePriceDialog">Отмена</v-btn>

            <v-btn
                color="primary"
                :disabled="
                saving ||
                !selectedCargo ||
                (priceMode === 'FIXED' && toNumber(fixedPriceInput) <= 0) ||
                (priceMode === 'PER_KG' && (!hasWeight || toNumber(perKgInput) <= 0 || computedByKgTotal <= 0))
              "
                @click="savePrice"
            >
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <v-alert v-else type="error" class="mt-4">
      Клиент не найден
    </v-alert>
  </v-container>
</template>
