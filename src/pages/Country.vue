<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCountryStore } from '@/stores/country';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import ModalDialog from '@/components/CountryModal.vue';
import Rules from '@/utils/rules';

const countryStore = useCountryStore();
const editedCountry = ref({ id: null, name: '', code: '' });

const appStore = useAppStore();
const { countries } = storeToRefs(countryStore);

const countryDialog = ref(false);
const loading = ref(false);
const isEditing = ref(false);

interface CountryForm {
  id?: number;
  name: string;
  description: string;
}
const newCountry = ref<CountryForm>({
  name: '',
  description: '',
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Код', key: 'description' },
  { title: 'Действия', key: 'actions' },
];

const getCountries = async(): Promise<void> => {
  loading.value = true;
  try {
    await countryStore.fetchCountries();
  } catch (error) {
    console.error('Ошибка загрузки стран:', error);
  } finally {
    loading.value = false;
  }
};

const deleteCountry = async(id: number): Promise<void> => {
  try {
    await countryStore.deleteCountry(id);
    await getCountries();
  } catch (error) {
    console.error('Ошибка удаления страны:', error);
  }
};

const saveCountry = async(): Promise<void> => {
  try {
    if (isEditing.value) {
      await countryStore.updateCountry({
        id: newCountry.value.id,
        name: newCountry.value.name,
        description: newCountry.value.description,
      });
    } else {
      await countryStore.createCountry({
        name: newCountry.value.name,
        description: newCountry.value.description,
      });
    }
    closeCountryModal();
    await getCountries();
  } catch (error) {
    console.error('Ошибка сохранения страны:', error);
  }
};

const editCountry = (id: number): void => {
  const country = countries.value.find(c => c.id === id);
  if (country) {
    newCountry.value = { id: country.id, name: country.name, description: country.description };
    isEditing.value = true;
    countryDialog.value = true;
  }
};

const closeCountryModal = (): void => {
  newCountry.value = { name: '', description: '' };
  countryDialog.value = false;
  isEditing.value = false;
};

const openCreateCountryModal = (): void => {
  newCountry.value = { name: '', description: '' };
  isEditing.value = false;
  countryDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('country', 'update'));
const canDelete = computed(() => appStore.checkAccess('country', 'delete'));
const canCreate = computed(() => appStore.checkAccess('country', 'create'));

onMounted(getCountries);
</script>

<template>
  <v-container>
    <ModalDialog
      v-model:dialog="countryDialog"
      :title="isEditing ? 'Редактировать страну' : 'Создать страну'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveCountry"
      @close="closeCountryModal"
    >
      <form>
        <v-text-field v-model="newCountry.name" :rules="Rules.required" label="Название" />
        <v-text-field v-model="newCountry.description" :rules="Rules.required" label="Код" />
      </form>
    </ModalDialog>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список стран
        <v-btn v-if="canCreate" color="primary" @click="openCreateCountryModal">
          Создать страну
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="countries" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <v-btn v-if="canDelete" color="red" size="small" @click="deleteCountry(item.id)">
            Удалить
          </v-btn>
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editCountry(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
