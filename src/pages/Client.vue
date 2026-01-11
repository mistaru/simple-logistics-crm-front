<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useClientStore } from '@/stores/client';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import ModalDialog from '@/components/ClientModal.vue';
import Rules from '@/utils/rules';

const clientStore = useClientStore();
const appStore = useAppStore();
const router = useRouter();

const { clients } = storeToRefs(clientStore);
const loading = ref(false);
const isEditing = ref(false);
const clientDialog = ref(false);

interface ClientForm {
  id?: number;
  fullName: string;
  clientCode: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  additionalInfo: string;
}

const newClient = ref<ClientForm>({
  fullName: '',
  clientCode: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  additionalInfo: '',
});

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'ФИО', key: 'fullName' },
  { title: 'Код клиента', key: 'clientCode' },
  { title: 'Телефон', key: 'phoneNumber' },
  { title: 'Whatsapp', key: 'whatsappNumber' },
  { title: 'Email', key: 'email' },
  { title: 'Доп. информация', key: 'additionalInfo' },
  { title: 'Баланс', key: 'totalBalanceDue' },
  { title: 'Профиль', key: 'profile', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false },
];

const getClients = async(): Promise<void> => {
  loading.value = true;
  try {
    await clientStore.fetchClients();
  } catch (error) {
    console.error('Ошибка загрузки клиентов:', error);
  } finally {
    loading.value = false;
  }
};

const viewClientProfile = (id: number): void => {
  router.push({ name: 'CarrierProfile', params: { id } });
};

const saveClient = async(): Promise<void> => {
  try {
    if (isEditing.value) {
      await clientStore.updateClient(newClient.value);
    } else {
      await clientStore.createClient(newClient.value);
    }

    closeClientModal();
    await getClients();
  } catch (error) {
    console.error('Ошибка сохранения клиента:', error);
  }
};

const deleteClient = async(id: number): Promise<void> => {
  try {
    await clientStore.deleteClient(id);
    await getClients();
  } catch (error) {
    console.error('Ошибка удаления клиента:', error);
  }
};

const editClient = (id: number): void => {
  const client = clients.value.find(c => c.id === id);
  if (client) {
    newClient.value = { ...client };
    isEditing.value = true;
    clientDialog.value = true;
  }
};

const closeClientModal = (): void => {
  newClient.value = {
    fullName: '',
    clientCode: '',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    additionalInfo: '',
  };
  clientDialog.value = false;
  isEditing.value = false;
};

const openCreateClientModal = (): void => {
  newClient.value = {
    fullName: '',
    clientCode: '',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    additionalInfo: '',
  };
  isEditing.value = false;
  clientDialog.value = true;
};

const canUpdate = computed(() => appStore.checkAccess('client', 'update'));
const canDelete = computed(() => appStore.checkAccess('client', 'delete'));
const canCreate = computed(() => appStore.checkAccess('client', 'create'));

onMounted(getClients);
</script>

<template>
  <v-container>
    <ModalDialog
      v-model:dialog="clientDialog"
      :title="isEditing ? 'Редактировать клиента' : 'Добавить клиента'"
      :confirm-text="isEditing ? 'Сохранить' : 'Создать'"
      @confirm="saveClient"
      @close="closeClientModal"
    >
      <form>
        <v-text-field v-model="newClient.fullName" :rules="Rules.required" label="ФИО" />
        <v-text-field v-model="newClient.clientCode" :rules="Rules.required" label="Код клиента" />
        <v-text-field v-model="newClient.phoneNumber" :rules="Rules.required" label="Телефон" />
        <v-text-field v-model="newClient.whatsappNumber" label="Whatsapp" />
        <v-text-field v-model="newClient.email" label="Email" />
        <v-text-field v-model="newClient.additionalInfo" label="Доп. информация" />
      </form>
    </ModalDialog>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Список клиентов
        <v-btn v-if="canCreate" color="primary" @click="openCreateClientModal">
          Добавить клиента
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="clients" :loading="loading" item-value="id">

        <template #item.profile="{ item }">
          <v-btn color="info" size="small" class="mr-2" @click="viewClientProfile(item.id)">
            Профиль
          </v-btn>
        </template>

        <template #item.actions="{ item }">
          <v-btn v-if="canUpdate" color="blue" size="small" class="ma-2" @click="editClient(item.id)">
            Редактировать
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
