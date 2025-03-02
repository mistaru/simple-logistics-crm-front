<template>
  <v-container fluid>
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
                  v-model="formData.registrationCountry"
                  label="Страна регистрации"
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
              <v-col cols="12">
                <v-text-field
                  v-model="formData.departureWarehouse"
                  label="Склад отправки"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.deliveryWarehouse"
                  label="Склад доставки"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.driverPhone"
                  label="Телефон водителя"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.additionalInformation"
                  label="Доп. информация"
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
  name: 'Truck',
  components: { Hint, ConfirmDialog },
  data: () => ({
    deleteDialogIsOpen: false,
    rules: Rules,
    loading: false,
    valid: false,
    isHidden: false,
    $isMobile: false,
    data: [],
    headers: [
      { title: 'ID', key: 'id' },
      { title: 'Страна регистрации', key: 'registrationCountry' },
      { title: 'Объем (м3)', key: 'volumeM3' },
      { title: 'Склад отправки', key: 'departureWarehouse' },
      { title: 'Слад доставки', key: 'deliveryWarehouse' },
      { title: 'Телефон водителя', key: 'driverPhone' },
      { title: 'Доп. информация', key: 'additionalInformation' },
      { title: 'Действие', key: 'actions', sortable: false, align: 'start' },
    ],
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
        .delete(`/truck/${item.id}`)
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
      const url = '/truck';
      const truckModel = {
        id: this.formData.id,
        registrationCountry: this.formData.registrationCountry,
        volumeM3: this.formData.volumeM3,
        departureWarehouse: this.formData.departureWarehouse,
        deliveryWarehouse: this.formData.deliveryWarehouse,
        driverPhone: this.formData.driverPhone,
        additionalInformation: this.formData.additionalInformation,
      };
      this.$http[method](url, truckModel)
        .then(r => {
          if (r.data == null) {
            this.addErrorMessages(this.formData.id ? 'Ошибка при обновлении' : 'Ошибка при добавлении');
          } else {
            this.addSuccessMessages(this.formData.id ? 'Успешно обновлено' : 'Успешно добавлено');
          }
          this.dialog = false;
          this.formData = {
            id: null,
            registrationCountry: '',
            volumeM3: null,
            departureWarehouse: '',
            deliveryWarehouse: '',
            driverPhone: '',
            additionalInformation: '',
          };
          this.initialize();
        });
    },

    initialize() {
      this.loading = true;
      this.$http
        .get('/truck')
        .then(response => {
          this.data = response.data;
        },
        e => this.setGlobalErrorMessage(e))
        .finally(() => {
          this.loading = false;
        });
    },
  },

};
</script>
