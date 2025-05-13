<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCityStore } from '@/stores/city';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import ModalDialog from '@/components/CityModal.vue';
import Rules from '@/utils/rules';

const cityStore = useCityStore();
const editedCity = ref({ id: null, name: '', description: '', country: '' });

const appStore = useAppStore();
const { cities, countries } = storeToRefs(cityStore);

const cityDialog = ref(false);
const loading = ref(false);
const isEditing = ref(false);

interface CityForm {
  id?: number;
  name: string;
  description: string;
  country: string;
}
const newCity = ref<CityForm>({
  name: '',
  description: '',
  country: '',
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Описание', key: 'description' },
  { title: 'Страна', key: 'country.name' },
  { title: 'Действия', key: 'actions' }
];

const getCities = async(): Promise<void> => {
  loading.value = true;
  try {
    await cityStore.fetchCities();
    await cityStore.fetchCountries();
  } catch (error) {
    console.error('Ошибка загрузки городов:', error);
  } finally {
    loading.value = false;
  }
};

const deleteCity = async(id: number): Promise<void> => {
  try {
    await cityStore.deleteCity(id);
    await getCities();
  } catch (error) {
    console.error('Ошибка удаления города:', error);
  }
};

const saveCity = async(): Promise<void> => {
  try {
    if (typeof newCity.value.country !== 'object') {
      newCity.value.country = { id: newCity.value.country };
    }

    if (isEditing.value) {
      await cityStore.updateCity(newCity.value);
    } else {
      await cityStore.createCity(newCity.value);
    }

    closeCityModal();
    await getCities();
  } catch (error) {
    console.error('Ошибка сохранения города:', error);
  }
};

const editCity = (id: number): void => {
  const city = cities.value.find(c => c.id === id);
  if (city) {
    newCity.value = { id: city.id, name: city.name, description: city.description, country: city.country };
    isEditing.value = true;
    cityDialog.value = true;
  }
};

const closeCityModal = (): void => {
  newCity.value = { name: '', description: '', country: '' };
  cityDialog.value = false;
  isEditing.value = false;
};

const openCreateCityModal = async(): Promise<void> => {
  newCity.value = { name: '', description: '', country: '' };
  isEditing.value = false;
  cityDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('city', 'update'));
const canDelete = computed(() => appStore.checkAccess('city', 'delete'));
const canCreate = computed(() => appStore.checkAccess('city', 'create'));

onMounted(getCities);
</script>

<template>
  <v-container>
    <ModalDialog
      v-model:dialog="cityDialog"
      :title="isEditing ? 'Редактировать город' : 'Создать город'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveCity"
      @close="closeCityModal"
    >
      <form>
        <v-text-field v-model="newCity.name" :rules="Rules.required" label="Название" />
        <v-text-field v-model="newCity.description" :rules="Rules.required" label="Описание" />
        <v-select
          v-model="newCity.country"
          :items="countries"
          item-title="name"
          item-value="id"
          label="Страна"
        />

      </form>
    </ModalDialog>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список городов
        <v-btn v-if="canCreate" color="primary" @click="openCreateCityModal">
          Создать город
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="cities" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <v-btn v-if="canDelete" color="red" size="small" @click="deleteCity(item.id)">
            Удалить
          </v-btn>
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editCity(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
