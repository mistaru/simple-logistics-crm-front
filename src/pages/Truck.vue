<template>
  <v-container fluid>
    <h3>Здесь будет CRUD для фур!</h3>
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
            @handleOk="deleteItem(item)"
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
    data: [],
    headers: [
      { title: 'ID', key: 'id' },
      { title: 'Страна регистрации', key: 'registrationCountry' },
      { title: 'Объем (м3)', key: 'volumeM3' },
      { title: 'Склад отправки', key: 'departureWarehouse' },
      { title: 'Слад доставки', key: 'deliveryWarehouse' },
      { title: 'Телефон водителя', key: 'driverPhone' },
      { title: 'Доп. информация', key: 'additionalInformation' },
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

    // deleteItem(item) {
    //   this.$http.delete(`/partner/configuration/delete?id=${item.id}`)
    //     .then(r => {
    //       if (r.data.result == null) {
    //         this.addErrorMessages(r.data.details);
    //       } else {
    //         this.addSuccessMessages('Успешно удалено');
    //         this.getAll();
    //       }
    //       this.$refs.deleteDialog.close();
    //     });
    // },
    cancel() {
      this.dialog = false;
      this.formData = {};
      this.getAll();
    },
    save() {
      const model = {
        id: this.formData.id,
        truckModel: this.formData?.truckModel,
      };
      this.$http.post('/truck', model)
        .then(r => {
          if (r.data.result == null) {
            this.addErrorMessages(r.data.details);
          } else {
            this.addSuccessMessages(this.formData.id ? 'Успешно обновлено' : 'Успешно добавлено');
          }
          this.dialog = false;
          this.formData = {};
          this.getAll();
        });
    },

    initialize() {
      this.$http.get('/truck')
        .then(response => {
          this.data = response.data;
        },
        e => this.setGlobalErrorMessage(e))
        .finally(() => {
          this.loading = false;
        });

    //   this.$http.get('/dict/creditProductType')
    //     .then(response => {
    //         this.creditProductType = response.data;
    //       },
    //       e => this.setGlobalErrorMessage(e))
    //     .finally(() => {
    //       this.loading = false;
    //     });
    //
    //   this.$http.get('/partner')
    //     .then(response => {
    //         this.partners = response.data.result;
    //       },
    //       e => this.setGlobalErrorMessage(e))
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },
    // getAll() {
    //   this.loading = true;
    //   this.$http.get('/partner/configuration')
    //     .then(r => {
    //         if (r.data.result == null) {
    //           this.addErrorMessages(r.data.details);
    //         } else {
    //           this.data = r.data.result;
    //         }},
    //       e => this.setGlobalErrorMessage(e))
    //     .finally(() => {
    //       this.loading = false;
    //     });
    },
  },

};
</script>
