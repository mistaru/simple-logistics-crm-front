<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCarrierStore } from '@/stores/carrier';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import CarrierModal from '@/components/CarrierModal.vue';

const carrierStore = useCarrierStore();
const appStore = useAppStore();
const router = useRouter();
const { carriers } = storeToRefs(carrierStore);

const carrierDialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const saveCarrierRef = ref();

interface CarrierForm {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  balance: number;
}

const newCarrier = ref<CarrierForm>({
  name: '',
  email: '',
  phoneNumber: '',
  balance: 0,
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Телефон', key: 'phoneNumber' },
  { title: 'Баланс', key: 'balance' },
  { title: 'Профиль', key: 'profile', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false },
];

const getCarriers = async(): Promise<void> => {
  loading.value = true;
  try {
    await carrierStore.fetchCarriers();
  } catch (error) {
    console.error('Ошибка загрузки перевозчиков:', error);
  } finally {
    loading.value = false;
  }
};

const deleteCarrier = async(id: number) => {
  try {
    await carrierStore.deleteCarrier(id);
    await getCarriers();
  } catch (error) {
    console.error('Ошибка удаления перевозчика:', error);
  }
};

const saveCarrier = async(): Promise<void> => {
  try {
>    const isValid = await saveCarrierRef.value?.validate();
    if (isValid?.valid) {
      const payload = {
        ...newCarrier.value,
      };
      if (isEditing.value) {
        await carrierStore.updateCarrier(payload);
      } else {
        await carrierStore.createCarrier(payload);
      }
      closeCarrierModal();
      await getCarriers();
    }
  } catch (error) {
    console.error('Ошибка сохранения перевозчика:', error);
  }
};

const editCarrier = (id: number): void => {
  const carrier = carriers.value.find(t => t.id === id);
  if (carrier) {
    newCarrier.value = { ...carrier };
    isEditing.value = true;
    carrierDialog.value = true;
  }
};

const viewCarrier = (id: number): void => {
  router.push({ name: 'CarrierProfile', params: { id } });
};

const closeCarrierModal = (): void => {
  newCarrier.value = {
    name: '',
    email: '',
    phoneNumber: '',
    balance: 0,
  };
  carrierDialog.value = false;
  isEditing.value = false;
};

const openCreateCarrierModal = (): void => {
  newCarrier.value = {
    name: '',
    email: '',
    phoneNumber: '',
    balance: 0,
  };
  isEditing.value = false;
  carrierDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('carrier', 'update'));
const canDelete = computed(() => appStore.checkAccess('carrier', 'delete'));
const canCreate = computed(() => appStore.checkAccess('carrier', 'create'));

onMounted(getCarriers);
</script>

<template>
  <v-container>

    <!-- Таблица с перевозчиками -->
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список перевозчиков
        <v-btn v-if="canCreate" color="primary" @click="openCreateCarrierModal">
          Добавить перевозчика
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="carriers" :loading="loading" item-value="id">
        <template #item.profile="{ item }">
          <v-btn color="info" size="small" class="mr-2" @click="viewCarrier(item.id)">
            Профиль
          </v-btn>
        </template>
        <template #item.actions="{ item }">
          <v-btn v-if="canDelete" color="red" size="small" @click="deleteCarrier(item.id)">
            Удалить
          </v-btn>
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editCarrier(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Модальное окно для создания/редактирования -->
    <CarrierModal
      v-model:dialog="carrierDialog"
      :title="isEditing ? 'Редактировать перевозчика' : 'Добавить перевозчика'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveCarrier"
      @close="closeCarrierModal"
    >
      <v-form ref="saveCarrierRef">
        <v-text-field v-model="newCarrier.name" label="Название" :rules="[v => !!v || 'Обязательное поле']" required/>
        <v-text-field v-model="newCarrier.email" label="Email" :rules="[v => !!v || 'Обязательное поле']" required/>
        <v-text-field v-model="newCarrier.phoneNumber" label="Телефон" :rules="[v => !!v || 'Обязательное поле']" required/>
        <!--<v-text-field v-model="newCarrier.balance" label="Баланс" type="number" readonly/>-->
      </v-form>
    </CarrierModal>

  </v-container>
</template>
