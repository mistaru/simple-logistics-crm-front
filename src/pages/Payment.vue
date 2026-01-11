<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePaymentStore } from '@/stores/payment';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import PaymentModal from '@/components/PaymentModal.vue';
import Rules from '@/utils/rules';

const paymentStore = usePaymentStore();
const appStore = useAppStore();
const { payments, truckIds, cargoIds } = storeToRefs(paymentStore);

const loading = ref(false);
const paymentDialog = ref(false);
const paymentDialogTruck = ref(false);
const isEditing = ref(false);
const isEditingTruck = ref(false);
const selectedPaymentId = ref<number | null>(null);

interface PaymentForm {
  id?: number;
  actual?: string;
  payer_id?: number;
  amount?: number;
  comment?: string;
  type?: 'CLIENT_PAYS_FOR_CARGO' | 'COMPANY_PAYS_CARRIERS';
}

const newPayment = ref<PaymentForm>({
  id: 0,
  actual: 0,
  amount: 0,
  payer_id: '',
  comment: '',
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Тип платежа', key: 'status.value' },
  { title: 'Дата фактической оплаты', key: 'actual' },
  { title: 'Сумма', key: 'amount' },
  { title: 'Комментарии', key: 'comment' },
  { title: 'Действия', key: 'actions' },
];

const getPayments = async(): Promise<void> => {
  loading.value = true;
  try {
    await paymentStore.fetchPayments();
    await paymentStore.fetchTruckIds();
    await paymentStore.fetchCargoIds();
  } catch (error) {
    console.error('Ошибка загрузки платежей:', error);
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
});

const savePayment = async(): Promise<void> => {
  try {

    const preparedPayment = preparePaymentData(newPayment.value);

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

const savePaymentTruck = async(): Promise<void> => {
  try {

    const preparedPayment = preparePaymentData(newPayment.value);

    if (isEditingTruck.value) {
      await paymentStore.updatePayment(preparedPayment);
    } else {
      await paymentStore.createPaymentTruck(preparedPayment);
    }
    closePaymentModalTruck();
    await getPayments();
  } catch (error) {
    console.error('Ошибка сохранения платежа:', error);
  }
};

const editPayment = (id: number): void => {
  const payment = payments.value.find(p => p.id === id);
  if (!payment) return;

  // Определяем тип платежа по полю type или статусу
  const type = payment.type ?? statusToType(payment.status?.value);
  if (!type) {
    console.error('Не удалось определить тип платежа', payment);
    return;
  }

  // Создаём чистый объект для редактирования
  const cleanPayment = {
    id: payment.id,
    actual: payment.actual,
    payer_id: payment.payer_id,
    amount: payment.amount,
    comment: payment.comment ?? '',
    status: payment.status,
    type,
  };

  newPayment.value = cleanPayment;

  // Сброс предыдущих состояний модалок
  paymentDialog.value = false;
  paymentDialogTruck.value = false;
  isEditing.value = false;
  isEditingTruck.value = false;

  // Открываем правильную модалку
  if (type === 'CLIENT_PAYS_FOR_CARGO') {
    isEditing.value = true;
    paymentDialog.value = true;
  } else if (type === 'COMPANY_PAYS_CARRIERS') {
    isEditingTruck.value = true;
    paymentDialogTruck.value = true;
  }
};

// Функция маппинга статуса в тип
const statusToType = (statusValue?: string) => {
  switch (statusValue) {
  case 'Клиент оплачивает за груз':
    return 'CLIENT_PAYS_FOR_CARGO';
  case 'Компания оплачивает перевозчикам':
    return 'COMPANY_PAYS_CARRIERS';
  default:
    return null;
  }
};

const closePaymentModal = () => {
  newPayment.value = {
    actual: 0,
    payer_id: '',
    amount: '',
    comment: '',
  };
  selectedPaymentId.value = null;
  paymentDialog.value = false;
  isEditing.value = false;
};

const closePaymentModalTruck = () => {
  newPayment.value = {
    actual: 0,
    payer_id: '',
    amount: '',
    comment: '',
  };
  selectedPaymentId.value = null;
  paymentDialogTruck.value = false;
  isEditingTruck.value = false;
};

const openCreatePaymentModal = (): void => {
  newPayment.value = {
    actual: '',
    payer_id: '',
    amount: '',
    comment: '',
    type: 'CLIENT_PAYS_FOR_CARGO',
  };
  isEditing.value = false;
  paymentDialog.value = true;
};

const openCreatePaymentModalTruck = (): void => {
  newPayment.value = {
    actual: '',
    payer_id: '',
    amount: '',
    comment: '',
    type: 'COMPANY_PAYS_CARRIERS',
  };
  isEditingTruck.value = false;
  paymentDialogTruck.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('payment', 'update'));
const canDelete = computed(() => appStore.checkAccess('payment', 'delete'));
const canCreate = computed(() => appStore.checkAccess('payment', 'create'));
const canCreateTruck = computed(() => appStore.checkAccess('payment', 'create'));

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
        <v-text-field
          v-model="newPayment.actual"
          :rules="Rules.required"
          label="Фактическая дата"
          type="datetime-local"
        />
        <v-select
          v-model="newPayment.payer_id"
          :items="cargoIds"
          item-title="description"
          item-value="id"
          label="Номер груза"
        />
        <v-text-field v-model="newPayment.amount" :rules="Rules.required" label="Сумма" type="number" />
        <v-text-field
          v-model="newPayment.comment"
          label="Комментарий"
        />
      </form>
    </PaymentModal>

    <PaymentModalTruck
      v-model:dialog="paymentDialogTruck"
      :title="isEditingTruck ? 'Редактировать платёж' : 'Добавить платёж'"
      :confirm-text="isEditingTruck ? 'Сохранить' : 'Создать'"
      @confirm="savePaymentTruck"
      @close="closePaymentModalTruck"
    >
      <form>
        <v-text-field
          v-model="newPayment.actual"
          :rules="Rules.required"
          label="Фактическая дата"
          type="datetime-local"
        />
        <v-select
          v-model="newPayment.payer_id"
          :items="truckIds"
          item-title="description"
          item-value="id"
          label="Номер перевозчика"
        />
        <v-text-field v-model="newPayment.amount" :rules="Rules.required" label="Сумма" type="number" />
        <v-text-field
          v-model="newPayment.comment"
          label="Комментарий"
        />
      </form>
    </PaymentModalTruck>

    {{ newPayment.payer_id }}

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список платежей
        <v-btn
          v-if="canCreate"
          color="primary"
          @click="openCreatePaymentModal"
        >
          Добавить платёж клиента
        </v-btn>
        <v-btn
          v-if="canCreateTruck"
          color="primary"
          @click="openCreatePaymentModalTruck"
        >
          Добавить платёж перевозчика
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="payments"
        :loading="loading"
        item-value="id"
      >
        <template #item.actions="{ item }">
          <v-btn
            v-if="canUpdate"
            color="blue"
            size="small"
            class="ma-2"
            @click="editPayment(item.id)"
          >
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
