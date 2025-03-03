<template>
  <v-container fluid>
    <h3>Здесь будет CRUD для складов!</h3>
    <data-table
      :headers="headers"
      :items="data"
      :loading="loading"
    >
      <template #top-button>
        <v-btn
          v-show="!isHidden"
          class="mx-2"
          color="primary"
          variant="elevated"
          @click="dialog = true"
        >
          Добавить
        </v-btn>
      </template>
      <template #item.actions="{ item }">
        <div class="text-left d-flex ga-2">
          <hint msg="Редактировать">
            <v-btn
              v-show="!isHidden"
              class="mx-2"
              color="primary"
              variant="text"
              size="x-small"
              icon="edit"
              @click="editedItem(item)"
            />
          </hint>
          <hint msg="Удалить">
            <v-btn
              v-show="!isHidden"
              class="mx-2"
              color="primary"
              variant="text"
              size="x-small"
              icon="delete"
              @click="deleteDialogIsOpen = true"
            />
          </hint>
          <confirm-dialog
            ref="deleteDialog"
            v-model="deleteDialogIsOpen"
            @handle-ok="deleteItem(item)"
          />
        </div>
      </template>
    </data-table>

    <v-dialog
      v-model="dialog"
      persistent
      :max-width="600"
      scrollable
    >
      <template #activator="{props}">
        <slot
          name="activator"
          v-bind="props"
        />
      </template>
      <v-card>
        <v-card-title>
          <v-spacer />
          <span class="headline">{{ formData.id ? 'Редактировать' : 'Добавить' }}</span>
          <v-spacer />
        </v-card-title>

        <v-card-text class="py-4">
          <v-form v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Название"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="formData.isLocal"
                  label="Местная"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.city"
                  :items="cities"
                  item-text="name"
                  item-value="id"
                  label="Город"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.address"
                  label="Адрес"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.phoneNumber"
                  label="Телефон клиента"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.volumeM3"
                  label="Объем (м3)"
                  type="number"
                  :rules="[rules.required]"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="!valid"
            color="primary"
            variant="elevated"
            @click="save"
          >
            Сохранить
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            @click="cancel"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <confirm-dialog>
      <confirm-dialog
        ref="dialog"
        v-model="confirmDialog"
      />
    </confirm-dialog>
  </v-container>
</template>

<script>
import Rules from '@/api/rules';
import { mapActions, mapState } from 'pinia';
import { useStore } from '@/store/store.js';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Hint from '@/components/Hint.vue';

export default {
  name: 'Warehouse',
  components: { Hint, ConfirmDialog },
  data: () => ({
    deleteDialogIsOpen: false,
    rules: Rules,
    loading: false,
    valid: false,
    data: [],
    headers: [
      { title: 'ID', key: 'id' },
      { title: 'Название', key: 'name' },
      { title: 'Местная', key: 'isLocal' },
      { title: 'Город', key: 'city' },
      { title: 'Адрес', key: 'address' },
      { title: 'Номер телефона', key: 'phoneNumber' },
      { title: 'Объем (м3)', key: 'volumeM3' },
    ],
    cities: [],
    formData: {},
    dialog: false,
    confirmDialog: null,
    creditProductType: [],
    partners: [],
  }),
  computed: {
    ...mapState(useStore, ['checkAccess']),
  },
  created() {
    this.initialize();
    this.fetchCities();
    // this.getAll();
  },
  methods: {
    ...mapActions(useStore,['addSuccessMessages', 'addErrorMessages']),

    editedItem(item) {
      this.formData = item;
      this.dialog = true;
    },

    deleteItem(item) {
      this.$http
        .delete(`/warehouse/${item.id}`)
        .then(r => {
          if (r.status === 204) {
            this.addSuccessMessages('Успешно удалено');
            this.initialize();
          } else {
            this.addErrorMessages('Ошибка при удалении');
          }
          this.$refs.deleteDialog.close();
        });
    },
    cancel() {
      this.dialog = false;
      this.formData = {};
      this.getAll();
    },
    save() {
      const method = this.formData.id ? 'put' : 'post';
      const url = '/warehouse';
      const model = {
        id: this.formData.id,
        name: this.formData.fullName,
        isLocal: this.formData.isLocal,
        city: this.formData.city,
        address: this.formData.address,
        phoneNumber: this.formData.phoneNumber,
        volumeM3: this.formData.volumeM3,
      };
      this.$http[method](url, model)
        .then(r => {
          if (r.data == null) {
            this.addErrorMessages(this.formData.id ? 'Ошибка при обновлении' : 'Ошибка при добавлении');
          } else {
            this.addSuccessMessages(this.formData.id ? 'Успешно обновлено' : 'Успешно добавлено');
          }
          this.dialog = false;
          this.formData = {
            id: null,
            name: '',
            isLocal: false,
            city: '',
            address: '',
            phoneNumber: '',
            volumeM3: '',
          };
          this.initialize();
        }).catch(error => {
          console.error('Ошибка при сохранении:', error);
          this.addErrorMessages('Ошибка при сохранении данных');
        });
    },

    initialize() {
      this.loading = true;
      this.$http
        .get('/warehouse')
        .then(response => {
          this.data = response.data.content;
        },
        e => this.setGlobalErrorMessage(e))
        .finally(() => {
          this.loading = false;
        });
    },

    fetchCities() {
      this.$http.get('/city/all')
        .then(response => {
          this.cities = response.data;
        })
        .catch(error => {
          console.error('Ошибка при загрузке городов:', error);
        });
    },
  },

};
</script>

<style scoped>

</style>
