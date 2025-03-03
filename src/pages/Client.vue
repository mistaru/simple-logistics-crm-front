<template>
  <v-container fluid>
    <h3>Здесь будет CRUD для клиентов!</h3>
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
                  v-model="formData.fullName"
                  label="ФИО клиента"
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
                  v-model="formData.whatsappNumber"
                  label="Whatsapp клиента"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.email"
                  label="Email клиента"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.additionalInfo"
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
  name: 'Client',
  components: { Hint, ConfirmDialog },
  data: () => ({
    deleteDialogIsOpen: false,
    rules: Rules,
    loading: false,
    valid: false,
    data: [],
    headers: [
      { title: 'ID', key: 'id' },
      { title: 'ФИО', key: 'fullName' },
      { title: 'Телефон', key: 'phoneNumber' },
      { title: 'Whatsapp', key: 'whatsappNumber' },
      { title: 'Email', key: 'email' },
      { title: 'Доп. информация', key: 'additionalInfo' },
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
        .delete(`/client/${item.id}`)
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
      const url = '/client';
      const model = {
        id: this.formData.id,
        fullName: this.formData.fullName,
        phoneNumber: this.formData.phoneNumber,
        whatsappNumber: this.formData.whatsappNumber,
        email: this.formData.email,
        additionalInfo: this.formData.additionalInfo,
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
            fullName: '',
            phoneNumber: null,
            whatsappNumber: '',
            email: '',
            additionalInfo: '',
          };
          this.initialize();
        });
    },

    initialize() {
      this.loading = true;
      this.$http
        .get('/client')
        .then(response => {
          this.data = response.data.content;
        },
        e => this.setGlobalErrorMessage(e))
        .finally(() => {
          this.loading = false;
        });
    },
  },

};
</script>

<style scoped>

</style>
