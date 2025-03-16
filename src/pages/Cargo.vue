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
                  v-model="formData.weight"
                  label="Вес (кг)"
                  type="number"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.volume"
                  label="Объем (м³)"
                  type="number"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.quantity"
                  label="Количество"
                  type="number"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.warehouseArrivalDate"
                  label="Дата прибытия на склад"
                  type="datetime-local"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.shipmentDate"
                  label="Дата отправки"
                  type="datetime-local"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.status"
                  :items="statuses"
                  item-title="description"
                  item-value="value"
                  label="Статус груза"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.description"
                  label="Описание"
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
  </v-container>
</template>

<script>
import Rules from '@/api/rules';
import { mapActions, mapState } from 'pinia';
import { useStore } from '@/store/store.js';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Hint from '@/components/Hint.vue';

export default {
  name: 'Cargo',
  components: { Hint, ConfirmDialog },
  data: () => ({
    deleteDialogIsOpen: false,
    rules: Rules,
    loading: false,
    valid: false,
    isHidden: false,
    data: [],
    statuses: [],
    headers: [
      { title: 'ID', key: 'id' },
      { title: 'Вес (кг)', key: 'weight' },
      { title: 'Объем (м³)', key: 'volume' },
      { title: 'Количество', key: 'quantity' },
      { title: 'Дата прибытия', key: 'warehouseArrivalDate' },
      { title: 'Дата отправки', key: 'shipmentDate' },
      { title: 'Статус', key: 'status' },
      { title: 'Описание', key: 'description' },
      { title: 'Действие', key: 'actions', sortable: false, align: 'start' },
    ],
    formData: {},
    dialog: false,
  }),
  computed: {
    ...mapState(useStore, ['checkAccess']),
  },
  created() {
    this.initialize();
    this.loadStatuses();
  },
  methods: {
    ...mapActions(useStore, ['addSuccessMessages', 'addErrorMessages']),

    loadStatuses() {
      this.$http.get('/enums/cargoStatuses').then(response => {
        this.statuses = response.data.map(status => ({
          value: status.value,
          description: status.description
        }));
      }).catch(() => {
        this.addErrorMessages('Ошибка загрузки статусов');
      });
    },

    editedItem(item) {
      this.formData = { ...item };
      this.dialog = true;
    },

    deleteItem(item) {
      this.$http.delete(`/cargo/${item.id}`).then(() => {
        this.addSuccessMessages('Успешно удалено');
        this.initialize();
      }).catch(() => this.addErrorMessages('Ошибка при удалении'));
    },

    cancel() {
      this.dialog = false;
      this.formData = {};
      this.initialize();
    },

    formatDateTime(value) {
      if (!value) return null;
      return new Date(value).toISOString(); // Форматирует дату в ISO 8601
    },
    save() {
      const payload = {
        ...this.formData,
        warehouseArrivalDate: this.formatDateTime(this.formData.warehouseArrivalDate),
        shipmentDate: this.formatDateTime(this.formData.shipmentDate),
      };

      const method = this.formData.id ? 'put' : 'post';
      this.$http[method]('/cargo', payload)
        .then(() => {
          this.addSuccessMessages(this.formData.id ? 'Успешно обновлено' : 'Успешно добавлено');
          this.dialog = false;
          this.initialize();
        })
        .catch(() => this.addErrorMessages('Ошибка при сохранении'));
    },

    initialize() {
      this.loading = true;
      this.$http.get('/cargo').then(response => {
        this.data = response.data;
      }).finally(() => {
        this.loading = false;
      });
    },
  },
};
</script>
