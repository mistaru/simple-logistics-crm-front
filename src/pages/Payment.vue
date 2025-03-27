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
  { title: 'Статус', key: 'status' },
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


<!--<template>-->
<!--  <v-container fluid>-->
<!--    <data-table-->
<!--      :headers="headers"-->
<!--      :items="data"-->
<!--      :loading="loading"-->
<!--    >-->
<!--      <template #top-button>-->
<!--        <v-btn-->
<!--          v-show="!isHidden"-->
<!--          class="mx-2"-->
<!--          color="primary"-->
<!--          variant="elevated"-->
<!--          @click="dialog = true"-->
<!--        >-->
<!--          Добавить-->
<!--        </v-btn>-->
<!--      </template>-->
<!--      <template #item.actions="{ item }">-->
<!--        <div class="text-left d-flex ga-2">-->
<!--          <hint msg="Редактировать">-->
<!--            <v-btn-->
<!--              v-show="!isHidden"-->
<!--              class="mx-2"-->
<!--              color="primary"-->
<!--              variant="text"-->
<!--              size="x-small"-->
<!--              icon="edit"-->
<!--              @click="editedItem(item)"-->
<!--            />-->
<!--          </hint>-->
<!--          <hint msg="Удалить">-->
<!--            <v-btn-->
<!--              v-show="!isHidden"-->
<!--              class="mx-2"-->
<!--              color="primary"-->
<!--              variant="text"-->
<!--              size="x-small"-->
<!--              icon="delete"-->
<!--              @click="deleteDialogIsOpen = true"-->
<!--            />-->
<!--          </hint>-->
<!--          <confirm-dialog-->
<!--            ref="deleteDialog"-->
<!--            v-model="deleteDialogIsOpen"-->
<!--            @handle-ok="deleteItem(item)"-->
<!--          />-->
<!--        </div>-->
<!--      </template>-->
<!--    </data-table>-->

<!--    <v-dialog-->
<!--      v-model="dialog"-->
<!--      persistent-->
<!--      :max-width="600"-->
<!--      scrollable-->
<!--    >-->
<!--      <template #activator="{props}">-->
<!--        <slot-->
<!--          name="activator"-->
<!--          v-bind="props"-->
<!--        />-->
<!--      </template>-->
<!--      <v-card>-->
<!--        <v-card-title>-->
<!--          <v-spacer />-->
<!--          <span class="headline">{{ formData.id ? 'Редактировать' : 'Добавить' }}</span>-->
<!--          <v-spacer />-->
<!--        </v-card-title>-->

<!--        <v-card-text class="py-4">-->
<!--          <v-form v-model="valid">-->
<!--            <v-row>-->
<!--              <v-col cols="12">-->
<!--                <v-text-field-->
<!--                  v-model="formData.status"-->
<!--                  label="Статус"-->
<!--                  :rules="[rules.required]"-->
<!--                />-->
<!--              </v-col>-->
<!--              <v-col cols="12">-->
<!--                <v-text-field-->
<!--                  v-model="formData.cargo"-->
<!--                  label="Груз"-->
<!--                  type="number"-->
<!--                  :rules="[rules.required]"-->
<!--                />-->
<!--              </v-col>-->
<!--              <v-col cols="12">-->
<!--                <v-text-field-->
<!--                  v-model="formData.planned"-->
<!--                  label="Планиуремая оплата"-->
<!--                  :rules="[rules.required]"-->
<!--                />-->
<!--              </v-col>-->
<!--              <v-col cols="12">-->
<!--                <v-text-field-->
<!--                  v-model="formData.actual"-->
<!--                  label="Фактическая оплата"-->
<!--                  :rules="[rules.required]"-->
<!--                />-->
<!--              </v-col>-->
<!--              <v-col cols="12">-->
<!--                <v-text-field-->
<!--                  v-model="formData.comment"-->
<!--                  label="Комментарий"-->
<!--                />-->
<!--              </v-col>-->
<!--            </v-row>-->
<!--          </v-form>-->
<!--        </v-card-text>-->

<!--        <v-card-actions>-->
<!--          <v-spacer />-->
<!--          <v-btn-->
<!--            :disabled="!valid"-->
<!--            color="primary"-->
<!--            variant="elevated"-->
<!--            @click="save"-->
<!--          >-->
<!--            Сохранить-->
<!--          </v-btn>-->
<!--          <v-btn-->
<!--            color="primary"-->
<!--            variant="outlined"-->
<!--            @click="cancel"-->
<!--          >-->
<!--            Отмена-->
<!--          </v-btn>-->
<!--        </v-card-actions>-->
<!--      </v-card>-->
<!--    </v-dialog>-->

<!--    <confirm-dialog>-->
<!--      <confirm-dialog-->
<!--        ref="dialog"-->
<!--        v-model="confirmDialog"-->
<!--      />-->
<!--    </confirm-dialog>-->
<!--  </v-container>-->
<!--</template>-->

<!--<script>-->
<!--import Rules from '@/api/rules';-->
<!--import { mapActions, mapState } from 'pinia';-->
<!--import { useStore } from '@/store/store.js';-->
<!--import ConfirmDialog from '@/components/ConfirmDialog.vue';-->
<!--import Hint from '@/components/Hint.vue';-->
<!--import PaymentModal from "@/components/PaymentModal.vue";-->

<!--export default {-->
<!--  name: 'Payment',-->
<!--  components: { Hint, ConfirmDialog },-->
<!--  data: () => ({-->
<!--    deleteDialogIsOpen: false,-->
<!--    rules: Rules,-->
<!--    loading: false,-->
<!--    valid: false,-->
<!--    isHidden: false,-->
<!--    $isMobile: false,-->
<!--    data: [],-->
<!--    headers: [-->
<!--      { title: 'ID', key: 'id' },-->
<!--      { title: 'Статус', key: 'status' },-->
<!--      { title: 'Груз', key: 'cargo' },-->
<!--      { title: 'Планируемая оплата', key: 'planned' },-->
<!--      { title: 'Фактическая оплата', key: 'actual' },-->
<!--      { title: 'Комментарии', key: 'comment' },-->
<!--    ],-->
<!--    cargoListMock: [-->
<!--      { client: 'Клиент1', }-->
<!--    ],-->
<!--    formData: {},-->
<!--    dialog: false,-->
<!--    confirmDialog: null,-->
<!--    creditProductType: [],-->
<!--    partners: [],-->
<!--  }),-->
<!--  computed: {-->
<!--    ...mapState(useStore, ['checkAccess']),-->
<!--  },-->
<!--  methods: {-->
<!--    ...mapActions(useStore,['addSuccessMessages', 'addErrorMessages']),-->

<!--    editedItem(item) {-->
<!--      this.formData = item;-->
<!--      this.dialog = true;-->
<!--    },-->

<!--    deleteItem(item) {-->
<!--      this.$http-->
<!--        .delete(`/payment/${item.id}`)-->
<!--        .then(r => {-->
<!--          if (r.status === 204) {-->
<!--            this.addSuccessMessages('Успешно удалено');-->
<!--            this.initialize();-->
<!--          } else {-->
<!--            this.addErrorMessages('Ошибка при удалении');-->
<!--          }-->
<!--          this.$refs.deleteDialog.close();-->
<!--        });-->
<!--    },-->
<!--    cancel() {-->
<!--      this.dialog = false;-->
<!--      this.formData = {};-->
<!--      this.getAll();-->
<!--    },-->
<!--    save() {-->
<!--      const method = this.formData.id ? 'put' : 'post';-->
<!--      const url = '/payment';-->
<!--      const paymentModel = {-->
<!--        id: this.formData.id,-->
<!--        status: this.formData.status,-->
<!--        cargo: this.formData.cargo,-->
<!--        planned: this.formData.planned,-->
<!--        actual: this.formData.actual,-->
<!--        comment: this.formData.comment,-->
<!--      };-->
<!--      this.$http[method](url, paymentModel)-->
<!--        .then(r => {-->
<!--          if (r.data == null) {-->
<!--            this.addErrorMessages(this.formData.id ? 'Ошибка при обновлении' : 'Ошибка при добавлении');-->
<!--          } else {-->
<!--            this.addSuccessMessages(this.formData.id ? 'Успешно обновлено' : 'Успешно добавлено');-->
<!--          }-->
<!--          this.dialog = false;-->
<!--          this.formData = {-->
<!--            id: null,-->
<!--            status: '',-->
<!--            cargo: null,-->
<!--            planned: '',-->
<!--            actual: '',-->
<!--            comment: '',-->
<!--          };-->
<!--          this.initialize();-->
<!--        });-->
<!--    },-->

<!--  },-->

<!--};-->
<!--</script>-->
