<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/app';
import { usePriceStore } from '@/stores/price';
import { storeToRefs } from 'pinia';
import ModalDialog from '@/components/PriceModal.vue';
import Rules from '@/utils/rules';

const priceStore = usePriceStore();
const appStore = useAppStore();
const { prices, cargoes } = storeToRefs(priceStore);

const priceDialog = ref(false);
const loading = ref(false);
const isEditing = ref(false);

interface PriceForm {
  id?: number;
  cargo: number;
  amount: number;
}

const newPrice = ref<PriceForm>({
  cargo: 0,
  amount: 0,
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Груз (Cargo ID)', key: 'cargo.id' },
  { title: 'Цена', key: 'amount' },
  { title: 'Действия', key: 'actions' },
];

const getPrices = async(): Promise<void> => {
  loading.value = true;
  try {
    await priceStore.fetchPrices();
    await priceStore.fetchCargoes();
  } catch (error) {
    console.error('Ошибка загрузки цен:', error);
  } finally {
    loading.value = false;
  }
};

const savePrice = async(): Promise<void> => {
  try {
    if (typeof newPrice.value.cargo !== 'object') {
      newPrice.value.cargo = { id: newPrice.value.cargo };
    }

    if (isEditing.value) {
      await priceStore.updatePrice({ ...newPrice.value });
    } else {
      await priceStore.createPrice({ ...newPrice.value });
    }
    closePriceModal();
    await getPrices();
  } catch (error) {
    console.error('Ошибка сохранения цены:', error);
  }
};

const editPrice = (id: number) : void => {
  const price = prices.value.find(p => p.id === id);
  if (price) {
    newPrice.value = { ...price };
    isEditing.value = true;
    priceDialog.value = true;
  }
};

const closePriceModal = (): void => {
  newPrice.value = { cargo: 0, amount: 0 };
  priceDialog.value = false;
  isEditing.value = false;
};

const openCreatePriceModal = async(): Promise<void> => {
  newPrice.value = { cargo: 0, amount: 0 };
  isEditing.value = false;
  priceDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('price', 'update'));
const canCreate = computed(() => appStore.checkAccess('price', 'create'));

onMounted(getPrices);
</script>

<template>
  <v-container>
    <ModalDialog
      v-model:dialog="priceDialog"
      :title="isEditing ? 'Редактировать цену' : 'Создать цену'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="savePrice"
      @close="closePriceModal"
    >
      <form>
        <v-select
          v-model="newPrice.cargo"
          :items="cargoes"
          item-title="id"
          item-value="id"
          label="Номер груза"
        />
        <v-text-field v-model="newPrice.amount" :rules="Rules.required" label="Цена" type="number" />
      </form>
    </ModalDialog>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список цен
        <v-btn v-if="canCreate" color="primary" @click="openCreatePriceModal">Создать цену</v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="prices" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editPrice(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
