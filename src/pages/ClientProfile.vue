<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useClientStore } from '@/stores/client';
import http from '@/api/http';

const route = useRoute();
const clientStore = useClientStore();

const clientId = Number(route.params.id);

const loading = ref(false);
const error = ref('');

const rateByCargoId = ref<Record<number, string>>({});
const savingCargoId = ref<number | null>(null);

const toNumber = (v: any) => Number(v ?? 0);
const fmt = (v: any) => new Intl.NumberFormat('ru-RU').format(toNumber(v));

const profile = computed(() => {
  return clientStore.clients.find((c: any) => Number(c.id) === clientId) ?? null;
});

const cargosSorted = computed(() => {
  const cargos = profile.value?.cargoProfiles ?? [];
  return [...cargos].sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0)); // ✅ свежие сверху
});

const cargoHasPrice = (cargo: any) => toNumber(cargo.invoiceTotal) > 0;

const calcPrice = (cargo: any) => {
  const rate = toNumber(rateByCargoId.value[cargo.id]);
  const weight = toNumber(cargo.weight);
  if (rate <= 0 || weight <= 0) return 0;
  return rate * weight;
};

const refresh = async () => {
  loading.value = true;
  error.value = '';
  try {
    await clientStore.fetchClients(); // ✅ обновляем totals после setPrice
  } catch (e: any) {
    error.value = 'Ошибка обновления данных';
  } finally {
    loading.value = false;
  }
};

const setPrice = async (cargo: any) => {
  const price = calcPrice(cargo);
  if (price <= 0) {
    alert('Ставка и вес должны быть больше 0');
    return;
  }

  savingCargoId.value = cargo.id;
  try {
    // твой backend
    await http.post('/cargo/price', null, { params: { cargoId: cargo.id, price } });

    // обновить summary и суммы
    await refresh();
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Ошибка сохранения цены');
  } finally {
    savingCargoId.value = null;
  }
};

onMounted(async () => {
  // если store пустой (перешел по прямой ссылке) — загрузим
  if (!clientStore.clients.length) {
    await refresh();
  }
});
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Профиль клиента #{{ clientId }}
        <v-btn variant="text" @click="$router.back()">Назад</v-btn>
      </v-card-title>

      <v-card-text>
        <div v-if="loading">Загрузка...</div>
        <div v-else-if="error" class="text-red">{{ error }}</div>

        <div v-else-if="profile">
          <!-- ✅ Summary -->
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="pa-3">
                <div class="text-caption">Общий долг</div>
                <div class="text-h6">{{ fmt(profile.totalInvoiceTotal) }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3">
                <div class="text-caption">Внесено</div>
                <div class="text-h6">{{ fmt(profile.totalPaymentReceived) }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3">
                <div class="text-caption">Баланс</div>
                <div class="text-h6">{{ fmt(profile.totalBalanceDue) }}</div>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- ✅ Client info -->
          <div class="text-subtitle-1 mb-2">Информация о клиенте</div>
          <v-row>
            <v-col cols="12" md="6"><b>ФИО:</b> {{ profile.fullName }}</v-col>
            <v-col cols="12" md="6"><b>Код:</b> {{ profile.clientCode }}</v-col>
            <v-col cols="12" md="6"><b>Телефон:</b> {{ profile.phoneNumber }}</v-col>
            <v-col cols="12" md="6"><b>Whatsapp:</b> {{ profile.whatsappNumber }}</v-col>
            <v-col cols="12" md="6"><b>Email:</b> {{ profile.email }}</v-col>
            <v-col cols="12" md="6"><b>Доп:</b> {{ profile.additionalInfo }}</v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- ✅ Cargos -->
          <div class="text-subtitle-1 mb-2">Грузы</div>

          <v-data-table
            :headers="[
              { title: 'ID', key: 'id' },
              { title: 'Вес (кг)', key: 'weight' },
              { title: 'Объем', key: 'volume' },
              { title: 'Кол-во', key: 'quantity' },
              { title: 'Статус', key: 'status' },
              { title: 'Сумма', key: 'invoiceTotal' },
              { title: 'Оплачено', key: 'paymentReceived' },
              { title: 'Долг', key: 'balanceDue' },
              { title: 'Ставка/кг', key: 'rate' },
              { title: 'Действия', key: 'actions' },
            ]"
            :items="cargosSorted"
            item-value="id"
          >
            <template #item.status="{ item }">
              {{ item.status?.description ?? item.status?.value ?? '' }}
            </template>

            <template #item.invoiceTotal="{ item }">{{ fmt(item.invoiceTotal) }}</template>
            <template #item.paymentReceived="{ item }">{{ fmt(item.paymentReceived) }}</template>
            <template #item.balanceDue="{ item }">{{ fmt(item.balanceDue) }}</template>

            <!-- ✅ ставка только если нет цены -->
            <template #item.rate="{ item }">
              <span v-if="cargoHasPrice(item)">—</span>
              <v-text-field
                v-else
                v-model="rateByCargoId[item.id]"
                type="number"
                density="compact"
                hide-details
                placeholder="например 35"
              />
            </template>

            <template #item.actions="{ item }">
              <span v-if="cargoHasPrice(item)">—</span>
              <v-btn
                v-else
                color="primary"
                size="small"
                :disabled="savingCargoId === item.id"
                @click="setPrice(item)"
              >
                {{ savingCargoId === item.id ? 'Сохранение...' : 'Установить цену' }}
              </v-btn>
            </template>
          </v-data-table>
        </div>

        <div v-else class="text-red">
          Клиент не найден
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
