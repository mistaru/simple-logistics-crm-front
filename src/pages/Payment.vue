<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePaymentStore } from '@/stores/payment';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import PaymentModal from '@/components/PaymentModal.vue';
import Rules from '@/utils/rules';

const paymentStore = usePaymentStore();
const appStore = useAppStore();
const { payments, statuses } = storeToRefs(paymentStore);

const loading = ref(false);
const paymentDialog = ref(false);
const isEditing = ref(false);
const selectedPaymentId = ref<number | null>(null);

interface PaymentForm {
  id?: number;
  actual?: string;
  planned?: string;
  status: string;
  comment?: string;
}

const newPayment = ref<PaymentForm>({
  id: 0,
  actual: 0,
  planned: 1,
  status: '',
  comment: '',
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Статус', key: 'status.value' },
  { title: 'Груз', key: 'cargo' },
  { title: 'Планируемая оплата', key: 'planned' },
  { title: 'Фактическая оплата', key: 'actual' },
  { title: 'Комментарии', key: 'comment' },
  { title: 'Действия', key: 'actions' },
];

const getPayments = async(): Promise<void> => {
  loading.value = true;
  try {
    await paymentStore.fetchPayments();
    await paymentStore.fetchStatuses();
  } catch (error) {
    console.error('Ошибка загрузки платжей:', error);
  } finally {
    loading.value = false;
  }
};

const deleteCargo = async(id: number) => {
  await paymentStore.deletePayment(id);
  await getPayments();
};

const preparePaymentData = (payment) => ({
  ...payment,
  actual: payment.actual
    ? new Date(payment.actual).toISOString()
    : null,
  planned: payment.planned
    ? new Date(payment.planned).toISOString()
    : null,
});

const savePayment = async(): Promise<void> => {
  try {

    const preparedPayment = preparePaymentData(newPayment.value);

    newPayment.value.status = typeof newPayment.value.status === 'object'
      ? newPayment.value.status.value
      : newPayment.value.status;

    if (isEditing.value) {
      await paymentStore.updatePayment(preparedPayment);
    } else {
      await paymentStore.createPayment(preparedPayment);
    }
    closePaymentModal();
    await getPayments();
  } catch (error) {
    console.error('Ошибка сохранения платежа:', error);
  }
};

const editPayment = (id: number): void => {
  const payment = payments.value.find(c => c.id === id);
  if (payment) {
    newPayment.value = { ...payment };
    isEditing.value = true;
    paymentDialog.value = true;
  }
};

const closePaymentModal = () => {
  newPayment.value = {
    actual: 0,
    planned: 1,
    status: '',
    comment: '',
  };
  selectedPaymentId.value = null;
  paymentDialog.value = false;
  isEditing.value = false;
};

const openCreatePaymentModal = (): void => {
  newPayment.value = {
    actual: 0,
    planned: 1,
    status: '',
    comment: '',
  };
  isEditing.value = false;
  paymentDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('payment', 'update'));
const canDelete = computed(() => appStore.checkAccess('payment', 'delete'));
const canCreate = computed(() => appStore.checkAccess('payment', 'create'));

onMounted(async() => {
  await getPayments();
});
</script>

<template>
  <v-container>
    <PaymentModal
      v-model:dialog="paymentDialog"
      :title="isEditing ? 'Редактировать платёж' : 'Добавить платёж'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="savePayment"
      @close="closePaymentModal"
    >
      <form>
        <v-text-field v-model="newPayment.actual" :rules="Rules.required" label="Фактическа дата" type="datetime-local" />
        <v-text-field v-model="newPayment.planned" :rules="Rules.required" label="Планируемая дата" type="datetime-local" />
        <v-select
          v-model="newPayment.status"
          :items="statuses"
          item-title="description"
          item-value="value"
          label="Статус"
        />
        <v-text-field v-model="newPayment.comment" label="Комментарий" />
      </form>
    </PaymentModal>

    {{ newPayment.status }}

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список платежей
        <v-btn v-if="canCreate" color="primary" @click="openCreatePaymentModal">
          Добавить платёж
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="payments" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editPayment(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
